import { createClient } from '@/lib/supabase/server';
import type { ThankYou } from '@/types/thank-you';

const SELECT_COLUMNS = 'id, from_id, to_id, target_id, content, created_at';

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

// 기존 호환: 전체 목록 조회
export async function getThankYouList(): Promise<ThankYou[]> {
  const { supabase, userId } = await getCurrentUserId();

  if (!userId) return [];

  const { data, error } = await supabase
    .from('thank-yous')
    .select(SELECT_COLUMNS)
    .eq('from_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error('감사 기록을 불러오지 못했습니다.');

  return (data ?? []) as ThankYou[];
}

// 기존 호환: user-to-user 감사 저장
export async function insertThankYou(
  from_id: string,
  to_id: string,
  content: string
): Promise<ThankYou> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('thank-yous')
    .insert({
      from_id,
      to_id,
      date: new Date().toISOString().split('T')[0],
      content,
    })
    .select(SELECT_COLUMNS)
    .single();

  if (error) throw new Error('감사 메시지 저장에 실패했습니다.');

  return data as ThankYou;
}

// 신규: Target별 감사 기록 조회
export async function getThankYousByTargetId(targetId: string): Promise<ThankYou[]> {
  const { supabase, userId } = await requireCurrentUserId();

  const { data, error } = await supabase
    .from('thank-yous')
    .select(SELECT_COLUMNS)
    .eq('from_id', userId)
    .eq('target_id', targetId)
    .order('created_at', { ascending: false });

  if (error) throw new Error('감사 기록을 불러오지 못했습니다.');

  return (data ?? []) as ThankYou[];
}

// 신규: Target에 감사 메시지 저장
export async function insertThankYouForTarget(
  targetId: string,
  content: string
): Promise<ThankYou> {
  const { supabase, userId } = await requireCurrentUserId();

  const { data, error } = await supabase
    .from('thank-yous')
    .insert({
      from_id: userId,
      to_id: null,
      target_id: targetId,
      date: new Date().toISOString().split('T')[0],
      content,
    })
    .select(SELECT_COLUMNS)
    .single();

  if (error) throw new Error('감사 메시지 저장에 실패했습니다.');

  return data as ThankYou;
}

// 기존 호환: from_id 기준 조회
export async function getThankYousByFromId(from_id: string): Promise<ThankYou[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('thank-yous')
    .select(SELECT_COLUMNS)
    .eq('from_id', from_id)
    .order('created_at', { ascending: false });

  if (error) throw new Error('감사 기록을 불러오지 못했습니다.');

  return (data ?? []) as ThankYou[];
}
