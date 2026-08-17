import { JNVS } from '../../prisma/seed/jnvs';

describe('JNV seed data', () => {
  it('preserves all 675 JNV records with stable hierarchy references', () => {
    expect(JNVS).toHaveLength(675);
    expect(new Set(JNVS.map(({ organizationCode }) => organizationCode)).size).toBe(
      675,
    );
    expect(JNVS).toContainEqual(
      expect.objectContaining({
        organizationCode: 'JNV-BHOPAL',
        parentOrganizationCode: 'RO-BHOPAL',
        stateCode: '12',
      }),
    );
    expect(
      JNVS.every(
        ({ parentOrganizationCode, stateCode }) =>
          parentOrganizationCode !== '' && stateCode !== '',
      ),
    ).toBe(true);
  });
});
