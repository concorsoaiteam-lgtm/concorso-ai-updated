// ============================================================
// /public/js/telemetry.js — M19 telemetry helper
// ============================================================
// API: window.telemetry(event_name, meta)
// Schema events (Supabase, da scripts/create_simulazioni_table.sql):
//   { id BIGSERIAL, user_id UUID NULL, event TEXT NOT NULL,
//     page TEXT, payload JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT now() }
//   - user_id: NULLABLE (REFERENCES auth.users ON DELETE SET NULL) — anonymous page_view OK
//   - event: il nome logico dell'evento (es. "paywall_cta_clicked")
//   - page: auto-inferita da location.pathname
//   - payload: jsonb, opzionale ({})
//   - created_at: server-default now() — mai inviare lato client
// RLS: policy `insert_events ... WITH CHECK (true)` permette insert anonimi senza auth.
// Comportamento: fire-and-forget, mai bloccare UX, mai console.error.
// Niente emoji. Niente gradient. Vanilla.
// ============================================================
(function () {
  "use strict";

  // Infer page da pathname, pulito da leading/trailing slash e extension.
  function inferPage() {
    try {
      var p = (window.location && window.location.pathname) || "/";
      p = p.replace(/^\/+|\/+$/g, "");
      p = p.replace(/\.(html?|php|aspx?)$/, "");
      return p || "root";
    } catch (_) { return "unknown"; }
  }

  // Defensive check: Supabase client pronto all'uso.
  function isReady() {
    return !!(
      window.supabaseClient &&
      typeof window.supabaseClient.from === "function" &&
      typeof window.supabaseClient.auth === "object" &&
      typeof window.supabaseClient.auth.getUser === "function"
    );
  }

  // Resolve user via Supabase auth. Ritorna null se anon o errore (mai throw).
  function tryAuth() {
    if (!isReady()) return Promise.resolve(null);
    try {
      return window.supabaseClient.auth.getUser().then(function (res) {
        if (res && res.data && res.data.user && res.data.user.id) {
          return res.data.user;
        }
        return null;
      }, function () { return null; });
    } catch (_) {
      return Promise.resolve(null);
    }
  }

  // Safe clone di meta (NB: JSON round-trip perde Date/function/undefined).
  // I chiamanti devono passare plain object (no classi/istanze speciali).
  // Per v1.0 tutti i chiamanti passano solo string/number/boolean — OK.
  function safeClone(meta) {
    if (!meta || typeof meta !== "object") return {};
    try { return JSON.parse(JSON.stringify(meta)); } catch (_) { return {}; }
  }

  // Track di un evento. Fire-and-forget. Mai throw.
  function track(event_name, meta) {
    try {
      if (!event_name || typeof event_name !== "string") return;
      var name = event_name.slice(0, 120);
      var m = safeClone(meta);
      tryAuth().then(function (user) {
        try {
          if (!isReady()) return;
          // NB: schema canonico Supabase usa `event` + `payload` (NON `event_name` + `meta`).
          // Vedere scripts/create_simulazioni_table.sql per CREATE TABLE events.
          var payload = { event: name, page: inferPage(), payload: m };
          if (user && user.id) payload.user_id = user.id;
          window.supabaseClient.from("events").insert(payload)
            .then(function () {}, function () {});
        } catch (_) { /* swallow */ }
      }, function () { /* swallow */ });
    } catch (_) { /* swallow */ }
  }

  // page_view: 1 volta per page load. Retry su DOMContentLoaded se supabaseClient non pronto subito.
  function tryFirePageView() {
    try { track("page_view", { referrer: (document.referrer || null) }); } catch (_) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tryFirePageView);
  } else {
    if (isReady()) {
      tryFirePageView();
    } else {
      // supabaseClient non ancora pronto (verrà creato dopo, es. da auth-patch).
      // Aspetta DOMContentLoaded + tick per dargli tempo.
      document.addEventListener("DOMContentLoaded", function () {
        setTimeout(tryFirePageView, 50);
      });
    }
  }

  // API globale.
  window.telemetry = track;
})();
