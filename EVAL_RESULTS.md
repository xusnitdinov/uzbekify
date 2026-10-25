# EVAL RESULTS — uzbek-humanizer (v1) vs uzbekify (v2)

Generated: 2026-10-24T19:31:09.514Z

## 1. v1 eval sets reused (ported verbatim into `skills/uzbekify/eval/v1/`)

| File | Rows | Schema OK |
|---|---|---|
| adversarial-calques.jsonl | 10 | yes |
| bakeoff-items.jsonl | 13 | yes |
| cases.jsonl | 226 | yes |
| goldens.json | 226 | yes |
| human-likeness.jsonl | 20 | yes |
| mixed-script-traps.jsonl | 12 | yes |
| pairwise.jsonl | 28 | yes |
| register-traps.jsonl | 10 | yes |
| synonym-traps.jsonl | 10 | yes |
| trigger-queries.json | 32 | yes |

## 2. v1 `cases.jsonl` rewrite inputs (error-injection detection, n=73)

| Linter set | Detected | Rate |
|---|---|---|
| v1 (5 scripts) | 35 | 47.9% |
| v2 (uzpro lint) | 48 | 65.8% |

## 3. v1 goldens — false positives on 226 curated good outputs (v2 lints each in its intended register)

| Linter set | Flagged | FP rate | Notes |
|---|---|---|---|
| v1 | 2 | 0.9% | cyrillic-aware, cyrillic-mixed |
| v2 | 2 | 0.9% | cyrillic-aware [product]: screen.cyrillic-leak; cyrillic-mixed [product]: screen.cyrillic-leak |

## 4. New v2 pair sets — bad-input detection (higher is better)

| Set | n | v1 detect | v2 detect | v1 rate | v2 rate |
|---|---|---|---|---|---|
| codemixed | 40 | 22/40 | 40/40 | 55.0% | 100.0% |
| core | 65 | 33/65 | 65/65 | 50.8% | 100.0% |
| humanvoice | 48 | 0/48 | 48/48 | 0.0% | 100.0% |
| informal | 40 | 2/40 | 40/40 | 5.0% | 100.0% |
| legal | 40 | 7/40 | 40/40 | 17.5% | 100.0% |
| marketing | 45 | 10/45 | 45/45 | 22.2% | 100.0% |
| microcopy | 45 | 15/45 | 44/45 | 33.3% | 97.8% |
| russian | 50 | 3/50 | 50/50 | 6.0% | 100.0% |
| youth | 35 | 18/35 | 35/35 | 51.4% | 100.0% |
| **TOTAL** | 408 | 110 | 407 | **27.0%** | **99.8%** |

## 5. New v2 pair sets — good-input false positives (lower is better)

| Set | n | v1 FP | v2 FP | v1 FP rate | v2 FP rate |
|---|---|---|---|---|---|
| codemixed | 40 | 0 | 0 | 0.0% | 0.0% |
| core | 65 | 1 | 0 | 1.5% | 0.0% |
| humanvoice | 48 | 0 | 0 | 0.0% | 0.0% |
| informal | 40 | 0 | 0 | 0.0% | 0.0% |
| legal | 40 | 0 | 0 | 0.0% | 0.0% |
| marketing | 45 | 0 | 0 | 0.0% | 0.0% |
| microcopy | 45 | 0 | 0 | 0.0% | 0.0% |
| russian | 50 | 0 | 0 | 0.0% | 0.0% |
| youth | 35 | 0 | 0 | 0.0% | 0.0% |
| **TOTAL** | 408 | 1 | 0 | **0.2%** | **0.0%** |

## 6. Cyrillic → Latin transliteration (52 hard-case pairs)

| Tool | Correct | Rate |
|---|---|---|
| v1 | 0 | — (v1 has no transliterator) |
| v2 (uzpro translit) | 52/52 | 100.0% |

## 4a. Red-team adversarial set (phase 4: 100 cases that initially broke v2)

| Tool | Handled | Rate |
|---|---|---|
| v1 | 35/100 | 35.0% |
| v2 after red-team fixes | 100/100 | **100.0%** |

## 4b. Naturalness score rewards human text (CORE MISSION)

| Metric | Value |
|---|---|
| Pairs where human version scores higher | 401/408 (98.3%) |
| Average score — robotic/bad inputs | 90.8 |
| Average score — human/good inputs | 100.0 |
| Total human-voice bonus earned — bad vs good | 56 vs 60 points |

## 7. Score ordering sanity (bad has more findings than good)

| Metric | Value |
|---|---|
| Pairs where bad > good findings | 405/408 (99.3%) |

## 8. Verdict

| Metric | v1 | v2 |
|---|---|---|
| Combined detection index | 74.9 | 165.5 |
| Combined FP index | 1.1 | 0.9 |

v2 beats v1 on detection: **YES**; v2 FP not worse than v1 (+2pt tolerance): **YES**; translit ≥95%: **YES**; v1 sets reused: **10 files**; schema issues: **0**.

## 9. Tooling powered by the corpus (phase 2)

| Capability | Status |
|---|---|
| Web corpus (uz.wikipedia ×16, kun.uz ×11, gazeta.uz + daryo.uz RSS) | 63,490 Latin tokens mined |
| Sentence-length baseline (validates the cadence threshold) | median 10, p95 28 words |
| MCP server (uz_lint, uz_rewrite_plan, uz_score, uz_translit, uz_glossary_lookup, uz_calque_check, uz_synonym_suggest) | uzpro-mcp (stdio) |
| SARIF 2.1.0 output for CI | uzpro lint --format sarif (+ GitHub Action uploading the artifact) |
| i18n mode (json/yaml/po key by key) + batch folders | uzpro lint <dir> --i18n |
| Playbooks (UI, marketing, Telegram, formal letters, EN/RU translation) + agent self-check loop | skills/uzbekify/playbooks/ |
| Informal corpus (6 Telegram channels + quoted speech + review voice, anonymized) | research/informal-corpus/ (phase 2b) |
| aitell family: no-dash policy, chat tells, robotic-chat patterns | uzpro lint --register chat |

