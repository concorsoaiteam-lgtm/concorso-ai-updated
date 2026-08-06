-- ============================================================================
-- simulazione_domande — dettaglio risposta-per-domanda delle simulazioni.
-- Tabella mancante fino al round 54: il client ci scriveva (simulation.js)
-- e Supabase rispondeva 404/400 ("Could not find the table"). Creata ora con
-- le stesse convenzioni di simulazioni/streak/memoria: UUID + RLS per utente.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.simulazione_domande (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulazione_id   UUID REFERENCES public.simulazioni(id) ON DELETE CASCADE,
  question_bank_id TEXT,               -- id bando reale oppure "llm-N" / "fb-N"
  risposta         TEXT,
  clarity          NUMERIC(3,1),
  structure        NUMERIC(3,1),
  content          NUMERIC(3,1),
  lessico          NUMERIC(3,1),
  pertinenza       NUMERIC(3,1),
  feedback         TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_simulazione_domande_sim ON public.simulazione_domande(simulazione_id);

ALTER TABLE public.simulazione_domande ENABLE ROW LEVEL SECURITY;

-- L'accesso passa dalla simulazione di proprietà dell'utente.
DROP POLICY IF EXISTS select_own_domande ON public.simulazione_domande;
CREATE POLICY select_own_domande ON public.simulazione_domande
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.simulazioni s
            WHERE s.id = simulazione_id AND s.user_id = auth.uid())
  );

DROP POLICY IF EXISTS insert_own_domande ON public.simulazione_domande;
CREATE POLICY insert_own_domande ON public.simulazione_domande
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.simulazioni s
            WHERE s.id = simulazione_id AND s.user_id = auth.uid())
  );

DROP POLICY IF EXISTS update_own_domande ON public.simulazione_domande;
CREATE POLICY update_own_domande ON public.simulazione_domande
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.simulazioni s
            WHERE s.id = simulazione_id AND s.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.simulazioni s
            WHERE s.id = simulazione_id AND s.user_id = auth.uid())
  );

DROP POLICY IF EXISTS delete_own_domande ON public.simulazione_domande;
CREATE POLICY delete_own_domande ON public.simulazione_domande
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.simulazioni s
            WHERE s.id = simulazione_id AND s.user_id = auth.uid())
  );
