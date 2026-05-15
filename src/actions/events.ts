'use server';

import { getEvents, insertEvent } from '@/lib/queries/events';
import { isValidDateKey } from '@/lib/calendar/dates';
import {
  EVENT_CATEGORIES,
  type CreateEventInput,
  type EventCategory,
  type EventWithTarget,
} from '@/types/event';

export type EventActionResult = {
  error: string | null;
  data?: EventWithTarget;
};

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function isEventCategory(value: string): value is EventCategory {
  return EVENT_CATEGORIES.includes(value as EventCategory);
}

function validateCreateEventInput(formData: FormData): CreateEventInput | EventActionResult {
  const targetId = readString(formData, 'target_id');
  const title = readString(formData, 'title');
  const eventDate = readString(formData, 'event_date');
  const category = readString(formData, 'category');
  const notifyDaysBefore = Number(readString(formData, 'notify_days_before') || '3');
  const memo = readString(formData, 'memo');

  if (!targetId) {
    return { error: '연결할 감사 대상을 선택해 주세요.' };
  }

  if (!title) {
    return { error: '일정 이름을 입력해 주세요.' };
  }

  if (!isValidDateKey(eventDate)) {
    return { error: '올바른 날짜를 선택해 주세요.' };
  }

  if (!isEventCategory(category)) {
    return { error: '일정 유형을 선택해 주세요.' };
  }

  if (!Number.isInteger(notifyDaysBefore) || notifyDaysBefore < 0 || notifyDaysBefore > 30) {
    return { error: '알림 기준일은 0일부터 30일 사이로 입력해 주세요.' };
  }

  return {
    target_id: targetId,
    title,
    event_date: eventDate,
    category,
    notify_days_before: notifyDaysBefore,
    recurs_yearly: formData.get('recurs_yearly') === 'on',
    memo: memo || null,
  };
}

export async function fetchEvents(): Promise<EventWithTarget[]> {
  return getEvents();
}

export async function createEvent(formData: FormData): Promise<EventActionResult> {
  const validated = validateCreateEventInput(formData);

  if ('error' in validated) {
    return validated;
  }

  try {
    const data = await insertEvent(validated);
    return { error: null, data };
  } catch {
    return { error: '일정 저장에 실패했습니다.' };
  }
}
