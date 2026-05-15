import { redirect } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/actions/auth';

type LoginPageProps = {
  searchParams: Promise<{
    error?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // We won't use the form action anymore since the spec asks for social login,
  // but we will keep a dummy button or mock the Google login button.

  return (
    <main className="demo-stage" aria-label="로그인">
      <section className="phone-shell" style={{ background: 'var(--accent-soft)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'var(--accent-strong)', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>G</span>
          </div>
          
          <h1 style={{ color: 'var(--accent-strong)', fontSize: '1.75rem', fontWeight: '800', lineHeight: 1.4, marginBottom: '16px' }}>
            오늘 당신의<br/>고마운 마음을<br/>보관해보세요
          </h1>
        </div>

        <div style={{ width: '100%', paddingBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <button 
              type="button" 
              style={{ 
                width: '100%', 
                background: 'white', 
                color: '#3c4043', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '12px',
                padding: '16px',
                borderRadius: '999px',
                border: '1px solid #dadce0',
                fontWeight: '600',
                fontSize: '1rem',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                cursor: 'pointer'
              }}
            >
              {/* Mock Google Logo */}
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              구글로 계속하기
            </button>
          </Link>
        </div>

      </section>
    </main>
  );
}
