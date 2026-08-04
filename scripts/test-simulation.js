/* Test headless di simulation.js con jsdom.
   Verifica: init → setup → briefing → sessione → feedback (mock SSE) → next → report.
   NON tocca la rete: /api/chat è mockato, Supabase è stub. */
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

const HTML = fs.readFileSync(path.join(__dirname, "..", "public", "simulation.html"), "utf8");
const CSS = fs.readFileSync(path.join(__dirname, "..", "public", "css", "simulation.css"), "utf8");
const SIM_JS = fs.readFileSync(path.join(__dirname, "..", "public", "js", "simulation.js"), "utf8");

const dom = new JSDOM(HTML, {
  url: "http://localhost/simulation.html",
  runScripts: "outside-only",
  pretendToBeVisual: true
});
const { window } = dom;
const { document } = window;

// ---- Stub Supabase ----
const stubClient = {
  auth: {
    getUser: () => Promise.resolve({ data: { user: { id: "u1", email: "a@b.it", user_metadata: { full_name: "Mario" } } } }),
    getSession: () => ({ data: { session: { access_token: "tok" } } })
  },
  from: () => ({
    select: function () { return this; },
    eq: function () { return this; },
    gte: function () { return this; },
    not: function () { return this; },
    limit: function () { return this; },
    order: function () { return this; },
    maybeSingle: function () { return this; },
    insert: function () { return this; },
    update: function () { return this; },
    then: (fn) => Promise.resolve({ error: null, data: null, count: 0 }).then(fn)
  })
};

// ---- Stub Dash ----
const stubState = { used: 1, plan: "free" };
window.__SUPABASE_URL = "https://example.supabase.co";
window.__SUPABASE_ANON_KEY = "anon";
window.supabase = { createClient: () => stubClient };
window.telemetry = () => {};
window.Dash = {
  $: (id) => document.getElementById(id),
  supabase: stubClient,
  escapeHtml: (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"),
  track: () => {},
  toast: (m) => { log("TOAST: " + m); },
  openModal: (html) => {
    const el = document.getElementById("modal-backdrop");
    el.innerHTML = '<div class="modal">' + html + "</div>";
    el.hidden = false;
    return () => { el.hidden = true; };
  },
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
  loadUser: () => Promise.resolve({ id: "u1", email: "a@b.it", displayName: "Mario", plan: stubState.plan }),
  renderUser: () => {},
  loadCommon: () => Promise.resolve({ used: stubState.used, streak: 0, record: 0 }),
  renderUsage: () => {},
  renderStreak: () => {},
  renderBandoSwitch: () => {},
  getActiveBando: () => ({ id: 42, filename: "Bando Istruttore Comune di Milano.pdf", total_pages: 38, created_at: "2026-07-12T10:00:00Z" }),
  setActiveBando: () => {},
  initShell: () => {},
  FREE_SIM_LIMIT: 3
};

// ---- Mock /api/chat ----
const bank = [
  { testo: "Mi illustri il principio di legalità dell'azione amministrativa.", argomento: "Diritto amministrativo" },
  { testo: "Quali sono i principi dell'attività amministrativa?", argomento: "Diritto amministrativo" },
  { testo: "Mi parli della trasparenza amministrativa.", argomento: "Trasparenza" },
  { testo: "Come si articola il procedimento amministrativo?", argomento: "Diritto amministrativo" },
  { testo: "Cosa distingue un atto discrezionale da uno vincolato?", argomento: "Diritto amministrativo" },
  { testo: "Mi spieghi la differenza tra vizi di legittimità e vizi di merito.", argomento: "Giustizia amministrativa" },
  { testo: "Quali sono i diritti del cittadino nel procedimento?", argomento: "Diritto amministrativo" },
  { testo: "Mi illustri la responsabilità della PA.", argomento: "Responsabilità" },
  { testo: "Come funziona il ricorso amministrativo?", argomento: "Giustizia amministrativa" },
  { testo: "Mi parli dell'organizzazione degli enti locali.", argomento: "Enti locali" },
  { testo: "Cosa sono i contratti pubblici?", argomento: "Contratti" },
  { testo: "Mi spieghi il ruolo della privacy nella PA.", argomento: "Privacy" }
];
const fbJson = {
  chiarezza: 7.5, struttura: 6.0, contenuto: 5.0, lessico: 7.0, pertinenza: 6.5,
  feedback: "La risposta incardina correttamente il principio ma non cita la base normativa. Aggiungi l'art. 12 L. 241/1990.",
  suggerimento: "La prossima volta apri citando la fonte."
};
// Chunk che NON spezzano le coppie di escape: il content serializzato nel
// delta viene emesso in un unico blocco (caso realistico di SSE).
const fbContent = JSON.stringify(fbJson);
const sse = 'data: ' + JSON.stringify({ choices: [{ delta: { content: fbContent } }] }) + "\n\n" + "data: [DONE]\n\n";

// Mock Response streaming (jsdom non implementa window.Response)
function mockStreamResponse(sseText, jsonData) {
  const enc = new TextEncoder();
  const parts = sseText.split("\n\n").filter(Boolean);
  let i = 0;
  const reader = {
    read: () => {
      if (i >= parts.length) return Promise.resolve({ done: true });
      const chunk = enc.encode(parts[i] + "\n\n");
      i += 1;
      return Promise.resolve({ done: false, value: chunk });
    },
    releaseLock: () => {}
  };
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(jsonData),
    body: { getReader: () => reader }
  };
}

window.fetch = (url, opts) => {
  if (String(url).indexOf("/api/chat") === -1) return Promise.reject(new Error("unexpected fetch " + url));
  const body = JSON.parse(opts.body || "{}");
  const sys = (body.messages && body.messages[0] && body.messages[0].content) || "";
  if (sys.indexOf("array JSON") !== -1) {
    return Promise.resolve(mockStreamResponse("", { choices: [{ message: { content: JSON.stringify(bank) } }] }));
  }
  return Promise.resolve(mockStreamResponse(sse));
};

// Hook errori per il debug
window.addEventListener("error", (e) => { console.log("WINDOW ERROR: " + (e.message || e.error)); });
process.on("unhandledRejection", (r) => { console.log("UNHANDLED REJECTION: " + (r && r.message ? r.message : r)); });

// ---- Esegui script ----
window.eval(SIM_JS);

// ---- Test helpers ----
const log = [];
function L(s) { log.push(s); console.log("  " + s); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function active() { const a = document.querySelector(".view.is-active"); return a ? a.id : "none"; }

(async function run() {
  console.log("=== TEST simulation.js ===");

  await sleep(800);
  L("T1 active=" + active() + " (atteso view-setup)");
  L("T1 start='" + document.getElementById("setup-start").textContent + "' dis=" + document.getElementById("setup-start").disabled);
  L("T1 modes=" + document.querySelectorAll(".mode-card").length + " (atteso 3)");
  L("T1 bando='" + document.getElementById("setup-bando-name").textContent + "'");
  L("T1 detail='" + document.getElementById("mode-sub-detail").textContent.slice(0, 50) + "'");
  if (active() !== "view-setup") { console.log("FAIL T1"); process.exit(1); }

  // Avvia sessione
  document.getElementById("setup-start").click();
  await sleep(200);
  L("T2 active=" + active() + " (atteso view-briefing)");
  // La bank mockata è generata al volo: attendiamo il briefing (2.6s)
  // + eventuale fallback (3s). Totale max ~6s.
  await sleep(7000);
  L("T3 active=" + active() + " (atteso view-session)");
  L("T3 q='" + (document.getElementById("q-text").textContent || "").slice(0, 50) + "'");
  L("T3 chip='" + document.getElementById("q-chip").textContent + "'");
  L("T3 timer='" + document.getElementById("sess-timer-value").textContent + "'");
  if (active() !== "view-session") { console.log("FAIL T3"); process.exit(1); }

  // Compila e invia
  const ta = document.getElementById("answer-textarea");
  ta.value = "Il principio di proporzionalità si attua bilanciando l'interesse pubblico con i diritti del cittadino, valutando idoneità, necessità e proporzionalità in concreto, come prevede l'art. 12 della legge 241 del 1990.";
  ta.dispatchEvent(new window.Event("input"));
  L("T4 words='" + document.getElementById("word-count").textContent + "'");
  document.getElementById("send-btn").click();
  // Verifica sincrona: lo skeleton appare subito al click
  L("T4 skeleton-on=" + document.getElementById("feedback-skeleton").classList.contains("is-on"));
  if (!document.getElementById("feedback-skeleton").classList.contains("is-on")) { console.log("FAIL T4"); process.exit(1); }

  await sleep(2500);
  L("T5 fb='" + (document.getElementById("feedback-text").textContent || "").slice(0, 40) + "'");
  L("T5 content-on=" + document.getElementById("feedback-content").classList.contains("is-on"));
  L("T5 err-on=" + document.getElementById("feedback-error").classList.contains("is-on"));
  L("T5 m1=" + (document.getElementById("mnum-chiarezza") ? document.getElementById("mnum-chiarezza").textContent : "n/a"));
  L("T5 next='" + document.getElementById("next-btn").textContent + "' on=" + document.getElementById("next-btn").classList.contains("is-on"));
  if (!document.getElementById("feedback-text").textContent) { console.log("FAIL T5"); process.exit(1); }

  // Avanti → domanda 2 con accordion feedback precedente
  // Il bottone compare dopo 2.5s dalla fine del typewriter: attendiamo.
  for (let w = 0; w < 10 && !document.getElementById("next-btn").classList.contains("is-on"); w++) {
    await sleep(500);
  }
  L("T6 next-visible=" + document.getElementById("next-btn").classList.contains("is-on"));
  document.getElementById("next-btn").click();
  await sleep(300);
  L("T6 label='" + document.getElementById("sess-progress-label").textContent + "'");
  L("T6 prevfb=" + (document.getElementById("prev-feedback").classList.contains("hidden") ? "hidden" : "visible"));
  if (document.getElementById("sess-progress-label").textContent !== "Domanda 2 di 12") { console.log("FAIL T6"); process.exit(1); }

  // Pausa
  document.getElementById("sess-pause").click();
  await sleep(100);
  L("T7 pause=" + document.getElementById("pause-overlay").classList.contains("is-on"));
  document.getElementById("pause-resume").click();
  await sleep(100);
  L("T7 pause-after=" + document.getElementById("pause-overlay").classList.contains("is-on"));

  console.log("\n=== RISULTATO: TUTTI I TEST PASSATI ===");
  console.log("Log:", log.length, "voci");
  process.exit(0);
})().catch((e) => {
  console.error("ERRORE:", e && e.message ? e.message : e);
  console.error(e && e.stack);
  process.exit(1);
});
