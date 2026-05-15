import { createClient } from '@/lib/supabase/server';

export type CardContent = {
  content: string;
};

export async function getCardsByFromAndToId(fromId: string, toId: string): Promise<CardContent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('thank-yous')
    .select('content')
    .eq('from_id', fromId)
    .eq('to_id', toId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error('카드 내용을 불러오지 못했습니다.');
  }

  return (data ?? []) as CardContent[];
}
