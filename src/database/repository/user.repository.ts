import { Injectable } from "@nestjs/common";
import { User } from "../../entities/user.entity";
import { EntityRepository, Repository } from "typeorm";
import { randomBytes, pbkdf2Sync } from "crypto";


@Injectable()
@EntityRepository(User)
export class UsersRepository extends Repository<User> {
    hashPassword(password: string, salt ?: string){
        if(!salt) salt = randomBytes(32).toString('hex')
        let hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
        let hashedPassword = `${salt}:${hash}`
        return hashedPassword
    }
}