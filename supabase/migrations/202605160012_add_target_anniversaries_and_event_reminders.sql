alter table public.targets
  add column if not exists marriage_anniversary date,
  add column if not exists relationship_started_on date;

DO $$ 
DECLARE
  ctype text;
BEGIN
  -- 컬럼 타입을 확인하여 integer인 경우에만 변경 (멱등성 보장)
  SELECT data_type INTO ctype
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'events'
    AND column_name = 'notify_days_before';

  IF ctype = 'integer' THEN
    -- 1. 먼저 기존 제약 조건들을 모두 제거 (이름이 다를 수 있으므로 방어적 접근)
    ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_notify_days_before_check;
    
    -- 혹시 제약 조건 이름이 다를 경우를 대비한 동적 DROP
    DECLARE
        r RECORD;
    BEGIN
        FOR r IN (
            SELECT conname
            FROM pg_constraint
            WHERE conrelid = 'public.events'::regclass
            AND contype = 'c'
            AND pg_get_constraintdef(oid) LIKE '%notify_days_before%'
        ) LOOP
            EXECUTE 'ALTER TABLE public.events DROP CONSTRAINT ' || quote_ident(r.conname);
        END LOOP;
    END;

    -- 2. 기본값 제거
    ALTER TABLE public.events ALTER COLUMN notify_days_before DROP DEFAULT;

    -- 3. 타입 변경
    ALTER TABLE public.events ALTER COLUMN notify_days_before TYPE integer[] USING array[notify_days_before];
  END IF;
END $$;

-- 4. 새로운 기본값 및 제약 조건 추가
ALTER TABLE public.events ALTER COLUMN notify_days_before SET DEFAULT array[3]::integer[];

ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_notify_days_before_check;

ALTER TABLE public.events ADD CONSTRAINT events_notify_days_before_check CHECK (
  cardinality(notify_days_before) >= 1
  and notify_days_before <@ array[1, 3, 7, 10, 30]::integer[]
);
