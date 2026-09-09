declare const _default: (() => {
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
}>;
export default _default;
