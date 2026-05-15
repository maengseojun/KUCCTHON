ALTER TABLE public."thank-yous"
  ADD COLUMN IF NOT EXISTS date date;

UPDATE public."thank-yous"
SET date = created_at::date
WHERE date IS NULL;

ALTER TABLE public."thank-yous"
  ALTER COLUMN date SET DEFAULT CURRENT_DATE,
  ALTER COLUMN date SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_thank_yous_date
  ON public."thank-yous"(date);
