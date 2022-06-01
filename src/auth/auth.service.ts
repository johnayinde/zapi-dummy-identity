import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from '../database/repository/user.repository';
import { User } from '../entities/user.entity';
import { ZuAppResponse } from '../common/helpers/response';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { JwtHelperService } from './jwtHelper.service';


@Injectable()
export class AuthService {
    constructor(
        private usersRepo: UsersRepository,
        private jwtHelperService: JwtHelperService
    ){}

    async signup(user: CreateUserDto, values: {userAgent: string, ipAddress: string}){
        const userdata = Object.assign(new User(), user)
        const newUser = await this.usersRepo.save(userdata).catch(e => {
            console.log(e)
            throw new BadRequestException(
                ZuAppResponse.BadRequest("Duplicate Values", "The Email already exists")
            )
        })
        const tokens = await this.getNewRefreshAndAccessTokens(values, newUser)
        const response =  ZuAppResponse.Ok<string>("Accepted", "Successfully logged in", 201)
        return [newUser, tokens.access, response.message]
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
