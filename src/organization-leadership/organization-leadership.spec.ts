import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { CreateOrganizationLeaderDto } from './dto/create-organization-leader.dto';
import { OrganizationReferenceDto } from './dto/organization-reference.dto';
import { UpdateOrganizationLeaderDto } from './dto/update-organization-leader.dto';
import { OrganizationLeadershipController } from './organization-leadership.controller';

describe('Organization leadership contract', () => {
  it('allows SUPER_ADMIN, HEADQUARTER, NLI, and REGIONAL roles', () => {
    expect(
      Reflect.getMetadata(ROLES_KEY, OrganizationLeadershipController),
    ).toEqual([Role.SUPER_ADMIN, Role.HEADQUARTER, Role.NLI, Role.REGIONAL]);
  });

  it.each([
    [
      CreateOrganizationLeaderDto,
      { leaderNameEnglish: 'Name', leaderDesignationEnglish: 'Director' },
    ],
    [UpdateOrganizationLeaderDto, { leaderNameEnglish: 'Updated name' }],
    [OrganizationReferenceDto, {}],
  ])('requires organization_uuid for %p', async (Dto, input) => {
    const errors = await validate(plainToInstance(Dto, input));
    expect(errors.some((error) => error.property === 'organization_uuid')).toBe(
      true,
    );
  });

  it('accepts a valid organization UUID on update', async () => {
    const dto = plainToInstance(UpdateOrganizationLeaderDto, {
      organization_uuid: '9f631c5f-6104-4fe4-91c0-6f956d31f4f8',
      leaderNameEnglish: 'Updated name',
    });
    expect(await validate(dto)).toEqual([]);
  });
});
