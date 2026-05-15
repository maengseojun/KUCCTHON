'use client';

import { useState, useEffect, useCallback, type TouchEvent } from 'react';
import Link from 'next/link';
import { BottomNav } from '@/components/nav/bottom-nav';

// ── Types ──
type Entry = {
  id: number;
  text: string;
  targetName?: string;
  isAnniversary?: boolean;
};

type EntriesMap = Record<string, Entry[]>;

// ── Initial mock data ──
const SEED_ENTRIES: EntriesMap = {
  '2026-5-3': [{ id: 1, text: '오랜만에 만난 친구가 커피를 사주었다.', targetName: '친구' }],
  '2026-5-5': [
    { id: 2, text: '어린이날 기념으로 동생과 재미있게 놀았다.', targetName: '기타' },
    { id: 3, text: '날씨가 너무 맑아서 기분이 좋았다.', targetName: '나 자신' },
  ],
  '2026-5-10': [
    {
      id: 4,
      text: '팀원들이 다 같이 밤새며 프로젝트를 완성했다! 너무 고마운 팀원들.',
      targetName: '친구',
    },
  ],
  '2026-5-14': [
    { id: 5, text: '로즈데이 기념으로 꽃을 받았다.', isAnniversary: true, targetName: '연인' },
    { id: 6, text: '지하철에 바로 자리가 나서 편하게 왔다.', targetName: '나 자신' },
  ],
  '2026-5-16': [
    { id: 7, text: '새로운 캘린더 기능을 멋지게 구현했다.', targetName: '나 자신' },
  ],
};

const TARGET_OPTIONS = [
  { value: '', label: '선택하세요' },
  { value: '부모님', label: '부모님' },
  { value: '연인', label: '연인' },
  { value: '친구', label: '친구' },
  { value: '나 자신', label: '나 자신' },
  { value: '기타', label: '기타' },
] as const;

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'] as const;
const GRID_SIZE = 42; // 7 × 6
const STORAGE_KEY = 'gratitude-entries';
const SEED_VERSION_KEY = 'gratitude-seed-version';
const SEED_VERSION = '4';

// ── Helpers ──
function dateKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function loadEntries(): EntriesMap {
  if (typeof window === 'undefined') return SEED_ENTRIES;
  try {
    const storedVersion = localStorage.getItem(SEED_VERSION_KEY);
    if (storedVersion === SEED_VERSION) {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as EntriesMap;
    }
  } catch {
    /* ignore */
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_ENTRIES));
  localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
  return SEED_ENTRIES;
}

function saveEntries(map: EntriesMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

function getNextId(map: EntriesMap): number {
  let max = 0;
  for (const list of Object.values(map)) {
    for (const e of list) {
      if (e.id > max) max = e.id;
    }
  }
  return max + 1;
}

// 3-level: light (1) → medium (2) → dark (3+)
function activityLevel(count: number): string {
  if (count <= 0) return '';
  if (count === 1) return 'activity-light';
  if (count === 2) return 'activity-medium';
  return 'activity-dark';
}

export default function WritePage() {
  const now = new Date();
  const [baseDate, setBaseDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(now);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [entries, setEntries] = useState<EntriesMap>({});
  const [hydrated, setHydrated] = useState(false);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [formTarget, setFormTarget] = useState('');
  const [formContent, setFormContent] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(loadEntries());
    setHydrated(true);
  }, []);

  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const prevMonth = () => setBaseDate(new Date(year, month - 1, 1));
  const nextMonth = () => setBaseDate(new Date(year, month + 1, 1));

  const onTouchStart = (e: TouchEvent) => setTouchStartX(e.targetTouches[0].clientX);
  const onTouchEnd = (e: TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 50) nextMonth();
    else if (diff < -50) prevMonth();
    setTouchStartX(null);
  };

  // Calendar grid
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

  const selectedKey = dateKey(selectedDate);
  const selectedEntries = entries[selectedKey] ?? [];

  const isToday = (d: number) =>
    d === now.getDate() && month === now.getMonth() && year === now.getFullYear();

  const entryCount = useCallback(
    (d: number) => (entries[`${year}-${month + 1}-${d}`] ?? []).length,
    [entries, year, month],
  );

  // Modal handlers
  const openModal = () => {
    setFormTarget('');
    setFormContent('');
    setSaved(false);
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  const handleSave = () => {
    if (!formContent.trim()) return;
    const key = selectedKey;
    const newEntry: Entry = {
      id: getNextId(entries),
      text: formContent.trim(),
      targetName: formTarget || undefined,
    };
    const updated: EntriesMap = {
      ...entries,
      [key]: [...(entries[key] ?? []), newEntry],
    };
    setEntries(updated);
    saveEntries(updated);
    setSaved(true);
    setTimeout(() => setShowModal(false), 800);
  };

  if (!hydrated) {
    return (
      <main className="demo-stage">
        <section
          className="phone-shell"
          style={{ alignItems: 'center', justifyContent: 'center' }}
        >
          <p style={{ color: 'var(--muted)' }}>로딩 중...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="demo-stage" aria-label="감사 일기 작성">
      <section className="phone-shell">
        {/* Header with month navigation */}
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

        {/* Calendar */}
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
                    activityLevel(count),
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

        {/* Selected-day entries – notebook style from main */}
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
              {selectedEntries.length > 0 && (
                <span style={{ fontSize: '0.875rem', color: 'var(--accent)', marginLeft: 6 }}>
                  ({selectedEntries.length}개)
                </span>
              )}
            </span>
            <Link
              href="/events/new"
              style={{ fontSize: '0.875rem', color: 'var(--accent)', textDecoration: 'none' }}
            >
              + 기념일 등록
            </Link>
          </h3>

          {selectedEntries.length > 0 ? (
            <div
              aria-label="선택한 날짜의 감사 기록"
              style={{
                position: 'relative',
                overflow: 'hidden',
                minHeight: 132,
                padding: '18px 18px 18px 32px',
                border: '1px solid rgba(115, 145, 132, 0.24)',
                borderRadius: 14,
                background:
                  'linear-gradient(to bottom, transparent 31px, rgba(86, 123, 108, 0.14) 32px), #fffdf6',
                backgroundSize: '100% 32px',
                boxShadow: '0 8px 18px rgba(42, 68, 56, 0.06)',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: 20,
                  top: 0,
                  bottom: 0,
                  width: 1,
                  background: 'rgba(216, 118, 118, 0.38)',
                }}
              />

              {selectedEntries.map((entry, index) => (
                <article
                  key={entry.id}
                  style={{
                    position: 'relative',
                    marginTop: index === 0 ? 0 : 18,
                    paddingBottom: 2,
                  }}
                >
                  {entry.targetName && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        minHeight: 22,
                        padding: '0 8px',
                        borderRadius: 999,
                        background: entry.isAnniversary
                          ? 'rgba(255, 230, 200, 0.9)'
                          : 'rgba(209, 235, 226, 0.9)',
                        color: 'var(--accent-strong)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        marginBottom: 6,
                      }}
                    >
                      {entry.isAnniversary ? '🎉 기념일' : '감사 대상'}: {entry.targetName}
                    </div>
                  )}
                  <p
                    style={{
                      margin: 0,
                      color: 'var(--foreground)',
                      fontSize: '0.9375rem',
                      lineHeight: '1.85',
                    }}
                  >
                    {entry.text}
                  </p>
                </article>
              ))}
            </div>
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

        {/* Quick compose */}
        <section className="quick-compose" style={{ margin: 16, marginTop: 'auto' }}>
          <div>
            <p className="panel-label">
              {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
            </p>
            <h2 style={{ fontSize: '1.125rem' }}>오늘 감사한 일을 적어보세요</h2>
          </div>
          <button type="button" onClick={openModal}>
            작성
          </button>
        </section>

        <BottomNav active="write" />
      </section>

      {/* ── Write Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {saved ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
                <h2 style={{ color: 'var(--accent-strong)' }}>감사 일기가 저장되었습니다!</h2>
                <p style={{ marginTop: 8, fontSize: '0.875rem' }}>
                  {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일에 기록됨
                </p>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 20,
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
                      minWidth: 'auto',
                      padding: '4px 8px',
                      fontSize: '1.25rem',
                    }}
                  >
                    ✕
                  </button>
                </div>

                <label style={{ display: 'block', marginBottom: 16 }}>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: 'var(--accent-strong)',
                      marginBottom: 8,
                    }}
                  >
                    감사 대상
                  </span>
                  <select
                    value={formTarget}
                    onChange={(e) => setFormTarget(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      background: 'var(--surface-strong)',
                      color: 'var(--foreground)',
                      font: 'inherit',
                      fontSize: '0.9375rem',
                    }}
                  >
                    {TARGET_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ display: 'block', marginBottom: 20 }}>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: 'var(--accent-strong)',
                      marginBottom: 8,
                    }}
                  >
                    감사한 일
                  </span>
                  <textarea
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    placeholder="오늘 감사했던 순간을 적어보세요..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      background: 'var(--surface-strong)',
                      color: 'var(--foreground)',
                      font: 'inherit',
                      fontSize: '0.9375rem',
                      resize: 'vertical',
                      lineHeight: 1.6,
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!formContent.trim()}
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '1rem',
                    opacity: formContent.trim() ? 1 : 0.5,
                  }}
                >
                  저장하기
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
