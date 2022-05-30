import { Injectable, NotFoundException } from '@nestjs/common';
import { ZuAppResponse } from '../common/helpers/response';
import { UsersRepository } from '../database/repository/user.repository';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
    constructor(
         private readonly usersrepo: UsersRepository
    ){}
    
    findOne(id: string){
        const user = this.usersrepo.findOne(id)
        if(!user){
            throw new NotFoundException(
                ZuAppResponse.NotFoundRequest("Not found",'User not found')
           )
        }
        return user
    }

    async findByEmail(email: string){
        const user = await  this.usersrepo.findOne({where:{email: email}})
        if(!user) { 
            throw new NotFoundException(
                 ZuAppResponse.NotFoundRequest("Not found",' not found', "404")
            )
        }
        return user
    }

}
