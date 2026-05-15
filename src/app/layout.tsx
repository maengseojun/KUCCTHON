import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KUCCTHON',
  description: 'Initial project scaffold for Team 3: Wild Newbies.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
