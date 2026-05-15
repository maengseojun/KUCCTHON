'use server';

import { deleteTargetById, getTargets, insertTarget } from '@/lib/queries/targets';
import { TARGET_TYPES, type CreateTargetInput, type Target, type TargetType } from '@/types/target';

export type TargetActionResult = {
  error: string | null;
  data?: Target;
};

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function isTargetType(value: string): value is TargetType {
  return TARGET_TYPES.includes(value as TargetType);
}

function validateCreateTargetInput(formData: FormData): CreateTargetInput | TargetActionResult {
  const name = readString(formData, 'name');
  const type = readString(formData, 'type');
  const memo = readString(formData, 'memo');

  if (!name) {
    return { error: '감사 대상 이름을 입력해 주세요.' };
  }

  if (!isTargetType(type)) {
    return { error: '감사 대상 유형을 선택해 주세요.' };
  }

  return {
    name,
    type,
    memo: memo || null,
  };
}

export async function fetchTargets(): Promise<Target[]> {
  return getTargets();
}

export async function createTarget(formData: FormData): Promise<TargetActionResult> {
  const validated = validateCreateTargetInput(formData);

  if ('error' in validated) {
    return validated;
  }

  try {
    const data = await insertTarget(validated);
    return { error: null, data };
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
