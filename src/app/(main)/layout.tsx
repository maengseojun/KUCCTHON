import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // redirect('/login'); // Temporarily bypassed to show UI without real DB
  }

  return children;
}
