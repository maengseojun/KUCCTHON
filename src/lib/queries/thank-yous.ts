import { createClient } from '@/lib/supabase/server';

export interface ThankYou {
  id: string;
  from_id: string;
  to_id: string;
  entry_date: string;
  created_at: string;
  content: string;
}

const SELECT_COLUMNS = 'id, from_id, to_id, entry_date, created_at, content';

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
    throw new Error('Login is required.');
  }

  return { supabase, userId };
}

export async function getThankYouList(): Promise<ThankYou[]> {
  const { supabase, userId } = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from('thank-yous')
    .select(SELECT_COLUMNS)
    .eq('from_id', userId)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch thank you list: ${error.message}`);
  }

  return (data ?? []) as ThankYou[];
}

export async function insertThankYou(
  from_id: string,
  to_id: string,
  content: string,
  entry_date: string
): Promise<ThankYou> {
  const { supabase, userId } = await requireCurrentUserId();

  if (from_id !== userId) {
    throw new Error('Cannot create a thank you for another user.');
  }

  const { data, error } = await supabase
    .from('thank-yous')
    .insert({
      from_id: userId,
      to_id,
      content,
      entry_date,
    })
    .select(SELECT_COLUMNS)
    .single();

  if (error) {
    throw new Error(`Failed to insert thank you: ${error.message}`);
  }

  return data as ThankYou;
}

export async function getThankYousByFromId(from_id: string): Promise<ThankYou[]> {
  const { supabase, userId } = await getCurrentUserId();

  if (!userId || from_id !== userId) {
    return [];
  }

  const { data, error } = await supabase
    .from('thank-yous')
    .select(SELECT_COLUMNS)
    .eq('from_id', userId)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch thank yous for from_id=${from_id}: ${error.message}`);
  }

  return (data ?? []) as ThankYou[];
}
