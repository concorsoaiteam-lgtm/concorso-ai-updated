// Unit test: api/_lib/memory.js (logica pura della memoria di apprendimento)
const mem = require('../api/_lib/memory');
let fail = 0;
function eq(name, a, b) {
  if (JSON.stringify(a) !== JSON.stringify(b)) { fail++; console.log('FAIL', name, '->', JSON.stringify(a), 'vs', JSON.stringify(b)); }
  else console.log('OK', name);
}

// empty
const e = mem.emptyMemory();
eq('empty', e, { temi: [], abitudini: [], progressi: [], aggiornata: null });

// sanitize: cap livello/note, trim, ignore garbage
const c1 = mem.sanitizeMemory({ temi: [null, 'x', { tema: '  Diritto amministrativo  ', livello: 9, note: 'n'.repeat(300), occorrenze: 0 }], abitudini: 'no', progressi: [] });
eq('sanitize livello cap', c1.temi[0].livello, 5);
eq('sanitize note cap', c1.temi[0].note.length, 180);
eq('sanitize tema trim', c1.temi[0].tema, 'Diritto amministrativo');
eq('sanitize occorrenze min', c1.temi[0].occorrenze, 1);

// merge: occorrenze deterministiche, dedupe case-insensitive
const m1 = mem.mergeMemory(e, { temi: [{ tema: 'Contabilità', livello: 4 }] });
eq('merge primo occorrenze', m1.temi[0].occorrenze, 1);
const m2 = mem.mergeMemory(m1, { temi: [{ tema: 'contabilità', livello: 3 }] });
eq('merge dedupe temi', m2.temi.length, 1);
eq('merge secondo occorrenze', m2.temi[0].occorrenze, 2);
eq('merge livello aggiornato', m2.temi[0].livello, 3);

// stato: livello <= 2 -> superato
const m3 = mem.mergeMemory(m2, { temi: [{ tema: 'Contabilità', livello: 2 }] });
eq('stato superato', m3.temi[0].stato, 'superato');

// ordinamento: attivi prima, poi per livello
const m4 = mem.mergeMemory(e, { temi: [{ tema: 'C', livello: 2 }, { tema: 'A', livello: 5 }, { tema: 'B', livello: 3 }] });
eq('ordine attivi prima', m4.temi.map(t => t.tema), ['A', 'B', 'C']);

// topWeakTopics: solo attivi con livello >= 3, priorità per livello
const m5 = mem.mergeMemory(e, { temi: [{ tema: 'A', livello: 5 }, { tema: 'B', livello: 3 }, { tema: 'C', livello: 2 }, { tema: 'D', livello: 4 }] });
eq('weak ordine', mem.topWeakTopics(m5, 4), ['A', 'D', 'B']);
eq('weak cap', mem.topWeakTopics(m5, 2), ['A', 'D']);

// eviction: cap MAX_TEMI tiene gli attivi, scarica i superati
const upd = { temi: [] };
for (let i = 0; i < 40; i++) upd.temi.push({ tema: 'Tema ' + i, livello: (i % 5) + 1 });
const m6 = mem.mergeMemory(e, upd);
eq('cap temi', m6.temi.length, mem.MAX_TEMI);
eq('eviction solo attivi', m6.temi.every(t => t.stato === 'attivo'), true);

// caps abitudini / progressi
const m7 = mem.mergeMemory(e, { abitudini: Array.from({ length: 20 }, (_, i) => ({ descrizione: 'ab ' + i, livello: 3 })), progressi: Array.from({ length: 20 }, (_, i) => ({ descrizione: 'pr ' + i })) });
eq('cap abitudini', m7.abitudini.length, mem.MAX_ABITUDINI);
eq('cap progressi', m7.progressi.length, mem.MAX_PROGRESSI);

// merge con input malformati non crasha
const m8 = mem.mergeMemory(null, 'stringa');
eq('merge garbage sicuro', m8.temi.length, 0);


// decay: tema assente dall'update perde un livello; sotto soglia -> superato
const d1 = mem.mergeMemory(e, { temi: [{ tema: 'X', livello: 4 }] });
const d2 = mem.mergeMemory(d1, { temi: [] });
eq('decay livello 4→3', d2.temi[0].livello, 3);
eq('decay resta attivo', d2.temi[0].stato, 'attivo');
const d3 = mem.mergeMemory(d2, { temi: [] });
eq('decay 3→2', d3.temi[0].livello, 2);
eq('decay diventa superato', d3.temi[0].stato, 'superato');
const d4 = mem.mergeMemory(d3, { temi: [{ tema: 'X', livello: 5 }] });
eq('risalita a 5', d4.temi[0].livello, 5);
eq('risalita occorrenze', d4.temi[0].occorrenze, 2);

process.exit(fail ? 1 : 0);
