import type { EventCategory } from '@/types/event';
import type { TargetType } from '@/types/target';

export type SuggestedEvent = {
  label: string;
  category: EventCategory;
  requiresDate: boolean;
  fixedDate?: {
    month: number;
    day: number;
  };
  defaultNotifyDaysBefore: number[];
};

export const SUGGESTED_EVENTS: Record<TargetType, SuggestedEvent[]> = {
  partner: [
    {
      label: '생일',
      category: 'birthday',
      requiresDate: true,
      defaultNotifyDaysBefore: [3],
    },
    {
      label: '사귀기 시작한 날',
      category: 'anniversary',
      requiresDate: true,
      defaultNotifyDaysBefore: [7],
    },
  ],
  parent: [
    {
      label: '생일',
      category: 'birthday',
      requiresDate: true,
      defaultNotifyDaysBefore: [3],
    },
    {
      label: '결혼 기념일',
      category: 'anniversary',
      requiresDate: true,
      defaultNotifyDaysBefore: [7],
    },
  ],
  friend: [
    {
      label: '생일',
      category: 'birthday',
      requiresDate: true,
      defaultNotifyDaysBefore: [3],
    },
  ],
  other: [
    {
      label: '기념일',
      category: 'custom',
      requiresDate: true,
      defaultNotifyDaysBefore: [3],
    },
  ],
};
