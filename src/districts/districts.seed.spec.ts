import { DISTRICTS } from '../../prisma/seed/districts';

describe('District seed data', () => {
  it('preserves all 666 supplied district records and their legacy fields', () => {
    expect(DISTRICTS).toHaveLength(666);
    expect(new Set(DISTRICTS.map(({ id }) => id))).toHaveSize(666);
    expect(DISTRICTS).toContainEqual({
      id: 129,
      districtName: 'JUNAGARH',
      districtCode: '28',
      stateId: 6,
      isActive: true,
      languageId: 99,
      oldDistrictCode: null,
      oldDistrictName: null,
      roId: 2,
    });
  });
});
