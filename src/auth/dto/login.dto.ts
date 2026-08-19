import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email' }) //validate email is valid
  @IsNotEmpty({ message: 'Email is required' }) //validate email is not empty
  email!: string; //email is required
  @IsString({ message: 'Password must be a string' }) //validate password is a string
  @IsNotEmpty({ message: 'Password is required' }) //validate password is not empty
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(32, { message: 'Password must be less than 32 characters long' })
  password!: string; //password is required
}
