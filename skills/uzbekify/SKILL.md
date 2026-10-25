---
name: uzbekify
description: >-
  Use whenever writing, rewriting, translating, or reviewing Uzbek — any
  register, any direction (EN→UZ, RU→UZ, Cyrillic→Latin). Makes AI Uzbek
  sound like a real person: kills calques and officialese, fixes register,
  morphology and word order, normalizes script, scores naturalness 0-100.
  Trigger words: o'zbekcha, uzbek, uzbekify, uzpro, tabiiylashtirish,
  tarjima, kirill, lotin, humanize, matn tuzatish, DTM, Telegram post.
license: MIT
metadata:
  author: uzbekify
  version: "3.0.0"
---

# uzbekify

**CORE MISSION:** AI writes robotic Uzbek because it learned from Wikipedia
and officialese. uzbekify makes it sound like a real human Uzbek wrote it.
Voice targets = real informal text. Wikipedia/news = spelling and vocabulary
only. Gov sites = formal register on request + a bank of robotic patterns to
kill everywhere else.

## 30-second quickstart

```bash
uzpro humanize file.md        # deterministic fixes + diff + ordered checklist
uzpro lint file.md            # all linter families, spans included
uzpro score file.md --min 90  # naturalness gate (the target is ≥ 90)
uzpro translit cyr.txt        # Cyrillic → Latin (hard cases handled)
```

MCP (stdio, `uzpro-mcp`): `uz_lint` · `uz_rewrite_plan` · `uz_score` ·
`uz_translit` · `uz_glossary_lookup` · `uz_calque_check` ·
`uz_synonym_suggest`.

## Decision table

| Task | Register | Load | Check |
|---|---|---|---|
| UI strings, buttons, errors | product | `references/ui-glossary.md` + `playbooks/ui-microcopy.md` | `lint --register product` |
| Quiz/DTM stems | quiz | `references/ui-glossary.md` (quiz section) | `lint --register quiz` |
| Support/help replies | assistant | `references/politeness.md` | `lint --register assistant` |
| Telegram DMs, casual chat | chat | `references/informal-chat.md` + `playbooks/telegram-posts.md` | `lint --register chat --allow-sen` |
| Youth/peer tone (explicit ask) | youth | `references/youth-register.md` | `lint --register youth --allow-sen` |
| Landing/promo copy | marketing | `playbooks/marketing.md` | `lint --register marketing` |
| Formal letters, ariza | legal | `playbooks/formal-letters.md` | `lint --register legal` |
| Laws/decrees (explicit ask) | official | `references/register-presets.md` §9 | `lint --register official` |
| News body / academic | news / academic | `references/domains.md` | `lint --register news` |
| EN→UZ or RU→UZ translation | by target | `playbooks/translation-en-ru.md` | score ≥ 90 |
| Cyrillic input | keep target script | `references/translit.md` | `translit` |

Full rewrite procedure: `references/rewrite-ladder.md`. Everything else in
`references/` — load only what the table points at (progressive disclosure).

## Hard rules

1. Human voice by default; formal registers only when asked.
2. **Never output em/en dashes (—, –) or " - "** in ANY register. Commas,
   periods, or restructure. (aitell linter enforces.)
3. One address lane per surface (Siz for product/quiz/gov; sen only when
   asked). No EN slang or RU fillers outside youth mode.
4. Script: Latin default; normalize oʻ/gʻ (U+02BB) and tutuq (U+02BC);
   transliterate Cyrillic input before rewriting.
5. Kill calques (EN + RU structure) and officialese (`mazkur`,
   `belgilangan tartibda`, `-lishi kerak` chains…) in every non-official
   register.
6. SOV word order; time/place before the verb; question words in situ.
7. Never invent maqollar; never diagnose or invent statutes.
8. Legal/medical/high-stakes → `Holat: draft/native_review_required`.
9. **Native text stays native.** If the input already reads like a real
   person wrote it (chat message, review, quote, mahalla announcement), do
   NOT rewrite it: fix only script/apostrophe marks and clear errors — chat
   spellings count as clear errors when the task says "fix errors" (yaxwi →
   yaxshi, otdi → oʻtdi) — but keep particles, slang, spoken forms and voice
   exactly as they are.
10. Formal registers stay formal: `official`/`legal` inputs keep document
   wording — never casualize them.
11. Self-check loop: draft → `uzpro score <file> --min 90` (exit 1 = not yet)
   → fix every [error] finding first, then [warn]s, top family by points →
   re-run. Stop at score ≥ 90 (max 3 passes, then rewrite from meaning).
   `uzpro humanize <file>` does the deterministic half for you.

## References (progressive disclosure: open only what the decision table names)

Voice: human-voice.md · informal-chat.md (real × robotic pairs) ·
register-presets.md (all 10 registers incl. chat §4b and official §9) ·
politeness.md · youth-register.md
Bank: calque-bank.md (250+) · false-friends.md · synonym-taste.md ·
loanword-policy.md · idioms-connectors.md
Grammar: rewrite-ladder.md (the full 8-step procedure) · word-order.md ·
morphology.md · aspect-modality.md
Script: translit.md · orthography.md · formatting.md · literalness.md
Domains: domains.md · ui-glossary.md

## Output template

```
## Matn
[yoki "faylga qarang" + 2–5 namuna qator]
## Oʻzgarishlar
- [register/script/calques/order/suffix/synonym/rhythm]
## Holat
final | draft/native_review_required
```

Include the `uzpro score` line when you ran it.
