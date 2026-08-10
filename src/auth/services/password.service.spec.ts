import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const service = new PasswordService({
    getOrThrow: jest.fn().mockReturnValue(4),
  } as never);

  it('hashes non-password secrets without applying the password policy', async () => {
    const secret = 'a'.repeat(128);

    const hash = await service.hashSecret(secret);

    await expect(service.compare(secret, hash)).resolves.toBe(true);
  });
});
