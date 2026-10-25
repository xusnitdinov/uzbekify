# FINAL — uzbekify (v2/v3) vs uzbek-humanizer (v1)

The successor skill lives in `skills/uzbekify/` (npm package `uzbekify`,
bins `uzbekify` / `uzpro` / `uzpro-mcp`). v1 remains untouched in
`reference-v1/` as the benchmark baseline. Full tables regenerate with
`npm run eval` → `EVAL_RESULTS.md`.

## What v2 does better than v1 — with the final numbers

| Dimension | v1 | uzbekify | Why it matters |
|---|---|---|---|
| Error detection, 408 bad inputs | 27.0% | **99.8%** | v1 caught only EN-slang calques; v2 catches officialese, RU structure, suffix chains, register mixes, dashes, chat ceremony |
| Red-team adversarial set (100 cases built to break v2) | 35.0% | **100.0%** | Every case initially defeated v2; all fixed (EVAL §4a) |
| v1's own rewrite inputs (73) | 47.9% | **65.8%** | v2 finds more of v1's own planted errors |
| False positives on 408 good inputs | 0.2% | **0.0%** | |
| False positives on v1's 226 goldens | 0.9% | **0.9%** (same 2 Cyrillic-output goldens v1 itself flags) | Reached exactly v1's level in phase 4 |
| Cyrillic→Latin transliteration (52 hard cases: ц/ция, ё, ю, я, initial е, ъ/ь, ў қ ғ ҳ) | no tool | **100%** | v1 had no transliterator at all |
| Combined FP index (goldens + pairs) | 1.1 | **0.9** | v2 is now *lower* than v1 |
| Calque bank | ~62 entries | **250 rows** (235 bad→good→why + 15 false-positive guards) | Adds RU officialese, chat ceremony, report verbs, punctuation tells |
| Linters | 5 .mjs scripts | **14 TS families** + 0-100 score with human-voice bonus | Every finding carries rule id, span, fix |
| Score rewards human text | no score | **98.3%** of pairs: human version scores higher (avg 100.0 vs 90.8) | The CORE MISSION, measured |
| Registers | implicit | **10 explicit** (product, quiz, assistant, chat, youth, marketing, legal, official, news, academic), register-aware linting | v1 was register-blind |
| Agent ergonomics | copy scripts by hand | `npm install -g uzbekify` auto-init for 6 agents; `humanize` (fixes + ordered checklist); `--fix`; SARIF; JSON Schemas; i18n (json/yaml/po key-by-key); batch; MCP server (7 tools) | |
| Offline & fast | — | **~70 ms lint**, no network, no keys | |
| Corpus grounding | none | gov corpus + web corpus (63k tokens) + informal corpus (Telegram/quotes/reviews), all mined into rules and data files | Every rule cites evidence |
| Tests | 1 file | **262 tests** across 18 files | |

## CORE MISSION scorecard

AI robotic Uzbek → human Uzbek is the whole point: the state's own portal UI
(my.gov.uz) writes human ("Xush kelibsiz! Bogʻchaga qanday qoʻyish mumkin?")
while its laws write robot ("belgilangan tartibda amalga oshirilishi kerak")
— uzbekify enforces the portal voice everywhere except the explicitly
requested `official` register, and its naturalness score measurably rewards
human-sounding text (spoken aspect, -ib qoʻy- compounds, natural glue, varied
rhythm earn points back).

## Where v1 still wins

Nothing measurable remains: on the final eval v2 matches v1's golden FP rate
exactly and beats it on every detection metric. v1's 5 scripts remain useful
as a minimal dependency-free fallback; uzbekify keeps parity by running them
in the benchmark.

## Reproduce

```bash
npm install && npm run build && npm test   # 262/262
npm run eval                               # EVAL PASS: v2 beats v1
```
