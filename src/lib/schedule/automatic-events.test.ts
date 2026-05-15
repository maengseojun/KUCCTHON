import { describe, expect, it } from 'vitest';

import {
  getAutomaticEventsForTarget,
  getScheduleEventsForTarget,
} from '@/lib/schedule/automatic-events';
import type { EventWithTarget } from '@/types/event';
import type { Target } from '@/types/target';

const baseTarget: Target = {
  id: 'target-1',
  user_id: 'user-1',
  name: '지수',
  type: 'partner',
  memo: null,
  birthday: '2000-05-16',
  marriage_anniversary: null,
  relationship_started_on: '2026-01-01',
  thank_you_count: 0,
  created_at: '2026-01-01T00:00:00.000Z',
};

describe('automatic events', () => {
  it('creates birthday, 100-day milestones, and yearly relationship anniversaries', () => {
    const events = getAutomaticEventsForTarget(baseTarget);

    expect(
      events.some((event) => event.title === '지수 생일' && event.notify_days_before[0] === 3)
    ).toBe(true);
    expect(
      events.some((event) => event.title === '지수 100일' && event.event_date === '2026-04-10')
    ).toBe(true);
    expect(
      events.some((event) => event.title === '지수 1주년' && event.event_date === '2027-01-01')
    ).toBe(true);
  });

  it('prefers a manual event when it overlaps an automatic event for the same target/category/date', () => {
    const manualEvent: EventWithTarget = {
      id: 'manual-1',
      user_id: 'user-1',
      target_id: 'target-1',
      title: '직접 저장한 생일',
      event_date: '2000-05-16',
      category: 'birthday',
      recurs_yearly: true,
      notify_days_before: [10],
      memo: null,
      created_at: '2026-01-01T00:00:00.000Z',
      target: { id: 'target-1', name: '지수', type: 'partner' },
    };

    const events = getScheduleEventsForTarget(baseTarget, [manualEvent], '2026-01-01');

    expect(events.find((event) => event.event_date === '2026-05-16')?.title).toBe(
      '직접 저장한 생일'
    );
  });
});
