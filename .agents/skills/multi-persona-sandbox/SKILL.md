---
name: multi-persona-sandbox
description: "Sandbox multi-persona per esecuzione parallela di agenti specializzati. Isolamento di contesto, supervisor/swarm/hierarchical patterns, handoff protocols, consensus e prevenzione sycophancy. Usare quando un singolo contesto non basta per la complessità del task."
---
# Multi-Persona Sandbox — Agenti Multipli con Contesto Isolato

## Perché Multi-Agent
Il beneficio primario è l'**isolamento del contesto**: ogni agente opera in una finestra pulita senza rumore accumulato da altri subtask. Previeni il "telephone game" dove le informazioni si degradano attraverso summarization ripetute.

Nota: I sistemi multi-agente possono costare **15x** in token rispetto a single-agent. Misura sempre contro un baseline single-agent.

## Tre Pattern Architetturali

### 1. Supervisor/Orchestrator
Controllo centralizzato. Un coordinatore delega a specialisti e sintetizza risultati.
```
User → Supervisor → [Specialist, Specialist, Specialist] → Aggregation → Output
```
- ✅ Per: decomposizione chiara, oversight umano
- ❌ Rischio: supervisor bottleneck, telephone game

### 2. Peer-to-Peer / Swarm
Nessun controllo centrale. Agenti comunicano direttamente con handoff espliciti.
- ✅ Per: esplorazione flessibile, nessun single point of failure
- ❌ Rischio: coordination complexity, divergenza

### 3. Hierarchical
Layer di astrazione: Strategy (goal) → Planning (task) → Execution (atomic)
- ✅ Per: progetti con struttura gerarchica chiara
- ❌ Rischio: coordination overhead, strategy-execution misalignment

## Meccanismi di Isolamento
| Meccanismo | Quando | Trade-off |
|-----------|--------|-----------|
| Full context delegation | Sub-agent ha bisogno di contesto completo | Perde isolamento |
| Instruction passing | Subtask semplici e ben definiti | Massimo isolamento |
| File system memory | Stato condiviso necessario | Latenza, consistenza |

**Default**: instruction passing. Escala a file system solo se serve shared state.

## Consensus e Coordinazione

### Anti-Pattern: Simple Majority Voting
Tratta le allucinazioni dei modelli deboli come equivalenti al reasoning dei modelli forti.

### Pattern Corretti:
- **Weighted voting**: peso basato su confidenza/expertise
- **Debate protocols**: adversarial critique multi-round
- **Trigger-based intervention**: monitor per stalli e sycophancy

## Errori Comuni
1. **Supervisor bottleneck**: cappare a 3-5 worker per supervisor
2. **Token cost underestimation**: budgettare 15x baseline
3. **Sycophantic consensus**: agenti convergono su risposte gradite, non corrette
4. **Agent sprawl**: dopo 3-5 agenti, diminishing returns
5. **Telephone game**: degradazione info attraverso summarization a catena
6. **Error propagation cascades**: una allucinazione diventa "fact" per downstream agents

## Forward Message Pattern (anti-telephone-game)
Permetti ai sub-agenti di passare risposte direttamente all'utente:
```python
def forward_message(message: str, to_user: bool = True):
    if to_user:
        return {"type": "direct_response", "content": message}
```
Preferisci swarm su supervisor quando i sub-agenti possono rispondere direttamente.

**Source**: muratcankoylan/agent-skills-for-context-engineering (multi-agent-patterns)
