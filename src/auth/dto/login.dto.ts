import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}