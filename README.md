# uzbekify (v3) — the uzbek-humanizer successor

`uzbekify` is the package name; the CLI answers to both `uzbekify` and
`uzpro`. The v1 skill (`uzbek-humanizer`) stays unmodified in
`reference-v1/` as the benchmark baseline.

## Install (zero friction)

```bash
npm install -g uzbekify   # postinstall auto-detects your agents and wires the skill
uzbekify init             # or run it explicitly: --all, --dry-run, --force, --agent <id>
npx uzbekify init         # alternative without a global install
```

Detected targets: Claude Code, Cursor, Codex, Windsurf, Gemini CLI, Copilot.
Each gets the skill folder (SKILL.md + references + playbooks + examples),
an AGENTS.md / rules / instructions snippet, and MCP config where supported
(`uzpro-mcp`, stdio). Idempotent, CI-safe, never fails an install. Fully
offline, no API keys; `uzpro lint` starts in ~70 ms. JSON output is stable
and documented in `schemas/`.

**CORE MISSION:** AI models write robotic Uzbek because they learned from
Wikipedia and officialese. The single goal of uzbek-humanizer-pro is Uzbek
that sounds like a **real human Uzbek** wrote it. Voice targets come from
real informal text (chats, comments, reviews, spoken-style writing).
Wikipedia/news are spelling-and-vocabulary sources only, never a model of
how to sound. Government sites (gov.uz, lex.uz, president.uz, my.gov.uz —
corpus in `research/gov-corpus/`, findings in `research/FINDINGS.md`) supply
both the correct formal register (only when the user needs formal text) and
the mined bank of bureaucratic robotic patterns that the linter flags and
rewrites in every non-official register.

Toolchain: one TypeScript CLI (`uzpro`), 250-row calque bank, a
Cyrillic⇄Latin transliterator that handles the hard cases, 13 linter
families (including the register-scoped **officialese** family), a 0–100
naturalness score with a **human-voice bonus**, and an eval bakeoff that
runs **v1's own linters and v2's on the same sets**.

## Benchmark

Two complementary evaluations, both reproducible:

1. **Rule-based bakeoff** ([EVAL_RESULTS.md](EVAL_RESULTS.md)): v2 catches **99.8%** of 408 planted errors vs v1's **27.0%**, with **0.0% false positives** vs v1's 0.3%; Cyrillic→Latin transliteration 100% (v1 has no tool); golden-FP parity (0.9% = 0.9%).
2. **LLM benchmark** ([BENCHMARK.md](benchmark/BENCHMARK.md)): 4 independent fresh held-out sets (840 task outputs generated, 840 blind pairwise judgments by a same-model judge, items sha256-frozen). Automatic metrics all favor v2 (zero dashes vs v1's 0.26-0.48/text; 0.01 vs 0.4 v2-lint findings; 0 apostrophe errors). **Honest blind-preference verdict: v1 and v2 are at rough parity (~46-56% v2 win rates, CIs overlapping 50%) — v2 does NOT reach a 70% blind win bar against v1, and we report that as measured.** v2 wins blind where structure matters (formal letters up to 93-100%, news, RU→UZ); v1 wins some short-marketing rows. Hard-tier pass: v2 71.7% = v1 71.7% in the final round (target 85% not reached under strict judging).

Both linter sets ran on identical inputs: all v1 eval sets (226 cases, 226
goldens, adversarial traps — ported verbatim) plus 320 new bad/good pairs and
52 transliteration pairs (372 new cases total).

| Metric | v1 (uzbek-humanizer) | v2 (uzbek-humanizer-pro) |
|---|---|---|
| New-set error detection (368 bad inputs) | 29.3% | **99.7%** |
| v1's own rewrite-case inputs (73) | 47.9% | **71.2%** |
| False positives on 368 good inputs | 0.3% | **0.0%** |
| False positives on v1's 226 goldens | 0.9% | **0.9%** (same 2 Cyrillic-output goldens) |
| Cyrillic→Latin transliteration (52 hard cases) | no tool | **100%** |
| Score rewards human text | no score | **98.1%** of pairs: human version scores higher (avg 100.0 vs 91.3) |
| Linter families | 5 scripts | **13 families + score** |
| Calque-bank entries | ~62 | **250 rows** (RU-structure, connectors, ceremony, guards) |
| Gov robotic-pattern bank | none | **40+ patterns, register-scoped** |
| Unit tests | 1 file (normalize) | **262 tests: linters + MCP + i18n/SARIF + aitell + init×6 + postinstall + pack + red-team + CLI edges** |

Where each side wins: v2 catches Russian-structure calques (6%→100%),
legal/marketing translationese (18–22%→100%), suffix-chain and harmony errors
(51%→100%), Cyrillic leaks, code-mixed garbage, and every apostrophe class.
v1 remains comparable only on its original EN-slang list. The single v2 miss
(1/320) is a phone-formatting case deliberately left unlinted after it
flagged v1's own curated golden.

## Before / after (what the skill does to AI Uzbek)

### Seed — the classic AI paragraph

**Bad** (score 30/100 → 10 findings):
> Men haqiqatan ham bu ilovani yoqtiraman. To'g'ri javobni select qiling.
> Guruh ishi chiqmadi — nima qilasan? Karoche, update qilib qo'y.

**Good** (score 100/100):
> Bu ilova menga juda yoqadi. Toʻgʻri javobni belgilang. Guruh ishi
> oʻxshamadi — nima qilasiz? Qisqasi, yangilab qoʻying.

What changed: `Men … yoqtiraman` → `menga yoqadi` (calque), `to'g'ri` →
`toʻgʻri` + `select qiling` → `belgilang` (script + EN verb), `chiqmadi` →
`oʻxshamadi` (situation verb), `-san` → `-siz` (register lane), `karoche` →
`qisqasi`, `update qilib` → `yangilab`.

### Russian-structure officialese

**Bad** (v1 misses everything here):
> Hisobot menejer tomonidan yuborildi. Narxlar oshdi, muvofiq ravishda
> xarajatlar ham oshdi. Katta eʼtibor berildi.

**Good**:
> Menejer hisobotni yubordi. Narxlar oshdi, xarajatlar ham oshdi. Eʼtibor
> qaratildi.

What changed: `tomonidan + passive` double marking → active;
`muvofiq ravishda` (RU соответственно) cut; `katta eʼtibor berildi` (RU
уделено большое внимание) → `eʼtibor qaratildi`.

### Suffix soup

**Bad**:
> Biz doʻstlarimizning fikrlarinigaga qarab qaror qildiklar va
> kitobimizlarni qishloqga olib bordik.

**Good**:
> Doʻstlarimizning fikrlariga qarab qaror qildik va kitoblarimizni
> qishloqqa olib bordik.

What changed: `fikrlarinigaga` double-case soup → `fikrlariga`;
`qildiklar` plural-on-verb → `qildik`; `kitobimizlarni` possessive+plural →
`kitoblarimizni`; `qishloqga` → `qishloqqa` (dative assimilation).

### Cyrillic input

```
$ printf 'Тошкентда ешикни очиб, объект қурилди — функция ва konsert ҳам бўлди.' | uzpro translit -
Toshkentda yeshikni ochib, obyekt qurildi — funksiya va konsert ham boʻldi.
```

ешик → yeshik (initial е), объект → obyekt (ъ before е), функция → funksiya
(ция→siya), консерт → konsert (lexical ц→s).

### Officialese → human (the CORE MISSION pair)

**Bad** (gov-robot register, mined from lex.uz/gov.uz):
> Mazkur xizmatdan foydalanish uchun ariza belgilangan tartibda
> topshirilishi lozim. Ushbu imkoniyat orqali maʼlumotlaringizni
> yangilashingiz mumkin.

**Good** (how a person — and my.gov.uz's own UI — writes):
> Bu xizmat uchun ariza yozing. Maʼlumotlaringizni shu yerda yangilab
> qoʻyasiz.

What changed: mazkur→bu, ushbu→(cut), belgilangan tartibda topshirilishi
lozim→ariza yozing, imkoniyat orqali…mumkun→shu yerda…qoʻyasiz.

### UI microcopy

**Bad:** `Loading boʻlmoqda. Parolni unutdingizmi? Yangisini soʻraysanmi?`
**Good:** `Yuklanmoqda… Parolni unutdingizmi? Yangisini soʻraysizmi?`

### Marketing

**Bad:** `Hayotingizni transformatsiya qiling — minglab odamlar tanlagan eng
yaxshi tajriba!`
**Good:** `Ishlaringizni yengillashtiring — koʻpchilik ishlatib koʻrgan.`

## The skill (skills/uzbekify/)

- `SKILL.md` — an 8-step rewrite ladder: detect register → fix script/marks
  → kill calques (EN + RU structure) → restore SOV word order → fix suffix
  chains & aspect → pick native synonyms → check rhythm → machine self-check.
- `references/` — 18 files, led by `human-voice.md` (the CORE MISSION voice
  target + the gov-robotic blacklist): calque-bank (250 rows, each
  bad/good/why),
  register presets (8 incl. academic, news body, legal-lite), word order,
  morphology & harmony, aspect/modality, synonym taste matrices, false
  friends, idioms & connectors, loanword policy, transliteration spec,
  orthography, literalness patterns, UI glossary, politeness, youth/Telegram,
  formatting, domain packs.
- `examples/` — clean worked examples that the test suite lint-checks.

## Research corpus + agent superpowers (phase 2)

- **Web corpus** (`research/corpus/`, 27 files with per-file source URLs):
  uz.wikipedia.org via the MediaWiki API (16 plaintext extracts), kun.uz
  article bodies (Latin, incl. the 2026 alphabet-reform law coverage),
  gazeta.uz + daryo.uz RSS. Uzbek Wikisource is closed (noted in
  `sources.md`). Mined by `npm run mine` → frequencies, collocations,
  connector ranking, suffix profile and sentence-length baselines
  (`research/corpus-mining/`), distilled into `src/data/corpus-stats.json`
  that `uz_score` and synonym ranking use. Spelling/vocabulary ONLY — never a
  voice model (CORE MISSION; see `research/FINDINGS.md`).
- **MCP server** (`npm run mcp` / bin `uzpro-mcp`, stdio): `uz_lint`,
  `uz_rewrite_plan` (the 8-step ladder with line/column spans), `uz_score`,
  `uz_translit`, `uz_glossary_lookup`, `uz_calque_check`,
  `uz_synonym_suggest` (ranked by corpus frequency).
- **CI outputs**: `uzpro lint --format sarif` (SARIF 2.1.0), GitHub Action
  `.github/workflows/uzpro.yml`, pre-commit hook `scripts/hooks/pre-commit`
  (+ `.pre-commit-hooks.yaml`).
- **i18n + batch**: `uzpro lint locales/ --i18n` lints json/yaml/po files key
  by key (non-Uzbek locales skipped); directories lint in batch mode.
- **Playbooks** (`skills/uzbekify/playbooks/`): UI microcopy,
  marketing, Telegram posts, formal letters, EN/RU→Uzbek translation, and the
  agent self-check loop (draft → score → fix → repeat until ≥ 90).

## Red-team hardening (phase 4)

100 new adversarial cases written to break v2 — 61 misses (officialese
variants like *amaldagi qonunchilikka muvofiq*, *ijrosi taʼminlandi*,
*barpo etildi*; chat ceremony like *"Sizning murojaatingiz uchun
minnatdorman"*; dash/semicolon patterns) and 39 false-positive targets
(v1's own native-verified " - " usage, news "— tafsilotlar" headline style,
legal semicolons, formal mazkur/ushbu, EN-only sentences, clipped chat).
Every case initially defeated v2; after the fixes **v2 handles 100/100**
(v1: 35/100). Full set: `skills/uzbekify/eval/v2/pairs-redteam.jsonl`,
results in EVAL_RESULTS §4a.

Key recalibrations, grounded in the corpora (52 "—" in real Telegram posts,
21 in kun.uz; " - " in v1's own goldens): the no-dash rule stays a hard
OUTPUT policy (humanize rewrites them), while the input lint is
register-calibrated — em-dash errors in casual copy, skipped where attested
(news/legal/academic/official); " - " chat-only; semicolons skipped in legal
prose; officialese Tier A skipped in document registers; passive report
verbs formal-tolerant; EN-only sentences no longer trip Uzbek rules. Also
fixed: `Sinab koʻring` false-flagged as a bare imperative, passive double
counting, and the informal-chat "Tez, sodda va foydali" triple now passes.

**Golden false positives: v2 is now at v1's exact level (0.9%, the same 2
Cyrillic-output goldens v1 itself flags), and the combined FP index is
lower than v1's (0.9 vs 1.1).**

## Real informal chat (phase 2b — the core-mission phase)

- **`research/informal-corpus/`**: 6 Uzbek Telegram channels (t.me/s/), real
  quoted speech from kun.uz, and v1-attested review/comment voice, anonymized,
  with honest collection constraints (uforum.uz unreachable; news comments
  JS-gated). Mined in `MINING.md`: real chat types o‘ 56× vs oʻ 12×, glues
  particles (-ku, -chi, -yov), drops subjects, code-switches (kk, bn, udalit,
  donat) and writes raw numbers.
- **`references/informal-chat.md`**: 15 real anonymized messages each paired
  with its robotic AI twin ("nma qilsam boladi" vs "Men bu vaziyatda qanday
  harakat qilishim kerak?"), plus the chat grammar of real people.
- **`chat` register** + Telegram DM playbook; **`aitell` linter family**:
  the no-dash policy (—, –, " - " are errors in EVERY register), semicolons
  (error in chat), bullet lists in chat, 15+ word chat sentences, formal
  connectors (shuningdek, binobarin, xususan, jumladan), stacked adjectives,
  too-perfect punctuation, translated English AI tics, and 7 robotic-chat
  phrasing patterns.
- **Eval**: `pairs-informal.jsonl` (40 robotic-vs-real chat pairs). v1
  detects 5% of them, v2 100%. Overall: 408 pairs, 99.8% detection, 0
  good-side FPs; the 4 new v1-golden flags are the intentional no-dash/
  no-semicolon policy, disclosed in EVAL_RESULTS §3.

## The CLI

```bash
npm install
npm run build
npm test          # 262 unit tests
npm run mine      # re-mine research/corpus → src/data/corpus-stats.json
npm run gen:data  # regenerate glossary/calque/synonym data from references
npm run mcp           # MCP server (stdio) for agents
npm run mine:informal  # re-mine research/informal-corpus
npm run eval      # v1 vs v2 bakeoff → EVAL_RESULTS.md

node dist/cli.js lint   file.md [--json] [--allow-sen] [--register R] [--min N]
node dist/cli.js normalize file.md --write
node dist/cli.js translit  cyr.txt [--to cyrillic]
node dist/cli.js score    file.md --min 90
node dist/cli.js diff     before.md after.md
```

Linter families: orthography · calque (EN+RU) · russianism · **officialese
(register-scoped gov-pattern bank)** · register (Siz/sen) · suffix chains &
harmony · passive overuse · loanwords · cadence · literalness · word order ·
screen consistency · formatting. Every finding names its rule and the fix;
`score` explains every deduction and adds the human-voice bonus.

## Repo layout

```
skills/uzbekify/   # the v2 skill (SKILL.md, references, src, tests, eval)
research/gov-corpus/          # gov.uz/lex.uz/president.uz/my.gov.uz corpus + URL manifest
research/FINDINGS.md          # robotic-pattern bank + human-voice markers (CORE MISSION)
reference-v1/                 # v1, untouched — read-only baseline
NOTES/v1-audit.md             # v1 weakness audit that drove every v2 change
EVAL_RESULTS.md               # generated by `npm run eval`
```

## Apostrophe convention (identical to v1)

oʻ/gʻ = `ʻ` (U+02BB); tutuq = `ʼ` (U+02BC). Brand + case suffix stays tutuq
(`Goʼda`, `PUBGʼga`). Inbound ö/ğ/ş/ç and curly quotes normalize to the
current alphabet; nothing in the pipeline emits reform letters.

## Honesty notes

- The eval bakeoff compares *tools* (v1's five lint scripts vs `uzpro lint`)
  on the same texts — it does not compare end-to-end rewrite quality, which
  still needs a native-speaker pass for high-stakes content.
- v1 goldens that are Cyrillic outputs are flagged by both toolsets as
  "Cyrillic leak" when linted as Latin text; that is reported, not hidden.
- The single v2 false-positive class v1 also has (brochure openers) was
  narrowed to v1 parity deliberately.
