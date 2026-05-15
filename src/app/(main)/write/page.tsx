'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { BottomNav } from '@/components/nav/bottom-nav';

type Entry = {
  id: number;
  text: string;
  targetName: string;
  isAnniversary?: boolean;
  anniversaryTitle?: string;
};

type EntriesMap = Record<string, Entry[]>;

const copy = {
  month: '\uC6D4',
  day: '\uC77C',
  record: '\uAC10\uC0AC \uAE30\uB85D',
  addEvent: '+ \uAE30\uB150\uC77C \uB4F1\uB85D',
  event: '\uAE30\uB150\uC77C',
  target: '\uAC10\uC0AC \uB300\uC0C1',
  empty: '\uC791\uC131\uB41C \uAC10\uC0AC \uC77C\uAE30\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.',
  prompt: '\uC624\uB298 \uAC10\uC0AC\uD55C \uC77C\uC744 \uC801\uC5B4\uBCF4\uC138\uC694',
  write: '\uC791\uC131',
  edit: '\uC218\uC815',
  remove: '\uC0AD\uC81C',
  save: '\uC800\uC7A5\uD558\uAE30',
};

const seedEntries: EntriesMap = {
  '2026-5-3': [
    {
      id: 1,
      targetName: '\uCE5C\uAD6C',
      text: '\uC624\uB79C\uB9CC\uC5D0 \uB9CC\uB09C \uCE5C\uAD6C\uAC00 \uCEE4\uD53C\uB97C \uC0AC\uC900\uC5B4.',
    },
  ],
  '2026-5-5': [
    {
      id: 2,
      targetName: '\uAE30\uD0C0',
      text: '\uC5B4\uB9B0\uC774\uB0A0 \uAE30\uB150\uC73C\uB85C \uB3D9\uC0DD\uACFC \uC7AC\uBBF8\uC788\uAC8C \uBCF4\uB0C8\uB2E4.',
    },
  ],
  '2026-5-10': [
    {
      id: 3,
      targetName: '\uCE5C\uAD6C',
      text: '\uD504\uB85C\uC81D\uD2B8\uB97C \uC644\uC131\uD574\uC11C \uB108\uBB34 \uAC10\uC0AC\uD588\uB2E4.',
      isAnniversary: true,
      anniversaryTitle: '\uD504\uB85C\uC81D\uD2B8 \uC644\uB8CC',
    },
  ],
  '2026-5-14': [
    {
      id: 4,
      targetName: '\uC5F0\uC778',
      text: '\uB85C\uC988\uB370\uC774 \uAE30\uB150\uC73C\uB85C \uAF43\uC744 \uBC1B\uC558\uB2E4.',
      isAnniversary: true,
      anniversaryTitle: '\uB85C\uC988\uB370\uC774',
    },
    {
      id: 5,
      targetName: '\uB098 \uC790\uC2E0',
      text: '\uC9C0\uD558\uCCA0\uC5D0 \uBC14\uB85C \uC790\uB9AC\uAC00 \uB098\uC11C \uD3B8\uD558\uAC8C \uC654\uB2E4.',
    },
  ],
  '2026-5-16': [
    {
      id: 6,
      targetName: '\uB098 \uC790\uC2E0',
      text: '\uC0C8\uB85C\uC6B4 \uAE30\uB2A5\uC774 \uBA4B\uC9C0\uAC8C \uAD6C\uD604\uB418\uC5C8\uB2E4.',
    },
  ],
};

const days = ['\uC77C', '\uC6D4', '\uD654', '\uC218', '\uBAA9', '\uAE08', '\uD1A0'];
const storageKey = 'gratitude-entries';
const seedVersionKey = 'gratitude-seed-version';
const seedVersion = '6';

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function loadEntries() {
  if (typeof window === 'undefined') {
    return seedEntries;
  }

  try {
    const version = localStorage.getItem(seedVersionKey);
    const raw = localStorage.getItem(storageKey);

    if (version === seedVersion && raw) {
      return JSON.parse(raw) as EntriesMap;
    }

    localStorage.setItem(storageKey, JSON.stringify(seedEntries));
    localStorage.setItem(seedVersionKey, seedVersion);
  } catch {
    return seedEntries;
  }

  return seedEntries;
}

function saveEntries(entries: EntriesMap) {
  localStorage.setItem(storageKey, JSON.stringify(entries));
}

function getCells(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();
  const cells = [];

  for (let index = 0; index < firstDay; index += 1) {
    cells.push({
      date: daysInPreviousMonth - firstDay + index + 1,
      current: false,
      key: `p-${index}`,
    });
  }

  for (let date = 1; date <= daysInMonth; date += 1) {
    cells.push({ date, current: true, key: `c-${date}` });
  }

  for (let date = 1; cells.length < 42; date += 1) {
    cells.push({ date, current: false, key: `n-${date}` });
  }

  return cells;
}

function activityClass(entries: Entry[]) {
  if (entries.some((entry) => entry.isAnniversary)) {
    return 'activity-anniversary';
  }

  return entries.length > 1 ? 'activity-dark' : entries.length === 1 ? 'activity-light' : '';
}

export default function WritePage() {
  const today = new Date();
  const [baseDate, setBaseDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);
  const [entries, setEntries] = useState<EntriesMap>(() => loadEntries());
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [draftTarget, setDraftTarget] = useState('');
  const [draftText, setDraftText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const cells = useMemo(() => getCells(year, month), [month, year]);
  const selectedKey = getDateKey(selectedDate);
  const selectedEntries = entries[selectedKey] ?? [];
  const anniversaries = selectedEntries.filter((entry) => entry.isAnniversary);

  function openEditor(entry?: Entry) {
    setEditingEntry(entry ?? null);
    setDraftTarget(entry?.targetName ?? '');
    setDraftText(entry?.text ?? '');
    setIsModalOpen(true);
  }

  function updateEntries(nextEntries: EntriesMap) {
    setEntries(nextEntries);
    saveEntries(nextEntries);
  }

  function saveEntry() {
    if (!draftText.trim()) {
      return;
    }

    const nextEntry: Entry = {
      id: editingEntry?.id ?? Date.now(),
      targetName: draftTarget || '\uAE30\uD0C0',
      text: draftText.trim(),
      isAnniversary: editingEntry?.isAnniversary,
      anniversaryTitle: editingEntry?.anniversaryTitle,
    };
    const nextSelectedEntries = editingEntry
      ? selectedEntries.map((entry) => (entry.id === editingEntry.id ? nextEntry : entry))
      : [...selectedEntries, nextEntry];

    updateEntries({ ...entries, [selectedKey]: nextSelectedEntries });
    setIsModalOpen(false);
  }

  function deleteEntry(entryId: number) {
    updateEntries({
      ...entries,
      [selectedKey]: selectedEntries.filter((entry) => entry.id !== entryId),
    });
  }

  return (
    <main className="demo-stage" aria-label="\uAC10\uC0AC \uC77C\uAE30 \uC791\uC131">
      <section className="phone-shell">
        <header className="app-header" style={{ justifyContent: 'center' }}>
          <button type="button" onClick={() => setBaseDate(new Date(year, month - 1, 1))}>
            &lt;
          </button>
          <h1 style={{ fontSize: '1.5rem' }}>
            {year}\uB144 {month + 1}
            {copy.month}
          </h1>
          <button type="button" onClick={() => setBaseDate(new Date(year, month + 1, 1))}>
            &gt;
          </button>
        </header>

        <section className="calendar-panel">
          <div className="calendar-grid">
            {days.map((day, index) => (
              <div
                className={`calendar-day-header ${index === 0 ? 'sun' : ''} ${index === 6 ? 'sat' : ''}`}
                key={day}
              >
                {day}
              </div>
            ))}
            {cells.map((cell) => {
              const key = `${year}-${month + 1}-${cell.date}`;
              const dayEntries = cell.current ? (entries[key] ?? []) : [];
              const selected =
                cell.current &&
                selectedDate.getFullYear() === year &&
                selectedDate.getMonth() === month &&
                selectedDate.getDate() === cell.date;

              return (
                <button
                  className={[
                    'calendar-cell',
                    !cell.current && 'faded',
                    activityClass(dayEntries),
                    selected && 'selected',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  disabled={!cell.current}
                  key={cell.key}
                  onClick={() => setSelectedDate(new Date(year, month, cell.date))}
                  type="button"
                >
                  <span className="date-number">{cell.date}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section style={{ flex: 1, overflowY: 'auto', padding: '22px 20px 0' }}>
          <h3
            style={{
              alignItems: 'center',
              display: 'flex',
              fontSize: '1.125rem',
              justifyContent: 'space-between',
              margin: '0 0 12px',
            }}
          >
            <span>
              {selectedDate.getMonth() + 1}
              {copy.month} {selectedDate.getDate()}
              {copy.day} {copy.record}{' '}
              {selectedEntries.length > 0 && (
                <span style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>
                  ({selectedEntries.length}\uAC1C)
                </span>
              )}
            </span>
            <Link
              href="/events/new"
              style={{
                color: 'var(--accent)',
                fontSize: '0.875rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              {copy.addEvent}
            </Link>
          </h3>

          {anniversaries.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {anniversaries.map((entry) => (
                <span className="entry-chip anniversary-chip" key={entry.id}>
                  {entry.anniversaryTitle}: {entry.targetName}
                </span>
              ))}
            </div>
          )}

          {selectedEntries.length > 0 ? (
            <div className="notepad-list">
              {selectedEntries.map((entry) => (
                <article className="notepad-entry" key={entry.id}>
                  <div className="entry-row">
                    <span className={`entry-chip ${entry.isAnniversary ? 'anniversary-chip' : ''}`}>
                      {entry.isAnniversary ? copy.event : copy.target}: {entry.targetName}
                    </span>
                    <div className="entry-actions">
                      <button type="button" onClick={() => openEditor(entry)}>
                        {copy.edit}
                      </button>
                      <button type="button" onClick={() => deleteEntry(entry.id)}>
                        {copy.remove}
                      </button>
                    </div>
                  </div>
                  <p>{entry.text}</p>
                </article>
              ))}
            </div>
          ) : (
            <p style={{ padding: '32px 0', textAlign: 'center' }}>{copy.empty}</p>
          )}
        </section>

        <section className="quick-compose" style={{ margin: 16, marginTop: 'auto' }}>
          <div>
            <p className="panel-label">
              {selectedDate.getMonth() + 1}
              {copy.month} {selectedDate.getDate()}
              {copy.day}
            </p>
            <h2 style={{ fontSize: '1.125rem' }}>{copy.prompt}</h2>
          </div>
          <button type="button" onClick={() => openEditor()}>
            {copy.write}
          </button>
        </section>

        <BottomNav active="write" />
      </section>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <label className="form-label">
              <span>{copy.target}</span>
              <select value={draftTarget} onChange={(event) => setDraftTarget(event.target.value)}>
                <option value="">\uC120\uD0DD\uD558\uC138\uC694</option>
                <option value="\uC5F0\uC778">\uC5F0\uC778</option>
                <option value="\uCE5C\uAD6C">\uCE5C\uAD6C</option>
                <option value="\uBD80\uBAA8\uB2D8">\uBD80\uBAA8\uB2D8</option>
                <option value="\uB098 \uC790\uC2E0">\uB098 \uC790\uC2E0</option>
                <option value="\uAE30\uD0C0">\uAE30\uD0C0</option>
              </select>
            </label>
            <label className="form-label">
              <span>\uAC10\uC0AC\uD55C \uC77C</span>
              <textarea
                value={draftText}
                onChange={(event) => setDraftText(event.target.value)}
                rows={4}
              />
            </label>
            <button
              type="button"
              onClick={saveEntry}
              disabled={!draftText.trim()}
              style={{ width: '100%' }}
            >
              {copy.save}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
