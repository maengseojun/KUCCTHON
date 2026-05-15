import { notFound } from 'next/navigation';

import { getPublicGratitudeCardByToken } from '@/lib/queries/cards';

function formatDate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'long',
  }).format(date);
}

export default async function CardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  if (!token) {
    notFound();
  }

  const card = await getPublicGratitudeCardByToken(token).catch(() => null);

  if (!card) {
    notFound();
  }

  const {
    recipient_name: recipient,
    sender_name: sender,
    summary_text: summary,
    source_entries: entries,
  } = card.snapshot;
  const createdAt = formatDate(card.created_at);

  return (
    <main className="public-card-page" aria-label="공개 감사 카드">
      <section className="public-card-shell">
        <header className="public-card-header">
          <div className="public-card-badges">
            <span className="public-card-badge">Public card</span>
            {createdAt ? <span className="public-card-badge ghost">{createdAt}</span> : null}
          </div>
          <div>
            <p className="public-card-kicker">Shareable gratitude</p>
            <h1>{recipient}</h1>
          </div>
          <p className="public-card-byline">
            <span>보낸 사람</span>
            <strong>{sender}</strong>
          </p>
        </header>

        <section className="public-card-summary" aria-label="카드 요약">
          <p className="panel-label">Summary</p>
          <p>{summary}</p>
        </section>

        <section className="public-card-section" aria-label="원문 기록">
          <div className="public-card-section-header">
            <h2>Source entries</h2>
            <span>{entries.length}개</span>
          </div>

          {entries.length > 0 ? (
            <ul className="public-card-entry-list">
              {entries.map((entry, index) => (
                <li key={`${entry.content}-${index}`} className="public-card-entry">
                  <span className="public-card-entry-index">{index + 1}</span>
                  <div>
                    <p>{entry.content}</p>
                    <time dateTime={entry.date}>{formatDate(entry.date)}</time>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="public-card-empty">원문 기록이 아직 연결되지 않았습니다.</p>
          )}
        </section>

        <footer className="public-card-footer">
          <span>Created</span>
          <strong>{createdAt ?? '날짜 정보 없음'}</strong>
        </footer>
      </section>
    </main>
  );
}
