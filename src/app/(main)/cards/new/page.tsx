import Link from 'next/link';

import { createGratitudeCard } from '@/actions/cards';
import { BottomNav } from '@/components/nav/bottom-nav';
import { GratitudeCardCreator } from '@/components/cards/gratitude-card-creator';
import { getOwnGratitudeCardByToken } from '@/lib/queries/cards';
import { getTargets } from '@/lib/queries/targets';
import { getThankYouList } from '@/lib/queries/thank-yous';
import type { ThankYou } from '@/types/thank-you';

type SearchParams = {
  error?: string | string[];
  target?: string | string[];
  token?: string | string[];
};

type NewCardPageProps = {
  searchParams: Promise<SearchParams>;
};

function getSingleValue(value: string | string[] | undefined) {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default async function NewCardPage({ searchParams }: NewCardPageProps) {
  const { error, target, token } = await searchParams;
  const errorMessage = getSingleValue(error);
  const requestedTargetId = getSingleValue(target);
  const createdToken = getSingleValue(token);
  const [targets, thankYous] = await Promise.all([getTargets(), getThankYouList()]);

  const safeTargetId =
    requestedTargetId && targets.some((item) => item.id === requestedTargetId)
      ? requestedTargetId
      : (targets[0]?.id ?? null);

  const thankYousByTargetId = thankYous.reduce<Record<string, ThankYou[]>>((grouped, item) => {
    if (!item.target_id) {
      return grouped;
    }

    grouped[item.target_id] ??= [];
    grouped[item.target_id].push(item);
    return grouped;
  }, {});
  const latestCard = createdToken ? await getOwnGratitudeCardByToken(createdToken) : null;
  const shareUrl =
    latestCard && process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '')}/card/${latestCard.public_token}`
      : null;

  return (
    <main className="demo-stage" aria-label="감사 카드 만들기">
      <section className="phone-shell">
        <header className="app-header">
          <div>
            <p className="eyebrow">Cards</p>
            <h1>감사 카드 만들기</h1>
          </div>
          <Link href="/targets">
            <button type="button">대상</button>
          </Link>
        </header>

        <section className="hero-panel" aria-label="카드 생성 안내">
          <p className="panel-label">Gratitude card</p>
          <h2>대상을 고르고, 쌓아 둔 감사 기록으로 카드를 만드세요.</h2>
          <p>대상을 선택하면 기존 감사 문구를 미리 보고 바로 카드로 정리할 수 있습니다.</p>
        </section>

        {targets.length === 0 ? (
          <section className="activity-list" aria-label="대상 없음">
            <p>카드를 만들려면 먼저 감사 대상을 추가해야 합니다.</p>
            <Link
              href="/targets/new"
              style={{ color: 'var(--accent-strong)', fontWeight: 700, textDecoration: 'none' }}
            >
              대상 추가하러 가기
            </Link>
          </section>
        ) : (
          <GratitudeCardCreator
            createCardAction={createGratitudeCard}
            errorMessage={errorMessage}
            initialTargetId={safeTargetId}
            latestCard={latestCard}
            shareUrl={shareUrl}
            targets={targets}
            thankYousByTargetId={thankYousByTargetId}
          />
        )}

        <BottomNav active="write" />
      </section>
    </main>
  );
}
