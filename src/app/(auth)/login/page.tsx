import Link from 'next/link';
import { redirect } from 'next/navigation';

import { login } from '@/actions/auth';

type LoginPageProps = {
  searchParams: Promise<{
    error?: string | string[];
    message?: string | string[];
  }>;
};

function getSearchMessage(value: string | string[] | undefined) {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] : value;
}

async function submitLogin(formData: FormData) {
  'use server';

  const result = (await login(formData)) as { error?: string | null } | void;

  if (result?.error) {
    redirect(`/login?error=${encodeURIComponent(result.error)}`);
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, message } = await searchParams;
  const errorMessage = getSearchMessage(error);
  const successMessage = getSearchMessage(message);

  return (
    <main className="demo-stage" aria-label="로그인">
      <section className="phone-shell">
        <header className="app-header">
          <div>
            <p className="eyebrow">Gratitude Journal</p>
            <h1>로그인</h1>
          </div>
        </header>

        <section className="hero-panel" aria-label="서비스 소개">
          <p className="panel-label">Welcome back</p>
          <h2>오늘의 감사를 이어서 기록해요.</h2>
          <p>계정으로 로그인하면 지난 기록과 카드를 계속 볼 수 있습니다.</p>
        </section>

        <section className="activity-list" aria-label="로그인 폼" style={{ gap: 16, marginTop: 2 }}>
          <form action={submitLogin} style={{ display: 'grid', gap: 14 }}>
            <label style={{ display: 'grid', gap: 8 }}>
              <span className="panel-label" style={{ marginBottom: 0 }}>
                Email
              </span>
              <input
                autoComplete="email"
                name="email"
                placeholder="you@example.com"
                required
                type="email"
                style={{
                  width: '100%',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  background: 'var(--surface-strong)',
                  color: 'var(--foreground)',
                  font: 'inherit',
                  padding: '14px 16px',
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: 8 }}>
              <span className="panel-label" style={{ marginBottom: 0 }}>
                Password
              </span>
              <input
                autoComplete="current-password"
                name="password"
                placeholder="비밀번호"
                required
                type="password"
                style={{
                  width: '100%',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  background: 'var(--surface-strong)',
                  color: 'var(--foreground)',
                  font: 'inherit',
                  padding: '14px 16px',
                }}
              />
            </label>

            {successMessage ? (
              <p
                role="status"
                style={{
                  borderRadius: 16,
                  background: 'var(--accent-soft)',
                  color: 'var(--accent-strong)',
                  fontSize: '0.875rem',
                  lineHeight: 1.4,
                  padding: '12px 14px',
                }}
              >
                {successMessage}
              </p>
            ) : null}

            {errorMessage ? (
              <p
                role="alert"
                style={{
                  borderRadius: 16,
                  background: '#fff1ed',
                  color: '#9a3412',
                  fontSize: '0.875rem',
                  lineHeight: 1.4,
                  padding: '12px 14px',
                }}
              >
                {errorMessage}
              </p>
            ) : null}

            <button type="submit" style={{ width: '100%', marginTop: 4 }}>
              로그인
            </button>
          </form>

          <p style={{ fontSize: '0.875rem', textAlign: 'center' }}>
            처음 오셨나요?{' '}
            <Link href="/signup" style={{ color: 'var(--accent-strong)', fontWeight: 700 }}>
              회원가입
            </Link>
          </p>
        </section>
      </section>
    </main>
  );
}
