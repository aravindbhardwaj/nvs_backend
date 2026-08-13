export const toCalendarDate = (value: string): Date =>
  new Date(`${value}T00:00:00.000Z`);

export const formatCalendarDate = (value: Date | null): string | null =>
  value?.toISOString().slice(0, 10) ?? null;

export const isInvalidDateRange = (
  startDate?: string | null,
  endDate?: string | null,
): boolean => Boolean(startDate && endDate && endDate < startDate);
