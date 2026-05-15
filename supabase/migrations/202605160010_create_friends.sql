CREATE TABLE IF NOT EXISTS public.friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT friends_no_self CHECK (user_id != friend_user_id),
  CONSTRAINT friends_unique_pair UNIQUE (user_id, friend_user_id)
);

CREATE INDEX IF NOT EXISTS idx_friends_user ON public.friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend ON public.friends(friend_user_id);
CREATE INDEX IF NOT EXISTS idx_friends_pair ON public.friends(user_id, friend_user_id);

ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_own_friends" ON public.friends;
CREATE POLICY "read_own_friends" ON public.friends FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id OR (SELECT auth.uid()) = friend_user_id);

DROP POLICY IF EXISTS "add_friend" ON public.friends;
CREATE POLICY "add_friend" ON public.friends FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "remove_friend" ON public.friends;
CREATE POLICY "remove_friend" ON public.friends FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);
