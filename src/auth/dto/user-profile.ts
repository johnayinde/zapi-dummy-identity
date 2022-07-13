import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserProfileDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
