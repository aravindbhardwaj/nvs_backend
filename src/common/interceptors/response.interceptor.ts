import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { PrismaService } from '../../prisma/prisma.service';
import { ApiResponse } from '../responses/api-response.interface';

type UuidEntity =
  | 'organization'
  | 'organizationType'
  | 'region'
  | 'state'
  | 'district'
  | 'user'
  | 'contentType'
  | 'mediaType'
  | 'media'
  | 'menu'
  | 'gallery'
  | 'galleryImage'
  | 'banner'
  | 'page'
  | 'leader'
  | 'modal'
  | 'jnvPrincipal'
  | 'whoIsWho'
  | 'headerLogo'
  | 'organizationLeader'
  | 'auditLog'
  | 'permission';

type IdFieldMapping = {
  uuidKey: string;
  entity: UuidEntity;
  multiple?: boolean;
};

const ID_FIELD_MAPPINGS: Record<string, IdFieldMapping> = {
  organizationId: { uuidKey: 'organizationUuid', entity: 'organization' },
  organization_id: { uuidKey: 'organization_uuid', entity: 'organization' },
  parentOrganizationId: {
    uuidKey: 'parentOrganizationUuid',
    entity: 'organization',
  },
  parent_organization_id: {
    uuidKey: 'parent_organization_uuid',
    entity: 'organization',
  },
  organizationTypeId: {
    uuidKey: 'organizationTypeUuid',
    entity: 'organizationType',
  },
  organization_type_id: {
    uuidKey: 'organization_type_uuid',
    entity: 'organizationType',
  },
  regionId: { uuidKey: 'regionUuid', entity: 'region' },
  region_id: { uuidKey: 'region_uuid', entity: 'region' },
  roId: { uuidKey: 'roUuid', entity: 'region' },
  ro_id: { uuidKey: 'ro_uuid', entity: 'region' },
  roIds: { uuidKey: 'roUuids', entity: 'organization', multiple: true },
  ro_ids: { uuidKey: 'ro_uuids', entity: 'organization', multiple: true },
  jnvIds: { uuidKey: 'jnvUuids', entity: 'organization', multiple: true },
  jnv_ids: { uuidKey: 'jnv_uuids', entity: 'organization', multiple: true },
  stateId: { uuidKey: 'stateUuid', entity: 'state' },
  state_id: { uuidKey: 'state_uuid', entity: 'state' },
  stateIds: { uuidKey: 'stateUuids', entity: 'state', multiple: true },
  state_ids: { uuidKey: 'state_uuids', entity: 'state', multiple: true },
  districtId: { uuidKey: 'districtUuid', entity: 'district' },
  district_id: { uuidKey: 'district_uuid', entity: 'district' },
  userId: { uuidKey: 'userUuid', entity: 'user' },
  user_id: { uuidKey: 'user_uuid', entity: 'user' },
  createdById: { uuidKey: 'createdByUuid', entity: 'user' },
  created_by_id: { uuidKey: 'created_by_uuid', entity: 'user' },
  updatedById: { uuidKey: 'updatedByUuid', entity: 'user' },
  updated_by_id: { uuidKey: 'updated_by_uuid', entity: 'user' },
  deletedById: { uuidKey: 'deletedByUuid', entity: 'user' },
  deleted_by_id: { uuidKey: 'deleted_by_uuid', entity: 'user' },
  contentTypeId: { uuidKey: 'contentTypeUuid', entity: 'contentType' },
  content_type_id: { uuidKey: 'content_type_uuid', entity: 'contentType' },
  mediaTypeId: { uuidKey: 'mediaTypeUuid', entity: 'mediaType' },
  media_type_id: { uuidKey: 'media_type_uuid', entity: 'mediaType' },
  sharedMediaTypeIds: {
    uuidKey: 'sharedMediaTypeUuids',
    entity: 'mediaType',
    multiple: true,
  },
  shared_media_type_ids: {
    uuidKey: 'shared_media_type_uuids',
    entity: 'mediaType',
    multiple: true,
  },
  mediaId: { uuidKey: 'mediaUuid', entity: 'media' },
  media_id: { uuidKey: 'media_uuid', entity: 'media' },
  parentMenuId: { uuidKey: 'parentMenuUuid', entity: 'menu' },
  parent_menu_id: { uuidKey: 'parent_menu_uuid', entity: 'menu' },
  galleryId: { uuidKey: 'galleryUuid', entity: 'gallery' },
  gallery_id: { uuidKey: 'gallery_uuid', entity: 'gallery' },
  permissionId: { uuidKey: 'permissionUuid', entity: 'permission' },
  permission_id: { uuidKey: 'permission_uuid', entity: 'permission' },
  permissionIds: {
    uuidKey: 'permissionUuids',
    entity: 'permission',
    multiple: true,
  },
  permission_ids: {
    uuidKey: 'permission_uuids',
    entity: 'permission',
    multiple: true,
  },
};

const AUDIT_ENTITY_MAPPINGS: Record<string, UuidEntity> = {
  ORGANIZATION: 'organization',
  REGION: 'region',
  USER: 'user',
  CONTENT_TYPE: 'contentType',
  MEDIA_TYPE: 'mediaType',
  PAGE: 'page',
  MEDIA: 'media',
  BANNER: 'banner',
  GALLERY: 'gallery',
  GALLERY_IMAGE: 'galleryImage',
  LEADERSHIP: 'leader',
  MODAL: 'modal',
  JNV_PRINCIPAL: 'jnvPrincipal',
  WHO_IS_WHO: 'whoIsWho',
  HEADER_LOGO: 'headerLogo',
  ORGANIZATION_LEADERSHIP: 'organizationLeader',
  AUDIT_LOG: 'auditLog',
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false;
  const prototype = Object.getPrototypeOf(value) as object | null;
  return prototype === Object.prototype || prototype === null;
}

function isNumericIdField(key: string, value: unknown): boolean {
  const isIdField =
    key === 'id' ||
    key === 'ids' ||
    key.endsWith('Id') ||
    key.endsWith('Ids') ||
    key.endsWith('_id') ||
    key.endsWith('_ids');
  const isNumericIdValue =
    typeof value === 'number' ||
    value === null ||
    (typeof value === 'string' && /^\s*\d+(?:\s*,\s*\d+)*\s*$/.test(value)) ||
    (Array.isArray(value) && value.every((entry) => typeof entry === 'number'));
  return isIdField && isNumericIdValue;
}

export function removeNumericIds<T>(value: T): T {
  if (Array.isArray(value)) return value.map(removeNumericIds) as T;
  if (!isPlainObject(value)) return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key, entryValue]) => !isNumericIdField(key, entryValue))
      .map(([key, entryValue]) => [key, removeNumericIds(entryValue)]),
  ) as T;
}

function numericIds(value: unknown): number[] {
  if (typeof value === 'number') return [value];
  if (typeof value === 'string' && /^\s*\d+(?:\s*,\s*\d+)*\s*$/.test(value))
    return value.split(',').map((entry) => Number(entry.trim()));
  if (Array.isArray(value) && value.every((entry) => typeof entry === 'number'))
    return value;
  return [];
}

function collectUuidReferences(
  value: unknown,
  references: Map<UuidEntity, Set<number>>,
): void {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectUuidReferences(entry, references));
    return;
  }
  if (!isPlainObject(value)) return;

  const auditEntity =
    typeof value.entity === 'string'
      ? AUDIT_ENTITY_MAPPINGS[value.entity.toUpperCase()]
      : undefined;
  if (
    auditEntity &&
    value.entityUuid === undefined &&
    typeof value.entityId === 'number'
  ) {
    const entityReferences = references.get(auditEntity) ?? new Set();
    entityReferences.add(value.entityId);
    references.set(auditEntity, entityReferences);
  }

  for (const [key, entryValue] of Object.entries(value)) {
    const mapping = ID_FIELD_MAPPINGS[key];
    if (mapping && value[mapping.uuidKey] === undefined) {
      const ids = numericIds(entryValue);
      if (ids.length) {
        const entityReferences = references.get(mapping.entity) ?? new Set();
        ids.forEach((id) => entityReferences.add(id));
        references.set(mapping.entity, entityReferences);
      }
    }
    collectUuidReferences(entryValue, references);
  }
}

function addUuidFields<T>(
  value: T,
  uuidMaps: Map<UuidEntity, Map<number, string>>,
): T {
  if (Array.isArray(value))
    return (value as unknown[]).map((entry) =>
      addUuidFields(entry, uuidMaps),
    ) as unknown as T;
  if (!isPlainObject(value)) return value;

  const enriched: Record<string, unknown> = {};
  const auditEntity =
    typeof value.entity === 'string'
      ? AUDIT_ENTITY_MAPPINGS[value.entity.toUpperCase()]
      : undefined;
  if (
    auditEntity &&
    value.entityUuid === undefined &&
    typeof value.entityId === 'number'
  ) {
    const entityUuid = uuidMaps.get(auditEntity)?.get(value.entityId);
    if (entityUuid) enriched.entityUuid = entityUuid;
  }
  for (const [key, entryValue] of Object.entries(value)) {
    enriched[key] = addUuidFields(entryValue, uuidMaps);
    const mapping = ID_FIELD_MAPPINGS[key];
    if (!mapping || value[mapping.uuidKey] !== undefined) continue;

    if (entryValue === null) {
      enriched[mapping.uuidKey] = null;
      continue;
    }

    const ids = numericIds(entryValue);
    if (!ids.length) continue;
    const uuids = ids
      .map((id) => uuidMaps.get(mapping.entity)?.get(id))
      .filter((uuid): uuid is string => uuid !== undefined);
    if (uuids.length !== ids.length) continue;

    enriched[mapping.uuidKey] = mapping.multiple
      ? Array.isArray(entryValue)
        ? uuids
        : uuids.join(',')
      : uuids[0];
  }
  return enriched as T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  constructor(private readonly prisma?: PrismaService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      mergeMap(async (response: T) => {
        const responseObject = response as T & {
          data?: unknown;
          message?: string;
        };
        const data = responseObject?.data ?? response;
        const enrichedData = this.prisma
          ? await this.addResolvedUuidFields(data)
          : data;
        return {
          success: true,
          message: responseObject?.message ?? 'Success',
          data: removeNumericIds(enrichedData) as T,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  private async addResolvedUuidFields<TValue>(value: TValue): Promise<TValue> {
    const references = new Map<UuidEntity, Set<number>>();
    collectUuidReferences(value, references);
    const uuidMaps = new Map<UuidEntity, Map<number, string>>();

    await Promise.all(
      [...references].map(async ([entity, ids]) => {
        const records = await this.findUuidRecords(entity, [...ids]);
        uuidMaps.set(
          entity,
          new Map(records.map((record) => [record.id, record.uuid])),
        );
      }),
    );

    return addUuidFields(value, uuidMaps);
  }

  private findUuidRecords(
    entity: UuidEntity,
    ids: number[],
  ): Promise<Array<{ id: number; uuid: string }>> {
    const args = {
      where: { id: { in: ids } },
      select: { id: true, uuid: true },
    };
    switch (entity) {
      case 'organization':
        return this.prisma!.organization.findMany(args);
      case 'organizationType':
        return this.prisma!.organizationType.findMany(args);
      case 'region':
        return this.prisma!.region.findMany(args);
      case 'state':
        return this.prisma!.state.findMany(args);
      case 'district':
        return this.prisma!.district.findMany(args);
      case 'user':
        return this.prisma!.user.findMany(args);
      case 'contentType':
        return this.prisma!.contentType.findMany(args);
      case 'mediaType':
        return this.prisma!.mediaType.findMany(args);
      case 'media':
        return this.prisma!.media.findMany(args);
      case 'menu':
        return this.prisma!.menu.findMany(args);
      case 'gallery':
        return this.prisma!.gallery.findMany(args);
      case 'galleryImage':
        return this.prisma!.galleryImage.findMany(args);
      case 'banner':
        return this.prisma!.banner.findMany(args);
      case 'page':
        return this.prisma!.page.findMany(args);
      case 'leader':
        return this.prisma!.leader.findMany(args);
      case 'modal':
        return this.prisma!.modal.findMany(args);
      case 'jnvPrincipal':
        return this.prisma!.jnvPrincipal.findMany(args);
      case 'whoIsWho':
        return this.prisma!.whoIsWho.findMany(args);
      case 'headerLogo':
        return this.prisma!.headerLogo.findMany(args);
      case 'organizationLeader':
        return this.prisma!.organizationLeader.findMany(args);
      case 'auditLog':
        return this.prisma!.auditLog.findMany(args);
      case 'permission':
        return this.prisma!.permission.findMany(args);
    }
  }
}
