import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface Friend {
  id: string;
  friend_a_id: string;
  friend_b_id: string;
}

export async function insertFriendRelation(
  friend_a_id: string,
  friend_b_id: string
): Promise<Friend[]> {
  try {
    const { data, error } = await supabase
      .from('friend')
      .insert([
        { friend_a_id, friend_b_id },
        { friend_a_id: friend_b_id, friend_b_id: friend_a_id },
      ])
      .select('id, friend_a_id, friend_b_id');

    if (error) {
      throw new Error(`Failed to insert friend relations: ${error.message}`);
    }

    return (data as Friend[]) || [];
  } catch (error) {
    console.error('Error inserting friend relations:', error);
    throw error;
  }
}

export async function deleteFriendRelation(
  friend_a_id: string,
  friend_b_id: string
): Promise<void> {
  try {
    const deleteFirst = await supabase.from('friend').delete().match({ friend_a_id, friend_b_id });

    if (deleteFirst.error) {
      throw deleteFirst.error;
    }

    const deleteSecond = await supabase
      .from('friend')
      .delete()
      .match({ friend_a_id: friend_b_id, friend_b_id: friend_a_id });

    if (deleteSecond.error) {
      throw deleteSecond.error;
    }
  } catch (error) {
    console.error('Error deleting friend relations:', error);
    throw error;
  }
}
