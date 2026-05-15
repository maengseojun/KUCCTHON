import Link from 'next/link';

type BottomNavItem = 'home' | 'write' | 'friends' | 'targets' | 'mypage';

type BottomNavProps = {
  active: BottomNavItem;
};

const items: Array<{ key: BottomNavItem; href: string; label: string }> = [
  { key: 'home', href: '/', label: 'Home' },
  { key: 'write', href: '/write', label: 'Write' },
  { key: 'friends', href: '/friends', label: 'Friends' },
  { key: 'targets', href: '/targets', label: 'Targets' },
  { key: 'mypage', href: '/mypage', label: 'My' },
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
