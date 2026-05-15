import { AUTOMATIC_ANNIVERSARY_PRESETS } from '@/lib/constants/automatic-events';
import {
  getYearlyOccurrenceDate,
  getYearlyOccurrenceOnOrAfter,
  toDateKey,
} from '@/lib/dates/date-key';
import type { EventCategory, EventWithTarget } from '@/types/event';
import type { Target } from '@/types/target';

export type ScheduleEvent = Omit<EventWithTarget, 'created_at'> & {
  created_at?: string;
  isAutomatic?: boolean;
};

type AutomaticEventInput = {
  id: string;
  target: Target;
  title: string;
  eventDate: string;
  category: EventCategory;
  recursYearly: boolean;
  notifyDaysBefore: number[];
};

function addDays(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function addYears(dateKey: string, years: number) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  date.setUTCFullYear(date.getUTCFullYear() + years);
  return date.toISOString().slice(0, 10);
}

function buildAutomaticEvent(input: AutomaticEventInput): ScheduleEvent {
  return {
    id: input.id,
    user_id: input.target.user_id,
    target_id: input.target.id,
    title: input.title,
    event_date: input.eventDate,
    category: input.category,
    recurs_yearly: input.recursYearly,
    notify_days_before: input.notifyDaysBefore,
    memo: null,
    target: {
      id: input.target.id,
      name: input.target.name,
      type: input.target.type,
    },
    isAutomatic: true,
  };
}

export function getAutomaticEventsForTarget(target: Target): ScheduleEvent[] {
  const events: ScheduleEvent[] = [];

  if (target.birthday) {
    events.push(
      buildAutomaticEvent({
        id: `auto:birthday:${target.id}`,
        target,
        title: `${target.name} 생일`,
        eventDate: target.birthday,
        category: 'birthday',
        recursYearly: true,
        notifyDaysBefore: [3],
      })
    );
  }

  if (target.type === 'parent' && target.marriage_anniversary) {
    events.push(
      buildAutomaticEvent({
        id: `auto:marriage:${target.id}`,
        target,
        title: `${target.name} 결혼 기념일`,
        eventDate: target.marriage_anniversary,
        category: 'anniversary',
        recursYearly: true,
        notifyDaysBefore: [7],
      })
    );
  }

  if (target.type === 'partner' && target.relationship_started_on) {
    for (let days = 100; days <= 1000; days += 100) {
      events.push(
        buildAutomaticEvent({
          id: `auto:relationship-days:${target.id}:${days}`,
          target,
          title: `${target.name} ${days}일`,
          eventDate: addDays(target.relationship_started_on, days - 1),
          category: 'anniversary',
          recursYearly: false,
          notifyDaysBefore: [7],
        })
      );
    }

    for (let years = 1; years <= 10; years += 1) {
      events.push(
        buildAutomaticEvent({
          id: `auto:relationship-years:${target.id}:${years}`,
          target,
          title: `${target.name} ${years}주년`,
          eventDate: addYears(target.relationship_started_on, years),
          category: 'anniversary',
          recursYearly: false,
          notifyDaysBefore: [7],
        })
      );
    }
  }

  AUTOMATIC_ANNIVERSARY_PRESETS.filter((preset) =>
    preset.targetTypes.includes(target.type)
  ).forEach((preset) => {
    events.push(
      buildAutomaticEvent({
        id: `auto:seasonal:${target.id}:${preset.month}-${preset.day}`,
        target,
        title: `${target.name} ${preset.label}`,
        eventDate: toDateKey(2000, preset.month, preset.day),
        category: 'anniversary',
        recursYearly: true,
        notifyDaysBefore: preset.notifyDaysBefore,
      })
    );
  });

  return events;
}

export function mergeScheduleEvents(events: ScheduleEvent[], fromDate?: string): ScheduleEvent[] {
  const merged = new Map<string, ScheduleEvent>();

  events.forEach((event) => {
    const eventDate = event.recurs_yearly
      ? fromDate
        ? getYearlyOccurrenceOnOrAfter(event.event_date, fromDate)
        : event.event_date
      : event.event_date;
    const key = `${event.target_id}:${event.category}:${eventDate}`;
    const normalized = { ...event, event_date: eventDate };
    const existing = merged.get(key);

    if (!existing || (existing.isAutomatic && !event.isAutomatic)) {
      merged.set(key, normalized);
    }
  });

  return [...merged.values()].sort((a, b) => a.event_date.localeCompare(b.event_date));
}

export function getScheduleEventsForTarget(
  target: Target,
  events: EventWithTarget[],
  fromDate?: string
) {
  return mergeScheduleEvents([...getAutomaticEventsForTarget(target), ...events], fromDate);
}

export function getScheduleEventsForTargets(
  targets: Target[],
  events: EventWithTarget[],
  year?: number
) {
  const targetById = new Map(targets.map((target) => [target.id, target]));
  const automaticEvents = targets.flatMap(getAutomaticEventsForTarget);
  const allEvents = [...automaticEvents, ...events];
  const merged = mergeScheduleEvents(allEvents);

  if (!year) {
    return merged;
  }

  return merged
    .map((event) => ({
      ...event,
      event_date: event.recurs_yearly
        ? getYearlyOccurrenceDate(event.event_date, year)
        : event.event_date,
      target: event.target ?? targetById.get(event.target_id) ?? null,
    }))
    .filter((event) => event.event_date.startsWith(String(year)))
    .sort((a, b) => a.event_date.localeCompare(b.event_date));
}
