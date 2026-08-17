import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type DistrictSeed = {
  id: number;
  districtName: string;
  districtCode: string;
  stateId: number;
  isActive: boolean;
  languageId: number | null;
  oldDistrictCode: string | null;
  oldDistrictName: string | null;
  roId: number | null;
};

const EXPECTED_HEADERS = [
  'dist_id',
  'dist_name',
  'dist_code',
  'state_id',
  'is_active',
  'lang_id',
  'old_dist_code',
  'old_dist_name',
  'ro_id',
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

export function readDistrictSeeds(csv: string): DistrictSeed[] {
  const [header, ...rows] = csv.trimEnd().split(/\r?\n/);
  if (
    !header ||
    JSON.stringify(parseCsvLine(header)) !== JSON.stringify(EXPECTED_HEADERS)
  ) {
    throw new Error('District seed CSV has unexpected headers.');
  }

  const districts = rows.map((row, index) => {
    const values = parseCsvLine(row);
    if (values.length !== EXPECTED_HEADERS.length) {
      throw new Error(
        `District seed CSV row ${index + 2} has an invalid column count.`,
      );
    }

    const [
      id,
      districtName,
      districtCode,
      stateId,
      isActive,
      languageId,
      oldDistrictCode,
      oldDistrictName,
      roId,
    ] = values;
    return {
      id: Number(id),
      districtName,
      districtCode,
      stateId: Number(stateId),
      isActive: isActive === 'true',
      languageId: nullable(languageId) === null ? null : Number(languageId),
      oldDistrictCode: nullable(oldDistrictCode),
      oldDistrictName: nullable(oldDistrictName),
      roId: nullable(roId) === null ? null : Number(roId),
    };
  });

  if (
    districts.length !== 666 ||
    districts.some(
      ({ id, stateId }) => !Number.isInteger(id) || !Number.isInteger(stateId),
    )
  ) {
    throw new Error(
      'District seed CSV does not contain the expected 666 valid records.',
    );
  }

  return districts;
}

export const DISTRICTS = readDistrictSeeds(
  readFileSync(join(__dirname, 'data', 'districts.csv'), 'utf8'),
);
