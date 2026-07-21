---
name: critic-correction-loop
description: "Loop di auto-miglioramento continuo: l'agente analizza i propri fallimenti, propone modifiche bounded al proprio scaffold, valida con two-split acceptance gate. Usare per sistemi che devono auto-correggersi, evolvere prompt/contesto/harness, e prevenire reward hacking."
---
# Critic-Correction Loop — Auto-Miglioramento Ricorsivo

## Filosofia
Il loop ottimizza qualsiasi segnale gli venga dato, inclusi i difetti del segnale stesso. Progetta il loop assumendo che l'ottimizzatore troverà ogni gap tra la metrica e l'intento reale.

## Optimization Ladder
Ogni gradino aumenta design space e leverage, ma anche costo e superficie di gaming:
| Rung | Oggetto ottimizzato | Quando usarlo |
|------|-------------------|---------------|
| 1 | Instruction prompts | Prompt da raffinare |
| 2 | Structured context | Playbook con bullet items |
| 3 | Context mechanism | La skill che produce contesto |
| 4 | Workflow graph | Sequenza di step |
| 5 | Harness code | Il codice dello scaffold |
| 6 | Optimizer code | L'ottimizzatore stesso |

**Regola**: Fixa al gradino più basso che può esprimere il fix. Uno stale-library failure è un context fix, non un workflow rewrite.

## Two-Split Acceptance Gate (CRITICO)
Mai accettare una modifica senza evidenza misurata:
```python
def accept(candidate, baseline, held_in, held_out):
    d_in = score(candidate, held_in) - score(baseline, held_in)
    d_out = score(candidate, held_out) - score(baseline, held_out)
    if d_in < 0 or d_out < 0:
        return False  # No regression allowed
    return max(d_in, d_out) > 0  # Strict improvement on at least one
```
Held-out split è invisibile al proposer.

## Invariante Fondamentale
**Evaluator, instrumentation, permission control, e budget enforcement devono stare FUORI dalla superficie che il loop può modificare.** Ogni reward hack documentato ha violato questa regola.

## Tre Pattern di Fallimento
1. **Brevity bias**: l'ottimizzatore collassa verso istruzioni corte e generiche
2. **Context collapse**: riscrittura monolitica distrugge euristiche accumulate
3. **Stagnation nascosta**: il loop restituisce input immutato → sembra stabile ma è rotto

## Checklist Prima di Abilitare Self-Modification
1. Evaluator deterministico e automatizzabile esiste
2. Held-out split esiste e il proposer non lo vede
3. Budget, permessi, sandboxing enforced dal runtime
4. Superfici editabili esplicitamente dichiarate
5. Archive con lineage completo di diff
6. Evaluation spending staged (cheap → full)
7. Capability validation: modello supera soglia minima
8. Human decision points wired per: evaluator changes, surface expansion, promotion

**Source**: muratcankoylan/agent-skills-for-context-engineering (self-improvement-loops)
