import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from '../database/repository/user.repository';
import { User } from '../entities/user.entity';
import { ZuAppResponse } from '../common/helpers/response';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { SignInDto } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtHelperService } from './jwtHelper.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(private usersRepo: UsersRepository, private jwtTokenService: JwtService, private jwtHelperService: JwtHelperService, private readonly configService: ConfigService){}

    async signup(user: CreateUserDto){
        const userdata = Object.assign(new User(), user)
        const newUser = await this.usersRepo.save(userdata).catch(e => {
            console.log(e)
            throw new BadRequestException(
                ZuAppResponse.BadRequest("Duplicate Values", "The Email already exists")
            )
        })
        return newUser
    }

    async signin(user: SignInDto, values: {userAgent: string, ipAddress: string}){
        let foundUser = await this.usersRepo.findOne({email: user.email});
        if(foundUser){
            let hash = this.usersRepo.hashPassword(user.password,foundUser.password.split(':')[0]);
            let isPasswordCorrect = hash == foundUser.password;
            console.log('Password is correct: ', isPasswordCorrect);
            if(isPasswordCorrect){
                return [foundUser, ZuAppResponse.Ok<object>(await this.getNewRefreshAndAccessTokens(values, foundUser),'Successfully logged in')]
            }
        }
        throw new BadRequestException(
            ZuAppResponse.BadRequest('Invalid Credentials')
        )
    }

    async getNewRefreshAndAccessTokens(values: {userAgent: string, ipAddress: string}, user){
        const refreshobject = {
            userAgent: values.userAgent,
            ipAddress: values.ipAddress,
            id: user.id
        }
    
        return {
            access: await this.jwtHelperService.signAccess(refreshobject),
            refresh: await this.jwtHelperService.signRefresh(refreshobject)
        }
    }
}
