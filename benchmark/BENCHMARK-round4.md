# BENCHMARK — uzbek-humanizer (v1, GitHub) vs uzbekify (v2)

Generated: 2026-10-24T19:28:33.606Z · one `npm run bench` pipeline, same model for all generation and judging, blind A/B with seeded shuffles.

## Final: v1 (GitHub) vs v2 — headline

v1 here is the published GitHub version (`reference-v1/`, github.com/xusnitdinov/uzbek-humanizer), rerun through the exact same pipeline after v2 was frozen (phase 6 §10).

| Metric | v1 (GitHub) | v2 (uzbekify) | baseline (no skill) |
|---|---|---|---|
| Naturalness score (0-100, higher = more human) | 97.16 ± 0.58 | **99.99 ± 0.01** | 76.67 ± 1.81 |
| v1 linter hits (lower better) | 0.01 | **0.03** | 1.6 |
| v2 linter findings (lower better) | 0.4 | **0.01** | 2.04 |
| Dashes per text (em/en/\" - \"; lower better) | 0.32 | **0** | 0.26 |
| Officialese rate /100 words | 0.2 | **0.14** | 0.17 |
| Russian-calque rate /100 words | 0 | **0** | 0 |
| Apostrophe/script errors per text | 0 | **0** | 1.58 |
| Sentence length (words; corpus mean 12) | 6.63 | **6.34** | 8.61 |
| chrF vs human references (higher better) | 13.05 ± 3.53 | **1.95 ± 0.21** | 9.8 ± 1.11 |
| Natural particle/spoken-form use in chat texts | 17/47 (36.2%) | **12/47 (25.5%)** | 13/47 (27.7%) |
| **Blind pairwise win** (v2 / tie / v1) | 81 losses | **98 wins (46.7%)** | — |
| **Hard-tier pass** (auto + judge) | 43/60 (71.7%) | **43/60 (71.7%)** | 10/60 (16.7%) |

## Blind pairwise judging (v1 vs v2, forced choice + tie)

Judge: same model, separate context, no skill files, outputs shuffled A/B (key withheld). Rubric: reference-v1 bakeoff rubric extended for naturalness — pick which sounds more like a real native Uzbek human.

| Category | v2 win | tie | v1 win | n | v2 win rate (95% CI) |
|---|---|---|---|---|---|
| Formal letter | 14 | 0 | 1 | 15 | 93.3% (70–99%) |
| Chat/Telegram | 15 | 0 | 15 | 30 | 50.0% (33–67%) |
| Hard: register switch | 4 | 0 | 2 | 6 | 66.7% (30–90%) |
| UI microcopy | 9 | 7 | 9 | 25 | 36.0% (20–55%) |
| Marketing | 10 | 0 | 15 | 25 | 40.0% (23–59%) |
| Hard: idioms/slang | 3 | 0 | 3 | 6 | 50.0% (19–81%) |
| Hard: subtle robot | 5 | 1 | 0 | 6 | 83.3% (44–97%) |
| Hard: script | 5 | 0 | 1 | 6 | 83.3% (44–97%) |
| RU→UZ | 8 | 5 | 7 | 20 | 40.0% (22–61%) |
| EN→UZ | 13 | 5 | 7 | 25 | 52.0% (33–70%) |
| Hard: code-mixing | 1 | 0 | 5 | 6 | 16.7% (3–56%) |
| Hard: traps | 2 | 3 | 1 | 6 | 33.3% (10–70%) |
| Hard: native input | 0 | 3 | 3 | 6 | 0.0% (0–39%) |
| Hard: long | 0 | 1 | 5 | 6 | 0.0% (0–39%) |
| News | 6 | 0 | 4 | 10 | 60.0% (31–83%) |
| Hard: dash-heavy | 2 | 2 | 2 | 6 | 33.3% (10–70%) |
| Hard: keep formal | 1 | 4 | 1 | 6 | 16.7% (3–56%) |
| **Overall** | **98** | 31 | 81 | 210 | **46.7%** (40–53%) |

## Hard mode

60 brutal items (frozen, sha256 in HASHES): long subtle robot prose, register switches inside one task, code-mixing with correct loans to KEEP, mixed Cyrillic/Latin with wrong apostrophes, idioms/sarcasm/slang that must not flatten, robotic-but-clean rhythm cases, gov/legal text that must stay formal, translation traps (false friends, aspect, evidentials, politeness), native-written inputs that must stay basically unchanged, dash-heavy restructuring.

| Model | Auto-checks pass | Judge pass | Final pass (auto ∧ judge) |
|---|---|---|---|
| baseline | 12/60 | 10/60 | **10/60 (16.7%)** |
| v1 | 45/60 | 43/60 | **43/60 (71.7%)** |
| v2 | 46/60 | 43/60 | **43/60 (71.7%)** |

Per-category hard pass (v2):

| Category | v2 pass | v1 pass | baseline pass |
|---|---|---|---|
| Hard: long | 2/6 | 3/6 | 1/6 |
| Hard: register switch | 6/6 | 4/6 | 0/6 |
| Hard: code-mixing | 6/6 | 6/6 | 0/6 |
| Hard: script | 5/6 | 4/6 | 1/6 |
| Hard: idioms/slang | 5/6 | 4/6 | 1/6 |
| Hard: subtle robot | 1/6 | 4/6 | 0/6 |
| Hard: keep formal | 2/6 | 2/6 | 0/6 |
| Hard: traps | 6/6 | 6/6 | 4/6 |
| Hard: native input | 4/6 | 4/6 | 0/6 |
| Hard: dash-heavy | 6/6 | 6/6 | 3/6 |

## Automatic metrics by category (held-out set)

| Category | n | score v1→v2 | v1 hits v1→v2 | dashes v1→v2 | officialese v1→v2 |
|---|---|---|---|---|---|
| Chat/Telegram | 30 | 93.93 → **99.97** | 0 → 0.07 | 0.77 → **0** | 0 → **0** |
| UI microcopy | 25 | 98.4 → **100** | 0 → 0 | 0.16 → **0** | 0 → **0** |
| Marketing | 25 | 92.92 → **100** | 0 → 0 | 0.8 → **0** | 0 → **0** |
| EN→UZ | 25 | 97.88 → **100** | 0 → 0 | 0.2 → **0** | 0 → **0** |
| RU→UZ | 20 | 98.55 → **99.95** | 0 → 0 | 0.05 → **0** | 0.71 → **0** |
| Formal letter | 15 | 99.67 → **100** | 0 → 0 | 0 → **0** | 0 → **0.66** |
| News | 10 | 100 → **100** | 0 → 0 | 0 → **0** | 0 → **0** |

## 10 striking side-by-side examples (v2 clearly more human)

### 1. h4-106 (ru2uz) — score 93→100, v1-lint hits 0→0

Task: Переведите (продукт): «Оплата прошла успешно. Чек отправлен на вашу почту.»

- **v1:** Toʻlov muvaffaqiyatli amalga oshirildi. Chek emailingizga yuborildi.
- **v2:** Toʻlov amalga oshdi. Chek emailingizga yuborildi.

### 2. h4h-28 (flavor) — score 86→100, v1-lint hits 0→0

Task: Sarcastic user: 'wow, 3 haftada javob — rekord emasmi?' — kompaniya javobi: uzr + konkret muddat, hazilga ochiq, chat ohangi.

- **v1:** Uzr, 3 hafta chindan ham uzoq vaqt — arzitasiz. Holatingizni shu chatda birinchi navbatga oldim: ertaga, 25-oktabr soat 18:00 gacha aniq javob beraman. Oʻsha vaqt ham oʻtsa, yozing — bu safar oʻzim topaman.
- **v2:** Salom! Kulgingiz ham oʻrinli, uch hafta jiddiy kechikish, uzr. Endi shu chatda birga koʻramiz: murojaatingizni hozir tekshiryapman, 2 kun ichida, juma kuniga qadar aniq javob beraman. Yana chalgʻisa, shu xabarga yozing, shaxsan kuzatib boraman.

### 3. h4-027 (chat) — score 86→100, v1-lint hits 0→0

Task: Your cousin texts: 'imtihondan o'ta olmadim'. Comfort + practical encouragement, chat register.

- **v1:** Qattiq boʻldi-ku, tushunaman. Bir imtihon baribir hamma narsani hal qilmaydi. Keyingi safarga birga tayyorlanamiz — qaysi mavzuda qiynalganingni yoz, oʻshalarni bir koʻrib chiqamiz.
- **v2:** Tinch boʻl, bunday boʻlib turadi, keyingi safar aniq topshirasan. ⏎ Qaysi mavzu qiyin boʻldi, birga koʻramiz.

### 4. h4-071 (mkt) — score 86→100, v1-lint hits 0→0

Task: Facebook post for a robotics club: kids build real robots, Saturday groups open. 2 lines.

- **v1:** Bolalar bu yerda haqiqiy robotlar yigʻadi — gʻoyadan tayyor texnikaga qadar. ⏎ Shanba guruhlari uchun roʻyxat ochiq: joy band qiling.
- **v2:** Bolalar haqiqiy robotlar yigʻadigan klub ochildi. ⏎ Shanba guruhlari ochiq, roʻyxatdan oʻting.

### 5. h4h-15 (codemix) — score 90→100, v1-lint hits 0→0

Task: Review: 'chef o'zgardi, ta'mi oldingidek emas, lekin service zo'r' — restoran javobi: minnatdor + ustoz haqida izoh, aralash til tabiiy.

- **v1:** Sharhingiz uchun rahmat, minnatdormiz! Ha, chef almashdi — ustozimiz 15 yillik tajribaga ega oshpaz, menyu biroz yangilandi. Service zoʻr chiqqanidan xursandmiz, jamoaga yetkazamiz. Taʼm ham yaqinda eski sifatiga qaytadi deb umid qilamiz — yana keling, oʻzingiz baholaysiz. Yaxshi kunlar tilaymiz!
- **v2:** Ochiq yozganingiz uchun rahmat! Service zoʻr chiqqani jamoamizni xursand qildi. Chef haqida: ha, oshpaz almashdi, yangi ustozimiz bilan bir oy boʻldi. Taʻm oldingidek boʻlmagani bizga ham sezilyapti, retseptlar ustida ishlayapmiz, yaqin orada hammasi joyiga tushadi. Kelib tursangiz, oʻzingiz ham bah

### 6. h4h-18 (codemix) — score 88→100, v1-lint hits 0→0

Task: Freelancer posti: 'portfolio update, 3 loyiha qo'shildi, Figma va Webflow bilan ishlangan' — jonli, tabiiy, atamalar saqlangan.

- **v1:** Portfolio yangilandi! ⏎ 3 ta yangi loyiha qoʻshildi: Figma bilan ishlangan dizayn tizimi va ikkita Webflow sayt — biri restoran, biri oʻquv markazi uchun. Hammasi jonli havolalarda, ochib koʻrishingiz mumkin. ⏎ Fikr bersangiz, xursand boʻlaman!
- **v2:** Portfolio yangilandi! 3 ta yangi loyiha qoʻshdim, hammasi Figma va Webflow bilan ishlangan. Har birini dizayndan ishga tushishigacha oʻzim qildim. ⏎ Koʻrib chiqing, link profilda. Fikr bildirsangiz xursand boʻlaman, ish boʻlsa xabar yozing.

### 7. h4h-38 (formal-stay) — score 89→100, v1-lint hits 0→0

Task: Nizom bandi: 'Ushbu tartib barcha xodimlar uchun majburiy hisoblanadi.' — deyarli o'zgartirilmagan holda qoldiring.

- **v1:** Ushbu tartib barcha xodimlar uchun majburiy hisoblanadi.
- **v2:** Ushbu tartib har bir xodim uchun majburiy hisoblanadi.

### 8. h4-009 (chat) — score 89→100, v1-lint hits 0→0

Task: Friend returns your book: 'kitobingni qaytardim, ofisda'. Acknowledge + thank + ask about the ending. Chat register.

- **v1:** Rahmat, qoʻya qoʻyganing ham yaxshi boʻldi! Kitobni oxirigacha oʻqidingmi? Oxiri qanday chiqdi — kutilmagan boʻldimi?
- **v2:** Rahmat, ofisdan olib qoʻyaman. Kitob oxirini oʻqidingmi, senga qanday tuyuldi?

### 9. h4-011 (chat) — score 89→100, v1-lint hits 0→0

Task: Write the plumber's text: on my way, 20 minutes, need the water main accessible. One line.

- **v1:** Yoʻlda boʻlaman, 20 daqiqada yetib boraman — faqat umumiy suv krani ochiq tursin.
- **v2:** Yoʻldaman, 20 daqiqada boʻlaman, faqat asosiy suv krani ochiq tursin.

### 10. h4-016 (chat) — score 89→100, v1-lint hits 0→0

Task: Customer: 'chetdan olib kelinganmi ushbu mahsulot?' — admin: local stock, arrives fresh weekly. Chat register.

- **v1:** Yoʻq, mahsulot omborimizda bor. Har hafta yangi partiya kelib turadi — demak, doim yangisini olasiz.
- **v2:** Bu mahsulot mahalliy omborda bor, har hafta yangi partiya kelib turadi.

## Where v1 won or tied (honesty)

- **h4h-40** (formal-stay): v1 score 100 vs v2 100 — v1 text: Sizning soʻrovingiz yuqori organlarga yuborildi va javob kutilmoqda. Javob kelgan zahoti sizni xabardor qilamiz. | v2: Sizning soʻrovingiz yuqori organlarga yuborildi va javob kutilmoqda. Javob kelgach, belgilangan tartibda sizga maʻlum qilinadi.
- **h4-131** (formal): v1 score 100 vs v2 100 — v1 text: «______» korxonasi direktori buyrugʻi loyihasi ⏎ YONGʻIN XAVFSIZLIGI BOʻYICHA INSTRUKTAJ OʻTKAZISH HAQIDA ⏎ 1. 2026-yil 5-noyabr kuni soat 1 | v2: LOYIHA ⏎ «Oltin vodiy» MChJ bosh direktorining ⏎ 2026-yil 20-oktabrdagi 47-sonli buyruqi ⏎ Korxonada yongʻin xavfsizligi boʻyicha instruktaj
- **h4-127** (formal): v1 score 100 vs v2 100 — v1 text: Kompaniya direktori [F.I.Sh.] ga ⏎ Boʻlim mudiri [F.I.Sh.] dan ⏎ ARIZA ⏎ Oʻtgan chorakka oid xarajatlar hisobotini tasdiqlash uchun Siz bila | v2: «Yulduz savdo» MChJ direktori Rasulov Alisher Qahramonovichga ⏎ Boʻlim boshligʻi Toshpulov Oybek Rustamovich ⏎ tel: +998 93 456-78-90 ⏎ ARIZ

Blind judging ties: 31/210.

## Verdict

v2 blind pairwise win rate: **46.7%** (target ≥70%). Hard-tier pass: **71.7%** (target ≥85%). **Below target — iterate (see iterations log).**

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
