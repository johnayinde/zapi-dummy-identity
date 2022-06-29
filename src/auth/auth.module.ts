import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtHelperService } from './jwtHelper.service';
import { MailModule } from '../mail/mail.module';
import {HttpModule} from '@nestjs/axios'
import { User } from 'src/entities/user.entity';

@Module({
  imports: [ 
    TypeOrmModule.forFeature([User]), 
    UserModule,
    MailModule,
    JwtModule.register({
      publicKey: 'PUBLIC_KEY',
      privateKey: 'PRIVATE_KEY',
    }), 
    HttpModule
  ],
  controllers: [ AuthController],
  providers: [AuthService, JwtHelperService]
})

export class AuthModule {}
