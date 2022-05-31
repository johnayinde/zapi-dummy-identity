import { Body, Controller, Post, Req, Session } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Serialize } from '../interceptors/serialize.interceptor';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/signin.dto';
import { UserDto } from './dto/user.dto';
import { Request } from 'express';


@ApiTags("Auth-Users")
@Controller('auth')
@Serialize(UserDto)
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @Post('/signup')
    @ApiOperation({description: 'Sign up a User'})
    async signUpUser(
        @Body() body: CreateUserDto
    ){
        const user = await this.authService.signup(body)
        return user 
    }

    @Post('/signin')
    @ApiOperation({description: 'Sign in a User'})
    async signInUser(
        @Body() body: SignInDto,
        @Req() req: Request
    ){
        return this.authService.signin(body, { userAgent: req.headers['user-agent'], ipAddress: req.ip })
    }
}
