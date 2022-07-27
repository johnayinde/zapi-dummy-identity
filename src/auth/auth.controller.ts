import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Serialize } from '../interceptors/serialize.interceptor';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { SignInDto } from './dto/signin.dto';
import { UserDto } from '../user/dto/user.dto';
import { Request } from 'express';
import { PasswordResetDto } from '../user/dto/password-reset.dto';
import { PasswordForgotEmailDto } from 'src/user/dto/password-email.dto';
import { Ok, ZuAppResponse } from '../common/helpers/response';
import { User } from '../entities/user.entity';
import { ChangePasswordDto } from 'src/user/dto/change-password.dto';


@ApiTags("Auth-Users")
@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ){}

    @Serialize(UserDto)
    @Post('/signup')
    @ApiOperation({description: 'Sign up a User'})
    async signUpUser(@Body() body: CreateUserDto){
        const user = await this.authService.signup(body);
        return user;
    }

    @Post('/signin')
    @ApiOperation({description: 'Sign in a User'})
    async signInUser(@Body() dto: SignInDto, @Req() req: Request) {
        return this.authService.signin(dto, { userAgent: req.headers['user-agent'], ipAddress: req.ip });
    }

    @Post('/signout')
    @ApiOperation({description: 'Sign out a User'})
    async signOutUser(@Body('refreshToken') refreshToken: string) {
        return await this.authService.signout(refreshToken);
    }

    @Post('/token')
    @ApiOperation({description: 'Get new access token'})
    getAccess(@Body('refreshToken') token: string){
        return this.authService.getNewTokens(token)
    }
    
    @Serialize(UserDto)
    @Post('/forgot/post')
    @ApiOperation({description:'submit email for password reset'})
    async forgotPassword(@Body() body: PasswordForgotEmailDto
    ): Promise<Ok<string>>    {
        const resetPageUrl = await this.authService.forgotPassword(body.email)
        return ZuAppResponse.Ok(resetPageUrl, "A Reset link has been sent to the user's email", 200)
    }

    @Serialize(UserDto)
    @Post('/reset/:id')
    @ApiOperation({description: 'password reset function'})
    async resetPassword(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() body: PasswordResetDto
    ): Promise<Ok<User>>{
        const updatedUser =  await this.authService.resetPassword(id, body)
        return ZuAppResponse.Ok( updatedUser, 'User password reset successful', '200')
    }  
    
    //@Serialize(UserDto)
    @Patch('/changepassword/:id')
    @ApiOperation({description: 'update password'})
    async changePassword(
        @Param('id') id: string,
        @Body() body: ChangePasswordDto
    ){
        await this.authService.changePassword(id, body)
        return ZuAppResponse.Ok("Password updated", "200")
    }
}
