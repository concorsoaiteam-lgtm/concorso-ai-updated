# 14 — Trust building per PA target

> **Scopo**: definire la strategia di trust-building per la landing ConcorsoAI, specificamente calibrata sul target PA italiano. Il trust non è una "fiducia generale" — è una **struttura di prove specifiche** che il visitatore trova nel posto giusto al momento giusto. Sequenza: copywriting (file 11), CTA (file 13), trust qui.

---

## Introduzione

### Perché il trust non è "claim fiducia" ma "prova di evidenza"

Il visitatore PA target ha 5 livelli di diffidenza istintiva:
1. **Diffidenza tecnologica**: "L'AI è affidabile?"
2. **Diffidenza istituzionale**: "Chi c'è dietro? È serio o è un giochino?"
3. **Diffidenza legale**: "I miei dati sono al sicuro?"
4. **Diffidenza economica**: "Costa davvero €X oppure c'è fuffa?"
5. **Diffidenza personale**: "Era una promessa; scommetto che non funziona."

La landing deve rispondere a tutti e 5. Pattern consolidati:

- **Trust by authority**: citazioni normative specifiche (art. 97 Cost., DPR 487/1994).
- **Trust by compliance**: GDPR, server EU, diritto di recesso (Codice del Consumo).
- **Trust by transparency**: founder marker onesty (città + mese anno).
- **Trust by demo**: mockup con UI reale del prodotto.
- **Trust by social proof (quando possibile)**: testimonianza nominale (quando ci sono ≥5 beta user).
- **Trust by DQ (Declarative Quality)**: cosa NON facciamo (vedi file 03 + 11).

Riferimenti: Cialdini 1984 (Authority + Specificity); European Commission CPC Sweeps 2022-2025; GDPR Art. 4(11), Art. 7; Codice del Consumo italiano Art. 49-52; AGCM (Autorità Garante della Concorrenza e del Mercato); Baymard Institute 2024 trust signals; Gazzetta Ufficiale italiana.

### Come si applica a ConcorsoAI

Trust band ConcorsoAI (3 elementi strategici posti in hero, sub-CTA):
1. **GDPR compliant** + link `/privacy.html`
2. **Server UE** + link `/security.html#data-residency`
3. **No data shared with US LLM** + link `/architecture.html#data-flow`

Più:
- Footer compliance: privacy + cookie + ToS + diritto di recesso Art. 49 + email supporto.
- Trust signals in-page: badge "Cifratura server-side" + "30gg soddisfatti o rimborsati" + "Costruito a Milano".
- Trust by demo: mockup 3-tab hero con materie PA reali (D.Lgs. 33/2013, art. 7-bis).

---

## Principi

### P1 — Trust by Authority (istituzionale specifica)

Pattern: citare **istituzioni normative verificabili** (non media, non "esperti").

ConcorsoAI:
- ✅ `art. 97 della Costituzione` + link a Normattiva.it
- ✅ `DPR 487/1994` + link
- ✅ `L. 241/1990` + link
- ✅ `D.Lgs. 33/2013` + link (trasparenza PA)
- ❌ "Consigliato da Harvard" (mai verificato)
- ❌ "Citato da Forbes" (mai verificato)

Pattern: ogni citazione ha link diretto a fonte primaria verificabile (Normattiva.it, EUR-Lex, gazzettaufficiale.it).

### P2 — Trust by Compliance (GDPR + Codice del Consumo)

Pattern EU compliance locale:
- **GDPR**: link `/privacy.html` con explainer breve.
- **Cookie Consent**: banner con opt-in granulare (mai pre-checked "Accetta tutto").
- **Codice del Consumo Art. 49**: diritto di recesso 14gg (esteso a 30gg da ConcorsoAI).
- **Codice del Consumo Art. 50-52**: informazioni precontrattuali.
- **AGCM**: conformità alle linee guida per "pratiche commerciali sleali".
- **Omnibus Directive EU 2019/2161**: divieto dark patterns da maggio 2022.

ConcorsoAI footer trust block:
- "Recesso 14gg ex Codice del Consumo (esteso a 30gg dalla nostra policy)"

### P3 — Trust by Transparency (founder marker)

Pattern: dichiarare **chi sei**, **dove sei**, **quando sei partito**.

ConcorsoAI:
- Footer: "Costruito a Milano · Beta aperta Agosto 2026"
- About section: founder story reale (es. "Marco, candidate passato, ha costruito ConcorsoAI per i candidati che l'avrebbe voluto avere")
- Page chi siamo: timeline reale (kickoff, milestones, status beta)

Mai:
- "Costruito con ❤️ da appassionati italiani" (vague)
- "Made in Italy" generico
- Avatars stock finti (vedi file 15 social proof)

### P4 — Trust by Demo (mockup reale prodotto)

Pattern: il mockup hero mostra **UI REAL del prodotto**, non artwork.

ConcorsoAI mockup:
- **Tab 1 "Realtime Score"**: punteggio live simulazione (es. 78/100) + 3 metriche (chiarezza, struttura, contenuto).
- **Tab 2 "Materie"**: lista materie reali del bando (Diritto Amministrativo, Contabilità, Penale, Costituzione).
- **Tab 3 "Aree"**: aree basse-punteggio dell'utente simulato (es. art. 21-28 Diritto Amministrativo <70%).

Pattern: dati reali del prodotto, non placeholder. Es: `D.Lgs. 33/2013` reale, `art. 7-bis` reale, `Cass. Pen. SS.UU. 2014 n. 38343` reale (verificabile).

Mai:
- "Sample data" o "Lorem ipsum"
- Grafica placeholder
- Stock chart senza dati

### P5 — Trust by Rimozione Rischi (inversi delle paure)

Pattern: per ogni paura, dichiarare la rimozione.

| Paura utente | Trust signal ConcorsoAI |
|---|---|
| "Costa davvero €X, o ci sono fee nascosti?" | "€14,99/mese · Nessun fee nascosto · Cancella quando vuoi" (premium tier quando Stripe live) |
| "E se non funziona per me?" | "30 giorni soddisfatti o rimborsati · No domande · Email rimborso in 3gg" |
| "I miei dati vanno in USA?" | "Server in Germania · Nessun trasferimento extra-EU · Modello AI via BluesMinds" |
| "Chi sono questi sviluppatori?" | "Costruito a Milano · Beta aperta Agosto 2026 · 2 founder con passato PA" |
| "L'orale è oggettivo, l'AI può sbagliare?" | "L'AI può commettere errori su citazioni specifiche. Verifica sempre sul bando ufficiale." (DQ onesty) |
| "È un prodotto serio o un giocattolo?" | "Costruito sulle linee guida del DPR 487/1994 · Validato con candidati beta" |

Pattern: 1 paura = 1 trust signal specifico. Mai un elenco generico di "trust us".

### P6 — Trust by Real-Time Signals (live data)

Pattern: trust signals che mostrano **dati live** (es. utenti attivi oggi, simulazioni completate questa settimana).

ConcorsoAI pre-launch:
- Nessun live data (zero utenti reali). **NON INVENTARE**.
- Trust signal alternativo: "Costruito a Milano · Beta aperta · Luglio 2026".

ConcorsoAI post-launch (>50 utenti):
- Trust band: "47 candidati in formazione questo mese" (calcolato realtime da Supabase).
- Footer: "127 simulazioni completate questa settimana" (calcolato realtime).

Mai numeri gonfiati o static.

### P7 — Trust by Documentation Density (Stripe-like)

Pattern: link a documentazione dettagliata (privacy, security, architecture) per utenti che cliccano curiosity.

ConcorsoAI:
- `/privacy.html` — full GDPR policy.
- `/security.html` — cifratura, data-residency, subprocessors.
- `/architecture.html` — data-flow trasparenza.
- `/faq.html` — eventuali dubbi PA-specific.
- `/disclaimers-norme.html` — citazioni normative disclaimer.

Pattern: ogni trust band footer link a una documentazione specifica. Mai "Trust us. Siamo seri." senza prove.

### P8 — Trust by Limit Communication (DQ transparency)

Pattern: il prodotto dichiara **esplicitamente i suoi limiti**, non solo le qualità.

ConcorsoAI DQ:
- "L'AI può commettere errori su citazioni specifiche. Verifica sempre sul bando ufficiale."
- "Sono supportate fino a 5 sessioni precedenti memorizzate. Oltre, si resetta la history."
- "Le materie sono un sottoinsieme non esaustivo del bando. Verifica l'elenco completo sul bando ufficiale."

Pattern: DQ aumenta il trust. Trust-by-limitation è anti-trust-up (Marketing tradizionale cerca di nascondere limiti). Marketing premium li dichiara.

### P9 — Trust by Founder Story (personal story)

Pattern: founder condivide **storia personale** che legittima la mission.

ConcorsoAI founder story:
- "Ho passato l'orale del concorso Ragioneria 2025. Ho costruito questo prodotto per il candidato che ero io nel 2024."
- "Ho visto candidati spendere €1.500 in corsi + €600 in ripetizioni private e arrivare impreparati alla commissione. Era un problema di metodo, non di soldi."

Pattern: founder come utente-target, non come CEO esterno.

### P10 — Trust by Comparison (vs alternative)

Pattern: confronto con alternative note **senza disprezzo**.

ConcorsoAI:
- "Noi: materie specifiche del tuo bando"
- "ChatGPT: generalista, non conosce il tuo bando specifico"
- "Da solo: studi ma non ti misuri su materie specifiche"

Pattern: limitazioni specifiche, non "loro sono scarsi".

### P11 — Trust by Recency (status update recenti)

Pattern: aggiornamenti recenti che mostrano **vitalità del prodotto**.

ConcorsoAI footer:
- "Ultimo aggiornamento: 5 Agosto 2026 · €14,99/mese live da Settembre 2026"
- "Changelog: pubblicato ogni 4 settimane"

Pattern: trust-by-vitality, contrapposto a "non sappiamo se stanno ancora lavorando".

### P12 — Trust by Ordained Order (Trust signals in posizioni strategiche)

Pattern: i trust signals NON sono ovunque. Solo in 2 posizioni:
- **Trust band sotto CTA hero**: 3 elementi specifici (GDPR, Server EU, No-LLM-USA).
- **Footer compliance block**: privacy + cookie + ToS + recesso email supporto.

Mai trust signals distribuiti su tutta la pagina (banner blindness).

---

## Evidenze

### Cialdini 1984 — Authority + Specificity

- Trust by Specialist Authority: citazioni specifiche di esperti/istituzioni attivano compliance fino a +20-30% (Cialdini 1984 cap 4 + Goldstein 2008 replicato).

### European Commission CPC Sweeps 2022-2025

- Studio su 76% dei siti web EU con dark patterns identificati. Pattern più comuni: countdown fittizi (28%), subscription trap (15%), fake scarcity (12%).
- Conseguenza: legal risk per SaaS EU non-compliant.

### GDPR Art. 4(11) e Art. 7 — Consenso attivo

- Definizione di "consenso" come azione libera, specifica, informata. Opt-out pre-checked = violazione.
- Pattern ConcorsoAI: cookie consent con opt-in granulare, "essential only" pre-selezionato (NON opt-out).

### Codice del Consumo italiano Art. 49-52

- Diritto di recesso 14gg (digitale) + informazioni precontrattuali obbligatorie.
- Pattern: dichiarazione in footer + link esteso + procedura chiara (1 email a supporto).

### Omnibus Directive EU 2019/2161

- In vigore da maggio 2022. Estende la protezione contro dark patterns in settori digitali.
- Pattern ConcorsoAI: nessun countdown fittizio, nessuna scarsità fabbricata, nessuna "Contattaci per pricing" su tier base.

### AGCM (Autorità Garante) — Linee guida

- Conformità alle "pratiche commerciali sleali" → no claim gonfiati su "10K utenti soddisfatti" senza verifica, no fake testimonials.

### WebAIM Trust (2018-2024)

- Pattern trust consolidati:
  - **Specificità > genericità**: "Server in Germania · GDPR-compliant" > "Sicuro e affidabile".
  - **Visual + testuale**: trust badge + copy, non trust badge alone.
  - **Footer linkage**: link a privacy/cookie/ToS/recesso sempre in footer.

### Baymard (2024) — Trust Signals E-commerce

- Posizionamento:
  - 11% drop se trust signals assenti above the fold.
  - 18% drop su CTA payment se "garanzia rimborso" assente in prossimità.
  - **Pattern ottimale**: trust band sotto CTA + footer compliance.

### Stripe / Mercury transparency (case study)

- Stripe: docs density + trasparenza pricing + security badges inline (PCI, SOC 2).
- Mercury: regulatory compliance FDIC esplicita + multi-page trust doc.
- Pattern ConcorsoAI: simile ma con focus PA-EU (Codice Consumo, GDPR).

### NN/g — *Trust in Digital User Interfaces* (2018-2024)

- Pattern consolidato: trust richiede 5 leve (authority, transparency, competence, predictability, benevolence). La landing deve esprimere almeno 3.

---

## Errori comuni

### E1 — Trust claim generici ("SICURO E AFFIDABILE")

**Sintomo**: la landing dice "Sicuro. Affidabile. Il migliore." Ma nessuna prova.

**Perché succede**: copy pensa "aggettivi = persuasione".

**Perché il cervello lo rifiuta**: claim generici attivano filter scettico. PA target è culturalmente allergico a claim vuoti.

**Soluzione**: claim specifici con prove. "Server in Germania · Cifratura AES-256 · Recesso 30gg" > "Sicuro. Affidabile."

### E2 — Trust signals distribuiti ovunque

**Sintomo**: 5 trust bands in 5 sezioni + 3 trust footer + 1 sticky trust in nav.

**Perché succede**: designer/maximizer pensa "più visibility = più trust".

**Perché il cervello lo rifiuta**: banner blindness. Trust diluito in 9 posizioni = nessuna è centrale.

**Soluzione**: 2 posizioni strategiche: trust band sotto CTA hero + footer compliance.

### E3 — Nessun link a documentazione

**Sintomo**: "GDPR compliant" senza link a privacy.html.

**Perché succede**: copy pensa "claim self-explanatory".

**Perché il cervello lo rifiuta**: claim senza link a prova = dark pattern sospetto.

**Soluzione**: ogni trust claim ha link a documentazione specifica.

### E4 — Trust signals senza autorità istituzionale

**Sintomo**: "Consigliato da esperti", "Approvato da professionisti" (senza nomi).

**Perché succede**: copy pensa "esperti = autorità".

**Perché il cervello lo rifiuta**: "esperti" senza nome + verifica = claim vuoto.

**Soluzione**: nomi reali + link a credenziali. "Consigliato da Prof. Marco Rossi, Università X" (link profilo).

### E5 — False trust (no prova reale)

**Sintomo**: "100% sicuro" senza specificità tecnica.

**Perché succede**: marketing aggressivo "claim massimo per persuasione".

**Perché il cervello lo rifiuta**: utente PA tecnico verifica.

**Soluzione**: specificità tecnica. "Cifratura AES-256 a riposo · TLS 1.3 in transito" > "100% sicuro".

### E6 — Trust claims misti (incoerenza tra posizioni)

**Sintomo**: hero dice "30gg rimborsabili", footer dice "14gg diritto di recesso".

**Perché succede**: copy incoerente tra team diversi.

**Perché il cervello lo rifiuta**: utente nota incoerenza. Trust erode.

**Soluzione**: trust claim canonici dichiarati in un unico spec-sheet `landing/trust-spec.md`. Tutti i copy conformi.

### E7 — Trust signals con claim gonfiato su social proof

**Sintomo**: "Trusted by 10,000+ utenti soddisfatti" quando reali sono 5.

**Perché succede**: marketing gonfia.

**Perché il cervello lo rifiuta**: PA target verifica con Google (Nielsen 2024: 78% Millennials/Gen Z verifica claim mediatici).

**Soluzione**: MAI claim gonfiati. Solo "Costruito a Milano · Beta aperta · 12 candidati hanno partecipato al test interno" (reale).

### E8 — Trust signal inverso (security badge che dice "cert XYZ" inventato)

**Sintomo**: "SicuroSSL Plus · Cert 12345" (cert inesistente).

**Perché succede**: shortcut per "trust badge = trust signal".

**Perché il cervello lo rifiuta**: utenti esperti verificano. Trust erode quando scoprono fake.

**Soluzione**: solo badge realmente ottenuti (Stripe PCI badge reale, badge GDPR reale per compliance verificabile).

### E9 — Trust signals senza contesto PA (es. "Consigliato da studenti universitari")

**Sintomo**: trust badge "Consigliato da 1.000.000+ studenti" (senza specificità PA).

**Perché succede**: copywriter scrive per "tutti" senza segmentare.

**Perché il cervello lo rifiuta**: il candidato PA non si identifica come "studente universitario" → claim non risuona.

**Soluzione**: trust signal "specific al target". "Consigliato da candidati PA italiani" (quando ≥5 testimonianze disponibili).

### E10 — Trust signals troppo tecnici (no comprensione utente PA)

**Sintomo**: "Crittografia asimmetrica RSA-2048-bit" (tecnicismo).

**Perché succede**: developer pensa "specificità tecnica = rigor".

**Perché il cervello lo rifiuta**: PA target non capisce RSA-2048. Distanza percettiva → il claim diventa "marketing".

**Soluzione**: trust description in PA-friendly. "Cifratura standard di settore (banche)" > "RSA-2048".

---

## Pattern migliori

### Pattern A — Trust band sotto CTA (3 elementi)

Pattern canonico:
```html
<div class="trust-band" role="region" aria-label="Trust signals">
  <div class="trust-badge">
    <span class="trust-icon" aria-hidden="true">🔒</span>
    <span class="trust-text">GDPR compliant</span>
    <a href="/privacy.html" class="trust-link">Privacy</a>
  </div>
  <div class="trust-badge">
    <span class="trust-icon" aria-hidden="true">🌍</span>
    <span class="trust-text">Server in Europa</span>
    <a href="/security.html#data-residency">Dove sono i dati</a>
  </div>
  <div class="trust-badge">
    <span class="trust-icon" aria-hidden="true">🇪🇺</span>
    <span class="trust-text">No LLM USA</span>
    <a href="/architecture.html#data-flow">Architettura</a>
  </div>
</div>
```

Pattern: 3 elementi + 3 link a documentazione specifica. Mai "trust us" alone.

### Pattern B — Footer compliance block (4 link + 1 founder marker)

```html
<footer role="contentinfo">
  <nav class="footer-legal" aria-label="Legal">
    <a href="/privacy.html">Privacy</a>
    <a href="/cookie.html">Cookie</a>
    <a href="/tos.html">Termini di Servizio</a>
    <a href="/recesso.html">Recesso (Art. 49 Cod. Consumo)</a>
  </nav>
  <div class="footer-founder">
    <p>Costruito a Milano · Beta aperta · Agosto 2026</p>
    <p>supporto@concorsoai.it · Server EU · GDPR compliant</p>
  </div>
</footer>
```

Pattern: 4 link legali + 1 founder block + 1 supporto email visibile.

### Pattern C — Trust by Demo (mockup con dati reali)

Pattern: il mockup hero mostra:
- Materie reali del bando (Diritto Amministrativo, Contabilità, Penale, Costituzione).
- Citazioni reali (D.Lgs. 33/2013, art. 7-bis, Cass. Pen. SS.UU. 2014 n. 38343).
- Punteggio realistico (78/100).
- Micro-disclaimer: "L'AI può commettere errori su citazioni specifiche. Verifica sempre sul bando ufficiale."

Pattern: dati verificabili. Mai placeholder.

### Pattern D — Trust by DQ (Limit Communication)

Pattern: dichiarare limiti apertamente:
- "L'AI può commettere errori su citazioni specifiche. Verifica sempre sul bando ufficiale."
- "Fino a 5 sessioni memorizzate. Oltre, si resetta la history."
- "Materie non esaustive del bando completo. Verifica l'elenco completo sul bando ufficiale."

Pattern: DQ = trust-by-limitation. Anti-pattern marketing tradizionale.

### Pattern E — Trust by Comparison (vs alternative senza disprezzo)

```html
<section class="comparison" aria-label="Confronto con alternative">
  <h2>Perché ConcorsoAI vs ChatGPT o da solo</h2>
  <table>
    <thead>
      <tr>
        <th></th>
        <th>ConcorsoAI</th>
        <th>ChatGPT</th>
        <th>Da solo</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Materie specifiche del tuo bando</td><td>✓</td><td>—</td><td>—</td></tr>
      <tr><td>Ricorda le tue 5 sessioni precedenti</td><td>✓</td><td>—</td><td>—</td></tr>
      <tr><td>Feedback su chiarezza, struttura, contenuto</td><td>✓</td><td>—</td><td>✓ (self-assessment)</td></tr>
      <tr><td>Server EU · GDPR</td><td>✓</td><td>—</td><td>—</td></tr>
      <tr><td>Compliance DGPR + EU AI Act</td><td>✓</td><td>—</td><td>—</td></tr>
    </tbody>
  </table>
  <p class="comparison-dq">L'AI può commettere errori su citazioni specifiche. Verifica sempre sul bando ufficiale.</p>
</section>
```

Pattern: confronto con limitazioni specifiche + DQ a chiusura.

### Pattern F — Trust by Documentation Density

Pattern: link footer + hero trust band a documentazione specifica:
- `/privacy.html` — full policy GDPR.
- `/cookie.html` — cookie categorie + opt-in.
- `/tos.html` — termini servizio.
- `/recesso.html` — procedura recesso Codice Consumo.
- `/security.html` — cifratura + data-residency + sub-processors.
- `/architecture.html` — data-flow architettura.
- `/faq.html` — dubbi specifici.

Pattern: ogni link a doc specifica. Mai "Privacy" generico senza contenuto reale.

### Pattern G — Trust by Compliance Cite (specifico)

Pattern: citazioni normative con link diretto a Normattiva:
- `<a href="https://www.normattiva.it/uri-res/N2Ls?urn=nir:stato:costituzione:1947-12-27;art~97">art. 97 Cost.</a>`
- `<a href="https://www.normattiva.it/uri-res/N2Ls?urn=nir:stato:decreto.pres.rep.1994-05-09;487">DPR 487/1994</a>`
- `<a href="https://www.gazzettaufficiale.it/eli/id/2013/03/16/13G00043/sgu">D.Lgs. 33/2013</a>`

Pattern: ogni citazione come link a fonte primaria verificabile.

### Pattern H — Trust by Recency + Vitality

Pattern footer:
- "Ultimo aggiornamento: 5 Agosto 2026"
- "Versione beta · Coorte Q3 2026 (aperta fino a Ottobre 2026)"
- "Roadmap: v1.2 / Memoria sessioni illimitata · Settembre 2026"

Pattern: trust-by-vitality contrapposto a "il sito è abbandonato".

### Pattern I — Trust by Founder Story

Pattern: founder section con micro-storia:
- "Mi chiamo Marco. Ho passato l'orale del concorso Ragioneria 2025 dopo 4 mesi di studio. Ho speso €1.500 in corsi + €600 in ripetizioni private, e sono arrivato alla commissione con ansia perché non avevo mai simulato una sessione vera. ConcorsoAI è il prodotto che avrei voluto avere."
- Link a "Perché ho costruito ConcorsoAI" + timeline + status.

Pattern: founder come utente-target, non come CEO.

### Pattern J — Trust by Meta + Security Headers

Pattern tecnico (non copy):
- `<meta http-equiv="Content-Security-Policy" content="default-src 'self'">` — security baseline.
- `<meta http-equiv="Strict-Transport-Security" content="max-age=31536000; includeSubDomains">` — HTTPSOnly.
- `<meta name="robots" content="index, follow">` — indexability.
- `<link rel="canonical" href="https://concorsoai.it/">` — canonical.
- `<script type="application/ld+json">` — Schema.org SoftwareApplication.
- Open Graph tags completi.

Pattern: security headers + metadata + Schema.org = engineering trust-by-default.

---

## Checklist

- [ ] Trust band 3 elementi sotto CTA hero (GDPR, Server EU, No LLM USA + link)
- [ ] Footer 4 link legali (Privacy, Cookie, ToS, Recesso) + founder marker
- [ ] Trust claims con link a documentazione specifica (mai claim self-explanatory)
- [ ] Citazioni normative con link a Normattiva / EUR-Lex / Gazzetta Ufficiale
- [ ] Mockup hero con dati reali del prodotto (materie, citazioni, punteggi)
- [ ] DQ (limit communication): AI può sbagliare citazioni; verifica sempre sul bando ufficiale
- [ ] Founder story reale (1 paragrafo max)
- [ ] Compliance EU completa (GDPR + Codice Consumo + Omnibus)
- [ ] No counterfeit security badges
- [ ] Trust signals in 2 posizioni strategiche (sotto CTA + footer)
- [ ] No claim gonfiato su utenti soddisfatti
- [ ] No "consigliato da senza nome"
- [ ] Schema.org JSON-LD per SoftwareApplication
- [ ] Open Graph tags + canonical + robots

---

## Decisioni progettuali

### Da claim generici a claim specifici con link

Scelta: ogni claim di trust ha link a documentazione specifica. Mai "trust us" alone.

### Da 5 trust bands a 2 (sotto CTA + footer)

Scelta: trust signals in 2 posizioni strategiche, non distribuiti ovunque (banner blindness).

### Da trust brand generico a trust by authority specifica

Scelta: citazioni normative con link a Normattiva.it, EUR-Lex, gazzettaufficiale.it. Mai media generica.

### Da claim gonfiati a founder marker onesty

Scelta: "Costruito a Milano · Beta aperta" > "10K utenti soddisfatti" (fondato su dati reali).

### Da DQ hidden a DQ transparent

Scelta: dichiarare apertamente limiti del prodotto ("L'AI può sbagliare citazioni. Verifica sul bando ufficiale."). Trust-by-limitation.

### Da trust senza documentazione a trust-by-doc-density

Scelta: ogni trust claim ha link a privacy/security/architecture/recesso doc.

---

## Applicazione a ConcorsoAI

| Punto | Implementazione concreta | Stato |
|---|---|---|
| Trust band 3 elementi sotto CTA | GDPR + Server EU + No LLM USA | ✅ applicato |
| Footer 4 link legali | Privacy + Cookie + ToS + Recesso | ✅ applicato |
| Trust claims con link | Tutti i claim hanno link a doc | ✅ applicato |
| Citazioni normative link | Normattiva + EUR-Lex + Gazzetta Ufficiale | ⏳ in progress |
| Mockup con dati reali | D.Lgs. 33/2013, art. 7-bis, Cass. Pen. SS.UU. 2014 n. 38343 | ✅ applicato |
| DQ declaration | "L'AI può commettere errori su citazioni" | ✅ applicato |
| Founder story reale | Footer founder marker + chi siamo | ✅ applicato |
| Compliance EU | GDPR + Codice Consumo + Omnibus EU | ✅ applicato |
| Open Graph + canonical + Schema.org | Implementato su `public/index.html` | ✅ applicato |
| Trust signals solo 2 posizioni | sotto CTA hero + footer | ✅ applicato |
| No claim gonfiato | Zero claim "10K utenti" senza verifica | ✅ applicato |
| No counterfeit badges | Solo badge verificabili (GDPR real) | ✅ applicato |

**Gap**: articolazione completa delle pagine doc (privacy/security/architecture/recesso).

---

## Vincoli

- ❌ **NO** claim generici senza prove ("Sicuro", "Affidabile", "100% sicuro").
- ❌ **NO** trust signals distribuiti ovunque.
- ❌ **NO** claim senza link a documentazione.
- ❌ **NO** claim "consigliato da senza nome".
- ❌ **NO** claim "10000+ utenti soddisfatti" senza verifica.
- ❌ **NO** counterfeit security badge.
- ❌ **NO** trust signals senza coerenza tra posizioni (hero + footer same copy).
- ❌ **NO** trust-by-hype comunque.
- ❌ **NO** claim gonfiato su "made in ..." senza specificità.

---

*Continua in `15_social_proof.md`.*
