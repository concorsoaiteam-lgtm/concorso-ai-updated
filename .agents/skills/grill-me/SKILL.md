---
name: grill-me
description: "Intervista implacabile per stress-testare un piano, design, o decisione prima di eseguire. Percorre ogni ramo dell'albero decisionale, risolvendo dipendenze una alla volta. Usare prima di implementare qualsiasi cosa complessa per evitare di costruire la cosa sbagliata."
---
# Grill-Me — Stress-Test Implacabile del Piano

## Filosofia
Meglio 30 minuti di domande scomode adesso che 3 giorni di refactoring dopo. Ogni decisione non testata è un bug in attesa.

## Regole dell'Intervista

### Per l'intervistatore (l'agente):
1. **Una domanda alla volta.** Mai raffiche di domande — confondono.
2. **Ogni domanda include una risposta raccomandata.** Non chiedere "cosa vuoi fare?" — chiedi "propongo X per motivo Y, sei d'accordo?"
3. **I fatti si cercano nel codebase, non si chiedono.** Se puoi scoprirlo leggendo un file, non chiederlo.
4. **Le decisioni sono dell'utente.** Presenta l'opzione, spiega i trade-off, aspetta risposta.
5. **Non eseguire finché non c'è shared understanding confermata.**

### Per l'intervistato (l'utente):
- Ogni risposta sblocca il prossimo ramo dell'albero
- "Non lo so" è una risposta valida — significa che serve più esplorazione
- "Salta questa" è valido solo se la decisione è veramente a basso rischio

## Aree di Stress-Test

### 1. Scopo e Confini
- Qual è il problema esatto che risolviamo? Per chi?
- Cosa è FUORI scope? (importante quanto cosa è dentro)
- Qual è il criterio di successo misurabile?

### 2. Design & Architettura
- Quali sono le alternative che abbiamo scartato? Perché?
- Cosa si rompe se questa decisione è sbagliata?
- Quali assunzioni stiamo facendo che potrebbero essere false?

### 3. Implementazione
- Qual è il piano di rollback se qualcosa va storto?
- Quali parti sono più rischiose? Perché?
- Cosa testiamo e come?

### 4. Edge Cases
- Cosa succede se l'input è vuoto? Troppo grande? Malformato?
- Cosa succede se la rete va giù a metà?
- Cosa succede se 1000 utenti lo usano contemporaneamente?

### 5. Post-Lancio
- Come sappiamo se sta funzionando?
- Quali metriche guardiamo?
- Cosa triggera un rollback?

## Quando Usare
- ✅ Prima di implementare una feature complessa
- ✅ Prima di un refactor grande
- ✅ Prima di una decisione architetturale
- ✅ Quando il team non è allineato
- ❌ Per task banali (typo fix, config change)
- ❌ Quando il piano è già stato stress-testato

## Anti-Pattern
- "Poi ci pensiamo" → no, pensaci ora
- "È ovvio" → niente è ovvio, spiega lo stesso
- "Non ho tempo per questo" → ne hai meno per rifare tutto dopo

**Source**: grilling skill pattern
