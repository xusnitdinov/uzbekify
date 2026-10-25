# BENCHMARK — uzbek-humanizer (v1, GitHub) vs uzbekify (v2)

Generated: 2026-10-24T19:35:25.592Z · one `npm run bench` pipeline, same model for all generation and judging, blind A/B with seeded shuffles.

## Final: v1 (GitHub) vs v2 — headline

v1 here is the published GitHub version (`reference-v1/`, github.com/xusnitdinov/uzbek-humanizer), rerun through the exact same pipeline after v2 was frozen (phase 6 §10).

| Metric | v1 (GitHub) | v2 (uzbekify) | baseline (no skill) |
|---|---|---|---|
| Naturalness score (0-100, higher = more human) | 97.11 ± 0.67 | **99.57 ± 0.33** | 84.92 ± 1.95 |
| v1 linter hits (lower better) | 0.01 | **0.01** | 1.01 |
| v2 linter findings (lower better) | 0.37 | **0.1** | 1.35 |
| Dashes per text (em/en/\" - \"; lower better) | 0.3 | **0** | 0.22 |
| Officialese rate /100 words | 0.47 | **0.17** | 0.16 |
| Russian-calque rate /100 words | 0 | **0** | 0 |
| Apostrophe/script errors per text | 0 | **0** | 0.99 |
| Sentence length (words; corpus mean 12) | 7.25 | **6.96** | 8.91 |
| chrF vs human references (higher better) | 9.6 ± 5.13 | **9.46 ± 5** | 7.39 ± 4.19 |
| Natural particle/spoken-form use in chat texts | 17/48 (35.4%) | **15/48 (31.3%)** | 13/48 (27.1%) |
| **Blind pairwise win** (v2 / tie / v1) | 82 losses | **113 wins (53.8%)** | — |
| **Hard-tier pass** (auto + judge) | 45/60 (75.0%) | **52/60 (86.7%)** | 9/60 (15.0%) |

## Blind pairwise judging (v1 vs v2, forced choice + tie)

Judge: same model, separate context, no skill files, outputs shuffled A/B (key withheld). Rubric: reference-v1 bakeoff rubric extended for naturalness — pick which sounds more like a real native Uzbek human.

| Category | v2 win | tie | v1 win | n | v2 win rate (95% CI) |
|---|---|---|---|---|---|
| Hard: register switch | 4 | 0 | 2 | 6 | 66.7% (30–90%) |
| Chat/Telegram | 13 | 2 | 15 | 30 | 43.3% (27–61%) |
| Hard: code-mixing | 4 | 0 | 2 | 6 | 66.7% (30–90%) |
| UI microcopy | 17 | 0 | 8 | 25 | 68.0% (48–83%) |
| Hard: long | 3 | 0 | 3 | 6 | 50.0% (19–81%) |
| Hard: idioms/slang | 3 | 0 | 3 | 6 | 50.0% (19–81%) |
| RU→UZ | 9 | 3 | 8 | 20 | 45.0% (26–66%) |
| Marketing | 15 | 0 | 10 | 25 | 60.0% (41–77%) |
| EN→UZ | 16 | 2 | 7 | 25 | 64.0% (45–80%) |
| Formal letter | 11 | 0 | 4 | 15 | 73.3% (48–89%) |
| Hard: script | 1 | 1 | 4 | 6 | 16.7% (3–56%) |
| Hard: keep formal | 1 | 2 | 3 | 6 | 16.7% (3–56%) |
| News | 5 | 0 | 5 | 10 | 50.0% (24–76%) |
| Hard: native input | 0 | 3 | 3 | 6 | 0.0% (0–39%) |
| Hard: dash-heavy | 4 | 0 | 2 | 6 | 66.7% (30–90%) |
| Hard: traps | 3 | 2 | 1 | 6 | 50.0% (19–81%) |
| Hard: subtle robot | 4 | 0 | 2 | 6 | 66.7% (30–90%) |
| **Overall** | **113** | 15 | 82 | 210 | **53.8%** (47–60%) |

## Hard mode

60 brutal items (frozen, sha256 in HASHES): long subtle robot prose, register switches inside one task, code-mixing with correct loans to KEEP, mixed Cyrillic/Latin with wrong apostrophes, idioms/sarcasm/slang that must not flatten, robotic-but-clean rhythm cases, gov/legal text that must stay formal, translation traps (false friends, aspect, evidentials, politeness), native-written inputs that must stay basically unchanged, dash-heavy restructuring.

| Model | Auto-checks pass | Judge pass | Final pass (auto ∧ judge) |
|---|---|---|---|
| baseline | 9/60 | 9/60 | **9/60 (15.0%)** |
| v1 | 54/60 | 45/60 | **45/60 (75.0%)** |
| v2 | 56/60 | 52/60 | **52/60 (86.7%)** |

Per-category hard pass (v2):

| Category | v2 pass | v1 pass | baseline pass |
|---|---|---|---|
| Hard: long | 5/6 | 3/6 | 0/6 |
| Hard: register switch | 4/6 | 4/6 | 0/6 |
| Hard: code-mixing | 5/6 | 5/6 | 0/6 |
| Hard: script | 6/6 | 5/6 | 2/6 |
| Hard: idioms/slang | 5/6 | 6/6 | 0/6 |
| Hard: subtle robot | 5/6 | 4/6 | 0/6 |
| Hard: keep formal | 6/6 | 4/6 | 1/6 |
| Hard: traps | 6/6 | 5/6 | 3/6 |
| Hard: native input | 5/6 | 5/6 | 1/6 |
| Hard: dash-heavy | 5/6 | 4/6 | 2/6 |

## Automatic metrics by category (held-out set)

| Category | n | score v1→v2 | v1 hits v1→v2 | dashes v1→v2 | officialese v1→v2 |
|---|---|---|---|---|---|
| Chat/Telegram | 30 | 94.57 → **100** | 0 → 0 | 0.57 → **0** | 0 → **0** |
| UI microcopy | 25 | 97.24 → **100** | 0 → 0 | 0.28 → **0** | 0.36 → **0** |
| Marketing | 25 | 92.64 → **99.68** | 0 → 0 | 0.92 → **0** | 0 → **0.17** |
| EN→UZ | 25 | 98.12 → **99.96** | 0 → 0 | 0.16 → **0** | 1.57 → **0.5** |
| RU→UZ | 20 | 97.1 → **99.2** | 0 → 0 | 0.25 → **0** | 0 → **0** |
| Formal letter | 15 | 99.53 → **100** | 0 → 0.07 | 0.4 → **0** | 0.71 → **0** |
| News | 10 | 98.9 → **99.3** | 0.1 → 0 | 0.1 → **0** | 0 → **0** |

## 10 striking side-by-side examples (v2 clearly more human)

### 1. ho-090 (en2uz) — score 98→100, v1-lint hits 0→0

Task: Translate: 'This offer cannot be combined with other promotions.' (checkout small print)

- **v1:** Ushbu taklif boshqa aktsiyalar bilan birga qoʻllanmaydi.
- **v2:** Bu taklif boshqa aksiyalar bilan birga qoʻllanmaydi.

### 2. ho-078 (mkt) — score 74→95, v1-lint hits 0→0

Task: Loyalty tier names + one-line rules for a bookstore: Bronze/Silver/Gold by yearly spend.

- **v1:** Bronza — yiliga 500 ming soʻmdan xarid qilganlarga har xariddan 3% qaytib boradi. ⏎ Kumush — yiliga 1,5 mln soʻmdan xarid qilganlarga 5% qaytib boradi, yangi toʻplamlarni birinchi boʻlib koʻrasiz. ⏎ Oltin — yiliga 3 mln soʻmdan xarid qilganlarga 7% qaytib boradi va tugʻilgan kuningizga kitob sovgʻa 
- **v2:** Bronza: yiliga 500 000 soʻmdan xarid qilsangiz, har xaridda 3% keshbek olasiz. ⏎ Kumush: yiliga 1 500 000 soʻmdan oshsa, keshbek 5% boʻladi, yetkazib berish bepul. ⏎ Oltin: yiliga 3 000 000 soʻmdan oshsa, 7% keshbek va yangi kitoblar haqida birinchi boʻlib xabardor boʻlasiz.

### 3. ho-097 (en2uz) — score 97→99, v1-lint hits 0→0

Task: Translate a legal-lite line: 'By using this service you agree to the terms below.'

- **v1:** Ushbu xizmatdan foydalanish orqali quyidagi shartlarga rozilik bildirasiz.
- **v2:** Bu xizmatdan foydalanish orqali quyidagi shartlarga rozilik bildirasiz.

### 4. ho-080 (mkt) — score 82→100, v1-lint hits 0→0

Task: Google Ads headline x2 (30 chars each) for an online pharmacy with 1-hour delivery in Tashkent.

- **v1:** Dori yetkazish — 1 soatda ⏎ Onlayn dorixona — Toshkent
- **v2:** Toshkentda dori 1 soatda ⏎ Onlayn dorixona yoningizda

### 5. ho-025 (chat) — score 82→100, v1-lint hits 0→0

Task: Reply to a friend's voice note bragging about a 90% exam score. Genuine, surprised, natural chat Uzbek.

- **v1:** Rostdanmi?! 90% — juda kuchli, tabriklayman! ⏎ Qanday tayyorlanganingni ham aytaver, foydasi tegadi.
- **v2:** Voy, 90 foizmi?! Aql bovar qilmayapti. ⏎ Tabriklayman, mehnating oʻz samarasini berdi, faxrlanaman.

### 6. ho-030 (chat) — score 86→100, v1-lint hits 0→0

Task: Friend: 'shu kursosdan oldim, tavsiya qilasizmi?'. You took it, it was meh. Honest natural reply, chat register.

- **v1:** Oʻzim oldim edi — oʻrtacha kurs ekan, kutilganidek emas. ⏎ Puliga arzimi, aniq aytolmayman — boshqa variantlarni ham qarab chiqing.
- **v2:** Olganman oʻzim, oʻrtacha ekan, katta foydasi yoʻqdek. Pul uchun arziydi deb aytmayman.

### 7. ho-060 (mkt) — score 86→100, v1-lint hits 0→0

Task: Email subject + first line for a course platform's Black Friday deal: programming courses 50% off, 4 days only.

- **v1:** Dasturlash kurslarida 50% chegirma — atigi 4 kun ⏎ Black Friday taklifi shu haftada tugaydi — istalgan kursni yarim narxga oling.
- **v2:** Dasturlash kurslariga 50% chegirma, faqat 4 kun ⏎ Siz kutgan kurslar bugun yarim narxda, 4 kundan keyin narxlar qaytadi

### 8. ho-069 (mkt) — score 86→100, v1-lint hits 0→0

Task: Two ad variants (A/B) for a bakery's lunch combo: soup + bread + tea for 25k so'm. Casual but appetizing.

- **v1:** A: Qaynoq shoʻrva, tandir non, koʻk choy — toʻliq tushlik atigi 25 000 soʻm. ⏎ B: Tushlik payti bizda oddiy va mazali: shoʻrva, non, choy — 25 000 soʻm.
- **v2:** A: Issiq shoʻrva, yangi non va choi, atigi 25 ming soʻm ⏎ B: Shoʻrvaga non choʻktirsangiz, tushlik hal boʻldi. 25 ming soʻm, keling

### 9. ho-042 (ui) — score 100→100, v1-lint hits 0→0

Task: Password rules line for a signup form, Uzbek, one sentence: min 8 chars, one digit, one letter.

- **v1:** Parolda kamida 8 belgi, bitta raqam va bitta harf boʻlishi kerak
- **v2:** Parolda kamida 8 belgi boʻlsin, bitta raqam va bitta harf ham qatnashsin.

### 10. hard-12 (switch) — score 88→100, v1-lint hits 0→0

Task: Mijozga email: 1-rasmiy salom, 2-chatdagi yangilanish xulosasi, 3-rasmiy yopish. Uch qatlam sezilsin, lekin yaxlit maktub bo'lsin.

- **v1:** Assalomu alaykum, hurmatli [Ism Familiya]! ⏎ Murojaatingiz uchun tashakkur. Soʻrovingiz koʻrib chiqildi: buyurtmangiz tasdiqlandi, toʻlov muvaffaqiyatli amalga oshdi va yetkazib berish yoʻlga qoʻyildi. ⏎ Xoʻsh, oddiy qilib aytganda: hammasi oʻtdi, buyurtma yoʻlda, sizdan endi hech narsa soʻralmaydi.
- **v2:** Assalomu alaykum, hurmatli mijoz! ⏎ Qisqacha: karta blokirovkasi bekor qilindi, pul ham hisobga tushdi. Qoʻshimcha toʻlov kerak emas, hammasi joyida. Ilova yangilansa, yangi imkoniyatlar ham koʻrinib qoladi. ⏎ Savol boʻlsa, bemalol murojaat qiling. Sizga xizmat qilishdan mamnunmiz. ⏎ Hurmat bilan, ⏎

## Where v1 won or tied (honesty)

- **hard-01** (long): v1 score 90 vs v2 74 — v1 text: Yangi oʻquv markazimiz ochildi, xush kelibsiz! Markaz zamonaviy taʼlim standartlari asosida jihozlangan. Darslarni yuqori malakali mutaxassi | v2: Assalomu alaykum, doʻstlar! Uzoq kutilgan yangilikni oxiri aytishga tayyormiz: oʻquv markazimiz endi faoliyat boshladi. Koʻpchilik soʻnggi p
- **hard-41** (formal-stay): v1 score 100 vs v2 100 — v1 text: Sizning bank maʼlumotlaringizni uchinchi shaxslarga bermaymiz. Maʼlumotlar faqat qonun talab qilgan hollarda tegishli organlarga taqdim etil | v2: Maʼlumotlaringizni uchinchi shaxslarga bermaymiz. Faqat qonun talab qilgan hollarda, belgilangan tartibda taqdim etiladi. Maʼlumotlaringiz x
- **ho-124** (ru2uz): v1 score 100 vs v2 89 — v1 text: Bugun qilib boʻladigan ishni ertaga qoldirmang. | v2: Bugungi ishni ertagaga qoldirmang.

Blind judging ties: 15/210.

## Verdict

v2 blind pairwise win rate: **53.8%** (target ≥70%). Hard-tier pass: **86.7%** (target ≥85%). **Below target — iterate (see iterations log).**

## Reproduce

```bash
npm run build
npm run bench            # metrics + judge packs + report (uses saved outputs/judgments)
sha256sum -c <<< "$(grep heldout benchmark/HASHES)"   # items frozen
```

Generation and judging prompts: `benchmark/prompts/`. Item hashes:

```
d49fe2b2d3f1b71ab1c3ce4a78ca58e891e138f2d760e094ea7eaa2fb9b818a7  benchmark/heldout/heldout.jsonl
79196e8b6df42c02ce0332a4dc0a4509ce48680703fff95b8fe65003a0774d40  benchmark/hard/hard.jsonl
c944bd2144a3f79679c05e7f9562c4d2cc1e31e50e6b23b906cefd7dcee7c6f9  benchmark/hard/criteria.jsonl
4d88b7c5779346d28fe8b9906f36c589886215691aba0e4b5bf41a8f6b3b7f1d  benchmark/heldout/heldout2.jsonl
dd47486cb2a423a29c86efe1dbc893abd084ade1ee3b554fdc6e3196c58507c8  benchmark/hard/hard2.jsonl
f331581778c2f51b318f92936ef229ed6835b1ecdaae58c1b0ec5bb8884fab98  benchmark/hard/criteria2.jsonl
d7d565d0fe6ae75f4dd900f0cbed42ecd22c09f398317ab1a46d7b23258138c2  benchmark/heldout/heldout3.jsonl
1f1e1ef71e656d944ab6bde37b7def627fd5f43619fb814fa43b5d56499a994b  benchmark/hard/hard3.jsonl
fb7c5e3f63eac734aa1c5288bdcbf7460916170f01f6d659c473b265ead53588  benchmark/hard/criteria3.jsonl
590bc154774e5f893f89f2051186ba9ba4f3ae28aed12000f5601ea68ea990ad  benchmark/heldout/heldout4.jsonl
d1d9575226ec7a39cc70743af535780b1433b42fbd4726592992d38aadbdcca7  benchmark/hard/hard4.jsonl
4e23ddc74db6d63cc026b95ae97f7e848e7d96f48180eaa2fcc1470d6dcda2cf  benchmark/hard/criteria4.jsonl
```

## Iterations log

| Round | Change | Result |
|---|---|---|
| 1 | v2 frozen after phase 5 (incl. general native-preservation + formal-stay rules added BEFORE generation, from the hard-mode spec). Held-out + hard written fresh, never used for rule tuning. | this report |
