/* Test del REPORT: completa una sessione Rapida (6 domande) con
   prefers-reduced-motion (typewriter istantaneo, briefing istantaneo) e
   verifica che il report si apra con gauge, dimensioni e CTA. */
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

const HTML = fs.readFileSync(path.join(__dirname, "..", "public", "simulation.html"), "utf8");
const SIM_JS = fs.readFileSync(path.join(__dirname, "..", "public", "js", "simulation.js"), "utf8");

const dom = new JSDOM(HTML, {
  url: "http://localhost/simulation.html",
  runScripts: "outside-only",
  pretendToBeVisual: true
});
const { window } = dom;
const { document } = window;

// prefers-reduced-motion: reduce (typewriter + briefing istantanei)
window.matchMedia = (q) => ({
  matches: q.indexOf("reduce") !== -1,
  media: q, addEventListener: () => {}, removeEventListener: () => {}
});

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
  toast: (m) => { console.log("  TOAST: " + m); },
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
  loadUser: () => Promise.resolve({ id: "u1", email: "a@b.it", displayName: "Mario", plan: "free" }),
  renderUser: () => {},
  loadCommon: () => Promise.resolve({ used: 0, streak: 0, record: 0 }),
  renderUsage: () => {},
  renderStreak: () => {},
  renderBandoSwitch: () => {},
  getActiveBando: () => ({ id: 42, filename: "Bando Istruttore Comune di Milano.pdf", total_pages: 38, created_at: "2026-07-12T10:00:00Z" }),
  setActiveBando: () => {},
  initShell: () => {},
  FREE_SIM_LIMIT: 3
};

const bank = [];
for (let i = 0; i < 6; i++) {
  bank.push({ testo: "Domanda rapida numero " + (i + 1) + " sul diritto amministrativo?", argomento: "Diritto amministrativo" });
}
const fbJson = {
  chiarezza: 7.5, struttura: 6.0, contenuto: 5.0, lessico: 7.0, pertinenza: 6.5,
  feedback: "La risposta incardina correttamente il principio ma non cita la base normativa.",
  suggerimento: "La prossima volta apri citando la fonte."
};
const fbContent = JSON.stringify(fbJson);
const sse = 'data: ' + JSON.stringify({ choices: [{ delta: { content: fbContent } }] }) + "\n\n" + "data: [DONE]\n\n";

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
  return { ok: true, status: 200, json: () => Promise.resolve(jsonData), body: { getReader: () => reader } };
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

window.eval(SIM_JS);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function active() { const a = document.querySelector(".view.is-active"); return a ? a.id : "none"; }
function L(s) { console.log("  " + s); }

(async function run() {
  console.log("=== TEST REPORT ===");
  await sleep(800);
  L("R1 active=" + active());

  // Seleziona Rapida
  document.getElementById("mode-rapida").click();
  await sleep(100);
  L("R2 detail='" + document.getElementById("mode-sub-detail").textContent.slice(0, 40) + "'");

  // Avvia
  document.getElementById("setup-start").click();
  await sleep(2500);
  L("R3 active=" + active() + " (atteso view-session)");

  // Rispondi a tutte e 6 le domande
  for (let d = 1; d <= 6; d++) {
    const ta = document.getElementById("answer-textarea");
    ta.value = "Il principio di legalità dell'azione amministrativa trova fondamento nella Costituzione e nella legge 241 del 1990, e si declina in tipicità, motivazione e proporzionalità.";
    ta.dispatchEvent(new window.Event("input"));
    document.getElementById("send-btn").click();
    // attendi feedback + bottone successiva
    for (let w = 0; w < 12 && !document.getElementById("next-btn").classList.contains("is-on"); w++) {
      await sleep(300);
    }
    const nb = document.getElementById("next-btn");
    const label = document.getElementById("sess-progress-label").textContent;
    L("R4 d" + d + " label='" + label + "' next='" + nb.textContent + "'");
    if (d < 6) { nb.click(); await sleep(200); }
  }

  // Dopo la domanda 6 il bottone dice "Vedi il risultato" — clicca
  await sleep(300);
  const nb = document.getElementById("next-btn");
  L("R5 last-next='" + nb.textContent + "'");
  if (nb.textContent.indexOf("risultato") === -1) { console.log("FAIL R5"); process.exit(1); }
  nb.click();
  await sleep(800);

  L("R6 active=" + active() + " (atteso view-report)");
  L("R6 h1='" + (document.querySelector(".report-h1") ? document.querySelector(".report-h1").textContent : "none") + "'");
  L("R6 metrics=" + document.querySelectorAll(".rm-row").length + " (atteso 3)");
  L("R6 gauge=" + (document.querySelector(".gauge-fill") ? "si" : "no"));
  L("R6 rev-items=" + document.querySelectorAll(".review-item").length + " (atteso 6)");
  L("R6 cta=" + Array.from(document.querySelectorAll(".report-actions button, .report-actions a")).map((b) => b.textContent).join(" | "));

  if (active() !== "view-report") { console.log("FAIL R6"); process.exit(1); }
  if (document.querySelectorAll(".rm-row").length !== 3) { console.log("FAIL R6-metrics"); process.exit(1); }
  if (document.querySelectorAll(".review-item").length !== 6) { console.log("FAIL R6-review"); process.exit(1); }
  console.log("\n=== REPORT: TUTTI I TEST PASSATI ===");
  process.exit(0);
})().catch((e) => {
  console.error("ERRORE:", e && e.message ? e.message : e);
  console.error(e && e.stack);
  process.exit(1);
});
