'use server';

import { redirect } from 'next/navigation';

import { deleteFriend, insertFriend, searchUserByName } from '@/lib/queries/friends';

export type FriendActionResult = {
  error: string | null;
};

export async function addFriend(formData: FormData): Promise<FriendActionResult> {
  const name = formData.get('name');
  const friendUserId = formData.get('friend_user_id');

  if (typeof friendUserId === 'string' && friendUserId.trim() !== '') {
    try {
      await insertFriend(friendUserId.trim());
      return { error: null };
    } catch (e) {
      const message = e instanceof Error ? e.message : '친구 추가에 실패했습니다.';
      return { error: message };
    }
  }

  if (typeof name !== 'string' || name.trim() === '') {
    return { error: '사용자 이름을 입력해 주세요.' };
  }

  const trimmed = name.trim();

  try {
    const result = await searchUserByName(trimmed);

    if (result === null) {
      return { error: '해당 사용자를 찾을 수 없습니다.' };
    }

    if (result === 'self') {
      return { error: '자기 자신은 친구로 추가할 수 없습니다.' };
    }

    await insertFriend(result.id);
    return { error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : '친구 추가에 실패했습니다.';
    return { error: message };
  }
}

export async function removeFriend(formData: FormData): Promise<FriendActionResult> {
  const friendUserId = formData.get('friend_user_id');

  if (typeof friendUserId !== 'string' || friendUserId.trim() === '') {
    return { error: '삭제할 친구를 찾지 못했습니다.' };
  }

  try {
    await deleteFriend(friendUserId.trim());
    return { error: null };
  } catch {
    return { error: '친구 삭제에 실패했습니다.' };
  }
}

export async function submitAddFriend(formData: FormData) {
  const result = await addFriend(formData);

  if (result.error) {
    redirect(`/friends?error=${encodeURIComponent(result.error)}`);
  }

  redirect('/friends');
}

export async function submitRemoveFriend(formData: FormData) {
  const result = await removeFriend(formData);

  if (result.error) {
    redirect(`/friends?error=${encodeURIComponent(result.error)}`);
  }

  redirect('/friends');
}
