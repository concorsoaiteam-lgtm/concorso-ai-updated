// STUB v1.6.1: Vercel exposes this file as endpoint /api/email/welcome.lib.
// Real email logic moved to api/_lib/email-helpers.js (underscore prefix
// excluded from Vercel routing). This stub returns 404 + OPTIONS 204
// as defense-in-depth.
// TO REMOVE: bash unavailable on this Windows agent. Execute on next
// maintenance window: `rm api/email/welcome.lib.js` (or `Move-Item
// api\email\welcome.lib.js api\_lib\_deprecated\` to preserve content).
// Migration path for any client still calling this URL: redirect to
//   POST /api/email/welcome          (HMAC client auth)
//   POST /api/email/welcome-supabase (Bearer Supabase webhook auth)
// See AGENT_MEMORY.md §19 for full context.
module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  return res.status(404).json({ error: 'Not Found' });
};
