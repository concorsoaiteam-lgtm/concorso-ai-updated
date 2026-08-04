/* =========================================================================
   dashboard.js — ConcorsoAI
   View router + logica di Panoramica, Bandi e Piano settimanale.
   Tutti i numeri vengono da Supabase (mai dati inventati). Gli stati
   mancanti (loading/empty/error) sono tutti gestiti.
   ========================================================================= */
(function () {
  "use strict";

  var Dash = window.Dash;
  if (!Dash) return;

  var supabase = Dash.supabase;
  var $ = Dash.$;

  var ACTIVE_BANDO_KEY = "cai_active_bando";
  var VIEWS = ["panoramica", "bandi", "piano"];
  var currentUser = null;
  var bandi = [];
  var common = { used: 0, streak: 0, record: 0 };

  /* ------------------------------------------------------------------
     Router a sezioni (hash)
     ------------------------------------------------------------------ */
  function goView(name) {
    if (VIEWS.indexOf(name) === -1) name = "panoramica";
    VIEWS.forEach(function (v) {
      var sec = $("view-" + v);
      if (sec) sec.classList.toggle("is-active", v === name);
      var nav = document.querySelector('.nav-item[data-view="' + v + '"]');
      if (nav) nav.classList.toggle("is-active", v === name);
    });
    var eyebrow = $("top-eyebrow");
    if (eyebrow) {
      var map = { panoramica: "Panoramica", bandi: "Bandi", piano: "Piano settimanale" };
      eyebrow.textContent = map[name] || "ConcorsoAI";
    }
    trackView(name);
  }

  function trackView(name) {
    Dash.track("dash_view", { view: name });
  }

  function startSimulation() {
    // Handoff retro-compatibile con simulation.html (legge localStorage).
    var bando = Dash.getActiveBando();
    if (!bando) {
      Dash.toast("Carica un bando prima di iniziare una simulazione.");
      goView("bandi");
      return;
    }
    try {
      localStorage.setItem("cai_input_method", "bando");
      localStorage.setItem("cai_difficolta", "media");
      localStorage.setItem("cai_durata", "12");
    } catch (e) { /* noop */ }
    Dash.track("dash_start_sim", { bando: bando.id });
    window.location.href = "simulation.html";
  }

  /* ------------------------------------------------------------------
     Panoramica
     ------------------------------------------------------------------ */
  function loadPanoramica() {
    var title = $("pano-title");
    var sub = $("pano-sub");
    if (title) {
      var hour = new Date().getHours();
      var g = hour < 13 ? "Buongiorno" : (hour < 19 ? "Buon pomeriggio" : "Buonasera");
      title.textContent = g + (currentUser ? ", " + String(currentUser.displayName).split(" ")[0] : "");
    }
    if (sub) {
      sub.textContent = bandi.length
        ? "Riprendi l'allenamento per il tuo concorso. Il progresso si costruisce a piccoli passi."
        : "Carica il bando del tuo concorso: da lì nascono le simulazioni.";
    }

    renderRiprendi();
    renderMetriche();
    renderUltime();
    renderQuotaProgress();
    renderPianoTeaser();
  }

  function renderRiprendi() {
    var el = $("riprendi-card");
    if (!el) return;
    if (!bandi.length) {
      el.innerHTML =
        '<div class="card">' +
          '<div class="empty-mark" aria-hidden="true">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">' +
            '<path stroke-linecap="round" stroke-linejoin="round" d="M12 16V4m0 0 4 4m-4-4L8 8M4 16v3.25A.75.75 0 0 0 4.75 20h14.5a.75.75 0 0 0 .75-.75V16"/></svg>' +
          '</div>' +
          '<div class="card-head"><h2 class="card-title">Inizia da qui</h2></div>' +
          '<p style="margin:0 0 16px;font-size:13.5px;color:var(--muted);max-width:52ch;">' +
          "Non serve preparare nulla. Carica il PDF del bando e ConcorsoAI estrae i programmi, " +
          "genera le domande e ti corregge come farebbe la commissione.</p>" +
          '<button type="button" class="btn btn-primary" id="goto-upload">Carica il bando</button>' +
        "</div>";
      var btn = $("goto-upload");
      if (btn) btn.addEventListener("click", function () { goView("bandi"); });
      return;
    }
    el.innerHTML =
      '<div class="card">' +
        '<div class="card-head"><h2 class="card-title">Simula l\u2019orale</h2>' +
        '<span class="chip" id="riprendi-bando-chip"></span></div>' +
        '<p style="margin:0 0 16px;font-size:13.5px;color:var(--muted);max-width:52ch;">' +
        "Una sessione guidata di 12 domande sul tuo bando, con correzione e punteggi " +
        "per chiarezza, struttura e contenuto.</p>" +
        '<button type="button" class="btn btn-primary" id="start-sim-btn">Inizia la simulazione</button>' +
      "</div>";
    var chip = $("riprendi-bando-chip");
    if (chip) chip.textContent = bandoName(currentUser ? Dash.getActiveBando() : null);
    var btn = $("start-sim-btn");
    if (btn) btn.addEventListener("click", startSimulation);
  }

  function renderMetriche() {
    var el = $("pano-stats");
    if (!el) return;
    var sims = common.allSims || [];
    var total = sims.length;
    var avg = sims.length
      ? sims.reduce(function (a, s) { return a + (Number(s.voto_finale) || 0); }, 0) / sims.length
      : 0;
    el.innerHTML =
      statBox(total, "Simulazioni totali", false, String(total)) +
      statBox(avg ? Dash.fmtVoto(avg) : "—", "Voto medio", true, avg ? String(avg) : null) +
      statBox(common.streak, common.streak === 1 ? "Giorno di fila" : "Giorni di fila", false, String(common.streak || 0)) +
      statBox(common.record, "Record personale", false, String(common.record || 0));
    // Count-up dei numeri (microinterazione premium, rispetta reduced-motion)
    el.querySelectorAll("[data-count]").forEach(function (node) {
      var to = Number(node.getAttribute("data-count"));
      var dec = String(to).indexOf(".") !== -1;
      node.textContent = dec ? "0,0" : "0";
      animateStat(node, to, dec ? 1 : 0);
    });
  }

  function animateStat(node, to, decimals) {
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var d = reduced ? 0 : 460;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = d === 0 ? 1 : Math.min(1, (ts - start) / d);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = to * eased;
      node.textContent = decimals
        ? val.toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
        : String(Math.round(val));
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  function statBox(value, label, accent, raw) {
    // `raw` è il numero non formattato (punto decimale); `value` è la stringa
    // già formattata (es. "7,4" da fmtVoto). Se raw esiste, il numero parte
    // da 0 e fa count-up con la virgola italiana (animateStat).
    var r = raw != null && /^-?\d+(\.\d+)?$/.test(String(raw)) ? String(raw) : null;
    var dec = r != null && r.indexOf(".") !== -1;
    var initial = r != null ? (dec ? "0,0" : "0") : Dash.escapeHtml(String(value));
    return '<div class="stat"><div class="stat-value' + (accent ? " is-accent" : "") + '"' +
      (r != null ? ' data-count="' + r + '"' : "") + ">" + initial +
      '</div><div class="stat-label">' +
      Dash.escapeHtml(label) + "</div></div>";
  }

  function renderUltime() {
    var el = $("pano-last-list");
    if (!el) return;
    var sims = common.allSims || [];
    if (!sims.length) {
      el.innerHTML =
        '<div class="empty" style="padding:var(--s-6) 0;">' +
          '<div class="empty-mark" aria-hidden="true">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">' +
            '<circle cx="12" cy="12" r="8.5"/><path stroke-linecap="round" d="M12 7.5V12l3 2"/></svg>' +
          '</div>' +
          '<h3 class="empty-title">Nessuna simulazione ancora</h3>' +
          '<p class="empty-text">La tua prima sessione scriverà qui la prima riga del tuo storico.</p>' +
          '<div class="empty-actions"><button type="button" class="btn btn-primary" id="pano-first-sim">Inizia ora</button></div>' +
        "</div>";
      var btn = $("pano-first-sim");
      if (btn) btn.addEventListener("click", startSimulation);
      return;
    }
    var rows = sims.slice(0, 5).map(function (s) {
      var d = s.created_at ? Dash.fmtDateShortIT(s.created_at) : "";
      var voto = s.voto_finale != null ? Dash.fmtVoto(s.voto_finale) : "—";
      return '<tr>' +
        '<td class="is-strong">' + Dash.escapeHtml(s.modalita || "Standard") + "</td>" +
        '<td>' + Dash.escapeHtml(d) + "</td>" +
        '<td>' + Dash.escapeHtml(voto) + "/10</td>" +
        "</tr>";
    }).join("");
    el.innerHTML =
      '<div class="table-wrap"><table class="table">' +
        "<thead><tr><th>Sessione</th><th>Data</th><th>Voto</th></tr></thead>" +
        "<tbody>" + rows + "</tbody>" +
      "</table></div>";
  }

  function renderQuotaProgress() {
    var el = $("pano-quota");
    if (!el) return;
    if (currentUser && currentUser.plan === "pro") {
      el.innerHTML = "";
      return;
    }
    var used = Math.max(0, Math.min(Dash.FREE_SIM_LIMIT, Number(common.used) || 0));
    var left = Math.max(0, Dash.FREE_SIM_LIMIT - used);
    var pct = Math.round((used / Dash.FREE_SIM_LIMIT) * 100);
    var full = used >= Dash.FREE_SIM_LIMIT;
    var renew = Dash.nextRenewalLabel();
    el.innerHTML =
      '<div class="card quota-card">' +
        '<div class="quota-main">' +
          '<div>' +
            '<div class="progress-label">Simulazioni questo mese</div>' +
            '<div class="quota-num">' +
              '<span class="quota-count">0</span>' +
              '<span class="quota-sep" aria-hidden="true">/</span>' +
              '<span class="quota-total" aria-hidden="true">' + Dash.FREE_SIM_LIMIT + '</span>' +
            '</div>' +
          '</div>' +
          '<div style="text-align:right">' +
            '<div class="quota-state">' +
              (full ? "Quota del mese usata" : left + (left === 1 ? " simulazione rimasta" : " simulazioni rimaste")) +
            '</div>' +
            '<div class="quota-renew">Rinnovo il ' + renew + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="progress" role="progressbar" aria-label="Simulazioni usate questo mese" ' +
          'aria-valuemin="0" aria-valuemax="' + Dash.FREE_SIM_LIMIT + '" aria-valuenow="' + used + '">' +
          '<div class="progress-fill' + (full ? " is-full" : "") + '" style="width:0%"></div>' +
        '</div>' +
        '<p class="quota-foot">' +
          (full
            ? "La dashboard resta completamente utilizzabile: storico, progressi e report restano aperti. Le simulazioni ripartono il " + renew + "."
            : "Ogni simulazione è completa: domande dal tuo bando, risposta libera e correzione. Le gratuite si rinnovano il " + renew + ".") +
        '</p>' +
      "</div>";
    Dash.animateCount(el.querySelector(".quota-count"), 0, used);
    Dash.animateFill(el.querySelector(".progress-fill"), pct);
  }

  function renderPianoTeaser() {
    var el = $("pano-piano-teaser");
    if (!el) return;
    if (common.plan) {
      el.innerHTML =
        '<div class="pro-teaser">' +
          '<div class="pro-teaser-text">' +
            '<div class="pro-teaser-title">Il tuo piano settimanale</div>' +
            '<div class="pro-teaser-sub">Apri il piano e segna le sessioni di oggi.</div>' +
          "</div>" +
          '<button type="button" class="btn btn-ghost" id="pano-piano-open">Apri</button>' +
        "</div>";
      var btn = $("pano-piano-open");
      if (btn) btn.addEventListener("click", function () { goView("piano"); });
      return;
    }
    el.innerHTML =
      '<div class="pro-teaser">' +
        '<div class="pro-teaser-text">' +
          '<div class="pro-teaser-title">Piano settimanale</div>' +
          '<div class="pro-teaser-sub">Un piano di studio generato dal tuo bando e dal tuo storico, ' +
          "giorno per giorno. Incluso nel piano Pro.</div>" +
        "</div>" +
        '<span class="chip is-pro">Pro</span>' +
      "</div>";
  }

  function bandoName(bando) {
    if (!bando) return "";
    var n = String(bando.filename || "").replace(/\.pdf$/i, "");
    return n.length > 28 ? n.slice(0, 28) + "…" : n;
  }

  /* ------------------------------------------------------------------
     Bandi — lista, upload, selezione attivo, delete
     ------------------------------------------------------------------ */
  function loadBandi() {
    if (!supabase || !currentUser) return Promise.resolve([]);
    var list = $("bandi-list");
    var empty = $("bandi-empty");
    if (list) list.innerHTML = '<div class="skeleton"><div class="skeleton-line" style="width:96%"></div><div class="skeleton-line" style="width:82%"></div><div class="skeleton-line" style="width:88%"></div></div>';
    if (empty) empty.hidden = true;

    return supabase.from("bandi")
      .select("id, filename, total_pages, file_size, created_at")
      .eq("user_id", currentUser.id)
      .order("created_at", { ascending: false })
      .then(function (res) {
        if (res.error) throw res.error;
        bandi = res.data || [];
        var active = Dash.getActiveBando();
        Dash.renderBandoSwitch(active ? active.filename : "", !!active);
        renderBandiList();
        return bandi;
      })
      .catch(function (err) {
        if (list) {
          list.innerHTML = '<div class="notice is-error">Non riusciamo a caricare i bandi. ' +
            "Controlla la connessione e riprova." +
            '<button type="button" class="btn btn-sm btn-ghost" style="margin-left:auto" id="bandi-retry">Riprova</button></div>';
          var retry = $("bandi-retry");
          if (retry) retry.addEventListener("click", loadBandi);
        }
        return [];
      });
  }

  function renderBandiList() {
    var list = $("bandi-list");
    var empty = $("bandi-empty");
    if (!list) return;
    var active = Dash.getActiveBando();
    if (!bandi.length) {
      if (empty) empty.hidden = false;
      list.innerHTML = "";
      return;
    }
    if (empty) empty.hidden = true;
    list.innerHTML = bandi.map(function (b) {
      var isActive = active && String(active.id) === String(b.id);
      var meta = [];
      if (b.total_pages) meta.push(b.total_pages + " pagine");
      if (b.file_size) meta.push(fmtSize(b.file_size));
      meta.push(Dash.fmtDateIT(b.created_at));
      return '<div class="bando-card' + (isActive ? " is-active" : "") + '">' +
        '<div style="min-width:0;flex:1">' +
          '<div class="bando-card-name">' + Dash.escapeHtml(b.filename) + "</div>" +
          '<div class="bando-card-meta">' + meta.join(" · ") + "</div>" +
        "</div>" +
        '<div class="bando-card-actions">' +
          (isActive
            ? '<span class="chip is-active">Attivo</span>'
            : '<button type="button" class="btn btn-sm btn-soft" data-act="set" data-id="' + b.id + '">Usa</button>') +
          '<button type="button" class="btn btn-sm btn-ghost" data-act="del" data-id="' + b.id + '" aria-label="Elimina ' + Dash.escapeHtml(b.filename) + '">Elimina</button>' +
        "</div>" +
      "</div>";
    }).join("");

    list.querySelectorAll("[data-act='set']").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = Number(btn.getAttribute("data-id"));
        var b = bandi.find(function (x) { return String(x.id) === String(id); });
        if (b) {
          Dash.setActiveBando(b);
          Dash.renderBandoSwitch(b.filename, true);
          Dash.toast("Bando attivo: " + b.filename);
          renderBandiList();
        }
      });
    });
    list.querySelectorAll("[data-act='del']").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = Number(btn.getAttribute("data-id"));
        var b = bandi.find(function (x) { return String(x.id) === String(id); });
        if (b) confirmDelete(b);
      });
    });
  }

  function fmtSize(bytes) {
    var n = Number(bytes);
    if (!isFinite(n) || n <= 0) return "";
    if (n < 1024 * 1024) return Math.round(n / 1024) + " KB";
    return (n / (1024 * 1024)).toLocaleString("it-IT", { maximumFractionDigits: 1 }) + " MB";
  }

  function confirmDelete(bando) {
    Dash.openModal(
      '<h2 class="modal-title">Eliminare il bando?</h2>' +
      '<p class="modal-text">"' + Dash.escapeHtml(bando.filename) + '" e i suoi dati verranno rimossi. ' +
      "Le simulazioni già completate restano nello storico.</p>" +
      '<div class="modal-actions">' +
        '<button type="button" class="btn btn-ghost" data-close>Annulla</button>' +
        '<button type="button" class="btn btn-primary" id="del-confirm">Elimina</button>' +
      "</div>",
      null
    );
    var confirmBtn = $("del-confirm");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", function () {
        doDelete(bando);
      });
    }
  }

  function doDelete(bando) {
    Dash.closeModal();
    if (!supabase) return;
    Dash.track("bando_delete", { id: bando.id });
    var active = Dash.getActiveBando();
    var removeP = Promise.resolve();
    if (bando.file_url) {
      removeP = supabase.storage.from("bandi").remove([bando.file_url]).catch(function () { return null; });
    }
    removeP.then(function () {
      return supabase.from("bandi").delete().eq("id", bando.id);
    }).then(function (res) {
      if (res.error) throw res.error;
      if (active && String(active.id) === String(bando.id)) {
        Dash.setActiveBando(null);
        Dash.renderBandoSwitch("", false);
      }
      Dash.toast("Bando eliminato.");
      loadBandi().then(function () { loadPanoramica(); });
    }).catch(function () {
      Dash.toast("Errore durante l'eliminazione. Riprova.");
    });
  }

  function initUpload() {
    var zone = $("upload-zone");
    var input = $("upload-input");
    if (!zone || !input) return;

    zone.addEventListener("click", function () { input.click(); });
    zone.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); }
    });
    ["dragover", "dragenter"].forEach(function (ev) {
      zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.add("is-dragover"); });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      zone.addEventListener(ev, function (e) { e.preventDefault(); zone.classList.remove("is-dragover"); });
    });
    zone.addEventListener("drop", function (e) {
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) handleFile(f);
    });
    input.addEventListener("change", function () {
      var f = input.files && input.files[0];
      if (f) handleFile(f);
      input.value = "";
    });
  }

  function handleFile(file) {
    if (!supabase || !currentUser) return;
    var name = String(file.name || "").toLowerCase();
    if (!/\.pdf$/.test(name)) {
      Dash.toast("Il bando deve essere un file PDF.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      Dash.toast("Il file supera i 20 MB. Riduci il PDF e riprova.");
      return;
    }
    Dash.track("bando_upload_start", { size: file.size });

    var zone = $("upload-zone");
    setUploadBusy(zone, true);

    var path = "bandi/" + currentUser.id + "/" + encodeURIComponent(file.name);
    supabase.storage.from("bandi").upload(path, file, { upsert: false, contentType: "application/pdf" })
      .then(function (res) {
        if (res.error) throw res.error;
        return supabase.from("bandi").insert({
          user_id: currentUser.id,
          filename: file.name,
          file_size: file.size,
          file_url: path
        });
      })
      .then(function (res) {
        if (res.error) throw res.error;
        setUploadBusy($("upload-zone"), false);
        Dash.track("bando_upload_ok", { size: file.size });
        Dash.toast("Bando caricato.");
        loadBandi().then(function () {
          var created = bandi[0];
          if (created) {
            Dash.setActiveBando(created);
            Dash.renderBandoSwitch(created.filename, true);
          }
          loadPanoramica();
        });
      })
      .catch(function (err) {
        setUploadBusy($("upload-zone"), false);
        var msg = (err && err.message) || "";
        if (msg.indexOf("bucket") !== -1 || msg.indexOf("not found") !== -1) {
          Dash.toast("L'archivio bandi non è ancora configurato lato server.");
        } else {
          Dash.toast("Upload non riuscito. Riprova.");
        }
      });
  }

  function setBusy(btn, busy) {
    if (!btn) return;
    btn.classList.toggle("is-busy", busy);
    btn.disabled = busy;
    var label = btn.querySelector(".btn-label");
    if (label) {
      label.textContent = busy ? "Caricamento…" : "Genera il piano";
    } else {
      // Bottone senza span label (es. "Genera il piano"): aggiorna il testo.
      btn.textContent = busy ? "Caricamento…" : "Genera il piano";
    }
  }

  function setUploadBusy(zone, busy) {
    if (!zone) return;
    zone.classList.toggle("is-busy", busy);
    zone.setAttribute("aria-busy", busy ? "true" : "false");
    var t = zone.querySelector(".upload-title");
    if (t) t.textContent = busy ? "Caricamento…" : "Trascina qui il PDF del bando";
    var h = zone.querySelector(".upload-hint");
    if (h) h.textContent = busy ? "Stiamo preparando il tuo bando." : "oppure clicca per selezionarlo. Max 20 MB, solo PDF. Il contenuto resta nel tuo profilo.";
  }

  /* ------------------------------------------------------------------
     Piano settimanale — dati reali da piano_settimanale
     ------------------------------------------------------------------ */
  function mondayOfWeek(d) {
    var x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var day = (x.getDay() + 6) % 7; // lun=0
    x.setDate(x.getDate() - day);
    var m = String(x.getMonth() + 1).padStart(2, "0");
    var dd = String(x.getDate()).padStart(2, "0");
    return x.getFullYear() + "-" + m + "-" + dd;
  }

  function loadPiano() {
    var body = $("piano-body");
    if (!body) return;
    if (!supabase || !currentUser) return;
    body.innerHTML = '<div class="skeleton"><div class="skeleton-line" style="width:90%"></div><div class="skeleton-line" style="width:70%"></div><div class="skeleton-line" style="width:84%"></div></div>';

    var weekStart = mondayOfWeek(new Date());
    supabase.from("piano_settimanale")
      .select("schedule, week_start")
      .eq("user_id", currentUser.id)
      .eq("week_start", weekStart)
      .maybeSingle()
      .then(function (res) {
        if (res.error) throw res.error;
        if (res.data && Array.isArray(res.data.schedule) && res.data.schedule.length) {
          renderWeek(res.data.schedule, weekStart);
        } else {
          renderPianoEmpty();
        }
      })
      .catch(function () {
        body.innerHTML = '<div class="notice is-error">Non riusciamo a caricare il piano. ' +
          '<button type="button" class="btn btn-sm btn-ghost" style="margin-left:auto" id="piano-retry">Riprova</button></div>';
        var retry = $("piano-retry");
        if (retry) retry.addEventListener("click", loadPiano);
      });
  }

  function renderWeek(schedule, weekStart) {
    var body = $("piano-body");
    if (!body) return;
    var today = Dash.todayISO();
    var typeLabels = {
      sessione_guidata: "Sessione guidata",
      pratica_libera: "Pratica libera",
      prova_esame: "Prova esame",
      rest: "Riposo"
    };
    body.innerHTML =
      '<div class="week-grid">' +
      schedule.map(function (d) {
        var type = typeLabels[d.type] || "Sessione";
        var isToday = String(d.day) === today;
        var done = d.status === "done";
        return '<div class="day-card' + (isToday ? " is-today" : "") + (done ? " is-done" : "") + '">' +
          '<button type="button" class="day-check" data-day="' + Dash.escapeHtml(d.day) + '" ' +
            (done ? 'aria-label="Segna come non fatto"' : 'aria-label="Segna come fatto"') + ">" +
            '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>' +
          "</button>" +
          '<div class="day-name">' + dayNameIT(d.day) + (isToday ? " · oggi" : "") + "</div>" +
          '<div class="day-type">' + Dash.escapeHtml(type) + "</div>" +
          (d.materia ? '<div class="day-focus">' + Dash.escapeHtml(d.materia) + (d.focus ? " — " + Dash.escapeHtml(d.focus) : "") + "</div>" : "") +
          (d.duration_min ? '<div class="day-meta">' + d.duration_min + " min</div>" : "") +
        "</div>";
      }).join("") +
      "</div>" +
      '<p class="view-sub" style="margin-top:16px">Il piano si aggiorna in base alle simulazioni che completi.</p>';

    body.querySelectorAll(".day-check").forEach(function (btn) {
      btn.addEventListener("click", function () { toggleDay(weekStart, btn); });
    });
  }

  function dayNameIT(iso) {
    try {
      var d = new Date(iso + "T12:00:00");
      return d.toLocaleDateString("it-IT", { weekday: "short" }).replace(".", "");
    } catch (e) { return ""; }
  }

  function toggleDay(weekStart, btn) {
    if (!supabase) return;
    var day = btn.getAttribute("data-day");
    var card = btn.closest(".day-card");
    var willDone = !(card && card.classList.contains("is-done"));
    btn.disabled = true;
    supabase.from("piano_settimanale")
      .select("schedule")
      .eq("user_id", currentUser.id)
      .eq("week_start", weekStart)
      .maybeSingle()
      .then(function (res) {
        if (res.error || !res.data) throw res.error || new Error("empty");
        var schedule = (res.data.schedule || []).map(function (d) {
          if (String(d.day) === day) d.status = willDone ? "done" : "future";
          return d;
        });
        return supabase.from("piano_settimanale")
          .update({ schedule: schedule })
          .eq("user_id", currentUser.id)
          .eq("week_start", weekStart);
      })
      .then(function (res) {
        if (res.error) throw res.error;
        btn.disabled = false;
        loadPiano();
      })
      .catch(function () {
        btn.disabled = false;
        Dash.toast("Non riusciamo ad aggiornare il piano. Riprova.");
      });
  }

  function renderPianoEmpty() {
    var body = $("piano-body");
    if (!body) return;
    body.innerHTML =
      '<div class="empty">' +
        '<div class="empty-mark" aria-hidden="true">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">' +
          '<rect x="3" y="4.5" width="18" height="16" rx="2"/><path stroke-linecap="round" d="M3 9.5h18M8 4.5V8M12 4.5V8M16 4.5V8"/></svg>' +
        '</div>' +
        '<h3 class="empty-title">Nessun piano per questa settimana</h3>' +
        '<p class="empty-text">Il piano settimanale viene generato dal tuo bando e dal tuo storico: ' +
        "sai ogni giorno cosa ripassare e quante domande fare. La generazione avviene lato server.</p>" +
        '<div class="empty-actions"><button type="button" class="btn btn-primary" id="piano-gen">Genera il piano</button></div>' +
      "</div>";
    var btn = $("piano-gen");
    if (btn) btn.addEventListener("click", generatePiano);
  }

  function generatePiano() {
    if (!supabase) return;
    var btn = $("piano-gen");
    setBusy(btn, true);
    // La generazione è una Edge Function server-side (mai chiavi nel client).
    // Se non è ancora deployata, rispondiamo con uno stato onesto + retry.
    supabase.functions.invoke("generate-piano", { body: { week_start: mondayOfWeek(new Date()) } })
      .then(function (res) {
        setBusy(btn, false);
        if (res.error) throw res.error;
        Dash.toast("Piano generato.");
        loadPiano();
      })
      .catch(function () {
        setBusy(btn, false);
        // Stato onesto: la Edge Function non è ancora deployata (Fase 0).
        renderPianoError();
      });
  }

  function renderPianoError() {
    var body = $("piano-body");
    if (!body) return;
    body.innerHTML =
      '<div class="notice is-error">Il servizio di generazione del piano non è ancora disponibile lato server. ' +
      "Lo attiveremo con la Fase 0 (Edge Functions). La struttura del piano è già pronta qui." +
      '<button type="button" class="btn btn-sm btn-ghost" style="margin-left:auto" id="piano-retry2">Riprova</button></div>';
    var retry = $("piano-retry2");
    if (retry) retry.addEventListener("click", loadPiano);
  }

  /* ------------------------------------------------------------------
     Init
     ------------------------------------------------------------------ */
  function init() {
    Dash.initShell({
      paletteActions: [
        { label: "Inizia una simulazione", hint: "sul bando attivo", run: startSimulation },
        { label: "Carica un bando", hint: "PDF", run: function () { goView("bandi"); } },
        { label: "Panoramica", hint: "dashboard", run: function () { goView("panoramica"); } },
        { label: "Bandi", run: function () { goView("bandi"); } },
        { label: "Piano settimanale", run: function () { goView("piano"); } },
        { label: "Storico", hint: "tutte le simulazioni", run: function () { window.location.href = "history.html"; } }
      ]
    });

    initUpload();

    // Router su hash
    window.addEventListener("hashchange", function () {
      goView((window.location.hash || "").replace("#", ""));
    });

    Dash.guard().then(function (ok) {
      if (!ok) return;
      return Dash.loadUser().then(function (user) {
        currentUser = user;
        common.plan = user.plan; // usato dal teaser del piano settimanale
        Dash.renderUser(user);
        return Dash.loadCommon(user).then(function (c) {
          common.used = c.used;
          common.streak = c.streak;
          common.record = c.record;
        });
      });
    }).then(function () {
      return loadBandi();
    }).then(function () {
      // metriche + ultime simulazioni (dati reali)
      if (supabase && currentUser) {
        return supabase.from("simulazioni")
          .select("modalita, voto_finale, created_at")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })
          .limit(30)
          .then(function (res) {
            if (!res.error) common.allSims = res.data || [];
          }).catch(function () { common.allSims = []; });
      }
      return null;
    }).then(function () {
      var active = Dash.getActiveBando();
      Dash.renderBandoSwitch(active ? active.filename : "", !!active);
      goView((window.location.hash || "").replace("#", "") || "panoramica");
      loadPanoramica();
      // Piano caricato lazy solo quando serve (Fase 0 del doc)
      var panoBtn = $("pano-piano-open");
      if (panoBtn) panoBtn.addEventListener("click", function () { goView("piano"); });
      // aggiorna common.allSims in loadPanoramica? già fatto sopra
      // (renderMetriche usa common.allSims)
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
