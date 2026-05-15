import type { TargetType } from '@/types/target';

export type CelebrationDay = {
  month: number;
  day: number;
  name: string;
  applicableTypes: TargetType[];
};

export const CELEBRATION_DAYS: CelebrationDay[] = [
  { month: 2, day: 14, name: '발렌타인데이', applicableTypes: ['parent', 'partner'] },
  { month: 3, day: 14, name: '화이트데이', applicableTypes: ['parent', 'partner'] },
  { month: 5, day: 8, name: '어버이날', applicableTypes: ['parent'] },
  { month: 5, day: 14, name: '로즈데이', applicableTypes: ['parent', 'partner'] },
  { month: 6, day: 14, name: '키스데이', applicableTypes: ['partner'] },
  { month: 11, day: 11, name: '빼빼로데이', applicableTypes: ['parent', 'partner'] },
  { month: 12, day: 14, name: '허그데이', applicableTypes: ['partner'] },
];

export function getCelebrationsByTargetType(type: TargetType) {
  return CELEBRATION_DAYS.filter((celebration) => celebration.applicableTypes.includes(type));
}
