'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

export type AuthActionResult = {
  error: string | null;
};

function readCredentials(
  formData: FormData
): { email: string; password: string } | AuthActionResult {
  const email = formData.get('email');
  const password = formData.get('password');

  if (typeof email !== 'string' || email.trim() === '') {
    return { error: '이메일을 입력해 주세요.' };
  }

  if (typeof password !== 'string' || password === '') {
    return { error: '비밀번호를 입력해 주세요.' };
  }

  return { email: email.trim(), password };
}

export async function login(formData: FormData): Promise<AuthActionResult> {
  const credentials = readCredentials(formData);

  if ('error' in credentials) {
    return credentials;
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) {
    return { error: '이메일 또는 비밀번호를 확인해 주세요.' };
  }

  redirect('/');
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect(`/login?error=${encodeURIComponent('로그아웃에 실패했습니다. 다시 시도해 주세요.')}`);
  }

  redirect('/login');
}
