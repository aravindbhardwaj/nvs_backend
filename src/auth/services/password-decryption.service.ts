import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  constants,
  createPrivateKey,
  privateDecrypt,
  type KeyObject,
} from 'node:crypto';
import { readFileSync } from 'node:fs';

@Injectable()
export class PasswordDecryptionService {
  private readonly privateKey: KeyObject;
  private readonly ciphertextLength: number;

  constructor(config: ConfigService) {
    const path = config.getOrThrow<string>('auth.passwordPrivateKeyPath');
    this.privateKey = createPrivateKey(readFileSync(path));
    if (
      this.privateKey.asymmetricKeyType !== 'rsa' ||
      this.privateKey.asymmetricKeyDetails?.modulusLength !== 2048
    ) {
      throw new Error('Password private key must be RSA-2048.');
    }
    this.ciphertextLength = 256;
  }

  decrypt(value: string): string {
    if (!/^[A-Za-z0-9+/]{342}==$/.test(value)) {
      throw new BadRequestException('Invalid encrypted password.');
    }
    const ciphertext = Buffer.from(value, 'base64');
    if (
      ciphertext.length !== this.ciphertextLength ||
      ciphertext.toString('base64') !== value
    ) {
      throw new BadRequestException('Invalid encrypted password.');
    }
    try {
      const password = privateDecrypt(
        {
          key: this.privateKey,
          padding: constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: 'sha256',
        },
        ciphertext,
      ).toString('utf8');
      if (!password || Buffer.from(password, 'utf8').length > 190) {
        throw new Error('Invalid password payload');
      }
      return password;
    } catch {
      throw new BadRequestException('Invalid encrypted password.');
    }
  }
}
