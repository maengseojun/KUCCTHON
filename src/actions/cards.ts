'use server';

import { getCardsByFromAndToId } from '@/lib/queries/cards';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function validateCardIds(
  from_id: string,
  to_id: string
): { from_id: string; to_id: string } | { error: string } {
  if (typeof from_id !== 'string' || from_id.trim() === '') {
    return { error: 'from_id를 입력해 주세요.' };
  }

  if (typeof to_id !== 'string' || to_id.trim() === '') {
    return { error: 'to_id를 입력해 주세요.' };
  }

  return { from_id: from_id.trim(), to_id: to_id.trim() };
}

export async function formatCardContentsHtml(
  from_id: string,
  to_id: string
): Promise<{ error: string | null; html?: string }> {
  const validated = validateCardIds(from_id, to_id);

  if ('error' in validated) {
    return { error: validated.error };
  }

  try {
    const cards = await getCardsByFromAndToId(validated.from_id, validated.to_id);
    const htmlLines = cards.map((card) => `<p>${escapeHtml(card.content)}</p>`).join('');

    return {
      error: null,
      html: `<div class="card-contents">${htmlLines}</div>`,
    };
  } catch {
    return { error: '카드 내용을 불러오는 중 오류가 발생했습니다.' };
  }
}
