import { redirect } from 'next/navigation';

import { logout } from '@/actions/auth';
import { BottomNav } from '@/components/nav/bottom-nav';
import { getCurrentProfile } from '@/lib/queries/profile';
import { createClient } from '@/lib/supabase/server';

function readText(value: unknown) {
  return typeof value === 'string' && value.trim() !== '' ? value : null;
}

export default async function MyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const profile = await getCurrentProfile().catch(() => null);

  const name = readText(profile?.name) ?? readText(user.user_metadata.name) ?? '입력되지 않음';
  const birthday =
    readText(profile?.birthday) ?? readText(user.user_metadata.birthday) ?? '입력되지 않음';

  return (
    <main className="demo-stage" aria-label="마이페이지">
      <section className="phone-shell">
        <header className="app-header">
          <div>
            <p className="eyebrow">Account</p>
            <h1>마이페이지</h1>
          </div>
        </header>

        <section className="hero-panel" aria-label="계정 요약">
          <p className="panel-label">Signed in as</p>
          <h2>{name}</h2>
          <p>{user.email ?? '이메일 없음'}</p>
        </section>

        <section className="activity-list" aria-label="프로필 정보" style={{ gap: 16 }}>
          <div className="activity-item">
            <span className="avatar">E</span>
            <div>
              <strong>이메일</strong>
              <p>{user.email ?? '이메일 없음'}</p>
            </div>
          </div>

          <div className="activity-item">
            <span className="avatar accent">N</span>
            <div>
              <strong>이름</strong>
              <p>{name}</p>
            </div>
          </div>

          <div className="activity-item">
            <span className="avatar">B</span>
            <div>
              <strong>생일</strong>
              <p>{birthday}</p>
            </div>
          </div>
        </section>

        <section className="quick-compose" aria-label="계정 작업">
          <div>
            <p className="panel-label">Session</p>
            <h2>로그아웃</h2>
          </div>
          <form action={logout}>
            <button type="submit">Logout</button>
          </form>
        </section>

        <BottomNav active="mypage" />
      </section>
    </main>
  );
}
