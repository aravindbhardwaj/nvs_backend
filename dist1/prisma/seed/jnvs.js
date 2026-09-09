"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JNVS = void 0;
exports.readJnvSeeds = readJnvSeeds;
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
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
function nullable(value) {
    return value === '' ? null : value;
}
function readJnvSeeds(csv) {
    const [header, ...rows] = csv.trimEnd().split(/\r?\n/);
    if (!header ||
        JSON.stringify(parseCsvLine(header)) !== JSON.stringify(EXPECTED_HEADERS)) {
        throw new Error('JNV seed CSV has unexpected headers.');
    }
    const jnvs = rows.map((row, index) => {
        const values = parseCsvLine(row);
        if (values.length !== EXPECTED_HEADERS.length) {
            throw new Error(`JNV seed CSV row ${index + 2} has an invalid column count.`);
        }
        const [organizationCode, organizationName, parentOrganizationCode, regionCode, stateCode, address, organizationHindiName, districtId, estdYear, studentsCount, schoolUrl,] = values;
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
            studentsCount: nullable(studentsCount) === null ? null : Number(studentsCount),
            schoolUrl,
        };
    });
    if (jnvs.length !== 664 ||
        jnvs.some(({ organizationCode, organizationName, parentOrganizationCode, stateCode, districtId, schoolUrl, }) => organizationCode === '' ||
            organizationName === '' ||
            parentOrganizationCode === '' ||
            stateCode === '' ||
            !Number.isInteger(districtId) ||
            schoolUrl === '') ||
        new Set(jnvs.map(({ schoolUrl }) => schoolUrl)).size !== jnvs.length) {
        throw new Error('JNV seed CSV does not contain 664 valid unique records.');
    }
    return jnvs;
}
exports.JNVS = readJnvSeeds((0, node_fs_1.readFileSync)((0, node_path_1.join)(__dirname, 'data', 'jnvs-enriched.csv'), 'utf8'));
//# sourceMappingURL=jnvs.js.map