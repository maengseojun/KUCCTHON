import Link from 'next/link';

type BottomNavItem = 'home' | 'write' | 'friends' | 'targets' | 'mypage';

type BottomNavProps = {
  active: BottomNavItem;
};

const items: Array<{ key: BottomNavItem; href: string; label: string }> = [
  { key: 'home', href: '/', label: '홈' },
  { key: 'write', href: '/write', label: '작성하기' },
  { key: 'friends', href: '/friends', label: '친구 추가' },
  { key: 'targets', href: '/targets', label: '기념일 추가' },
  { key: 'mypage', href: '/mypage', label: '내 계정' },
];

export function BottomNav({ active }: BottomNavProps) {
  return (
    <nav className="bottom-tabs" aria-label="앱 주요 메뉴">
      {items.map((item) => (
        <Link key={item.key} href={item.href} style={{ color: 'inherit', textDecoration: 'none' }}>
          <span className={item.key === active ? 'active' : undefined} style={{ display: 'block' }}>
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  );
}
