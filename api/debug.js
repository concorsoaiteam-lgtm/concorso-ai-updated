const { createClient } = require('@supabase/supabase-js');
try { require('ws'); } catch (_) { /* opzionale */ }

function extractProjectRef(jwt) {
  try {
    var p = jwt.split('.');
    if (p.length !== 3) return 'INVALID_JWT';
    var payload = JSON.parse(Buffer.from(p[1], 'base64url').toString());
    return payload.ref || 'NO_REF';
  } catch (_) { return 'PARSE_ERROR'; }
}

function projectRefFromUrl(url) {
  try {
    return new URL(url).hostname.split('.')[0];
  } catch (_) { return 'PARSE_ERROR'; }
}

var HARDCODED_URL = 'https://xhifnparcouxsypkjcmn.supabase.co';
var HARDCODED_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoaWZucGFyY291eHN5cGtqY21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MDMxNTQsImV4cCI6MjA5ODE3OTE1NH0._NjGTkLfAVjCcaefEtx46lW15Twl7LHGoWLFxOPvRnM';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  // Prepara un oggetto con TUTTI i dettagli
  var envVars = {
    SUPABASE_URL: process.env.SUPABASE_URL || 'NOT SET',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET (' + process.env.SUPABASE_ANON_KEY.length + ' chars)' : 'NOT SET',
    SUPABASE_KEY: process.env.SUPABASE_KEY ? 'SET (' + process.env.SUPABASE_KEY.length + ' chars)' : 'NOT SET',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET (' + process.env.SUPABASE_SERVICE_ROLE_KEY.length + ' chars)' : 'NOT SET',
    AI_API_URL: process.env.AI_API_URL || 'NOT SET (default: https://openrouter.ai/api/v1/chat/completions)',
    AI_MODEL: process.env.AI_MODEL || 'NOT SET (default: deepseek/deepseek-chat)',
    AI_API_KEY: process.env.AI_API_KEY ? 'SET (' + process.env.AI_API_KEY.length + ' chars)' : 'NOT SET (checking BLUESMINDS_API_KEY...)',
    BLUESMINDS_API_KEY: process.env.BLUESMINDS_API_KEY ? 'SET (' + process.env.BLUESMINDS_API_KEY.length + ' chars)' : 'NOT SET',
  };

  var result = {
    timestamp: new Date().toISOString(),
    node: process.version,
    env_vars: envVars,
    analysis: {},
    tests: {}
  };

  // ANALISI: ref del progetto nella URL vs nella chiave
  var envUrlRef = process.env.SUPABASE_URL ? projectRefFromUrl(process.env.SUPABASE_URL) : 'N/A';
  var hardcodedUrlRef = projectRefFromUrl(HARDCODED_URL);
  var envKeyRef = process.env.SUPABASE_ANON_KEY ? extractProjectRef(process.env.SUPABASE_ANON_KEY) : 'N/A';
  var envKey2Ref = process.env.SUPABASE_KEY ? extractProjectRef(process.env.SUPABASE_KEY) : 'N/A';
  var hardcodedKeyRef = extractProjectRef(HARDCODED_ANON);

  result.analysis = {
    env_url_ref: envUrlRef,
    hardcoded_url_ref: hardcodedUrlRef,
    env_anon_key_ref: envKeyRef,
    env_supabase_key_ref: envKey2Ref,
    hardcoded_anon_key_ref: hardcodedKeyRef,
    MATCH: null
  };

  if (envUrlRef !== 'N/A' && envUrlRef !== 'PARSE_ERROR') {
    var keyRefToUse = envKeyRef !== 'N/A' ? envKeyRef : envKey2Ref;
    if (keyRefToUse !== 'N/A') {
      result.analysis.MATCH = (envUrlRef === keyRefToUse) ? 'OK - URL e chiave puntano allo stesso progetto' : 'MISMATCH - URL punta a ' + envUrlRef + ' ma chiave punta a ' + keyRefToUse;
    } else {
      result.analysis.MATCH = 'INFO - solo URL da env, nessuna chiave env';
    }
  } else {
    result.analysis.MATCH = 'INFO - URL non presente in env, si usa hardcoded';
  }

  // TEST 1: connessione Supabase con chiave ENV (se disponibile)
  var envUrl = process.env.SUPABASE_URL;
  var envKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

  if (envUrl && envKey) {
    try {
      var sb = createClient(envUrl, envKey, { auth: { persistSession: false } });
      var r = await sb.auth.getUser('invalid-token-for-test');
      result.tests.env_vars = {
        responded: true,
        status: r.error ? 'ERROR' : 'SUCCESS',
        message: r.error ? (r.error.message || r.error.name || String(r.error)) : 'UNEXPECTED_SUCCESS'
      };
    } catch (e) {
      result.tests.env_vars = {
        responded: false,
        error: e.message || String(e)
      };
    }
  } else {
    result.tests.env_vars = { skipped: 'env URL o chiave mancante' };
  }

  // TEST 2: connessione Supabase con chiave HARDCODED
  try {
    var sb2 = createClient(HARDCODED_URL, HARDCODED_ANON, { auth: { persistSession: false } });
    var r2 = await sb2.auth.getUser('invalid-token-for-test');
    result.tests.hardcoded_fallback = {
      responded: true,
      status: r2.error ? 'ERROR' : 'SUCCESS',
      message: r2.error ? (r2.error.message || r2.error.name || String(r2.error)) : 'UNEXPECTED_SUCCESS'
    };
  } catch (e) {
    result.tests.hardcoded_fallback = {
      responded: false,
      error: e.message || String(e)
    };
  }

  // TEST 3: se l'utente passa un token reale via ?token=xxx, provalo
  var realToken = req.query && req.query.token;
  if (realToken) {
    var urlForReal = envUrl || HARDCODED_URL;
    var keyForReal = envKey || HARDCODED_ANON;
    try {
      var sb3 = createClient(urlForReal, keyForReal, { auth: { persistSession: false } });
      var r3 = await sb3.auth.getUser(realToken);
      result.tests.real_token_provided = {
        token_snippet: realToken.slice(0, 10) + '...' + realToken.slice(-6),
        responded: true,
        user_found: r3.data && r3.data.user ? true : false,
        user_email: r3.data && r3.data.user ? r3.data.user.email : null,
        error: r3.error ? (r3.error.message || r3.error.name || String(r3.error)) : null
      };
    } catch (e) {
      result.tests.real_token_provided = {
        token_snippet: realToken.slice(0, 10) + '...',
        responded: false,
        error: e.message || String(e)
      };
    }
  }

  return res.status(200).json(result);
};
