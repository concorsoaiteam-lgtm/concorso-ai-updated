---
name: state-machine-fallback
description: "State machine e fallback deterministico per agenti. Modella stati mentali (Belief, Desire, Intention), piani d'azione, transizioni, e fallback quando l'agente autonomo fallisce. Usare per sistemi che richiedono explainability, reasoning tracciabile, e graceful degradation."
---
# State-Machine Fallback — Stati Mentali e Degradazione Controllata

## Filosofia
Quando un agente autonomo fallisce, deve degradare in modo deterministico e prevedibile — non in modo caotico. La state machine garantisce che ogni stato abbia un fallback definito.

## Architettura BDI (Belief-Desire-Intention)

### Stati Mentali (Endurants — persistenti)
- **Belief**: ciò che l'agente ritiene vero. Ogni belief ha un world state reference.
- **Desire**: ciò che l'agente vuole ottenere. Linkato ai belief che lo motivano.
- **Intention**: ciò a cui l'agente si impegna. Deve soddisfare un desire e specificare un plan.

### Processi Mentali (Perdurants — eventi)
- **BeliefProcess**: formazione/update da percezione
- **DesireProcess**: generazione da belief esistenti
- **IntentionProcess**: commitment da desire selezionati

## Catena Cognitiva
```
WorldState → Belief → Desire → Intention → Plan → Task → Execution
```
Bidirezionale: forward reasoning (cosa fare?) e backward tracing (perché l'ha fatto?)

## Fallback Deterministico

### Livelli di Fallback
| Livello | Trigger | Azione |
|---------|---------|--------|
| 1. Retry | Errore transiente | Riprova con backoff |
| 2. Degrade | Errore persistente | Usa strategia alternativa |
| 3. Escalate | Blocco critico | Richiedi intervento umano |
| 4. Abort | Danno potenziale | Termina in safe state |

### Pattern di Transizione
```python
def handle_failure(state, error):
    if is_transient(error):
        return retry_with_backoff(state)
    elif has_alternative(state):
        return degrade_to_alternative(state)
    elif is_blocking(state):
        return escalate_to_human(state, error)
    else:
        return abort_safely(state)
```

## Regole Fondamentali
1. Ogni stato ha un fallback definito — nessun "undefined behavior"
2. Belief scadono: usa validity intervals con start/end time
3. Justification obbligatoria: ogni stato mentale tracciabile a una fonte
4. Plan separato da intention: riusabile, riordinabile
5. Massimo 3 livelli nella catena: belief → desire → intention

## Quando Usare BDI
- ✅ Sistema richiede explainability (perché l'agente ha fatto X?)
- ✅ Multi-agente con necessità di coordinazione semantica
- ✅ Decisioni che devono essere auditate
- ❌ Sistema che deve solo ricordare fatti (usa memory-systems)
- ❌ Sistema che deve solo splittare lavoro (usa multi-agent-patterns)

## T2B2T Pipeline
1. **Triples-to-Beliefs**: traduci RDF esterno in belief instances
2. **BDI Reasoning**: delibera desire e intention
3. **Beliefs-to-Triples**: proietta risultati in RDF per downstream systems

**Source**: muratcankoylan/agent-skills-for-context-engineering (bdi-mental-states)
