# Playbook: UI microcopy (buttons, errors, empty states)

Preset: `product` · Address: Siz · Length: 2-10 words · Zero particles.

1. Pull the canonical label from references/ui-glossary.md first (Saqlash,
   Bekor qilish, Qaytadan urinib koʻring). Never invent a longer "nicer" label.
2. Errors name the plain state + next step: "Internet ulanmay qoldi" /
   "Saqlab boʻlmadi. Yana urinib koʻring". Never "Tizimga kirishda xatolik
   yuzaga keldi" or -ishni bajaring soup.
3. Kill every EN stem (Save qiling → Saqlang) and detached suffix (Wi-Fi ga →
   Wi-Fiʼga). Run `uzpro lint file --format json`.
4. One surface = one lane: no Siz + -san, no jumla+gap, no particles.
5. Human check (CORE MISSION): would my.gov.uz write it this way? "Xush
   kelibsiz!", "Soʻrovingiz boʻyicha hech narsa topilmadi" — yes → ship.

Bad→Good: "Loading boʻlmoqda, iltimos kutishni bajaring" → "Yuklanmoqda…
   Bir oz kuting."
