import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types/profile';

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, birthday, created_at')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    throw new Error('프로필을 불러오지 못했습니다.');
  }

  return data as Profile | null;
}
