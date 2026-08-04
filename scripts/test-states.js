/* Test degli stati speciali: quota esaurita (springboard), modalità Difficile
   da Free (anteprima Pro), plan Pro (Difficile abilitata), errore rete. */
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

const HTML = fs.readFileSync(path.join(__dirname, "..", "public", "simulation.html"), "utf8");
const SIM_JS = fs.readFileSync(path.join(__dirname, "..", "public", "js", "simulation.js"), "utf8");

function boot(used, plan, failFeedback) {
  const dom = new JSDOM(HTML, {
    url: "http://localhost/simulation.html",
    runScripts: "outside-only",
    pretendToBeVisual: true
  });
  const { window } = dom;
  const { document } = window;

  // reduced-motion: briefing e typewriter istantanei (sessione parte subito)
  window.matchMedia = (q) => ({
    matches: q.indexOf("reduce") !== -1,
    media: q, addEventListener: () => {}, removeEventListener: () => {}
  });
  // jsdom non implementa scrollIntoView: polyfill innocuo
  window.Element.prototype.scrollIntoView = function () {};

  const stubClient = {
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: "u1", email: "a@b.it", user_metadata: { full_name: "Mario" } } } }),
      getSession: () => ({ data: { session: { access_token: "tok" } } })
    },
    from: () => ({
      select: function () { return this; }, eq: function () { return this; },
      gte: function () { return this; }, not: function () { return this; }, limit: function () { return this; },
      order: function () { return this; }, maybeSingle: function () { return this; },
      insert: function () { return this; }, update: function () { return this; },
      then: (fn) => Promise.resolve({ error: null, data: null, count: 0 }).then(fn)
    })
  };

  window.__SUPABASE_URL = "https://example.supabase.co";
  window.__SUPABASE_ANON_KEY = "anon";
  window.supabase = { createClient: () => stubClient };
  window.telemetry = () => {};
  window.Dash = {
    $: (id) => document.getElementById(id),
    supabase: stubClient,
    escapeHtml: (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"),
    track: () => {},
    toast: () => {},
    openModal: () => () => {},
    closeModal: () => {},
    fmtDateIT: () => "12 luglio 2026",
    fmtDateShortIT: () => "12 luglio",
    fmtVoto: (v) => Number(v || 0).toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    todayISO: () => "2026-08-04",
    firstOfMonthISO: () => "2026-08-01",
    nextRenewalLabel: () => "1° settembre",
    animateCount: () => {},
    animateFill: () => {},
    guard: () => Promise.resolve(true),
    loadUser: () => Promise.resolve({ id: "u1", email: "a@b.it", displayName: "Mario", plan }),
    renderUser: () => {},
    loadCommon: () => Promise.resolve({ used, streak: 0, record: 0 }),
    renderUsage: () => {},
    renderStreak: () => {},
    renderBandoSwitch: () => {},
    getActiveBando: () => ({ id: 42, filename: "Bando Istruttore Comune di Milano.pdf", total_pages: 38, created_at: "2026-07-12T10:00:00Z" }),
    setActiveBando: () => {},
    initShell: () => {},
    FREE_SIM_LIMIT: 3
  };

  const bank = [{ testo: "Domanda uno?", argomento: "Diritto" }, { testo: "Domanda due?", argomento: "Diritto" }];
  const fbJson = {
    chiarezza: 7.5, struttura: 6.0, contenuto: 5.0, lessico: 7.0, pertinenza: 6.5,
    feedback: "Risposta corretta nel principio, manca la fonte normativa.",
    suggerimento: "Cita l'art. 12 L. 241/1990."
  };
  const fbContent = JSON.stringify(fbJson);
  const sse = 'data: ' + JSON.stringify({ choices: [{ delta: { content: fbContent } }] }) + "\n\n" + "data: [DONE]\n\n";

  function mockStreamResponse(sseText, jsonData) {
    const enc = new TextEncoder();
    const parts = sseText.split("\n\n").filter(Boolean);
    let i = 0;
    return {
      ok: true, status: 200,
      json: () => Promise.resolve(jsonData),
      body: { getReader: () => ({ read: () => {
        if (i >= parts.length) return Promise.resolve({ done: true });
        const chunk = enc.encode(parts[i] + "\n\n"); i += 1;
        return Promise.resolve({ done: false, value: chunk });
      }, releaseLock: () => {} }) }
    };
  }

  window.fetch = (url, opts) => {
    if (String(url).indexOf("/api/chat") === -1) return Promise.reject(new Error("unexpected fetch " + url));
    const body = JSON.parse(opts.body || "{}");
    const sys = (body.messages && body.messages[0] && body.messages[0].content) || "";
    if (sys.indexOf("array JSON") !== -1) {
      return Promise.resolve(mockStreamResponse("", { choices: [{ message: { content: JSON.stringify(bank) } }] }));
    }
    if (failFeedback) {
      return Promise.resolve({ ok: false, status: 502, json: () => Promise.resolve({ error: "boom" }) });
    }
    return Promise.resolve(mockStreamResponse(sse));
  };

  window.eval(SIM_JS);
  return { window, document };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function active(d) { const a = d.querySelector(".view.is-active"); return a ? a.id : "none"; }
function L(s) { console.log("  " + s); }

(async function run() {
  console.log("=== TEST STATI SPECIALI ===");

  // --- SCENARIO 1: quota esaurita (free, used=3) → springboard ---
  console.log("[1] quota 3/3 free → springboard");
  const s1 = boot(3, "free", false);
  await sleep(800);
  L("S1 active=" + active(s1.document));
  L("S1 start='" + s1.document.getElementById("setup-start").textContent + "'");
  s1.document.getElementById("setup-start").click();
  await sleep(300);
  const spring = s1.document.querySelector(".springboard");
  L("S1 springboard=" + (spring ? "si" : "no") + " | h2='" + (spring ? spring.querySelector("h2").textContent : "") + "'");
  if (!spring) { console.log("FAIL S1"); process.exit(1); }

  // --- SCENARIO 2: Difficile da free → anteprima Pro ---
  console.log("[2] Difficile da free → anteprima Pro");
  const s2 = boot(1, "free", false);
  await sleep(800);
  s2.document.getElementById("mode-difficile").click();
  await sleep(100);
  s2.document.getElementById("setup-start").click();
  await sleep(300);
  const prev = s2.document.querySelector(".pro-preview");
  L("S2 pro-preview=" + (prev ? "si" : "no") + " | h3='" + (prev ? prev.querySelector("h3").textContent : "") + "'");
  if (!prev) { console.log("FAIL S2"); process.exit(1); }
  // CTA "Continua con Standard" deve tornare indietro
  const backBtn = s2.document.getElementById("pro-preview-back");
  if (backBtn) { backBtn.click(); await sleep(100); }
  L("S2 after-back modesel=" + s2.document.getElementById("mode-standard").getAttribute("aria-checked"));
  if (s2.document.getElementById("mode-standard").getAttribute("aria-checked") !== "true") { console.log("FAIL S2-back"); process.exit(1); }

  // --- SCENARIO 3: plan pro → Difficile abilitata ---
  console.log("[3] plan pro → Difficile parte");
  const s3 = boot(1, "pro", false);
  await sleep(800);
  s3.document.getElementById("mode-difficile").click();
  await sleep(100);
  const start3 = s3.document.getElementById("setup-start");
  L("S3 start='" + start3.textContent + "' disabled=" + start3.disabled);
  if (start3.disabled || start3.textContent.indexOf("Pro") !== -1) { console.log("FAIL S3"); process.exit(1); }

  // --- SCENARIO 4: errore rete feedback → messaggio + retry ---
  console.log("[4] errore rete nel feedback → ripristino risposta");
  const s4 = boot(1, "free", true);
  await sleep(800);
  s4.document.getElementById("setup-start").click();
  await sleep(2500);
  const ta4 = s4.document.getElementById("answer-textarea");
  ta4.value = "Il principio di legalità si fonda sulla Costituzione e sulla legge 241 del 1990, con tipicità, motivazione e proporzionalità.";
  ta4.dispatchEvent(new s4.window.Event("input"));
  s4.document.getElementById("send-btn").click();
  await sleep(1200);
  const err = s4.document.getElementById("feedback-error");
  L("S4 error-box=" + (err.classList.contains("is-on") ? "si" : "no") + " | text='" + s4.document.getElementById("feedback-error-text").textContent + "'");
  L("S4 textarea-preserved=" + (ta4.value.length > 40 ? "si" : "no") + " enabled=" + (!ta4.disabled));
  if (!err.classList.contains("is-on")) { console.log("FAIL S4"); process.exit(1); }
  if (!ta4.value || ta4.disabled) { console.log("FAIL S4-restore"); process.exit(1); }

  console.log("\n=== STATI SPECIALI: TUTTI I TEST PASSATI ===");
  process.exit(0);
})().catch((e) => {
  console.error("ERRORE:", e && e.message ? e.message : e);
  console.error(e && e.stack);
  process.exit(1);
});
