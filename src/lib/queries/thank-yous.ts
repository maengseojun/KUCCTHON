import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface ThankYou {
  from_id: string;
  to_id: string;
  created_at: string;
  content: string;
}

export async function getThankYouList(): Promise<ThankYou[]> {
  try {
    const { data, error } = await supabase
      .from('thank_yous')
      .select('from_id, to_id, created_at, content')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch thank you list: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching thank you list:', error);
    throw error;
  }
}

export async function insertThankYou(
  from_id: string,
  to_id: string,
  content: string
): Promise<ThankYou> {
  try {
    const { data, error } = await supabase
      .from('thank_yous')
      .insert({
        from_id,
        to_id,
        content,
      })
      .select('from_id, to_id, created_at, content')
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
