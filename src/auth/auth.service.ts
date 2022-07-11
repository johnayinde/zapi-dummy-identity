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
  ) {}

  async signup(user: CreateUserDto) {
    const userdata = Object.assign(new User(), user);
    const newUser = await this.usersRepo.save(userdata).catch((e) => {
      throw new BadRequestException(
        ZuAppResponse.BadRequest(
          'Duplicate Values',
          'The Email already exists',
        ),
      );
    });
    // TODO: send POST request to the profile service to create the profile
    // Axios
    const new_Profile = this.httpService.post(
      `${this.configService.get<string>(
        configConstant.profileUrl.baseUrl,
      )}/profile/create`,
      {
        user_id: newUser.id,
        email: newUser.email,
      },
    );

    const newProfile = await lastValueFrom(new_Profile.pipe());
    const profileData = newProfile.data;
    newUser.profileID = profileData.id;

    const new_User = await this.usersRepo.save(newUser);

    return new_User;
  }

  async signin(
    dto: SignInDto,
    values: { userAgent: string; ipAddress: string },
  ) {
    const user = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (!user)
      throw ZuAppResponse.BadRequest('Not found', 'Invalid Credentials!');

    const hash = await this.jwtHelperService.hashPassword(
      dto.password,
      user.password.split(':')[0],
    );
    let isPasswordCorrect = hash == user.password;
    if (!isPasswordCorrect)
      throw ZuAppResponse.BadRequest('Access Denied!', 'Incorrect Credentials');
    const tokens = await this.getNewRefreshAndAccessTokens(values, user);
    return ZuAppResponse.Ok<object>(
      {
        ...tokens,
        userId: user.id,
        profileId: user.profileID,
        email: user.email,
        fullName: user.fullName,
      },
      'Successfully logged in',
      201,
    );
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

  async forgotPassword(email: string) {
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
    const payload = {
      id: user.id,
      email: user.email,
    };
    const currentPassword = user.password;
    const resetToken = await this.jwtHelperService.forgotPassword(
      payload,
      currentPassword,
    );
    const resetLink = `http://localhost:3000/api-hub/auth/reset/${user.id}/${resetToken}`;
    // await this.mailService.sendResetLink(user, resetLink) -> this is to send the reset link to the user's email instead
    return resetLink;
  }

  async resetPassword(id: string, token: string, body: PasswordResetDto) {
    const user: User = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(
        ZuAppResponse.NotFoundRequest('User does not exist on the server'),
      );
    }
    await this.jwtHelperService.verifyResetToken(token, user.password);
    let salt = randomBytes(32).toString('hex');
    let hash = pbkdf2Sync(body.password, salt, 1000, 64, 'sha512').toString(
      'hex',
    );
    let hashedPassword = `${salt}:${hash}`;
    await this.usersRepo.update(id, { password: hashedPassword });
    return user;
  }
}
