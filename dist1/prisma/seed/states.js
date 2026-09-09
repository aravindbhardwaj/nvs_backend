"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATES = void 0;
exports.readStateSeeds = readStateSeeds;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const EXPECTED_HEADERS = [
    'state_id',
    'state_name',
    'state_code',
    'is_active',
    'ro_id',
    'iso_code',
];
function parseCsvLine(line) {
    const values = [];
    let value = '';
    let inQuotes = false;
    for (let index = 0; index < line.length; index += 1) {
        const character = line[index];
        if (character === '"') {
            if (inQuotes && line[index + 1] === '"') {
                value += '"';
                index += 1;
            }
            else {
                inQuotes = !inQuotes;
            }
        }
        else if (character === ',' && !inQuotes) {
            values.push(value);
            value = '';
        }
        else {
            value += character;
        }
    }
    values.push(value);
    return values;
}
function readStateSeeds(csv) {
    const [header, ...rows] = csv.trimEnd().split(/\r?\n/);
    if (!header ||
        JSON.stringify(parseCsvLine(header)) !== JSON.stringify(EXPECTED_HEADERS)) {
        throw new Error('State seed CSV has unexpected headers.');
    }
    const states = rows.map((row, index) => {
        const values = parseCsvLine(row);
        if (values.length !== EXPECTED_HEADERS.length) {
            throw new Error(`State seed CSV row ${index + 2} has an invalid column count.`);
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
    if (states.length !== 36 ||
        states.some(({ id, stateCode, roId }) => !Number.isInteger(id) ||
            stateCode === '' ||
            (roId !== null && !Number.isInteger(roId))) ||
        new Set(states.map(({ id }) => id)).size !== states.length ||
        new Set(states.map(({ stateCode }) => stateCode)).size !== states.length ||
        new Set(states.map(({ isoCode }) => isoCode)).size !== states.length) {
        throw new Error('State seed CSV does not contain 36 valid unique records.');
    }
    return states;
}
exports.STATES = readStateSeeds((0, node_fs_1.readFileSync)((0, node_path_1.join)(__dirname, 'data', 'states.csv'), 'utf8'));
//# sourceMappingURL=states.js.map