alter table public."thank-yous"
  add column if not exists date date not null default current_date;

alter table public."thank-yous"
  alter column date set default current_date;
