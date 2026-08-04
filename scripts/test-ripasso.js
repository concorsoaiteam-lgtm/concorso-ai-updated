/* Test del fix "Rifai le domande deboli": dopo un report, retryWeak deve
   avviare una sessione con le domande a voto <6, non il fallback generico. */
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

window.matchMedia = (q) => ({
  matches: q.indexOf("reduce") !== -1,
  media: q, addEventListener: () => {}, removeEventListener: () => {}
});
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

// Bank con 3 domande: la 1 debole, la 2 forte, la 3 debole
const bank = [
  { testo: "Domanda DEBOLE uno sulla legalità?", argomento: "Legalità" },
  { testo: "Domanda FORTE sulla trasparenza?", argomento: "Trasparenza" },
  { testo: "Domanda DEBOLE tre sul procedimento?", argomento: "Procedimento" }
];
// Feedback con punteggi diversi per domanda
const fbByQ = {
  0: { chiarezza: 3, struttura: 4, contenuto: 2, lessico: 5, pertinenza: 4, feedback: "Debole.", suggerimento: "Studia." },
  1: { chiarezza: 8, struttura: 8, contenuto: 9, lessico: 8, pertinenza: 8, feedback: "Forte.", suggerimento: "Ottimo." },
  2: { chiarezza: 3, struttura: 3, contenuto: 3, lessico: 4, pertinenza: 3, feedback: "Debole.", suggerimento: "Ripassa." }
};
let fbCounter = 0;

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
    console.log("  MOCK-BANK branch hit, stream=", body.stream);
    return Promise.resolve(mockStreamResponse("", { choices: [{ message: { content: JSON.stringify(bank) } }] }));
  }
  console.log("  MOCK-FB branch hit, sys=", sys.slice(0, 60));
  // Feedback debole per tutte le domande della prima sessione
  const fb = { chiarezza: 3, struttura: 3, contenuto: 3, lessico: 4, pertinenza: 3, feedback: "Debole.", suggerimento: "Ripassa." };
  const content = JSON.stringify(fb);
  const sse = 'data: ' + JSON.stringify({ choices: [{ delta: { content } }] }) + "\n\n" + "data: [DONE]\n\n";
  return Promise.resolve(mockStreamResponse(sse));
};

window.eval(SIM_JS);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function active() { const a = document.querySelector(".view.is-active"); return a ? a.id : "none"; }
function L(s) { console.log("  " + s); }

(async function run() {
  console.log("=== TEST RIFAI DOMANDE DEBOLI ===");
  await sleep(800);
  document.getElementById("setup-start").click();
  await sleep(2500);
  L("R1 active=" + active() + " (atteso view-session)");

  // Rispondi a tutte e 3 (ridotto dalla bank piccola)
  for (let d = 1; d <= 3; d++) {
    // Attende che la sessione sia davvero partita
    for (let w = 0; w < 20 && active() !== "view-session"; w++) { await sleep(300); }
    const ta = document.getElementById("answer-textarea");
    ta.value = "Il principio si fonda sulla Costituzione e sulla legge 241 del 1990, con tipicità e proporzionalità.";
    ta.dispatchEvent(new window.Event("input"));
    document.getElementById("send-btn").click();
    // Attende il feedback + bottone successiva
    for (let w = 0; w < 20 && !document.getElementById("next-btn").classList.contains("is-on"); w++) {
      await sleep(300);
    }
    const nb = document.getElementById("next-btn");
    L("R" + (d + 1) + " d" + d + "='" + nb.textContent + "' label='" +
      document.getElementById("sess-progress-label").textContent + "' active=" + active());
    if (d < 3) { nb.click(); await sleep(200); }
  }

  await sleep(400);
  const nb = document.getElementById("next-btn");
  L("R4b next='" + nb.textContent + "' on=" + nb.classList.contains("is-on"));
  nb.click();
  for (let w = 0; w < 20 && active() !== "view-report"; w++) { await sleep(300); }
  L("R5 active=" + active() + " (atteso view-report)");

  // Clicca "Rifai le domande deboli"
  const weakBtn = document.getElementById("report-retry-weak");
  L("R6 weak-btn=" + (weakBtn ? "si" : "no"));
  if (!weakBtn) { console.log("FAIL: nessun bottone rifai deboli"); process.exit(1); }
  weakBtn.click();
  await sleep(400);

  L("R7 active=" + active() + " (atteso view-session)");
  L("R7 q='" + (document.getElementById("q-text").textContent || "") + "'");
  L("R7 label='" + document.getElementById("sess-progress-label").textContent + "'");

  const qText = document.getElementById("q-text").textContent || "";
  const isWeak1 = qText.indexOf("DEBOLE uno") !== -1;
  const isWeak3 = qText.indexOf("DEBOLE tre") !== -1;
  L("R7 domanda-debole=" + (isWeak1 || isWeak3 ? "si" : "no") + " (atteso si)");
  L("R7 non-generica=" + (qText.indexOf("Domanda rapida") === -1 ? "si" : "no"));

  if (active() !== "view-session") { console.log("FAIL R7-active"); process.exit(1); }
  if (!isWeak1 && !isWeak3) { console.log("FAIL R7: non è una domanda debole reale"); process.exit(1); }

  console.log("\n=== RIFAI DEBOLI: TUTTI I TEST PASSATI ===");
  process.exit(0);
})().catch((e) => {
  console.error("ERRORE:", e && e.message ? e.message : e);
  process.exit(1);
});
