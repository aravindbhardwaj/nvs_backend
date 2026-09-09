declare const configuration: (((() => {
    bcrypt: {
        rounds: number;
    };
    password: {
        minLength: number;
        maxLength: number;
        requireUppercase: boolean;
        requireLowercase: boolean;
        requireNumber: boolean;
        requireSpecialCharacter: boolean;
    };
    login: {
        maxAttempts: number;
        lockMinutes: number;
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    bcrypt: {
        rounds: number;
    };
    password: {
        minLength: number;
        maxLength: number;
        requireUppercase: boolean;
        requireLowercase: boolean;
        requireNumber: boolean;
        requireSpecialCharacter: boolean;
    };
    login: {
        maxAttempts: number;
        lockMinutes: number;
    };
}>) | ((() => {
    maxBannersPerOrganization: number;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    maxBannersPerOrganization: number;
}>) | ((() => {
    secret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    secret: string;
    accessExpiresIn: string;
    refreshExpiresIn: string;
}>))[];
export default configuration;
