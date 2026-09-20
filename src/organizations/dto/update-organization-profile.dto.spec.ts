import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateOrganizationProfileDto } from './update-organization-profile.dto';

describe('UpdateOrganizationProfileDto', () => {
  it('accepts profile values and trims strings', async () => {
    const dto = plainToInstance(UpdateOrganizationProfileDto, {
      short_description: '  Organization summary  ',
    });

    expect(await validate(dto)).toHaveLength(0);
    expect(dto.short_description).toBe('Organization summary');
  });

  it('accepts null to clear the description', async () => {
    const dto = plainToInstance(UpdateOrganizationProfileDto, {
      short_description: null,
    });

    expect(await validate(dto)).toHaveLength(0);
  });

  it('rejects empty strings', async () => {
    const dto = plainToInstance(UpdateOrganizationProfileDto, {
      short_description: '   ',
    });

    expect(await validate(dto)).not.toHaveLength(0);
  });
});
