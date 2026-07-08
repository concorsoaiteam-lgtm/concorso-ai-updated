# public/css/ — struttura

| File | Dimensione | Usato da | Scopo |
|------|-----------|----------|-------|
| `landing.css` | ~8 KB | `index.html` | Hero, footer, layout landing page |
| `auth.css` | ~3 KB | `auth.html` | Login / registrazione |
| `dashboard.css` | ~20 KB | `dashboard.html` | Pannello utente, statistiche |
| `simulation.css` | ~63 KB | `simulation.html` | Config bandi, chat simulazione, feedback, animazioni |
| `terms.css` | ~0.8 KB | `terms.html`, `privacy.html` | Pagine legali minimali |

## Convenzioni

- Temi CSS custom properties via `:root { color-scheme: light; … }`
- Palette coerente: blu `#0F4C81` / `#2563EB` su sfondo `#F7FBFF`
- `prefers-reduced-motion` rispettato in tutti i file
- Nessun framework CSS esterno (zero dipendenze)
