// ============================================================
// ConcorsoAI — Email welcome: helpers riusati (DRY)
// ============================================================
// Estratto da welcome.js e welcome-supabase.js per evitare
// duplicazione. Posizionato in /api/_lib/ (prefix underscore) per
// evitare che Vercel lo esponga come endpoint pubblico.
//
// Contiene:
//   • sendViaResend(to, subject, html, text)
//   • buildWelcomeEmail(displayName)
//   • validateEmailStrict(email)
//   • extractSupabaseUserFields(body)
// ============================================================

const { escapeHtml } = require('./security');

async function sendViaResend(toEmail, subject, htmlBody, textBody) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY mancante');
  const from = process.env.WELCOME_FROM_ADDRESS || 'ConcorsoAI <ciao@concorso-ai.it>';
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from, to: [toEmail], subject, html: htmlBody, text: textBody })
  });
  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error('Resend ' + response.status + ': ' + errBody);
  }
  return await response.json().catch(() => ({}));
}

function buildWelcomeEmail(displayName) {
  const raw = String(displayName == null ? '' : displayName).slice(0, 50);
  const safeName = escapeHtml(raw);
  const subject = 'Benvenuto in ConcorsoAI · Come iniziare';
  const html = `<!DOCTYPE html><html><body style="font-family:Inter,system-ui,sans-serif;background:#F7FBFF;color:#0B2A4A;margin:0;padding:24px;"><table style="max-width:560px;margin:0 auto;background:#FFFFFF;border:1px solid #D6E8FF;border-radius:24px;padding:32px;"><tr><td><h1 style="margin:0 0 8px;font-size:24px;color:#0F4C81;">Ciao ${safeName || 'candidato'}, bentornato.</h1><p style="margin:0 0 16px;font-size:14px;line-height:24px;color:#315B7D;">Hai appena creato il tuo account ConcorsoAI. Ecco i prossimi 3 passi per iniziare ad allenarti davvero.</p><ol style="margin:0 0 24px;padding-left:20px;font-size:14px;line-height:28px;"><li>Carica il PDF del tuo bando dalla dashboard (max 500MB per file).</li><li>Scegli la materia dal menu simulazione. Per la prima volta ti consigliamo il livello <strong>Realistico</strong>.</li><li>Fai una simulazione di 20 minuti. Guarda i punteggi su chiarezza, struttura e contenuto.</li></ol><p style="margin:0 0 20px;font-size:14px;line-height:24px;color:#315B7D;">Piano Free: <strong>3 simulazioni al mese gratis</strong>. Se vuoi fare di più, il piano Pro è €9/mese.</p><a href="https://concorso-ai.vercel.app/auth.html" style="display:inline-block;background:linear-gradient(135deg,#0F4C81,#2563EB);color:#FFFFFF;text-decoration:none;padding:14px 28px;border-radius:16px;font-weight:900;font-size:14px;">Apri la dashboard →</a><p style="margin:24px 0 0;font-size:12px;color:#94A3B8;line-height:18px;">ConcorsoAI · Made in Italy. <a href="https://concorso-ai.vercel.app/privacy.html" style="color:#0F4C81;">Privacy</a> · <a href="https://concorso-ai.vercel.app/terms.html" style="color:#0F4C81;">Termini</a></p></td></tr></table></body></html>`;
  const text = `Ciao ${raw || 'candidato'}, benvenuto in ConcorsoAI.\n\n1. Carica il PDF del bando\n2. Scegli materia + livello Realistico\n3. Fai una simulazione di 20 minuti\n\nPiano Free: 3 simulazioni gratis/mese. Pro: €9/mese.\n\nDashboard: https://concorso-ai.vercel.app/auth.html\nConcorsoAI · Made in Italy`;
  return { subject, html, text };
}

function validateEmailStrict(email) {
  return typeof email === 'string' && /^[^\s@.]+@([^\s@.]+\.)+[^\s@.]{2,}$/.test(email);
}

function extractSupabaseUserFields(body) {
  if (body.record && body.record.email) {
    return {
      email: String(body.record.email).toLowerCase().trim(),
      displayName: body.record.raw_user_meta_data && body.record.raw_user_meta_data.full_name
    };
  }
  return { email: null, displayName: null };
}

module.exports = { sendViaResend, buildWelcomeEmail, validateEmailStrict, extractSupabaseUserFields };
