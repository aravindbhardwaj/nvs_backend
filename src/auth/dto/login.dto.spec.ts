import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  const encryptedPassword = Buffer.alloc(256).toString('base64');
  it.each([
    [{ email: ' User@NVS.GOV.IN ', password: encryptedPassword }, 'email'],
    [{ username: ' NVS-User ', password: encryptedPassword }, 'username'],
  ] as const)('accepts a login identifier in %s', async (input, property) => {
    const dto = plainToInstance(LoginDto, input);

    await expect(validate(dto)).resolves.toHaveLength(0);
    expect(dto[property]).toBe(input[property]?.trim().toLowerCase());
  });

  it('requires either email or username', async () => {
    const dto = plainToInstance(LoginDto, { password: 'password' });

    await expect(validate(dto)).resolves.not.toHaveLength(0);
  });

  it('preserves email format validation', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'not-an-email',
      password: 'password',
    });

    await expect(validate(dto)).resolves.not.toHaveLength(0);
  });
});
