// ============================================================
// ConcorsoAI — Auth Supabase condivisa (api/_lib/*)
// ============================================================
// Estratto da api/chat.js e api/quota.js per eliminare la
// duplicazione. Ogni endpoint serverless autenticato deve usare
// verifySupabaseToken(jwt) — mai replicare la logica.
//
// Strategia resiliente (round 52):
//   Le env vars di Vercel possono puntare a un progetto Supabase
//   vecchio (stale) mentre il client usa il progetto corrente. In
//   quel caso auth.getUser() rifiuta il JWT → 401 anche da loggati.
//   Prova prima la config da env; se fallisce, deriva il progetto
//   dal `ref` nel payload del JWT e riprova con l'anon key del
//   progetto corrente.
// ============================================================

const { createClient } = require('@supabase/supabase-js');
// Safety: ws non più passato al client, ma lo teniamo per eventuali
// dipendenze transitive di @supabase/realtime-js in Node.js
try { require('ws'); } catch (_) { /* opzionale */ }

// Chiave pubblica (anon) di fallback se le env vars mancano.
// NB: la anon key è pubblica per design (RLS protegge i dati); in
// produzione le env vars SUPABASE_URL / SUPABASE_ANON_KEY hanno
// sempre priorità e si ruotano da Vercel senza toccare il codice.
var HARDCODED_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoaWZucGFyY291eHN5cGtqY21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MDMxNTQsImV4cCI6MjA5ODE3OTE1NH0._NjGTkLfAVjCcaefEtx46lW15Twl7LHGoWLFxOPvRnM';
var HARDCODED_URL = 'https://xhifnparcouxsypkjcmn.supabase.co';

function resolveAnonKey() {
  return process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || HARDCODED_ANON;
}

function resolveSupabaseUrl() {
  return process.env.SUPABASE_URL || HARDCODED_URL;
}

// Estrae il `ref` (identificativo del progetto) dal payload del JWT.
function projectRefOf(jwt) {
  try {
    var parts = String(jwt || '').split('.');
    if (parts.length !== 3) return null;
    var payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    return (payload && typeof payload.ref === 'string' && payload.ref) ? payload.ref : null;
  } catch (_) { return null; }
}

// Verifica il token su uno o più candidati progetto/chiave.
async function verifySupabaseToken(jwt) {
  var candidates = [];
  var envUrl = resolveSupabaseUrl();
  var envKey = resolveAnonKey();
  candidates.push({ url: envUrl, key: envKey, source: 'env' });

  var ref = projectRefOf(jwt);
  if (ref && /^[a-z0-9]{16,32}$/.test(ref)) {
    var urlFromRef = 'https://' + ref + '.supabase.co';
    var keyForRef = (envUrl === urlFromRef) ? envKey : HARDCODED_ANON;
    var already = candidates.some(function (c) { return c.url === urlFromRef && c.key === keyForRef; });
    if (!already) candidates.push({ url: urlFromRef, key: keyForRef, source: 'jwt-ref' });
  }

  var lastError = null;
  for (var i = 0; i < candidates.length; i++) {
    try {
      var sb = createClient(candidates[i].url, candidates[i].key, { auth: { persistSession: false } });
      var res = await sb.auth.getUser(jwt);
      if (res && res.data && res.data.user && !res.error) {
        return { user: res.data.user, source: candidates[i].source };
      }
      lastError = (res && res.error) || new Error('no user');
    } catch (e) { lastError = e; }
  }
  return { error: lastError };
}

// Client Supabase "impersonato" con il JWT dell'utente (RLS attiva):
// usato per leggere/scrivere le righe di proprietà dell'utente.
function userClient(jwt) {
  return createClient(resolveSupabaseUrl(), resolveAnonKey(), {
    auth: { persistSession: false },
    global: { headers: { Authorization: 'Bearer ' + jwt } }
  });
}

module.exports = {
  resolveAnonKey,
  resolveSupabaseUrl,
  projectRefOf,
  verifySupabaseToken,
  userClient,
  HARDCODED_ANON,
  HARDCODED_URL
};
