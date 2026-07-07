import os, sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TARGET = os.path.join(SCRIPT_DIR, 'simulation.html')

with open(TARGET, 'r', encoding='utf-8') as f:
    content = f.read()

patches = []

# 1. Chip line in updateStartState: animateCountChip wiring
o1 = "      if (selectedBandiCount) selectedBandiCount.textContent = count === 1 ? '1 selezionato' : count + ' selezionati';"
n1 = "      animateCountChip(count);"
c = content.count(o1); content = content.replace(o1, n1); patches.append(('chip_line_animate', c))

# 2. Click handler spark effect: 9x scale + prefers-reduced-motion guard
o2 = "          gsap.fromTo(spark, { scale: 0.4, opacity: 0.9, boxShadow: '0 0 0 0 rgba(37,99,235,.30)' }, { scale: 1.8, opacity: 0, boxShadow: '0 0 0 18px rgba(37,99,235,0)', duration: 0.45, ease: 'power2.out', onComplete: () => spark.remove() });"
n2_lines = [
    "          var _prm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;",
    "          if (!_prm) {",
    "            gsap.fromTo(spark, { scale: 0.5, opacity: 1, boxShadow: '0 0 0 0 rgba(37,99,235,.42)' }, { scale: 9, opacity: 0, boxShadow: '0 0 0 32px rgba(37,99,235,0)', duration: 0.42, ease: 'power2.out', onComplete: () => spark.remove() });",
    "          } else {",
    "            spark.remove();",
    "          }",
]
n2 = '\n'.join(n2_lines)
c = content.count(o2); content = content.replace(o2, n2); patches.append(('spark_9x_prm_guard', c))

# 3. Helpers v3 inserted BEFORE window.addEventListener('DOMContentLoaded', init)
helpers_lines = [
    "    function maybeLastSimulated(id) {",
    "      try {",
    "        var history = JSON.parse(localStorage.getItem('concorsoai_history') || '{}');",
    "        if (history && history[id]) return relativeBandoDate(history[id]);",
    "      } catch (_) {}",
    "      return null;",
    "    }",
    "    var prevBandoCount = 0;",
    "    function animateCountChip(newCount) {",
    "      if (!selectedBandiCount) return;",
    "      selectedBandiCount.textContent = newCount === 1 ? '1 selezionato' : newCount + ' selezionati';",
    "      if (newCount !== prevBandoCount) {",
    "        selectedBandiCount.classList.remove('chip-bump');",
    "        void selectedBandiCount.offsetWidth;",
    "        selectedBandiCount.classList.add('chip-bump');",
    "      }",
    "      prevBandoCount = newCount;",
    "    }",
    "    var bandoStateObserver = new MutationObserver(function (muts) {",
    "      muts.forEach(function (m) {",
    "        var el = m.target;",
    "        if (el && el.classList && el.classList.contains('bando-card')) {",
    "          el.setAttribute('aria-checked', String(el.classList.contains('active')));",
    "        }",
    "      });",
    "    });",
    "    function attachBandoObserver() {",
    "      bandoStateObserver.disconnect();",
    "      var cards = document.querySelectorAll('.bando-card');",
    "      cards.forEach(function (c) {",
    "        c.setAttribute('aria-checked', String(c.classList.contains('active')));",
    "        bandoStateObserver.observe(c, { attributes: true, attributeFilter: ['class'] });",
    "      });",
    "    }",
    "",
    "    window.addEventListener('DOMContentLoaded', init);",
]
helpers_text = '\n'.join(helpers_lines)
o4 = "    window.addEventListener('DOMContentLoaded', init);"
c = content.count(o4); content = content.replace(o4, helpers_text); patches.append(('helpers_v3_block', c))

with open(TARGET, 'w', encoding='utf-8') as f:
    f.write(content)

print('PATCH SUMMARY for', TARGET)
all_ok = True
for name, count in patches:
    status = 'OK' if count >= 1 else 'MISS'
    if count < 1:
        all_ok = False
    print(f'  {name}: {count}x [{status}]')

print('STATUS:', 'SUCCESS' if all_ok else 'PARTIAL FAIL — alcuni anchor non hanno matchato')
sys.exit(0 if all_ok else 1)
