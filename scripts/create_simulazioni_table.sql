CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.simulazioni (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bando_id        BIGINT,
  modalita        TEXT,
  durata_minuti   SMALLINT,
  status          TEXT DEFAULT 'completata',
  voto_finale     SMALLINT CHECK (voto_finale >= 0 AND voto_finale <= 10),
  clarity_score   SMALLINT CHECK (clarity_score >= 0 AND clarity_score <= 10),
  structure_score SMALLINT CHECK (structure_score >= 0 AND structure_score <= 10),
  content_score   SMALLINT CHECK (content_score >= 0 AND content_score <= 10),
  started_at      TIMESTAMPTZ,
  ended_at        TIMESTAMPTZ
);
ALTER TABLE public.simulazioni ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_simulazioni_user_id   ON public.simulazioni(user_id);
CREATE INDEX IF NOT EXISTS idx_simulazioni_created_at ON public.simulazioni(created_at DESC);
ALTER TABLE public.simulazioni ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS select_own_simulazioni ON public.simulazioni;
CREATE POLICY select_own_simulazioni ON public.simulazioni FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS insert_own_simulazioni ON public.simulazioni;
CREATE POLICY insert_own_simulazioni ON public.simulazioni FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS update_own_simulazioni ON public.simulazioni;
CREATE POLICY update_own_simulazioni ON public.simulazioni FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS delete_own_simulazioni ON public.simulazioni;
CREATE POLICY delete_own_simulazioni ON public.simulazioni FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.bandi (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename    TEXT NOT NULL,
  total_pages INT,
  file_size   BIGINT,
  file_url    TEXT
);
ALTER TABLE public.bandi ADD COLUMN IF NOT EXISTS filename TEXT;
ALTER TABLE public.bandi ADD COLUMN IF NOT EXISTS total_pages INT;
ALTER TABLE public.bandi ADD COLUMN IF NOT EXISTS file_size BIGINT;
ALTER TABLE public.bandi ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.bandi ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.bandi ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS select_own_bandi ON public.bandi;
CREATE POLICY select_own_bandi ON public.bandi FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS insert_own_bandi ON public.bandi;
CREATE POLICY insert_own_bandi ON public.bandi FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS delete_own_bandi ON public.bandi;
CREATE POLICY delete_own_bandi ON public.bandi FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.waitlist (
  id    BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE
);
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS insert_waitlist ON public.waitlist;
CREATE POLICY insert_waitlist ON public.waitlist FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS select_waitlist ON public.waitlist;
CREATE POLICY select_waitlist ON public.waitlist FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.events (
  id      BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event   TEXT NOT NULL,
  page    TEXT,
  payload JSONB DEFAULT '{}'
);
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_events_user_id  ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_created  ON public.events(created_at DESC);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS insert_events ON public.events;
CREATE POLICY insert_events ON public.events FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS select_own_events ON public.events;
CREATE POLICY select_own_events ON public.events FOR SEbLECT USING (auth.uid() = user_id);
