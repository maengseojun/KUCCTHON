'use server';

import { redirect } from 'next/navigation';

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

function isValidDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return (
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day)
  );
}

function validateCreateTargetInput(formData: FormData): CreateTargetInput | TargetActionResult {
  const name = readString(formData, 'name');
  const type = readString(formData, 'type');
  const memo = readString(formData, 'memo');
  const birthday = readString(formData, 'birthday');

  if (!name) {
    return { error: '감사 대상 이름을 입력해 주세요.' };
  }

  if (!isTargetType(type)) {
    return { error: '감사 대상 유형을 선택해 주세요.' };
  }

  if (birthday && !isValidDate(birthday)) {
    return { error: '올바른 생년월일 형식을 입력해 주세요.' };
  }

  return {
    name,
    type,
    memo: memo || null,
    birthday: birthday || null,
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
    redirect(`/targets?error=${encodeURIComponent(result.error)}`);
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
