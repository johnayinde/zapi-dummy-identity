import {IsEmail, IsString, MinLength, Matches, MaxLength, IsNotEmpty} from 'class-validator'
export class CreateUserDto {
    @IsString()
    @IsNotEmpty({message: 'fullname cannot be empty'})
    fullName: string

    @IsEmail()
    @IsString()
    email: string

    @IsString()
    @IsNotEmpty({message: 'password cannot be empty'})
    @MinLength(8, 
        {message: 'Title is too short. Minimal length is $constraint1 characters, but actual is $value'}
    )
    @MaxLength(20, 
        { message: 'Title is too long. Maximal length is $constraint1 characters, but actual is $value'}
    )
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, 
        {message: 'password must contain the following: a capital letter, a number and a special character'}
    )
    password: string
}