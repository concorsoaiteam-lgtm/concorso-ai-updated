// ============================================================
// /public/js/pricing.js — Pricing page logic
// ============================================================
// 1. CTA "Passa a Pro" apre <dialog showModal()>.
// 2. Submit email waitlist inserisce in `events` (Supabase) —
//    stesso pattern di dashboard.html Classifica waitlist.
// 3. Fallback localStorage se Supabase non disponibile: utente
//    non resta bloccato, l'intent è preservato.
// 4. Nessun toast invadente, nessun console spam, nessun gradient.
// ============================================================

(function () {
  "use strict";

  var STORAGE_KEY = "ATLAS_PRO_WAITLIST_INTENT";

  // NB: telemetry helper usa schema canonico Supabase `{event, page, payload, user_id?}`.
  // RLS policy permette insert anonimo (`insert_events ... WITH CHECK (true)`),
  // quindi page_view di utenti non loggati su /pricing.html funziona anche senza user_id.
  // Nessuna migrazione DB necessaria: M19 riusa lo schema events già esistente.

  // Hash leggero (no crypto). Solo per evitare PII verbatim in events.
  function hashEmail(email) {
    if (!email) return null;
    var h = 0;
    var s = String(email).toLowerCase();
    for (var i = 0; i < s.length; i++) {
      h = ((h << 5) - h) + s.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h).toString(36);
  }

  function saveIntentLocally(email, emailHash) {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var arr = [];
      if (raw) { try { arr = JSON.parse(raw) || []; } catch (_) { arr = []; } }
      if (!Array.isArray(arr)) arr = [];
      arr.push({ email: email, email_hash: emailHash || null, ts: new Date().toISOString() });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (_) { /* quota / private mode: ignoriamo */ }
  }

  function bindProCta() {
    var btn = document.getElementById("proCta");
    var dialog = document.getElementById("proWaitlistDialog");
    var emailInput = document.getElementById("proWaitlistEmail");
    var cancelBtn = document.getElementById("proDialogCancel");
    var form = document.getElementById("proDialogForm");
    var submitBtn = document.getElementById("proDialogSubmit");
    var submitText = document.getElementById("proDialogSubmitText");
    var confirmEl = document.getElementById("proDialogConfirm");
    if (!btn || !dialog || !emailInput || !cancelBtn || !form) return;

    function openDialog() {
      try {
        if (typeof dialog.showModal === "function") {
          dialog.showModal();
        } else {
          dialog.setAttribute("open", "");
        }
      } catch (_) { dialog.setAttribute("open", ""); }
      setTimeout(function () { try { emailInput.focus(); } catch (_) {} }, 30);
    }

    function closeDialog(reset) {
      try {
        if (typeof dialog.close === "function") dialog.close();
        else dialog.removeAttribute("open");
      } catch (_) { dialog.removeAttribute("open"); }
      if (reset) {
        form.reset();
        confirmEl.classList.add("hidden");
        submitBtn.disabled = false;
        submitText.textContent = "Blocca il prezzo";
        cancelBtn.textContent = "Annulla";
      }
    }

    function showConfirm() {
      confirmEl.classList.remove("hidden");
      submitText.textContent = "Inviato";
      cancelBtn.textContent = "Chiudi";
      submitBtn.disabled = true;
    }

    btn.addEventListener("click", function () {
      // M19: telemetry helper, fire-and-forget (canonical schema).
      try { window.telemetry("paywall_cta_clicked", { source: "pro_cta_pricing_page" }); } catch (_) {}
      openDialog();
    });

    cancelBtn.addEventListener("click", function () {
      closeDialog(true);
    });

    // Chiudi anche cliccando sul backdrop.
    dialog.addEventListener("click", function (e) {
      var rect = dialog.getBoundingClientRect();
      var insideDialog = (
        e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom
      );
      if (!insideDialog) closeDialog(true);
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var email = String(emailInput.value || "").trim();
      if (!email) return;

      // Throttle: se stesso email_hash già inviato in questa sessione
      // (localStorage persistente), mostra conferma diretta.
      var emailHash = hashEmail(email);
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        var stored = raw ? JSON.parse(raw) : [];
        if (Array.isArray(stored) && stored.some(function (e) { return e && e.email_hash === emailHash; })) {
          showConfirm();
          return;
        }
      } catch (_) { /* storage rotto: proseguiamo con insert */ }

      submitBtn.disabled = true;
      submitText.textContent = "Invio…";

      // Belt-and-suspenders: salvo localmente PRIMA del telemetry insert (offline-safe).
      saveIntentLocally(email, emailHash);
      // M19: telemetry helper, fire-and-forget verso Supabase events.
      try { window.telemetry("pro_waitlist_join", { source: "pro_dialog_pricing_page", email_hash: emailHash }); } catch (_) {}
      showConfirm();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindProCta);
  } else {
    bindProCta();
  }
})();
