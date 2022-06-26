import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Serialize } from '../interceptors/serialize.interceptor';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { SignInDto } from './dto/signin.dto';
import { UserDto } from '../user/dto/user.dto';
import { Request } from 'express';
import { PasswordResetDto } from '../user/dto/password-reset.dto';


@ApiTags("Auth-Users")
@Controller('auth')
@Serialize(UserDto)
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ){}

    @Post('/signup')
    @ApiOperation({description: 'Sign up a User'})
    async signUpUser(@Body() body: CreateUserDto){
        return this.authService.signup(body);
    }

    @Post('/signin')
    @ApiOperation({description: 'Sign in a User'})
    async signInUser(
        @Body() body: SignInDto,
        @Req() req: Request
    ){
        return this.authService.signin(body, { userAgent: req.headers['user-agent'], ipAddress: req.ip })
    }
    
    @Post('/forgot/post')
    @ApiOperation({description:'submit email for password reset'})
    async forgotPassword(@Body() email: string){
        return await this.authService.forgotPassword(email)
    }

    @Post('/reset/:id/:token')
    @ApiOperation({description: 'password reset function'})
    async resetPassword(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Param('token') token: string,
        @Body() body: PasswordResetDto
    ){
        const updatedUser =  await this.authService.resetPassword(id, token, body)
        return updatedUser
    }

    
}
