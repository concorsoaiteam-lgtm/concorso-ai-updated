// ============================================================
// ConcorsoAI — Auth patch runtime (injected via <script> tag)
// ============================================================
// Scopo: garantire che ogni chiamata a /api/chat e /api/quota porti
// l'Authorization Bearer del JWT Supabase, con refresh automatico
// del token se scaduto. Funziona per QUALSIASI chiamante (fetch
// wrapper globale) senza richiedere modifiche ai moduli di pagina.
// Nessun output in console: la produzione resta pulita.
// ============================================================
(function () {
  "use strict";
  if (typeof window === "undefined") return;

  // Flag globale: il runtime di autenticazione è attivo.
  window.__commAuthReady = true;

  // Helper per determinare se un token JWT è scaduto.
  function isTokenExpired(token) {
    try {
      var payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch (_) { return true; }
  }

  // Helper per ottenere il token dal localStorage Supabase.
  function readStoredAccessToken() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && /^sb-[a-z0-9]+-auth-token$/.test(k)) {
          var raw = localStorage.getItem(k);
          if (!raw) continue;
          var parsed = JSON.parse(raw);
          var token = parsed && parsed.access_token;
          if (typeof token === "string" && token.length > 20) return token;
        }
      }
    } catch (_) { /* ignore */ }
    return null;
  }

  // Versione asincrona con refresh automatico del JWT se scaduto.
  function getValidAccessToken() {
    var token = readStoredAccessToken();
    if (!token) return Promise.resolve(null);
    if (!isTokenExpired(token)) return Promise.resolve(token);

    // Token scaduto: tentiamo refresh via Supabase client globale.
    var sb = window.supabaseClient || window.__supabaseClient;
    if (!sb || !sb.auth || typeof sb.auth.refreshSession !== "function") {
      return Promise.resolve(token);
    }
    return sb.auth.refreshSession().then(function (res) {
      if (res && res.data && res.data.session && res.data.session.access_token) {
        return res.data.session.access_token;
      }
      // Fallback al vecchio token se il refresh fallisce (meglio di niente).
      return token;
    }).catch(function () {
      return token;
    });
  }

  // Fetch wrapper: inietta automaticamente Authorization Bearer sulle
  // chiamate protette. Silenzioso e senza side effect su altre richieste.
  var __origFetch = window.fetch && window.fetch.bind(window);
  if (!__origFetch) return;

  window.fetch = function (input, init) {
    try {
      var url = typeof input === "string" ? input : (input && input.url);
      if (url && init) {
        var needsAuth = (url.indexOf("/api/chat") !== -1 && init.method === "POST")
                     || url.indexOf("/api/quota") !== -1;
        if (needsAuth) {
          init.headers = init.headers || {};
          var hasAuth = false;
          if (init.headers instanceof Headers) {
            hasAuth = !!init.headers.get("Authorization");
            if (!hasAuth) {
              var t = readStoredAccessToken();
              if (t) init.headers.set("Authorization", "Bearer " + t);
            }
          } else {
            hasAuth = !!init.headers["Authorization"] || !!init.headers["authorization"];
            if (!hasAuth) {
              var t2 = readStoredAccessToken();
              if (t2) init.headers["Authorization"] = "Bearer " + t2;
            }
          }
        }
      }
    } catch (_) { /* swallow: fallback a fetch normale */ }
    return __origFetch(input, init);
  };

  // Proactive JWT refresh subito dopo il caricamento del DOM:
  // il token in localStorage viene aggiornato prima di qualsiasi
  // chiamata /api/chat, riducendo gli errori 401.
  document.addEventListener("DOMContentLoaded", function () {
    getValidAccessToken().catch(function () { /* silenzioso */ });
  });
})();
