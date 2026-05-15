export type CardSourceEntry = {
  id: string;
  content: string;
  date: string;
  created_at: string;
};

export type CardSnapshot = {
  recipient_name: string;
  sender_name: string;
  summary_text: string;
  source_entries: CardSourceEntry[];
};

export type Card = {
  id: string;
  owner_id: string;
  target_id: string;
  public_token: string;
  snapshot: CardSnapshot;
  created_at: string;
};

export type PublicCard = {
  id: string;
  public_token: string;
  snapshot: CardSnapshot;
  created_at: string;
};

export type CreateCardInput = {
  target_id: string;
};
