import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';
import { PrismaService } from '../../prisma/prisma.service';
import { Strategy } from 'passport-jwt';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: JwtPayload): Promise<AuthenticatedUser>;
}
export {};
