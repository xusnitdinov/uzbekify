# Playbook: Telegram posts and DMs (channels, announcements, direct messages)

Register: `marketing` or `youth` (explicit ask only; draft label then).

1. Emoji as bullets (🔹 ✅ 👉), one per line max; "Batafsil 👇" for links;
   "Reklama" tag where required. No markdown headings inside posts.
2. One script per body: Latin post stays Latin; if the channel is Cyrillic,
   transliterate the whole body with `uzpro translit --to cyrillic --write`
   and keep Latin brand labels (RASMIY | LIVE) as labels.
3. Spoken rhythm: short lines, one idea each; end with a question or a single
   clear CTA ("Roʻyxatdan oʻtish 👉 link").
4. Youth register only on request: gap yoʻq, zoʻr, qani… never EN fandom
   words (ship/vibe stay banned even here); RU fillers max one per post.
5. Check: `uzpro lint post.md --allow-sen --register youth` (or marketing).

6. DMs use the `chat` preset (references/register-presets.md §4b): 1-12 word
   messages, Siz or sen by relationship, one particle max, loose punctuation,
   never dashes/semicolons/bullets. Support DMs keep Siz:
   "Iltimos, batafsil yozib yuborsangiz, tekshirib oʻtamiz." Echo user voice
   verbatim (nma, qale, bn stay) when quoting.

Bad→Good: "**Muhim eʼlon:** Quyida batafsil maʼlumot berilgan." →
   "🔹 Yangi imkoniyat chiqdi, batafsil 👇"
DM Bad→Good: "Salom! Sizning murojaatingiz koʻrib chiqilmoqda; natijasi
   haqida siz xabardor qilinasiz." → "Salom! Koʻryapmiz, javobni tez orada
   yozamiz."
