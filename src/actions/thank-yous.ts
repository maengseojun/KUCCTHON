'use server';

import {
  insertThankYou,
  type ThankYou,
} from '@/lib/queries/thank-yous';

export type ThankYouActionResult = {
  error: string | null;
  data?: ThankYou;
};

function validateThankYouInput(
  from_id: string,
  to_id: string,
  content: string
): { from_id: string; to_id: string; content: string } | ThankYouActionResult {
  if (typeof from_id !== 'string' || from_id.trim() === '') {
    return { error: '보낸 사람을 입력해 주세요.', data: undefined };
  }

  if (typeof to_id !== 'string' || to_id.trim() === '') {
    return { error: '받을 사람을 입력해 주세요.', data: undefined };
  }

  if (typeof content !== 'string' || content.trim() === '') {
    return { error: '감사 메시지를 입력해 주세요.', data: undefined };
  }

  return {
    from_id: from_id.trim(),
    to_id: to_id.trim(),
    content: content.trim(),
  };
}

export async function createThankYou(
  from_id: string,
  to_id: string,
  content: string
): Promise<ThankYouActionResult> {
  const validated = validateThankYouInput(from_id, to_id, content);

  if ('error' in validated) {
    return validated;
  }

  try {
    const data = await insertThankYou(
      validated.from_id,
      validated.to_id,
      validated.content
    );

    return { error: null, data };
  } catch (error) {
    return { error: '감사 메시지 저장에 실패했습니다. 다시 시도해 주세요.' };
  }
}