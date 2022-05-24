import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { jwtConstants } from "../common/constants/jwt.constant";
import { ZuAppResponse } from "../common/helpers/response";
import { UsersRepository } from "../databases/repository/user.repository";

@Injectable()
export class JwtHelperService {
    constructor (
        private userRepo: UsersRepository,
        private jwTokenService: JwtService,
        private configService: ConfigService
    ){}
    
    async signAccess(payload: {userAgent: string, ipAddress: string, id: string}){
        return this.jwTokenService.sign(payload, {
            secret: await this.configService.get(jwtConstants.access_secret),
            expiresIn: await this.configService.get(jwtConstants.access_time)
        })
    }

    async signRefresh(payload: {useAgent: string, ipAddress: string, id: string}){
        let refreshToken = this.jwTokenService.sign(payload, {
            secret: await this.configService.get(jwtConstants.refresh_secret),
            expiresIn: await this.configService.get(jwtConstants.refresh_time)
        })

        let user = await this.userRepo.findOne(payload.id)
        await this.userRepo.update(user.id, {refreshToken}).catch(err => {
            throw new BadRequestException(
                ZuAppResponse.BadRequest('user not found', 'This user does not exist')
            )
        })
        return refreshToken
    }

    async getNewTokens(refreshToken: string){
        try {
            let payload = this.jwTokenService.verify(refreshToken, {secret: await this.configService.get(jwtConstants.refresh_secret)})
            payload = {
                id: payload.id,
                ipAddress: payload.ipAddress,
                userAgent: payload.userAgent
            }

            let verified = await this.userRepo.findOne({
                where: {
                    refreshToken: refreshToken
                }
            })
            if(verified) {
                return {
                    access: await this.signAccess(payload)
                }
            } else throw new Error()
        } catch (error) {
            throw new BadRequestException(
                ZuAppResponse.BadRequest('Invalid Refresh Token', 'Get the correct refresh token and try again')
            )
        }
    }
  
}