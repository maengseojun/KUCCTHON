import { createClient } from '@/lib/supabase/server';
import type { CreateEventInput, EventWithTarget } from '@/types/event';

type EventRow = Omit<EventWithTarget, 'target'> & {
  target: EventWithTarget['target'] | EventWithTarget['target'][];
};

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

function normalizeEventRow(row: EventRow): EventWithTarget {
  const target = Array.isArray(row.target) ? (row.target[0] ?? null) : row.target;

  return {
    ...row,
    target,
  };
}

export async function getEvents(): Promise<EventWithTarget[]> {
  const { supabase, userId } = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from('events')
    .select(
      'id, user_id, target_id, title, event_date, category, recurs_yearly, notify_days_before, memo, created_at, target:targets(id, name, type)'
    )
    .eq('user_id', userId)
    .order('event_date', { ascending: true });

  if (error) {
    throw new Error('일정을 불러오지 못했습니다.');
  }

  return ((data ?? []) as unknown as EventRow[]).map(normalizeEventRow);
}

export async function getEventsByTargetId(targetId: string): Promise<EventWithTarget[]> {
  const { supabase, userId } = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from('events')
    .select(
      'id, user_id, target_id, title, event_date, category, recurs_yearly, notify_days_before, memo, created_at, target:targets(id, name, type)'
    )
    .eq('user_id', userId)
    .eq('target_id', targetId)
    .order('event_date', { ascending: true });

  if (error) {
    throw new Error('대상별 일정을 불러오지 못했습니다.');
  }

  return ((data ?? []) as unknown as EventRow[]).map(normalizeEventRow);
}

export async function insertEvent(input: CreateEventInput): Promise<EventWithTarget> {
  const { supabase, userId } = await requireCurrentUserId();
  const { data, error } = await supabase
    .from('events')
    .insert({
      user_id: userId,
      target_id: input.target_id,
      title: input.title,
      event_date: input.event_date,
      category: input.category,
      recurs_yearly: input.recurs_yearly ?? true,
      notify_days_before: input.notify_days_before ?? [3],
      memo: input.memo ?? null,
    })
    .select(
      'id, user_id, target_id, title, event_date, category, recurs_yearly, notify_days_before, memo, created_at, target:targets(id, name, type)'
    )
    .single();

  if (error) {
    throw new Error('일정을 저장하지 못했습니다.');
  }

  return normalizeEventRow(data as unknown as EventRow);
}
