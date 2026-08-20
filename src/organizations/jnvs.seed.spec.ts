import { JNVS } from '../../prisma/seed/jnvs';

describe('JNV seed data', () => {
  it('preserves all 664 JNV records with stable hierarchy references', () => {
    expect(JNVS).toHaveLength(664);
    expect(new Set(JNVS.map(({ schoolUrl }) => schoolUrl)).size).toBe(664);
    expect(JNVS).toContainEqual(
      expect.objectContaining({
        organizationCode: 'sssa',
        parentOrganizationCode: 'RO-HYDERABAD',
        stateCode: '01',
        schoolUrl: '/nvs-school/ap/sssa',
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
