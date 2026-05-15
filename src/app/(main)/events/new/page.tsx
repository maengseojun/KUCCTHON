import Link from 'next/link';

import { EventForm } from '@/components/events/event-form';
import { BottomNav } from '@/components/nav/bottom-nav';
import { getTargets } from '@/lib/queries/targets';

type NewEventPageProps = {
  searchParams: Promise<{
    error?: string | string[];
  }>;
};

function getErrorMessage(error: string | string[] | undefined) {
  if (!error) {
    return null;
  }

  return Array.isArray(error) ? error[0] : error;
}

export default async function NewEventPage({ searchParams }: NewEventPageProps) {
  const [{ error }, targets] = await Promise.all([searchParams, getTargets()]);
  const errorMessage = getErrorMessage(error);

  return (
    <main className="demo-stage" aria-label="일정 추가">
      <section className="phone-shell">
        <header className="app-header">
          <div>
            <p className="eyebrow">Calendar</p>
            <h1>일정 추가</h1>
          </div>
          <Link href="/targets">
            <button type="button">대상</button>
          </Link>
        </header>

        <section className="hero-panel" aria-label="일정 안내">
          <p className="panel-label">D-Day setup</p>
          <h2>감사 대상과 날짜를 연결해요.</h2>
          <p>생일, 기념일, 직접 입력한 일정을 저장하면 이후 알림 기준일로 사용할 수 있습니다.</p>
        </section>

        <EventForm targets={targets} errorMessage={errorMessage} />

        <BottomNav active="targets" />
      </section>
    </main>
  );
}
