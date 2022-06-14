import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../database/repository/user.repository';
import { User } from '../entities/user.entity';
import { ZuAppResponse } from '../common/helpers/response';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { SignInDto } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtHelperService } from './jwtHelper.service';
import { ConfigService } from '@nestjs/config';
import { PasswordResetDto } from '../user/dto/password-reset.dto';
import { randomBytes, pbkdf2Sync } from "crypto";
import { MailService } from '../mail/mail.service';


@Injectable()
export class AuthService {
    constructor(private usersRepo: UsersRepository, private jwtTokenService: JwtService,
         private jwtHelperService: JwtHelperService, private readonly configService: ConfigService,
         private mailService: MailService
    ){}

    async signup(user: CreateUserDto){
        const userdata = Object.assign(new User(), user)
        const newUser = await this.usersRepo.save(userdata).catch(e => {
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

    async forgotPassword(email: string){
        const user: User = await this.usersRepo.findOne({where: email})
        if(!user){
            throw new NotFoundException(
                ZuAppResponse.NotFoundRequest('Not found','email does not exist on the server', '404')
            )
        }
        const payload = {
            id: user.id,
            email: user.email
        }
        const currentPassword = user.password
        const resetToken = await this.jwtHelperService.forgotPassword(payload, currentPassword)
        const resetLink = `http://localhost:3000/api-hub/auth/reset/${user.id}/${resetToken}`
        // await this.mailService.sendResetLink(user, resetLink) -> this is to send the reset link to the user's email instead
        return resetLink

    }

    async resetPassword(id: string, token: string, body: PasswordResetDto){
        const user: User = await this.usersRepo.findOne({id})
        if(!user){
            throw new NotFoundException(
                ZuAppResponse.NotFoundRequest('User does not exist on the server')
            )
        } 
        await this.jwtHelperService.verifyResetToken(token, user.password)
        let salt = randomBytes(32).toString('hex')
        let hash = pbkdf2Sync(body.password, salt, 1000, 64, 'sha512').toString('hex')
        let hashedPassword = `${salt}:${hash}`
        await this.usersRepo.update(id, {password: hashedPassword})
        return user
    
    }

 
}
