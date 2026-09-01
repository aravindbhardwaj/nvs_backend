import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  validateJnvPrincipalFile,
  validateJnvPrincipalImage,
} from './jnv-principals.storage';

const file = (originalname: string, mimetype: string, path = '', size = 10) =>
  ({ originalname, mimetype, path, size }) as Express.Multer.File;

describe('JNV principal image validation', () => {
  it.each([
    ['principal.jpg', 'image/jpeg'],
    ['principal.jpg', 'image/jpg'],
    ['principal.jpg', 'application/octet-stream'],
    ['principal.png', 'image/png'],
    ['principal.png', 'image/x-png'],
    ['principal.png', 'application/octet-stream'],
  ])('accepts %s sent as %s for content validation', (name, mimeType) => {
    expect(() => validateJnvPrincipalFile(file(name, mimeType))).not.toThrow();
  });

  it('detects and normalizes a generic PNG upload', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'jnv-principal-'));
    const path = join(directory, 'principal.png');
    await writeFile(
      path,
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );
    const uploaded = file('principal.png', 'application/octet-stream', path, 8);

    await expect(validateJnvPrincipalImage(uploaded)).resolves.toBeUndefined();
    expect(uploaded.mimetype).toBe('image/png');
  });

  it('rejects content that does not match the file extension', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'jnv-principal-'));
    const path = join(directory, 'principal.jpg');
    await writeFile(
      path,
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );

    await expect(
      validateJnvPrincipalImage(
        file('principal.jpg', 'application/octet-stream', path, 8),
      ),
    ).rejects.toThrow('content is invalid');
  });
});
