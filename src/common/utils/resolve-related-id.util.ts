import { BadRequestException, NotFoundException } from '@nestjs/common';

type RelatedRecord = { id: number } | null;

export async function resolveRelatedId(
  id: number | null | undefined,
  uuid: string | null | undefined,
  label: string,
  findByUuid: (uuid: string) => Promise<RelatedRecord>,
): Promise<number | undefined> {
  if (!uuid) return id ?? undefined;

  const record = await findByUuid(uuid);
  if (!record) throw new NotFoundException(`${label} not found.`);
  if (id !== undefined && id !== null && id !== record.id) {
    throw new BadRequestException(
      `${label} ID and UUID refer to different records.`,
    );
  }
  return record.id;
}

export async function resolveRelatedIds(
  ids: number[] | undefined,
  uuids: string[] | undefined,
  label: string,
  findByUuids: (
    uuids: string[],
  ) => Promise<Array<{ id: number; uuid: string }>>,
): Promise<number[] | undefined> {
  if (!uuids) return ids;
  const uniqueUuids = [...new Set(uuids)];
  const records = await findByUuids(uniqueUuids);
  if (records.length !== uniqueUuids.length)
    throw new NotFoundException(`One or more ${label} UUIDs were not found.`);

  const resolvedIds = records.map((record) => record.id);
  if (
    ids &&
    (ids.length !== resolvedIds.length ||
      ids.some((id) => !resolvedIds.includes(id)))
  )
    throw new BadRequestException(
      `${label} IDs and UUIDs refer to different records.`,
    );
  return resolvedIds;
}

export function parseUuidList(value: string, field: string): string[] {
  const uuids = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuids.length || uuids.some((uuid) => !uuidPattern.test(uuid)))
    throw new BadRequestException(
      `${field} must be a comma-separated list of UUIDs.`,
    );
  return [...new Set(uuids)];
}
