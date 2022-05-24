import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { UsersRepository } from '../databases/repository/user.repository';


@Module({
  imports: [ TypeOrmModule.forFeature([UsersRepository]), UserModule],
  controllers: [ AuthController],
  providers: [AuthService]
})
export class AuthModule {}
