---
name: dynamic-taxonomy-chunking
description: "Compressione e chunking dinamico del contesto per sessioni lunghe. Ottimizza tokens-per-task (non tokens-per-request). Usare quando le sessioni superano i limiti della context window o il codebase eccede 5M token."
---
# Dynamic Taxonomy & Chunking — Compressione Intelligente del Contesto

## Principio Fondamentale
Ottimizza **tokens-per-task**, non tokens-per-request. Se la compressione droppa file path, errori, o decisioni, l'agente dovrà ri-esplorare — sprecando più token di quanti ne hai risparmiati.

## Tre Strategie di Compressione

### 1. Anchored Iterative Summarization (consigliata)
Per sessioni lunghe con file tracking critico:
- Sezioni strutturate: Session Intent, Files Modified, Decisions, Next Steps
- Comprimi solo lo span appena troncato; mergia col summary esistente
- **Mai rigenerare da zero** — ogni rigenerazione rischia di perdere dettagli

### 2. Opaque Compression
Per sessioni brevi, max token saving, no debugging:
- 99%+ compression ratio
- **Non verificabile** — nessun modo di sapere cosa è stato preservato

### 3. Regenerative Full Summary
Per sessioni con confini di fase chiari:
- Summary leggibile a ogni trigger
- Debolezza: cumulative detail loss

## Artifact Trail (IL PROBLEMA PIÙ CRITICO)
Preserva esplicitamente in ogni ciclo di compressione:
- Quali file creati (full path)
- Quali file modificati e cosa è cambiato (function names, non solo file names)
- Quali file letti ma non modificati
- Identificatori specifici: function names, variable names, error messages, error codes

## Calibrazione per Metodo
| Method | Compression Ratio | Quality | Quando |
|--------|-------------------|---------|--------|
| Anchored Iterative | 98.6% | 3.70 | Sessioni 100+ messaggi, file tracking |
| Regenerative | 98.7% | 3.44 | Confini di fase chiari |
| Opaque | 99.3% | 3.35 | Max saving, sessioni brevi |

## Tre Fasi per Codebase Enormi (5M+ token)
1. **Research**: esplora architettura, documentazione, key interfaces → comprimi in analysis strutturata
2. **Planning**: converti research in specifica con function signatures, type definitions, data flow
3. **Implementation**: esegui contro la specifica; contesto = spec + file attivi

## Trigger Strategici
- **Fixed threshold**: 70-80% context utilization
- **Sliding window**: ultimi N turni + summary (default per coding agents)
- **Task-boundary**: a ogni completamento logico
- **Importance-based**: comprimi sezioni a bassa rilevanza prima

## Probe-Based Evaluation
Non fidarti di ROUGE o embedding similarity. Dopo compressione, testa con domande:
- Recall: "Qual era l'errore originale?"
- Artifact: "Quali file abbiamo modificato?"
- Continuation: "Cosa facciamo dopo?"
- Decision: "Cosa abbiamo deciso su X?"

**Source**: muratcankoylan/agent-skills-for-context-engineering (context-compression)
