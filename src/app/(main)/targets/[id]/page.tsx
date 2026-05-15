import Link from 'next/link';
import { notFound } from 'next/navigation';

import { createThankYouForTarget } from '@/actions/thank-yous';
import { BottomNav } from '@/components/nav/bottom-nav';
import { getCelebrationsByTargetType } from '@/lib/constants/celebrations';
import { SUGGESTED_EVENTS } from '@/lib/constants/suggested-events';
import { getEventsByTargetId } from '@/lib/queries/events';
import { getTargetById } from '@/lib/queries/targets';
import { getThankYousByTargetId } from '@/lib/queries/thank-yous';
import { EVENT_CATEGORY_LABELS } from '@/types/event';
import { TARGET_TYPE_LABELS } from '@/types/target';

type TargetDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
};

function getErrorMessage(error: string | string[] | undefined) {
  if (!error) return null;
  return Array.isArray(error) ? error[0] : error;
}

export default async function TargetDetailPage({ params, searchParams }: TargetDetailPageProps) {
  const { id } = await params;
  const { error } = await searchParams;
  const errorMessage = getErrorMessage(error);

  const [target, events, thankYous] = await Promise.all([
    getTargetById(id),
    getEventsByTargetId(id),
    getThankYousByTargetId(id),
  ]);

  if (!target) {
    notFound();
  }

  const celebrations = getCelebrationsByTargetType(target.type);

  return (
    <main className="demo-stage" aria-label="감사 대상 상세">
      <section className="phone-shell">
        <header className="app-header">
          <div>
            <p className="eyebrow">{TARGET_TYPE_LABELS[target.type]}</p>
            <h1>{target.name}</h1>
          </div>
          <Link href="/events/new">
            <button type="button">일정</button>
          </Link>
        </header>

        {/* Summary */}
        <section className="hero-panel" aria-label="대상 요약">
          <p className="panel-label">Summary</p>
          <h2>감사 {target.thank_you_count}회 작성</h2>
          {target.birthday ? <p>🎂 생년월일: {target.birthday}</p> : null}
          {target.memo ? <p>📝 {target.memo}</p> : null}
        </section>

        {/* 감사 메시지 작성 */}
        <section className="activity-list" aria-label="감사 메시지 작성" style={{ gap: 14 }}>
          <h2>감사 메시지 작성</h2>
          <form action={createThankYouForTarget} style={{ display: 'grid', gap: 12 }}>
            <input name="target_id" type="hidden" value={target.id} />
            <textarea
              name="content"
              placeholder="감사한 마음을 적어보세요..."
              required
              rows={3}
              style={{
                width: '100%',
                border: '1px solid var(--border)',
                borderRadius: 16,
                background: 'var(--surface-strong)',
                color: 'var(--foreground)',
                font: 'inherit',
                padding: '12px 14px',
                resize: 'vertical',
              }}
            />

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

            <button type="submit">감사 저장</button>
          </form>
        </section>

        {/* 감사 기록 목록 */}
        <section className="activity-list" aria-label="감사 기록">
          <h2>감사 기록 ({thankYous.length})</h2>
          {thankYous.length === 0 ? (
            <p>아직 작성한 감사 기록이 없습니다.</p>
          ) : (
            thankYous.map((ty) => (
              <article key={ty.id} className="activity-item">
                <span className="avatar">💌</span>
                <div>
                  <p>{ty.content}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    {new Date(ty.created_at).toLocaleDateString('ko-KR')}
                  </p>
                </div>
              </article>
            ))
          )}
        </section>

        {/* 추천 일정 */}
        <section className="hero-panel" aria-label="추천 일정">
          <p className="panel-label">Recommended setup</p>
          <h2>{TARGET_TYPE_LABELS[target.type]}에게 필요한 날짜</h2>
          <p>{SUGGESTED_EVENTS[target.type].map((event) => event.label).join(', ')}</p>
        </section>

        {/* 저장된 일정 */}
        <section className="activity-list" aria-label="저장된 일정">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2>저장된 일정</h2>
            <Link href="/events/new" style={{ color: 'var(--accent-strong)', fontWeight: 700 }}>
              추가
            </Link>
          </div>

          {events.length === 0 ? (
            <p>아직 연결된 일정이 없습니다.</p>
          ) : (
            events.map((event) => (
              <article key={event.id} className="activity-item">
                <span className="avatar">{event.event_date.slice(5, 7)}</span>
                <div>
                  <strong>{event.title}</strong>
                  <p>
                    {event.event_date} · {EVENT_CATEGORY_LABELS[event.category]} · D-
                    {event.notify_days_before}
                  </p>
                </div>
              </article>
            ))
          )}
        </section>

        {/* 자동 기념일 */}
        <section className="activity-list" aria-label="자동 기념일">
          <h2>자동 기념일</h2>
          {celebrations.map((celebration) => (
            <article key={`${celebration.month}-${celebration.day}`} className="activity-item">
              <span className="avatar accent">{celebration.month}</span>
              <div>
                <strong>{celebration.name}</strong>
                <p>
                  {celebration.month}/{celebration.day} · 유형 기반 자동 표시
                </p>
              </div>
            </article>
          ))}
        </section>

        <BottomNav active="targets" />
      </section>
    </main>
  );
}
