import type { TargetType } from '@/types/target';

export type AutomaticAnniversaryPreset = {
  label: string;
  month: number;
  day: number;
  targetTypes: TargetType[];
  notifyDaysBefore: number[];
};

export const AUTOMATIC_ANNIVERSARY_PRESETS: AutomaticAnniversaryPreset[] = [
  {
    label: '발렌타인데이',
    month: 2,
    day: 14,
    targetTypes: ['parent', 'partner'],
    notifyDaysBefore: [3],
  },
  {
    label: '화이트데이',
    month: 3,
    day: 14,
    targetTypes: ['parent', 'partner'],
    notifyDaysBefore: [3],
  },
  {
    label: '어버이날',
    month: 5,
    day: 8,
    targetTypes: ['parent'],
    notifyDaysBefore: [3],
  },
  {
    label: '로즈데이',
    month: 5,
    day: 14,
    targetTypes: ['parent', 'partner'],
    notifyDaysBefore: [3],
  },
  {
    label: '키스데이',
    month: 6,
    day: 14,
    targetTypes: ['partner'],
    notifyDaysBefore: [3],
  },
  {
    label: '빼빼로데이',
    month: 11,
    day: 11,
    targetTypes: ['parent', 'partner'],
    notifyDaysBefore: [3],
  },
  {
    label: '허그데이',
    month: 12,
    day: 14,
    targetTypes: ['partner'],
    notifyDaysBefore: [3],
  },
];
