import { Injectable } from "@nestjs/common";
import { User } from "../../entities/user.entity";
import { EntityRepository, Repository } from "typeorm";
import { randomBytes, pbkdf2Sync } from "crypto";


@Injectable()
@EntityRepository(User)
export class UsersRepository extends Repository<User> {

}