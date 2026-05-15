import Link from 'next/link';
import { notFound } from 'next/navigation';

import { BottomNav } from '@/components/nav/bottom-nav';
import { TargetThankYouForm } from '@/components/targets/target-thank-you-form';
import { formatReminderDays } from '@/lib/constants/reminders';
import { SUGGESTED_EVENTS } from '@/lib/constants/suggested-events';
import { getEventsByTargetId } from '@/lib/queries/events';
import { getTargetById } from '@/lib/queries/targets';
import { getThankYousByTargetId } from '@/lib/queries/thank-yous';
import { getScheduleEventsForTarget } from '@/lib/schedule/automatic-events';
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

  const scheduleEvents = getScheduleEventsForTarget(
    target,
    events,
    new Date().toISOString().slice(0, 10)
  );

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

        <section className="hero-panel" aria-label="대상 요약">
          <p className="panel-label">Summary</p>
          <h2>감사 {target.thank_you_count}회 작성</h2>
          {target.birthday ? <p>🎂 생일: {target.birthday}</p> : null}
          {target.marriage_anniversary ? (
            <p>💍 결혼 기념일: {target.marriage_anniversary}</p>
          ) : null}
          {target.relationship_started_on ? (
            <p>💚 사귀기 시작한 날: {target.relationship_started_on}</p>
          ) : null}
          {target.memo ? <p>📝 {target.memo}</p> : null}
        </section>

        <TargetThankYouForm errorMessage={errorMessage} targetId={target.id} />

        <section className="activity-list" aria-label="감사 기록">
          <h2>감사 기록 ({thankYous.length})</h2>
          {thankYous.length === 0 ? (
            <p>아직 작성한 감사 기록이 없습니다.</p>
          ) : (
            thankYous.map((thankYou) => (
              <article key={thankYou.id} className="activity-item">
                <span className="avatar">💌</span>
                <div>
                  <p>{thankYou.content}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{thankYou.date}</p>
                </div>
              </article>
            ))
          )}
        </section>

        <section className="hero-panel" aria-label="추천 일정">
          <p className="panel-label">Recommended setup</p>
          <h2>{TARGET_TYPE_LABELS[target.type]}에게 필요한 날짜</h2>
          <p>{SUGGESTED_EVENTS[target.type].map((event) => event.label).join(', ')}</p>
        </section>

        <section className="activity-list" aria-label="저장된 일정">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2>저장된 일정</h2>
            <Link href="/events/new" style={{ color: 'var(--accent-strong)', fontWeight: 700 }}>
              추가
            </Link>
          </div>

          {scheduleEvents.length === 0 ? (
            <p>아직 연결된 일정이 없습니다.</p>
          ) : (
            scheduleEvents.map((event) => (
              <article key={event.id} className="activity-item">
                <span className={event.isAutomatic ? 'avatar accent' : 'avatar'}>
                  {event.event_date.slice(5, 7)}
                </span>
                <div>
                  <strong>{event.title}</strong>
                  <p>
                    {event.event_date} · {EVENT_CATEGORY_LABELS[event.category]} ·{' '}
                    {formatReminderDays(event.notify_days_before)}
                    {event.isAutomatic ? ' · 자동 추가' : ''}
                  </p>
                </div>
              </article>
            ))
          )}
        </section>

        <BottomNav active="targets" />
      </section>
    </main>
  );
}
