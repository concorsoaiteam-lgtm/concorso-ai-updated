-- ============================================================================
-- piano_settimanale table — one row per user per ISO week.
-- Stores the AI-generated weekly schedule as JSONB.
-- week_start is always a Monday (date_trunc('week', ...)).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.piano_settimanale (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start  DATE NOT NULL,
  schedule    JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- schedule shape (7 entries, one per day):
  -- { "day": "2026-07-21", "type": "sessione_guidata|pratica_libera|prova_esame|rest",
  --   "duration_min": 20, "materia": "Diritto Amministrativo",
  --   "focus": "Principio di trasparenza", "status": "future|today|done|skipped",
  --   "simulazione_id": "uuid-or-null" }
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT piano_settimanale_unique_per_week UNIQUE (user_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_piano_user_week
  ON public.piano_settimanale(user_id, week_start DESC);

ALTER TABLE public.piano_settimanale ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_own_piano ON public.piano_settimanale;
CREATE POLICY select_own_piano ON public.piano_settimanale
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS insert_own_piano ON public.piano_settimanale;
CREATE POLICY insert_own_piano ON public.piano_settimanale
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS update_own_piano ON public.piano_settimanale;
CREATE POLICY update_own_piano ON public.piano_settimanale
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS delete_own_piano ON public.piano_settimanale;
CREATE POLICY delete_own_piano ON public.piano_settimanale
  FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.piano_touch()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  -- Force week_start to Monday of its week.
  NEW.week_start := date_trunc('week', NEW.week_start)::date;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS piano_touch_trg ON public.piano_settimanale;
CREATE TRIGGER piano_touch_trg
  BEFORE INSERT OR UPDATE ON public.piano_settimanale
  FOR EACH ROW EXECUTE FUNCTION public.piano_touch();
