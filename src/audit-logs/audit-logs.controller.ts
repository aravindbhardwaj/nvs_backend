import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';

import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetAuditLogsQueryDto } from './dto/get-audit-logs-query.dto';
import { AuditLogsService } from './audit-logs.service';

@Controller('api/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(Role.SUPER_ADMIN)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @RequirePermission('AUDIT_LOG_VIEW')
  async findAll(@Query() query: GetAuditLogsQueryDto) {
    return {
      message: 'Audit logs retrieved successfully.',
      data: await this.auditLogsService.findAll(query),
    };
  }

  @Get(':id')
  @RequirePermission('AUDIT_LOG_VIEW')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      message: 'Audit log retrieved successfully.',
      data: await this.auditLogsService.findOne(id),
    };
  }
}
