# Informal chat — real voice vs robotic AI (CORE MISSION reference)

Source: research/informal-corpus/ (Telegram channel posts, real quoted speech
from kun.uz interviews/stories, v1-attested review/comment voice; see
MANIFEST.md + MINING.md). All examples anonymized. Every real example below
is paired with the robotic AI version of the same message — that contrast IS
the core mission.

## 1. Real message × robotic rewrite (the core table)

| # | Real (anonymized, attested) | Robotic AI version | What the robot gets wrong |
|---|---|---|---|
| 1 | nma qilsam boladi  [GP-PAYME] | Men bu vaziyatda qanday harakat qilishim kerak? | nma/boladi spoken pair; robot adds a subject and formal frame |
| 2 | qilish kk ekan  [YT-XAB] | Buni qilish talab etiladi ekan | kk = kerak; robot reaches for talab etiladi |
| 3 | yaxwi ediku  [GP-PAYME] | Bu, albatta, yaxshi edi | glued -ku particle; robot adds albatta filler |
| 4 | boʻladi-yov  [YT-XAB] | Bu, ehtimol, ishlashi mumkin | -yov particle; robot hedges with mumkin |
| 5 | endi paymeni udalit qilamz  [GP-PAYME] | Endi Payme hisobini oʻchirib tashlaymiz | qilamz spoken plural; code-switch is the point (user voice) |
| 6 | raxmat  [GP-TEZKOR] | Sizning murojaatingiz uchun minnatdorchilik bildiraman | one word vs corporate ceremony |
| 7 | juda yomon qotyabdi  [GP-PAYME] | Ilova ishlashida jiddiy nosozliklar kuzatilmoqda | qotyabdi = the real freeze verb; robot reports |
| 8 | nega pul yechib olasizlar  [GP-PAYME] | Nega sizlar pulimni yechib olasizlar? (still stiff) → robot: "Nima uchun mablagʻ yechib olinmoqda?" | plural -sizlar address is natural; robot passivizes |
| 9 | sizlarga xam tavsiya qilaman  [GP-TEZKOR] | Barcha foydalanuvchilarga tavsiya etaman | xam spelling, sizlarga plural, qilaman not etaman |
| 10 | reklama qoymela  [GP-OLX] | Iltimos, reklama joylashtirmanglar | qoymela = glued spoken plural command |
| 11 | “Bir yarim oy ichida 300 ming dollar yutqazdim”  [kun quote] | Shu davrda jiddiy moliyaviy yoʻqotishlar sodir boʻldi | first person + exact number = human |
| 12 | “qarzingni ber, yoʻqsa oʻldirib yuboraman”  [kun quote] | Qarz qaytarilmasa, jiddiy oqibatlar boʻlishi mumkin | threat quoted verbatim — people quote speech raw |
| 13 | Batafsil 👇👇👇  [TG-QAL] | Batafsil maʼlumot quyida keltirilgan | emoji pointer vs formal filler |
| 14 | ✅ Roʻyxatdan oʻtish — 11-oktabrgacha  [TG-XB] | Roʻyxatdan oʻtish muddati 11-oktabrgacha belgilangan | emoji bullet + dash-free date |
| 15 | operatorlar bn  [GP-PAYME] | Operatorlar bilan bogʻlanish orqali | bn contraction is native chat spelling |

## 2. Chat grammar of real people

- **Dropped subjects**: verb-first or object-first, pronoun omitted — "Keldim",
  "Boʻldi", "Yubordim". AI writes "Men keldim" every time.
- **Particles do the intonation**: -ku ( insistence: yaxwi ediku), -yov
  (dismissal: boʻladi-yov), -chi (prompt: Sen-chi?), -da (men-da), -mi
  (question). One per message, not stacked.
- **Spoken forms are correct here**: nma, qale, qanaqa, kere (not kerak in
  fast chat), boladi/bovotti, yoq, xam (for ham), bn (bilan), kk (kerak),
  qilamz/qilamiz elisions. These belong to USER VOICE quoting and chat
  register — never to product UI.
- **Code-switch is natural in user voice**: zakaz, udalit qilmoq, donat,
  interneti juda rasvo — a message can be 80% Uzbek with RU/EN shards.
- **Laughter & emoji**: xaxa, ")))", 👇 for links, ✅/🔹 as bullets, 🔥😂👍
  sparingly. Zero emoji = robotic; ten emoji = spam.
- **Greetings/sign-offs**: salom / assalomu alaykum / rahmat / rahmat aka /
  keyin koʻrishguncha. Never "Hurmatli foydalanuvchi".
- **Apostrophe chaos is the norm**: real chat writes o‘ (U+2018) more than oʻ
  (U+02BB) — mined counts: o‘ 56 vs oʻ 12 in Telegram posts. When REWRITING,
  always normalize to oʻ; when QUOTING user voice, keep it verbatim.
- **Numbers raw**: "800 ming", "1mln200", "300 ming dollar" — no thousand
  spaces in chat.

## 3. The robotic tells (flagged by the `aitell` family)

- em dash / en dash / spaced hyphen " - " → rewrite with a comma, a period,
  or restructure (GLOBAL rule: the skill never outputs these, any register)
- semicolons in chat
- bullet lists inside a chat message
- 20+ word sentences in chat register
- formal connectors in casual text: shuningdek, binobarin, xususan, mazkur,
  ushbu
- stacked adjectives ("katta, qulay va zamonaviy platforma")
- perfect punctuation in casual register (every sentence capitalized and
  terminated, zero particles)
- literally translated English AI tics: "Haqiqatan ham…", "Eʼtiboringiz uchun
  rahmat", "Sizga maʼlum boʻlishi kerakki…"

## 4. When you rewrite chat register

1. Keep the user's particles and spoken forms if the task is quoting/echoing
   user voice; normalize spelling marks only.
2. For brand-voice chat (support, bot replies): short sentences, Siz lane,
   ONE particle max, dashes → commas, no bullets (numbered steps on separate
   messages if needed).
3. `uzpro lint --register chat` validates; `uz_score` adds the human-voice
   bonus for -yapti/-ib qoʻy- and glue.
