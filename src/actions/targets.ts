'use server';

import {
  insertTarget,
  incrementThankYouCount,
  decrementThankYouCount,
  deleteTargetById,
  getTargetsByFromId,
  type Target,
} from '@/lib/queries/targets';

export type TargetActionResult = {
  error: string | null;
  data?: Target | Target[];
};

function validateCreateInput(
  id: string,
  nickname: string,
  from_id: string
): { id: string; nickname: string; from_id: string } | TargetActionResult {
  if (typeof id !== 'string' || id.trim() === '') {
    return { error: '아이디를 입력해 주세요.' };
  }

  if (typeof nickname !== 'string' || nickname.trim() === '') {
    return { error: '닉네임을 입력해 주세요.' };
  }

  if (typeof from_id !== 'string' || from_id.trim() === '') {
    return { error: '출처 아이디를 입력해 주세요.' };
  }

  return { id: id.trim(), nickname: nickname.trim(), from_id: from_id.trim() };
}

function validateId(id: string): { id: string } | TargetActionResult {
  if (typeof id !== 'string' || id.trim() === '') {
    return { error: '대상 아이디를 입력해 주세요.' };
  }

  return { id: id.trim() };
}

export async function createTarget(id: string, nickname: string, from_id: string): Promise<TargetActionResult> {
  const validated = validateCreateInput(id, nickname, from_id);

  if ('error' in validated) return validated;

  try {
    const data = await insertTarget(validated.id, validated.nickname, validated.from_id);
    return { error: null, data };
  } catch {
    return { error: '대상 생성에 실패했습니다.' };
  }
}

export async function fetchTargetsByFromId(from_id: string): Promise<TargetActionResult> {
  if (typeof from_id !== 'string' || from_id.trim() === '') {
    return { error: 'from_id를 입력해 주세요.' };
  }

  try {
    const data = await getTargetsByFromId(from_id.trim());
    return { error: null, data: data[0] ? data : [] };
  } catch {
    return { error: 'from_id 기준 대상 목록을 불러오지 못했습니다.' };
  }
}

export async function incrementTargetCount(id: string): Promise<TargetActionResult> {
  const validated = validateId(id);

  if ('error' in validated) return validated;

  try {
    const data = await incrementThankYouCount(validated.id);
    return { error: null, data };
  } catch {
    return { error: '감사 수 증가에 실패했습니다.' };
  }
}

export async function decrementTargetCount(id: string): Promise<TargetActionResult> {
  const validated = validateId(id);

  if ('error' in validated) return validated;

  try {
    const data = await decrementThankYouCount(validated.id);
    return { error: null, data };
  } catch {
    return { error: '감사 수 감소에 실패했습니다.' };
  }
}

export async function deleteTarget(id: string): Promise<TargetActionResult> {
  const validated = validateId(id);

  if ('error' in validated) return validated;

  try {
    await deleteTargetById(validated.id);
    return { error: null };
  } catch {
    return { error: '대상 삭제에 실패했습니다.' };
  }
}
