'use server';

import {
  insertFriendRelation,
  deleteFriendRelation,
  type Friend,
} from '@/lib/queries/friends';

export type FriendActionResult = {
  error: string | null;
  data?: Friend[];
};

function validateFriendIds(
  friend_a_id: string,
  friend_b_id: string
): { friend_a_id: string; friend_b_id: string } | { error: string } {
  if (typeof friend_a_id !== 'string' || friend_a_id.trim() === '') {
    return { error: 'friend_a_id를 입력해 주세요.' };
  }

  if (typeof friend_b_id !== 'string' || friend_b_id.trim() === '') {
    return { error: 'friend_b_id를 입력해 주세요.' };
  }

  if (friend_a_id.trim() === friend_b_id.trim()) {
    return { error: '같은 아이디는 친구 관계로 저장할 수 없습니다.' };
  }

  return {
    friend_a_id: friend_a_id.trim(),
    friend_b_id: friend_b_id.trim(),
  };
}

export async function createFriendRelation(
  friend_a_id: string,
  friend_b_id: string
): Promise<FriendActionResult> {
  const validated = validateFriendIds(friend_a_id, friend_b_id);

  if ('error' in validated) {
    return { error: validated.error };
  }

  try {
    const data = await insertFriendRelation(validated.friend_a_id, validated.friend_b_id);
    return { error: null, data };
  } catch {
    return { error: '친구 관계 저장에 실패했습니다.' };
  }
}

export async function removeFriendRelation(
  friend_a_id: string,
  friend_b_id: string
): Promise<FriendActionResult> {
  const validated = validateFriendIds(friend_a_id, friend_b_id);

  if ('error' in validated) {
    return { error: validated.error };
  }

  try {
    await deleteFriendRelation(validated.friend_a_id, validated.friend_b_id);
    return { error: null, data: [] };
  } catch {
    return { error: '친구 관계 삭제에 실패했습니다.' };
  }
}

