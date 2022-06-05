import { Body, Controller, Get, NotFoundException, Param, ParseUUIDPipe, Patch, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZuAppResponse } from '../common/helpers/response';
import { UserDto } from '../user/dto/user.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';



@ApiTags('Users')
@Controller('user')
@Serialize(UserDto)
export class UserController {

}
