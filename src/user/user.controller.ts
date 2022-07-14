import { Body, Controller, Delete, Get, NotFoundException, Param, ParseUUIDPipe, Patch, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZuAppResponse } from '../common/helpers/response';
import { UserDto } from '../user/dto/user.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUserDto } from './dto/find-user.dto';



@ApiTags('Users')
@Controller('user')
@Serialize(UserDto)
export class UserController {
    constructor(private readonly userService : UserService){}

    @Get()
    @ApiOperation({description: "Find a user by email"})
    async findUserByEmail(@Body() findUserDto: FindUserDto){
        return await this.userService.findByEmail(findUserDto.email)
    }

    @Get()
    @ApiOperation({description: "Find a user by id"})
    async findUserById(@Body() findUserDto: FindUserDto){
        return await this.userService.findOne(findUserDto.email)
    }

    @Patch('/:userId')
    @ApiOperation({description:"Update a user"})
    async updateUserById(
        @Param('userId') userId: string,
        @Body() updateUserDto: UpdateUserDto){
            return await this.userService.editUserById(updateUserDto, userId)
    }

    @Patch('/:email')
    @ApiOperation({description:"Update a user"})
    async updateUserByEmail(
        @Param('email') email: string,
        @Body() updateUserDto: UpdateUserDto){
            return await this.userService.editUserById(updateUserDto, email)
    }

    @Delete('/:userId')
    @ApiOperation({description:"delete a user"})
    async deleteUser(@Param('userId') userId: string){
        return await this.userService.deleteUser(userId)
    }
}
