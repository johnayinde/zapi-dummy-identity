import { ApiProperty } from '@nestjs/swagger';

export class UserInfo {
  @ApiProperty()
  login_time: string;
  @ApiProperty()
  country: string;
  @ApiProperty()
  ip_address: string;
  @ApiProperty()
  browser_name: string;
  @ApiProperty()
  os_name: string;
}
