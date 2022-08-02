import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Put,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZuAppResponse } from '../common/helpers/response';
import { UserDto } from '../user/dto/user.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserInfo } from './dto/userInfo.dto';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Serialize(UserDto)
  @Get('/:userId')
  @ApiOperation({ description: 'Find a user by Id' })
  async findUserById(@Param('userId') userId: string) {
    return await this.userService.findById(userId);
  }

  @Patch('/:userId')
  @ApiOperation({ description: 'Update a user' })
  async updateUserById(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    await this.userService.editUserById(updateUserDto, userId);
    return ZuAppResponse.Ok(
      updateUserDto.fullName,
      'User update successful',
      '200',
    );
  }

  @Get('history/:userId')
  @ApiOkResponse({
    type: [UserInfo],
    description: 'Get all histories',
    isArray: true,
  })
  @ApiOperation({ description: 'Get user login histories' })
  async getLoginHistory(@Param('userId') userId: string) {
    return await this.userService.getLoginHistories(userId);
  }
}
