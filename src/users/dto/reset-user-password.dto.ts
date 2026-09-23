import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ResetUserPasswordDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9+/]{342}==$/)
  password: string;
}
