# Orthography (marks, digraphs, normalization)

Same convention as v1 — kept identical so the two skills interoperate.

## Two marks, never collapsed

| Use | Character | Unicode | Examples |
|---|---|---|---|
| oʻ / gʻ letter mark | ʻ | U+02BB | Oʻzbekiston, gʻoya |
| tutuq (ъ) | ʼ | U+02BC | maʼno, sanʼat, aʼlo |

Hard ban in output: ASCII `'` and grave `` ` ``. The curly ‘ ’ (U+2018/2019)
are inbound variants to normalize, never to emit.

## Normalize on sight (uzpro normalize)

| Seen | Normalize to |
|---|---|
| to'g'ri, toʼgʻri, to‘g‘ri, tog`ri | toʻgʻri (U+02BB) |
| ma'no, ma‘no | maʼno (U+02BC) |
| ö õ ó ò ō (inbound 2026-reform) | oʻ |
| ğ | gʻ |
| ş → sh, ç → ch | current alphabet |
| boʼlmayapti (tutuq on o/g digraph) | boʻlmayapti |
| Payme Go'da, PUBG'ga, Uzum'da (brand+suffix) | Goʼda, PUBGʼga, Uzumʼda (tutuq!) |

Never rewrite English inside bilingual files (Who's, I'm), code blocks, URLs,
{placeholders}. The normalizer protects them.

## Digraphs

sh, ch, ng are letters. No lone c. ALL-CAPS keeps digraphs: CHIQISH, SHART,
TOʻGʻRI.

## Place names

Uzbek forms in Uzbek text: Toshkent, Samarqand, Buxoro, Fargʻona, Andijon,
Namangan, Navoiy, Nukus, Xiva, Qoʻqon, Margʻilon, Termiz, Urganch, Xorazm,
Qashqadaryo, Surxondaryo, Qoraqalpogʻiston. English passport spellings
(Tashkent, Samarkand) are errors inside Uzbek prose.

## Common misspellings to fix

| Bad | Good |
|---|---|
| togri / togri / toʻgri (wrong mark) | toʻgʻri |
| ozbek | oʻzbek |
| manosi (tutuq dropped) | maʼnosi |
| buladi | boʻladi |
| togrilab | toʻgʻrilab |
| keyng / keyn | keyin |
| uziz / oʻziz | oʻzingiz (polite) / oʻzi |
| keyn / keyen | keyin |
| chunonchi | chunki / shuning uchun (chunonchi = "namely" only) |

## 2026 alphabet reform (status)

The Senate approved Ö/Ğ/Ş/Ç on 10 Sep 2026; signing was not confirmed as of
5 Oct 2026. Rules for this skill: output stays oʻ/gʻ/sh/ch; inbound ö/ğ/ş/ç
normalize to the current alphabet; emit reform letters ONLY on explicit user
request, and then label the output draft/native_review_required.

## Chat-typing restore (lexicon only, never blind)

w→sh ("tuwunarsz"), c→ch, 4→ch, 6→oʻ, x↔h swap ("raxmat" → rahmat).
Restore by known words only; the linter does not auto-rewrite these.
