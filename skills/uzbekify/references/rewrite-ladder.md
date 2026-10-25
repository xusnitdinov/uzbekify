# The rewrite ladder (full procedure)

The detailed 8-step procedure behind SKILL.md. Load this when a rewrite needs
the complete walkthrough; the SKILL.md decision table points here.



# uzbekify (full rewrite procedure)

**CORE MISSION:** AI models write robotic Uzbek because they learned from
Wikipedia-style and officialese text. The single goal of this skill: make AI
write Uzbek that sounds like a **real human Uzbek** wrote it. Every rule,
reference, linter and eval below serves that goal.

- **Voice targets come from real people**: informal chats, comments, forum
  posts, casual social posts, natural spoken-style writing.
- **Wikipedia and news text = correct spelling and vocabulary ONLY**, never a
  model of how to sound.
- **Government sites (gov.uz, lex.uz, president.uz, my.gov.uz)** serve two
  jobs: (1) the correct formal register and official spelling/terminology,
  used only when the user actually needs formal/official text; (2) a mined
  bank of bureaucratic robotic patterns (`amalga oshirildi`, `muvofiq
  ravishda`, `oʻz navbatida`, `katta eʼtibor qaratildi`, `mazkur`, `ushbu`,
  `belgilab berildi`, …) that the linter flags and rewrites in every
  non-official register. Corpus + findings: `research/gov-corpus/`,
  `research/FINDINGS.md`. Notably: the state's own portal UI (my.gov.uz)
  writes human ("Xush kelibsiz!", "Bogʻchaga qanday qoʻyish mumkin?") —
  human voice is the product standard even for government.

Rewrite Uzbek so a Toshkent reader hears a person, not a model. This skill owns
the whole job: register, script, calques, word order, morphology, synonyms,
rhythm — then a machine check (`uzpro`) that proves the rewrite.

**Defaults:** Latin script · clear spoken product/student Uzbek · `Siz` address
· oʻ/gʻ = `ʻ` (U+02BB), tutuq = `ʼ` (U+02BC). Default register is the human
voice; formal registers only on explicit request.

## The rewrite ladder (do these steps in order, every time)

1. **Detect register + audience.** Read the source (or the ask) and pick ONE
   preset from `references/register-presets.md`: `product` (UI/microcopy),
   `quiz` (DTM/test stems), `assistant` (support/help), `youth` (Telegram/peer
   — only when explicitly asked), `marketing`, `academic`, `news`,
   `legal-lite`, `official` (laws/decrees, explicit request only), `chat`
   (Telegram-style DMs and casual messages, the core-mission register). The preset
   fixes sentence length, particles, address lane, vocabulary, and how the
   officialese linter treats document-speak. When in doubt: `product` + `Siz`
   + the human voice from `references/human-voice.md`.
2. **Fix script and apostrophes first.** Cyrillic input? Convert with
   `references/translit.md` rules (`uzpro translit`). Normalize oʻ/gʻ/tutuq
   marks (`uzpro normalize`). Inbound reform letters (ö ğ ş ç) map to oʻ gʻ sh
   ch. Never mix scripts in one word. Do not touch English inside bilingual
   files (`Who's`, `I'm`, URLs, `{placeholders}`).
3. **Kill calques AND officialese.** Sweep English-structure calques
   (`references/calque-bank.md` §EN-structure) and Russian-structure calques
   (§RU-structure): ship/vibe/portladi, check qilmoq, haqiqatan ham, Hurmatli
   foydalanuvchi, karoche, muvofiq ravishda, amalga oshirildi-chains, "I
   like X" → "menga yoqadi", literal idioms
   (`references/literalness.md`). Then kill the bureaucratic robotic patterns
   from the gov corpus (`references/human-voice.md` blacklist): mazkur → bu,
   ushbu → shu, belgilangan tartibda → the actual steps, -lishi kerak chains
   → who-does-what, quyidagi → shu. They stay ONLY in the `official`
   register. RU filler words are banned outside youth mode.
4. **Restore word order.** SOV: object before verb (`U kitobni oʻqidi`, never
   `U oʻqidi kitobni`). Time/place adverbials before the verb
   (`Kechqurun darsga bordi`). Question words stay in situ (`Siz nima
   qilasiz?`, not `Nima siz qilasiz?`). See `references/word-order.md`.
5. **Fix suffix chains and aspect/modality.** Noun stack: oʻzak + koʻplik +
   egalik + kelishik (`kitoblarimizga`). No case on verbs (`berdimga` →
   `berdim`), no double case (`fikrlarinigaga` → `fikrlariga`), -lar not -ler
   after back vowels. Dative assimilates: `qishloqqa`, `yurakka`. Then check
   aspect/modality choices against `references/aspect-modality.md` (-ib qoʻymoq
   politeness, -yapti ongoing, kerak edi counterfactual) and
   `references/morphology.md` for the full tables.
6. **Pick native synonyms.** Situation decides the verb: guruh ishi
   **oʻxshamadi** (not chiqmadi), reja **amalga oshmadi**, imtihon **yaxshi
   oʻtmadi**, kod **chiqmadi** (fine). Use `references/false-friends.md` (RU
   false friends) and `references/synonym-taste.md` for the matrices.
7. **Check rhythm.** Short sentences for UI (2–10 words), one idea per error
   message, vary length in prose, no template-word spam, no abstract noun
   stacks, active voice unless the agent is unknown. Particles (`xoʻp`,
   `mayli`) only in chat registers.
8. **Self-check with the machine.** Run `uzpro lint` (or `uzpro score`) on the
   rewrite; fix errors until score ≥ 90, then re-run. Use `uzpro diff` to show
   the user what changed. Output the template below.

## Hard rules

1. One address lane per surface: `Siz` for product/quiz/gov/elders; `sen` only
   when the user asked for youth/peer tone (then `uzpro lint --allow-sen`).
2. No EN cool slang (ship, vibe, teammate, portladi, hard mode) and no RU
   discourse fillers (karoche, normalni, kruto, chotki, tipa, vapshe) in
   default output.
3. Do not over-Uzbekify accepted loans (Wi‑Fi, OTP, email, promokod, keshbek,
   onlayn, brands). Replaceable English words get Uzbek equivalents
   (`references/loanword-policy.md`).
4. Never invent maqollar or poetic buttons; paraphrase idioms plainly
   (`references/idioms-connectors.md`).
5. **No dashes ever**: the skill NEVER outputs em dashes (—), en dashes (–)
   or spaced-hyphen dashes (" - ") in ANY register — rewrite with commas,
   periods or a restructured sentence (aitell linter enforces this).
6. Orthography: oʻ/gʻ = `ʻ` U+02BB; tutuq = `ʼ` U+02BC; never turn a real
   oʻ/gʻ digraph into tutuq (`toʼgʻri` is a bug); brand+suffix stays tutuq
   (`Goʼda`, `PUBGʼga`). Place names in Uzbek forms (Toshkent, Samarqand).
7. Legal/medical/high-stakes content → mark `Holat: draft/native_review_required`.
   Never invent statutes, never diagnose.
8. Passive voice only when the agent is unknown or irrelevant; report verbs
   (`amalga oshirildi`) max once per paragraph.
9. Formatting: `1 250 000 soʻm`, `2024-yil 9-avgust`, `+998 XX YYY-YY-YY`.

## Reference map

| Need | File |
|---|---|
| Calques (EN + RU structure, 200+ entries, bad/good/why) | `references/calque-bank.md` |
| Register presets (8, with canonical examples) | `references/register-presets.md` |
| Word order (SOV, topicalization, questions) | `references/word-order.md` |
| Suffix chains, vowel/consonant harmony | `references/morphology.md` |
| Aspect and modality choices | `references/aspect-modality.md` |
| Native synonym taste matrices | `references/synonym-taste.md` |
| False friends (RU/EN lookalikes) | `references/false-friends.md` |
| **Human voice — the primary target (CORE MISSION)** | `references/human-voice.md` |
| Idioms and natural connectors | `references/idioms-connectors.md` |
| Loanword policy (KEEP / REPLACEABLE / slang) | `references/loanword-policy.md` |
| Cyrillic ⇄ Latin transliteration spec | `references/translit.md` |
| Orthography and marks | `references/orthography.md` |
| Literal-idiom and translationese patterns | `references/literalness.md` |
| UI glossary (buttons, errors, fintech) | `references/ui-glossary.md` |
| Politeness and address lanes | `references/politeness.md` |
| Youth/Telegram register | `references/youth-register.md` |
| Formatting (money, dates, phone) | `references/formatting.md` |
| Domain packs: news, academic, legal-lite, bank/OTP, marketing | `references/domains.md` |

## Playbooks (load on demand)

| Surface | Playbook |
|---|---|
| UI microcopy | `playbooks/ui-microcopy.md` |
| Marketing | `playbooks/marketing.md` |
| Telegram posts | `playbooks/telegram-posts.md` |
| Formal letters / ariza | `playbooks/formal-letters.md` |
| EN/RU → natural Uzbek translation | `playbooks/translation-en-ru.md` |

## Self-check loop (every rewrite)

Draft → `uzpro score` → fix top deductions (errors first, then warns, then
add ONE human-voice signal if the bonus is 0) → repeat until score ≥ 90 (max
3 passes). Full procedure: `playbooks/self-check-loop.md`. MCP clients use
`uz_score` / `uz_rewrite_plan` / `uz_lint` the same way.

## Tools (single CLI: `uzpro`)

```bash
uzpro lint file.md            # all linters, human output, exit 1 on findings
uzpro lint file.md --json     # machine-readable findings
uzpro lint file.md --allow-sen --register youth
uzpro normalize file.md --write   # fix apostrophes/reform letters in place
uzpro translit cyr.txt             # Cyrillic → Latin (handles ц ё ю я е ъ ь ў қ ғ ҳ)
uzpro translit uz.txt --to cyrillic
uzpro score file.md --min 90   # naturalness 0-100 with explanations
uzpro diff before.md after.md  # word-level diff of a rewrite
uzpro lint locales/ --i18n     # locale files (json/yaml/po) key by key
uzpro lint src/ --format sarif > uzpro.sarif   # CI / code-scanning output
```

MCP server (`uzpro-mcp`, stdio): tools `uz_lint`, `uz_rewrite_plan` (ladder
steps with spans), `uz_score`, `uz_translit`, `uz_glossary_lookup`,
`uz_calque_check`, `uz_synonym_suggest` (ranked by the corpus in
`src/data/corpus-stats.json`). Corpus + mined data:
`research/corpus/`, `research/corpus-mining/`, `src/data/`.

Linter families: orthography, calque (EN+RU), russianism, officialese
(register-scoped gov-pattern bank), register (Siz/sen mix), suffix chains +
harmony, passive overuse, loanwords, cadence, literalness, word order, screen
consistency, formatting. Every finding names the rule and the fix. The score
adds a **human-voice bonus** (+up to 6) for spoken-aspect markers, -ib
qoʻy-/qol- compounds, natural glue and varied rhythm — the score rewards
text that sounds like a person.

## Output template

```
## Matn
[yoki: "faylga qarang" + 2-5 namuna qator]

## Oʻzgarishlar
- [register/script/calque/word order/suffix/synonym/rhythm: qisqacha]

## Holat
final | draft/native_review_required
```

If `uzpro score` was run, include the score line (`Naturalness: 94/100`).

## Worked seed

Bad: `Men haqiqatan ham bu ilovani yoqtiraman. To'g'ri javobni select qiling.
Guruh ishi chiqmadi — nima qilasan? Karoche, update qilib qoʻy.`

Good: `Bu ilova menga juda yoqadi. Toʻgʻri javobni belgilang. Guruh ishi
oʻxshamadi, nima qilasiz? Qisqasi, yangilab qoʻying.`

`uzpro score` on the bad text: 30/100 (11 findings). On the good text:
100/100.

## When NOT to use

- The user wants Russian/English target copy (only Uzbek in scope here).
- A house style guide conflicts with this skill — the user's guide wins; say so
  in Oʻzgarishlar.
- Proofreading a legal statute for binding accuracy — that needs a lawyer, and
  the output stays `draft`.
