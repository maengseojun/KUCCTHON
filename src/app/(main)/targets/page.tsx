import Link from 'next/link';
import { redirect } from 'next/navigation';

import { createTarget, deleteTarget } from '@/actions/targets';
import { BottomNav } from '@/components/nav/bottom-nav';
import { SUGGESTED_EVENTS } from '@/lib/constants/suggested-events';
import { getTargets } from '@/lib/queries/targets';
import { TARGET_TYPE_LABELS, TARGET_TYPES } from '@/types/target';

type TargetsPageProps = {
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

async function submitTarget(formData: FormData) {
  'use server';

  const result = await createTarget(formData);

  if (result.error) {
    redirect(`/targets?error=${encodeURIComponent(result.error)}`);
  }

  redirect('/targets');
}

async function submitDeleteTarget(formData: FormData) {
  'use server';

  const result = await deleteTarget(formData);

  if (result.error) {
    redirect(`/targets?error=${encodeURIComponent(result.error)}`);
  }

  redirect('/targets');
}

export default async function TargetsPage({ searchParams }: TargetsPageProps) {
  const [{ error }, targets] = await Promise.all([searchParams, getTargets()]);
  const errorMessage = getErrorMessage(error);

  return (
    <main className="demo-stage" aria-label="감사 대상 관리">
      <section className="phone-shell">
        <header className="app-header">
          <div>
            <p className="eyebrow">Targets</p>
            <h1>감사 대상</h1>
          </div>
          <Link href="/events/new">
            <button type="button">일정</button>
          </Link>
        </header>

        <section className="activity-list" aria-label="감사 대상 추가" style={{ gap: 14 }}>
          <form action={submitTarget} style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'grid', gap: 8 }}>
              <span className="panel-label" style={{ marginBottom: 0 }}>
                Name
              </span>
              <input
                name="name"
                placeholder="예: 엄마, 여자친구 지수"
                required
                type="text"
                style={{
                  width: '100%',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  background: 'var(--surface-strong)',
                  color: 'var(--foreground)',
                  font: 'inherit',
                  padding: '12px 14px',
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: 8 }}>
              <span className="panel-label" style={{ marginBottom: 0 }}>
                Type
              </span>
              <select
                name="type"
                required
                style={{
                  width: '100%',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  background: 'var(--surface-strong)',
                  color: 'var(--foreground)',
                  font: 'inherit',
                  padding: '12px 14px',
                }}
              >
                {TARGET_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {TARGET_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: 'grid', gap: 8 }}>
              <span className="panel-label" style={{ marginBottom: 0 }}>
                Memo
              </span>
              <input
                name="memo"
                placeholder="선택 메모"
                type="text"
                style={{
                  width: '100%',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  background: 'var(--surface-strong)',
                  color: 'var(--foreground)',
                  font: 'inherit',
                  padding: '12px 14px',
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
                  padding: '10px 12px',
                }}
              >
                {errorMessage}
              </p>
            ) : null}

            <button type="submit">대상 추가</button>
          </form>
        </section>

        <section className="activity-list" aria-label="감사 대상 목록">
          {targets.length === 0 ? (
            <p>아직 등록한 감사 대상이 없습니다.</p>
          ) : (
            targets.map((target) => (
              <article
                key={target.id}
                className="activity-item"
                style={{ alignItems: 'flex-start' }}
              >
                <span className="avatar">{TARGET_TYPE_LABELS[target.type].slice(0, 1)}</span>
                <div style={{ flex: 1 }}>
                  <Link
                    href={`/targets/${target.id}`}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                  >
                    <strong>{target.name}</strong>
                    <p>
                      {TARGET_TYPE_LABELS[target.type]} · 추천 일정{' '}
                      {SUGGESTED_EVENTS[target.type].map((event) => event.label).join(', ')}
                    </p>
                  </Link>
                </div>
                <form action={submitDeleteTarget}>
                  <input name="id" type="hidden" value={target.id} />
                  <button
                    type="submit"
                    style={{
                      minWidth: 0,
                      background: 'transparent',
                      color: 'var(--muted)',
                      padding: 6,
                    }}
                  >
                    삭제
                  </button>
                </form>
              </article>
            ))
          )}
        </section>

        <BottomNav active="targets" />
      </section>
    </main>
  );
}
