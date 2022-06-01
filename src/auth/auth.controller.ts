import { Body, Controller,  Post} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Serialize } from '../intereptors/serialize.interceptor';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserDto } from '../user/dto/user.dto';

@ApiTags("Auth-Users")
@Controller('auth')
@Serialize(UserDto)
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        ){}

    @Post('/signup')
    @ApiOperation({description: 'Sign up a User'})
    async signUpUser(
        @Body() body: CreateUserDto,
    ){
        const user = await this.authService.signup(body)
        return user 
    }   
}
