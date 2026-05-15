'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';

import type { Card } from '@/types/card';
import { TARGET_TYPE_LABELS, type Target } from '@/types/target';
import type { ThankYou } from '@/types/thank-you';

const fieldStyle = {
  width: '100%',
  border: '1px solid var(--border)',
  borderRadius: 16,
  background: 'var(--surface-strong)',
  color: 'var(--foreground)',
  font: 'inherit',
  padding: '12px 14px',
} as const;

type GratitudeCardCreatorProps = {
  createCardAction: (formData: FormData) => void | Promise<void>;
  errorMessage: string | null;
  initialTargetId: string | null;
  latestCard: Card | null;
  shareUrl: string | null;
  targets: Target[];
  thankYousByTargetId: Record<string, ThankYou[]>;
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button disabled={disabled || pending} type="submit">
      {pending ? '카드 만드는 중...' : '카드 만들기'}
    </button>
  );
}

export function GratitudeCardCreator({
  createCardAction,
  errorMessage,
  initialTargetId,
  latestCard,
  shareUrl,
  targets,
  thankYousByTargetId,
}: GratitudeCardCreatorProps) {
  const [selectedTargetId, setSelectedTargetId] = useState(initialTargetId ?? '');

  const selectedTarget = targets.find((target) => target.id === selectedTargetId) ?? null;
  const selectedThankYous = selectedTargetId ? (thankYousByTargetId[selectedTargetId] ?? []) : [];

  return (
    <>
      {latestCard ? (
        <section className="activity-list" aria-label="생성된 카드">
          <div
            style={{
              display: 'grid',
              gap: 10,
              borderRadius: 20,
              border: '1px solid var(--border)',
              background: 'var(--surface-strong)',
              padding: 16,
            }}
          >
            <div>
              <p className="panel-label" style={{ marginBottom: 6 }}>
                Latest card
              </p>
              <h2 style={{ fontSize: '1.125rem' }}>
                {latestCard.snapshot.recipient_name} 카드가 준비됐어요
              </h2>
              <p>생성 {latestCard.created_at.slice(0, 10)}</p>
            </div>
            {shareUrl ? (
              <p style={{ wordBreak: 'break-all' }}>
                공유 링크: <strong>{shareUrl}</strong>
              </p>
            ) : null}
            <Link
              href={`/card/${latestCard.public_token}`}
              style={{
                color: 'var(--accent-strong)',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              카드 열기
            </Link>
          </div>
        </section>
      ) : null}

      <section className="activity-list" aria-label="카드 생성 폼" style={{ gap: 14 }}>
        <form action={createCardAction} style={{ display: 'grid', gap: 12 }}>
          <label style={{ display: 'grid', gap: 8 }}>
            <span className="panel-label" style={{ marginBottom: 0 }}>
              대상 선택
            </span>
            <select
              name="target_id"
              onChange={(event) => setSelectedTargetId(event.target.value)}
              required
              style={fieldStyle}
              value={selectedTargetId}
            >
              {targets.length === 0 ? <option value="">먼저 대상을 추가해 주세요</option> : null}
              {targets.map((target) => (
                <option key={target.id} value={target.id}>
                  {target.name} · {TARGET_TYPE_LABELS[target.type]} · 감사 {target.thank_you_count}
                  회
                </option>
              ))}
            </select>
          </label>

          {selectedTarget ? (
            <div
              style={{
                borderRadius: 16,
                background: 'var(--surface-strong)',
                padding: '12px 14px',
              }}
            >
              <p className="panel-label" style={{ marginBottom: 6 }}>
                선택한 대상
              </p>
              <strong>{selectedTarget.name}</strong>
              <p>
                {TARGET_TYPE_LABELS[selectedTarget.type]} · 감사 {selectedTarget.thank_you_count}회
              </p>
              {selectedTarget.memo ? (
                <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginTop: 6 }}>
                  {selectedTarget.memo}
                </p>
              ) : null}
            </div>
          ) : null}

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

          <SubmitButton disabled={!selectedTargetId} />
        </form>
      </section>

      <section className="activity-list" aria-label="이전 감사 미리보기">
        <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <p className="panel-label">Preview</p>
            <h2 style={{ fontSize: '1.125rem' }}>이전 감사 미리보기</h2>
          </div>
          <span style={{ color: 'var(--muted)', fontSize: '0.875rem', fontWeight: 700 }}>
            {selectedThankYous.length}개
          </span>
        </div>

        {selectedTargetId === '' ? (
          <p>카드를 만들 대상을 먼저 선택해 주세요.</p>
        ) : selectedThankYous.length === 0 ? (
          <p>이 대상에 대한 감사 기록이 아직 없습니다. 먼저 감사 메시지를 작성해 보세요.</p>
        ) : (
          selectedThankYous.map((thankYou) => (
            <article
              key={thankYou.id}
              className="activity-item"
              style={{ alignItems: 'flex-start' }}
            >
              <span className="avatar">💌</span>
              <div>
                <p>{thankYou.content}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{thankYou.date}</p>
              </div>
            </article>
          ))
        )}
      </section>
    </>
  );
}
