'use server';

import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

export type AuthActionResult = {
  error: string | null;
};

type Credentials = {
  email: string;
  password: string;
};

type SignupInput = Credentials & {
  birthday: string;
  name: string;
};

function readCredentials(formData: FormData): Credentials | AuthActionResult {
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

function isValidBirthday(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));

  return (
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day)
  );
}

function readSignupInput(formData: FormData): SignupInput | AuthActionResult {
  const credentials = readCredentials(formData);

  if ('error' in credentials) {
    return credentials;
  }

  const passwordConfirmation = formData.get('passwordConfirmation');
  const name = formData.get('name');
  const birthday = formData.get('birthday');

  if (typeof passwordConfirmation !== 'string' || passwordConfirmation === '') {
    return { error: '비밀번호 확인을 입력해 주세요.' };
  }

  if (credentials.password !== passwordConfirmation) {
    return { error: '비밀번호가 일치하지 않습니다.' };
  }

  if (typeof name !== 'string' || name.trim() === '') {
    return { error: '이름을 입력해 주세요.' };
  }

  if (typeof birthday !== 'string' || birthday.trim() === '') {
    return { error: '생일을 입력해 주세요.' };
  }

  if (!isValidBirthday(birthday)) {
    return { error: '올바른 생일을 입력해 주세요.' };
  }

  return {
    ...credentials,
    birthday,
    name: name.trim(),
  };
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

export async function signup(formData: FormData): Promise<AuthActionResult> {
  const signupInput = readSignupInput(formData);

  if ('error' in signupInput) {
    return signupInput;
  }

  const supabase = await createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.signUp({
    email: signupInput.email,
    password: signupInput.password,
    options: {
      data: {
        birthday: signupInput.birthday,
        name: signupInput.name,
      },
    },
  });

  if (error) {
    return { error: '회원가입에 실패했습니다. 다시 시도해 주세요.' };
  }

  if (!session) {
    redirect(
      `/login?message=${encodeURIComponent('회원가입이 접수되었습니다. 이메일을 확인한 뒤 로그인해 주세요.')}`
    );
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
