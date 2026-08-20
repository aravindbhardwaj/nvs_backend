import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type JnvSeed = {
  organizationCode: string;
  organizationName: string;
  parentOrganizationCode: string;
  regionCode: string | null;
  stateCode: string;
  address: string | null;
  organizationHindiName: string | null;
  districtId: number;
  estdYear: number | null;
  studentsCount: number | null;
  schoolUrl: string;
};

const EXPECTED_HEADERS = [
  'organizationCode',
  'organizationName',
  'parentOrganizationCode',
  'regionCode',
  'stateCode',
  'address',
  'organizationHindiName',
  'districtId',
  'estdYear',
  'studentsCount',
  'schoolUrl',
];

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let value = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '"') {
      if (inQuotes && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (character === ',' && !inQuotes) {
      values.push(value);
      value = '';
    } else {
      value += character;
    }
  }

  values.push(value);
  return values;
}

function nullable(value: string): string | null {
  return value === '' ? null : value;
}

export function readJnvSeeds(csv: string): JnvSeed[] {
  const [header, ...rows] = csv.trimEnd().split(/\r?\n/);
  if (
    !header ||
    JSON.stringify(parseCsvLine(header)) !== JSON.stringify(EXPECTED_HEADERS)
  ) {
    throw new Error('JNV seed CSV has unexpected headers.');
  }

  const jnvs = rows.map((row, index) => {
    const values = parseCsvLine(row);
    if (values.length !== EXPECTED_HEADERS.length) {
      throw new Error(`JNV seed CSV row ${index + 2} has an invalid column count.`);
    }

    const [
      organizationCode,
      organizationName,
      parentOrganizationCode,
      regionCode,
      stateCode,
      address,
      organizationHindiName,
      districtId,
      estdYear,
      studentsCount,
      schoolUrl,
    ] = values;
    return {
      organizationCode,
      organizationName,
      parentOrganizationCode,
      regionCode: nullable(regionCode),
      stateCode,
      address: nullable(address),
      organizationHindiName: nullable(organizationHindiName),
      districtId: Number(districtId),
      estdYear: nullable(estdYear) === null ? null : Number(estdYear),
      studentsCount:
        nullable(studentsCount) === null ? null : Number(studentsCount),
      schoolUrl,
    };
  });

  if (
    jnvs.length !== 664 ||
    jnvs.some(
      ({
        organizationCode,
        organizationName,
        parentOrganizationCode,
        stateCode,
        districtId,
        schoolUrl,
      }) =>
        organizationCode === '' ||
        organizationName === '' ||
        parentOrganizationCode === '' ||
        stateCode === '' ||
        !Number.isInteger(districtId) ||
        schoolUrl === '',
    ) ||
    new Set(jnvs.map(({ schoolUrl }) => schoolUrl)).size !== jnvs.length
  ) {
    throw new Error('JNV seed CSV does not contain 664 valid unique records.');
  }

  return jnvs;
}

export const JNVS = readJnvSeeds(
  readFileSync(join(__dirname, 'data', 'jnvs-enriched.csv'), 'utf8'),
);
