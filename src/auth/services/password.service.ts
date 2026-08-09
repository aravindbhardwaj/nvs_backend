  import {Injectable, BadRequestException } from '@nestjs/common';
  import { ConfigService } from '@nestjs/config';
  import * as bcrypt from 'bcrypt';
  
  
  @Injectable()
  export class PasswordService {

    constructor(
        private readonly configService: ConfigService,
    ) {}

  
    /**
     * Production password policy
     *
     * Minimum 12 characters
     * At least one uppercase
     * At least one lowercase
     * At least one digit
     * At least one special character
     */
    private static readonly PASSWORD_REGEX =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+=])[A-Za-z\d@$!%*?&^#()_\-+=]{12,128}$/;
  
    validate(password: string): void {
      if (!PasswordService.PASSWORD_REGEX.test(password)) {
        throw new BadRequestException(
          [
            'Password must:',
            '- be at least 12 characters long',
            '- contain one uppercase letter',
            '- contain one lowercase letter',
            '- contain one number',
            '- contain one special character',
          ].join('\n'),
        );
      }
    }
  
    async hash(password: string): Promise<string> {
        this.validate(password);
  
        const rounds =
        this.configService.getOrThrow<number>(
            'auth.bcrypt.rounds',
        );
    
        return bcrypt.hash(password, rounds);
    }
  
    async compare(
      plainPassword: string,
      hashedPassword: string,
    ): Promise<boolean> {
      return bcrypt.compare(
        plainPassword,
        hashedPassword,
      );
    }
  }