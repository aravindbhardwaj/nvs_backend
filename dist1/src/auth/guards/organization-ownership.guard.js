"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationOwnershipGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const client_1 = require("@prisma/client");
const organization_owned_resource_decorator_1 = require("../decorators/organization-owned-resource.decorator");
const prisma_service_1 = require("../../prisma/prisma.service");
const organization_ownership_service_1 = require("../services/organization-ownership.service");
let OrganizationOwnershipGuard = class OrganizationOwnershipGuard {
    reflector;
    prisma;
    ownership;
    constructor(reflector, prisma, ownership) {
        this.reflector = reflector;
        this.prisma = prisma;
        this.ownership = ownership;
    }
    async canActivate(context) {
        const resource = this.reflector.getAllAndOverride(organization_owned_resource_decorator_1.ORGANIZATION_OWNED_RESOURCE_KEY, [context.getHandler(), context.getClass()]);
        if (!resource) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || user.role === client_1.Role.SUPER_ADMIN) {
            return true;
        }
        const requestedOrganizationId = this.toPositiveInteger(request.body?.organizationId ?? request.query?.organizationId);
        if (requestedOrganizationId) {
            this.ownership.assertAccess(requestedOrganizationId, user);
            return true;
        }
        const id = this.toPositiveInteger(request.params?.id);
        if (id) {
            const record = resource === 'page'
                ? await this.prisma.page.findUnique({
                    where: { id },
                    select: { organizationId: true },
                })
                : resource === 'media'
                    ? await this.prisma.media.findUnique({
                        where: { id },
                        select: { organizationId: true },
                    })
                    : resource === 'banner'
                        ? await this.prisma.banner.findUnique({
                            where: { id },
                            select: { organizationId: true },
                        })
                        : await this.prisma.galleryImage.findUnique({
                            where: { id },
                            select: { organizationId: true },
                        });
            if (record) {
                this.ownership.assertAccess(record.organizationId, user);
            }
            return true;
        }
        if (resource === 'page' && request.params?.slug) {
            const page = await this.prisma.page.findFirst({
                where: { slug: request.params.slug },
                select: { organizationId: true },
            });
            if (page) {
                this.ownership.assertAccess(page.organizationId, user);
            }
        }
        return true;
    }
    toPositiveInteger(value) {
        const parsed = typeof value === 'number' ? value : Number(value);
        return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
    }
};
exports.OrganizationOwnershipGuard = OrganizationOwnershipGuard;
exports.OrganizationOwnershipGuard = OrganizationOwnershipGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        prisma_service_1.PrismaService,
        organization_ownership_service_1.OrganizationOwnershipService])
], OrganizationOwnershipGuard);
//# sourceMappingURL=organization-ownership.guard.js.map