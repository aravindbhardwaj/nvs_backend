import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GetAuditLogsQueryDto } from './dto/get-audit-logs-query.dto';
import { AuditLogsService } from './audit-logs.service';

@Controller('api/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  async findAll(@Query() query: GetAuditLogsQueryDto) {
    return { message: 'Audit logs retrieved successfully.', data: await this.auditLogsService.findAll(query) };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return { message: 'Audit log retrieved successfully.', data: await this.auditLogsService.findOne(id) };
  }
}
