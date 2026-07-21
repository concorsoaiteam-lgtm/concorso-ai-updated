---
name: skill-creator
description: "Guida per creare nuove skill agent efficaci. Usare quando si vuole creare, migliorare, o fare refactoring di una skill. Copre struttura SKILL.md, naming, quando attivare, regole di scrittura, e anti-pattern."
---
# Skill Creator — Crea Skill Potenti e Anti-Slop

## Struttura di una SKILL.md Efficace

### Frontmatter YAML (obbligatorio)
```yaml
---
name: nome-skill
description: "Descrizione precisa di COSA fa e QUANDO attivarla. Includi trigger words."
---
```

### Sezioni Chiave
1. **When to Activate** — condizioni precise di attivazione; anche "when NOT to activate" se ci sono skill adiacenti
2. **Core Concepts** — i 2-3 concetti fondamentali che chi usa la skill deve capire subito
3. **Detailed Topics** — approfondimento per chi già conosce i core concepts
4. **Practical Guidance** — workflow step-by-step, checklist, decision trees
5. **Examples** — almeno 2 esempi concreti (input → output atteso)
6. **Guidelines** — numbered rules, concise
7. **Gotchas** — errori comuni e come evitarli
8. **Integration** — come si collega ad altre skill

## Regole di Scrittura

### DO
- ✅ Descrizioni specifiche e actionable
- ✅ Trigger conditions chiare e misurabili
- ✅ Esempi concreti con codice reale
- ✅ "Gotchas" che prevengono errori veri
- ✅ Routing chiaro ad altre skill quando il task non è di competenza
- ✅ Mantieni 80% azione, 20% spiegazione

### DON'T
- ❌ "Use this when appropriate" — troppo vago
- ❌ Wall of text senza struttura
- ❌ Esempi generici senza contesto
- ❌ Istruzioni contraddittorie
- ❌ Descrivere COSA senza dire COME
- ❌ AI slop words: "delve", "unlock", "supercharge", "game-changer"

## Anti-Pattern delle Skill

1. **Skill troppo generica**: "helps with coding" → inutile
2. **Skill troppo specifica**: solo per un edge case → mai attivata
3. **Trigger description vaga**: impossibile capire quando usarla
4. **Nessuna separation of concerns**: overlap massiccio con altre skill
5. **Troppo lunga**: >500 righe → dividi in sottosezioni o skill separate

## Processo di Creazione

1. **Identifica il gap**: quale problema risolve che nessuna skill esistente copre?
2. **Definisci il trigger**: in quali situazioni esatte va attivata?
3. **Scrivi i core concepts**: massimo 3, devono essere immediatamente comprensibili
4. **Aggiungi examples**: almeno 2 casi d'uso reali
5. **Testa**: attiva la skill in una conversazione reale e itera
6. **Review dopo 5 utilizzi**: cosa funziona? Cosa no? Raffina.

## Template Minimo
```markdown
---
name: mia-skill
description: "Cosa fa e quando attivarla"
---
# Titolo

## When to Activate
- Situazione A
- Situazione B
Non attivare per X (vedi `altra-skill`)

## Core Concept
Il principio fondamentale in 2-3 frasi.

## Workflow
1. Step 1
2. Step 2
3. Step 3

## Examples
### Esempio 1
[input → processo → output]

## Gotchas
- Errore comune → come evitarlo
```

**Source**: Basato su anthropics/skills template + best practices dalla community
