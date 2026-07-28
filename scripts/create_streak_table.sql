-- ============================================================================
-- Streak table — one row per user.
-- Tracks consecutive days of practice plus personal record.
-- Updated whenever a simulazione completes (started_at).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.streak (
  user_id      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_touch   DATE NOT NULL DEFAULT CURRENT_DATE,
  current_days SMALLINT NOT NULL DEFAULT 0 CHECK (current_days >= 0),
  record_days  SMALLINT NOT NULL DEFAULT 0 CHECK (record_days  >= 0),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_streak_user_id ON public.streak(user_id);

ALTER TABLE public.streak ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_own_streak ON public.streak;
CREATE POLICY select_own_streak ON public.streak
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS upsert_own_streak ON public.streak;
CREATE POLICY upsert_own_streak ON public.streak
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS update_own_streak ON public.streak;
CREATE POLICY update_own_streak ON public.streak
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE policy: included for parity with simulazioni/bandi/piano_settimanale.
-- A user can delete their own streak record. The row is recreated with
-- defaults if they continue practicing afterwards.
DROP POLICY IF EXISTS delete_own_streak ON public.streak;
CREATE POLICY delete_own_streak ON public.streak
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger: keep updated_at fresh + never let record_days < current_days.
-- streak_guard():
--   Defensive depth only. App code SHOULD set record_days correctly.
--   * updated_at   — auto-bumped to now() on every write.
--   * record_days  — silently clamped to >= current_days so the personal
--                    record is never lower than the current streak.
--                    If the app sends record_days < current_days, the
--                    trigger promotes it; if it sends record_days >
--                    current_days, the trigger keeps the higher value.
--   * last_touch   — never allowed to land in the future (today is the
--                    ceiling). This protects against timezone bugs or
--                    clock skew between client/server.
CREATE OR REPLACE FUNCTION public.streak_guard()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  -- Defensive clamp: personal record must never be lower than current streak.
  IF NEW.record_days < NEW.current_days THEN
    NEW.record_days := NEW.current_days;
  END IF;
  -- Defensive clamp: touches cannot be future-dated.
  IF NEW.last_touch > CURRENT_DATE THEN
    NEW.last_touch := CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS streak_guard_trg ON public.streak;
CREATE TRIGGER streak_guard_trg
  BEFORE INSERT OR UPDATE ON public.streak
  FOR EACH ROW EXECUTE FUNCTION public.streak_guard();
