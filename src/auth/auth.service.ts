import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from '../database/repository/user.repository';
import { User } from '../entities/user.entity';
import { ZuAppResponse } from '../common/helpers/response';
import { CreateUserDto } from '../user/dto/create-user.dto';


@Injectable()
export class AuthService {
    constructor(
        private usersRepo: UsersRepository
    ){}

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
}
