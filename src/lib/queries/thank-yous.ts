import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface ThankYou {
  id: string;
  from_id: string;
  to_id: string;
  content: string;
  date: string;
  created_at: string;
}

export async function getThankYouList(from_id: string): Promise<ThankYou[]> {
  try {
    const { data, error } = await supabase
      .from('thank-yous')
      .select('id, from_id, to_id, content, date, created_at')
      .eq('from_id', from_id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch thank you list for from_id=${from_id}: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching thank you list by from_id:', error);
    throw error;
  }
}

export async function insertThankYou(
  from_id: string,
  to_id: string,
  content: string
): Promise<ThankYou> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('thank-yous')
      .insert({
        from_id,
        to_id,
        content,
        date: today,
      })
      .select('id, from_id, to_id, content, date, created_at')
      .single();

    if (error) {
      throw new Error(`Failed to insert thank you: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error inserting thank you:', error);
    throw error;
  }
}

export async function getThankYousByFromId(from_id: string): Promise<ThankYou[]> {
  return getThankYouList(from_id);
}
