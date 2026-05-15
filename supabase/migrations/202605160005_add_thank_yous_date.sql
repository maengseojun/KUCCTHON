-- 확실하게 하기 위해 하나의 파일 안에서 생성 후 컬럼 추가를 진행하는 예시
create table if not exists public."thank-yous" (
  id uuid not null default gen_random_uuid() primary key,
  created_at timestamp with time zone not null default now()
);

alter table public."thank-yous"
  add column if not exists date date not null default current_date;