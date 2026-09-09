import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizationOwnershipService } from '../services/organization-ownership.service';
export declare class OrganizationOwnershipGuard implements CanActivate {
    private readonly reflector;
    private readonly prisma;
    private readonly ownership;
    constructor(reflector: Reflector, prisma: PrismaService, ownership: OrganizationOwnershipService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private toPositiveInteger;
}
