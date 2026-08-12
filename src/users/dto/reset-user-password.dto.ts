import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ResetUserPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password: string;
}
