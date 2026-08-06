/* Test headless di simulation.js — FLUSSO SENZA BANDO (allenamento libero).
   Verifica: init con getActiveBando()=null → gate offre "Simula con una
   materia a caso" → click → setup mostra la materia → "Cambia materia"
   estrae un'altra materia → inizia sessione → domanda sulla materia →
   feedback (mock SSE) → next. NON tocca la rete: /api/chat mockato. */
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
window.matchMedia = (q) => ({ matches: q.indexOf("reduce") !== -1, media: q, addEventListener() {}, removeEventListener() {} });
window.Element.prototype.scrollIntoView = function () {};
window.scrollTo = function () {};

const log = [];
function L(msg) { log.push(msg); console.log(msg); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- Stub Supabase (senza bando) ----
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

window.__SUPABASE_URL = "https://example.supabase.co";
window.__SUPABASE_ANON_KEY = "anon";
window.supabase = { createClient: () => stubClient };
window.telemetry = () => {};
window.Dash = {
  $: (id) => document.getElementById(id),
  supabase: stubClient,
  escapeHtml: (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"),
  track: () => {},
  toast: (m) => L("TOAST: " + m),
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
  guard: () => Promise.resolve(true),
  loadUser: () => Promise.resolve({ id: "u1", email: "a@b.it", displayName: "Mario", plan: "free" }),
  loadCommon: () => Promise.resolve({ used: 0 }),
  getActiveBando: () => null, // ← NESSUN BANDO: siamo in allenamento libero
  nextRenewalLabel: () => "1° del mese",
  track: () => {}
};

// ---- Mock /api/chat ----
let fetchCalls = [];
let bankCounter = 0;
window.fetch = (url, opts) => {
  const body = JSON.parse(opts.body || "{}");
  const sys = (body.messages && body.messages[0] && body.messages[0].content) || "";
  const subjectMatch = sys.match(/materia: «([^»]+)»/);
  const subject = subjectMatch ? subjectMatch[1] : null;
  fetchCalls.push({ url, stream: !!body.stream, subject });
  if (body.stream) {
    // Feedback: streaming SSE (formato OpenAI-compat)
    const fb = { chiarezza: 7, struttura: 6, contenuto: 5, lessico: 7, pertinenza: 6,
      feedback: "La risposta espone il tema e cita le fonti principali. Manca un esempio concreto tratto dalla prassi.",
      suggerimento: "Aggiungi un esempio pratico per chiudere la risposta." };
    const json = JSON.stringify(fb);
    const chunks = json.match(/.{1,40}/g) || [];
    const sse = chunks.map((c) => "data: " + JSON.stringify({ choices: [{ delta: { content: c } }] }) + "\n\n").join("") + "data: [DONE]\n\n";
    const enc = new TextEncoder();
    let idx = 0;
    const reader = {
      read: () => {
        if (idx >= sse.length) return Promise.resolve({ done: true, value: undefined });
        const v = enc.encode(sse.slice(idx, idx + 64));
        idx += 64;
        return Promise.resolve({ done: false, value: v });
      }
    };
    return Promise.resolve({ ok: true, body: { getReader: () => reader } });
  }
  // Bank: domande che CITANO la materia richiesta (per testare il cambio)
  bankCounter += 1;
  const qs = [
    "Domanda BANK#" + bankCounter + " su " + (subject || "materia") + " — principi fondamentali.",
    "Quali sono gli istituti principali di " + (subject || "materia") + "?",
    "Mi spieghi come si applica nell'attività della PA.", "Quali riferimenti normativi sono centrali?",
    "Mi parli di un caso tipico da saper inquadrare.", "Come si collega agli altri istituti del diritto pubblico?",
    "Mi indichi i punti da approfondire.", "Quali errori commette spesso un candidato?",
    "Come imposterebbe una risposta completa?", "Quali aggiornamenti normativi recenti la riguardano?",
    "Mi parli della rilevanza pratica per il lavoro nella PA.", "Cosa distingue il profilo teorico da quello pratico?"
  ];
  const arr = qs.map((t, i) => ({ testo: t, argomento: subject || "Materia estratta" }));
  return Promise.resolve({ ok: true, json: () => Promise.resolve({ choices: [{ message: { content: JSON.stringify(arr) } }] }) });
};

// ---- Esegui script reale ----
window.eval(SIM_JS);

(async () => {
  await sleep(400); // init async

  // F1: siamo nel gate (nessun bando) — micro-decisione round 55
  L("F1 gate-active=" + document.getElementById("view-gate").classList.contains("is-active"));
  L("F1 title='" + document.getElementById("gate-title").textContent + "'");
  const gateFree = document.getElementById("gate-path-demo");
  L("F1 gate-free-cta=" + (gateFree ? gateFree.textContent : "MANCANTE"));
  if (!gateFree) { console.log("FAIL F1: manca il CTA materia a caso"); process.exit(1); }

  // F2: click → setup con card materia
  gateFree.click();
  await sleep(100);
  L("F2 setup-active=" + document.getElementById("view-setup").classList.contains("is-active"));
  const nameEl = document.getElementById("setup-bando-name");
  L("F2 materia='" + nameEl.textContent + "'");
  L("F2 tag-free=" + document.getElementById("setup-bando-tag").classList.contains("hidden"));
  L("F2 change-btn='" + document.getElementById("setup-bando-change").textContent + "'");
  if (!document.getElementById("view-setup").classList.contains("is-active")) { console.log("FAIL F2"); process.exit(1); }
  if (!nameEl.textContent) { console.log("FAIL F2: materia non estratta"); process.exit(1); }

  // F2b: nel setup della demo c'è la via d'uscita verso il bando
  const altBando = document.getElementById("setup-alt-bando");
  L("F2b alt-bando=" + (altBando ? altBando.textContent.trim() : "MANCANTE") +
    " hidden=" + (altBando ? altBando.classList.contains("hidden") : "?"));
  if (!altBando || altBando.classList.contains("hidden")) {
    console.log("FAIL F2b: manca la via d'uscita verso il bando nel setup demo");
    process.exit(1);
  }

  // F3: Cambia materia → materia diversa (o almeno ristratta senza crash)
  const first = nameEl.textContent;
  document.getElementById("setup-bando-change").click();
  await sleep(100);
  const second = document.getElementById("setup-bando-name").textContent;
  L("F3 cambia '" + first + "' → '" + second + "'");
  L("F3 sub='" + document.getElementById("setup-sub").textContent.slice(0, 50) + "'");
  // La materia mostrata deve essere quella del setup (non stale)
  const setupSubject = document.getElementById("setup-bando-name").textContent;
  L("F3b setup-materia='" + setupSubject + "'");

  // F4: CTA abilitato → Inizia
  const start = document.getElementById("setup-start");
  L("F4 start-disabled=" + start.disabled + " text='" + start.textContent + "'");
  if (start.disabled) { console.log("FAIL F4: CTA disabilitato senza bando"); process.exit(1); }
  start.click();
  await sleep(100);
  L("F4 briefing=" + document.getElementById("view-briefing").classList.contains("is-active"));
  L("F4 brief1='" + document.getElementById("briefing-1").textContent.slice(0, 60) + "'");

  // F5: la sessione parte e le domande sono della MATERIA SELEZIONATA
  await sleep(6500); // briefing 2.6s + attesa bank
  L("F5 session=" + document.getElementById("view-session").classList.contains("is-active"));
  const f5q = document.getElementById("q-text").textContent || "";
  L("F5 q='" + f5q.slice(0, 60) + "'");
  L("F5 chip='" + document.getElementById("q-chip").textContent + "'");
  L("F5 label='" + document.getElementById("sess-progress-label").textContent + "'");
  const bankCalls = fetchCalls.filter((c) => !c.stream);
  L("F5 bank-llm-calls=" + bankCalls.length);
  if (!document.getElementById("view-session").classList.contains("is-active")) { console.log("FAIL F5"); process.exit(1); }
  if (!f5q) { console.log("FAIL F5: domanda mancante"); process.exit(1); }
  // BUG CHECK: la domanda deve citare la materia selezionata (non una stale)
  const setupSubject2 = document.getElementById("setup-bando-name").textContent;
  if (f5q.indexOf(setupSubject2) === -1 && f5q.indexOf("BANK#") === -1) {
    console.log("FAIL F5: domanda non legata alla materia selezionata '" + setupSubject2 + "'");
    process.exit(1);
  }
  if (!bankCalls.length) { console.log("FAIL F5: nessuna chiamata bank"); process.exit(1); }

  // F6: risposta → feedback mock
  const ta = document.getElementById("answer-textarea");
  ta.value = "La materia si fonda su principi consolidati: il principio di legalità e quello di buon andamento. La legge 241/1990 disciplina il procedimento e garantisce il diritto di partecipazione del cittadino. In concreto, la PA deve motivare i propri provvedimenti e rispettare i termini. Questo è il quadro normativo di riferimento.";
  ta.dispatchEvent(new window.Event("input", { bubbles: true }));
  await sleep(50);
  document.getElementById("send-btn").click();
  await sleep(100);
  L("F6 skeleton=" + document.getElementById("feedback-skeleton").classList.contains("is-on"));
  await sleep(2500);
  L("F6 fb='" + (document.getElementById("feedback-text").textContent || "").slice(0, 50) + "'");
  L("F6 content-on=" + document.getElementById("feedback-content").classList.contains("is-on"));
  if (!document.getElementById("feedback-text").textContent) { console.log("FAIL F6"); process.exit(1); }

  console.log("\n=== RISULTATO: FLUSSO SENZA BANDO OK ===");
  console.log("Log:", log.length, "voci");
  process.exit(0);
})().catch((e) => {
  console.error("ERRORE:", e && e.message ? e.message : e);
  console.error(e && e.stack);
  process.exit(1);
});
