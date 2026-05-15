'use client';

import { useState, useEffect, type TouchEvent } from 'react';
import Link from 'next/link';
import { BottomNav } from '@/components/nav/bottom-nav';
import { fetchThankYouList, createThankYou } from '@/actions/thank-yous';
import { createClient } from '@/lib/supabase/client';

type EntryType = { id: string; text: string; isAnniversary?: boolean; targetName?: string };

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'] as const;
const GRID_SIZE = 42; // 7 × 6
//끼야아아아악

// 💡 날짜를 'YYYY-MM-DD' 형식으로 일관되게 포맷팅하는 헬퍼 함수
const formatDateKey = (year: number, month: number, day: number) => {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
};

// Date 객체를 받아 'YYYY-MM-DD' 키로 변환
const getDateKey = (date: Date) => {
  return formatDateKey(date.getFullYear(), date.getMonth() + 1, date.getDate());
};

export default function WritePage() {
  const now = new Date();
  const [baseDate, setBaseDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(now);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [entries, setEntries] = useState<Record<string, EntryType[]>>({});
  const [userId, setUserId] = useState<string | null>(null);

  // 감사 데이터와 사용자 ID 로드
  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user?.id) return;
        setUserId(user.id);

        let thankYouList = await fetchThankYouList();

        const entriesRecord: Record<string, EntryType[]> = {};

        for (const thankYou of thankYouList) {
          // 💡 DB에서 온 thankYou.created_at을 YYYY-MM-DD로 정규화
          const dateObj = new Date(thankYou.created_at);
          if (isNaN(dateObj.getTime())) continue; // 올바르지 않은 날짜 패스

          const key = getDateKey(dateObj);
          
          if (!entriesRecord[key]) {
            entriesRecord[key] = [];
          }
          entriesRecord[key].push({
            id: thankYou.id,
            text: thankYou.content,
            isAnniversary: false,
            targetName: thankYou.target_id || thankYou.to_id || '대상 없음',
          });
        }

        setEntries(entriesRecord);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    }

    loadData();
  }, []);

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

  type Cell = { date: number; isCurrentMonth: boolean; key: string; monthOffset: number };
  const cells: Cell[] = [];

  // 이전 달 날짜 채우기
  for (let i = 0; i < firstDayOfMonth; i++) {
    const d = daysInPrevMonth - firstDayOfMonth + i + 1;
    cells.push({ date: d, isCurrentMonth: false, key: `p${d}`, monthOffset: -1 });
  }
  // 현재 달 날짜 채우기
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ date: i, isCurrentMonth: true, key: `c${i}`, monthOffset: 0 });
  }
  // 다음 달 날짜 채우기
  for (let i = 1; cells.length < GRID_SIZE; i++) {
    cells.push({ date: i, isCurrentMonth: false, key: `n${i}`, monthOffset: 1 });
  }

  // 💡 선택된 날짜 키 정규화 반영
  const selectedKey = getDateKey(selectedDate);
  const selectedEntries = entries[selectedKey] ?? [];

  const isToday = (d: number) =>
    d === now.getDate() && month === now.getMonth() && year === now.getFullYear();

  // 💡 달력에 잔디 그릴 때 일관된 Key 포맷 사용
  const entryCount = (d: number) =>
    (entries[formatDateKey(year, month + 1, d)] ?? []).length;

  return (
    <main className="demo-stage" aria-label="감사 일기 작성">
      <section className="phone-shell">
        {/* ── Header with month navigation ── */}
        <header className="app-header" style={{ justifyContent: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={prevMonth}
              aria-label="이전 달"
              style={{ background: 'transparent', color: 'var(--foreground)', padding: 8, minWidth: 'auto' }}
            >
              &lt;
            </button>
            <h1 style={{ fontSize: '1.5rem' }}>
              {year}년 {month + 1}월
            </h1>
            <button
              onClick={nextMonth}
              aria-label="다음 달"
              style={{ background: 'transparent', color: 'var(--foreground)', padding: 8, minWidth: 'auto' }}
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
                  tabIndex={0}
                  onClick={() => {
                    // 💡 다른 달의 일자를 클릭해도 해당 달/일로 정확히 이동되도록 UX 개선
                    const targetDate = new Date(year, month + cell.monthOffset, cell.date);
                    setSelectedDate(targetDate);
                    if (cell.monthOffset !== 0) {
                      setBaseDate(new Date(targetDate.getFullYear(), targetDate.getMonth(), 1));
                    }
                  }}
                  className={[
                    'calendar-cell',
                    !cell.isCurrentMonth && 'faded',
                    activity,
                    isSelected && 'selected',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={{ cursor: 'pointer' }}
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