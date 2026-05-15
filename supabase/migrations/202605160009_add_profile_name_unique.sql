-- 기존 중복 이름 정리 (첫 번째 row 유지, 나머지에 profile id 기반 접미사 추가)
WITH ranked_profiles AS (
  SELECT
    id,
    row_number() OVER (PARTITION BY name ORDER BY created_at, id) AS duplicate_rank
  FROM public.profiles
)
UPDATE public.profiles AS profiles
SET name = profiles.name || '#' || substring(replace(profiles.id::text, '-', '') from 1 for 6)
FROM ranked_profiles
WHERE profiles.id = ranked_profiles.id
  AND ranked_profiles.duplicate_rank > 1;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_name_unique UNIQUE (name);

-- handle_new_user trigger는 수정하지 않음.
-- 동일 이름으로 가입 시도 시 trigger의 INSERT가 unique violation을 발생시키고,
-- Supabase auth.signUp이 에러를 반환한다.
-- auth.ts의 getSignupErrorMessage()에서 이를 사용자 친화적 메시지로 변환한다.
