-- ============================================================================
-- ConcorsoAI — RLS & hardening (round 41)
-- Idempotente: può essere eseguito più volte senza errori.
--
-- NOTA: le policy RLS delle tabelle applicative (simulazioni, bandi,
-- piano_settimanale, streak, events, waitlist) sono GIÀ in
-- scripts/create_simulazioni_table.sql, create_piano_settimanale_table.sql,
-- create_streak_table.sql. Questo file aggiunge:
--   1. tabella profiles + trigger handle_new_user (onboarding futuro)
--   2. policy storage per il bucket privato dei PDF dei bandi
--   3. hardening (revoke su funzioni security definer)
--
-- Eseguire in Supabase SQL Editor (o tramite migration).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PROFILES — profilo pubblico minimo, una riga per utente.
--    Creata automaticamente alla signup dal trigger su auth.users.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS select_own_profile ON public.profiles;
CREATE POLICY select_own_profile ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS update_own_profile ON public.profiles;
CREATE POLICY update_own_profile ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Nessuna insert/delete client: la riga nasce dal trigger e muore col
-- delete a cascata di auth.users. Least privilege.

-- Trigger: crea la riga profiles alla registrazione.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. STORAGE — bucket privato `bandi` (PDF caricati dall'utente).
--    Convenzione percorso: bandi/{user_id}/{filename}
--    Solo l'utente proprietario legge/scrive i propri file.
--    Idempotente: se il bucket non esiste, le policy non vengono create.
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'bandi') THEN

    DROP POLICY IF EXISTS "bandi_select_own" ON storage.objects;
    CREATE POLICY "bandi_select_own" ON storage.objects
      FOR SELECT
      USING (bucket_id = 'bandi'
             AND (storage.foldername(name))[1] = (SELECT auth.uid()::text));

    DROP POLICY IF EXISTS "bandi_insert_own" ON storage.objects;
    CREATE POLICY "bandi_insert_own" ON storage.objects
      FOR INSERT
      WITH CHECK (bucket_id = 'bandi'
                  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text));

    DROP POLICY IF EXISTS "bandi_update_own" ON storage.objects;
    CREATE POLICY "bandi_update_own" ON storage.objects
      FOR UPDATE
      USING (bucket_id = 'bandi'
             AND (storage.foldername(name))[1] = (SELECT auth.uid()::text))
      WITH CHECK (bucket_id = 'bandi'
                  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text));

    DROP POLICY IF EXISTS "bandi_delete_own" ON storage.objects;
    CREATE POLICY "bandi_delete_own" ON storage.objects
      FOR DELETE
      USING (bucket_id = 'bandi'
             AND (storage.foldername(name))[1] = (SELECT auth.uid()::text));

  END IF;
END
$$;

-- ----------------------------------------------------------------------------
-- 3. HARDENING — revoca dell'execute pubblico da funzioni security definer.
--    (Il trigger le invoca come owner del DB; public non deve poterle chiamare.)
-- ----------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.piano_touch() FROM public;
REVOKE EXECUTE ON FUNCTION public.streak_guard() FROM public;

-- ----------------------------------------------------------------------------
-- 4. NOTE DI PROGETTO (non esecutivo)
--    * events.insert è VOLUTAMENTE aperto (WITH CHECK true) per telemetria
--      anonima fire-and-forget; nessun dato sensibile transita nel payload.
--    * service_role key: MAI nel frontend. Per admin/delete account servira
--      una Supabase Edge Function lato server (vedi md/auth-architecture.md
--      §10 — rischi residui).
--    * Backup automatici e billing alerts: abilitare in Supabase Dashboard
--      (Project Settings → Billing / Database → Backups).
-- ----------------------------------------------------------------------------
