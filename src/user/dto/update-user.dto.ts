import { IsEmail, IsString, IsOptional } from "class-validator";

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    fullName: string


    @IsEmail()
    @IsOptional()
    email: string

    @IsString()
    @IsOptional()
    password: string


}