import { Injectable, NotFoundException } from '@nestjs/common';
import { ZuAppResponse } from '../common/helpers/response';
import { UsersRepository } from '../databases/repository/user.repository';

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
        if(!id){
            return ZuAppResponse.NotFoundRequest("Not found",'User not found')
        }
        const user = this.usersrepo.findOne(id)
        return user
    }

    async findByEmail(email: string){
        if(!email) {
            return ZuAppResponse.NotFoundRequest("Not found",'User not found')
        }
        const user = await  this.usersrepo.findOne({where:{email: email}})
        return user
    }
}
