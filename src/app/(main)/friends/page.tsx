import { submitAddFriend, submitRemoveFriend } from '@/actions/friends';
import { BottomNav } from '@/components/nav/bottom-nav';
import { getFriends } from '@/lib/queries/friends';
import type { Friend } from '@/types/friend';

type FriendsPageProps = {
  searchParams: Promise<{
    error?: string | string[];
  }>;
};

function getErrorMessage(error: string | string[] | undefined) {
  if (!error) return null;
  return Array.isArray(error) ? error[0] : error;
}

function FriendItem({
  friend,
  action,
  actionLabel,
  fieldName,
}: {
  friend: Friend;
  action: (formData: FormData) => Promise<void>;
  actionLabel: string;
  fieldName: string;
}) {
  const friendId = fieldName === 'outgoing' ? friend.friend_user_id : friend.user_id;
  const displayName = friend.profile?.name ?? '알 수 없음';

  return (
    <article className="activity-item" style={{ alignItems: 'center' }}>
      <span className="avatar">{displayName.slice(0, 1)}</span>
      <div style={{ flex: 1 }}>
        <strong>{displayName}</strong>
      </div>
      <form action={action}>
        <input name="friend_user_id" type="hidden" value={friendId} />
        <button
          type="submit"
          style={{
            minWidth: 0,
            padding: '6px 12px',
            fontSize: '0.8rem',
            background: actionLabel === '삭제' ? 'transparent' : 'var(--accent-strong)',
            color: actionLabel === '삭제' ? 'var(--muted)' : 'white',
          }}
        >
          {actionLabel}
        </button>
      </form>
    </article>
  );
}

export default async function FriendsPage({ searchParams }: FriendsPageProps) {
  const [{ error }, friends] = await Promise.all([searchParams, getFriends()]);
  const errorMessage = getErrorMessage(error);

  return (
    <main className="demo-stage" aria-label="친구 관리">
      <section className="phone-shell">
        <header className="app-header">
          <div>
            <p className="eyebrow">Friends</p>
            <h1>친구</h1>
          </div>
        </header>

        <section className="activity-list" aria-label="친구 추가" style={{ gap: 14 }}>
          <form action={submitAddFriend} style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'grid', gap: 8 }}>
              <span className="panel-label" style={{ marginBottom: 0 }}>
                사용자 이름으로 추가
              </span>
              <input
                name="name"
                placeholder="정확한 사용자 이름을 입력하세요"
                required
                type="text"
                style={{
                  width: '100%',
                  border: '1px solid var(--border)',
                  borderRadius: 16,
                  background: 'var(--surface-strong)',
                  color: 'var(--foreground)',
                  font: 'inherit',
                  padding: '12px 14px',
                }}
              />
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

            <button type="submit">친구 추가</button>
          </form>
        </section>

        {friends.mutual.length > 0 ? (
          <section className="activity-list" aria-label="맞친구">
            <h2>맞친구 💛</h2>
            {friends.mutual.map((f) => (
              <FriendItem
                key={f.id}
                friend={f}
                action={submitRemoveFriend}
                actionLabel="삭제"
                fieldName="outgoing"
              />
            ))}
          </section>
        ) : null}

        {friends.outgoing.length > 0 ? (
          <section className="activity-list" aria-label="내가 추가한 친구">
            <h2>내가 추가한 친구</h2>
            {friends.outgoing.map((f) => (
              <FriendItem
                key={f.id}
                friend={f}
                action={submitRemoveFriend}
                actionLabel="삭제"
                fieldName="outgoing"
              />
            ))}
          </section>
        ) : null}

        {friends.incoming.length > 0 ? (
          <section className="activity-list" aria-label="나를 추가한 사람">
            <h2>나를 추가한 사람</h2>
            {friends.incoming.map((f) => (
              <FriendItem
                key={f.id}
                friend={f}
                action={submitAddFriend}
                actionLabel="맞친구 추가"
                fieldName="incoming"
              />
            ))}
          </section>
        ) : null}

        {friends.mutual.length === 0 &&
        friends.outgoing.length === 0 &&
        friends.incoming.length === 0 ? (
          <section className="activity-list">
            <p>아직 친구가 없습니다. 사용자 이름으로 친구를 추가해 보세요!</p>
          </section>
        ) : null}

        <BottomNav active="friends" />
      </section>
    </main>
  );
}
