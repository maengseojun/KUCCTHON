'use client';

import Link from 'next/link';
import { useMemo, useState, type TouchEvent } from 'react';

import { BottomNav } from '@/components/nav/bottom-nav';
import { toDateKey } from '@/lib/calendar/dates';
import type { ThankYou } from '@/lib/queries/thank-yous';

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'] as const;
const GRID_SIZE = 42;

type WriteCalendarProps = {
  entries: ThankYou[];
};

type Cell = {
  date: number;
  isCurrentMonth: boolean;
  key: string;
};

function buildCalendarCells(year: number, month: number): Cell[] {
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells: Cell[] = [];

  for (let i = 0; i < firstDayOfMonth; i += 1) {
    const date = daysInPrevMonth - firstDayOfMonth + i + 1;
    cells.push({ date, isCurrentMonth: false, key: `p${date}` });
  }

  for (let date = 1; date <= daysInMonth; date += 1) {
    cells.push({ date, isCurrentMonth: true, key: `c${date}` });
  }

  for (let date = 1; cells.length < GRID_SIZE; date += 1) {
    cells.push({ date, isCurrentMonth: false, key: `n${date}` });
  }

  return cells;
}

function groupEntriesByDate(entries: ThankYou[]) {
  return entries.reduce<Record<string, ThankYou[]>>((grouped, entry) => {
    grouped[entry.entry_date] = [...(grouped[entry.entry_date] ?? []), entry];
    return grouped;
  }, {});
}

export function WriteCalendar({ entries }: WriteCalendarProps) {
  const now = new Date();
  const [baseDate, setBaseDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(now);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const entriesByDate = useMemo(() => groupEntriesByDate(entries), [entries]);
  const cells = useMemo(() => buildCalendarCells(year, month), [year, month]);

  const prevMonth = () => setBaseDate(new Date(year, month - 1, 1));
  const nextMonth = () => setBaseDate(new Date(year, month + 1, 1));

  const onTouchStart = (event: TouchEvent) => {
    setTouchStartX(event.targetTouches[0].clientX);
  };

  const onTouchEnd = (event: TouchEvent) => {
    if (touchStartX === null) {
      return;
    }

    const diff = touchStartX - event.changedTouches[0].clientX;

    if (diff > 50) {
      nextMonth();
    } else if (diff < -50) {
      prevMonth();
    }

    setTouchStartX(null);
  };

  const selectedKey = toDateKey(
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1,
    selectedDate.getDate()
  );
  const selectedEntries = entriesByDate[selectedKey] ?? [];

  const isToday = (date: number) =>
    date === now.getDate() && month === now.getMonth() && year === now.getFullYear();

  const entryCount = (date: number) => entriesByDate[toDateKey(year, month + 1, date)]?.length ?? 0;

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
              type="button"
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
              type="button"
            >
              &gt;
            </button>
          </div>
        </header>

        <section className="calendar-panel" onTouchEnd={onTouchEnd} onTouchStart={onTouchStart}>
          <div className="calendar-grid">
            {DAYS_OF_WEEK.map((day, index) => (
              <div
                className={`calendar-day-header ${index === 0 ? 'sun' : ''} ${
                  index === 6 ? 'sat' : ''
                }`}
                key={day}
              >
                {day}
              </div>
            ))}

            {cells.map((cell) => {
              const today = cell.isCurrentMonth && isToday(cell.date);
              const count = cell.isCurrentMonth ? entryCount(cell.date) : 0;
              const isSelected =
                cell.isCurrentMonth &&
                cell.date === selectedDate.getDate() &&
                month === selectedDate.getMonth() &&
                year === selectedDate.getFullYear();
              const activity = count >= 2 ? 'activity-dark' : count === 1 ? 'activity-light' : '';

              return (
                <div
                  className={[
                    'calendar-cell',
                    !cell.isCurrentMonth && 'faded',
                    activity,
                    isSelected && 'selected',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  key={cell.key}
                  onClick={() => {
                    if (cell.isCurrentMonth) {
                      setSelectedDate(new Date(year, month, cell.date));
                    }
                  }}
                  role="button"
                  style={{ cursor: cell.isCurrentMonth ? 'pointer' : 'default' }}
                  tabIndex={cell.isCurrentMonth ? 0 : -1}
                >
                  <span className={`date-number ${today ? 'today' : ''}`}>{cell.date}</span>
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
              {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 감사 기록
            </span>
            <Link
              href="/events/new"
              style={{ color: 'var(--accent)', fontSize: '0.875rem', textDecoration: 'none' }}
            >
              + 기념일 등록
            </Link>
          </h3>

          {selectedEntries.length > 0 ? (
            <ul style={{ display: 'grid', gap: 10, listStyle: 'none', margin: 0, padding: 0 }}>
              {selectedEntries.map((entry) => (
                <li
                  key={entry.id}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    padding: 16,
                  }}
                >
                  <p style={{ color: 'var(--foreground)', fontSize: '0.9375rem', margin: 0 }}>
                    {entry.content}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div
              style={{
                color: 'var(--muted)',
                fontSize: '0.9375rem',
                padding: '32px 0',
                textAlign: 'center',
              }}
            >
              작성된 감사 일기가 없습니다.
            </div>
          )}
        </section>

        <section className="quick-compose" style={{ margin: 16, marginTop: 'auto' }}>
          <div>
            <p className="panel-label">오늘의 감사</p>
            <h2 style={{ fontSize: '1.125rem' }}>오늘 감사한 일을 적어보세요</h2>
          </div>
          <button type="button">작성</button>
        </section>

        <BottomNav active="write" />
      </section>
    </main>
  );
}
