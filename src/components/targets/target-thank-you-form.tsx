'use client';

import { createThankYouForTarget } from '@/actions/thank-yous';

const textareaStyle = {
  width: '100%',
  border: '1px solid var(--border)',
  borderRadius: 16,
  background: 'var(--surface-strong)',
  color: 'var(--foreground)',
  font: 'inherit',
  padding: '12px 14px',
  resize: 'vertical',
} as const;

function toLocalDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

type TargetThankYouFormProps = {
  errorMessage: string | null;
  targetId: string;
};

export function TargetThankYouForm({ errorMessage, targetId }: TargetThankYouFormProps) {
  function submitThankYou(formData: FormData) {
    formData.set('date', toLocalDateInputValue(new Date()));
    formData.set('time_zone', Intl.DateTimeFormat().resolvedOptions().timeZone ?? '');
    return createThankYouForTarget(formData);
  }

  return (
    <section className="activity-list" aria-label="감사 메시지 작성" style={{ gap: 14 }}>
      <h2>감사 메시지 작성</h2>
      <form action={submitThankYou} style={{ display: 'grid', gap: 12 }}>
        <input name="target_id" type="hidden" value={targetId} />
        <textarea
          name="content"
          placeholder="감사한 마음을 적어보세요..."
          required
          rows={3}
          style={textareaStyle}
        />

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

        <button type="submit">감사 저장</button>
      </form>
    </section>
  );
}
