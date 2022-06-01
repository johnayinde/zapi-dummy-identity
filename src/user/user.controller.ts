import { Body, Controller, Get, NotFoundException, Param, ParseUUIDPipe, Patch, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZuAppResponse } from '../common/helpers/response';
import { UserDto } from '../user/dto/user.dto';
import { Serialize } from '../intereptors/serialize.interceptor';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';


@ApiTags('Users')
@Controller('user')
@Serialize(UserDto)
export class UserController {
    constructor(
        private userService: UserService
    ){}

    @Get('/:id')
    @ApiOperation({description: 'fetches a user from the database'})
    async findUser(@Param('id', new ParseUUIDPipe()) id: string){
        const user = await this.userService.findOne(id)
        if(!user){
            throw new NotFoundException(
                ZuAppResponse.NotFoundRequest('User does not exist')
            )
        } return user
    }

    @Patch('/:id')
    @ApiOperation({description: 'update a user profile'})
    async updateUser(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() body: UpdateUserDto
        ){
        return this.userService.update(id, body)
    }
}
