'use server';

import { redirect } from 'next/navigation';

import { isValidDateKey } from '@/lib/dates/date-key';
import { deleteTargetById, insertTarget } from '@/lib/queries/targets';
import { TARGET_TYPES, type CreateTargetInput, type TargetType } from '@/types/target';

export type TargetActionResult = {
  error: string | null;
};

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function isTargetType(value: string): value is TargetType {
  return TARGET_TYPES.includes(value as TargetType);
}

function validateOptionalDate(value: string, label: string): TargetActionResult | null {
  if (value && !isValidDateKey(value)) {
    return { error: `올바른 ${label} 형식을 입력해 주세요.` };
  }

  return null;
}

function validateCreateTargetInput(formData: FormData): CreateTargetInput | TargetActionResult {
  const name = readString(formData, 'name');
  const type = readString(formData, 'type');
  const memo = readString(formData, 'memo');
  const birthday = readString(formData, 'birthday');
  const marriageAnniversary = readString(formData, 'marriage_anniversary');
  const relationshipStartedOn = readString(formData, 'relationship_started_on');

  if (!name) {
    return { error: '감사 대상 이름을 입력해 주세요.' };
  }

  if (!isTargetType(type)) {
    return { error: '감사 대상 유형을 선택해 주세요.' };
  }

  const invalidDate =
    validateOptionalDate(birthday, '생일') ??
    validateOptionalDate(marriageAnniversary, '결혼 기념일') ??
    validateOptionalDate(relationshipStartedOn, '사귀기 시작한 날');

  if (invalidDate) {
    return invalidDate;
  }

  return {
    name,
    type,
    memo: memo || null,
    birthday: birthday || null,
    marriage_anniversary: type === 'parent' ? marriageAnniversary || null : null,
    relationship_started_on: type === 'partner' ? relationshipStartedOn || null : null,
  };
}

export async function createTarget(formData: FormData): Promise<TargetActionResult> {
  const validated = validateCreateTargetInput(formData);

  if ('error' in validated) {
    return validated;
  }

  try {
    await insertTarget(validated);
    return { error: null };
  } catch {
    return { error: '감사 대상 저장에 실패했습니다.' };
  }
}

export async function deleteTarget(formData: FormData): Promise<TargetActionResult> {
  const id = readString(formData, 'id');

  if (!id) {
    return { error: '삭제할 감사 대상을 찾지 못했습니다.' };
  }

  try {
    await deleteTargetById(id);
    return { error: null };
  } catch {
    return { error: '감사 대상 삭제에 실패했습니다.' };
  }
}

export async function submitCreateTarget(formData: FormData) {
  const result = await createTarget(formData);
  if (result.error) {
    redirect(`/targets/new?error=${encodeURIComponent(result.error)}`);
  }
  redirect('/targets');
}

export async function submitDeleteTarget(formData: FormData) {
  const result = await deleteTarget(formData);
  if (result.error) {
    redirect(`/targets?error=${encodeURIComponent(result.error)}`);
  }
  redirect('/targets');
}
