import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Target {
  id: string;
  nickname: string;
  thank_you_count: number;
  from_id: string;
}

/*
export async function getTargetList(): Promise<Target[]> {
  try {
    const { data, error } = await supabase
      .from('targets')
      .select('id, nickname, thank_you_count, from_id')
      .order('thank_you_count', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch target list: ${error.message}`);
    }

    return (data as Target[]) || [];
  } catch (error) {
    console.error('Error fetching target list:', error);
    throw error;
  }
}
  */

export async function insertTarget(id: string, nickname: string, from_id: string): Promise<Target> {
  try {
    const { data, error } = await supabase
      .from('targets')
      .insert({ id, nickname, thank_you_count: 0, from_id })
      .select('id, nickname, thank_you_count, from_id')
      .single();

    if (error) {
      throw new Error(`Failed to insert target: ${error.message}`);
    }

    return data as Target;
  } catch (error) {
    console.error('Error inserting target:', error);
    throw error;
  }
}

export async function deleteTargetById(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('targets').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete target: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting target by id:', error);
    throw error;
  }
}

export async function incrementThankYouCount(id: string): Promise<Target> {
  try {
    const current = await supabase.from('targets').select('thank_you_count').eq('id', id).single();

    if (current.error) {
      throw new Error(`Failed to read current count: ${current.error.message}`);
    }

    const currentCount =
      typeof current.data?.thank_you_count === 'number' ? current.data.thank_you_count : 0;

    const newCount = currentCount + 1;

    const { data: updated, error: updateError } = await supabase
      .from('targets')
      .update({ thank_you_count: newCount })
      .eq('id', id)
      .select('id, nickname, thank_you_count, from_id')
      .single();

    if (updateError) throw new Error(`Failed to increment thank_you_count: ${updateError.message}`);

    return updated as Target;
  } catch (error) {
    console.error('Error incrementing thank_you_count:', error);
    throw error;
  }
}

export async function decrementThankYouCount(id: string): Promise<Target> {
  try {
    const current = await supabase.from('targets').select('thank_you_count').eq('id', id).single();

    if (current.error) {
      throw new Error(`Failed to read current count: ${current.error.message}`);
    }

    const currentCount =
      typeof current.data?.thank_you_count === 'number' ? current.data.thank_you_count : 0;

    const newCount = Math.max(0, currentCount - 1);

    const { data: updated, error: updateError } = await supabase
      .from('targets')
      .update({ thank_you_count: newCount })
      .eq('id', id)
      .select('id, nickname, thank_you_count, from_id')
      .single();

    if (updateError) throw new Error(`Failed to decrement thank_you_count: ${updateError.message}`);

    return updated as Target;
  } catch (error) {
    console.error('Error decrementing thank_you_count:', error);
    throw error;
  }
}
