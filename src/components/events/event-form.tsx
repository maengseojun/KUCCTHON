'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { createEvent } from '@/actions/events';
import { REMINDER_DAY_OPTIONS } from '@/lib/constants/reminders';
import { SUGGESTED_EVENTS, type SuggestedEvent } from '@/lib/constants/suggested-events';
import { toDateKey } from '@/lib/dates/date-key';
import { EVENT_CATEGORIES, EVENT_CATEGORY_LABELS, type EventCategory } from '@/types/event';
import type { Target } from '@/types/target';

type EventFormProps = {
  targets: Target[];
  errorMessage: string | null;
};

const inputStyle = {
  display: 'block',
  width: '100%',
  maxWidth: '100%',
  minWidth: 0,
  border: '1px solid var(--border)',
  borderRadius: 16,
  background: 'var(--surface-strong)',
  color: 'var(--foreground)',
  font: 'inherit',
  padding: '12px 14px',
};

export function EventForm({ targets, errorMessage }: EventFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [clientError, setClientError] = useState<string | null>(null);
  const [selectedTargetId, setSelectedTargetId] = useState(targets[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [category, setCategory] = useState<EventCategory>('birthday');
  const [notifyDays, setNotifyDays] = useState<number[]>([3]);
  const [recursYearly, setRecursYearly] = useState(true);

  const selectedTarget = targets.find((target) => target.id === selectedTargetId);
  const suggestions = selectedTarget
    ? SUGGESTED_EVENTS[selectedTarget.type].filter((suggestion) => {
        if (suggestion.label === '생일') return !selectedTarget.birthday;
        if (suggestion.label === '결혼 기념일') return !selectedTarget.marriage_anniversary;
        if (suggestion.label === '사귀기 시작한 날') return !selectedTarget.relationship_started_on;
        return true;
      })
    : [];
  const visibleError = clientError ?? errorMessage;

  function applySuggestion(suggestion: SuggestedEvent) {
    setTitle(selectedTarget ? `${selectedTarget.name} ${suggestion.label}` : suggestion.label);
    setCategory(suggestion.category);
    setNotifyDays(suggestion.defaultNotifyDaysBefore);
    setRecursYearly(true);

    if (suggestion.fixedDate) {
      const year = new Date().getFullYear();
      setEventDate(toDateKey(year, suggestion.fixedDate.month, suggestion.fixedDate.day));
    }
  }

  function submitEvent(formData: FormData) {
    setClientError(null);
    startTransition(async () => {
      const result = await createEvent(formData);
      if (result.error) {
        setClientError(result.error);
        return;
      }
      router.push('/targets');
    });
  }

  if (targets.length === 0) {
    return (
      <section className="activity-list" aria-label="일정 추가 폼" style={{ gap: 14 }}>
        <p>
          먼저 <Link href="/targets">감사 대상</Link>을 등록해 주세요.
        </p>
      </section>
    );
  }

  return (
    <section className="activity-list" aria-label="일정 추가 폼" style={{ gap: 14 }}>
      <form action={submitEvent} style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 8 }}>
          <span className="panel-label" style={{ marginBottom: 0 }}>
            Target
          </span>
          <select
            name="target_id"
            onChange={(event) => setSelectedTargetId(event.target.value)}
            required
            style={inputStyle}
            value={selectedTargetId}
          >
            {targets.map((target) => (
              <option key={target.id} value={target.id}>
                {target.name}
              </option>
            ))}
          </select>
        </label>

        {suggestions.length > 0 ? (
          <div style={{ display: 'grid', gap: 8 }}>
            <span className="panel-label" style={{ marginBottom: 0 }}>
              Suggested
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.label}
                  onClick={() => applySuggestion(suggestion)}
                  style={{
                    minWidth: 0,
                    background: 'var(--accent-soft)',
                    color: 'var(--accent-strong)',
                    padding: '9px 12px',
                  }}
                  type="button"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <label style={{ display: 'grid', gap: 8 }}>
          <span className="panel-label" style={{ marginBottom: 0 }}>
            Title
          </span>
          <input
            name="title"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="예: 여자친구 생일"
            required
            style={inputStyle}
            type="text"
            value={title}
          />
        </label>

        <label style={{ display: 'grid', gap: 8 }}>
          <span className="panel-label" style={{ marginBottom: 0 }}>
            Date
          </span>
          <input
            name="event_date"
            onChange={(event) => setEventDate(event.target.value)}
            required
            style={inputStyle}
            type="date"
            value={eventDate}
          />
        </label>

        <label style={{ display: 'grid', gap: 8 }}>
          <span className="panel-label" style={{ marginBottom: 0 }}>
            Category
          </span>
          <select
            name="category"
            onChange={(event) => setCategory(event.target.value as EventCategory)}
            required
            style={inputStyle}
            value={category}
          >
            {EVENT_CATEGORIES.map((eventCategory) => (
              <option key={eventCategory} value={eventCategory}>
                {EVENT_CATEGORY_LABELS[eventCategory]}
              </option>
            ))}
          </select>
        </label>

        <fieldset style={{ display: 'grid', gap: 8, border: 0, padding: 0, margin: 0 }}>
          <span className="panel-label" style={{ marginBottom: 0 }}>
            미리 알림
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {REMINDER_DAY_OPTIONS.map((day) => {
              const checked = notifyDays.includes(day);
              return (
                <label
                  key={day}
                  style={{
                    alignItems: 'center',
                    background: checked ? 'var(--accent-soft)' : 'var(--surface-strong)',
                    border: '1px solid var(--border)',
                    borderRadius: 999,
                    color: checked ? 'var(--accent-strong)' : 'var(--foreground)',
                    display: 'inline-flex',
                    gap: 6,
                    padding: '9px 12px',
                  }}
                >
                  <input
                    checked={checked}
                    name="notify_days_before"
                    onChange={() =>
                      setNotifyDays((current) =>
                        current.includes(day)
                          ? current.filter((value) => value !== day)
                          : [...current, day].sort((a, b) => a - b)
                      )
                    }
                    type="checkbox"
                    value={day}
                  />
                  <span>{day}일 전</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            checked={recursYearly}
            name="recurs_yearly"
            onChange={(event) => setRecursYearly(event.target.checked)}
            type="checkbox"
          />
          <span style={{ color: 'var(--muted)', fontSize: '0.9375rem' }}>매년 반복</span>
        </label>

        {visibleError ? (
          <p
            role="alert"
            style={{
              borderRadius: 16,
              background: '#fff1ed',
              color: '#9a3412',
              fontSize: '0.875rem',
              lineHeight: 1.4,
              padding: '10px 12px',
            }}
          >
            {visibleError}
          </p>
        ) : null}

        <button disabled={isPending} type="submit">
          {isPending ? '저장 중' : '일정 저장'}
        </button>
      </form>
    </section>
  );
}
