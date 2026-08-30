import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateModalDto } from './create-modal.dto';

describe('CreateModalDto', () => {
  it.each([
    'https://example.gov.in/results?id=1',
    '/nvs3/uploads/recruitment/notice.pdf',
  ])('accepts a safe link: %s', async (link) => {
    const dto = plainToInstance(CreateModalDto, {
      text_english: 'Recruitment result notice',
      text_hindi: 'भर्ती परिणाम सूचना',
      link,
      display_order: 1,
      start_date: '2026-08-30',
      end_date: '2026-09-30',
    });

    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it.each([
    'javascript:alert(1)',
    'http://example.gov.in/notice',
    '//example.gov.in/notice',
    'relative/notice.pdf',
  ])('rejects an unsafe link: %s', async (link) => {
    const dto = plainToInstance(CreateModalDto, {
      text_english: 'Recruitment result notice',
      text_hindi: 'भर्ती परिणाम सूचना',
      link,
    });

    const errors = await validate(dto);

    expect(errors.some((error) => error.property === 'link')).toBe(true);
  });
});
