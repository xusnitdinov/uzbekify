# Register presets

Pick ONE preset before rewriting (step 1 of the ladder). **CORE MISSION: the
default voice is human** — informal-chat, comment, spoken-style. Formal
presets (`official`, and partially `news`/`legal`/`academic`) exist ONLY for
when the user explicitly needs formal text; they are mined from
gov.uz/lex.uz/president.uz (see `research/FINDINGS.md`) and their officialese
is correct there and robotic everywhere else. Every example here uses the
canonical orthography (oʻ/gʻ = ʻ U+02BB, tutuq = ʼ U+02BC) — copy freely.

## 1. `product` — UI strings, microcopy, buttons, errors

- Address: **Siz only** (`qilasiz`, `Keling`); no `-san`, no bare `Kel`
- Length: 2–10 words (buttons ≤3); one idea per error
- Particles: none. Slang: none. English verbs: none
- Examples:
  1. Saqlash
  2. Bekor qilish
  3. Qaytadan urinib koʻring
  4. Bu maydon toʻldirilishi shart
  5. Notoʻgʻri parol
  6. Soʻrovingiz boʻyicha hech narsa topilmadi
  7. Yuklanmoqda…
  8. Bosh sahifaga qaytish
  9. Kod muddati tugadi
  10. Kodni qayta yuborish
  11. Toʻlov amalga oshmadi
  12. Balansni toʻldirish
  13. Internet ulanmay qoldi
  14. Saqlab boʻlmadi
  15. Iltimos, keyinroq qayta urinib koʻring

## 2. `quiz` — DTM/school/product test stems

- Address: Siz; stems imperative (`belgilang`, `toping`), `gap` not `jumla`
- Length: 4–12 words
- Examples:
  1. Toʻgʻri javobni belgilang
  2. Notoʻgʻri gapni toping
  3. Mos keladigan javobni belgilang
  4. Nuqtalar oʻrniga mos soʻzni yozing
  5. Qavs ichidagi soʻzni toʻgʻri shaklda yozing
  6. Xato qatorni toping
  7. Matnni oʻqing va javobni belgilang
  8. Qaysi gapda xato bor?
  9. Avval nima qilasiz?
  10. Barcha mos javoblarni belgilang

## 3. `assistant` — support/help chat

- Address: Siz; light particles OK (`xoʻp`, `mayli` at most once)
- Length: 6–16 words; no false certainty
- Openers: `Assalomu alaykum!` (not Hurmatli foydalanuvchi)
- Request shape: `-sangiz` ending: "batafsil yozib yuborsangiz."
- Examples:
  1. Toʻgʻri tushungan boʻlsam, masala shunda.
  2. Keling, birga tekshirib chiqamiz.
  3. Iltimos, bu qatorni yuboring.
  4. Agar boʻlmasa, keyingi qadamga oʻtamiz.
  5. Menimcha, bu joyda kalit notoʻgʻri.
  6. Odatda shu usul yordam beradi.
  7. Yana savol boʻlsa, yozing.
  8. Bir oz kuting, tekshiryapman.
  9. Buni aniq aytolmayman, lekin tekshirib koʻramiz.
  10. Uzr, noqulay boʻldi.

## 4. `youth` — Telegram/peer chat (ONLY on explicit request)

- Address: sen or siz depending on the peer; RU-matrix words allowed
- Label output `draft/native_review_required`
- Examples (sentence-level, what v1 lacked):
  1. Zoʻr, ketdik.
  2. Gap yoʻq, ishlaydi.
  3. Qisqasi, shu.
  4. Boʻldi, yubordim.
  5. Qani, qayta urinamiz.
  6. Ha a, shu toʻgʻri.
  7. Nima gap, tinchmi?
  8. Bu joyi zoʻr chiqibdi.
  9. Mayli, sinab koʻramiz.
  10. Tamom, yakun.
- Even here: no invented slang, no EN fandom words beyond the live set
  (`story`, `reel`, `post` — see loanword-policy.md).

## 4b. `chat` — Telegram-style DMs and casual messages (phase 2b)

The register closest to the CORE MISSION voice targets
(references/informal-chat.md). Address: Siz or sen by relationship; sen
allowed by default here (`uzpro lint --register chat` implies --allow-sen).

- Length: 1-12 words per message; sentences ≤15 words; one idea per line
- Punctuation: loose (dropped capitals/terminal dots are fine); NEVER dashes
  (—, –, " - "), no semicolons, no bullet lists; 👇/✅ pointers OK
- Particles: one per message max (-ku, -chi, -yov, axir, endi)
- Spoken forms in ECHOES of user voice stay verbatim (nma, qale, kere, bn);
  brand-voice chat uses standard spelling but spoken rhythm
- Examples (voice shape from research/informal-corpus/):
  1. Keldim, kutaman
  2. Rahmat aka, zoʻr boʻldi
  3. Kod kelmayapti, yana yubordim
  4. Batafsil 👇
  5. Boʻldi, yubordim
  6. Nima gap, tinchmi?
  7. Mayli, keyinroq gaplashamiz
  8. Ha a, shu toʻgʻri
  9. Iltimos, batafsil yozib yuborsangiz, tekshirib oʻtamiz
  10. Uzr, noqulay boʻldi

## 5. `marketing` — landing pages, promo, growth copy

- Address: Siz; warm but concrete; no brochure nouns, no unverifiable claims
- Length: 5–16 words
- Examples:
  1. Kerakli narsalar bir joyda.
  2. Bir necha daqiqada ishga tushadi.
  3. Bugun sinab koʻring.
  4. Vaqtingizni tejang.
  5. Jamoa bilan ishlash osonlashadi.
  6. Yangi versiya chiqdi, sinab koʻring.
  7. Boshlash uchun roʻyxatdan oʻting.
  8. Savol boʻlsa, tez javob olasiz.
  9. Tez, sodda, foydali.
  10. Shunchaki sinab koʻring.

## 6. `academic` — thesis prose, annotations, papers

- Address: impersonal/1pl; formal lexicon is CORRECT here (mazkur, ushbu OK
  in moderation); passive allowed for procedure, not for findings
- Structure: annotation (annotatsiya) 100–150 words, key words (kalit
  soʻzlar) 5–7 items
- Connectors: tadqiqotda, natijada, xulosa qilib, shuningdek, bundan
  tashqari (once each)
- Examples:
  1. Ushbu maqolada … masalasi tahlil qilinadi.
  2. Tadqiqotning maqsadi … ni aniqlashdan iborat.
  3. Natijalar shuni koʻrsatadiki, …
  4. Tahlil jarayonida statistik usullardan foydalanildi. (procedure passive OK)
  5. Bizning xulosamizcha, … (findings active)
  6. Kalit soʻzlar: tilshunoslik, korpus, chastota, uslub, tahlil.
  7. Kelgusi tadqiqotlar uchun … tavsiya etiladi.
- Avoid: hozirgi kunda filler, muvofiq ravishda, oʻz navbatida (§B3
  calque bank), youth particles, Siz/sen address of the reader.

## 7. `news` — headlines and body (kun.uz style)

- Headline: short fact, optional ": tafsilotlar" / savol tail (never a dash); place names in
  Uzbek; no clickbait calques
- Body: Siz/impersonal, active verbs, attribution first ("…, deb X
  axborot qiluvchisiga maʼlum qildi" — once per story)
- Examples:
  1. Toshkentda yoʻl harakati cheklovlar joriy etildi: tafsilotlar
  2. Buxoroda "Karvon" bozori yonib ketdi: tafsilotlar
  3. Elektr uzilishlari qachon tugaydi? (savol shakli OK)
  4. Quyi Chirchiqda yangi maktab ochildi
  5. Ob-havo: dam olish kunlarida issiq boʻladi
- Avoid: katta eʼtibor berildi, amalga oshirildi chains, belgilab berildi.

## 8. `legal-lite` — readable ToS, consent, policy blurbs

- Address: Siz; plain language, no fake statutes; draft label required
- Length: 7–18 words per sentence
- Examples:
  1. Bu matn yuridik maslahat emas.
  2. Foydalanish shartlari bilan tanishing.
  3. Zarur boʻlsa, huquqshunos bilan maslahatlashing.
  4. Rozilikni istalgan payt qaytarishingiz mumkin.
  5. Maʼlumotlaringiz siyosatga muvofiq ishlatiladi.
  6. Bu amalni bekor qilib boʻlmaydi.
  7. Xizmat "mavjud holatda" taqdim etiladi.
  8. Oʻzgarishlar haqida oldindan xabar beramiz.
  9. Bahsli holatlarda qoʻllab-quvvatlash xizmatiga yozing.
  10. Holat: draft/native_review_required

## 9. `official` — laws, decrees, state releases (explicit request only)

Mined verbatim from lex.uz / gov.uz / president.uz (research/gov-corpus/).
This register KEEPS the document style the officialese linter flags
everywhere else; output is `draft/native_review_required` for binding texts.

- Impersonal, no Siz/sen; passive constructions are correct here
- Examples (attested):
  1. Maʼmuriy tartib-taomillar qonunchilik hujjatlariga muvofiq amalga oshirilishi kerak.
  2. Idoralararo hamkorlik qonunchilikda belgilangan tartibda amalga oshiriladi.
  3. Ushbu Qonun kuchga kirgan kundan eʼtiboran qoʻllanadi.
  4. Mazkur tartib barcha tashkilotlar uchun majburiy.
  5. Vazirlar Mahkamasi qarori bilan tasdiqlandi.
- The `-lishi kerak`, `belgilangan tartibda`, `mazkur/ushbu` patterns are
  CORRECT here and only here. News/legal-lite/academic may keep the Tier-B
  subset (see references/human-voice.md).

## How to detect the register from input (when the user didn't say)

| Signal in source | Preset |
|---|---|
| DM phrasing, 👇/✅ posts, sen/particles, "nima gap, tinchmi" | chat |
|---|---|
| Buttons, labels, `Save/Cancel`, JSON keys, DTM stems | product / quiz |
| -san forms, RU fillers, emoji, Telegram quotes | youth (confirm first) |
| "landing", "promo", CTA asks, benefit claims | marketing |
| annotatsiya, tadqiqot, uslub, citation shapes | academic |
| headline shapes, kun.uz/daryo mentions, dates in titles | news |
| shartlar, rozilik, maslahat emas, cheklovlar | legal-lite |
| qaror, nizom, modda, kuchga kiradi, Vazirlar Mahkamasi | official (confirm!) |
| Assalomu alaykum, support replies, -sangiz requests | assistant |

Mixed input → ask once, or default to `product` + Siz and say so in
Oʻzgarishlar.
