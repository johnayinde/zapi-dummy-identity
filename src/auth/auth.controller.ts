import { Body, Controller, Post, Session } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Serialize } from '../intereptors/serialize.interceptor';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';


@ApiTags("Auth-Users")
@Controller('auth')
@Serialize(UserDto)
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @Post('/signup')
    @ApiOperation({description: 'Sign up a User'})
    async signUpUser(
        @Body() body: CreateUserDto,
        @Session() session: any
    ){
        const user = await this.authService.signup(body)
        return user 
    }
}
