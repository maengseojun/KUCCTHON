export const TARGET_TYPES = ['partner', 'parent', 'friend', 'other'] as const;

export type TargetType = (typeof TARGET_TYPES)[number];

export const TARGET_TYPE_LABELS: Record<TargetType, string> = {
  partner: '연인',
  parent: '부모님',
  friend: '친구',
  other: '기타',
};

export type Target = {
  id: string;
  user_id: string;
  name: string;
  type: TargetType;
  memo: string | null;
  created_at: string;
};

export type CreateTargetInput = {
  name: string;
  type: TargetType;
  memo?: string | null;
};
