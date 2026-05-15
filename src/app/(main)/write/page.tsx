'use client';

import { useState, type TouchEvent } from 'react';
import Link from 'next/link';
import { BottomNav } from '@/components/nav/bottom-nav';

// Mock data – will be replaced with real Supabase queries later
const mockEntries: Record<
  string,
  { id: number; text: string; isAnniversary?: boolean; targetName?: string }[]
> = {
  '2026-5-3': [{ id: 1, text: '오랜만에 만난 친구가 커피를 사주었다.' }],
  '2026-5-5': [
    { id: 2, text: '어린이날 기념으로 동생과 재미있게 놀았다.' },
    { id: 3, text: '날씨가 너무 맑아서 기분이 좋았다.' },
  ],
  '2026-5-10': [
    { id: 4, text: '팀원들이 다 같이 밤새며 프로젝트를 완성했다! 너무 고마운 팀원들.' },
  ],
  '2026-5-14': [
    { id: 5, text: '로즈데이 기념으로 꽃을 받았다.', isAnniversary: true, targetName: '연인' },
    { id: 6, text: '지하철에 바로 자리가 나서 편하게 왔다.' },
  ],
  '2026-5-16': [{ id: 7, text: '새로운 캘린더 기능을 멋지게 구현했다.' }],
};

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'] as const;
const GRID_SIZE = 42; // 7 × 6

export default function WritePage() {
  const now = new Date();
  const [baseDate, setBaseDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(now);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const year = baseDate.getFullYear();
  const month = baseDate.getMonth(); // 0-indexed

  const prevMonth = () => setBaseDate(new Date(year, month - 1, 1));
  const nextMonth = () => setBaseDate(new Date(year, month + 1, 1));

  // Swipe
  const onTouchStart = (e: TouchEvent) => setTouchStartX(e.targetTouches[0].clientX);
  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 50) nextMonth();
    else if (diff < -50) prevMonth();
    setTouchStartX(null);
  };

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  type Cell = { date: number; isCurrentMonth: boolean; key: string };
  const cells: Cell[] = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    const d = daysInPrevMonth - firstDayOfMonth + i + 1;
    cells.push({ date: d, isCurrentMonth: false, key: `p${d}` });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ date: i, isCurrentMonth: true, key: `c${i}` });
  }
  for (let i = 1; cells.length < GRID_SIZE; i++) {
    cells.push({ date: i, isCurrentMonth: false, key: `n${i}` });
  }

  const selectedKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;
  const selectedEntries = mockEntries[selectedKey] ?? [];

  const isToday = (d: number) =>
    d === now.getDate() && month === now.getMonth() && year === now.getFullYear();

  const entryCount = (d: number) => (mockEntries[`${year}-${month + 1}-${d}`] ?? []).length;

  return (
    <main className="demo-stage" aria-label="감사 일기 작성">
      <section className="phone-shell">
        {/* ── Header with month navigation ── */}
        <header className="app-header" style={{ justifyContent: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={prevMonth}
              aria-label="이전 달"
              style={{
                background: 'transparent',
                color: 'var(--foreground)',
                padding: 8,
                minWidth: 'auto',
              }}
            >
              &lt;
            </button>
            <h1 style={{ fontSize: '1.5rem' }}>
              {year}년 {month + 1}월
            </h1>
            <button
              onClick={nextMonth}
              aria-label="다음 달"
              style={{
                background: 'transparent',
                color: 'var(--foreground)',
                padding: 8,
                minWidth: 'auto',
              }}
            >
              &gt;
            </button>
          </div>
        </header>

        {/* ── Calendar ── */}
        <section className="calendar-panel" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="calendar-grid">
            {DAYS_OF_WEEK.map((day, i) => (
              <div
                key={day}
                className={`calendar-day-header ${i === 0 ? 'sun' : ''} ${i === 6 ? 'sat' : ''}`}
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

              let activity = '';
              if (count === 1) activity = 'activity-light';
              else if (count >= 2) activity = 'activity-dark';

              return (
                <div
                  key={cell.key}
                  role="button"
                  tabIndex={cell.isCurrentMonth ? 0 : -1}
                  onClick={() => {
                    if (cell.isCurrentMonth) setSelectedDate(new Date(year, month, cell.date));
                  }}
                  className={[
                    'calendar-cell',
                    !cell.isCurrentMonth && 'faded',
                    activity,
                    isSelected && 'selected',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ cursor: cell.isCurrentMonth ? 'pointer' : 'default' }}
                >
                  <span className={`date-number ${today ? 'today' : ''}`}>{cell.date}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Selected-day entries ── */}
        <section style={{ padding: '0 20px', flex: 1, overflowY: 'auto' }}>
          <h3
            style={{
              fontSize: '1.125rem',
              marginBottom: 12,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>
              {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 감사 기록
            </span>
            <Link
              href="/events/new"
              style={{ fontSize: '0.875rem', color: 'var(--accent)', textDecoration: 'none' }}
            >
              + 기념일 등록
            </Link>
          </h3>

          {selectedEntries.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
              {selectedEntries.map((entry) => (
                <li
                  key={entry.id}
                  style={{
                    background: 'var(--surface)',
                    padding: 16,
                    borderRadius: 16,
                    border: '1px solid var(--border)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  }}
                >
                  {entry.isAnniversary && (
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--accent-strong)',
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      🎉 기념일 ({entry.targetName})
                    </div>
                  )}
                  <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--foreground)' }}>
                    {entry.text}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '32px 0',
                color: 'var(--muted)',
                fontSize: '0.9375rem',
              }}
            >
              작성된 감사 일기가 없습니다.
            </div>
          )}
        </section>

        {/* ── Quick compose ── */}
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
