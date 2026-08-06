-- ============================================================
-- ConcorsoAI — Memoria di apprendimento (diario degli errori)
-- ============================================================
-- Una riga per utente: la memoria è SINTETICA (mai conversazioni),
-- aggiornata dal modello piccolo dopo ogni simulazione.
--
-- Struttura della colonna `memoria` (JSONB):
--   {
--     "temi": [ { "tema", "livello" (1-5, debolezza), "note",
--                 "occorrenze", "ultima", "stato" ("attivo"|"superato") } ],
--     "abitudini": [ { "descrizione", "livello" } ],
--     "progressi": [ { "tema", "descrizione" } ],
--     "aggiornata": "ISO"
--   }
--
-- Esegui questo file una sola volta nel SQL Editor di Supabase
-- (o con `supabase db push` se usi la CLI).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.memoria (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  memoria    JSONB NOT NULL DEFAULT '{"temi":[],"abitudini":[],"progressi":[],"aggiornata":null}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.memoria ENABLE ROW LEVEL SECURITY;

-- L'utente legge e aggiorna SOLO la propria memoria.
DROP POLICY IF EXISTS select_own_memoria ON public.memoria;
CREATE POLICY select_own_memoria ON public.memoria FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS insert_own_memoria ON public.memoria;
CREATE POLICY insert_own_memoria ON public.memoria FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS update_own_memoria ON public.memoria;
CREATE POLICY update_own_memoria ON public.memoria FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
