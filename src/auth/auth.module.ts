import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { UsersRepository } from '../databases/repository/user.repository';
import { JwtModule } from '@nestjs/jwt';
import { JwtHelperService } from './jwtHelper.service';


@Module({
  imports: [ TypeOrmModule.forFeature([UsersRepository]), UserModule, JwtModule.register({
    publicKey: 'PUBLIC_KEY',
    privateKey: 'PRIVATE_KEY',
  })],
  controllers: [ AuthController],
  providers: [AuthService, JwtHelperService]
})

export class AuthModule {}
