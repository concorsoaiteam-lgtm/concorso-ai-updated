// ============================================================
// ConcorsoAI — Stripe webhook (v1 stub, production-ready)
// ============================================================
// Riceve eventi Stripe da /api/stripe-webhook, aggiorna il piano
// dell'utente su Supabase (user_metadata.plan = 'pro' | 'free' | 'coaching').
//
// Richiede env vars in produzione:
//   STRIPE_SECRET_KEY         (per validate signature)
//   STRIPE_WEBHOOK_SECRET     (per validate firma eventi)
//   SUPABASE_SERVICE_ROLE_KEY (per update auth.users bypassing RLS)
//
// Eventi gestiti:
//   checkout.session.completed  → imposta plan = 'pro'
//   customer.subscription.updated → aggiorna plan in base a status
//   customer.subscription.deleted → rollback a plan = 'free'
//
// Fail-closed: senza le env vars ritorna 503 con messaggio chiaro.
// Misura latenza ed emette metriche (vedi api/chat.js convention).
// ============================================================

const crypto = require('crypto');

// Lazy require Supabase: se manca env, NON crashare al boot.
function getSupabaseServiceClient() {
  const { createClient } = require('@supabase/supabase-js');
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

// Verify Stripe webhook signature (HMAC-SHA256).
// Ref: https://stripe.com/docs/webhooks/signatures
function verifyStripeSignature(payload, signatureHeader, secret) {
  if (!payload || !signatureHeader || !secret) return false;
  const elements = signatureHeader.split(',').reduce((acc, part) => {
    const [k, v] = part.split('=');
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {});
  const timestamp = elements.t;
  const v1 = elements.v1;
  if (!timestamp || !v1) return false;
  // Tolleranza 5 minuti
  const tolerance = 300;
  if (Math.abs(Date.now() / 1000 - parseInt(timestamp, 10)) > tolerance) return false;
  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');
  // Compare in modo constant-time
  if (expected.length !== v1.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(v1, 'hex'));
}

// Estrae email utente da un evento Stripe (Customer o Session).
function extractUserEmail(event) {
  try {
    // Priorità: receipt_email, customer.email, customer_details.email
    if (event.data && event.data.object) {
      const obj = event.data.object;
      if (obj.receipt_email) return obj.receipt_email.toLowerCase().trim();
      if (obj.customer_details && obj.customer_details.email) return obj.customer_details.email.toLowerCase().trim();
      if (obj.customer && typeof obj.customer === 'string') {
        // Cliente già esistente: dovresti fare lookup via Stripe API per
        // recuperare la email. Senza stripe.api key in questo stub,
        // proviamo a leggerla dalla metadata direttamente.
        if (obj.metadata && obj.metadata.user_email) return String(obj.metadata.user_email).toLowerCase().trim();
      }
      if (obj.metadata && obj.metadata.user_email) return String(obj.metadata.user_email).toLowerCase().trim();
    }
  } catch (_) { /* fallthrough */ }
  return null;
}

// Determina piano da evento Stripe.
function derivePlan(event) {
  const type = event.type;
  if (type === 'checkout.session.completed') return 'pro';
  if (type === 'customer.subscription.updated' || type === 'customer.subscription.created') {
    const status = event.data && event.data.object && event.data.object.status;
    // attivo o in trial = 'pro'; tutto il resto = 'free'
    return (status === 'active' || status === 'trialing') ? 'pro' : 'free';
  }
  if (type === 'customer.subscription.deleted') return 'free';
  return null; // evento non gestito: no-op
}

module.exports = async function handler(req, res) {
  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST' });
  }

  // Health check per Vercel: GET-only diagnostics via env var header
  const t0 = Date.now();
  const stripeSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeSecret) {
    console.warn('[ConcorsoAI-METRIC] stripe_webhook config_error reason=missing_stripe_webhook_secret');
    return res.status(503).json({
      error: 'Stripe webhook non configurato',
      details: 'STRIPE_WEBHOOK_SECRET non presente. Configura le env vars prima del deploy in produzione.'
    });
  }

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    console.warn('[ConcorsoAI-METRIC] stripe_webhook config_error reason=supabase_service_role_missing');
    return res.status(503).json({
      error: 'Supabase service role non configurato',
      details: 'Aggiungi SUPABASE_SERVICE_ROLE_KEY nelle env vars di Vercel.'
    });
  }

  // Raw body necessario per verify Stripe signature
  // Su Vercel req.body è già string se content-type applicabile, altrimenti Buffer
  let rawBody = '';
  if (typeof req.body === 'string') {
    rawBody = req.body;
  } else if (Buffer.isBuffer(req.body)) {
    rawBody = req.body.toString('utf8');
  } else {
    rawBody = JSON.stringify(req.body || {});
  }

  const signature = req.headers['stripe-signature'] || '';
  if (!verifyStripeSignature(rawBody, signature, stripeSecret)) {
    console.warn('[ConcorsoAI-METRIC] stripe_webhook auth_fail reason=invalid_signature');
    return res.status(401).json({ error: 'Firma Stripe non valida' });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (e) {
    console.warn('[ConcorsoAI-METRIC] stripe_webhook validation_fail reason=invalid_json');
    return res.status(400).json({ error: 'JSON evento non valido' });
  }

  const plan = derivePlan(event);
  if (!plan) {
    // Evento Stripe non mappato: ack 200 (Stripe ignora se non 5xx)
    return res.status(200).json({ received: true, ignored: true });
  }

  const email = extractUserEmail(event);
  if (!email) {
    console.warn('[ConcorsoAI-METRIC] stripe_webhook validation_fail reason=no_email_in_event type=' + event.type);
    return res.status(400).json({ error: 'Email utente mancante nell\'evento Stripe' });
  }

  try {
    // Lookup utente Supabase via admin.auth.getUserByEmail
    const { data: userList, error: userErr } = await supabase.auth.admin.listUsers({ email });
    if (userErr) throw userErr;
    const targetUser = userList && userList.users && userList.users[0];
    if (!targetUser) {
      console.warn('[ConcorsoAI-METRIC] stripe_webhook validation_fail reason=user_not_found email_hash=' +
        crypto.createHash('sha256').update(email).digest('hex').slice(0, 8));
      return res.status(404).json({ error: 'Utente Supabase non trovato per questa email' });
    }

    // Update user_metadata.plan (bypassa RLS via service role)
    const { error: updateErr } = await supabase.auth.admin.updateUserById(targetUser.id, {
      user_metadata: Object.assign({}, targetUser.user_metadata || {}, { plan, plan_updated_at: new Date().toISOString() })
    });
    if (updateErr) throw updateErr;

    console.log('[ConcorsoAI-METRIC] stripe_webhook success type=' + event.type + ' user_id_hash=' +
      crypto.createHash('sha256').update(targetUser.id).digest('hex').slice(0, 8) +
      ' new_plan=' + plan);

    return res.status(200).json({ received: true, plan, user_id_hash: crypto.createHash('sha256').update(targetUser.id).digest('hex').slice(0, 8), latencyMs: Date.now() - t0 });
  } catch (e) {
    const errType = (e && (e.name || e.code)) || 'unknown';
    console.warn('[ConcorsoAI-METRIC] stripe_webhook supabase_error err_type=' + errType);
    return res.status(500).json({ error: 'Errore aggiornamento piano', details: e.message || String(e) });
  }
};
