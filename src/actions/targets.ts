'use server';

import {
  getTargetList,
  insertTarget,
  incrementThankYouCount,
  type Target,
} from '@/lib/queries/targets';

export type TargetActionResult = {
  error: string | null;
  data?: Target;
};

function validateCreateInput(
  id: string,
  nickname: string
): { id: string; nickname: string } | TargetActionResult {
  if (typeof id !== 'string' || id.trim() === '') {
    return { error: '아이디를 입력해 주세요.' };
  }

  if (typeof nickname !== 'string' || nickname.trim() === '') {
    return { error: '닉네임을 입력해 주세요.' };
  }

  return { id: id.trim(), nickname: nickname.trim() };
}

function validateId(id: string): { id: string } | TargetActionResult {
  if (typeof id !== 'string' || id.trim() === '') {
    return { error: '대상 아이디를 입력해 주세요.' };
  }

  return { id: id.trim() };
}

export async function fetchTargetList(): Promise<Target[]> {
  return getTargetList();
}

export async function createTarget(
  id: string,
  nickname: string
): Promise<TargetActionResult> {
  const validated = validateCreateInput(id, nickname);

  if ('error' in validated) return validated;

  try {
    const data = await insertTarget(validated.id, validated.nickname);
    return { error: null, data };
  } catch (error) {
    return { error: '대상 생성에 실패했습니다.' };
  }
}

export async function incrementTargetCount(id: string): Promise<TargetActionResult> {
  const validated = validateId(id);

  if ('error' in validated) return validated;

  try {
    const data = await incrementThankYouCount(validated.id);
    return { error: null, data };
  } catch (error) {
    return { error: '감사 수 증가에 실패했습니다.' };
  }
}

