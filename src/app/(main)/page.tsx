'use client';

import { useState, TouchEvent } from 'react';
import Link from 'next/link';

// Mock Data for entries
const mockEntries: Record<string, { id: number, text: string, to?: string, isAnniversary?: boolean, targetName?: string }[]> = {
  '2026-5-3': [{ id: 1, text: '오랜만에 만난 친구가 커피를 사주었다.' }],
  '2026-5-5': [{ id: 2, text: '어린이날 기념으로 동생과 재미있게 놀았다.' }, { id: 3, text: '날씨가 너무 맑아서 기분이 좋았다.' }],
  '2026-5-10': [{ id: 4, text: '팀원들이 다 같이 밤새며 프로젝트를 완성했다! 너무 고마운 팀원들.' }],
  '2026-5-14': [{ id: 5, text: '로즈데이 기념으로 꽃을 받았다.', isAnniversary: true, targetName: '연인' }, { id: 6, text: '지하철에 바로 자리가 나서 편하게 왔다.' }],
  '2026-5-16': [{ id: 7, text: '새로운 캘린더 기능을 멋지게 구현했다.' }],
};

export default function Page() {
  const [baseDate, setBaseDate] = useState(new Date(2026, 4, 16)); // May 16, 2026
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 4, 16));
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const year = baseDate.getFullYear();
  const month = baseDate.getMonth() + 1; // 1-12
  const today = new Date(2026, 4, 16); // Fixed "today" for demo purposes

  // Navigation
  const prevMonth = () => setBaseDate(new Date(year, month - 2, 1));
  const nextMonth = () => setBaseDate(new Date(year, month, 1));

  // Swipe handling
  const handleTouchStart = (e: TouchEvent) => setTouchStartX(e.targetTouches[0].clientX);
  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 50) nextMonth(); // Swipe left
    else if (diff < -50) prevMonth(); // Swipe right
    setTouchStartX(null);
  };

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate();

  const calendarCells = [];
  
  // Prev month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push({ date: daysInPrevMonth - firstDayOfMonth + i + 1, isCurrentMonth: false, fullDateString: '' });
  }
  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({ date: i, isCurrentMonth: true, fullDateString: `${year}-${month}-${i}` });
  }
  // Next month
  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarCells.push({ date: i, isCurrentMonth: false, fullDateString: '' });
  }

  const selectedDateString = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`;
  const selectedEntries = mockEntries[selectedDateString] || [];

  return (
    <main className="demo-stage" aria-label="KUCCTHON mobile app preview">
      <section className="phone-shell">
        <header className="app-header" style={{ justifyContent: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button onClick={prevMonth} style={{ background: 'transparent', color: 'var(--foreground)', padding: '8px', minWidth: 'auto' }}>
              &lt;
            </button>
            <h1 style={{ fontSize: '1.5rem' }}>{year}년 {month}월</h1>
            <button onClick={nextMonth} style={{ background: 'transparent', color: 'var(--foreground)', padding: '8px', minWidth: 'auto' }}>
              &gt;
            </button>
          </div>
          <div className="notification-dot" aria-label="Unread notifications" style={{ position: 'absolute', right: '24px' }}>
            1
          </div>
        </header>

        <section 
          className="calendar-panel" 
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="calendar-grid">
            {daysOfWeek.map((day, index) => (
              <div key={day} className={`calendar-day-header ${index === 0 ? 'sun' : ''} ${index === 6 ? 'sat' : ''}`}>
                {day}
              </div>
            ))}
            
            {calendarCells.map((cell, index) => {
              const isToday = cell.isCurrentMonth && cell.date === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();
              const isSelected = cell.isCurrentMonth && cell.fullDateString === selectedDateString;
              const entriesCount = cell.fullDateString ? (mockEntries[cell.fullDateString]?.length || 0) : 0;
              
              let activityClass = '';
              if (cell.isCurrentMonth) {
                if (entriesCount > 0 && entriesCount < 2) activityClass = 'activity-light';
                else if (entriesCount >= 2) activityClass = 'activity-dark';
              }

              return (
                <div 
                  key={index} 
                  onClick={() => {
                    if (cell.isCurrentMonth) setSelectedDate(new Date(year, month - 1, cell.date));
                  }}
                  className={`calendar-cell ${!cell.isCurrentMonth ? 'faded' : ''} ${activityClass} ${isSelected ? 'selected' : ''}`}
                  style={{ cursor: cell.isCurrentMonth ? 'pointer' : 'default' }}
                >
                  <span className={`date-number ${isToday ? 'today' : ''}`}>
                    {cell.date}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="entries-viewer" style={{ padding: '0 20px', flex: 1, overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 감사 기록</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--accent)', cursor: 'pointer' }}>+ 기념일 등록</span>
          </h3>
          
          {selectedEntries.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '10px' }}>
              {selectedEntries.map(entry => (
                <li key={entry.id} style={{ background: 'var(--surface)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  {entry.isAnniversary && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-strong)', fontWeight: 700, marginBottom: '4px' }}>
                      🎉 기념일 ({entry.targetName})
                    </div>
                  )}
                  <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--foreground)' }}>{entry.text}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)', fontSize: '0.9375rem' }}>
              작성된 감사 일기가 없습니다.
            </div>
          )}
        </section>

        <section className="quick-compose" style={{ margin: '16px', marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p className="panel-label">오늘의 감사</p>
            <h2 style={{ fontSize: '1.125rem' }}>오늘 감사한 일은 적어보세요</h2>
          </div>
          <Link href="/write" style={{ textDecoration: 'none' }}>
            <button type="button">작성</button>
          </Link>
        </section>

        <nav className="bottom-tabs" aria-label="Demo app navigation">
          <span className="active">홈</span>
          <Link href="/write" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}><span>작성</span></Link>
          <span>친구</span>
          <span>알림</span>
          <span>마이페이지</span>
        </nav>
      </section>
    </main>
  );
}
