import type { Target } from '@/types/target';

export const EVENT_CATEGORIES = ['birthday', 'anniversary', 'memorial', 'custom'] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  birthday: '생일',
  anniversary: '기념일',
  memorial: '공통 기념일',
  custom: '직접 입력',
};

export type Event = {
  id: string;
  user_id: string;
  target_id: string;
  title: string;
  event_date: string;
  category: EventCategory;
  recurs_yearly: boolean;
  notify_days_before: number[];
  memo: string | null;
  created_at: string;
};

export type EventWithTarget = Event & {
  target: Pick<Target, 'id' | 'name' | 'type'> | null;
};

export type CreateEventInput = {
  target_id: string;
  title: string;
  event_date: string;
  category: EventCategory;
  recurs_yearly?: boolean;
  notify_days_before?: number[];
  memo?: string | null;
};
