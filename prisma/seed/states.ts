import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export type StateSeed = {
  id: number;
  stateName: string;
  stateCode: string;
  isActive: boolean;
  roId: number | null;
  isoCode: string;
};

const EXPECTED_HEADERS = [
  'state_id',
  'state_name',
  'state_code',
  'is_active',
  'ro_id',
  'iso_code',
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

export function readStateSeeds(csv: string): StateSeed[] {
  const [header, ...rows] = csv.trimEnd().split(/\r?\n/);
  if (
    !header ||
    JSON.stringify(parseCsvLine(header)) !== JSON.stringify(EXPECTED_HEADERS)
  ) {
    throw new Error('State seed CSV has unexpected headers.');
  }

  const states = rows.map((row, index) => {
    const values = parseCsvLine(row);
    if (values.length !== EXPECTED_HEADERS.length) {
      throw new Error(
        `State seed CSV row ${index + 2} has an invalid column count.`,
      );
    }

    const [id, stateName, stateCode, isActive, roId, isoCode] = values;
    return {
      id: Number(id),
      stateName,
      stateCode,
      isActive: isActive === 'true',
      roId: roId === '' ? null : Number(roId),
      isoCode,
    };
  });

  if (
    states.length !== 36 ||
    states.some(
      ({ id, stateCode, roId }) =>
        !Number.isInteger(id) ||
        stateCode === '' ||
        (roId !== null && !Number.isInteger(roId)),
    ) ||
    new Set(states.map(({ id }) => id)).size !== states.length ||
    new Set(states.map(({ stateCode }) => stateCode)).size !== states.length ||
    new Set(states.map(({ isoCode }) => isoCode)).size !== states.length
  ) {
    throw new Error('State seed CSV does not contain 36 valid unique records.');
  }

  return states;
}

export const STATES = readStateSeeds(
  readFileSync(join(__dirname, 'data', 'states.csv'), 'utf8'),
);
