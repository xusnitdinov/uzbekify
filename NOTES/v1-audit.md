# v1 audit — uzbek-humanizer (reference-v1, v1.6.0)

What was studied: `skills/uzbek-humanizer/SKILL.md`, all 33 files in `references/`,
all 10 scripts in `scripts/`, all 14 files in `eval/` (cases.jsonl 226 cases,
goldens.json, 4 adversarial trap sets, trigger-queries, bakeoff, pairwise,
human-likeness, live-bakeoff fixtures), `examples/`, and the repo-level test that
exists (`tests/normalize-apostrophe.test.mjs`). v1's own eval suite was run and
passes (226/226, all gates green) — that is the baseline v2 must beat.

## 1. Calque coverage gaps

Counting v1's actual calque/error entries across `banned-calques.md` (21 rows),
`rusizmlar.md` (11), `false-friends.md` (6), `mt-failures.md` (14), and the
REWRITE table in `loanword-policy.md` (10): **~62 entries total**. Gaps:

- **No Russian-structure calque bank at all.** `rusizmlar.md` covers discourse
  fillers (karoche/normalni/kruto/chotki/tipa/vapshe) and 6 colloquial nouns
  (zakaz/skidka/plastik/mashennik/nomer/udalit). Nothing on structural
  Russianisms that dominate Uzbek officialese and MT output: `muvofiq
  ravishda` (соответственно) as a connector, `oʻz navbatida` (в свою очередь),
  `hozirgi kunda` (в настоящее время) as filler, `katta eʼtibor berildi`
  (уделено большое внимание), `amalga oshirildi` chains, `boʻyicha` spam,
  `belgilab berildi` / `ochib berildi` report verbs, `mavjud emasligi`
  double-negation syntax, `-dan iborat` overuse.
- **English-structure calques limited to internet slang** (ship/vibe/portladi/
  teammate/systems brain). Missing the most frequent MT calque classes:
  light-verb + infinitive (`yopishga qarshi emasmisiz` class is caught, but
  `boshlash uchun boshlashingiz mumkin` recursion, `boʻlishi mumkin boʻlgan`
  stacking, `har qanday` for every "any", `shu bilan birga` for "meanwhile"),
  passive cliche openers, "in order to" → `-ish uchun` chains, "not only…but
  also" calques, "one of the most" → `eng ... lardan biri` overuse.
- **No calque entries for connectors**: v1 has zero coverage of natural Uzbek
  discourse connectors vs calqued ones (`shuning uchun` vs `shu sababli` taste,
  `bundan tashqari` vs RU-style `kromye togo` patterns).
- Roughly a third of v1 entries are one product (a career-quiz app "Oria") —
  `oria-career-quiz.md` (86 lines) + `oria-goldens.md` + 4 eval cases. Narrow
  taste evidence generalized to all copy.

## 2. Register handling

- 10 presets exist, but **5 of 10 are 4–8 lines of prose** (`register-presets.md`
  §8–10). `news-headline` is 4 lines; there is **no academic preset at all**, no
  legal-lite (plain-language contract) preset distinct from "legal-soft-draft",
  no HR/job-posting register.
- **v1's own preset file violates v1's orthography rule**: `register-presets.md`
  contains the U+2018 curly quote **50 times** (`ko‘rinadi`, `yo‘l`,
  `bo‘lsa`…), while `orthography.md` says output must use U+02BB (ʻ) and treats
  U+2018 as an inbound variant to normalize. An agent copying preset examples
  verbatim produces output that v1's own `lint-stiff` / `normalize` flags.
  Same problem in `context-synonyms.md` (7×), `oria-career-quiz.md` (8×),
  `oria-goldens.md` (6× U+2019).
- Register detection is a "preset selector" the model must guess; the workflow
  has no explicit "detect register + audience from the source text" step, and no
  rule for what to do when the input itself mixes registers (only the Siz/sen
  one-lane rule).
- Youth/Telegram register is gated "only when asked" but the actual guidance
  (`youth-slang.md`, 125 lines) is mostly a glossary with **no sentence-level
  examples of correct youth-register rewrites**, and it is marked draft-only,
  so the skill effectively cannot serve a requested youth tone with confidence.

## 3. Morphology / suffix errors

`morphology-checks.md` is 41 lines with **6 example errors**. Gaps:

- **No vowel-harmony table.** The only harmony statement anywhere is implicit
  in one lint rule (`kitoblerimiz → kitoblarimiz`). No table of front/back
  vowels, no statement of which suffixes alternate (`-lar/-ler`, `-inchni`?
  none given), no worked examples.
- **No consonant-alternation rules** (voiced→voiceless assimilation before
  suffixes, e.g. the `q/k + -ga/-ka/-qa` dative assimilation class, `p`
  devoicing in `boʻlib` → `b` class) — nothing.
- **No suffix-chain order table beyond one line** (`oʻzak + koʻplik + egalik +
  kelishik`). No list of illegal chains (`-ning-ning`, `-ga-ga`, case on a
  finite verb, `-imizlar` possessive+plural stacking) beyond the 6 examples.
- The only morphology linter rule is `morph-ler-back` (back-vowel stems with
  -ler) plus one word (`berdimga`). `berdimga`-class errors (case suffix on a
  finite verb) are caught **only for that single verb** — `qildimga`,
  `yozdimning`, `keldimga` etc. pass every v1 linter.
- Possessive agreement (`doʻstimning fikri` type) is described but never linted.

## 4. Synonym taste

- `context-synonyms.md` covers 8 "failed outcome" contexts, 8 emotion rows, 5
  politeness-strength rows, 5 certainty rows. Real coverage is thin: no
  synonym guidance at all for **news, academic, legal, HR** domains — the
  matrices are product/quiz-only.
- `native-preference-bank.md` (126 rows) is strong for product UI but is
  restricted to UI/chat/marketing/career-quiz surfaces.
- The `-san` verb enumeration in `lint-stiff` (`product-sen-asan`) lists only
  11 verb forms; `kutasan`, `tanlaysan`, `olasan`, `sevasan`, `bilasan`…
  are all missed. A morphological rule (any vowel + `san` ending, noun
  stoplist) would catch the class instead of 11 instances.

## 5. Word order

**v1 has no word-order reference file at all.** SOV is mentioned once in
`ai-patterns.md` ("Restore natural SOV: object before verb") and exercised by
exactly one eval case (`syntax-sov`). No coverage of:

- Time → place → manner ordering before the verb (`kecha kutubxonada kitobni
  oʻqidi`).
- Topicalization/`-ga kelsak`, `-boʻlsa` topic markers vs English left-dislocation.
- Question-word in-situ vs English wh-movement calques (`Nima qilasiz?` vs
  calqued fronted questions).
- Possessor–possessed order, genitive chains, demonstrative placement
  (`bu mening kitobim` vs `mening bu kitobim` taste).
- Adverbial clause placement (-ganda/-ganida clauses sentence-initial vs
  English trailing "when…" calques).

## 6. Mixed-script handling and Cyrillic input

- `cyrillic.md` gives **7 word pairs** and a 9-row pitfall table with no
  complete letter mapping. Crucially **no spec for ц, ё, ю, я, word-initial е,
  ь, ы, э, щ**, and no rule for `-ция → -siya` (even though v1's own files use
  `funksiya`), no `объект → obyekt` hard-sign rule.
- **v1 has no transliterator.** There is no way to actually convert Cyrillic
  input; the only tool touching script is `lint-screen-consistency.mjs`, which
  flags Cyrillic as a *leak* and exits 2. Cyrillic input therefore cannot be
  processed end-to-end by the scripts; the agent must hand-convert.
- The "convert the Cyrillic body only, keep Latin labels" trap (`adv-mix-12`)
  has no tool support — it is aspirational.
- `lint-screen-consistency` Cyrillic detection uses `[А-Яа-яЁё]{2,}` — misses
  Uzbek Cyrillic қ ғ ў ҳ entirely (a single-word Cyrillic Uzbek sentence with
  `ў` and `ҳ` but no Russian letters in the first 2 chars can slip through…
  and worse, `[А-Яа-яЁё]{2,}` does not match Cyrillic Uzbek letters at all, so
  `ўзбекча` alone is not flagged).

## 7. Slang

`youth-slang.md` is a ~30-item glossary + warnings, all draft. No attested
full-sentence youth rewrites, no Telegram-specific conventions (emoji timing,
`yozamiz` vs `yozamz` typing style, `aku/opa` address), no RU-matrix for which
Russian loans are live in Tashkent speech vs dated. No slang *detector* either:
`karoche`/`normalni`/`kruto`/`chotki` are caught (4 words), but `ladno`,
`blin`, `poka`,`spasibo`-style Cyrillic-inserted slang, `zashkvar`, `krinzh`,
`rilt`, `stalker`… are not (only relevant for detecting user-voice, still
useful for RU-density scoring).

## 8. Domain coverage

Present: product UI, quiz/DTM, bank/OTP, legal-soft, medical-soft, marketing,
support, news-headline (thin), career quiz. Missing entirely: **academic**
(annotations, thesis prose, `mintaqa`, citation phrases), **legal-lite**
(T&C/consummable plain-language legal, distinct from disclaimer-only), **HR/job
postings**, **e-commerce product descriptions**, **news body copy** (only
headlines), **technical documentation**. The eval `cases.jsonl` mirrors this:
37 buckets but zero academic, zero Cyrillic-input, zero news-body, zero
legal-lite cases.

## 9. SKILL.md clarity for agents

- **11 hard rules + 19 gotchas + 2 checklists + output template before any
  procedure.** The actual rewrite method is one workflow line ("Rewrite -
  natural UZ; situation verbs; Siz on product/quiz"). An agent gets a wall of
  prohibitions but **no ordered rewrite ladder** (script → calques → word
  order → morphology → synonyms → rhythm → self-check) — each pass v2 must
  make explicit.
- ~30% of SKILL.md is about the *sister skill boundary* (`uzbek-humanize`,
  slash routing, install notes, maintainer self-test) — noise for a successor
  skill that owns the whole job.
- The Router table sends agents to up to 4 files per scenario (16 files are
  one hop from the Router) with no stated priority if two refs conflict (and
  they do: preset examples with U+2018 vs orthography.md).
- Validation section lists 6 scripts with different CLIs (`--matn-only`,
  `--allow-sen`, `--whole-file` differ per script, `lint-banned` has no
  `--stdin`) — easy to misuse; no single entry point, no JSON output for
  programmatic use, no combined verdict.

## 10. Eval blind spots

1. **Self-scored goldens.** `goldens.json` (226 answers) was authored by the
   same model/person that wrote the expectations; `run-eval.mjs` mostly checks
   that goldens contain expected substrings. It measures agreement with
   itself, not quality. `human-likeness.jsonl` is self-reported 5/5 scores.
2. **No detection-rate measurement.** The linters are only run against 3
   hand-written `examples/*.md` files (which are clean). There is no eval that
   injects known errors and measures how many each linter catches — i.e. no
   recall/false-positive harness at all. This is the main blind spot v2's
   bakeoff closes.
3. **No Cyrillic bucket** in `cases.jsonl`; `mixed-script-traps.jsonl` (12
   rows) is schema-validated only (`id`, `input`, `trap` — the `expect` field
   is never checked by any code).
4. `run-live-bakeoff.mjs` / `run-pairwise.mjs` validate fixture schemas and
   thresholds; no model or human is in the loop despite "live" naming.
5. Linter coverage holes measured against v1's *own* banned list:
   `lint-stiff` misses most `-asan` forms (see §4); `lint-cadence` needs ≥6
   sentences so UI-length text is never cadence-checked; `register-mix-hint`
   allows any `\w+(san|asan)` within 80 chars of "Siz" — loose both ways
   (misses real mixes without a literal "Siz", false-positives on nouns like
   `tulisan`-shaped words… none checked).
6. Adversarial sets are validated for schema only — the traps are never
   actually executed against the linters/normalizer.
7. Only one unit-test file exists (`normalize-apostrophe.test.mjs`); the other
   9 scripts have zero tests.
8. No eval for transliteration (no transliterator to test), none for the
   suffix-chain / passive / loanword / Russianism classes (which v1 cannot
   lint at all).

## 11. Script-level issues (ported-and-fixed list for v2)

- No stdin for `lint-banned`/`lint-cadence`/`lint-literalness`/
  `lint-screen-consistency`; inconsistent flag sets per script; exit code 2
  conflates "findings" with "usage error".
- `lint-banned` and `lint-stiff` each report only the **first match** per rule
  (`text.match`, not `matchAll`) — repeated violations invisible.
- `lint-cadence` counts `\bkerak\b` ≥6 across a whole file — a 200-line
  multi-screen locale file hits this on perfectly good copy (false positive);
  sentence splitting ignores newlines/JSON structure.
- `lint-screen-consistency` Cyrillic regex misses Uzbek Cyrillic letters
  (қ ғ ў ҳ) — see §6.
- `normalize-apostrophe.mjs` is solid (good protection for EN segments, brands,
  reform letters) but: brand stoplist is 3 entries; `-ler` after front vowels
  is never validated; no `ъ`/Cyrillic awareness.
- Nothing scores text, nothing diffs before/after, nothing converts script.

## Summary table

| Area | v1 state | v2 target |
|---|---|---|
| Calque bank entries | ~62, EN-slang-heavy, no RU-structure section | 200+ (3x+), EN-structure + RU-structure + connector classes, each bad/good/why |
| Registers | 10 presets, 5 thin, no academic/news-body/legal-lite, self-inconsistent apostrophes | 8 full presets incl. academic, news body, legal-lite; all examples in canonical orthography |
| Morphology | 6 example errors, 2 lint patterns | full suffix-chain + harmony reference; suffix-chain linter (double case, verb+case, possessive stacking, harmony) |
| Word order | 2 lines, 1 eval case | dedicated reference (SOV, topicalization, questions, relative clauses) + SOV-lint |
| Cyrillic | 7 pairs, no ц/ё/ю/я/е/ъ/ь/щ/ы/э rules, no converter | full translit spec + tested transliterator (both directions) + Cyrillic-input eval bucket |
| Slang | glossary, draft-only, no sentences | attested sentence-level youth/Telegram guidance + RU-density detector |
| Linters | 5 scripts, first-match-only, no stdin parity, no score | single `uzpro` CLI, matchAll, JSON mode, 7 new linter families + 0–100 naturalness score with explanations |
| Eval | self-scored goldens, no recall/FP harness, no Cyrillic | all v1 sets ported + 300+ new cases; detection/FP bakeoff v1-vs-v2 → EVAL_RESULTS.md |
| Tests | 1 test file (normalize) | Vitest unit tests for every linter + transliterator + score + diff |
| SKILL.md | prohibition wall, no rewrite ladder, sister-skill noise | ordered 8-step rewrite procedure, one entry point, canonical examples |
