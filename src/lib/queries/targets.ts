import { createClient } from '@/lib/supabase/server';
import type { CreateTargetInput, Target } from '@/types/target';

async function getCurrentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, userId: user?.id ?? null };
}

async function requireCurrentUserId() {
  const { supabase, userId } = await getCurrentUserId();

  if (!userId) {
    throw new Error('로그인이 필요합니다.');
  }

  return { supabase, userId };
}

export async function getTargets(): Promise<Target[]> {
  const { supabase, userId } = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from('targets')
    .select('id, user_id, name, type, memo, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('감사 대상을 불러오지 못했습니다.');
  }

  return (data ?? []) as Target[];
}

export async function getTargetById(id: string): Promise<Target | null> {
  const { supabase, userId } = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from('targets')
    .select('id, user_id, name, type, memo, created_at')
    .eq('user_id', userId)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error('감사 대상을 불러오지 못했습니다.');
  }

  return data as Target | null;
}

export async function insertTarget(input: CreateTargetInput): Promise<Target> {
  const { supabase, userId } = await requireCurrentUserId();
  const { data, error } = await supabase
    .from('targets')
    .insert({
      user_id: userId,
      name: input.name,
      type: input.type,
      memo: input.memo ?? null,
    })
    .select('id, user_id, name, type, memo, created_at')
    .single();

  if (error) {
    throw new Error('감사 대상을 저장하지 못했습니다.');
  }

  return data as Target;
}

export async function deleteTargetById(id: string): Promise<void> {
  const { supabase, userId } = await requireCurrentUserId();
  const { error } = await supabase.from('targets').delete().eq('user_id', userId).eq('id', id);

  if (error) {
    throw new Error('감사 대상을 삭제하지 못했습니다.');
  }
}
