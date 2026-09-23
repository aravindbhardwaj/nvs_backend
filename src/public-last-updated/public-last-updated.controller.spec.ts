import { PublicLastUpdatedController } from './public-last-updated.controller';
import { PublicLastUpdatedService } from './public-last-updated.service';

describe('PublicLastUpdatedController', () => {
  const organizationUuid = '550e8400-e29b-41d4-a716-446655440000';
  const service = { getLastUpdated: jest.fn() };
  const controller = new PublicLastUpdatedController(
    service as unknown as PublicLastUpdatedService,
  );
  beforeEach(() => jest.clearAllMocks());

  it('keeps the response payload around the formatted date', async () => {
    service.getLastUpdated.mockResolvedValue({
      organizationUuid,
      lastUpdatedAt: '14 August 2026',
    });

    expect(await controller.getLastUpdated(organizationUuid)).toEqual({
      message: 'Public last updated date retrieved successfully.',
      data: { organizationUuid, lastUpdatedAt: '14 August 2026' },
    });
  });

  it('keeps null when there is no visible content', async () => {
    service.getLastUpdated.mockResolvedValue({
      organizationUuid,
      lastUpdatedAt: null,
    });

    expect(await controller.getLastUpdated(organizationUuid)).toEqual({
      message: 'Public last updated date retrieved successfully.',
      data: { organizationUuid, lastUpdatedAt: null },
    });
  });
});
