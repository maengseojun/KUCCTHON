import Link from 'next/link';
import { redirect } from 'next/navigation';

import { signup } from '@/actions/auth';

type SignupPageProps = {
  searchParams: Promise<{
    error?: string | string[];
  }>;
};

function getErrorMessage(error: string | string[] | undefined) {
  if (!error) {
    return null;
  }

  return Array.isArray(error) ? error[0] : error;
}

async function submitSignup(formData: FormData) {
  'use server';

  const result = (await signup(formData)) as { error?: string | null } | void;

  if (result?.error) {
    redirect(`/signup?error=${encodeURIComponent(result.error)}`);
  }
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { error } = await searchParams;
  const errorMessage = getErrorMessage(error);

  return (
    <main className="demo-stage" aria-label="회원가입">
      <section className="phone-shell">
        <header className="app-header">
          <div>
            <p className="eyebrow">Gratitude Journal</p>
            <h1>회원가입</h1>
          </div>
        </header>

        <section className="hero-panel" aria-label="회원가입 안내">
          <p className="panel-label">Start here</p>
          <h2>나만의 감사 기록을 시작해요.</h2>
          <p>이름과 생일은 이후 기념일과 프로필에 사용할 수 있게 함께 저장합니다.</p>
        </section>

        <section
          className="activity-list"
          aria-label="회원가입 폼"
          style={{ gap: 16, marginTop: 2 }}
        >
          <form action={submitSignup} style={{ display: 'grid', gap: 14 }}>
            <label style={{ display: 'grid', gap: 8 }}>
              <span className="panel-label" style={{ marginBottom: 0 }}>
                Name
              </span>
              <input
                autoComplete="name"
                name="name"
                placeholder="이름"
                required
                type="text"
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
                Birthday
              </span>
              <input
                autoComplete="bday"
                name="birthday"
                required
                type="date"
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
                autoComplete="new-password"
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

            <label style={{ display: 'grid', gap: 8 }}>
              <span className="panel-label" style={{ marginBottom: 0 }}>
                Confirm Password
              </span>
              <input
                autoComplete="new-password"
                name="passwordConfirmation"
                placeholder="비밀번호 확인"
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
              가입하기
            </button>
          </form>

          <p style={{ fontSize: '0.875rem', textAlign: 'center' }}>
            이미 계정이 있나요?{' '}
            <Link href="/login" style={{ color: 'var(--accent-strong)', fontWeight: 700 }}>
              로그인
            </Link>
          </p>
        </section>
      </section>
    </main>
  );
}
