import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  const appEnv =
    process.env.NEXT_PUBLIC_APP_ENV ??
    (process.env.NODE_ENV === 'development' ? 'local' : 'unknown');

  return NextResponse.json({
    status: 'ok',
    appEnv,
    supabaseConfigured: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
  });
}
