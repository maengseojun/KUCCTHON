import { createClient } from '@/lib/supabase/server'; // 서버용 클라이언트 사용

export const signUp = async (name: string, birthday: string, user_id: string, user_password: string) => {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('users') // 테이블명
    .insert([
      { 
        name,
        birthday,
        user_id,
        user_password
      }
    ])
    .select();

  return { data, error };
};