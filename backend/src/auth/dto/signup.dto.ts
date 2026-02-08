import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(10, { message: 'Phone number must be at least 10 digits' })
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Phone number can only contain digits, +, -, spaces, parentheses' })
  phone: string;
}
