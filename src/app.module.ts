import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configConstant } from './common/constants/config.constant';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AppDataSource } from 'ormconfig';



@Module({
  imports: [
    AuthModule,
    UserModule,
    ConfigModule.forRoot({ 
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(AppDataSource.options),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
