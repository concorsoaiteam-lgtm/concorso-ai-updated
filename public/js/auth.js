/* =========================================================================
   auth.js — ConcorsoAI
   Sistema di autenticazione. Vanilla JS. Nessuna libreria oltre Supabase.
   Obiettivo: massimizzare il completamento della registrazione.
   Ogni funzione ha un motivo: validazione live (Baymard), anti-enumeration
   (NN/g), skeleton invece di spinner (NN/g perceived performance).
   ========================================================================= */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     Supabase — stesso progetto della landing/dashboard.
     Override possibile via __SUPABASE_URL / __SUPABASE_ANON_KEY.
     ------------------------------------------------------------------ */
  var SUPABASE_URL = (typeof __SUPABASE_URL !== "undefined" && __SUPABASE_URL)
    ? __SUPABASE_URL
    : ["https://", "xhifnparcouxsypkjcmn", ".supabase.co"].join("");
  var SUPABASE_ANON_KEY = (typeof __SUPABASE_ANON_KEY !== "undefined" && __SUPABASE_ANON_KEY)
    ? __SUPABASE_ANON_KEY
    : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoaWZucGFyY291eHN5cGtqY21uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2MDMxNTQsImV4cCI6MjA5ODE3OTE1NH0._NjGTkLfAVjCcaefEtx46lW15Twl7LHGoWLFxOPvRnM";

  // Produzione (round 41): flow PKCE esplicito (OAuth 2.1 per SPA, mai implicit),
  // autoRefreshToken + detectSessionInUrl per deep link recovery/OAuth.
  // NB: NESSUN storageKey custom — dashboard/simulation usano la chiave default
  //     (sb-<ref>-auth-token): una chiave diversa spezzerebbe il login.
  // NB: localStorage è il massimo consentito su static hosting (vedi
  //     md/auth-architecture.md §5.5): mitigato da CSP + textContent ovunque.
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

  // telemetry.js e auth-patch.js leggono window.supabaseClient
  window.supabaseClient = supabaseClient;

  var DASHBOARD_URL = "/dashboard.html";
  var REDUCED_MOTION = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Email della registrazione in attesa di verifica OTP (pannello verify).
  var pendingEmail = "";

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */
  function $(id) { return document.getElementById(id); }

  function getParams() {
    var out = {};
    var search = new URLSearchParams(window.location.search);
    search.forEach(function (v, k) { out[k] = v; });
    // Supabase mette token_hash e type anche nell'hash (#...) dei deep link
    try {
      var hash = new URLSearchParams(window.location.hash.substring(1));
      hash.forEach(function (v, k) { if (!out[k]) out[k] = v; });
    } catch (e) { /* hash malformato: ignora */ }
    return out;
  }

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function isValidEmail(v) { return EMAIL_RE.test(String(v || "").trim()); }

  function track(event, meta) {
    try {
      if (typeof window.telemetry === "function") {
        window.telemetry(event, meta || {});
      }
    } catch (e) { /* telemetry fire-and-forget */ }
  }

  // Guard Supabase: se il CDN non è raggiungibile non blocchiamo il form
  // in stato busy senza feedback (review fix).
  function guardSupabase() {
    if (supabaseClient) return true;
    showAuthError("Non riusciamo a raggiungere il server. Controlla la connessione e riprova.");
    return false;
  }

  /* ------------------------------------------------------------------
     Errori: regione globale (role=alert) + field inline.
     ------------------------------------------------------------------ */
  var authErrTimer = null;

  // Slot errore per pannello: l'errore compare SEMPRE sotto il bottone
  // del pannello attivo, mai sopra il form (fade + slide 6px).
  var FORM_ERRORS = {
    login: "form-error-login",
    register: "form-error-register",
    forgot: "form-error-forgot",
    verify: "form-error-verify",
    reset: "form-error-reset"
  };
  var activePanel = "login";

  function showAuthError(msg) {
    var slot = $(FORM_ERRORS[activePanel]);
    if (!slot) return;
    slot.textContent = msg;
    slot.classList.add("is-visible");
    window.clearTimeout(authErrTimer);
    authErrTimer = window.setTimeout(clearAuthError, 6000);
  }

  function clearAuthError() {
    Object.keys(FORM_ERRORS).forEach(function (k) {
      var slot = $(FORM_ERRORS[k]);
      if (!slot) return;
      slot.textContent = "";
      slot.classList.remove("is-visible");
    });
    window.clearTimeout(authErrTimer);
  }

  function setFieldError(inputId, errorId, message) {
    var input = $(inputId);
    var err = $(errorId);
    if (!input || !err) return;
    if (message) {
      input.setAttribute("aria-invalid", "true");
      err.textContent = message;
      err.classList.add("is-visible");
    } else {
      input.removeAttribute("aria-invalid");
      err.textContent = "";
      err.classList.remove("is-visible");
    }
  }

  // supabase-js espone il codice errore in `code` (da error_code) ma in
  // versioni/percorsi diversi può essere in `error_code`: normalizziamo.
  function errCode(err) {
    return err && (err.code || err.error_code);
  }

  // Traduzione errori: prima per codice Supabase (err.code), poi per messaggio.
  // Mai rivelare dettagli che permettano enumeration (OWASP Forgot Password).
  // Ogni messaggio include la prossima azione consigliata.
  function translateAuthError(message, code) {
    var c = String(code || "").toLowerCase();
    var msg = String(message || "").toLowerCase();

    if (c.indexOf("invalid_credentials") !== -1 ||
        msg.indexOf("invalid login credentials") !== -1) {
      return "Email o password non giusti. Riprova, oppure recupera la password.";
    }
    if (c.indexOf("email_not_confirmed") !== -1 ||
        msg.indexOf("email not confirmed") !== -1) {
      return "Prima conferma la tua email: trovi il link nella casella (o nello spam).";
    }
    if (c.indexOf("over_email_send_rate_limit") !== -1 ||
        msg.indexOf("email rate limit") !== -1 ||
        msg.indexOf("rate limit") !== -1) {
      return "Troppe email in poco tempo. Aspetta un minuto e riprova.";
    }
    if (c.indexOf("over_request_rate_limit") !== -1 ||
        msg.indexOf("too many requests") !== -1) {
      return "Troppi tentativi. Aspetta un momento e riprova.";
    }
    if (c.indexOf("user_banned") !== -1) {
      return "Questo account è stato sospeso. Scrivici e ti aiutiamo.";
    }
    if (c.indexOf("captcha_failed") !== -1) {
      return "Verifica non superata. Riprova.";
    }
    if (c.indexOf("weak_password") !== -1 ||
        msg.indexOf("password should be at least") !== -1 ||
        msg.indexOf("at least 8 characters") !== -1) {
      return "La password è troppo corta: servono almeno 8 caratteri.";
    }
    if (c.indexOf("otp_expired") !== -1 ||
        msg.indexOf("token has expired") !== -1 ||
        msg.indexOf("expired") !== -1) {
      return "Il codice è scaduto. Richiedine uno nuovo.";
    }
    if (c.indexOf("invalid_token") !== -1 ||
        msg.indexOf("invalid token") !== -1) {
      return "Codice non corretto. Controlla l'email e riprova.";
    }
    if (c.indexOf("timeout") !== -1 ||
        msg.indexOf("timeout") !== -1 ||
        msg.indexOf("timed out") !== -1) {
      return "Il server ha tardato a rispondere. Riprova tra un attimo.";
    }
    if (c.indexOf("internal server error") !== -1 ||
        c === "500" || c === "502" || c === "503" ||
        msg.indexOf("internal server error") !== -1 ||
        msg.indexOf("service unavailable") !== -1) {
      return "Il server è momentaneamente occupato. Riprova tra qualche minuto.";
    }
    if (c.indexOf("user_already_exists") !== -1 ||
        c.indexOf("already_registered") !== -1 ||
        msg.indexOf("already registered") !== -1) {
      return "Questa email è già registrata. Se è la tua, accedi.";
    }
    if (c.indexOf("email_provider_disabled") !== -1) {
      return "L'accesso con email è in pausa. Riprova più tardi.";
    }
    if (c.indexOf("signup_disabled") !== -1) {
      return "La registrazione è chiusa per ora. Riprova più tardi.";
    }
    if (c.indexOf("failed to fetch") !== -1 ||
        msg.indexOf("failed to fetch") !== -1 ||
        msg.indexOf("network") !== -1) {
      return "Problema di connessione. Riprova tra qualche secondo.";
    }
    return "Qualcosa è andato storto. Riprova tra qualche secondo.";
  }

  /* ------------------------------------------------------------------
     Pannelli: router + focus management
     ------------------------------------------------------------------ */
  var PANELS = ["login", "register", "forgot", "sent", "verify", "reset"];

  function showPanel(name) {
    PANELS.forEach(function (n) {
      var p = $("panel-" + n);
      if (!p) return;
      if (n === name) {
        p.hidden = false;
        p.classList.remove("is-enter");
        void p.offsetWidth; // reflow per riavviare l'animazione
        p.classList.add("is-enter");
      } else {
        p.hidden = true;
      }
    });

    // Tabs visibili solo nelle viste login/register
    var tabs = $("auth-tabs");
    if (tabs) {
      tabs.style.display = (name === "login" || name === "register") ? "" : "none";
    }

    var isLogin = name === "login";
    var tabL = $("tab-login");
    var tabR = $("tab-register");
    if (tabL) tabL.setAttribute("aria-selected", String(isLogin && name === "login"));
    if (tabR) tabR.setAttribute("aria-selected", String(!isLogin && name === "register"));

    activePanel = name;
    clearAuthError();

    // Turnstile si attiva solo quando serve: primo ingresso nei pannelli
    // Accedi/Registrati (script + widget lazy, zero costo al load).
    if (name === "register") initTurnstile("register");
    else if (name === "login") initTurnstile("login");

    // Pannello verifica: caselle pulite, focus sulla prima, countdown resend
    if (name === "verify") {
      clearOtp();
      startOtpResendTimer();
    }

    // Focus: primo campo per i form, titolo per gli stati di conferma
    window.setTimeout(function () {
      var target = null;
      if (name === "login") target = $("login-email");
      else if (name === "register") target = $("register-email");
      else if (name === "forgot") target = $("forgot-email");
      else if (name === "sent") target = $("sent-title");
      else if (name === "verify") target = otpBoxes.length ? otpBoxes[0] : null;
      else if (name === "reset") target = $("reset-password");
      if (target) target.focus({ preventScroll: true });
    }, 260);
  }

  function setMode(mode) {
    var isLogin = mode !== "register";
    if (isLogin) {
      showPanel("login");
      try { history.replaceState(null, "", "/auth.html"); } catch (e) { /* ignora */ }
    } else {
      showPanel("register");
      try { history.replaceState(null, "", "/auth.html?mode=register"); } catch (e) { /* ignora */ }
    }
  }

  /* ------------------------------------------------------------------
     Validazione live (Baymard: blur, poi live dopo il primo blur)
     ------------------------------------------------------------------ */
  var touched = {};

  function validateEmailField(inputId, errorId) {
    var v = String($(inputId).value || "").trim();
    if (!v) return setFieldError(inputId, errorId, "Inserisci la tua email");
    if (!isValidEmail(v)) {
      return setFieldError(inputId, errorId, "Questo indirizzo non sembra corretto. Ricontrolla.");
    }
    return setFieldError(inputId, errorId, "");
  }

  function validateNameField(inputId, errorId) {
    var v = String($(inputId).value || "").trim();
    if (!v) return setFieldError(inputId, errorId, "Inserisci il tuo nome");
    if (v.length < 2) return setFieldError(inputId, errorId, "Il nome deve avere almeno 2 caratteri");
    return setFieldError(inputId, errorId, "");
  }

  function bindFieldValidation(inputId, errorId) {
    var input = $(inputId);
    if (!input) return;
    input.addEventListener("blur", function () {
      touched[inputId] = true;
      validateEmailField(inputId, errorId);
    });
    input.addEventListener("input", function () {
      clearAuthError();
      if (touched[inputId]) validateEmailField(inputId, errorId);
    });
  }

  /* ------------------------------------------------------------------
     Password strength — onesto (NIST: lunghezza > complessità)
     ------------------------------------------------------------------ */
  function passwordLevel(pw) {
    pw = String(pw || "");
    if (!pw) return { level: "empty", label: "Minimo 8 caratteri", width: 0, cls: "" };
    if (pw.length < 8) {
      return { level: "weak", label: "Servono almeno 8 caratteri", width: 33, cls: "is-weak" };
    }
    var hasUp = /[A-ZÀ-Ý]/.test(pw);
    var hasNumSym = /[0-9\W_]/.test(pw);
    var score = 0;
    if (pw.length >= 10) score++;
    if (pw.length >= 14) score++;
    if (hasUp) score++;
    if (hasNumSym) score++;
    if (score >= 4) return { level: "strong", label: "Ottima", width: 100, cls: "is-strong" };
    if (score >= 2) return { level: "medium", label: "Buona", width: 66, cls: "is-medium" };
    return { level: "weak", label: "Aggiungi una maiuscola o un numero", width: 33, cls: "is-weak" };
  }

  function bindStrength(inputId, fillId, labelId, errorId) {
    var input = $(inputId);
    var fill = $(fillId);
    var label = $(labelId);
    if (!input || !fill || !label) return;
    input.addEventListener("input", function () {
      var r = passwordLevel(input.value);
      fill.className = "pw-strength-fill " + r.cls;
      fill.style.width = r.width + "%";
      label.textContent = r.label;
      if (errorId) setFieldError(inputId, errorId, "");
    });
  }

  /* ------------------------------------------------------------------
     Toggle mostra/nascondi password
     ------------------------------------------------------------------ */
  function bindPasswordToggles() {
    document.querySelectorAll(".pw-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var input = $(btn.getAttribute("data-target"));
        if (!input) return;
        var isPassword = input.type === "password";
        input.type = isPassword ? "text" : "password";
        btn.setAttribute("aria-label", isPassword ? "Nascondi password" : "Mostra password");
        btn.setAttribute("aria-pressed", String(isPassword));
        input.focus({ preventScroll: true });
      });
    });
  }

  /* ------------------------------------------------------------------
     Stato busy bottone — barra indeterminata 1px (mai spinner)
     ------------------------------------------------------------------ */
  function setBusy(btn, busy, busyLabel, idleLabel) {
    if (!btn) return;
    var label = btn.querySelector(".btn-label");
    if (busy) {
      btn.classList.add("is-busy");
      btn.disabled = true;
      if (label && busyLabel) label.textContent = busyLabel;
    } else {
      btn.classList.remove("is-busy");
      btn.disabled = false;
      if (label && idleLabel) label.textContent = idleLabel;
    }
  }

  /* ------------------------------------------------------------------
     Toast
     ------------------------------------------------------------------ */
  var toastTimer = null;
  function showToast(msg) {
    var t = document.createElement("div");
    t.className = "auth-toast";
    t.setAttribute("role", "status");
    t.setAttribute("aria-live", "polite");
    t.textContent = msg;
    document.body.appendChild(t);
    window.setTimeout(function () { t.classList.add("is-visible"); }, 20);
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      t.classList.remove("is-visible");
      window.setTimeout(function () { t.remove(); }, 250);
    }, 3200);
  }

  /* ------------------------------------------------------------------
     Handlers — Supabase
     ------------------------------------------------------------------ */
  var lastEmail = "";

  function handleLogin(e) {
    e.preventDefault();
    if (!guardSupabase()) return;

    // Honeypot anti-bot (campo nascosto compilato solo dalle botte)
    var hpLogin = $("hp-field-login");
    if (hpLogin && String(hpLogin.value || "").trim() !== "") return;

    var email = String($("login-email").value || "").trim();
    var password = $("login-password").value || "";

    if (!email) {
      return setFieldError("login-email", "login-email-error", "Inserisci la tua email");
    }
    if (!isValidEmail(email)) {
      return setFieldError("login-email", "login-email-error", "Questo indirizzo non sembra corretto. Ricontrolla.");
    }
    if (!password) {
      return setFieldError("login-password", "login-password-error", "Inserisci la password");
    }

    var btn = $("login-submit");
    setBusy(btn, true, "Accesso in corso…", "Entra");
    track("auth_submit", { mode: "login" });

    // Turnstile invisibile anche sull'accesso: token incluso solo se
    // configurato (vedi initTurnstile). Stessa protezione di registrazione.
    var signInOptions = {};
    var captchaToken = getCaptchaToken("login");
    if (captchaToken) signInOptions.captchaToken = captchaToken;

    supabaseClient.auth.signInWithPassword({ email: email, password: password, options: signInOptions })
      .then(function (res) {
        if (res.error) throw res.error;
        track("auth_login_ok", {});
        window.location.href = DASHBOARD_URL;
      })
      .catch(function (err) {
        setBusy(btn, false, "", "Entra");
        showAuthError(translateAuthError(err && err.message, errCode(err)));
      });
  }

  function handleRegister(e) {
    e.preventDefault();
    if (!guardSupabase()) return;
    // Honeypot anti-bot: i bot compilano i campi nascosti. Se valorizzato,
    // ignoriamo il submit in modo silenzioso (nessun costo lato server).
    var hp = $("hp-field");
    if (hp && String(hp.value || "").trim() !== "") return;

    var name = String($("register-name").value || "").trim();
    var email = String($("register-email").value || "").trim();
    var password = $("register-password").value || "";
    var terms = $("terms-checkbox").checked;

    if (!name) {
      return setFieldError("register-name", "register-name-error", "Inserisci il tuo nome");
    }
    if (name.length < 2) {
      return setFieldError("register-name", "register-name-error", "Il nome deve avere almeno 2 caratteri");
    }
    if (!email) {
      return setFieldError("register-email", "register-email-error", "Inserisci la tua email");
    }
    if (!isValidEmail(email)) {
      return setFieldError("register-email", "register-email-error", "Questo indirizzo non sembra corretto. Ricontrolla.");
    }
    if (password.length < 8) {
      return setFieldError("register-password", "register-password-error", "La password deve avere almeno 8 caratteri");
    }
    if (!terms) {
      showAuthError("Per continuare, accetta i termini e la privacy.");
      return;
    }

    lastEmail = email;
    var btn = $("register-submit");
    setBusy(btn, true, "Creazione account…", "Crea account gratis");
    track("auth_submit", { mode: "register" });

    // Solo nome (first name), email e password. Niente cognome, niente
    // dati superflui: si chiede solo ciò che serve per personalizzare
    // l'esperienza (full_name arriva al trigger handle_new_user in Supabase).
    // emailRedirectTo: il link di conferma atterra su una pagina del nostro
    // dominio (mai sul default del progetto). captchaToken: Turnstile —
    // incluso solo se configurato (vedi initTurnstile).
    var signupOptions = {
      data: { full_name: name },
      emailRedirectTo: window.location.origin + "/auth.html?mode=login"
    };
    var captchaToken = getCaptchaToken("register");
    if (captchaToken) signupOptions.captchaToken = captchaToken;

    supabaseClient.auth.signUp({ email: email, password: password, options: signupOptions })
      .then(function (res) {
        if (res.error) throw res.error;

        // Duplicato "silenzioso": GoTrue restituisce 200 con identities=[]
        // quando l'email esiste già (comportamento reale, mai inventato).
        // Verificato empiricamente: l'alternativa è l'errore user_already_exists.
        var user = res.data && res.data.user;
        var identities = user && user.identities;
        if (user && Array.isArray(identities) && identities.length === 0) {
          setBusy(btn, false, "", "Crea account gratis");
          showAuthError("Questa email è già registrata. Se è la tua, accedi.");
          return;
        }

        if (res.data && res.data.session) {
          // Conferma email disattivata nel progetto: sessione immediata.
          track("auth_register_ok", {});
          window.location.href = DASHBOARD_URL;
          return;
        }

        // Conferma email attiva: il passo successivo è verificare l'email.
        // Pannello OTP con codice a 6 cifre (template Supabase: {{ .Token }}).
        pendingEmail = email;
        track("auth_register_pending", {});
        setBusy(btn, false, "", "Crea account gratis");
        $("verify-email").textContent = email;
        showPanel("verify");
      })
      .catch(function (err) {
        setBusy(btn, false, "", "Crea account gratis");
        $("register-submit").disabled = !$("terms-checkbox").checked;
        // Token Turnstile monouso: dopo un tentativo fallito il widget viene
        // resettato e il token scartato, così il retry parte da zero.
        if (window.turnstile && window.turnstile.reset && turnstileState === "rendered") {
          try { window.turnstile.reset(); } catch (x) { /* noop */ }
        }
        window.__TURNSTILE_TOKEN = "";
        showAuthError(translateAuthError(err && err.message, errCode(err)));
      });
  }

  function handleForgot(e) {
    e.preventDefault();
    if (!guardSupabase()) return;

    // Honeypot anti-bot anche qui: il recovery è un vettore di email-bombing.
    var hpForgot = $("hp-field-forgot");
    if (hpForgot && String(hpForgot.value || "").trim() !== "") return;

    var email = String($("forgot-email").value || "").trim();
    if (!email) {
      return setFieldError("forgot-email", "forgot-email-error", "Inserisci la tua email");
    }
    if (!isValidEmail(email)) {
      return setFieldError("forgot-email", "forgot-email-error", "Questo indirizzo non sembra corretto. Ricontrolla.");
    }

    lastEmail = email;
    var btn = $("forgot-submit");
    setBusy(btn, true, "Invio…", "Mandami il link");
    track("auth_submit", { mode: "forgot" });

    supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/auth.html?type=recovery"
    })
      .then(function () {
        setBusy(btn, false, "", "Mandami il link");
        // Anti-enumeration: stessa schermata in ogni caso
        showPanel("sent");
      })
      .catch(function (err) {
        setBusy(btn, false, "", "Mandami il link");
        // Privacy: mai confermare lo stato dell'email. Stessa schermata.
        showPanel("sent");
        try { console.debug("[ConcorsoAI] reset error:", err && err.message); } catch (x) { /* noop */ }
      });
  }

  function ensureRecoverySession() {
    return supabaseClient.auth.getSession().then(function (res) {
      if (res.data && res.data.session) return Promise.resolve(true);
      var tokenHash = getParams().token_hash;
      if (!tokenHash) return Promise.resolve(false);
      return supabaseClient.auth.verifyOtp({ type: "recovery", token_hash: tokenHash })
        .then(function (r) {
          return !!(r.data && r.data.session);
        })
        .catch(function () { return false; });
    });
  }

  function handleReset(e) {
    e.preventDefault();
    if (!guardSupabase()) return;
    var password = $("reset-password").value || "";
    if (password.length < 8) {
      return setFieldError("reset-password", "reset-password-error", "La password deve avere almeno 8 caratteri");
    }

    var btn = $("reset-submit");
    setBusy(btn, true, "Aggiornamento…", "Salva la nuova password");
    track("auth_submit", { mode: "reset" });

    ensureRecoverySession().then(function (ok) {
      if (!ok) {
        setBusy(btn, false, "", "Salva la nuova password");
        showAuthError("Il link non è più valido. Richiedine uno nuovo.");
        showPanel("forgot");
        return;
      }
      return supabaseClient.auth.updateUser({ password: password }).then(function (res) {
        if (res.error) throw res.error;
        track("auth_reset_ok", {});
        setBusy(btn, false, "", "Salva la nuova password");
        showToast("Password aggiornata. Stai entrando…");
        window.setTimeout(function () { window.location.href = DASHBOARD_URL; }, 900);
      })      .catch(function (err) {
        setBusy(btn, false, "", "Salva la nuova password");
        showAuthError(translateAuthError(err && err.message, errCode(err)));
      });
    });
  }

  /* ------------------------------------------------------------------
     Verifica email OTP (signup) — pannello verify, sei caselle
     ------------------------------------------------------------------ */
  var otpBoxes = [];

  function otpValue() {
    return otpBoxes.map(function (b) { return b.value; }).join("");
  }

  function clearOtp() {
    otpBoxes.forEach(function (b) { b.value = ""; });
    clearOtpError();
    if (otpBoxes.length) otpBoxes[0].focus({ preventScroll: true });
  }

  function setOtpInvalid() {
    otpBoxes.forEach(function (b) { b.setAttribute("aria-invalid", "true"); });
  }

  function clearOtpInvalid() {
    otpBoxes.forEach(function (b) { b.removeAttribute("aria-invalid"); });
  }

  // L'input #verify-code non esiste più (sostituito dalle sei caselle): gli
  // errori del campo OTP si gestiscono con helper dedicati, perché
  // setFieldError() richiede un input reale e qui fallirebbe in silenzio.
  function setOtpError(msg) {
    var err = $("verify-code-error");
    if (err) {
      err.textContent = msg;
      err.classList.add("is-visible");
    }
    setOtpInvalid();
  }

  function clearOtpError() {
    var err = $("verify-code-error");
    if (err) {
      err.textContent = "";
      err.classList.remove("is-visible");
    }
    clearOtpInvalid();
  }

  // Legatura delle sei caselle: avanzamento automatico, backspace che torna
  // indietro, frecce, paste dell'intero codice (pattern Stripe/Linear).
  function bindOtpBoxes() {
    otpBoxes = Array.prototype.slice.call(document.querySelectorAll(".otp-box"));
    if (!otpBoxes.length) return;
    var last = otpBoxes.length - 1;

    otpBoxes.forEach(function (box, i) {
      box.addEventListener("input", function () {
        box.value = box.value.replace(/\D/g, "").slice(0, 1);
        clearOtpError();
        clearAuthError();
        if (box.value && i < last) otpBoxes[i + 1].focus();
      });

      box.addEventListener("keydown", function (e) {
        if (e.key === "Backspace" && !box.value && i > 0) {
          e.preventDefault();
          otpBoxes[i - 1].value = "";
          otpBoxes[i - 1].focus();
        }
        if (e.key === "ArrowLeft" && i > 0) otpBoxes[i - 1].focus();
        if (e.key === "ArrowRight" && i < last) otpBoxes[i + 1].focus();
      });

      box.addEventListener("paste", function (e) {
        e.preventDefault();
        var digits = ((e.clipboardData && e.clipboardData.getData("text")) || "")
          .replace(/\D/g, "").slice(0, 6);
        digits.split("").forEach(function (d, j) {
          if (i + j <= last) otpBoxes[i + j].value = d;
        });
        clearOtpError();
        clearAuthError();
        var next = Math.min(i + digits.length, last);
        otpBoxes[next].focus();
      });
    });
  }

  function handleVerifySubmit(e) {
    e.preventDefault();
    if (!guardSupabase()) return;
    if (!pendingEmail) {
      showAuthError("La registrazione è scaduta. Riparti da capo.");
      return;
    }

    var code = otpValue();
    if (!/^\d{6}$/.test(code)) {
      setOtpError("Il codice ha 6 cifre. Controlla l'email.");
      return;
    }

    var btn = $("verify-submit");
    setBusy(btn, true, "Verifica…", "Continua");
    track("auth_submit", { mode: "verify_otp" });

    supabaseClient.auth.verifyOtp({ email: pendingEmail, token: code, type: "signup" })
      .then(function (res) {
        if (res.error) throw res.error;
        track("auth_verify_ok", {});
        window.location.href = DASHBOARD_URL;
      })
      .catch(function (err) {
        setBusy(btn, false, "", "Continua");
        showAuthError(translateAuthError(err && err.message, errCode(err)));
        clearOtp();
      });
  }

  // Countdown di 60s per il resend: allineato al rate limit email di
  // Supabase (over_email_send_rate_limit). Il bottone si riabilita a zero.
  var otpResendTimer = null;
  var OTP_RESEND_SECONDS = 60;

  function startOtpResendTimer() {
    var btn = $("verify-resend");
    var timer = $("verify-resend-timer");
    if (!btn || !timer) return;
    window.clearInterval(otpResendTimer);
    btn.disabled = true;
    var left = OTP_RESEND_SECONDS;
    function render() {
      var m = Math.floor(left / 60);
      var s = left % 60;
      timer.innerHTML = "Puoi reinviarlo tra <b>" + m + ":" +
        String(s).padStart(2, "0") + "</b>";
    }
    render();
    otpResendTimer = window.setInterval(function () {
      left--;
      if (left <= 0) {
        window.clearInterval(otpResendTimer);
        btn.disabled = false;
        timer.textContent = "Non è arrivato? Reinvia pure.";
        return;
      }
      render();
    }, 1000);
  }

  function handleVerifyResend() {
    if (!pendingEmail) return;
    if (!guardSupabase()) return;
    var btn = $("verify-resend");
    btn.disabled = true;
    try {
      if (supabaseClient.auth.resend) {
        // Stesso emailRedirectTo della prima email: anche il link di conferma
        // contenuto nell'email atterra su /auth.html?mode=login.
        supabaseClient.auth.resend({
          type: "signup",
          email: pendingEmail,
          options: { emailRedirectTo: window.location.origin + "/auth.html?mode=login" }
        }).catch(function () { /* silenzioso per privacy */ });
      }
    } catch (e) { /* noop */ }
    showToast("Nuovo codice inviato. Controlla la posta.");
    startOtpResendTimer();
  }

  function handleResend() {
    // Solo contesto recovery (pannello sent): la registrazione usa il
    // pannello verify con il proprio resend (handleVerifyResend).
    if (!lastEmail) return;
    if (!guardSupabase()) return;
    var btn = $("resend-btn");
    btn.disabled = true;
    supabaseClient.auth.resetPasswordForEmail(lastEmail, {
      redirectTo: window.location.origin + "/auth.html?type=recovery"
    }).catch(function () { /* silenzioso per privacy */ });
    showToast("Nuovo link inviato. Controlla la posta.");
    window.setTimeout(function () { btn.disabled = false; }, 4000);
  }

  // OAuth condiviso (Google e Apple): stesso flusso ufficiale Supabase,
  // stesso redirectTo, stesso comportamento. Il bottone viene disabilitato
  // durante la richiesta e si riabilita solo se la chiamata fallisce
  // (il successo fa redirect al provider). Google e Apple devono sembrare
  // due opzioni native dello stesso prodotto.
  function handleOAuth(provider, btn) {
    if (!guardSupabase()) return;
    if (btn) btn.disabled = true;
    track("auth_submit", { mode: provider });
    supabaseClient.auth.signInWithOAuth({
      provider: provider,
      options: { redirectTo: window.location.origin + DASHBOARD_URL }
    }).catch(function (err) {
      if (btn) btn.disabled = false;
      showAuthError(translateAuthError(err && err.message, errCode(err)));
    });
  }

  /* ------------------------------------------------------------------
     Hook Turnstile (dormiente) — bot protection opzionale.
     Si attiva SOLO se configurato: window.__SUPABASE_CAPTCHA = { siteKey }.
     Richiede inoltre che il provider sia abilitato in Supabase Dashboard
     (Auth → Bot and Abuse Protection). Senza configurazione ritorna "".
     ------------------------------------------------------------------ */
  // Turnstile (Cloudflare) — inattivo finché non configuri
  // window.__SUPABASE_CAPTCHA = { siteKey }. Lo script e i widget si
  // caricano SOLO quando i pannelli Accedi/Registrati vengono mostrati
  // (zero costo finché non serve). Un widget per pannello: ogni token è
  // monouso e tracciato per-slot, così il submit legge quello del pannello
  // visibile (mai quello dell'altro pannello, che è nascosto).
  var TURNSTILE_SLOTS = {
    login: "turnstile-slot-login",
    register: "turnstile-slot"
  };
  var turnstileState = "off"; // off | loading | ready
  var turnstileRendered = {};
  var pendingTurnstile = [];

  function initTurnstile(panel) {
    try {
      var cfg = window.__SUPABASE_CAPTCHA;
      if (!cfg || !cfg.siteKey || !TURNSTILE_SLOTS[panel]) return;
      if (turnstileState === "off") {
        turnstileState = "loading";
        pendingTurnstile = [panel];
        function onReady() {
          turnstileState = "ready";
          // Rende TUTTI i pannelli visitati durante il load: se l'utente è
          // passato ad Accedi prima che lo script finisse, lo slot login
          // non deve restare vuoto.
          var pending = pendingTurnstile.slice();
          pendingTurnstile = [];
          pending.forEach(function (p) { renderTurnstile(p); });
        }
        if (typeof window.turnstile === "object") { onReady(); return; }
        var s = document.createElement("script");
        s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        s.async = true;
        s.onload = onReady;
        document.head.appendChild(s);
      } else if (turnstileState === "loading") {
        if (pendingTurnstile.indexOf(panel) === -1) pendingTurnstile.push(panel);
      } else if (turnstileState === "ready") {
        renderTurnstile(panel);
      }
    } catch (e) { /* noop */ }
  }

  function renderTurnstile(panel) {
    try {
      var cfg = window.__SUPABASE_CAPTCHA;
      if (!cfg || !cfg.siteKey || turnstileState !== "ready") return;
      var slot = $(TURNSTILE_SLOTS[panel]);
      if (!slot || slot.querySelector("iframe") || turnstileRendered[panel]) return;
      window.turnstile.render(slot, {
        sitekey: cfg.siteKey,
        theme: "light",
        callback: function (token) { window["__TURNSTILE_TOKEN_" + panel] = token; }
      });
      slot.classList.add("is-active");
      turnstileRendered[panel] = true;
    } catch (e) { /* noop */ }
  }

  function getCaptchaToken(panel) {
    try {
      var cfg = window.__SUPABASE_CAPTCHA;
      if (!cfg || !cfg.siteKey) return "";
      // I token Turnstile sono monouso: li consumiamo subito, così un retry
      // dopo un errore non riusa un token già validato (captcha_failed).
      var key = panel === "login" ? "login" : "register";
      var t = window["__TURNSTILE_TOKEN_" + key] || "";
      window["__TURNSTILE_TOKEN_" + key] = "";
      if (t) return t;
      if (typeof window.turnstile === "object") {
        var slot = $(TURNSTILE_SLOTS[key]);
        if (slot) return window.turnstile.getResponse(slot) || "";
      }
      return "";
    } catch (e) { return ""; }
  }

  /* ------------------------------------------------------------------
     Guard di sessione — /auth con sessione attiva → dashboard.
     getUser() valida il JWT lato server (anti-tamper dello storage),
     a differenza di getSession() che legge solo lo storage locale.
     Eccezione: flusso recovery (type=recovery) non redirige mai.
     ------------------------------------------------------------------ */
  function guardAuthenticated() {
    if (!supabaseClient) return Promise.resolve(false);
    return supabaseClient.auth.getUser().then(function (res) {
      if (res && res.data && res.data.user) {
        track("auth_redirect_active_session", {});
        window.location.replace(DASHBOARD_URL);
        return true;
      }
      return false;
    }).catch(function () { return false; });
  }

  /* ------------------------------------------------------------------
     Preview viva — ciclo domanda → skeleton → feedback
     ------------------------------------------------------------------ */
  var PREVIEW = [
    {
      label: "Domanda 4 di 12",
      question: "Come affronterebbe il primo mese di lavoro in un ufficio che non conosce?",
      feedback: "Risposta solida. Raccordi la chiusura con i criteri del bando.",
      confidence: "Confidence 92%"
    },
    {
      label: "Domanda 5 di 12",
      question: "Descriva una situazione complessa che ha gestito e come l'ha risolta.",
      feedback: "Buona struttura. Aggiunga un esempio concreto dal suo percorso.",
      confidence: "Confidence 88%"
    },
    {
      label: "Domanda 6 di 12",
      question: "Come organizzerebbe il lavoro dell'ufficio nei primi novanta giorni?",
      feedback: "Risposta chiara. Potrebbe citare la normativa indicata nel programma.",
      confidence: "Confidence 91%"
    }
  ];

  // Orologio reale del dispositivo (HH:MM). Aggiornato ogni 15s: basta,
  // e non disturba. Nessuna animazione: è informazione, non decorazione.
  function startPreviewClock() {
    var el = $("preview-time");
    if (!el) return;
    function tick() {
      var d = new Date();
      el.textContent =
        String(d.getHours()).padStart(2, "0") + ":" +
        String(d.getMinutes()).padStart(2, "0");
    }
    tick();
    window.setInterval(tick, 15000);
  }

  // Progress "Preparazione bando": ciclo continuo 0→100 (easeOutCubic,
  // ~22s), poi riparte. La percentuale e la barra si muovono insieme.
  // Sotto reduced-motion resta fermo al valore statico dell'HTML (74%).
  function startPreviewProgress() {
    var pctEl = $("preview-progress-pct");
    var fillEl = document.querySelector(".preview-progress-fill");
    // La preview è display:none sotto 920px: niente rAF su elementi nascosti.
    var wide = window.matchMedia && window.matchMedia("(min-width: 921px)").matches;
    if (!pctEl || REDUCED_MOTION || !wide) return;
    var duration = 22000;
    var start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var t = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      var v = Math.round(eased * 100);
      pctEl.textContent = v + "%";
      if (fillEl) fillEl.style.width = v + "%";
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        start = null;
        requestAnimationFrame(frame);
      }
    }
    requestAnimationFrame(frame);
  }

  function startPreviewLoop() {
    var frame = $("auth-preview");
    if (!frame || REDUCED_MOTION) {
      // Reduced motion: stato statico già presente nell'HTML, niente ciclo
      return;
    }
    var qSpan = $("preview-q-span");
    var qLabel = $("preview-q-label");
    var feedback = $("preview-feedback");
    var feedbackText = $("preview-feedback-text");
    var confidenceValue = $("preview-confidence-value");
    var i = 0;

    function cycle() {
      var item = PREVIEW[i];
      i = (i + 1) % PREVIEW.length;

      // 1. nuova domanda + skeleton visibile
      qLabel.textContent = item.label;
      qSpan.textContent = item.question;
      feedback.classList.remove("is-done");

      // 2. dopo lo shimmer, feedback + confidence
      window.setTimeout(function () {
        feedbackText.textContent = item.feedback;
        confidenceValue.textContent = item.confidence;
        feedback.classList.add("is-done");
      }, 1200);
    }

    window.setInterval(cycle, 7600);
  }

  /* ------------------------------------------------------------------
     Init
     ------------------------------------------------------------------ */
  function init() {
    var params = getParams();

    // Bindings statici
    bindFieldValidation("login-email", "login-email-error");
    bindFieldValidation("register-email", "register-email-error");
    bindFieldValidation("forgot-email", "forgot-email-error");
    bindStrength("register-password", "register-strength-fill", "register-strength-label", "register-password-error");
    bindStrength("reset-password", "reset-strength-fill", "reset-strength-label", "reset-password-error");
    bindPasswordToggles();
    bindOtpBoxes();

    // Validazione live del nome (solo first name): blur, poi live
    $("register-name").addEventListener("blur", function () {
      touched["register-name"] = true;
      validateNameField("register-name", "register-name-error");
    });
    $("register-name").addEventListener("input", function () {
      clearAuthError();
      if (touched["register-name"]) validateNameField("register-name", "register-name-error");
    });

    // Tabs + switch
    $("tab-login").addEventListener("click", function () { setMode("login"); });
    $("tab-register").addEventListener("click", function () { setMode("register"); });

    // Roving tabindex minimale per il tablist (freccia sinistra/destra)
    $("auth-tabs").addEventListener("keydown", function (e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      var next = e.key === "ArrowRight" ? "register" : "login";
      e.preventDefault();
      setMode(next);
      var tab = $(next === "register" ? "tab-register" : "tab-login");
      if (tab) tab.focus({ preventScroll: true });
    });
    document.querySelectorAll("[data-goto]").forEach(function (btn) {
      btn.addEventListener("click", function () { setMode(btn.getAttribute("data-goto")); });
    });

    // Forms
    $("form-login").addEventListener("submit", handleLogin);
    $("form-register").addEventListener("submit", handleRegister);
    $("form-forgot").addEventListener("submit", handleForgot);
    $("form-reset").addEventListener("submit", handleReset);
    $("forgot-link").addEventListener("click", function (e) {
      e.preventDefault();
      showPanel("forgot");
      // Stato deep-linkabile: il refresh non riporta al login
      // (vedi md/auth-edge-cases.md §5.1).
      try { history.replaceState(null, "", "/auth.html?mode=forgot"); } catch (x) { /* ignora */ }
    });
    $("resend-btn").addEventListener("click", handleResend);
    $("form-verify").addEventListener("submit", handleVerifySubmit);
    $("verify-resend").addEventListener("click", handleVerifyResend);
    $("google-btn").addEventListener("click", function () { handleOAuth("google", this); });
    $("google-btn-2").addEventListener("click", function () { handleOAuth("google", this); });
    $("apple-btn").addEventListener("click", function () { handleOAuth("apple", this); });
    $("apple-btn-2").addEventListener("click", function () { handleOAuth("apple", this); });

    // Gate terms → submit
    $("terms-checkbox").addEventListener("change", function () {
      $("register-submit").disabled = !$("terms-checkbox").checked;
    });

    // Clear globale errori su input
    document.addEventListener("input", function (e) {
      if (e.target && e.target.classList && e.target.classList.contains("field-input")) {
        clearAuthError();
      }
    });

    // Routing iniziale
    if (params.type === "recovery") {
      showPanel("reset");
    } else if (params.mode === "register") {
      showPanel("register");
      $("tab-login").setAttribute("aria-selected", "false");
      $("tab-register").setAttribute("aria-selected", "true");
    } else if (params.mode === "forgot") {
      showPanel("forgot");
    } else {
      showPanel("login");
    }

    track("auth_view", { mode: params.mode || "login" });

    // Guard di sessione: se già autenticato vai in dashboard
    // (mai nel flusso recovery: il reset deve restare disponibile).
    if (params.type !== "recovery") {
      guardAuthenticated();
    }

    // Preview viva: orologio reale, progress 0→100, ciclo domande
    startPreviewClock();
    startPreviewProgress();
    startPreviewLoop();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
