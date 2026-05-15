'use server';

import { signUp } from '@/lib/queries/auth'; // 위치에 맞게 수정

export async function signUpAction(formData: FormData) {
  const name = formData.get('name') as string;
  const birthday = formData.get('birthday') as string;
  const user_id = formData.get('user_id') as string;
  const user_password = formData.get('user_password') as string;

  const { data, error } = await signUp(name, birthday, user_id, user_password);

  if (error) {
    return { success: false, message: "회원가입에 실패했습니다." };
  }

  return { success: true, user: data[0] };
}