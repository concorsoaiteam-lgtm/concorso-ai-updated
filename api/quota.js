// ============================================================
// ConcorsoAI — Quota simulazioni utente
// ============================================================
// Ritorna il numero di simulazioni usate nel mese corrente
// da un utente autenticato via Supabase JWT.
//
// Piano Free → 5 simulazioni / mese (sliding window da giorno 1).
// Piano Pro / Coaching → illimitato (quota = null).
//
// Configurazione via env vars (vedi .env.example):
//   SUPABASE_URL / SUPABASE_ANON_KEY — progetto Supabase
// ============================================================

// Config Supabase condivisa (env + fallback documentato + verifica token
// resiliente via JWT-ref): vedi _lib/auth.js (round 53).
const auth = require('./_lib/auth');

const SUPABASE_URL = auth.resolveSupabaseUrl();
const SUPABASE_ANON_KEY = auth.resolveAnonKey();

const FREE_PLAN_QUOTA_MONTHLY = 5;

function getStartOfMonthUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)).toISOString();
}

module.exports = async function handler(req, res) {
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
      const authRes = await auth.verifySupabaseToken(jwt);
      if (authRes.error || !authRes.user) {
        return res.status(401).json({ error: 'Token non valido' });
      }
      supabaseUser = authRes.user;
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
      const supabase2 = auth.userClient(jwt);
      const since = getStartOfMonthUTC();
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
