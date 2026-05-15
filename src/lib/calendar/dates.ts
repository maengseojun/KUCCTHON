import { CELEBRATION_DAYS } from '@/lib/constants/celebrations';
import { getStaticKoreanPublicHolidays } from '@/lib/constants/holidays';
import type { EventWithTarget } from '@/types/event';
import type { Target } from '@/types/target';

export type CalendarItemType = 'event' | 'celebration' | 'holiday';

export type CalendarItem = {
  id: string;
  type: CalendarItemType;
  date: string;
  title: string;
  targetId?: string;
  targetName?: string;
};

function pad2(value: number) {
  return value.toString().padStart(2, '0');
}

export function toDateKey(year: number, month: number, day: number) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function isValidDateKey(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  return (
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day)
  );
}

export function getYearlyOccurrenceDate(eventDate: string, year: number) {
  const [, month, day] = eventDate.split('-').map(Number);
  return toDateKey(year, month, day);
}

export function getCalendarItemsForYear(
  year: number,
  targets: Target[],
  events: EventWithTarget[]
): CalendarItem[] {
  const personalEvents = events.map((event) => ({
    id: event.id,
    type: 'event' as const,
    date: event.recurs_yearly ? getYearlyOccurrenceDate(event.event_date, year) : event.event_date,
    title: event.title,
    targetId: event.target_id,
    targetName: event.target?.name ?? undefined,
  }));

  const celebrations = targets.flatMap((target) =>
    CELEBRATION_DAYS.filter((celebration) => celebration.applicableTypes.includes(target.type)).map(
      (celebration) => ({
        id: `celebration:${target.id}:${celebration.month}-${celebration.day}`,
        type: 'celebration' as const,
        date: toDateKey(year, celebration.month, celebration.day),
        title: `${target.name} - ${celebration.name}`,
        targetId: target.id,
        targetName: target.name,
      })
    )
  );

  const holidays = getStaticKoreanPublicHolidays(year).map((holiday) => ({
    id: `holiday:${holiday.date}:${holiday.name}`,
    type: 'holiday' as const,
    date: holiday.date,
    title: holiday.name,
  }));

  return [...personalEvents, ...celebrations, ...holidays].sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}
