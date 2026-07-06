// ============================================================
// ConcorsoAI — Auth patch runtime (injected via <script> tag)
// ============================================================
// Scopo: sostituire la funzione inline chiamaCommissario in
// simulation.html (che NON invia auth header) con una versione
// che ottiene il JWT Supabase e lo passa nell'Authorization.
//
// Caricato PRIMA dello script inline di simulation.html, cosi
// alla dichiarazione di chiamaCommissario il nostro override
// viene usato.
// ============================================================
(function () {
  if (typeof window === 'undefined') return;

  // Flag globale: chiamaCommissario deve autentica+stream-ready
  window.__commAuthReady = true;

  // Helper sync per ottenere il token dal localStorage Supabase.
  // Supabase v2 persiste il token come JSON in localStorage con
  // chiave 'sb-<projectref>-auth-token'. Matchiamo SOLO quella chiave
  // (no scan generico) per evitare di prendere token di altre app.
  function readStoredAccessToken() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && /^sb-[a-z0-9]+-auth-token$/.test(k)) {
          var raw = localStorage.getItem(k);
          if (!raw) continue;
          var parsed = JSON.parse(raw);
          var token = parsed && parsed.access_token;
          if (typeof token === 'string' && token.length > 20) return token;
        }
      }
    } catch (_) { /* ignore */ }
    return null;
  }

  // Espone un helper globale che le funzioni inline possono
  // chiamare per ottenere il token (utile per futuri wiring).
  window.__getCommAuthToken = readStoredAccessToken;

  // Implementazione: fetch wrapper che inietta automaticamente
  // Authorization Bearer sulle chiamate a /api/chat. Funziona per
  // QUALSIASI chiamante (chiamaCommissario legacy, chiamaCommissarioStream,
  // fetch diretto da futuro codice) senza richiedere modifiche al codice
  // inline di simulation.html.
  var __origFetch = window.fetch && window.fetch.bind(window);
  if (!__origFetch) return;

  window.fetch = function (input, init) {
    try {
      var url = typeof input === 'string' ? input : (input && input.url);
      if (url && url.indexOf('/api/chat') !== -1 && init && init.method === 'POST') {
        // Aggiungi Authorization Bearer se mancante.
        init.headers = init.headers || {};
        var hasAuth = false;
        if (init.headers instanceof Headers) {
          hasAuth = !!init.headers.get('Authorization');
          if (!hasAuth) {
            var t = readStoredAccessToken();
            if (t) init.headers.set('Authorization', 'Bearer ' + t);
          }
        } else {
          hasAuth = !!init.headers['Authorization'] || !!init.headers['authorization'];
          if (!hasAuth) {
            var t = readStoredAccessToken();
            if (t) init.headers['Authorization'] = 'Bearer ' + t;
          }
        }
      }
    } catch (_) { /* swallow wrapper error, fallback to normal fetch */ }
    return __origFetch(input, init);
  };

  // niente console.info: non leakare info in console di produzione

  // ============================================================
  // FASE 3.1 — Typewriter wiring via override sul global scope
  // ============================================================
  // auth-patch.js viene caricato PRIMA dello script inline di
  // simulation.html. Quindi all'evento DOMContentLoaded:
  // - Le funzioni dichiarate inline (function hoisting + script execution)
  //   sono gia' su window (chiamaCommissario, chiamaCommissarioStream,
  //   inviaMessaggio, avviaCommissario, buildSystemPrompt, ecc.)
  // - Il listener di boot() (registrato a fine script inline) NON e' ancora
  //   stato chiamato.
  //
  // Registrando il nostro listener PRIMA (gia' fatto qui), esso verra
  // chiamato per PRIMO al DOMContentLoaded. Quindi possiamo override
  // window.chiamaCommissario con una versione che delega a
  // chiamaCommissarioStream, abilitando lo streaming end-to-end senza
  // modificare il codice inline multi-line rifiutato da str_replace.
  //
  // Risultato: il backend riceve stream:true, SSE reale, risposta buffered
  // sintetizzata in JSON OpenAI-compatible. Il client vede la bolla
  // apparire con effetto reveal tipo typewriter (clip-path animation).
  // ============================================================
  document.addEventListener('DOMContentLoaded', function () {
    try {
      // Override window.chiamaCommissario: delega a chiamaCommissarioStream
      if (window.chiamaCommissario && window.chiamaCommissarioStream && typeof window.chiamaCommissarioStream === 'function') {
        var origComm = window.chiamaCommissario;
        window.chiamaCommissario = async function (messaggi, config) {
          var rawContent = '';
          var streamError = null;
          try {
            await window.chiamaCommissarioStream(messaggi, config, {
              onDelta: function () { /* typewriter visivo gestito dal CSS reveal */ },
              onComplete: function (raw) { rawContent = raw || ''; },
              onError: function (err) { streamError = err && err.message ? err : { message: 'Errore stream' }; }
            });
          } catch (e) {
            streamError = { message: e && e.message ? e.message : 'Stream exception' };
          }
          if (streamError) {
            return {
              ok: false,
              status: 500,
              json: function () { return Promise.resolve({ error: streamError.message }); }
            };
          }
          // Sintetizza risposta OpenAI-compatible per retrocompatibilita
          // con aggiungiMessaggioCommissario che fa data.choices[0].message.content.
          return {
            ok: true,
            status: 200,
            json: function () {
              return Promise.resolve({
                choices: [{ index: 0, message: { role: 'assistant', content: rawContent }, finish_reason: 'stop' }]
              });
            }
          };
        };
      }

      // Aggiungi CSS typewriter reveal per il bubble del commissario.
      // Effetto: la bolla si "rivel" da sinistra a destra in 0.7s simulando
      // il typewriter. Non e' char-by-char vero (serve SSE piping reale che
      // richiede modifiche piu' invasive), ma l'effetto visivo convince.
      var typewriterStyle = document.createElement('style');
      typewriterStyle.setAttribute('data-concorsoai', 'typewriter-reveal');
      typewriterStyle.textContent =
        '.message-row.assistant:not(.thinking-row) .bubble {' +
          'animation: commBubbleReveal 0.75s cubic-bezier(.2,.7,.2,1) both;' +
        '}' +
        '@keyframes commBubbleReveal {' +
          '0%   { clip-path: inset(0 100% 0 0); opacity: 0.35; }' +
          '20%  { opacity: 1; }' +
          '100% { clip-path: inset(0 0 0 0);    opacity: 1; }' +
        '}';
      document.head.appendChild(typewriterStyle);
    } catch (e) {
      // Log silente ma visibile in DevTools. Se vedi questo warning,
      // il wiring typewriter fallback non ha funzionato e la sim usa
      // ancora il vecchio chiamaCommissario non-streaming.
      if (typeof console !== 'undefined' && console.debug) {
        console.debug('[ConcorsoAI] typewriter wiring fallback:', e && e.message ? e.message : e);
      }
    }
  });
})();
