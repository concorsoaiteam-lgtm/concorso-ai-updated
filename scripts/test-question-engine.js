/* Unit test: public/js/question-engine.js (logica pura, spec sez. 16/23/24) */
const qe = require('../public/js/question-engine');
let fail = 0;
let pass = 0;
function ok(name, cond) {
  if (cond) { pass++; console.log('OK ', name); }
  else { fail++; console.log('FAIL', name); }
}
function eq(name, a, b) {
  const sa = JSON.stringify(a), sb = JSON.stringify(b);
  if (sa === sb) { pass++; console.log('OK ', name); }
  else { fail++; console.log('FAIL', name, '->', sa, 'vs', sb); }
}

const NOW = Date.now();
const daysAgo = (d) => new Date(NOW - d * 86400000).toISOString();

console.log('=== REALISTICA ===');

// 1. Ordine: importanza prima; ultime = collegabilità alta, difficoltà 3.
const bp = [
  { argomento: 'A', importanza: 3, classicita: 2, collegabilita: 0 },
  { argomento: 'B', importanza: 2, classicita: 2, collegabilita: 0 },
  { argomento: 'C', importanza: 2, classicita: 1, collegabilita: 2 },
  { argomento: 'D', importanza: 1, classicita: 0, collegabilita: 2 },
  { argomento: 'E', importanza: 1, classicita: 1, collegabilita: 0 },
  { argomento: 'F', importanza: 1, classicita: 0, collegabilita: 0 }
];
const p1 = qe.planRealistic(bp, 6);
eq('realistic length', p1.length, 6);
ok('realistic no duplicate argomenti', new Set(p1.map(x => x.argomento)).size === 6);
eq('realistic primo = max importanza', p1[0].argomento, 'A');
eq('realistic primo tipo/difficolta', [p1[0].tipo, p1[0].difficolta], ['esposizione', 1]);
eq('realistic rampa difficolta ampiezza', [p1[1].difficolta, p1[2].difficolta], [1, 2]);
ok('realistic ultime 3 difficolta 3', p1.slice(3).every(x => x.difficolta === 3));
eq('realistic ultima = max collegabilita', p1[3].argomento, 'D');
ok('realistic ultime alternano collegamento/caso',
  p1[3].tipo === 'collegamento' && p1[4].tipo === 'caso' && p1[5].tipo === 'collegamento');

// 2. Anti-ripetizione con sessionTopics: il tema già chiesto scende.
const p2 = qe.planRealistic(bp, 6, { sessionTopics: ['A'] });
ok('realistic anti-repeat primo != A', p2[0].argomento !== 'A');
ok('realistic A compare una sola volta', p2.filter(x => x.argomento === 'A').length === 1);

// 3. n > blueprint: mai duplicati, si restituisce quanto disponibile.
const p3 = qe.planRealistic([{ argomento: 'X' }, { argomento: 'Y' }], 6);
eq('realistic cap su blueprint piccolo', p3.length, 2);
ok('realistic niente duplicati', new Set(p3.map(x => x.argomento)).size === 2);

// 4. buildBlueprint: dedupe + classicità per frequenza + onora campi.
const bb = qe.buildBlueprint([
  { argomento: 'X', importanza: 3 },
  { argomento: 'X' },
  { argomento: 'Y' }
]);
eq('blueprint dedupe', bb.length, 2);
eq('blueprint classicità per frequenza (X)', bb.filter(b => b.argomento === 'X')[0].classicita, 2);
eq('blueprint onora importanza (X)', bb.filter(b => b.argomento === 'X')[0].importanza, 3);
eq('blueprint default (Y)', [bb.filter(b => b.argomento === 'Y')[0].importanza, bb.filter(b => b.argomento === 'Y')[0].classicita], [2, 1]);

// 5. Edge: n=0.
eq('realistic n=0', qe.planRealistic(bp, 0), []);

console.log('=== ALLENAMENTO ===');

const mem1 = { temi: [
  { tema: 'Silenzio assenso', livello: 4, occorrenze: 3, ultima: null, stato: 'attivo', tipo_errore: 'confusione' },
  { tema: 'Contabilità', livello: 3, occorrenze: 1, ultima: null, stato: 'attivo', tipo_errore: 'conoscenza' }
] };

// 6. Mappa errore→tipo + rotazione + cap 40% (2 temi, n=4 → max 2 ciascuno).
const a6 = qe.planTraining(mem1, 4);
eq('allenamento primo = livello più alto', a6[0].argomento, 'Silenzio assenso');
eq('allenamento confusione → distinzione', a6[0].tipo, 'distinzione');
ok('allenamento distinzione presente (confusione mappata)', a6.some(x => x.argomento === 'Silenzio assenso' && x.tipo === 'distinzione'));
ok('allenamento esposizione presente (conoscenza mappata)', a6.some(x => x.argomento === 'Contabilità' && x.tipo === 'esposizione'));
const cnt = {};
a6.forEach(x => { cnt[x.argomento] = (cnt[x.argomento] || 0) + 1; });
ok('allenamento cap 40% (2 temi, n=4)', cnt['Silenzio assenso'] <= 2 && cnt['Contabilità'] <= 2);
// Rotazione: sullo stesso tema mai lo stesso tipo due volte di fila.
ok('allenamento rotazione per tema', (function () {
  const last = {};
  for (const x of a6) {
    if (last[x.argomento] === x.tipo) return false;
    last[x.argomento] = x.tipo;
  }
  return true;
})());
ok('allenamento ogni slot ha motivo', a6.every(x => typeof x.motivo === 'string' && x.motivo.length > 0));
ok('allenamento motivo contiene livello', a6[0].motivo.indexOf('livello 4') !== -1);

// 7. Spacing: mai esercitato > appena esercitato (stesso livello/errore).
const mem7 = { temi: [
  { tema: 'X', livello: 3, occorrenze: 1, ultima: daysAgo(0), stato: 'attivo', tipo_errore: 'conoscenza' },
  { tema: 'Y', livello: 3, occorrenze: 1, ultima: null, stato: 'attivo', tipo_errore: 'conoscenza' }
] };
const a7 = qe.planTraining(mem7, 2);
eq('spacing: mai esercitato prima', a7[0].argomento, 'Y');

// 8. Cap: un unico tema debole riempie tutto il piano.
const mem8 = { temi: [
  { tema: 'Z', livello: 5, occorrenze: 6, ultima: null, stato: 'attivo', tipo_errore: 'confusione' }
] };
const a8 = qe.planTraining(mem8, 6);
eq('unico tema riempie il piano', a8.length, 6);
ok('unico tema: rotazione tipi (non tutti uguali)', new Set(a8.map(x => x.tipo)).size >= 2);

// 9. Quota nuovi distribuita.
const a9 = qe.planTraining(mem1, 6, {
  blueprint: [{ argomento: 'N1', importanza: 3 }, { argomento: 'N2', importanza: 2 }, { argomento: 'N3', importanza: 1 }],
  domandeNuove: 2
});
const nuov = a9.filter(x => x.motivo === 'nuovo-argomento');
eq('quota nuovi = 2', nuov.length, 2);
ok('nuovi da argomenti freschi', nuov.every(x => x.argomento === 'N1' || x.argomento === 'N2' || x.argomento === 'N3'));
ok('nuovi non raggruppati', Math.abs(a9.indexOf(nuov[0]) - a9.indexOf(nuov[1])) > 1);

// 10. Fallback senza memoria: pilastri del programma IN ORDINE di importanza.
const a10 = qe.planTraining(null, 4, {
  blueprint: [{ argomento: 'P1', importanza: 3 }, { argomento: 'P2', importanza: 2 }, { argomento: 'P3', importanza: 1 }, { argomento: 'P4', importanza: 1 }]
});
eq('fallback riempie tutto', a10.length, 4);
ok('fallback motivo primo-allenamento', a10.every(x => x.motivo === 'primo-allenamento'));
eq('fallback primo = pilastro più importante', a10[0].argomento, 'P1');
eq('fallback secondo = secondo per importanza', a10[1].argomento, 'P2');
ok('fallback pilastri unici', new Set(a10.map(x => x.argomento)).size === 4);

// 11. Nessuna memoria, nessun blueprint → [].
eq('niente memoria niente blueprint', qe.planTraining({}, 4), []);

// 12. Continuità di sessione: usedCountByTema alimenta il cap (§23.3).
// Contabilità ha già 1 slot nella sessione → nel piano (n=4, cap 2) può
// riceverne al massimo 1, non 2.
const a12 = qe.planTraining(mem1, 4, { usedCountByTema: { 'Contabilità': 1 } });
const cnt12 = {};
a12.forEach(x => { cnt12[x.argomento] = (cnt12[x.argomento] || 0) + 1; });
ok('sessione: cap considera gli slot già usati', (cnt12['Contabilità'] || 0) <= 1);

// 13. Edge: n=0.
eq('allenamento n=0', qe.planTraining(mem1, 0), []);

console.log('=== VALIDAZIONE ===');

// 13. Domanda buona.
const v1 = qe.validateQuestion({ testo: 'Il principio di legalità: da quale articolo deriva?', tipo: 'esposizione', argomento: 'Diritto', difficolta: 2 });
eq('valida buona', v1, { valid: true, issues: [] });

// 14. Regole rotte.
ok('valida "elencare" vietato', !qe.validateQuestion({ testo: 'Elencare i principi della PA?', tipo: 'esposizione', argomento: 'Diritto', difficolta: 1 }).valid);
ok('valida doppia domanda', !qe.validateQuestion({ testo: 'Cos\'è X? E Y?', tipo: 'esposizione', argomento: 'Diritto', difficolta: 1 }).valid);
ok('valida asterischi', !qe.validateQuestion({ testo: '**Cos\'è X?**', tipo: 'esposizione', argomento: 'Diritto', difficolta: 1 }).valid);
ok('valida testo corto', !qe.validateQuestion({ testo: 'X?', tipo: 'esposizione', argomento: 'Diritto', difficolta: 1 }).valid);
ok('valida testo lungo', !qe.validateQuestion({ testo: 'q '.repeat(200) + '?', tipo: 'esposizione', argomento: 'Diritto', difficolta: 1 }).valid);
ok('valida tipo fuori insieme', !qe.validateQuestion({ testo: 'Cos\'è X?', tipo: 'quiz', argomento: 'Diritto', difficolta: 1 }).valid);
ok('valida difficoltà fuori range', !qe.validateQuestion({ testo: 'Cos\'è X?', tipo: 'esposizione', argomento: 'Diritto', difficolta: 5 }).valid);
const v2 = qe.validateQuestion({ testo: 'Cos\'è X?', tipo: 'esposizione', argomento: 'Roba', difficolta: 2 }, { argomenti: ['Diritto', 'Contabilità'] });
ok('valida argomento fuori programma', !v2.valid && v2.issues.join('').indexOf('fuori programma') !== -1);
ok('valida oggetto nullo', !qe.validateQuestion(null).valid);
// Normalizzazione: caso e spazi non devono causare falsi rifiuti.
ok('valida argomento case-insensitive', qe.validateQuestion({ testo: 'Cos\'è X?', tipo: 'esposizione', argomento: 'diritto', difficolta: 2 }, { argomenti: ['Diritto'] }).valid);
ok('valida argomento con spazi extra', qe.validateQuestion({ testo: 'Cos\'è X?', tipo: 'esposizione', argomento: 'Diritto  amministrativo', difficolta: 2 }, { argomenti: ['Diritto amministrativo'] }).valid);

console.log('\n=== RISULTATO: ' + pass + ' PASS, ' + fail + ' FAIL ===');
process.exit(fail ? 1 : 0);
