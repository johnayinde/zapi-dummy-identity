import { IsString, MinLength, Matches, MaxLength, IsNotEmpty} from 'class-validator'
import { Match } from '../../common/decorators/password-match.decorator'

export class PasswordResetDto {
    @IsString()
    @IsNotEmpty({message: 'password cannot be empty'})
    @MinLength(8, 
        {message: 'Password is too short. Minimal length is $constraint1 characters, but actual is $value'}
    )
    @MaxLength(20, 
        { message: 'password is too long. Maximal length is $constraint1 characters, but actual is $value'}
    )
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, 
        {message: 'password must contain the following: a capital letter, a number and a special character'}
    )
    password: string

    @IsString()
    @IsNotEmpty({message: 'kindly confirm password'})
    @MinLength(8)
    @MaxLength(20)
    @Match('password')
    passwordConfirm: string;
}
