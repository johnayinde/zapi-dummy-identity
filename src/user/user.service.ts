import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { ZuAppResponse } from '../common/helpers/response';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
         private readonly usersRepo: Repository<User>
    ){}
    
    findOne(id: string){
        const user = this.usersRepo.findOne({where :{id}})
        if(!user){
            throw new NotFoundException(
                ZuAppResponse.NotFoundRequest("Not found",'User not found')
           )
        }
        return user
    }

    async findByEmail(email: string){
        const user = await  this.usersRepo.findOne({where:{email: email}})
        if(!user) { 
            throw new NotFoundException(
                 ZuAppResponse.NotFoundRequest("Not found",' not found', "404")
            )
        }
        return user
    }

    async editUserById(dto: UpdateUserDto, userId: string){
        //check if user exists
        const userExists = await this.usersRepo.findOne({where:{id:userId}})
        if(!userExists){
            throw new NotFoundException(
                ZuAppResponse.NotFoundRequest(
                    "Not found", 
                    `User with id : ${userId} does not exist`, 
                    "404")
            )
        }
        
        //update user details
        return await this.usersRepo.update(userId, dto).catch((err)=>{
            throw new BadRequestException(
                ZuAppResponse.BadRequest(
                    "Internal server error", 
                    "User not updated",
                    "500")
            )
        })
        
    }

    async editUserByEmail(dto: UpdateUserDto, email: string){
        //check if user exists
        const userExists = await this.usersRepo.findOne({where:{email:email}})
        if(!userExists){
            throw new NotFoundException(
                ZuAppResponse.NotFoundRequest(
                    "Not found", 
                    `User with email : ${email} does not exist`, 
                    "404")
            )
        }
        
        //update user details
        return await this.usersRepo.update(email, dto).catch((err)=>{
            throw new BadRequestException(
                ZuAppResponse.BadRequest(
                    "Internal server error", 
                    "User not updated",
                    "500")
            )
        })
        
    }

    async deleteUser(userId: string){
        //check if user exists
        const userExists = await this.usersRepo.findOne({where:{id:userId}})
        if(!userExists){
            throw new NotFoundException(
                ZuAppResponse.NotFoundRequest(
                    "Not found", 
                    "User not found", 
                    "404")
            )
        }

        //delete user details
        return await this.usersRepo.delete(userId).catch((err)=>{
            throw new BadRequestException(
                ZuAppResponse.BadRequest(
                    "Internal server error", 
                    "User not deleted",
                    "500")
            )
        })
    }

    async update(id: string, attrs: Partial<User>){
        const user = await this.usersRepo.findOne({where :{id}})
        if (!user){
            throw new NotFoundException(
                ZuAppResponse.NotFoundRequest('user not found')
            )
        }
        Object.assign(user, attrs)
        const updatedUser = this.usersRepo.save(user)
        return updatedUser
    }


}
