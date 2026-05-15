import { getStaticKoreanPublicHolidays } from '@/lib/constants/holidays';
import { getYearlyOccurrenceDate, isValidDateKey, toDateKey } from '@/lib/dates/date-key';
import { getScheduleEventsForTargets } from '@/lib/schedule/automatic-events';
import type { EventWithTarget } from '@/types/event';
import type { Target } from '@/types/target';

export { getYearlyOccurrenceDate, isValidDateKey, toDateKey };

export type CalendarItemType = 'event' | 'holiday';

export type CalendarItem = {
  id: string;
  type: CalendarItemType;
  date: string;
  title: string;
  targetId?: string;
  targetName?: string;
};

export function getCalendarItemsForYear(
  year: number,
  targets: Target[],
  events: EventWithTarget[]
): CalendarItem[] {
  const scheduleEvents = getScheduleEventsForTargets(targets, events, year).map((event) => ({
    id: event.id,
    type: 'event' as const,
    date: event.event_date,
    title: event.title,
    targetId: event.target_id,
    targetName: event.target?.name ?? undefined,
  }));

  const holidays = getStaticKoreanPublicHolidays(year).map((holiday) => ({
    id: `holiday:${holiday.date}:${holiday.name}`,
    type: 'holiday' as const,
    date: holiday.date,
    title: holiday.name,
  }));

  return [...scheduleEvents, ...holidays].sort((a, b) => a.date.localeCompare(b.date));
}
