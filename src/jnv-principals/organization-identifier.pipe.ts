import {
  BadRequestException,
  Injectable,
  NotFoundException,
  PipeTransform,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationIdentifierPipe implements PipeTransform<
  string,
  Promise<number>
> {
  constructor(private readonly prisma: PrismaService) {}

  async transform(value: string): Promise<number> {
    if (/^[1-9]\d*$/.test(value)) return Number(value);
    if (!isUUID(value))
      throw new BadRequestException(
        'Organization identifier must be a positive ID or UUID.',
      );
    const organization = await this.prisma.organization.findUnique({
      where: { uuid: value },
      select: { id: true },
    });
    if (!organization) throw new NotFoundException('Organization not found.');
    return organization.id;
  }
}
