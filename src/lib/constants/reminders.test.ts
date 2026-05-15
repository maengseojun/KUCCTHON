import { describe, expect, it } from 'vitest';

import { formatReminderDays, normalizeReminderDays } from '@/lib/constants/reminders';

describe('reminders', () => {
  it('keeps only supported reminder days sorted and unique', () => {
    expect(normalizeReminderDays([7, 1, 7, 2, 30])).toEqual([1, 7, 30]);
  });

  it('formats reminder labels', () => {
    expect(formatReminderDays([3, 1, 7])).toBe('1일·3일·7일 전 알림');
  });
});
