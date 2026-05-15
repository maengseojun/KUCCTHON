'use server';

import { redirect } from 'next/navigation';

import { isValidDateKey } from '@/lib/dates/date-key';
import { getThankYouList, insertThankYou, insertThankYouForTarget } from '@/lib/queries/thank-yous';
import type { ThankYou } from '@/types/thank-you';

export type ThankYouActionResult = {
  error: string | null;
  data?: ThankYou;
};

// 기존 호환: user-to-user 감사 생성
export async function createThankYou(
  from_id: string,
  to_id: string,
  content: string
): Promise<ThankYouActionResult> {
  if (typeof from_id !== 'string' || from_id.trim() === '') {
    return { error: '보낸 사람을 입력해 주세요.' };
  }
  if (typeof to_id !== 'string' || to_id.trim() === '') {
    return { error: '받을 사람을 입력해 주세요.' };
  }
  if (typeof content !== 'string' || content.trim() === '') {
    return { error: '감사 메시지를 입력해 주세요.' };
  }

  try {
    const data = await insertThankYou(from_id.trim(), to_id.trim(), content.trim());
    return { error: null, data };
  } catch {
    return { error: '감사 메시지 저장에 실패했습니다. 다시 시도해 주세요.' };
  }
}

// 기존 호환: 전체 목록 조회
export async function fetchThankYouList(): Promise<ThankYou[]> {
  return getThankYouList();
}

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export async function saveThankYouForTarget(formData: FormData): Promise<ThankYouActionResult> {
  const targetId = readString(formData, 'target_id');
  const content = readString(formData, 'content');
  const date = readString(formData, 'date');

  if (!targetId) {
    return { error: '감사 대상을 찾지 못했습니다.' };
  }

  if (!content) {
    return { error: '감사 메시지를 입력해 주세요.' };
  }

  if (!isValidDateKey(date)) {
    return { error: '올바른 날짜를 선택해 주세요.' };
  }

  try {
    const data = await insertThankYouForTarget(targetId, content, date);
    return { error: null, data };
  } catch {
    return { error: '감사 메시지 저장에 실패했습니다.' };
  }
}

// 신규: Target에 감사 메시지 저장 (FormData + redirect)
export async function createThankYouForTarget(formData: FormData) {
  const targetId = formData.get('target_id');

  if (typeof targetId !== 'string' || targetId.trim() === '') {
    redirect(`/targets?error=${encodeURIComponent('감사 대상을 찾지 못했습니다.')}`);
  }

  const result = await saveThankYouForTarget(formData);

  if (result.error) {
    redirect(`/targets/${targetId}?error=${encodeURIComponent(result.error)}`);
  }

  redirect(`/targets/${targetId}`);
}
