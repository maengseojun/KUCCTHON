import Link from 'next/link';
import { notFound } from 'next/navigation';

import { BottomNav } from '@/components/nav/bottom-nav';
import { getCelebrationsByTargetType } from '@/lib/constants/celebrations';
import { SUGGESTED_EVENTS } from '@/lib/constants/suggested-events';
import { getEventsByTargetId } from '@/lib/queries/events';
import { getTargetById } from '@/lib/queries/targets';
import { EVENT_CATEGORY_LABELS } from '@/types/event';
import { TARGET_TYPE_LABELS } from '@/types/target';

type TargetDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TargetDetailPage({ params }: TargetDetailPageProps) {
  const { id } = await params;
  const [target, events] = await Promise.all([getTargetById(id), getEventsByTargetId(id)]);

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
