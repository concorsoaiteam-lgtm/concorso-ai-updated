-- ============================================================================
-- piano_settimanale bando_id migration (Fase 5).
-- Collega ogni piano al bando da cui e stato generato.
-- ON DELETE SET NULL per non perdere la cronologia del piano se il bando viene
-- cancellato. RLS invariato (la policy e row-level via auth.uid() = user_id).
-- ============================================================================

ALTER TABLE public.piano_settimanale
  ADD COLUMN IF NOT EXISTS bando_id UUID
    REFERENCES public.bandi(id) ON DELETE SET NULL;

-- Index opzionale per join frequenti con bandi (dashboard rendering).
CREATE INDEX IF NOT EXISTS idx_piano_bando_id
  ON public.piano_settimanale(bando_id)
  WHERE bando_id IS NOT NULL;

-- Commento esplicativo
COMMENT ON COLUMN public.piano_settimanale.bando_id IS
  'FK a bandi(id). Identifica il bando da cui e stato generato il piano (utile per handleStart che redirige a simulation.html).';

-- Aggiorna la SELECT tipica usata dal dashboard (loadPianoSettimanale):
-- Niente migration sui dati. Le righe esistenti avranno bando_id NULL, gestito
-- da handleStart con fallback al localStorage `dashboard.activeBando`.
