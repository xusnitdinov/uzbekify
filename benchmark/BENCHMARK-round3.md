# BENCHMARK — uzbek-humanizer (v1, GitHub) vs uzbekify (v2)

Generated: 2026-10-24T16:03:01.025Z · one `npm run bench` pipeline, same model for all generation and judging, blind A/B with seeded shuffles.

## Final: v1 (GitHub) vs v2 — headline

v1 here is the published GitHub version (`reference-v1/`, github.com/xusnitdinov/uzbek-humanizer), rerun through the exact same pipeline after v2 was frozen (phase 6 §10).

| Metric | v1 (GitHub) | v2 (uzbekify) | baseline (no skill) |
|---|---|---|---|
| Naturalness score (0-100, higher = more human) | 96.08 ± 0.77 | **99.79 ± 0.15** | 75.25 ± 1.89 |
| v1 linter hits (lower better) | 0.02 | **0.02** | 1.63 |
| v2 linter findings (lower better) | 0.46 | **0.04** | 2.14 |
| Dashes per text (em/en/\" - \"; lower better) | 0.47 | **0** | 0.56 |
| Officialese rate /100 words | 0.41 | **0.21** | 0.38 |
| Russian-calque rate /100 words | 0 | **0** | 0.01 |
| Apostrophe/script errors per text | 0 | **0** | 1.6 |
| Sentence length (words; corpus mean 12) | 6.67 | **6.71** | 8.51 |
| chrF vs human references (higher better) | 15.4 ± 4.71 | **16.2 ± 1.8** | 11.8 ± 6.38 |
| Natural particle/spoken-form use in chat texts | 14/47 (29.8%) | **16/47 (34.0%)** | 4/47 (8.5%) |
| **Blind pairwise win** (v2 / tie / v1) | 71 losses | **107 wins (51.0%)** | — |
| **Hard-tier pass** (auto + judge) | 39/60 (65.0%) | **44/60 (73.3%)** | 8/60 (13.3%) |

## Blind pairwise judging (v1 vs v2, forced choice + tie)

Judge: same model, separate context, no skill files, outputs shuffled A/B (key withheld). Rubric: reference-v1 bakeoff rubric extended for naturalness — pick which sounds more like a real native Uzbek human.

| Category | v2 win | tie | v1 win | n | v2 win rate (95% CI) |
|---|---|---|---|---|---|
| Formal letter | 14 | 0 | 1 | 15 | 93.3% (70–99%) |
| UI microcopy | 12 | 3 | 10 | 25 | 48.0% (30–67%) |
| Hard: native input | 4 | 0 | 2 | 6 | 66.7% (30–90%) |
| Chat/Telegram | 14 | 6 | 10 | 30 | 46.7% (30–64%) |
| EN→UZ | 7 | 6 | 12 | 25 | 28.0% (14–48%) |
| Marketing | 8 | 2 | 15 | 25 | 32.0% (17–52%) |
| Hard: keep formal | 0 | 6 | 0 | 6 | 0.0% (0–39%) |
| RU→UZ | 13 | 4 | 3 | 20 | 65.0% (43–82%) |
| Hard: script | 4 | 0 | 2 | 6 | 66.7% (30–90%) |
| Hard: code-mixing | 3 | 0 | 3 | 6 | 50.0% (19–81%) |
| Hard: dash-heavy | 3 | 2 | 1 | 6 | 50.0% (19–81%) |
| Hard: idioms/slang | 4 | 1 | 1 | 6 | 66.7% (30–90%) |
| News | 8 | 0 | 2 | 10 | 80.0% (49–94%) |
| Hard: register switch | 4 | 0 | 2 | 6 | 66.7% (30–90%) |
| Hard: traps | 4 | 1 | 1 | 6 | 66.7% (30–90%) |
| Hard: long | 1 | 1 | 4 | 6 | 16.7% (3–56%) |
| Hard: subtle robot | 4 | 0 | 2 | 6 | 66.7% (30–90%) |
| **Overall** | **107** | 32 | 71 | 210 | **51.0%** (44–58%) |

## Hard mode

60 brutal items (frozen, sha256 in HASHES): long subtle robot prose, register switches inside one task, code-mixing with correct loans to KEEP, mixed Cyrillic/Latin with wrong apostrophes, idioms/sarcasm/slang that must not flatten, robotic-but-clean rhythm cases, gov/legal text that must stay formal, translation traps (false friends, aspect, evidentials, politeness), native-written inputs that must stay basically unchanged, dash-heavy restructuring.

| Model | Auto-checks pass | Judge pass | Final pass (auto ∧ judge) |
|---|---|---|---|
| baseline | 8/60 | 8/60 | **8/60 (13.3%)** |
| v1 | 43/60 | 39/60 | **39/60 (65.0%)** |
| v2 | 47/60 | 44/60 | **44/60 (73.3%)** |

Per-category hard pass (v2):

| Category | v2 pass | v1 pass | baseline pass |
|---|---|---|---|
| Hard: long | 1/6 | 1/6 | 0/6 |
| Hard: register switch | 6/6 | 4/6 | 0/6 |
| Hard: code-mixing | 6/6 | 6/6 | 0/6 |
| Hard: script | 5/6 | 5/6 | 1/6 |
| Hard: idioms/slang | 4/6 | 5/6 | 0/6 |
| Hard: subtle robot | 4/6 | 2/6 | 0/6 |
| Hard: keep formal | 4/6 | 4/6 | 1/6 |
| Hard: traps | 5/6 | 5/6 | 4/6 |
| Hard: native input | 3/6 | 2/6 | 2/6 |
| Hard: dash-heavy | 6/6 | 5/6 | 0/6 |

## Automatic metrics by category (held-out set)

| Category | n | score v1→v2 | v1 hits v1→v2 | dashes v1→v2 | officialese v1→v2 |
|---|---|---|---|---|---|
| Chat/Telegram | 30 | 93.57 → **100** | 0.03 → 0.07 | 0.73 → **0** | 0 → **0** |
| UI microcopy | 25 | 97.4 → **99.6** | 0 → 0 | 0.2 → **0** | 0.36 → **0** |
| Marketing | 25 | 92.52 → **100** | 0 → 0 | 0.84 → **0** | 0 → **0** |
| EN→UZ | 25 | 96.36 → **100** | 0 → 0 | 0.32 → **0** | 0 → **0** |
| RU→UZ | 20 | 98.65 → **100** | 0 → 0 | 0.15 → **0** | 1.18 → **0.63** |
| Formal letter | 15 | 100 → **97.67** | 0 → 0.07 | 0.13 → **0** | 1.13 → **0.26** |
| News | 10 | 99.8 → **100** | 0 → 0 | 0 → **0** | 0.53 → **0** |

## 10 striking side-by-side examples (v2 clearly more human)

### 1. h3h-01 (long) — score 62→100, v1-lint hits 0→0

Task: Davlat xizmatlari markazi sahifasi (4 paragraf, ~300 so'z robot-matn): '''Markaz fuqarolarga keng ko'lamda davlat xizmatlarini ko'rsatadi. Xizmatlar bir darcha tamoyili asosida tashkil etilgan. Arizalar elektron shaklda …

- **v1:** Bu yerda davlat xizmatlarini bitta oynadan olasiz. Ariza yuborish, hujjat topshirish, natijani olish — hammasi bir joyda, ortiqcha koʻchish yoʻq. Xizmatlar bir darcha tamoyili asosida tashkil etilgan. ⏎ Navbat haqida xavotir olmang: tizim navbatni oʻzi taqsimlaydi. Kelgan tartibingiz ekranda koʻrina
- **v2:** Bu markazda davlat xizmatlarining katta qismi bir darchada hal boʻladi. Arizangizni elektron shaklda topshirasiz, navbat avtomatik taqsimlanadi, darcha oldida kutib turmaysiz. ⏎ Mutaxassislar kerakli maʼlumotning hammasini toʻliq va tushunarli qilib beradi. Koʻp xizmatning muddati qisqargan, shikoya

### 2. h3-003 (chat) — score 72→100, v1-lint hits 0→0

Task: Pharmacy DM: customer asks if blood-pressure medicine is in stock. Admin reply: yes, 3 brands, prices listed. Chat register, 2 messages.

- **v1:** Assalomu alaykum! Ha, bor — qon bosimi uchun 3 xil dori mavjud. ⏎ Enap — 25 000 soʻm, Kapoten — 18 000 soʻm, Lozap — 42 000 soʻm. Qaysi biri kerak?
- **v2:** Salom, ha bor. Qon bosimi dorisidan 3 xil brend chiqdi ⏎ Narxlarni rasmda yozib qoʻydik, qaysi biri kerakligini aytsangiz, band qilib qoʻyamiz

### 3. h3h-06 (long) — score 83→100, v1-lint hits 0→0

Task: Ta'lim markazi blog posti (uzun robot-matn): '''O'quv markazlarimizda turli yo'nalishlar bo'yicha ta'lim beriladi. Kurslar boshlang'ich darajadan boshlanadi. Har bir o'quvchi uchun individual yondashuv ta'minlanadi. Usto…

- **v1:** Oʻquv markazimizda bir necha yoʻnalish bor — barchasi boshlangʻich darajadan boshlanadi, keyin oʻz darajangizga qarab davom etasiz. ⏎ Har bir oʻquvchi bilan alohida ishlaymiz: birinchi darsda kimning nimadan boshlashi kerakligini aniqlaymiz, keyin shu reja boʻyicha ketamiz. ⏎ Ustozlarimiz tajribali 
- **v2:** Oʻquv markazimizda turli yoʻnalishlar boʻyicha taʼlim beramiz. Kurslar boshlangʻich darajadan boshlanadi, noldan boshlaganlar ham erkin qoʻshiladi. ⏎ Har bir oʻquvchi bilan alohida ishlaymiz, ustozlarimiz tajribali mutaxassislar. ⏎ Muntazam test sinovlari oʻtkazamiz, natijalarni ota-onalarga xabar q

### 4. h3h-19 (script) — score 81→100, v1-lint hits 0→0

Task: Aralash xabar: 'Менинг hisobimdan mablag' yechildi — мен бунга рози эмасман!' — yagona lotin, tabiiy mijoz ovozi (quote sifatida) + admin javobi.

- **v1:** «Mening hisobimdan mablagʻ yechildi — men bunga rozi emasman!» ⏎ Admin: Holatni tekshirib oʻtdik. Yechilgan mablagʻ shu oyning obuna toʻlovi ekan, tarix boʻlimida koʻrinadi. Roziligingiz boʻlmasa, obunani oʻchirib, pulni qaytaramiz — shu chatga bitta yozsangiz boʻldi.
- **v2:** Mijoz: "Mening hisobimdan mablagʻ yechildi, men bunga rozi emasman!" ⏎ Admin: "Uzr, noqulay boʻldi. Hozir hisobingiz harakatini tekshiraman, qaysi sana va summa ekanini ham yozib yuborsangiz, tezroq aniqlaymiz. Sababi aniq boʻlishi bilan darhol javob beraman."

### 5. h3h-33 (rhythm) — score 81→100, v1-lint hits 0→0

Task: 4 marta 'Rahmat!' bilan boshlanuvchi javoblar turli ochilishga ega bo'lsin (xizmat ohangi saqlanadi).

- **v1:** Katta rahmat — buyurtmangiz qabul qilindi, tez orada yetkazamiz. ⏎ Zahmatingiz boʻlmasa, kodni qayta yuboring, hozir tekshirib olamiz. ⏎ Yozganingiz uchun tashakkur! Muammo bugun hal qilinadi. ⏎ Minnatdormiz — qoʻllab-quvvatlashga yozsangiz, birinchi navbatda javob beramiz.
- **v2:** 1. Assalomu alaykum! Tekshiryapman, bir oz kuting. ⏎ 2. Yordam beraman: sozlamalarni oching, xavfsizlik boʻlimiga oʻting. ⏎ 3. Uzr, noqulay boʻldi. Xatoni topdim, yangi kod yubordim. ⏎ 4. Marhamat, bunday savollar boʻlsa yozaveriling, doim javob beramiz.

### 6. h3-112 (ru2uz) — score 100→100, v1-lint hits 0→0

Task: Переведите (UI): «Пароль слишком короткий. Минимум 8 символов.»

- **v1:** Parol juda qisqa. Kamida 8 ta belgi boʻlishi kerak.
- **v2:** Parol juda qisqa. Kamida 8 ta belgi kiriting.

### 7. h3-036 (ui) — score 98→100, v1-lint hits 0→0

Task: Camera permission text for a document-scanner app: what it's for + Deny/Allow. Uzbek.

- **v1:** Ushbu ilova hujjatlarni skanerlash uchun kameradan foydalanadi. ⏎ Ruxsat bermaslik ⏎ Ruxsat berish
- **v2:** Kamera hujjatni suratga olish uchun kerak ⏎ Ruxsat bermaslik ⏎ Ruxsat berish

### 8. h3h-14 (codemix) — score 86→100, v1-lint hits 0→0

Task: Devs chati: 'build break boldi, mainni blokaldi' — yangi xodimga tushuntirish, atamalar qolsin, tabiiy.

- **v1:** Build break boʻldi degani, kodni tekshirish bosqichi xato bilan toʻxtadi, shuning uchun main ham bloklandi — yangi merge hozircha oʻtmaydi. Hozircha shunday qilamiz: oʻz commitlaringizni tekshirasiz, xatoni tuzatib, yana build olasiz. Tayyor boʻlgach, mainni ochamiz. Qayeri tushunarsiz boʻlsa, kanal
- **v2:** Ha, build break boʻldi, CI mainni bloklab qoʻydi. Sababi oxirgi commitda testlar qizil chiqdi. Push qilishdan oldin testlarni lokaldan ishga tushirib koʻr, yashil boʻlmasa mergeni kut. Chigal joy boʻlsa, menga yoz, birga qaramiz.

### 9. h3h-08 (switch) — score 88→100, v1-lint hits 0→0

Task: Maktab chat guruhi: o'qituvchi rasmiy e'lon (dars jadvali o'zgardi) + ota-onalarning savoli + o'qituvchi javobi. Uch bosqich chat ohangida, rasmiy qism rasmiy.

- **v1:** Ota-onalarga eʼlon: payshanba kuni dars jadvalidagi oʻzgarish kuchga kiradi. Birinchi dars 8:30 da boshlanadi, barcha oʻquvchilar uchun majburiy. ⏎ — Farzandim ertaroq yetib borishi mumkin boʻladi, desam xato qilmayman. Darsliklarni ham yangi vaqtga moslab olib boramizmi? ⏎ — Ha, darsliklarni yangi 
- **v2:** Assalomu alaykum, hurmatli ota-onalar. Ertaga, 27-oktabr kuni dars jadvali oʻzgaradi: darslar soat 9:00 da boshlanadi. Iltimos, hisobga oling. ⏎ Ota-ona: Salom ustoz, oxirgi dars ham suriladimi? ⏎ Oʻqituvchi: Ha, hammasi bir soatga suriladi. Oxirgi dars 14:00 da tugaydi, iltimos, oʻz vaqtida olib ke

### 10. h3h-18 (codemix) — score 88→100, v1-lint hits 0→0

Task: Startup e'loni: 'seed round yopildi, hiring mode ON, barcha pozitsiyalar linkedinda' — jonli e'lon, atamalar qoladi.

- **v1:** Katta yangilik: seed round yopildi! Endi hiring mode ON — barcha ochiq pozitsiyalar LinkedIn sahifamizda. Jamoamizni kengaytirib, mahsulotni yanada kuchli qilamiz. CV yuboring — birga ishlaymiz!
- **v2:** Katta xabar: seed round yopildi! Endi hiring mode ON, jamoamiz kengayib boradi. Ochiq pozitsiyalarning hammasi LinkedInʼda, qiziqqanlar profilimizga koʻz tashlang. Keling, birga oʻsamiz!

## Where v1 won or tied (honesty)

- **h3-130** (formal): v1 score 100 vs v2 95 — v1 text: Hurmatli provayder vakillari! ⏎ Boshqa shaharga koʻchib ketganligim sababli mening nomimga rasmiylashtirilgan internet xizmati shartnomasini | v2: Kimga: «NetLink Servis» MChJ mijozlar boʻlimiga ⏎ Kimdan: Sergeli tumani, 5-kvartal, 21-uy, 63-xonadon abonenti Yusupov Sanjar Bahodirovich,
- **h3-126** (formal): v1 score 100 vs v2 95 — v1 text: Ariza ⏎ Hududiy gaz taʼminoti korxonasiga ⏎ Uyimda oʻrnatilgan gaz hisoblagichi kalibrdan chiqqani aniqlandi: raqamlari notoʻgʻri koʻrsatmoq | v2: Kimga: «Hududgaztaminot» AJ Toshkent shahar filiali bosh direktoriga ⏎ Kimdan: Chilonzor tumani, Bunyodkor mahallasi, 12-uy, 45-xonadon fuqa
- **h3-134** (formal): v1 score 100 vs v2 95 — v1 text: Hurmatli sugʻurta kompaniyasi! ⏎ Mening nomimga rasmiylashtirilgan polisning amal qilish muddatini uzaytirishni soʻrayman. Shuningdek, toʻlo | v2: Kimga: «Kafolat Hayot» sugʻurta kompaniyasi Toshkent filiali rahbariga ⏎ Kimdan: Yakkasaroy tumani, Bobur koʻchasi, 3-uy, 11-xonadon fuqaros

Blind judging ties: 32/210.

## Verdict

v2 blind pairwise win rate: **51.0%** (target ≥70%). Hard-tier pass: **73.3%** (target ≥85%). **Below target — iterate (see iterations log).**

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
```

## Iterations log

| Round | Change | Result |
|---|---|---|
| 1 | v2 frozen after phase 5 (incl. general native-preservation + formal-stay rules added BEFORE generation, from the hard-mode spec). Held-out + hard written fresh, never used for rule tuning. | this report |
