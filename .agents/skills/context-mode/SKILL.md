---
name: context-mode
description: "Modalità contesto profondo: fondamenti di context engineering, meccaniche dell'attenzione, finestra di contesto, U-shaped attention curve, qualità vs quantità. Usare per diagnosi di degradation, ottimizzazione token, e decisioni architetturali sul contesto."
---
# Context Mode — Fondamenti di Context Engineering
Il contesto è lo stato completo disponibile al modello al momento dell'inferenza: istruzioni di sistema, definizioni dei tool, documenti recuperati, cronologia messaggi, output dei tool. Il context engineering è la disciplina di curare il set minimo di token ad alto segnale che massimizza la probabilità di outcome desiderati.
## Principio Fondamentale
Tratta il contesto come un **budget di attenzione finito**, non come un contenitore. Ogni token aggiunto compete per l'attenzione del modello. Il problema ingegneristico è massimizzare l'utilità per token contro tre vincoli: hard token limit, effective-capacity ceiling, e la U-shaped attention curve che penalizza le informazioni nel mezzo del contesto.
## I Quattro Pilastri
1. **Informativity over exhaustiveness** — includi solo ciò che serve per la decisione corrente
2. **Position-aware placement** — vincoli critici all'inizio e alla fine; il centro perde ~40% di recall
3. **Progressive disclosure** — carica nomi e summary; carica contenuti completi solo su attivazione
4. **Iterative curation** — non è un one-time prompt; è una disciplina continua
## Anatomia del Contesto
| Componente | Strategia |
|------------|----------|
| System Prompts | Organizza con XML tags/Markdown headers; critici a inizio e fine |
| Tool Definitions | Minimal set; descrivi what, when, what returns. JSON serialization inflates 2-3x |
| Retrieved Docs | Mantieni lightweight identifiers; carica JIT; chunk a semantic boundaries |
| Message History | Monitora; compatta output tool obsoleti; trigger compaction al 70-80% |
| Tool Outputs | Observation masking: sostituisci output verbosi con riferimenti compatti |
## segnali di Degradazione
- **Lost-in-middle**: attention si indebolisce per contenuti a metà contesto
- **Attention scarcity**: troppi elementi competono
- **Context poisoning**: contenuti irrilevanti spiazzano quelli utili
## Quando Attivare
- Diagnosticare degradation: `context-degradation`
- Ridurre costo token: `context-optimization`
- Compattare sessioni lunghe: `context-compression`
- Offload su filesystem: `filesystem-context`
- Decisioni architetturali sul contesto: **questa skill**
## Regole d'Oro
1. Nominal window ≠ effective capacity — testa sul tuo workload
2. Posiziona vincoli critici a inizio e fine, MAI nel mezzo
3. Trigger compaction al 70-80% utilizzo
4. Preferisci contesto piccolo ad alto segnale su contesto grande a basso segnale

**Source**: muratcankoylan/agent-skills-for-context-engineering
