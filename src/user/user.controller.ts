import { Body, Controller, Delete, Get, NotFoundException, Param, ParseUUIDPipe, Patch, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZuAppResponse } from '../common/helpers/response';
import { UserDto } from '../user/dto/user.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';


@ApiTags('Users')
@Controller('user')
export class UserController {
    constructor(private readonly userService : UserService){}

    @Serialize(UserDto)
    @Get('/:userId')
    @ApiOperation({description:"Find a user by Id"})
    async findUserById(@Param('userId') userId: string){
        const user = await this.userService.findById(userId)
        return ZuAppResponse.Ok(user,"200")
    }

    @Patch('/:userId')
    @ApiOperation({description:"Update a user"})
    async updateUserById(
        @Param('userId') userId: string,
        @Body() updateUserDto: UpdateUserDto){
            await this.userService.editUserById(updateUserDto, userId)
            return ZuAppResponse.Ok(updateUserDto.fullName, "User update successful",'200')
    }

}
