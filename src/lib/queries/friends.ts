import { createClient } from '@/lib/supabase/server';
import type { ClassifiedFriends, Friend } from '@/types/friend';

async function getCurrentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

async function requireCurrentUserId() {
  const { supabase, userId } = await getCurrentUserId();
  if (!userId) throw new Error('로그인이 필요합니다.');
  return { supabase, userId };
}

export async function getFriends(): Promise<ClassifiedFriends> {
  const { supabase, userId } = await getCurrentUserId();

  if (!userId) {
    return { mutual: [], outgoing: [], incoming: [] };
  }

  const { data: outgoingRows, error: outErr } = await supabase
    .from('friends')
    .select('id, user_id, friend_user_id, created_at')
    .eq('user_id', userId);

  if (outErr) throw new Error('친구 목록을 불러오지 못했습니다.');

  const { data: incomingRows, error: inErr } = await supabase
    .from('friends')
    .select('id, user_id, friend_user_id, created_at')
    .eq('friend_user_id', userId);

  if (inErr) throw new Error('친구 목록을 불러오지 못했습니다.');

  const profileIds = Array.from(
    new Set([
      ...(outgoingRows ?? []).map((row) => row.friend_user_id),
      ...(incomingRows ?? []).map((row) => row.user_id),
    ])
  );

  const profilesById = new Map<string, { name: string }>();

  if (profileIds.length > 0) {
    const { data: profiles, error: profilesErr } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', profileIds);

    if (profilesErr) throw new Error('친구 프로필을 불러오지 못했습니다.');

    for (const profile of profiles ?? []) {
      profilesById.set(profile.id, { name: profile.name });
    }
  }

  const outgoing: Friend[] = (outgoingRows ?? []).map((row) => ({
    ...row,
    profile: profilesById.get(row.friend_user_id) ?? null,
  }));

  const incoming: Friend[] = (incomingRows ?? []).map((row) => ({
    ...row,
    profile: profilesById.get(row.user_id) ?? null,
  }));

  // Classify
  const outgoingSet = new Set(outgoing.map((f) => f.friend_user_id));
  const incomingSet = new Set(incoming.map((f) => f.user_id));

  const mutual: Friend[] = [];
  const outgoingOnly: Friend[] = [];

  for (const f of outgoing) {
    if (incomingSet.has(f.friend_user_id)) {
      mutual.push(f);
    } else {
      outgoingOnly.push(f);
    }
  }

  const incomingOnly = incoming.filter((f) => !outgoingSet.has(f.user_id));

  return { mutual, outgoing: outgoingOnly, incoming: incomingOnly };
}

export async function searchUserByName(name: string) {
  const { supabase, userId } = await requireCurrentUserId();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('name', name)
    .maybeSingle();

  if (error) throw new Error('사용자 검색에 실패했습니다.');
  if (!data) return null;
  if (data.id === userId) return 'self' as const;

  return data;
}

export async function insertFriend(friendUserId: string): Promise<void> {
  const { supabase, userId } = await requireCurrentUserId();

  const { error } = await supabase
    .from('friends')
    .insert({ user_id: userId, friend_user_id: friendUserId });

  if (error) {
    if (error.code === '23505') {
      throw new Error('이미 추가한 친구입니다.');
    }
    throw new Error('친구 추가에 실패했습니다.');
  }
}

export async function deleteFriend(friendUserId: string): Promise<void> {
  const { supabase, userId } = await requireCurrentUserId();

  const { error } = await supabase
    .from('friends')
    .delete()
    .eq('user_id', userId)
    .eq('friend_user_id', friendUserId);

  if (error) throw new Error('친구 삭제에 실패했습니다.');
}
