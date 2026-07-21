---
name: gsd
description: "GSD (Get Shit Done) — Focus Esecutivo Totale. Modalità di esecuzione autonoma: analizza, pianifica, esegui senza overhead. Per task complessi usa gsd-autonomous (discuss→plan→execute per fase). Per task banali (typo, config, small refactor) usa gsd-fast inline senza subagents."
---
# GSD — Get Shit Done (Focus Esecutivo Totale)

## Filosofia
Zero overhead. Zero cicli infiniti di pianificazione. Esecuzione diretta con il massimo dell'autonomia.

## Due Modalità

### `gsd-autonomous` — Per task complessi
Esegue autonomamente: **discuss → plan → execute** per ogni fase del milestone.
- Pausa SOLO per decisioni bloccanti dell'utente
- Usa ROADMAP.md per phase discovery
- Aggiorna STATE.md dopo ogni fase
- Crea CONTEXT.md, PLAN, SUMMARY per fase

**Flags:**
- `--from N` — parti dalla fase N
- `--to N` — fermati dopo fase N  
- `--only N` — esegui solo fase N
- `--interactive` — discuss inline, plan→execute come background agents
- `--converge` — planning con review convergence multi-AI

### `gsd-fast` — Per task banali
Esegue direttamente inline, **senza subagents, senza PLAN.md**.
- Per: typo fix, config changes, small refactors, forgotten commits, simple additions
- Task descrivibile in una frase, eseguibile in <2 minuti
- NON usare per task che richiedono ricerca, multi-step planning, o verifica

## Regole Operative
1. **Minimo contesto, massima azione**: non caricare tutto upfront
2. **Fase corrente only**: contesto focalizzato sulla fase attiva
3. **Output immediato**: dopo ogni fase, risultato concreto
4. **Blocca solo su decisioni vere**: se puoi decidere, decidi
5. **No perfectionism**: meglio shipped che perfect

## Anti-Pattern
- ❌ Pianificare all'infinito senza eseguire
- ❌ Chiedere conferma per ogni micro-decisione
- ❌ Caricare intero codebase in contesto
- ❌ Riscrivere file non correlati al task
- ❌ Over-ingegnerizzare task semplici

**Source**: open-gsd/gsd-core
