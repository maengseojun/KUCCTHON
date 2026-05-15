export const REMINDER_DAY_OPTIONS = [1, 3, 7, 10, 30] as const;

export type ReminderDay = (typeof REMINDER_DAY_OPTIONS)[number];

export function isReminderDay(value: number): value is ReminderDay {
  return REMINDER_DAY_OPTIONS.includes(value as ReminderDay);
}

export function normalizeReminderDays(values: number[]) {
  return [
    ...new Set(values.filter((value) => Number.isInteger(value) && isReminderDay(value))),
  ].sort((a, b) => a - b);
}

export function formatReminderDays(values: number[]) {
  const normalized = normalizeReminderDays(values);

  if (normalized.length === 0) {
    return '알림 없음';
  }

  return `${normalized.map((value) => `${value}일`).join('·')} 전 알림`;
}
