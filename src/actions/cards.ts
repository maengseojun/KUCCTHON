'use server';

import { redirect } from 'next/navigation';

import { createCardForTarget, getOwnCardByToken, getPublicCardByToken } from '@/lib/queries/cards';
import type { Card, CreateCardInput, PublicCard } from '@/types/card';

export type CardActionResult = {
  error: string | null;
  data?: Card;
};

export type CardLookupResult<TCard> = {
  error: string | null;
  data: TCard | null;
};

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function validateCreateCardInput(formData: FormData): CreateCardInput | CardActionResult {
  const target_id = readString(formData, 'target_id');

  if (!target_id) {
    return { error: '감사 대상을 찾지 못했습니다.' };
  }

  return {
    target_id,
  };
}

function validateToken(token: string): string | null {
  const trimmed = token.trim();
  return trimmed ? trimmed : null;
}

export async function createCard(formData: FormData): Promise<CardActionResult> {
  const validated = validateCreateCardInput(formData);

  if ('error' in validated) {
    return validated;
  }

  try {
    const data = await createCardForTarget(validated);
    return { error: null, data };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: '카드 저장에 실패했습니다.' };
  }
}

export async function createGratitudeCard(formData: FormData) {
  const result = await createCard(formData);
  const targetId = readString(formData, 'target_id');

  if (result.error || !result.data) {
    const searchParams = new URLSearchParams();

    if (targetId) {
      searchParams.set('target', targetId);
    }

    searchParams.set('error', result.error ?? '카드 저장에 실패했습니다.');
    redirect(`/cards/new?${searchParams.toString()}`);
  }

  redirect(`/cards/new?target=${result.data.target_id}&token=${result.data.public_token}`);
}

export async function fetchOwnCardByToken(token: string): Promise<CardLookupResult<Card>> {
  const validatedToken = validateToken(token);

  if (!validatedToken) {
    return { error: '공유 토큰을 입력해 주세요.', data: null };
  }

  try {
    const data = await getOwnCardByToken(validatedToken);
    return { error: null, data };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message, data: null };
    }

    return { error: '카드를 불러오지 못했습니다.', data: null };
  }
}

export async function fetchPublicCardByToken(token: string): Promise<CardLookupResult<PublicCard>> {
  const validatedToken = validateToken(token);

  if (!validatedToken) {
    return { error: '공유 토큰을 입력해 주세요.', data: null };
  }

  try {
    const data = await getPublicCardByToken(validatedToken);
    return { error: null, data };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message, data: null };
    }

    return { error: '공유 카드를 불러오지 못했습니다.', data: null };
  }
}
