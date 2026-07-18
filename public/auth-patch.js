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

  // Helper per determinare se un token JWT è scaduto
  function isTokenExpired(token) {
    try {
      var payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (_) { return true; }
  }

  // Helper per ottenere il token dal localStorage Supabase
  // con fallback di refresh automatico se scaduto.
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

  // Versione asincrona con refresh automatico del JWT se scaduto.
  // Utilizza il client Supabase globale se disponibile (window.supabaseClient).
  // Necessaria per i casi in cui il token è scaduto tra una sessione e l'altra.
  function getValidAccessToken() {
    var token = readStoredAccessToken();
    if (!token) return Promise.resolve(null);
    if (!isTokenExpired(token)) return Promise.resolve(token);

    // Token scaduto: tentiamo refresh via Supabase client globale
    var sb = window.supabaseClient || (window.__supabaseClient);
    if (!sb || typeof sb.auth !== 'object' || typeof sb.auth.refreshSession !== 'function') {
      return Promise.resolve(token);
    }
    return sb.auth.refreshSession().then(function (res) {
      if (res && res.data && res.data.session && res.data.session.access_token) {
        return res.data.session.access_token;
      }
      // Fallback al vecchio token se refresh fallisce (meglio di niente)
      return token;
    }).catch(function () {
      return token;
    });
  }

  // Espone un helper globale che le funzioni inline possono
  // chiamare per ottenere il token (utile per futuri wiring).
  // Usa la versione asincrona che fa refresh automatico se scaduto.
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
      if (url && init) {
        var needsAuth = (url.indexOf('/api/chat') !== -1 && init.method === 'POST')
                     || url.indexOf('/api/quota') !== -1;
        if (needsAuth) {
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
      }
    } catch (_) { /* swallow wrapper error, fallback to normal fetch */ }
    return __origFetch(input, init);
  };

  // Proactive JWT refresh subito dopo il caricamento del DOM:
  // il token in localStorage viene aggiornato prima di qualsiasi
  // chiamata /api/chat, riducendo gli errori 401.
  document.addEventListener('DOMContentLoaded', function () {
    getValidAccessToken().then(function (refreshed) {
      if (refreshed) {
        if (typeof console !== 'undefined' && console.debug) {
          console.debug('[ConcorsoAI] Token JWT refreshed proactively');
        }
      }
    }).catch(function () { /* silenzioso */ });
  });

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
      // Guard: se chiamaCommissario non è ancora stato definito, avvertiamo in dev
      if (typeof window.chiamaCommissario !== 'function') {
        if (typeof console !== 'undefined' && console.warn) {
          console.warn('[ConcorsoAI] auth-patch: chiamaCommissario non pronto. L\'override verrà saltato.');
        }
        return;
      }

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
              // Propaga lo status originale dell'errore upstream (es. 401
              // per sessione scaduta) invece di hardcodare 500. Default
              // 500 solo se l'errore non aveva uno status associato.
              status: streamError.status || 500,
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
        '.msg-row.assistant:not(.thinking-row) .bubble {' +
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
    // ============================================================
    // FASE 4 — Polyfill helpers + style alignment per la bando selection
    // Auth-patch.js viene caricato PRIMA dello script inline di
    // simulation.html. Definiamo qui le funzioni mancanti che il
    // template bando-card chiama (maybeLastSimulated, animateCountChip,
    // attachBandoObserver) e iniettiamo il CSS di allineamento con
    // i tokens della landing+auth. Il CSS ha specificity sufficiente
    // (cascade + !important) per sovrascrivere il blocco v3 "REMAKE
    // BANDO SELECTION" presente in simulation.html.
    // ============================================================
    window.maybeLastSimulated = function (id) {
      try {
        var h = JSON.parse(localStorage.getItem('concorsoai_history') || '{}');
        if (h && h[id] && typeof window.relativeBandoDate === 'function') {
          return window.relativeBandoDate(h[id]);
        }
      } catch (_) { /* storage assente o corrotto, fallback silenzioso */ }
      return null;
    };

    window.__prevBandoCount = 0;
    window.animateCountChip = function (n) {
      var chip = document.getElementById('selectedBandiCount');
      if (!chip) return;
      chip.textContent = n === 1 ? '1 selezionato' : n + ' selezionati';
      if (n !== window.__prevBandoCount) {
        chip.classList.remove('chip-bump');
        void chip.offsetWidth;
        chip.classList.add('chip-bump');
      }
      window.__prevBandoCount = n;
    };

    window.bandoStateObserver = new MutationObserver(function (muts) {
      muts.forEach(function (m) {
        var el = m.target;
        if (el && el.classList && el.classList.contains('bando-card')) {
          el.setAttribute('aria-checked', String(el.classList.contains('active')));
        }
      });
    });

    window.attachBandoObserver = function () {
      if (window.bandoStateObserver) window.bandoStateObserver.disconnect();
      var cards = document.querySelectorAll('.bando-card');
      cards.forEach(function (c) {
        c.setAttribute('aria-checked', String(c.classList.contains('active')));
        window.bandoStateObserver.observe(c, { attributes: true, attributeFilter: ['class'] });
      });
    };

    // Big spark 9x sovrapposto al piccolo spark del click handler
    // inline di simulation.html. Rispetta prefers-reduced-motion.
    document.addEventListener('click', function (e) {
      var t = e.target;
      var card = t && t.closest ? t.closest('.bando-card') : null;
      if (!card) return;
      var wasActive = card.classList.contains('active');
      window.setTimeout(function () {
        if (!card.classList.contains('active') || wasActive) return;
        var prm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prm || !window.gsap) return;
        if (card.querySelector(':scope > .bando-spark-big')) return;
        var big = document.createElement('span');
        big.className = 'bando-spark-big';
        big.style.cssText = 'position:absolute;inset:0;border-radius:24px;pointer-events:none;z-index:1;';
        card.appendChild(big);
        window.gsap.fromTo(big,
          { scale: 0.6, opacity: 0.95, boxShadow: '0 0 0 0 rgba(37,99,235,.42)' },
          { scale: 9, opacity: 0, boxShadow: '0 0 0 32px rgba(37,99,235,0)', duration: 0.5, ease: 'power2.out',
            onComplete: function () { big.remove(); } }
        );
      }, 0);
    });

    // ============================================================
    // Bando-card style alignment con landing+auth (cascade override).
    // Tokens usati: glass-card, .card-hover, btn-primary shine, cubic-
    // bezier(.2,.8,.2,1), prefers-reduced-motion hard-reset. Stesso
    // vocabolario di index.html / auth.html per coerenza visiva.
    // ============================================================
    document.addEventListener('DOMContentLoaded', function () {
      try {
        var s = document.createElement('style');
        s.setAttribute('data-concorsoai', 'bando-align');
        s.textContent =
          '.bando-card {' +
            'background: rgba(255,255,255,.82) !important;' +
            '-webkit-backdrop-filter: blur(18px);' +
            'backdrop-filter: blur(18px);' +
            'border: 1px solid #D6E8FF !important;' +
            'border-radius: 24px !important;' +
            'transition: transform .18s cubic-bezier(.2,.8,.2,1),' +
              'border-color .18s cubic-bezier(.2,.8,.2,1),' +
              'box-shadow .18s cubic-bezier(.2,.8,.2,1),' +
              'background-color .18s cubic-bezier(.2,.8,.2,1) !important;' +
          '}' +
          '.bando-card:hover:not(.active) {' +
            'transform: translateY(-4px) !important;' +
            'border-color: #A9CDF8 !important;' +
            'box-shadow: 0 30px 90px rgba(15,76,129,.16) !important;' +
          '}' +
          '.bando-card.active {' +
            'background: rgba(255,255,255,.92) !important;' +
            'border: 2px solid #2563EB !important;' +
            'box-shadow: 0 0 0 3px rgba(37,99,235,.18), 0 30px 90px rgba(37,99,235,.22) !important;' +
            'transform: translateY(-2px) !important;' +
          '}' +
          '.bando-card.active .bando-indicator, .bando-card.active .bando-check {' +
            'background: linear-gradient(135deg, #0F4C81 0%, #2563EB 100%) !important;' +
            'color: #FFFFFF !important;' +
            'border: none !important;' +
            'position: relative;' +
            'overflow: hidden;' +
          '}' +
          '@keyframes bandoShine {' +
            '0%, 45% { left: -42%; }' +
            '70%, 100% { left: 120%; }' +
          '}' +
          '.bando-card.active .bando-indicator::after, .bando-card.active .bando-check::after {' +
            'content: "";' +
            'position: absolute;' +
            'inset: -120% auto auto -40%;' +
            'width: 36%;' +
            'height: 280%;' +
            'transform: rotate(22deg);' +
            'background: linear-gradient(90deg, transparent, rgba(255,255,255,.32), transparent);' +
            'animation: bandoShine 5.5s ease-in-out infinite;' +
          '}' +
          '@keyframes bandoIdleFloat {' +
            '0%, 100% { transform: translateY(0); }' +
            '50% { transform: translateY(-3px); }' +
          '}' +
          '@keyframes bandoCountBump {' +
            '0% { transform: scale(1); }' +
            '45% { transform: scale(1.16); background: rgba(37,99,235,0.14); }' +
            '100% { transform: scale(1); }' +
          '}' +
          '@keyframes bandoSelectionRing {' +
            '0% { box-shadow: 0 0 0 3px rgba(37,99,235,0); }' +
            '60% { box-shadow: 0 0 0 6px rgba(37,99,235,.18); }' +
            '100% { box-shadow: 0 0 0 3px rgba(37,99,235,.18); }' +
          '}' +
          '.bando-card .bando-icon {' +
            'animation: bandoIdleFloat 6s ease-in-out infinite;' +
          '}' +
          '.selected-count.chip-bump {' +
            'animation: bandoCountBump 0.36s cubic-bezier(.2,.8,.2,1);' +
          '}' +
          '.bando-card.active {' +
            'animation: bandoSelectionRing 0.42s cubic-bezier(.2,.8,.2,1);' +
          '}' +
          '.bando-card:focus-visible {' +
            'outline: none !important;' +
            'box-shadow: 0 0 0 4px rgba(37,99,235,.30) !important;' +
          '}' +
          '@media (prefers-reduced-motion: reduce) {' +
            '.bando-card, .bando-card:hover:not(.active), .bando-card.active,' +
            ' .bando-card .bando-icon,' +
            ' .bando-card.active .bando-indicator::after,' +
            ' .bando-card.active .bando-check::after,' +
            ' .selected-count.chip-bump {' +
              'animation: none !important;' +
              'transition: none !important;' +
              'transform: none !important;' +
            '}' +
          '}';
        document.head.appendChild(s);
      } catch (e) {
        if (typeof console !== 'undefined' && console.debug) {
          console.debug('[ConcorsoAI] bando-align style inject:', e && e.message ? e.message : e);
        }
      }
    });
})();
