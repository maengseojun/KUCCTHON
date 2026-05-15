import { BottomNav } from '@/components/nav/bottom-nav';

export default function Page() {
  return (
    <main className="demo-stage" aria-label="KUCCTHON mobile app preview">
      <section className="phone-shell">
        <header className="app-header">
          <div>
            <p className="eyebrow">Team 3: Wild Newbies</p>
            <h1>Today</h1>
          </div>
          <div className="notification-dot" aria-label="Unread notifications">
            1
          </div>
        </header>

        <section className="hero-panel">
          <p className="panel-label">Gratitude reminder</p>
          <h2>Mom&apos;s birthday is D-3</h2>
          <p>오늘 쌓인 감사 기록으로 카드를 만들 준비를 해보세요.</p>
        </section>

        <section className="quick-compose">
          <div>
            <p className="panel-label">Write gratitude</p>
            <h2>Who made your day better?</h2>
          </div>
          <button type="button">Write</button>
        </section>

        <section className="activity-list" aria-label="Friend activity preview">
          <div className="activity-item">
            <span className="avatar">M</span>
            <div>
              <strong>Maeng Seojun</strong>
              <p>created a gratitude entry today.</p>
            </div>
          </div>
          <div className="activity-item">
            <span className="avatar accent">Y</span>
            <div>
              <strong>Lee Yeonseo</strong>
              <p>commented on your gratitude.</p>
            </div>
          </div>
        </section>

        <BottomNav active="home" />
      </section>
    </main>
  );
}
