# BENCHMARK — uzbek-humanizer (v1, GitHub) vs uzbekify (v2)

Generated: 2026-10-24T12:44:25.905Z · one `npm run bench` pipeline, same model for all generation and judging, blind A/B with seeded shuffles.

## Final: v1 (GitHub) vs v2 — headline

v1 here is the published GitHub version (`reference-v1/`, github.com/xusnitdinov/uzbek-humanizer), rerun through the exact same pipeline after v2 was frozen (phase 6 §10).

| Metric | v1 (GitHub) | v2 (uzbekify) | baseline (no skill) |
|---|---|---|---|
| Naturalness score (0-100, higher = more human) | 95.86 ± 0.73 | **99.55 ± 0.29** | 85 ± 2.04 |
| v1 linter hits (lower better) | 0.01 | **0** | 0.81 |
| v2 linter findings (lower better) | 0.47 | **0.08** | 1.31 |
| Dashes per text (em/en/\" - \"; lower better) | 0.48 | **0** | 0.57 |
| Officialese rate /100 words | 0.12 | **0.09** | 0.11 |
| Russian-calque rate /100 words | 0 | **0** | 0 |
| Apostrophe/script errors per text | 0 | **0** | 0.8 |
| Sentence length (words; corpus mean 12) | 6.73 | **6.95** | 8.56 |
| chrF vs human references (higher better) | 11.95 ± 0.76 | **6.85 ± 7.28** | 2 ± 0.42 |
| Natural particle/spoken-form use in chat texts | 15/46 (32.6%) | **13/46 (28.3%)** | 8/46 (17.4%) |
| **Blind pairwise win** (v2 / tie / v1) | 69 losses | **117 wins (55.7%)** | — |
| **Hard-tier pass** (auto + judge) | 46/60 (76.7%) | **47/60 (78.3%)** | 26/60 (43.3%) |

## Blind pairwise judging (v1 vs v2, forced choice + tie)

Judge: same model, separate context, no skill files, outputs shuffled A/B (key withheld). Rubric: reference-v1 bakeoff rubric extended for naturalness — pick which sounds more like a real native Uzbek human.

| Category | v2 win | tie | v1 win | n | v2 win rate (95% CI) |
|---|---|---|---|---|---|
| Chat/Telegram | 19 | 0 | 11 | 30 | 63.3% (46–78%) |
| EN→UZ | 12 | 3 | 10 | 25 | 48.0% (30–67%) |
| UI microcopy | 11 | 5 | 9 | 25 | 44.0% (27–63%) |
| News | 7 | 1 | 2 | 10 | 70.0% (40–89%) |
| RU→UZ | 7 | 5 | 8 | 20 | 35.0% (18–57%) |
| Marketing | 14 | 0 | 11 | 25 | 56.0% (37–73%) |
| Hard: code-mixing | 3 | 0 | 3 | 6 | 50.0% (19–81%) |
| Hard: register switch | 4 | 0 | 2 | 6 | 66.7% (30–90%) |
| Hard: native input | 5 | 1 | 0 | 6 | 83.3% (44–97%) |
| Formal letter | 15 | 0 | 0 | 15 | 100.0% (80–100%) |
| Hard: long | 2 | 0 | 4 | 6 | 33.3% (10–70%) |
| Hard: dash-heavy | 4 | 0 | 2 | 6 | 66.7% (30–90%) |
| Hard: script | 3 | 1 | 2 | 6 | 50.0% (19–81%) |
| Hard: subtle robot | 3 | 0 | 3 | 6 | 50.0% (19–81%) |
| Hard: traps | 2 | 3 | 1 | 6 | 33.3% (10–70%) |
| Hard: idioms/slang | 5 | 0 | 1 | 6 | 83.3% (44–97%) |
| Hard: keep formal | 1 | 5 | 0 | 6 | 16.7% (3–56%) |
| **Overall** | **117** | 24 | 69 | 210 | **55.7%** (49–62%) |

## Hard mode

60 brutal items (frozen, sha256 in HASHES): long subtle robot prose, register switches inside one task, code-mixing with correct loans to KEEP, mixed Cyrillic/Latin with wrong apostrophes, idioms/sarcasm/slang that must not flatten, robotic-but-clean rhythm cases, gov/legal text that must stay formal, translation traps (false friends, aspect, evidentials, politeness), native-written inputs that must stay basically unchanged, dash-heavy restructuring.

| Model | Auto-checks pass | Judge pass | Final pass (auto ∧ judge) |
|---|---|---|---|
| baseline | 45/60 | 26/60 | **26/60 (43.3%)** |
| v1 | 52/60 | 46/60 | **46/60 (76.7%)** |
| v2 | 52/60 | 47/60 | **47/60 (78.3%)** |

Per-category hard pass (v2):

| Category | v2 pass | v1 pass | baseline pass |
|---|---|---|---|
| Hard: long | 1/6 | 1/6 | 1/6 |
| Hard: register switch | 6/6 | 5/6 | 2/6 |
| Hard: code-mixing | 6/6 | 5/6 | 4/6 |
| Hard: script | 6/6 | 6/6 | 1/6 |
| Hard: idioms/slang | 5/6 | 5/6 | 3/6 |
| Hard: subtle robot | 3/6 | 4/6 | 5/6 |
| Hard: keep formal | 6/6 | 6/6 | 3/6 |
| Hard: traps | 5/6 | 6/6 | 2/6 |
| Hard: native input | 4/6 | 2/6 | 1/6 |
| Hard: dash-heavy | 5/6 | 6/6 | 4/6 |

## Automatic metrics by category (held-out set)

| Category | n | score v1→v2 | v1 hits v1→v2 | dashes v1→v2 | officialese v1→v2 |
|---|---|---|---|---|---|
| Chat/Telegram | 30 | 92.93 → **99.83** | 0.07 → 0.03 | 0.83 → **0** | 0 → **0** |
| UI microcopy | 25 | 96.24 → **99.92** | 0 → 0 | 0.32 → **0** | 0 → **0** |
| Marketing | 25 | 91.8 → **100** | 0 → 0 | 0.92 → **0** | 0 → **0** |
| EN→UZ | 25 | 95.76 → **99.2** | 0 → 0 | 0.32 → **0** | 0 → **0** |
| RU→UZ | 20 | 98.35 → **100** | 0 → 0 | 0.15 → **0** | 0 → **0** |
| Formal letter | 15 | 99.8 → **97.8** | 0 → 0 | 0 → **0** | 0.33 → **0.21** |
| News | 10 | 100 → **100** | 0 → 0 | 0.1 → **0** | 0.59 → **0** |

## 10 striking side-by-side examples (v2 clearly more human)

### 1. hd2-33 (rhythm) — score 76→100, v1-lint hits 0→0

Task: Yordamchi javoblari bir xil shablon: 'Albatta! ...' bilan 4 marta boshlanadi — har javob turli ochilish bilan, lekin xizmat ohangi saqlansin.

- **v1:** — Emailni oʻzgartirsam boʻladimi? / Boʻladi: Profil → Sozlamalar → Email maydonini yangilab, saqlang. ⏎ — Toʻlovim qaytadimi? / Tekshirib koʻramiz: chekni yuborsangiz, aniq javob beramiz. ⏎ — Parolni unitibman. / Muammo emas: Kirish sahifasida «Parolni tiklash»ni bosing. ⏎ — Ilova ochilmayapti. / Ke
- **v2:** Keling, birga koʻrib chiqamiz: buyurtma sahifasida holati koʻrinib turadi. ⏎ Toʻgʻri tushungan boʻlsam, toʻlovni qayta urinib koʻrsangiz, odatda shu usul yordam beradi. ⏎ Bir oz kuting, hoziroq tekshiryapman. ⏎ Xohlasangiz, telefon raqamingizni yozing, oʻzim qoʻngʻiroq qilib javob beraman.

### 2. h2-028 (chat) — score 75→100, v1-lint hits 0→0

Task: Group chat: vote between two designs (A: yashil, B: ko'k). Write the designer's call for votes, casual, 2 lines.

- **v1:** Ikkala variant tayyor: A — yashil, B — koʻk. ⏎ Qaysi biri yoqdi — shunga ovoz bering.
- **v2:** Qaysi biri yoqdi: A yashil yoki B koʻk? ⏎ Reaksiya qoʻyib ovoz bering, ertaga tanlab yozamiz.

### 3. h2-074 (mkt) — score 82→100, v1-lint hits 0→0

Task: Two test headlines for an online-movie service: watch on any device, cancel anytime.

- **v1:** Tomosha qayerda xohlasangiz — telefon, TV yoki laptopda. ⏎ Obuna — istalgan payt bekor qilinadi.
- **v2:** Bir obuna bilan har qanday qurilmada koʻring. ⏎ Yoqmasa, istalgan payt bekor qiling.

### 4. h2-027 (chat) — score 84→100, v1-lint hits 0→0

Task: Your brother texts from the airport: flight delayed 3 hours. Sympathize + practical tip. 2 short messages.

- **v1:** Aylanay, 3 soat koʻp ekan — sabr qil. ⏎ Kutish paytida telefonni quvvatlab ol va parvoz vaqtini yana tekshirib tur — oʻzgartirishlari mumkin.
- **v2:** E, uch soat uzoq-ku, sabr qil aka. ⏎ Kafega oʻtib kut, telefonni zaryadlab ol, vaqt tezroq oʻtadi.

### 5. hd2-06 (long) — score 81→94, v1-lint hits 0→0

Task: Transport kompaniyasi haqida 5 paragrafli 'Kompaniya haqida' matni robot-til: '''Kompaniya yuk tashish xizmatlarini amalga oshiradi. Avtopark zamonaviy yuk mashinalari bilan jihozlangan. Yuklar sug'urta qilinadi. Yetkazi…

- **v1:** Kompaniya 15 yildan ortiq vaqt yuk tashish bilan shugʻullanadi. Bu yillarga koʻp narsa sigʻdi: yoʻllar, mijozlar va xolis tajriba. ⏎ Avtoparkimiz zamonaviy yuk mashinalaridan iborat. Har bir yuk sugʻurta qilinadi — yoʻlda nima boʻlishidan qatʼi nazar, javobgarlik bizniki. ⏎ Yetkazib berish muddatini
- **v2:** Yuk tashish bilan 15 yildan ortiq shugʻullanamiz. Bu davrda filiallarimiz barcha viloyatlarda ochildi. ⏎ Avtoparkimiz zamonaviy yuk mashinalari bilan jihozlangan. Har bir yuk sugʻurta qilinadi, shuning uchun bemalol topshirasiz. ⏎ Yetkazish muddatini bajaramiz. Yukingiz qayerdaligini onlayn kuzatib 

### 6. hd2-20 (script) — score 82→100, v1-lint hits 0→0

Task: Eski kirill+lotin aralash e'lonni toza lotinga o'tkazing va jonli qiling: 'ЭРТАЛА ўтказилadi yig'ilish — barcha KelВЕРING'

- **v1:** Ertalab yigʻilish oʻtkaziladi — barcha xodimlar keling!
- **v2:** Ertalab yigʻilish boʻladi, barchangiz keling!

### 7. h2-073 (mkt) — score 88→100, v1-lint hits 0→0

Task: Charity post: support the city animal shelter — food and medicine list below, every little helps. 3 lines.

- **v1:** Shahar hayvonlar boshpanasi oziq-ovqat va dorilarga muhtoj — kerakli roʻyxat quyida. ⏎ Kichik yordam ham katta — biror narsa qoʻshib qoʻying. ⏎ Batafsil 👇👇👇
- **v2:** Shahar hayvonlar boshpanasi uchun yem va dori yigʻilmoqda, kerak roʻyxat quyida. ⏎ Kam boʻlsa ham qoʻshsangiz, katta yordam boʻladi. ⏎ Batafsil 👇👇👇

### 8. hd2-05 (long) — score 83→95, v1-lint hits 0→0

Task: Fitnes ilovasi uchun haftalik newsletter robot-matni (uzun): '''Bu hafta yangi mashg'ulotlar qo'shildi. Foydalanuvchilar uchun yangi imkoniyatlar yaratildi. Statistik ma'lumotlar yangilandi. Eng faol foydalanuvchilar taq…

- **v1:** Bu hafta yangi mashgʻulotlar qoʻshildi — bugunoq boshlashingiz mumkin. ⏎ Statistika sahifasi yangilandi: natijalaringiz endi aniqroq koʻrinadi. ⏎ Eng faol foydalanuvchilarni taqdirladik. Keyingi hafta roʻyxatda siz ham boʻlishingiz mumkin. ⏎ Kelgusi hafta rejalarini allaqachon belgilab qoʻydik — qis
- **v2:** Bu hafta yangiliklar koʻp! ⏎ Ilovaga yangi mashgʻulotlar qoʻshildi, endi tanlov yanada keng. Statistika boʻlimi ham yangilandi: natijalaringizni bir qarashda koʻrasiz. ⏎ Eng faol foydalanuvchilarimizni taqdirladik. Qoʻshilganingiz uchun rahmat! ⏎ Kelgusi hafta rejasi tayyor. Natijalar boʻyicha hisob

### 9. hd2-10 (switch) — score 86→100, v1-lint hits 0→0

Task: Ish e'loni: vakansiya matni rasmiy (talablar ro'yxati), lekin oxirida yoshlarcha qator: 'Agar o'zingizni ko'rsangiz — yozing!'. Ikkala ohang saqlansin.

- **v1:** Backend dasturchi vakansiyasi ⏎ Talablar: ⏎ - 2 yildan ortiq amaliy tajriba; ⏎ - Python yoki Go tilini bilish; ⏎ - Maʼlumotlar bazasi bilan ishlash koʻnikmasi; ⏎ - Jamoada ishlashga tayyorlik. ⏎ Shartlar muzokara orqali kelishiladi. Rezyumeni HR boʻlimiga yuboring. ⏎ Agar oʻzingizni koʻrsangiz — yoz
- **v2:** Vakansiya: frontend dasturchi. ⏎ Talablar: ⏎ 1. HTML, CSS va JavaScriptni puxta bilish. ⏎ 2. React bilan ishlash tajribasi. ⏎ 3. Jamoada ishlashga tayyorlik. ⏎ Ish haqi va ish rejimi suhbatda muhokama qilinadi. ⏎ Agar oʻzingizni koʻrsangiz, bemalol yozing!

### 10. hd2-01 (long) — score 90→100, v1-lint hits 0→0

Task: Klinik saytining xizmatlar bo'limi (4 paragraf, 300+ so'z sifatida ko'rsatilgan robot-matn): '''Klinikamiz zamonaviy tibbiyot standartlari asosida faoliyat yuritadi. Bemorlarga ko'rsatiladigan xizmatlar sifati doimiy naz…

- **v1:** Klinikamiz zamonaviy tibbiyot talablariga mos ishlaydi. Bemorlarga koʻrsatiladigan xizmat sifatini doim nazoratda tutamiz: har bir fikrni koʻrib, kamchiliklarni darhol tuzatamiz. ⏎ Tashxis boʻlimi eng soʻnggi uskunalar bilan jihozlangan. Laboratoriyadagi tahlillar qisqa vaqtda tayyor boʻladi — aksar
- **v2:** Klinikamizda tashxisdan laboratoriyagacha barcha xizmatlar bir joyda. Tashxis boʻlimi zamonaviy uskunalar bilan jihozlangan, tahlil natijalari qisqa vaqtda tayyor boʻladi. ⏎ Qabulga oldindan yozilib qoʻysangiz, uzoq kutib oʻtirmaysiz. Konsultatsiyani xohlasangiz onlayn, xohlasangiz klinikada oʻtkazi

## Where v1 won or tied (honesty)

- **h2-131** (formal): v1 score 97 vs v2 78 — v1 text: Yangi konveyerni oʻrnatish toʻgʻrisidagi ichki buyruq loyihasi ⏎ Ishlab chiqarish samaradorligini oshirish maqsadida buyuraman: ⏎ 1. Yangi k | v2: «Agromash Servis» MChJ ⏎ Ishlab chiqarish boshligʻining 2026-yil 22-oktabrdagi 48-sonli buyruq loyihasi ⏎ Yangi konveyer liniyasini oʻrnatis
- **h2-102** (en2uz): v1 score 100 vs v2 89 — v1 text: Stolingiz tayyor. Iltimos, administratorga murojaat qiling. | v2: Stolingiz tayyor. Iltimos, kirishdagi xodimga murojaat qiling.
- **h2-128** (formal): v1 score 100 vs v2 95 — v1 text: Dekanlikka ⏎ ARIZA ⏎ Oʻqishni bitirganim toʻgʻrisida maʼlumotnoma berishingizni soʻrayman. Hujjat ishga kirish uchun kerak boʻlmoqda. ⏎ Ilti | v2: Toshkent davlat texnika universiteti «Energetika» fakulteti dekanligiga ⏎ Kimdan: Qodirov Bekzod Ulugʻbekovich ⏎ 2019-2023-yillarda shu faku

Blind judging ties: 24/210.

## Verdict

v2 blind pairwise win rate: **55.7%** (target ≥70%). Hard-tier pass: **78.3%** (target ≥85%). **Below target — iterate (see iterations log).**

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
```

## Iterations log

| Round | Change | Result |
|---|---|---|
| 1 | v2 frozen after phase 5 (incl. general native-preservation + formal-stay rules added BEFORE generation, from the hard-mode spec). Held-out + hard written fresh, never used for rule tuning. | this report |
