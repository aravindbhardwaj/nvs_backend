import { BadRequestException } from '@nestjs/common';
import { constants, generateKeyPairSync, publicEncrypt } from 'node:crypto';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PasswordDecryptionService } from './password-decryption.service';

describe('PasswordDecryptionService', () => {
  const dir = mkdtempSync(join(tmpdir(), 'nvs-password-'));
  const path = join(dir, 'private.pem');
  const keys = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });
  writeFileSync(path, keys.privateKey);
  const service = new PasswordDecryptionService({
    getOrThrow: () => path,
  } as never);

  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it('decrypts RSA-OAEP SHA-256 ciphertext', () => {
    const ciphertext = publicEncrypt(
      {
        key: keys.publicKey,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from('SecurePassword123!'),
    ).toString('base64');
    expect(service.decrypt(ciphertext)).toBe('SecurePassword123!');
  });

  it('rejects plaintext and ciphertext made with another key', () => {
    expect(() => service.decrypt('SecurePassword123!')).toThrow(
      BadRequestException,
    );
    const other = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const ciphertext = publicEncrypt(
      {
        key: other.publicKey,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      Buffer.from('SecurePassword123!'),
    ).toString('base64');
    expect(() => service.decrypt(ciphertext)).toThrow(BadRequestException);
  });
});
