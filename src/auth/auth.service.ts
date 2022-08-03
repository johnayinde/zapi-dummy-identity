import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';
import { ZuAppResponse } from '../common/helpers/response';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { SignInDto } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { Ok } from '../common/helpers/response';
import { JwtHelperService } from './jwtHelper.service';
import { ConfigService } from '@nestjs/config';
import { PasswordResetDto } from '../user/dto/password-reset.dto';
import { randomBytes, pbkdf2Sync } from 'crypto';
import { MailService } from '../mail/mail.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { configConstant } from '../common/constants/config.constant';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailVerificationService } from '../email-verification/email-verification.service';
import { ChangePasswordDto } from 'src/user/dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private jwtTokenService: JwtService,
    private jwtHelperService: JwtHelperService,
    private readonly configService: ConfigService,
    private mailService: MailService,
    private httpService: HttpService,
    private emailVerificationService: EmailVerificationService,
  ) {}

  async signup(user: CreateUserDto) {
    const userdata = Object.assign(new User(), user);
    const newUser = await this.usersRepo.save(userdata).catch(async (e) => {
      await this.emailVerificationService.resendVerificationLink(user.email);
      throw new BadRequestException(
        ZuAppResponse.BadRequest(
          'Duplicate Values',
          'The Email already exists',
        ),
      );
    });

    //send a verification link to the user
    await this.emailVerificationService.sendVerificationLink(newUser.email);

    return newUser;
  }

  async signin(
    dto: SignInDto,
    values: { userAgent: string; ipAddress: string },
  ) {
    const user = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (!user)
      throw ZuAppResponse.BadRequest('Not found', 'Invalid Credentials!');
    if (user.isEmailVerified) {
      const hash = await this.jwtHelperService.hashPassword(
        dto.password,
        user.password.split(':')[0],
      );
      let isPasswordCorrect = hash == user.password;
      if (!isPasswordCorrect)
        throw ZuAppResponse.BadRequest(
          'Access Denied!',
          'Incorrect Credentials',
        );
      const tokens = await this.getNewRefreshAndAccessTokens(values, user);

      // add userInfo to the list of user history and return along in the response
      await this.usersRepo.update(user.id, {
        history: [...user.history, dto.userInfo],
      });

      return ZuAppResponse.Ok<object>(
        {
          ...tokens,
          userId: user.id,
          profileId: user.profileID,
          email: user.email,
          fullName: user.fullName,
          history: user.history,
        },
        'Successfully logged in',
        201,
      );
    } else {
      throw new BadRequestException(
        ZuAppResponse.BadRequest(
          'Access Denied',
          'Please verify your email before logging in',
          '401',
        ),
      );
    }
  }

  async signout(refreshToken: string) {
    let check = await this.usersRepo.findOne({
      where: { refreshToken: refreshToken },
    });
    if (!check)
      throw new BadRequestException(
        ZuAppResponse.BadRequest(
          'Invalid Refresh Token',
          'Get the correct refresh token and try again',
        ),
      );

    await this.usersRepo.update(
      { refreshToken: refreshToken },
      { refreshToken: null },
    );
    return ZuAppResponse.Ok('', 'Successfully logged out', 201);
  }

  async getNewTokens(refreshToken: string) {
    return await this.jwtHelperService.getNewTokens(refreshToken);
  }

  async getNewRefreshAndAccessTokens(
    values: { userAgent: string; ipAddress: string },
    user,
  ) {
    const refreshobject = {
      userAgent: values.userAgent,
      ipAddress: values.ipAddress,
      id: user.id,
    };

    return {
      access: await this.jwtHelperService.signAccess(refreshobject),
      refresh: await this.jwtHelperService.signRefresh(refreshobject),
    };
  }

  async forgotPassword(email: string): Promise<any> {
    const user: User = await this.usersRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(
        ZuAppResponse.NotFoundRequest(
          'Not found',
          'email does not exist on the server',
          '404',
        ),
      );
    }
    const id = user.id;
    //url paths
    const notifyUrl = this.configService.get(configConstant.baseUrl.nofication);
    const frontEndBase = this.configService.get(
      configConstant.baseUrl.identityUrlFE,
    );
    const resetPage = `${frontEndBase}/password-reset/${id}`;
    const emailUrlPath = `${notifyUrl}/email/send-mail`;

    const emailLink = {
      email: user.email,
      subject: 'Password Reset Request',
      text: `Kindly click the link below to proceed with the password reset 
            \n ${resetPage}`,
    };
    const p = this.httpService.axiosRef;

    const resetToken = await this.jwtHelperService.resetToken({ id: user.id });
    await this.usersRepo.update(id, { resetToken });

    // This sends the reset link to the registered email of the user
    const axiosRes = await p({
      method: 'post',
      url: emailUrlPath,
      data: emailLink,
    });
  }

  async resetPassword(id: string, body: PasswordResetDto): Promise<User> {
    const user: User = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(
        ZuAppResponse.NotFoundRequest('User does not exist on the server'),
      );
    }

    if (!user.resetToken) {
      throw new NotFoundException(
        ZuAppResponse.BadRequest(
          'Not authorized',
          'Request for another link and try again',
        ),
      );
    }
    await this.jwtHelperService.verifyResetToken(user.resetToken);

    let salt = randomBytes(32).toString('hex');
    let hash = pbkdf2Sync(body.password, salt, 1000, 64, 'sha512').toString(
      'hex',
    );
    let hashedPassword = `${salt}:${hash}`;
    await this.usersRepo.update(id, {
      password: hashedPassword,
      resetToken: null,
    });
    return user;
  }

  async changePassword(id: string, dto: ChangePasswordDto) {
    //get current user password hash from database
    const user = await this.usersRepo.findOne({ where: { id: id } });
    const currentPasswordHash = user.password;
    // hash old password from request body
    const oldPasswordHash = await this.jwtHelperService.hashPassword(
      dto.oldPassword,
      user.password.split(':')[0],
    );
    //compare passwords
    const isPasswordCorrect = oldPasswordHash == currentPasswordHash;
    if (!isPasswordCorrect) {
      throw new BadRequestException(
        ZuAppResponse.BadRequest(
          'Access Denied!',
          'Your passwords do not match',
          '401',
        ),
      );
    }
    //hash new password
    const hashedPassword = await this.jwtHelperService.hashPassword(
      dto.newPassword,
      user.password.split(':')[0],
    );
    //update user password
    return await this.usersRepo.update(id, { password: hashedPassword });
  }
}
