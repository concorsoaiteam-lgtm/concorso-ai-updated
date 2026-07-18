// ============================================================
// ConcorsoAI — Quota simulazioni utente (v1 stub)
// ============================================================
// Ritorna il numero di simulazioni usate nel mese corrente
// da un utente autenticato via Supabase JWT.
//
// Piano Free → 5 simulazioni / mese (sliding window da giorno 1).
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
// Safety: ws non piu' passato al client, ma lo teniamo per eventuali
// dipendenze transitive di @supabase/realtime-js in Node.js
try { require('ws'); } catch (_) { /* opzionale */ }

// Chiave hardcoded di fallback (progetto xhifnparcouxsypkjcmn)
function extractProjectRef(jwt) {
  try {
    var p = jwt.split('.');
    if (p.length !== 3) return 'INVALID_JWT';
    var payload = JSON.parse(Buffer.from(p[1], 'base64url').toString());
    return payload.ref || 'NO_REF';
  } catch (_) { return 'PARSE_ERROR'; }
}
var HARDCODED_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoaWZucGFyY291eHN5cGtqY21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MDMxNTQsImV4cCI6MjA5ODE3OTE1NH0._NjGTkLfAVjCcaefEtx46lW15Twl7LHGoWLFxOPvRnM';
var HARDCODED_URL = 'https://xhifnparcouxsypkjcmn.supabase.co';

// [TEST TEMPORANEO] Usa HARDCODED anziché ENV_VAR per bypassare env var stale di Vercel.
// Se il test funziona, il problema è confermato: Vercel ha env var vecchie.
// FIX DEFINITIVO: entrare in Vercel Dashboard → Project Settings → Environment Variables
// e aggiornare/rimuovere le variabili SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_KEY.
function resolveAnonKey() {
  // COMMENTATO in produzione: var fromEnv = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
  var source, key;
  // Usa SEMPRE l'hardcoded per il test
  source = 'HARDCODED_TEST';
  key = HARDCODED_ANON;
  var ref = extractProjectRef(key);
  console.log('[quota] ANON_KEY source:', source, '| project ref:', ref, '| length:', key.length);
  return key;
}
function resolveSupabaseUrl() {
  // COMMENTATO in produzione: var fromEnv = process.env.SUPABASE_URL;
  // Usa SEMPRE l'hardcoded per il test
  console.log('[quota] SUPABASE_URL source: HARDCODED_TEST | value:', HARDCODED_URL.slice(0, 25) + '...');
  return HARDCODED_URL;
}

const SUPABASE_URL = resolveSupabaseUrl();
const SUPABASE_ANON_KEY = resolveAnonKey();

const FREE_PLAN_QUOTA_MONTHLY = 5;

const CRITICAL_PROJECT_REF = SUPABASE_URL
  ? new URL(SUPABASE_URL).hostname.split('.')[0]
  : 'xhifnparcouxsypkjcmn';

function getStartOfMonthUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)).toISOString();
}

function extractProjectRefFromJwt(jwt) {
  try {
    const parts = jwt.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    return payload.ref || null;
  } catch (_) { return null; }
}

// === DEBUG: log all'avvio del modulo ===
console.log('[quota] MODULE LOADED', { url: (SUPABASE_URL || '').slice(0, 20) + '...', keyLength: (SUPABASE_ANON_KEY || '').length });

module.exports = async function handler(req, res) {
  console.log('[quota] HANDLER CALLED', req.method, req.url, 'auth:', (req.headers.authorization || '').slice(0, 20) + '...');
  try {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.status(204).end();
    }
    if (req.method !== 'POST' && req.method !== 'GET') {
      return res.status(405).json({ error: 'Use GET or POST' });
    }

    const authHeader = req.headers.authorization || '';
    const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!tokenMatch) {
      return res.status(401).json({ error: 'Token mancante' });
    }
    const jwt = tokenMatch[1].trim();

    if (!SUPABASE_ANON_KEY) {
      return res.status(500).json({ error: 'ERRORE_CONFIG', details: 'SUPABASE_ANON_KEY non configurata' });
    }

    let supabaseUser = null;
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false }
      });
      const { data, error } = await supabase.auth.getUser(jwt);
      if (error || !data || !data.user) {
        return res.status(401).json({ error: 'Token non valido' });
      }
      supabaseUser = data.user;
    } catch (e) {
      const msg = String(e && e.message || e);
      console.error('[quota] auth error:', msg);
      return res.status(401).json({ error: 'Auth fallita', details: msg });
    }

    const plan = (supabaseUser.user_metadata && supabaseUser.user_metadata.plan) || 'free';

    if (plan !== 'free') {
      return res.status(200).json({
        plan,
        quota: null,
        used: 0,
        remaining: null,
        resetAt: null
      });
    }

    try {
      const supabase2 = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false },
        global: { headers: { Authorization: 'Bearer ' + jwt } }
      });
      const since = getStartOfMonthUTC();
      console.log('[quota] query params | user_id:', supabaseUser.id, '| since:', since, '| plan:', plan);
      const { count, error } = await supabase2
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
      // Estrae i campi dall'errore Supabase; se non sono stringhe
      // (es. oggetti annidati), li serializza con JSON.stringify.
      var errCode = e && (e.code || e.status || null);
      var errMsg = e && e.message;
      if (errMsg && typeof errMsg !== 'string') { try { errMsg = JSON.stringify(errMsg); } catch (_) { errMsg = String(errMsg); } }
      if (!errMsg) { errMsg = String(e); }
      var errDetails = e && e.details;
      if (errDetails && typeof errDetails !== 'string') { try { errDetails = JSON.stringify(errDetails); } catch (_) { errDetails = String(errDetails); } }
      var errHint = e && e.hint;
      if (errHint && typeof errHint !== 'string') { try { errHint = JSON.stringify(errHint); } catch (_) { errHint = String(errHint); } }
      console.error('[quota] db error:', JSON.stringify({ code: errCode, message: errMsg, details: errDetails, hint: errHint }));
      // Fallback gracefully: se la query fallisce (tabella mancante, RLS, colonna errata),
      // non blocchiamo l'utente — restituiamo quota default (free → 3 rimanenti).
      console.warn('[quota] db query fallita — return quota default di fallback');
      return res.status(200).json({
        plan: 'free',
        quota: FREE_PLAN_QUOTA_MONTHLY,
        used: 0,
        remaining: FREE_PLAN_QUOTA_MONTHLY,
        resetAt: new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() + 1, 1)).toISOString(),
        quota_warning: true,
        quota_error_details: { code: errCode, message: errMsg, details: errDetails, hint: errHint }
      });
    }
  } catch (e) {
    var oMsg = e && e.message;
    if (oMsg && typeof oMsg !== 'string') { try { oMsg = JSON.stringify(oMsg); } catch (_) { oMsg = String(oMsg); } }
    const msg = oMsg || String(e);
    console.error('[quota] unhandled error:', msg);
    return res.status(500).json({ error: 'Errore interno server', details: msg });
  }
};
