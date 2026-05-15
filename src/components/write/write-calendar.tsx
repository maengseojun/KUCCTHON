'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition, type TouchEvent } from 'react';

import { saveThankYouForTarget } from '@/actions/thank-yous';
import { BottomNav } from '@/components/nav/bottom-nav';
import { getCalendarItemsForYear } from '@/lib/calendar/dates';
import { toDateKey, toLocalDateKey } from '@/lib/dates/date-key';
import type { EventWithTarget } from '@/types/event';
import type { Target } from '@/types/target';
import type { ThankYou } from '@/types/thank-you';

type WriteCalendarProps = {
  targets: Target[];
  events: EventWithTarget[];
  thankYous: ThankYou[];
  initialDateKey?: string;
};
type CalendarCell = { date: number; isCurrentMonth: boolean; key: string };
type TargetDayGroup = {
  target: Target | null;
  events: ReturnType<typeof getCalendarItemsForYear>;
  thankYous: ThankYou[];
};
const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'] as const;
const GRID_SIZE = 42;

function buildCells(year: number, month: number): CalendarCell[] {
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells: CalendarCell[] = [];
  for (let index = 0; index < firstDayOfMonth; index += 1) {
    const date = daysInPrevMonth - firstDayOfMonth + index + 1;
    cells.push({ date, isCurrentMonth: false, key: `p${date}` });
  }
  for (let date = 1; date <= daysInMonth; date += 1)
    cells.push({ date, isCurrentMonth: true, key: `c${date}` });
  for (let date = 1; cells.length < GRID_SIZE; date += 1)
    cells.push({ date, isCurrentMonth: false, key: `n${date}` });
  return cells;
}

function groupThankYousByDate(thankYous: ThankYou[]) {
  const grouped = new Map<string, ThankYou[]>();
  thankYous.forEach((thankYou) => {
    const dateKey = thankYou.date;
    const records = grouped.get(dateKey) ?? [];
    records.push(thankYou);
    grouped.set(dateKey, records);
  });
  return grouped;
}

function parseLocalDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function WriteCalendar({ targets, events, thankYous, initialDateKey }: WriteCalendarProps) {
  const router = useRouter();
  const now = new Date();
  const initialDate = initialDateKey ? parseLocalDateKey(initialDateKey) : now;
  const [baseDate, setBaseDate] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const [selectedTargetId, setSelectedTargetId] = useState(targets[0]?.id ?? '');
  const [content, setContent] = useState('');
  const [clientError, setClientError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const targetById = useMemo(
    () => new Map(targets.map((target) => [target.id, target])),
    [targets]
  );
  const thankYousByDate = useMemo(() => groupThankYousByDate(thankYous), [thankYous]);
  const calendarItems = useMemo(
    () => getCalendarItemsForYear(year, targets, events),
    [events, targets, year]
  );
  const calendarItemsByDate = useMemo(() => {
    const grouped = new Map<string, ReturnType<typeof getCalendarItemsForYear>>();
    calendarItems.forEach((item) => {
      const items = grouped.get(item.date) ?? [];
      items.push(item);
      grouped.set(item.date, items);
    });
    return grouped;
  }, [calendarItems]);
  const cells = useMemo(() => buildCells(year, month), [month, year]);
  const selectedDateKey = toLocalDateKey(selectedDate);
  const selectedCalendarItems = useMemo(
    () => calendarItemsByDate.get(selectedDateKey) ?? [],
    [calendarItemsByDate, selectedDateKey]
  );
  const selectedThankYous = useMemo(
    () => thankYousByDate.get(selectedDateKey) ?? [],
    [selectedDateKey, thankYousByDate]
  );
  const selectedHolidays = selectedCalendarItems.filter((item) => item.type === 'holiday');
  const groupedByTarget = (() => {
    const grouped = new Map<string, TargetDayGroup>();
    selectedCalendarItems
      .filter((item) => item.type !== 'holiday' && item.targetId)
      .forEach((item) => {
        const targetId = item.targetId as string;
        const current = grouped.get(targetId) ?? {
          target: targetById.get(targetId) ?? null,
          events: [],
          thankYous: [],
        };
        current.events.push(item);
        grouped.set(targetId, current);
      });
    selectedThankYous.forEach((thankYou) => {
      if (!thankYou.target_id) return;
      const current = grouped.get(thankYou.target_id) ?? {
        target: targetById.get(thankYou.target_id) ?? null,
        events: [],
        thankYous: [],
      };
      current.thankYous.push(thankYou);
      grouped.set(thankYou.target_id, current);
    });
    return [...grouped.values()].sort((a, b) =>
      (a.target?.name ?? '기타').localeCompare(b.target?.name ?? '기타', 'ko-KR')
    );
  })();
  const otherThankYous = selectedThankYous.filter(
    (thankYou) => !thankYou.target_id || !targetById.has(thankYou.target_id)
  );
  const prevMonth = () => setBaseDate(new Date(year, month - 1, 1));
  const nextMonth = () => setBaseDate(new Date(year, month + 1, 1));
  const openModal = () => {
    setSelectedTargetId(targets[0]?.id ?? '');
    setContent('');
    setClientError(null);
    setSaved(false);
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);
  const canWrite = targets.length > 0;
  const canSubmit = selectedTargetId && content.trim() && !isPending;
  const submitThankYou = (formData: FormData) => {
    setClientError(null);
    setSaved(false);
    formData.set('time_zone', Intl.DateTimeFormat().resolvedOptions().timeZone ?? '');

    startTransition(async () => {
      const result = await saveThankYouForTarget(formData);

      if (result.error) {
        setClientError(result.error);
        return;
      }

      setSaved(true);
      setContent('');
      router.refresh();
      setTimeout(() => setShowModal(false), 800);
    });
  };
  const onTouchStart = (event: TouchEvent) => setTouchStartX(event.targetTouches[0].clientX);
  const onTouchEnd = (event: TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - event.changedTouches[0].clientX;
    if (diff > 50) nextMonth();
    else if (diff < -50) prevMonth();
    setTouchStartX(null);
  };
  const isToday = (date: number) =>
    date === now.getDate() && month === now.getMonth() && year === now.getFullYear();

  return (
    <main className="demo-stage" aria-label="감사 일기 작성">
      <section className="phone-shell">
        <header className="app-header" style={{ justifyContent: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              aria-label="이전 달"
              onClick={prevMonth}
              style={{
                background: 'transparent',
                color: 'var(--foreground)',
                minWidth: 'auto',
                padding: 8,
              }}
            >
              &lt;
            </button>
            <h1 style={{ fontSize: '1.5rem' }}>
              {year}년 {month + 1}월
            </h1>
            <button
              aria-label="다음 달"
              onClick={nextMonth}
              style={{
                background: 'transparent',
                color: 'var(--foreground)',
                minWidth: 'auto',
                padding: 8,
              }}
            >
              &gt;
            </button>
          </div>
        </header>
        <section className="calendar-panel" onTouchEnd={onTouchEnd} onTouchStart={onTouchStart}>
          <div className="calendar-grid">
            {DAYS_OF_WEEK.map((day, index) => (
              <div
                key={day}
                className={`calendar-day-header ${index === 0 ? 'sun' : ''} ${index === 6 ? 'sat' : ''}`}
              >
                {day}
              </div>
            ))}
            {cells.map((cell) => {
              const dateKey = toDateKey(year, month + 1, cell.date);
              const gratitudeCount = cell.isCurrentMonth
                ? (thankYousByDate.get(dateKey)?.length ?? 0)
                : 0;
              const hasAnniversary =
                cell.isCurrentMonth &&
                (calendarItemsByDate.get(dateKey) ?? []).some((item) => item.type !== 'holiday');
              const isSelected =
                cell.isCurrentMonth &&
                cell.date === selectedDate.getDate() &&
                month === selectedDate.getMonth() &&
                year === selectedDate.getFullYear();
              let activity = '';
              if (gratitudeCount === 1) activity = 'activity-light';
              else if (gratitudeCount >= 2) activity = 'activity-dark';
              return (
                <div
                  key={cell.key}
                  className={[
                    'calendar-cell',
                    !cell.isCurrentMonth && 'faded',
                    activity,
                    hasAnniversary && 'has-anniversary',
                    isSelected && 'selected',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => {
                    if (cell.isCurrentMonth) setSelectedDate(new Date(year, month, cell.date));
                  }}
                  role="button"
                  style={{ cursor: cell.isCurrentMonth ? 'pointer' : 'default' }}
                  tabIndex={cell.isCurrentMonth ? 0 : -1}
                >
                  <span
                    className={`date-number ${cell.isCurrentMonth && isToday(cell.date) ? 'today' : ''}`}
                  >
                    {cell.date}
                  </span>
                  {hasAnniversary ? (
                    <span aria-hidden="true" className="anniversary-marker" />
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
        <section style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
          <h3
            style={{
              alignItems: 'center',
              display: 'flex',
              fontSize: '1.125rem',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <span>
              {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
            </span>
            {canWrite ? (
              <button
                onClick={openModal}
                style={{
                  background: 'transparent',
                  color: 'var(--accent)',
                  minWidth: 0,
                  padding: 0,
                }}
                type="button"
              >
                + 작성하기
              </button>
            ) : (
              <button
                onClick={() => router.push('/targets')}
                style={{
                  background: 'transparent',
                  color: 'var(--accent)',
                  minWidth: 0,
                  padding: 0,
                }}
                type="button"
              >
                + 대상 추가
              </button>
            )}
          </h3>
          {groupedByTarget.length === 0 &&
          otherThankYous.length === 0 &&
          selectedHolidays.length === 0 ? (
            <div
              style={{
                color: 'var(--muted)',
                fontSize: '0.9375rem',
                padding: '32px 0',
                textAlign: 'center',
              }}
            >
              표시할 기념일이나 감사 기록이 없습니다.
            </div>
          ) : null}
          <div style={{ display: 'grid', gap: 12 }}>
            {groupedByTarget.map((group) => (
              <article
                key={group.target?.id ?? 'deleted-target'}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <strong>{group.target?.name ?? '삭제된 대상'}</strong>
                {group.events.map((event) => (
                  <p key={event.id} style={{ color: 'var(--accent-strong)', margin: '8px 0 0' }}>
                    🎉 {event.title}
                  </p>
                ))}
                {group.thankYous.map((thankYou) => (
                  <p key={thankYou.id} style={{ margin: '8px 0 0' }}>
                    💌 {thankYou.content}
                  </p>
                ))}
              </article>
            ))}
            {otherThankYous.length > 0 ? (
              <article
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <strong>기타 감사</strong>
                {otherThankYous.map((thankYou) => (
                  <p key={thankYou.id} style={{ margin: '8px 0 0' }}>
                    💌 {thankYou.content}
                  </p>
                ))}
              </article>
            ) : null}
            {selectedHolidays.length > 0 ? (
              <article
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <strong>공휴일</strong>
                {selectedHolidays.map((holiday) => (
                  <p key={holiday.id} style={{ margin: '8px 0 0' }}>
                    📅 {holiday.title}
                  </p>
                ))}
              </article>
            ) : null}
          </div>
        </section>
        <BottomNav active="write" />
      </section>
      {showModal ? (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            {saved ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
                <h2 style={{ color: 'var(--accent-strong)' }}>감사 일기가 저장되었습니다!</h2>
                <p style={{ fontSize: '0.875rem', marginTop: 8 }}>
                  {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일에 기록됨
                </p>
              </div>
            ) : (
              <form action={submitThankYou} style={{ display: 'grid', gap: 16 }}>
                <div
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <h2 style={{ fontSize: '1.25rem' }}>감사 일기 작성</h2>
                    <p style={{ fontSize: '0.8125rem', marginTop: 4 }}>
                      {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일에 기록합니다
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    style={{
                      background: 'transparent',
                      color: 'var(--muted)',
                      fontSize: '1.25rem',
                      minWidth: 'auto',
                      padding: '4px 8px',
                    }}
                    type="button"
                  >
                    ✕
                  </button>
                </div>

                <input name="date" type="hidden" value={selectedDateKey} />

                <label style={{ display: 'grid', gap: 8 }}>
                  <span className="panel-label" style={{ marginBottom: 0 }}>
                    감사 대상
                  </span>
                  <select
                    name="target_id"
                    onChange={(event) => setSelectedTargetId(event.target.value)}
                    required
                    style={{
                      background: 'var(--surface-strong)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      color: 'var(--foreground)',
                      font: 'inherit',
                      fontSize: '0.9375rem',
                      padding: '12px 14px',
                      width: '100%',
                    }}
                    value={selectedTargetId}
                  >
                    {targets.map((target) => (
                      <option key={target.id} value={target.id}>
                        {target.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 8 }}>
                  <span className="panel-label" style={{ marginBottom: 0 }}>
                    감사한 일
                  </span>
                  <textarea
                    name="content"
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="오늘 감사했던 순간을 적어보세요..."
                    required
                    rows={4}
                    style={{
                      background: 'var(--surface-strong)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      color: 'var(--foreground)',
                      font: 'inherit',
                      fontSize: '0.9375rem',
                      lineHeight: 1.6,
                      padding: 14,
                      resize: 'vertical',
                      width: '100%',
                    }}
                    value={content}
                  />
                </label>

                {clientError ? (
                  <p
                    role="alert"
                    style={{
                      background: '#fff1ed',
                      borderRadius: 16,
                      color: '#9a3412',
                      fontSize: '0.875rem',
                      lineHeight: 1.4,
                      padding: '10px 12px',
                    }}
                  >
                    {clientError}
                  </p>
                ) : null}

                <button
                  disabled={!canSubmit}
                  style={{ opacity: canSubmit ? 1 : 0.5, padding: 14, width: '100%' }}
                  type="submit"
                >
                  {isPending ? '저장 중' : '저장하기'}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
