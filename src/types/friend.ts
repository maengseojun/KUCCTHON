export type Friend = {
  id: string;
  user_id: string;
  friend_user_id: string;
  created_at: string;
  profile: { name: string } | null;
};

export type ClassifiedFriends = {
  mutual: Friend[];
  outgoing: Friend[];
  incoming: Friend[];
};
