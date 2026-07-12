-- ============================================================
-- ConcorsoAI — Creazione tabella simulazioni
-- Esegui nel SQL Editor di Supabase (Dashboard → SQL Editor)
-- ============================================================

-- 1) Crea la tabella
CREATE TABLE IF NOT EXISTS public.simulazioni (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bando_id      INT8,
  modalita      TEXT,
  durata_minuti INT2,
  status        TEXT DEFAULT 'completata',
  voto_finale   INT2 CHECK (voto_finale >= 0 AND voto_finale <= 10),
  clarity_score   INT2 CHECK (clarity_score >= 0 AND clarity_score <= 10),
  structure_score INT2 CHECK (structure_score >= 0 AND structure_score <= 10),
  content_score   INT2 CHECK (content_score >= 0 AND content_score <= 10),
  started_at    TIMESTAMPTZ,
  ended_at      TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Indici per performance
CREATE INDEX IF NOT EXISTS idx_simulazioni_user_id   ON public.simulazioni(user_id);
CREATE INDEX IF NOT EXISTS idx_simulazioni_created_at ON public.simulazioni(created_at DESC);

-- 3) Abilita Row Level Security
ALTER TABLE public.simulazioni ENABLE ROW LEVEL SECURITY;

-- 4) Policy: SELECT — ogni utente vede solo le proprie simulazioni
CREATE POLICY select_own_simulazioni ON public.simulazioni
  FOR SELECT
  USING (auth.uid() = user_id);

-- 5) Policy: INSERT — ogni utente inserisce solo le proprie simulazioni
CREATE POLICY insert_own_simulazioni ON public.simulazioni
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6) Policy: UPDATE — solo il proprietario puo' modificare
CREATE POLICY update_own_simulazioni ON public.simulazioni
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7) Policy: DELETE — solo il proprietario puo' cancellare
CREATE POLICY delete_own_simulazioni ON public.simulazioni
  FOR DELETE
  USING (auth.uid() = user_id);
