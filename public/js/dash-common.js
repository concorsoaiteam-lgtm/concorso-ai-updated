/* =========================================================================
   dash-common.js — ConcorsoAI
   Modulo condiviso della dashboard: client Supabase (PKCE, stesso pattern
   di auth.js), guard di sessione, shell (sidebar + topbar + usage meter +
   streak), command palette (Cmd+K), toast, modal, telemetry, helper.
   Vanilla JS, nessuna libreria. Ogni funzione ha un motivo (vedi
   md/dashboard-master.md §6). Espone window.Dash per gli script di pagina.
   ========================================================================= */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     Supabase — stesso progetto di auth/landing. Override possibile.
     ------------------------------------------------------------------ */
  var SUPABASE_URL = (typeof __SUPABASE_URL !== "undefined" && __SUPABASE_URL)
    ? __SUPABASE_URL
    : ["https://", "xhifnparcouxsypkjcmn", ".supabase.co"].join("");
  var SUPABASE_ANON_KEY = (typeof __SUPABASE_ANON_KEY !== "undefined" && __SUPABASE_ANON_KEY)
    ? __SUPABASE_ANON_KEY
    : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoaWZucGFyY291eHN5cGtqY21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MDMxNTQsImV4cCI6MjA5ODE3OTE1NH0._NjGTkLfAVjCcaefEtx46lW15Twl7LHGoWLFxOPvRnM";

  // Stessa configurazione di auth.js: PKCE, persist, refresh. Nessun
  // storageKey custom (condivide la sessione con auth/dashboard).
  var supabaseClient = window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          flowType: "pkce",
          autoRefreshToken: true,
          detectSessionInUrl: true,
          persistSession: true
        }
      })
    : null;

  window.supabaseClient = supabaseClient;

  var REDUCED_MOTION = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var FREE_SIM_LIMIT = 3; // 3 simulazioni/mese per il Free (dashboard-master §2.2)

  /* ------------------------------------------------------------------
     Helper
     ------------------------------------------------------------------ */
  function $(id) { return document.getElementById(id); }

  function escapeHtml(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function track(event, meta) {
    try {
      if (typeof window.telemetry === "function") {
        window.telemetry(event, meta || {});
      }
    } catch (e) { /* fire-and-forget */ }
  }

  function fmtDateIT(d) {
    try {
      return new Date(d).toLocaleDateString("it-IT", {
        day: "numeric", month: "short", year: "numeric"
      });
    } catch (e) { return ""; }
  }

  function fmtDateShortIT(d) {
    try {
      return new Date(d).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
    } catch (e) { return ""; }
  }

  function fmtVoto(v) {
    var n = Number(v);
    if (!isFinite(n)) return "—";
    return n.toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  function todayISO() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function firstOfMonthISO() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-01";
  }

  /* ------------------------------------------------------------------
     Toast
     ------------------------------------------------------------------ */
  var toastTimer = null;

  function toast(msg) {
    var t = $("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      t.classList.remove("is-visible");
    }, 3200);
  }

  /* ------------------------------------------------------------------
     Modal
     ------------------------------------------------------------------ */
  function openModal(html, onClose) {
    var backdrop = $("modal-backdrop");
    if (!backdrop) return;
    backdrop.innerHTML = '<div class="modal" role="dialog" aria-modal="true" aria-label="Dialog">' +
      html + "</div>";
    backdrop.hidden = false;
    document.body.style.overflow = "hidden";

    function close() {
      backdrop.hidden = true;
      backdrop.innerHTML = "";
      document.body.style.overflow = "";
      if (onClose) onClose();
    }

    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) close();
    });
    backdrop.querySelectorAll("[data-close]").forEach(function (el) {
      el.addEventListener("click", close);
    });
    var first = backdrop.querySelector("button, a, input, [tabindex]");
    if (first) first.focus();
    return close;
  }

  function closeModal() {
    var backdrop = $("modal-backdrop");
    if (backdrop) {
      backdrop.hidden = true;
      backdrop.innerHTML = "";
      document.body.style.overflow = "";
    }
  }

  /* ------------------------------------------------------------------
     Streak chip (dati reali da tabella streak)
     ------------------------------------------------------------------ */
  function streakSvg() {
    return '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
      '<path d="M13 2 4.5 13.5H11L9.5 22 19 9.5h-6.5L13 2Z"/></svg>';
  }

  function renderStreak(days) {
    var el = $("streak-chip");
    if (!el) return;
    var n = Math.max(0, Number(days) || 0);
    el.innerHTML = streakSvg() + '<span>' + n + ' giorni</span>';
    el.title = n === 1 ? "1 giorno di fila" : n + " giorni di fila";
  }

  /* ------------------------------------------------------------------
     Usage meter — quota simulazioni del mese (server-side rispecchiato:
     il contatore è calcolato su dati reali; la verità rimane lato server)
     ------------------------------------------------------------------ */
  function renderUsage(used, plan) {
    var el = $("side-usage");
    if (!el) return;
    if (plan === "pro") {
      el.innerHTML =
        '<div class="usage-value" id="usage-value">Pro</div>' +
        '<p class="usage-note">Simulazioni illimitate</p>';
      return;
    }
    var left = Math.max(0, FREE_SIM_LIMIT - used);
    var pct = Math.min(100, Math.round((used / FREE_SIM_LIMIT) * 100));
    var full = used >= FREE_SIM_LIMIT;
    el.innerHTML =
      '<div class="usage-head">' +
        '<span class="usage-label">Simulazioni questo mese</span>' +
        '<span class="usage-value">' + left + ' di ' + FREE_SIM_LIMIT + '</span>' +
      '</div>' +
      '<div class="usage-track"><div class="usage-fill' + (full ? " is-full" : "") +
        '" style="width:' + pct + '%"></div></div>' +
      '<p class="usage-note">' + (full
        ? "Quota esaurita — si rinnova a inizio mese"
        : "Si rinnova a inizio mese") + '</p>';
  }

  /* ------------------------------------------------------------------
     Bando attivo (selettore sidebar)
     ------------------------------------------------------------------ */
  function renderBandoSwitch(name, hasBando) {
    var el = $("side-bando");
    if (!el) return;
    el.innerHTML = '<button type="button" class="bando-switch" id="bando-switch-btn">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">' +
      '<path stroke-linecap="round" stroke-linejoin="round" d="M6 2.75h9.75L19.5 6.5V21.25a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V3.5A.75.75 0 0 1 6 2.75Z"/>' +
      '<path stroke-linecap="round" d="M9 14h6M9 17.5h4"/></svg>' +
      '<span class="bando-switch-label">' + (hasBando ? escapeHtml(name) : "Nessun bando") + '</span>' +
      '</button>';
    var btn = $("bando-switch-btn");
    if (btn) {
      btn.addEventListener("click", function () {
        window.location.hash = "#bandi";
      });
    }
  }

  /* ------------------------------------------------------------------
     Command palette (Cmd+K) — spine di navigazione (pattern Raycast/Linear)
     ------------------------------------------------------------------ */
  function initPalette(actions) {
    var openBtn = $("cmdk-open");
    var topBtn = $("cmdk-btn");
    var palette = $("palette");
    if (!palette) return;

    var items = actions || [];
    var highlight = 0;

    function buildList(filter) {
      var list = $("palette-list");
      if (!list) return;
      var q = String(filter || "").trim().toLowerCase();
      var shown = items.filter(function (it) {
        return !q || (it.label + " " + (it.hint || "")).toLowerCase().indexOf(q) !== -1;
      });
      if (!shown.length) {
        list.innerHTML = '<p class="palette-empty">Nessun comando corrisponde.</p>';
        return;
      }
      highlight = 0;
      list.innerHTML = shown.map(function (it, i) {
        return '<button type="button" class="palette-item' + (i === 0 ? " is-highlight" : "") +
          '" data-i="' + i + '">' +
          (it.icon || "") + '<span>' + escapeHtml(it.label) + '</span>' +
          (it.kbd ? "<kbd>" + escapeHtml(it.kbd) + "</kbd>" : "") +
          "</button>";
      }).join("");
      list.querySelectorAll(".palette-item").forEach(function (el) {
        el.addEventListener("click", function () {
          var idx = Number(el.getAttribute("data-i"));
          var it = shown[idx];
          closePalette();
          if (it && it.run) it.run();
        });
      });
    }

    function moveHighlight(delta) {
      var els = palette.querySelectorAll(".palette-item");
      if (!els.length) return;
      highlight = (highlight + delta + els.length) % els.length;
      els.forEach(function (el, i) {
        el.classList.toggle("is-highlight", i === highlight);
      });
      var cur = els[highlight];
      if (cur && cur.scrollIntoView) cur.scrollIntoView({ block: "nearest" });
    }

    function openPalette() {
      palette.hidden = false;
      var input = $("palette-input");
      if (input) {
        input.value = "";
        buildList("");
        window.setTimeout(function () { input.focus(); }, 30);
      }
    }

    function closePalette() {
      palette.hidden = true;
    }

    function togglePalette() {
      palette.hidden ? openPalette() : closePalette();
    }

    function bindOpen(btn) {
      if (!btn) return;
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        togglePalette();
      });
    }
    bindOpen(openBtn);
    bindOpen(topBtn);

    document.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        togglePalette();
        return;
      }
      if (palette.hidden) return;
      if (e.key === "ArrowDown") { e.preventDefault(); moveHighlight(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); moveHighlight(-1); }
      else if (e.key === "Enter") {
        var cur = palette.querySelector(".palette-item.is-highlight");
        if (cur) cur.click();
      } else if (e.key === "Escape") {
        closePalette();
      }
    });

    var input = $("palette-input");
    if (input) {
      input.addEventListener("input", function () { buildList(input.value); });
    }

    palette.addEventListener("click", function (e) {
      if (e.target === palette) closePalette();
    });
  }

  /* ------------------------------------------------------------------
     Logout
     ------------------------------------------------------------------ */
  function initLogout() {
    var btn = $("logout-btn");
    if (!btn || !supabaseClient) return;
    btn.addEventListener("click", function () {
      supabaseClient.auth.signOut().then(function () {
        window.location.href = "/";
      });
    });
  }

  /* ------------------------------------------------------------------
     Guard di sessione — dashboard richiede login
     ------------------------------------------------------------------ */
  function guard() {
    if (!supabaseClient) {
      window.location.replace("/auth.html?mode=login");
      return Promise.resolve(false);
    }
    return supabaseClient.auth.getUser().then(function (res) {
      if (!res || !res.data || !res.data.user) {
        window.location.replace("/auth.html?mode=login");
        return false;
      }
      return true;
    }).catch(function () {
      window.location.replace("/auth.html?mode=login");
      return false;
    });
  }

  /* ------------------------------------------------------------------
     Dati utente (profiles + auth)
     ------------------------------------------------------------------ */
  function loadUser() {
    if (!supabaseClient) return Promise.resolve(null);
    return supabaseClient.auth.getUser().then(function (res) {
      var user = res && res.data && res.data.user;
      if (!user) return null;
      var meta = (user.user_metadata || {});
      var display = meta.full_name || user.email || "Candidato";
      // Legge il piano da profiles.plan se presente (default: free).
      return supabaseClient.from("profiles").select("display_name, plan")
        .eq("id", user.id).maybeSingle()
        .then(function (p) {
          var plan = (p && p.data && p.data.plan) || "free";
          return {
            id: user.id,
            email: user.email,
            displayName: (p && p.data && p.data.display_name) || display,
            plan: plan
          };
        })
        .catch(function () {
          return { id: user.id, email: user.email, displayName: display, plan: "free" };
        });
    }).catch(function () { return null; });
  }

  function renderUser(user) {
    var nameEl = $("user-name");
    var avatarEl = $("user-avatar");
    if (nameEl) nameEl.textContent = user.displayName || "Candidato";
    if (avatarEl) {
      avatarEl.textContent = String((user.displayName || "C")[0]).toUpperCase();
    }
  }

  /* ------------------------------------------------------------------
     Caricamento dati comuni (quota + streak) — usato da tutte le pagine
     ------------------------------------------------------------------ */
  function loadCommon(user) {
    if (!supabaseClient || !user) {
      renderUsage(0, "free");
      renderStreak(0);
      return Promise.resolve({ used: 0, streak: 0, record: 0 });
    }

    var monthStart = firstOfMonthISO();
    var quotaPromise = supabaseClient.from("simulazioni")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", monthStart + "T00:00:00.000Z");

    var streakPromise = supabaseClient.from("streak")
      .select("current_days, record_days")
      .eq("user_id", user.id)
      .maybeSingle();

    return Promise.all([quotaPromise, streakPromise]).then(function (r) {
      var used = (r[0].count != null) ? r[0].count : 0;
      var streak = (r[1].data && r[1].data.current_days) || 0;
      var record = (r[1].data && r[1].data.record_days) || 0;
      renderUsage(used, user.plan);
      renderStreak(streak);
      return { used: used, streak: streak, record: record };
    }).catch(function () {
      renderUsage(0, user.plan);
      renderStreak(0);
      return { used: 0, streak: 0, record: 0 };
    });
  }

  /* ------------------------------------------------------------------
     Bando attivo (localStorage, condiviso tra le pagine)
     ------------------------------------------------------------------ */
  var ACTIVE_BANDO_KEY = "cai_active_bando";

  function getActiveBando() {
    try { return JSON.parse(localStorage.getItem(ACTIVE_BANDO_KEY) || "null"); }
    catch (e) { return null; }
  }

  function setActiveBando(bando) {
    try {
      if (bando) localStorage.setItem(ACTIVE_BANDO_KEY, JSON.stringify(bando));
      else localStorage.removeItem(ACTIVE_BANDO_KEY);
    } catch (e) { /* noop */ }
  }

  /* ------------------------------------------------------------------
     Init della shell condivisa
     ------------------------------------------------------------------ */
  function initShell(options) {
    var opts = options || {};
    initPalette(opts.paletteActions || []);
    initLogout();
    var toggle = $("side-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var app = $("app");
        if (!app) return;
        var collapsed = app.classList.toggle("is-nav-open");
        // Mobile: la sidebar è bottom-nav, il toggle la mostra/nasconde
        app.setAttribute("data-nav", collapsed ? "open" : "closed");
      });
    }
    // Chiusura palette con Escape già gestita; chiusura modal con Escape:
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        var backdrop = $("modal-backdrop");
        if (backdrop && !backdrop.hidden) closeModal();
        var palette = $("palette");
        if (palette && !palette.hidden) palette.hidden = true;
      }
    });
  }

  /* ------------------------------------------------------------------
     API pubblica
     ------------------------------------------------------------------ */
  window.Dash = {
    $: $,
    supabase: supabaseClient,
    escapeHtml: escapeHtml,
    track: track,
    toast: toast,
    openModal: openModal,
    closeModal: closeModal,
    fmtDateIT: fmtDateIT,
    fmtDateShortIT: fmtDateShortIT,
    fmtVoto: fmtVoto,
    todayISO: todayISO,
    firstOfMonthISO: firstOfMonthISO,
    guard: guard,
    loadUser: loadUser,
    renderUser: renderUser,
    loadCommon: loadCommon,
    renderUsage: renderUsage,
    renderStreak: renderStreak,
    renderBandoSwitch: renderBandoSwitch,
    getActiveBando: getActiveBando,
    setActiveBando: setActiveBando,
    initShell: initShell,
    FREE_SIM_LIMIT: FREE_SIM_LIMIT
  };
})();
