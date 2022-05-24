import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
// import { JwtService } from "@nestjs/jwt";
// import { jwtConstants } from "../common/constants/jwt.constants";
import { ZuAppResponse } from "../common/helpers/response";
import { UsersRepository } from "../databases/repository/user.repository";

// @Injectable()
// export class JwtHelperService {
//     constructor (
//         private userRepo: UsersRepository,
//         private jwtService: JwtService,
//         private configService: ConfigService
//     ){}

  
// }