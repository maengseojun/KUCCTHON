import Link from 'next/link';

import { BottomNav } from '@/components/nav/bottom-nav';
import { getCalendarItemsForYear } from '@/lib/calendar/dates';
import { toLocalDateKey } from '@/lib/dates/date-key';
import { getEvents } from '@/lib/queries/events';
import { getTargets } from '@/lib/queries/targets';
import { getThankYouList } from '@/lib/queries/thank-yous';

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDday(dateKey: string, todayKey: string) {
  const diffMs = parseDateKey(dateKey).getTime() - parseDateKey(todayKey).getTime();
  const diffDays = Math.round(diffMs / 86_400_000);

  if (diffDays === 0) return 'D-Day';
  if (diffDays > 0) return `D-${diffDays}`;
  return `D+${Math.abs(diffDays)}`;
}

function findUpcomingEvent(
  todayKey: string,
  targets: Awaited<ReturnType<typeof getTargets>>,
  events: Awaited<ReturnType<typeof getEvents>>
) {
  const currentYear = Number(todayKey.slice(0, 4));
  const calendarItems = [
    ...getCalendarItemsForYear(currentYear, targets, events),
    ...getCalendarItemsForYear(currentYear + 1, targets, events),
  ];

  return calendarItems.find((item) => item.type === 'event' && item.date >= todayKey) ?? null;
}

export default async function Page() {
  const [targets, events, thankYous] = await Promise.all([
    getTargets(),
    getEvents(),
    getThankYouList(),
  ]);

  const todayKey = toLocalDateKey(new Date());
  const upcomingEvent = findUpcomingEvent(todayKey, targets, events);
  const targetById = new Map(targets.map((target) => [target.id, target]));
  const recentThankYous = thankYous.slice(0, 2);
  const eventHref = targets.length > 0 ? '/events/new' : '/targets/new';

  return (
    <main className="demo-stage" aria-label="오늘 홈">
      <section className="phone-shell">
        <header className="app-header">
          <div>
            <p className="eyebrow">Today</p>
            <h1>오늘</h1>
          </div>
          <Link href={eventHref} style={{ color: 'inherit', textDecoration: 'none' }}>
            <span className="notification-dot" aria-label="기념일 추가">
              +
            </span>
          </Link>
        </header>

        <section className="hero-panel" aria-label="다가오는 일정">
          <p className="panel-label">Gratitude reminder</p>
          {upcomingEvent ? (
            <>
              <h2>
                {upcomingEvent.title} {formatDday(upcomingEvent.date, todayKey)}
              </h2>
              <p>
                {upcomingEvent.targetName
                  ? `${upcomingEvent.targetName}에게 전할 감사한 일을 미리 적어두세요.`
                  : '다가오는 기념일을 위해 감사한 일을 미리 기록해 두세요.'}
              </p>
            </>
          ) : (
            <>
              <h2>다가오는 기념일을 등록해 보세요</h2>
              <p>생일이나 기념일을 추가하면 홈과 작성하기 화면에서 바로 확인할 수 있습니다.</p>
            </>
          )}
          <div className="hero-actions">
            <Link href="/cards/new" className="cta-button">
              감사 카드 만들기
            </Link>
          </div>
        </section>

        <section
          className="activity-list"
          aria-label="기념일 바로가기"
          style={{ display: 'grid', gap: 12, marginBottom: 14 }}
        >
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              gap: 12,
              justifyContent: 'space-between',
            }}
          >
            <div>
              <p className="panel-label">Anniversary setup</p>
              <h2>기념일 등록</h2>
              <p>
                {targets.length > 0
                  ? '생일, 사귄 날, 부모님 결혼기념일을 추가해 일정으로 연결하세요.'
                  : '먼저 대상을 추가한 뒤 기념일을 등록할 수 있습니다.'}
              </p>
            </div>
            <Link href={eventHref} style={{ color: 'inherit', textDecoration: 'none' }}>
              <span
                style={{
                  background: 'var(--accent-soft)',
                  border: '1px solid var(--border)',
                  borderRadius: 999,
                  color: 'var(--accent-strong)',
                  display: 'inline-block',
                  fontWeight: 700,
                  padding: '12px 18px',
                  textAlign: 'center',
                }}
              >
                {targets.length > 0 ? '등록하기' : '대상 추가'}
              </span>
            </Link>
          </div>
        </section>

        <section className="activity-list" aria-label="최근 감사 기록">
          <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p className="panel-label">Recent gratitude</p>
              <h2 style={{ fontSize: '1.125rem' }}>최근 감사 기록</h2>
            </div>
            <span style={{ color: 'var(--muted)', fontSize: '0.875rem', fontWeight: 700 }}>
              총 {thankYous.length}개
            </span>
          </div>

          {recentThankYous.length > 0 ? (
            recentThankYous.map((thankYou) => {
              const targetName = thankYou.target_id
                ? (targetById.get(thankYou.target_id)?.name ?? '삭제된 대상')
                : '기타';

              return (
                <div
                  key={thankYou.id}
                  className="activity-item"
                  style={{ alignItems: 'flex-start' }}
                >
                  <span className="avatar">{targetName.slice(0, 1)}</span>
                  <div>
                    <strong>{targetName}</strong>
                    <p>{thankYou.content}</p>
                    <p style={{ fontSize: '0.8125rem', marginTop: 4 }}>{thankYou.date}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p>아직 작성한 감사 기록이 없습니다. 작성하기에서 첫 기록을 남겨보세요.</p>
          )}
        </section>

        <BottomNav active="home" />
      </section>
    </main>
  );
}
