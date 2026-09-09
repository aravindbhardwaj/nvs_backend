import { ConfigService } from '@nestjs/config';
export declare class PasswordService {
    private readonly configService;
    constructor(configService: ConfigService);
    private static readonly PASSWORD_REGEX;
    validate(password: string): void;
    hash(password: string): Promise<string>;
    hashSecret(secret: string): Promise<string>;
    compare(plainPassword: string, hashedPassword: string): Promise<boolean>;
}
