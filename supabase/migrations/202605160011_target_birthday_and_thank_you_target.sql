-- Target에 생년월일 추가
ALTER TABLE public.targets ADD COLUMN IF NOT EXISTS birthday date;

-- thank-yous 테이블은 기존 dashboard 생성 가능성이 있어 방어적으로 보장한다.
CREATE TABLE IF NOT EXISTS public."thank-yous" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_id uuid REFERENCES public.targets(id) ON DELETE SET NULL,
  content text NOT NULL CHECK (char_length(trim(content)) > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 기존 thank-yous에 target_id 추가 + to_id nullable 전환
ALTER TABLE public."thank-yous"
  ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();

UPDATE public."thank-yous"
SET id = gen_random_uuid()
WHERE id IS NULL;

ALTER TABLE public."thank-yous"
  ALTER COLUMN id SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public."thank-yous"'::regclass
      AND contype = 'p'
  ) THEN
    ALTER TABLE public."thank-yous"
      ADD CONSTRAINT thank_yous_pkey PRIMARY KEY (id);
  END IF;
END;
$$;

ALTER TABLE public."thank-yous"
  ADD COLUMN IF NOT EXISTS from_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public."thank-yous"
  ADD COLUMN IF NOT EXISTS to_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public."thank-yous"
  ADD COLUMN IF NOT EXISTS content text;

ALTER TABLE public."thank-yous"
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public."thank-yous"
  ADD COLUMN IF NOT EXISTS target_id uuid REFERENCES public.targets(id) ON DELETE SET NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'thank-yous'
      AND column_name = 'date'
  ) THEN
    ALTER TABLE public."thank-yous" ALTER COLUMN date DROP NOT NULL;
  END IF;
END;
$$;

ALTER TABLE public."thank-yous"
  ALTER COLUMN to_id DROP NOT NULL;

ALTER TABLE public."thank-yous"
  ALTER COLUMN from_id SET NOT NULL;

ALTER TABLE public."thank-yous"
  ALTER COLUMN content SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public."thank-yous"'::regclass
      AND conname = 'thank_yous_content_non_empty'
  ) THEN
    ALTER TABLE public."thank-yous"
      ADD CONSTRAINT thank_yous_content_non_empty CHECK (char_length(trim(content)) > 0);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public."thank-yous"'::regclass
      AND conname = 'thank_yous_single_recipient'
  ) THEN
    ALTER TABLE public."thank-yous"
      ADD CONSTRAINT thank_yous_single_recipient CHECK (
        (to_id IS NULL) <> (target_id IS NULL)
      );
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_thank_yous_target
  ON public."thank-yous"(target_id);
CREATE INDEX IF NOT EXISTS idx_thank_yous_from
  ON public."thank-yous"(from_id);
CREATE INDEX IF NOT EXISTS idx_thank_yous_to
  ON public."thank-yous"(to_id);

ALTER TABLE public."thank-yous" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_own_thank_yous" ON public."thank-yous";
DROP POLICY IF EXISTS "insert_own_thank_yous" ON public."thank-yous";

CREATE POLICY "read_own_thank_yous" ON public."thank-yous" FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = from_id);

CREATE POLICY "insert_own_thank_yous" ON public."thank-yous" FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = from_id
    AND (
      target_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.targets
        WHERE targets.id = "thank-yous".target_id
          AND targets.user_id = (SELECT auth.uid())
      )
    )
  );

-- thank_you_count 자동 갱신 trigger
CREATE OR REPLACE FUNCTION public.update_thank_you_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.target_id IS NOT NULL THEN
    UPDATE public.targets SET thank_you_count = thank_you_count + 1
      WHERE id = NEW.target_id
        AND user_id = NEW.from_id;
  ELSIF TG_OP = 'DELETE' AND OLD.target_id IS NOT NULL THEN
    UPDATE public.targets SET thank_you_count = GREATEST(0, thank_you_count - 1)
      WHERE id = OLD.target_id
        AND user_id = OLD.from_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_thank_you_count ON public."thank-yous";

CREATE TRIGGER trg_thank_you_count
  AFTER INSERT OR DELETE ON public."thank-yous"
  FOR EACH ROW EXECUTE FUNCTION public.update_thank_you_count();

-- 기존 RPC 함수 제거 (trigger로 대체)
DROP FUNCTION IF EXISTS public.increment_thank_you_count(uuid, uuid);
DROP FUNCTION IF EXISTS public.decrement_thank_you_count(uuid, uuid);
