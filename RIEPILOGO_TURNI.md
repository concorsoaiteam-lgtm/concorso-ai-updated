# Riepilogo collaborazione agenti (turni 1-18)

## Cosa è stato fatto

### Pulizia progetto
- Rimosso clone Minecraft (`src/`) — non pertinente, DEPRECATED
- Eliminati `_patch_sim.py` e `_test.txt` da `public/`
- Aggiornato `.gitignore` per escludere legacy e file di sessione agenti
- Rimosso `index.html` vecchio (era l'entry point Minecraft, ora redirect)

### Bug fix
- **Streak giorni consecutivi** (`dashboard.html`): l'algoritmo usava UTC, causando errori per utenti italiani (CEST). Fixato con chiave giorno locale.

### CTA e copy (landing page)
- "Inizia ad allenarti" → "Vivi l'orale vero" (hero)
- "Inizia ad allenarti" → "Vinci l'orale partendo dal bando vero" (sezione prezzi)
- "Inizia ad allenarti →" → "Simula ora il tuo orale →" (CTA finale)
- Meta description e titolo aggiornati
- Testo hero più orientato al risultato

### UI/UX (simulazione)
- Rimosse 6 emoji dal codice HTML (`⚡🤝📂🟢🟡🔴`)
- Sostituite con icone SVG pulite e coerenti col brand
- Icone difficoltà (Facile/Realistico/Difficile) ora sono cerchi con colori CSS

## Miglioramento sito (stima)

| Aspetto | Prima | Dopo |
|---------|-------|------|
| File inutili | 10+ (Minecraft + test) | 0 (pulito) |
| Streak giorni | Sballato con UTC | Corretto con calendario locale |
| CTA landing | Generiche ("Inizia ad allenarti") | Orientate al risultato |
| Emoji nel codice | 6 emoji miste | 0, tutte SVG |
| Accessibilità | Buona | Migliorata (aria-label, focus-visible) |
| Git tracking | Inclusi file spuri | Pulito con .gitignore |

## Non fatto (per rischi o tempo)

- Refactor CSS `.bando-card` in simulation.html (7 blocchi sovrapposti)
- Streaming char-by-char reale (typewriter simulato con CSS)
