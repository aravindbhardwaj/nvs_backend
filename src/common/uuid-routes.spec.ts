import 'reflect-metadata';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  METHOD_METADATA,
  PATH_METADATA,
  GUARDS_METADATA,
} from '@nestjs/common/constants';
import { REQUIRED_PERMISSIONS_KEY } from '../auth/decorators/require-permission.decorator';
import { ROLES_KEY } from '../auth/decorators/roles.decorator';
import { ORGANIZATION_OWNED_RESOURCE_KEY } from '../auth/decorators/organization-owned-resource.decorator';

const modules = [
  'banners',
  'gallery',
  'leadership',
  'media',
  'pages',
  'menus',
  'modals',
  'regions',
  'content-types',
  'organizations',
  'users',
  'permissions',
  'audit-logs',
  'user-permissions',
  'jnv-principals',
];
const routes: Array<{
  label: string;
  original: Function;
  alias: Function;
  path: string;
}> = [];
for (const module of modules) {
  const directory = join(__dirname, '..', module);
  for (const file of readdirSync(directory).filter((name) =>
    name.endsWith('.controller.ts'),
  )) {
    const exports = require(join(directory, file));
    for (const controller of Object.values(exports) as Array<{
      prototype: Record<string, Function>;
    }>) {
      if (!controller?.prototype) continue;
      for (const name of Object.getOwnPropertyNames(controller.prototype)) {
        const original = controller.prototype[name];
        const path = Reflect.getMetadata(PATH_METADATA, original);
        if (typeof path !== 'string' || !/:(id|userId)(\/|$)/.test(path))
          continue;
        routes.push({
          label: `${file}:${name}`,
          original,
          alias: controller.prototype[`${name}ByUuid`],
          path,
        });
      }
    }
  }
}

describe('UUID route coverage and access metadata', () => {
  it('covers all 78 remaining numeric resource routes', () =>
    expect(routes).toHaveLength(78));
  it.each(routes)(
    '$label retains verb and access policy',
    ({ original, alias, path }) => {
      expect(alias).toBeDefined();
      expect(Reflect.getMetadata(PATH_METADATA, alias)).toBe(
        path.replace(/:(id|userId)/, 'uuid/:uuid'),
      );
      for (const key of [
        METHOD_METADATA,
        GUARDS_METADATA,
        REQUIRED_PERMISSIONS_KEY,
        ROLES_KEY,
        ORGANIZATION_OWNED_RESOURCE_KEY,
      ]) {
        expect(Reflect.getMetadata(key, alias)).toEqual(
          Reflect.getMetadata(key, original),
        );
      }
    },
  );
});
