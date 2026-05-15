import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getThankYouList } from '@/lib/queries/thank-yous';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const requestedFromId = searchParams.get('from_id');

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fromId = requestedFromId || user?.id;

  if (!fromId) {
    return NextResponse.json([]);
  }

  const thankYous = await getThankYouList(fromId);

  return NextResponse.json(thankYous);
}
