import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Next,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../common/constants/jwt.constant';
import { ZuAppResponse } from '../common/helpers/response';
import { randomBytes, pbkdf2Sync } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtHelperService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwTokenService: JwtService,
    private configService: ConfigService,
  ) {}

  async signAccess(payload: {
    userAgent: string;
    ipAddress: string;
    id: string;
  }) {
    return this.jwTokenService.sign(payload, {
      secret: await this.configService.get(jwtConstants.access_secret),
      expiresIn: await this.configService.get(jwtConstants.access_time),
    });
  }

  async signRefresh(payload: {
    userAgent: string;
    ipAddress: string;
    id: string;
  }) {
    let refreshToken = this.jwTokenService.sign(payload, {
      secret: await this.configService.get(jwtConstants.refresh_secret),
      expiresIn: await this.configService.get(jwtConstants.refresh_time),
    });

    let user = await this.userRepo.findOne({ where: { id: payload.id } });
    await this.userRepo.update(user.id, { refreshToken }).catch((err) => {
      throw new BadRequestException(
        ZuAppResponse.BadRequest(
          'user not found',
          'This user does not exist',
          '404',
        ),
      );
    });
    return refreshToken;
  }

  async getNewTokens(refreshToken: string) {
    try {
      let payload = this.jwTokenService.verify(refreshToken, {
        secret: await this.configService.get(jwtConstants.refresh_secret),
      });
      payload = {
        id: payload.id,
        ipAddress: payload.ipAddress,
        userAgent: payload.userAgent,
      };

      let verified = await this.userRepo.findOne({
        where: {
          refreshToken: refreshToken,
        },
      });
      if (verified) {
        return {
          access: await this.signAccess(payload),
        };
      } else throw new Error();
    } catch (error) {
      throw new BadRequestException(
        ZuAppResponse.BadRequest(
          'Invalid Refresh Token',
          'Get the correct refresh token and try again',
          '401',
        ),
      );
    }
  }

  async resetToken(payload: { id: string }) {
    const secretCombo = await this.configService.get(jwtConstants.reset_secret);
    return this.jwTokenService.sign(payload, {
      secret: secretCombo,
      expiresIn: await this.configService.get(jwtConstants.reset_time),
    });
  }

  async verifyResetToken(token: string) {
    const secretCombo = await this.configService.get(jwtConstants.reset_secret);
    try {
      return await this.jwTokenService.verify(token, {
        secret: secretCombo,
      });
    } catch (error) {
      if (error?.name === 'TokenExpiredError')
        throw new BadRequestException(
          ZuAppResponse.BadRequest(
            'Unathorized',
            'Invalide/expired reset link',
            '401',
          ),
        );
    }
  }

  async hashPassword(password: string, salt?: string) {
    if (!salt) salt = randomBytes(32).toString('hex');
    let hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    let hashedPassword = `${salt}:${hash}`;
    return hashedPassword;
  }
}
