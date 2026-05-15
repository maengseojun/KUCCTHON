'use client';

import { useState } from 'react';

import { submitCreateTarget } from '@/actions/targets';
import { TARGET_TYPE_LABELS, TARGET_TYPES, type TargetType } from '@/types/target';

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

export function TargetForm({ errorMessage }: { errorMessage: string | null }) {
  const [type, setType] = useState<TargetType>('partner');

  return (
    <section className="activity-list" aria-label="감사 대상 추가" style={{ gap: 14 }}>
      <form action={submitCreateTarget} style={{ display: 'grid', gap: 12 }}>
        <label style={{ display: 'grid', gap: 8 }}>
          <span className="panel-label" style={{ marginBottom: 0 }}>
            이름
          </span>
          <input
            name="name"
            placeholder="예: 엄마, 여자친구 지수"
            required
            style={inputStyle}
            type="text"
          />
        </label>

        <label style={{ display: 'grid', gap: 8 }}>
          <span className="panel-label" style={{ marginBottom: 0 }}>
            관계
          </span>
          <select
            name="type"
            onChange={(event) => setType(event.target.value as TargetType)}
            required
            style={inputStyle}
            value={type}
          >
            {TARGET_TYPES.map((targetType) => (
              <option key={targetType} value={targetType}>
                {TARGET_TYPE_LABELS[targetType]}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: 'grid', gap: 8 }}>
          <span className="panel-label" style={{ marginBottom: 0 }}>
            생일
          </span>
          <input name="birthday" style={inputStyle} type="date" />
        </label>

        {type === 'parent' ? (
          <label style={{ display: 'grid', gap: 8 }}>
            <span className="panel-label" style={{ marginBottom: 0 }}>
              결혼 기념일
            </span>
            <input name="marriage_anniversary" style={inputStyle} type="date" />
          </label>
        ) : null}

        {type === 'partner' ? (
          <label style={{ display: 'grid', gap: 8 }}>
            <span className="panel-label" style={{ marginBottom: 0 }}>
              사귀기 시작한 날
            </span>
            <input name="relationship_started_on" style={inputStyle} type="date" />
          </label>
        ) : null}

        <label style={{ display: 'grid', gap: 8 }}>
          <span className="panel-label" style={{ marginBottom: 0 }}>
            메모
          </span>
          <input name="memo" placeholder="선택 메모" style={inputStyle} type="text" />
        </label>

        {errorMessage ? (
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
            {errorMessage}
          </p>
        ) : null}

        <button type="submit">대상 추가</button>
      </form>
    </section>
  );
}
