import 'reflect-metadata';

import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { CreateExternalMediaDto } from './create-external-media.dto';

describe('CreateExternalMediaDto', () => {
  const validInput = {
    titleEnglish: 'External notice',
    titleHindi: 'बाहरी सूचना',
    mediaTypeId: 1,
  };

  it('accepts one HTTPS URL for both language variants', async () => {
    const dto = plainToInstance(CreateExternalMediaDto, {
      ...validInput,
      externalUrl: ' https://example.gov.in/notice ',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto.externalUrl).toBe('https://example.gov.in/notice');
  });

  it.each(['http://example.gov.in/notice', 'javascript:alert(1)', ''])(
    'rejects unsafe or empty external URL %s',
    async (externalUrl) => {
      const dto = plainToInstance(CreateExternalMediaDto, {
        ...validInput,
        externalUrl,
      });

      expect(await validate(dto)).not.toHaveLength(0);
    },
  );
});
