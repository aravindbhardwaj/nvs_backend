import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

const normalizeIdentifier = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class LoginDto {
  @ValidateIf(
    (dto: LoginDto) => dto.email !== undefined || dto.username === undefined,
  )
  @Transform(normalizeIdentifier)
  @IsEmail()
  email?: string;

  @ValidateIf((dto: LoginDto) => dto.username !== undefined)
  @Transform(normalizeIdentifier)
  @IsString()
  @IsNotEmpty()
  username?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9+/]{342}==$/)
  password: string;
}
