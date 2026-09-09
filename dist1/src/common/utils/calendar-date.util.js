"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInvalidDateRange = exports.formatCalendarDate = exports.toCalendarDate = void 0;
const toCalendarDate = (value) => new Date(`${value}T00:00:00.000Z`);
exports.toCalendarDate = toCalendarDate;
const formatCalendarDate = (value) => value?.toISOString().slice(0, 10) ?? null;
exports.formatCalendarDate = formatCalendarDate;
const isInvalidDateRange = (startDate, endDate) => Boolean(startDate && endDate && endDate < startDate);
exports.isInvalidDateRange = isInvalidDateRange;
//# sourceMappingURL=calendar-date.util.js.map