import { DISTRICTS } from '../../prisma/seed/districts';

describe('District seed data', () => {
  it('preserves all 666 supplied district records and their legacy fields', () => {
    expect(DISTRICTS).toHaveLength(666);
    expect(new Set(DISTRICTS.map(({ id }) => id)).size).toBe(666);
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
    expect(DISTRICTS).toContainEqual({
      id: 453,
      districtName: 'SORENG (WEST SIKKIM)',
      districtCode: '01',
      stateId: 21,
      isActive: true,
      languageId: 108,
      oldDistrictCode: null,
      oldDistrictName: 'WEST SIKKIM',
      roId: 8,
    });
    expect(DISTRICTS.some(({ languageId }) => languageId === null)).toBe(true);
    expect(DISTRICTS.some(({ roId }) => roId === null)).toBe(true);
  });
});
