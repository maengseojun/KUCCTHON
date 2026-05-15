import Link from 'next/link';

import { submitDeleteTarget } from '@/actions/targets';
import { BottomNav } from '@/components/nav/bottom-nav';
import { SUGGESTED_EVENTS } from '@/lib/constants/suggested-events';
import { getTargets } from '@/lib/queries/targets';
import { TARGET_TYPE_LABELS } from '@/types/target';

type TargetsPageProps = {
  searchParams: Promise<{
    error?: string | string[];
  }>;
};

function getErrorMessage(error: string | string[] | undefined) {
  if (!error) return null;
  return Array.isArray(error) ? error[0] : error;
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
          <Link href="/targets/new">
            <button type="button">대상 추가</button>
          </Link>
        </header>

        <section className="hero-panel" aria-label="대상 안내">
          <p className="panel-label">관계 캘린더</p>
          <h2>대상 정보에 입력한 기념일은 일정으로 자동 표시됩니다.</h2>
          <p>대상 추가 화면에서 생일, 부모님 결혼 기념일, 연인 시작일을 입력할 수 있습니다.</p>
        </section>

        {errorMessage ? (
          <section className="activity-list" aria-label="대상 오류">
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
          </section>
        ) : null}

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
                      {TARGET_TYPE_LABELS[target.type]}
                      {target.birthday ? ` · 🎂 ${target.birthday}` : ''}
                      {target.marriage_anniversary ? ` · 💍 ${target.marriage_anniversary}` : ''}
                      {target.relationship_started_on
                        ? ` · 💚 ${target.relationship_started_on}`
                        : ''}
                      {' · '}감사 {target.thank_you_count}회
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                      추천: {SUGGESTED_EVENTS[target.type].map((event) => event.label).join(', ')}
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
