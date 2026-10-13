import { MediaSourceType, Role } from '@prisma/client';

import { MediaService } from './media.service';

const actor = {
  id: 7,
  email: 'admin@nvs.gov.in',
  role: Role.SUPER_ADMIN,
  organizationId: 1,
};

function media(overrides: Record<string, unknown> = {}) {
  const now = new Date('2026-01-01T00:00:00.000Z');
  return {
    id: 10,
    uuid: '11111111-1111-4111-8111-111111111111',
    organizationId: 1,
    mediaTypeId: 2,
    sourceType: MediaSourceType.FILE,
    externalUrl: null,
    titleEnglish: 'Archive test',
    titleHindi: null,
    descriptionEnglish: null,
    descriptionHindi: null,
    originalFilename: 'archive.pdf',
    storedFilename: 'archive-stored.pdf',
    filePath: 'media/archive-stored.pdf',
    mimeType: 'application/pdf',
    extension: 'pdf',
    fileSize: BigInt(100),
    checksum: 'checksum',
    hindiOriginalFilename: null,
    hindiStoredFilename: null,
    hindiFilePath: null,
    hindiMimeType: null,
    hindiExtension: null,
    hindiFileSize: null,
    hindiChecksum: null,
    display_order: 0,
    isActive: true,
    isNew: null,
    visibleToAll: true,
    roIds: null,
    jnvIds: null,
    sharedMediaTypeIds: null,
    importantLink1: null,
    importantLink2: null,
    importantLink3: null,
    startDate: null,
    endDate: null,
    uploadedAt: now,
    createdAt: now,
    updatedAt: now,
    createdById: 7,
    updatedById: 7,
    isDeleted: false,
    deletedAt: null,
    deletedById: null,
    isArchived: false,
    archivedAt: null,
    archivedById: null,
    ...overrides,
  };
}

describe('MediaService archival', () => {
  const transaction = {
    media: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    auditLog: { create: jest.fn() },
  };
  const prisma = {
    user: { findFirst: jest.fn() },
    media: { findMany: jest.fn(), count: jest.fn() },
    mediaType: { findMany: jest.fn().mockResolvedValue([]) },
    organization: { findFirst: jest.fn() },
    $transaction: jest.fn(),
  };
  const ownership = { assertAccess: jest.fn() };
  const service = new MediaService(prisma as never, ownership);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.mediaType.findMany.mockResolvedValue([]);
    prisma.$transaction.mockImplementation((value) =>
      typeof value === 'function' ? value(transaction) : Promise.all(value),
    );
  });

  it('archives one record atomically and writes the existing audit log', async () => {
    const existing = media();
    const archived = media({
      isArchived: true,
      archivedAt: new Date('2026-10-13T00:00:00.000Z'),
      archivedById: actor.id,
    });
    transaction.media.findFirst.mockResolvedValue(existing);
    transaction.media.update.mockResolvedValue(archived);

    const result = await service.archiveByUuid(existing.uuid, actor);

    expect(ownership.assertAccess).toHaveBeenCalledWith(1, actor);
    expect(transaction.media.update).toHaveBeenCalledWith({
      where: { id: existing.id },
      data: expect.objectContaining({
        isArchived: true,
        archivedById: actor.id,
        updatedById: actor.id,
      }),
    });
    expect(transaction.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: actor.id,
        module: 'MEDIA',
        action: 'ARCHIVE',
        entityId: existing.id,
      }),
    });
    expect(result).toEqual(
      expect.objectContaining({
        uuid: existing.uuid,
        is_archived: true,
        archived_by: actor.id,
      }),
    );
  });

  it('treats repeated archive requests as idempotent', async () => {
    transaction.media.findFirst.mockResolvedValue(
      media({ isArchived: true, archivedAt: new Date(), archivedById: 7 }),
    );

    await service.archiveByUuid('11111111-1111-4111-8111-111111111111', actor);

    expect(transaction.media.update).not.toHaveBeenCalled();
    expect(transaction.auditLog.create).not.toHaveBeenCalled();
  });

  it('restores archived media without changing the physical file metadata', async () => {
    const existing = media({
      isArchived: true,
      archivedAt: new Date(),
      archivedById: 7,
    });
    const restored = media();
    transaction.media.findFirst.mockResolvedValue(existing);
    transaction.media.update.mockResolvedValue(restored);

    const result = await service.restoreArchivedByUuid(existing.uuid, actor);

    expect(transaction.media.update).toHaveBeenCalledWith({
      where: { id: existing.id },
      data: {
        isArchived: false,
        archivedAt: null,
        archivedById: null,
        updatedById: actor.id,
      },
    });
    expect(transaction.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: 'RESTORE' }),
    });
    expect(result.is_archived).toBe(false);
    expect(result.originalFilename).toBe(existing.originalFilename);
  });

  it('automatically archives eligible active records in batches', async () => {
    const existing = media({ updatedAt: new Date('2026-01-01T00:00:00.000Z') });
    const archived = media({
      isArchived: true,
      archivedAt: new Date(),
      archivedById: 99,
      updatedById: 99,
    });
    prisma.user.findFirst.mockResolvedValue({ id: 99 });
    transaction.media.findMany
      .mockResolvedValueOnce([existing])
      .mockResolvedValueOnce([]);
    transaction.media.updateMany.mockResolvedValue({ count: 1 });
    transaction.media.findUniqueOrThrow.mockResolvedValue(archived);

    await expect(
      service.archiveEligibleMedia(
        new Date('2026-07-13T00:00:00.000Z'),
        99,
        10,
      ),
    ).resolves.toBe(1);

    expect(transaction.media.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isArchived: false,
          isDeleted: false,
          updatedAt: { lte: new Date('2026-07-13T00:00:00.000Z') },
        },
        take: 10,
      }),
    );
    expect(transaction.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: 99, action: 'ARCHIVE' }),
    });
  });

  it('rejects an invalid automatic-archival system user', async () => {
    prisma.user.findFirst.mockResolvedValue(null);

    await expect(
      service.archiveEligibleMedia(new Date(), 999, 10),
    ).rejects.toThrow(
      'MEDIA_ARCHIVE_SYSTEM_USER_ID must identify an active user.',
    );

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('keeps existing public queries active-only by default', async () => {
    const where = await (service as any).publicWhere({});

    expect(where).toEqual(
      expect.objectContaining({ isDeleted: false, isArchived: false }),
    );
  });

  it('returns archived public media only when explicitly requested', async () => {
    const where = await (service as any).publicWhere({ is_archived: true });

    expect(where).toEqual(
      expect.objectContaining({
        isDeleted: false,
        isArchived: true,
        AND: expect.any(Array),
      }),
    );
    expect(where.AND).not.toEqual(
      expect.arrayContaining([
        { OR: [{ startDate: null }, { startDate: expect.anything() }] },
      ]),
    );
  });

  it('adds the archive flag to archived public download URLs', () => {
    const response = (service as any).toArchivedPublicResponse(
      media({ isArchived: true, archivedAt: new Date(), archivedById: 99 }),
    );

    expect(response.download_url).toContain('is_archived=true');
    expect(response.is_archived).toBe(true);
    expect(response.archived_by).toBe(99);
  });
});
