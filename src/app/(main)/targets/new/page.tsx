import Link from 'next/link';

import { BottomNav } from '@/components/nav/bottom-nav';
import { TargetForm } from '@/components/targets/target-form';

type NewTargetPageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

function getErrorMessage(error: string | string[] | undefined) {
  if (!error) return null;
  return Array.isArray(error) ? error[0] : error;
}

export default async function NewTargetPage({ searchParams }: NewTargetPageProps) {
  const { error } = await searchParams;

  return (
    <main className="demo-stage" aria-label="감사 대상 추가">
      <section className="phone-shell">
        <header className="app-header">
          <div>
            <p className="eyebrow">Targets</p>
            <h1>대상 추가</h1>
          </div>
          <Link href="/targets">
            <button type="button">목록</button>
          </Link>
        </header>

        <section className="hero-panel" aria-label="자동 일정 안내">
          <p className="panel-label">자동 일정</p>
          <h2>기념일은 대상 정보에서 바로 일정으로 이어집니다.</h2>
          <p>
            생일은 공통으로, 부모님은 결혼 기념일을, 연인은 100일 단위와 매년 기념일을 함께
            챙깁니다.
          </p>
        </section>

        <TargetForm errorMessage={getErrorMessage(error)} />
        <BottomNav active="targets" />
      </section>
    </main>
  );
}
