import { Injectable, NotFoundException } from '@nestjs/common';
import { ZuAppResponse } from '../common/helpers/response';
import { UsersRepository } from '../databases/repository/user.repository';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
    constructor(
         private readonly usersrepo: UsersRepository
    ){}
    
    create(fullName: string, email: string, password: string) {
        const user = this.usersrepo.create({fullName, email, password})
        return this.usersrepo.save(user)
    }

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
                 ZuAppResponse.NotFoundRequest("Not found",' not found')
            )
        }
        return user
    }

    async update(id: string, attrs: Partial<User>){
        const user = await this.usersrepo.findOne(id)
        if(!user) {
            throw new NotFoundException( 
                ZuAppResponse.NotFoundRequest('User not found')
            )
        }
        Object.assign(user, attrs)
        return this.usersrepo.save(user)
    }
}
