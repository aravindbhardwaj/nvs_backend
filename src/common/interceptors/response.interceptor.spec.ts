import { of, lastValueFrom } from 'rxjs';

import { removeNumericIds, ResponseInterceptor } from './response.interceptor';

describe('ResponseInterceptor numeric ID removal', () => {
  it('removes numeric IDs recursively without changing UUID fields', () => {
    expect(
      removeNumericIds({
        id: 1,
        uuid: 'organization-uuid',
        organizationId: 2,
        organizationUuid: 'related-uuid',
        parentOrganizationId: null,
        organization_type_id: 3,
        sharedMediaTypeIds: '2,5',
        ro_ids: '10,12',
        stateIds: [1, 2],
        items: [{ id: 4, uuid: 'nested-uuid', name: 'Nested' }],
      }),
    ).toEqual({
      uuid: 'organization-uuid',
      organizationUuid: 'related-uuid',
      items: [{ uuid: 'nested-uuid', name: 'Nested' }],
    });
  });

  it('preserves non-numeric identifiers and unrelated payload fields', () => {
    expect(
      removeNumericIds({
        visitor_id: 'visitor-token',
        session_id: 'session-token',
        recordId: 'external-record',
        referenceIds: ['external-one', 'external-two'],
        count: 2,
      }),
    ).toEqual({
      visitor_id: 'visitor-token',
      session_id: 'session-token',
      recordId: 'external-record',
      referenceIds: ['external-one', 'external-two'],
      count: 2,
    });
  });

  it('sanitizes only response data while retaining the response envelope', async () => {
    const interceptor = new ResponseInterceptor();
    const result = await lastValueFrom(
      interceptor.intercept({} as never, {
        handle: () =>
          of({ message: 'Retrieved.', data: { id: 1, uuid: 'uuid' } }),
      }),
    );

    expect(result).toEqual({
      success: true,
      message: 'Retrieved.',
      data: { uuid: 'uuid' },
      timestamp: expect.any(String),
    });
  });

  it('replaces removed relationship IDs with their corresponding UUID fields', async () => {
    const prisma = {
      organization: {
        findMany: jest.fn().mockResolvedValue([
          { id: 2, uuid: 'organization-uuid' },
          { id: 10, uuid: 'ro-one-uuid' },
          { id: 12, uuid: 'ro-two-uuid' },
        ]),
      },
      contentType: {
        findMany: jest
          .fn()
          .mockResolvedValue([{ id: 3, uuid: 'content-type-uuid' }]),
      },
    } as never;
    const interceptor = new ResponseInterceptor(prisma);

    const result = await lastValueFrom(
      interceptor.intercept({} as never, {
        handle: () =>
          of({
            data: {
              id: 1,
              uuid: 'record-uuid',
              organizationId: 2,
              content_type_id: 3,
              parentOrganizationId: null,
              ro_ids: '10,12',
              title: 'Record',
            },
          }),
      }),
    );

    expect(result.data).toEqual({
      uuid: 'record-uuid',
      organizationUuid: 'organization-uuid',
      content_type_uuid: 'content-type-uuid',
      parentOrganizationUuid: null,
      ro_uuids: 'ro-one-uuid,ro-two-uuid',
      title: 'Record',
    });
  });
});
