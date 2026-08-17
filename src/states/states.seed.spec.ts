import { STATES } from '../../prisma/seed/states';

describe('State seed data', () => {
  it('preserves all 36 supplied State Master records and legacy fields', () => {
    expect(STATES).toHaveLength(36);
    expect(new Set(STATES.map(({ id }) => id)).size).toBe(36);
    expect(new Set(STATES.map(({ stateCode }) => stateCode)).size).toBe(36);
    expect(new Set(STATES.map(({ isoCode }) => isoCode)).size).toBe(36);
    expect(STATES).toContainEqual({
      id: 20,
      stateName: 'RAJASTHAN',
      stateCode: '20',
      isActive: true,
      roId: 7,
      isoCode: 'IN-RJ',
    });
    expect(STATES).toContainEqual({
      id: 36,
      stateName: 'NVS',
      stateCode: '36',
      isActive: true,
      roId: null,
      isoCode: 'NVS',
    });
  });
});
