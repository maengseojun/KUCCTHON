import { randomBytes } from 'node:crypto';

import { createClient } from '@/lib/supabase/server';
import type {
  Card,
  CardSnapshot,
  CardSourceEntry,
  CreateCardInput,
  PublicCard,
} from '@/types/card';

const CARD_SELECT_COLUMNS = 'id, owner_id, target_id, public_token, snapshot, created_at';
const MAX_TOKEN_GENERATION_ATTEMPTS = 5;

type CardRow = {
  id: string;
  owner_id: string;
  target_id: string;
  public_token: string;
  snapshot: unknown;
  created_at: string;
};

type PublicCardRow = {
  id: string;
  public_token: string;
  snapshot: unknown;
  created_at: string;
};

type TargetRow = {
  id: string;
  name: string;
};

type ProfileRow = {
  name: string;
};

type ThankYouSourceRow = {
  id: string;
  content: string;
  date: string;
  created_at: string;
};

async function getCurrentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, userId: user?.id ?? null };
}

async function requireCurrentUserId() {
  const { supabase, userId } = await getCurrentUserId();

  if (!userId) {
    throw new Error('로그인이 필요합니다.');
  }

  return { supabase, userId };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isCardSourceEntry(value: unknown): value is CardSourceEntry {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.content === 'string' &&
    typeof value.date === 'string' &&
    typeof value.created_at === 'string'
  );
}

function parseCardSnapshot(snapshot: unknown): CardSnapshot {
  if (!isRecord(snapshot)) {
    throw new Error('카드 스냅샷 형식이 올바르지 않습니다.');
  }

  const { recipient_name, sender_name, summary_text, source_entries } = snapshot;

  if (
    typeof recipient_name !== 'string' ||
    typeof sender_name !== 'string' ||
    typeof summary_text !== 'string' ||
    !Array.isArray(source_entries) ||
    !source_entries.every(isCardSourceEntry)
  ) {
    throw new Error('카드 스냅샷 형식이 올바르지 않습니다.');
  }

  return {
    recipient_name,
    sender_name,
    summary_text,
    source_entries,
  };
}

function mapCardRow(row: CardRow): Card {
  return {
    id: row.id,
    owner_id: row.owner_id,
    target_id: row.target_id,
    public_token: row.public_token,
    snapshot: parseCardSnapshot(row.snapshot),
    created_at: row.created_at,
  };
}

function mapPublicCardRow(row: PublicCardRow): PublicCard {
  return {
    id: row.id,
    public_token: row.public_token,
    snapshot: parseCardSnapshot(row.snapshot),
    created_at: row.created_at,
  };
}

function generatePublicToken() {
  return randomBytes(18).toString('base64url');
}

function toCardSourceEntries(rows: ThankYouSourceRow[]): CardSourceEntry[] {
  return rows.map((row) => ({
    id: row.id,
    content: row.content,
    date: row.date,
    created_at: row.created_at,
  }));
}

function buildAutomaticSummary(recipientName: string, sourceEntries: CardSourceEntry[]) {
  const firstDate = sourceEntries[0]?.date;
  const lastDate = sourceEntries.at(-1)?.date;
  const dateRange =
    firstDate && lastDate && firstDate !== lastDate ? `${firstDate}부터 ${lastDate}까지 ` : '';

  return `${dateRange}${recipientName}에게 전한 감사 ${sourceEntries.length}가지를 모았습니다.`;
}

async function buildCardSnapshot(userId: string, targetId: string): Promise<CardSnapshot> {
  const supabase = await createClient();

  const [
    { data: target, error: targetError },
    { data: profile, error: profileError },
    thankYousResult,
  ] = await Promise.all([
    supabase
      .from('targets')
      .select('id, name')
      .eq('id', targetId)
      .eq('user_id', userId)
      .maybeSingle(),
    supabase.from('profiles').select('name').eq('id', userId).maybeSingle(),
    supabase
      .from('thank-yous')
      .select('id, content, date, created_at')
      .eq('from_id', userId)
      .eq('target_id', targetId)
      .order('date', { ascending: true })
      .order('created_at', { ascending: true }),
  ]);

  if (targetError) {
    throw new Error('감사 대상을 불러오지 못했습니다.');
  }

  if (!target) {
    throw new Error('감사 대상을 찾지 못했습니다.');
  }

  if (profileError) {
    throw new Error('보내는 사람 정보를 불러오지 못했습니다.');
  }

  if (thankYousResult.error) {
    throw new Error('감사 기록을 불러오지 못했습니다.');
  }

  const sourceEntries = toCardSourceEntries((thankYousResult.data ?? []) as ThankYouSourceRow[]);

  if (sourceEntries.length === 0) {
    throw new Error('카드를 만들 감사 기록이 없습니다.');
  }

  const recipientName = (target as TargetRow).name;

  return {
    recipient_name: recipientName,
    sender_name: ((profile as ProfileRow | null)?.name ?? '사용자').trim() || '사용자',
    summary_text: buildAutomaticSummary(recipientName, sourceEntries),
    source_entries: sourceEntries,
  };
}

export async function createCardForTarget(input: CreateCardInput): Promise<Card> {
  const { supabase, userId } = await requireCurrentUserId();
  const snapshot = await buildCardSnapshot(userId, input.target_id);

  for (let attempt = 0; attempt < MAX_TOKEN_GENERATION_ATTEMPTS; attempt += 1) {
    const { data, error } = await supabase
      .from('gratitude_cards')
      .insert({
        owner_id: userId,
        target_id: input.target_id,
        public_token: generatePublicToken(),
        snapshot,
      })
      .select(CARD_SELECT_COLUMNS)
      .single();

    if (!error && data) {
      return mapCardRow(data as CardRow);
    }

    if (error?.code !== '23505') {
      throw new Error('카드 저장에 실패했습니다.');
    }
  }

  throw new Error('공유 토큰 생성에 실패했습니다.');
}

export async function getOwnCardByToken(token: string): Promise<Card | null> {
  const { supabase, userId } = await requireCurrentUserId();

  const { data, error } = await supabase
    .from('gratitude_cards')
    .select(CARD_SELECT_COLUMNS)
    .eq('owner_id', userId)
    .eq('public_token', token)
    .maybeSingle();

  if (error) {
    throw new Error('카드를 불러오지 못했습니다.');
  }

  return data ? mapCardRow(data as CardRow) : null;
}

export async function getPublicCardByToken(token: string): Promise<PublicCard | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc('get_public_gratitude_card_by_token', { card_token: token })
    .maybeSingle();

  if (error) {
    throw new Error('공유 카드를 불러오지 못했습니다.');
  }

  return data ? mapPublicCardRow(data as PublicCardRow) : null;
}

export async function getOwnGratitudeCardByToken(token: string) {
  return getOwnCardByToken(token);
}

export async function getPublicGratitudeCardByToken(token: string) {
  return getPublicCardByToken(token);
}

export async function getCardsByTargetId(targetId: string): Promise<Card[]> {
  const { supabase, userId } = await requireCurrentUserId();

  const { data, error } = await supabase
    .from('gratitude_cards')
    .select(CARD_SELECT_COLUMNS)
    .eq('owner_id', userId)
    .eq('target_id', targetId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('카드 목록을 불러오지 못했습니다.');
  }

  return (data ?? []).map((row) => mapCardRow(row as CardRow));
}
