// ============================================================
// ConcorsoAI — Quota simulazioni utente (v1 stub)
// ============================================================
// Ritorna il numero di simulazioni usate nel mese corrente
// da un utente autenticato via Supabase JWT.
//
// Piano Free → 3 simulazioni / mese (sliding window da giorno 1).
// Piano Pro / Coaching → illimitato (quota = null).
//
// Il client può chiamare /api/quota per decidere se mostrare
// il paywall (TODO 5.3).
//
// Env vars richieste (fail-closed come api/chat.js):
//   BLUESMINDS_API_KEY NON richiesta (questo endpoint non chiama AI)
//   SUPABASE_URL          (se non presente fallback hardcoded)
//   SUPABASE_ANON_KEY     (se non presente fallback hardcoded)
// ============================================================

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xhifnparcouxsypkjcmn.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoaWZucGFyY291eHN5cGtqY21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MDMxNTQsImV4cCI6MjA5ODE3OTE1NH0._NjGTkLfAVjCcaefEtx46lW15Twl7LHGoWLFxOPvRnM';

const FREE_PLAN_QUOTA_MONTHLY = 3;

function getStartOfMonthUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)).toISOString();
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Use GET or POST' });
  }

  const authHeader = req.headers.authorization || '';
  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) {
    return res.status(401).json({ error: 'Token mancante' });
  }
  const jwt = tokenMatch[1].trim();

  let supabaseUser = null;
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
      global: { headers: { Authorization: 'Bearer ' + jwt } }
    });
    const { data, error } = await supabase.auth.getUser();
    if (error || !data || !data.user) {
      return res.status(401).json({ error: 'Token non valido' });
    }
    supabaseUser = data.user;
  } catch (e) {
    return res.status(401).json({ error: 'Auth fallita', details: String(e && e.message || e) });
  }

  const plan = (supabaseUser.user_metadata && supabaseUser.user_metadata.plan) || 'free';

  if (plan !== 'free') {
    return res.status(200).json({
      plan,
      quota: null, // null = illimitato
      used: 0,
      remaining: null,
      resetAt: null
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
      global: { headers: { Authorization: 'Bearer ' + jwt } }
    });
    const since = getStartOfMonthUTC();
    const { count, error } = await supabase
      .from('simulazioni')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', supabaseUser.id)
      .gte('created_at', since);

    if (error) throw error;
    const used = count || 0;
    const remaining = Math.max(0, FREE_PLAN_QUOTA_MONTHLY - used);

    return res.status(200).json({
      plan,
      quota: FREE_PLAN_QUOTA_MONTHLY,
      used,
      remaining,
      resetAt: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 1)).toISOString()
    });
  } catch (e) {
    return res.status(500).json({ error: 'Errore conteggio quota', details: String(e && e.message || e) });
  }
};
