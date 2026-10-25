# Human voice — the primary target (CORE MISSION)

AI models learned Uzbek mostly from Wikipedia and officialese, so they write
robot. The goal of this skill is text that sounds like a real Uzbek person
wrote it. Wikipedia, kun.uz and state news are sources of **correct spelling
and vocabulary only** — never a model of how to sound.

The voice targets come from real people: Telegram chats, app-store reviews,
support threads, comments, casual posts (see `research/FINDINGS.md`), plus
one surprise from the gov corpus: **my.gov.uz — the state's own portal —
writes its UI like a person** ("Xush kelibsiz! Barcha rasmiy hujjatlar bir
joyda, qo'l ostida", "Bog'chaga qanday qo'yish mumkin?"). Robotic register is
how documents are written, not how people or products talk.

## What human Uzbek actually sounds like

| Signal | Example | Robot version |
|---|---|---|
| Spoken aspect -yapti | Kod kelmayapti | Kod yetkazib berilmadi |
| Converbx + auxiliary | yangilab qoʻying, tushunib qoldim | yangilanishini amalga oshiring |
| Plain state verbs | qotyapti, tushmayapti, oʻxshamadi | texnik nosozlik yuz berdi |
| Real glue (chat only) | mana, endi, boʻlsa, axir, zoʻr, gap yoʻq, yomon emas | mo'tadil, nisbatan, tegishlicha |
| Understated praise | qulay, yomon emas, gap yoʻq | eng yaxshi tajriba, mukammal |
| Question-first help | Nima kerak? Bog'chaga qanday qo'yish mumkin? | Sizga qanday yordam bera olaman? |
| Numbers like people | 300+, bir-ikki daqiqa | belgilangan muddat davomida |
| Direct address | Xush kelibsiz! / (name) | Hurmatli foydalanuvchi |

## The robotic patterns to kill (mined from gov.uz / lex.uz / president.uz)

Full bank with attestations in `research/FINDINGS.md`; quick blacklist for
every non-official register:

mazkur · ushbu · belgilangan tartibda · amalga oshirilishi kerak/lozim ·
-lishi kerak/lozim chains · har tomonlama · tegishli tarzda/tartibda ·
nazarda tutilgan hollarda · zimmasida bo'ladi · e'tiboran · muvofiq
ravishda · o'z navbatida · katta e'tibor qaratildi · belgilab berildi ·
chora-tadbirlar · faoliyat yuritish · tubdan takomillashtirish ·
to'g'risidagi (titles) · Davlatimiz rahbari · quyidagi/yuqoridagi (casual) ·
olib borilmoqda · o'tkazilmoqda · xabardor qilinasiz · yo'l qo'yildi ·
yo'lga qo'yildi · samarali hamkorlik · yanada rivojlantirish ·
imkoniyati bilan ta'minlandi · talab etiladi · munosabati bilan · doirasida

These are **correct** in the `official` register (laws, decrees, state
releases) and mostly acceptable in `news`/`legal`/`academic` — that's why
the officialese linter is register-scoped, not absolute.

## AI chat-tells (never human)

"Ajoyib savol!" · "Albatta!" · "Tabriklar!" · "Zo'r tanlov!" · "Xulosa
qilib" in a short answer · "Hurmatli foydalanuvchi" · "Haqiqatan ham" as an
opener.

## Sentence rhythm

People vary length: a 3-word punch, then a 12-word line. Officialese hums at
one monotone length (the cadence linter catches runs of 5+ near-identical
sentences). Questions are fine and human; walls of -ishi chains are not.

## The mirror rule (when the input is already human)

If the source text already sounds like a real person — chat message, review,
quote, announcement — your job is nearly done: fix script marks and clear
errors, change nothing else. Rewriting human text into "cleaner" text is a
failure: it strips the very voice this skill exists to protect. Real text is
allowed to be uneven, miss capitals, use slang and code-switch.

## Procedure check (per rewrite)

1. Read your draft aloud — would a Toshkent speaker say this to a friend?
2. Replace every document-word (mazkur → bu, ushbu → shu…).
3. Convert -lishi kerak chains to who-does-what.
4. Add ONE human signal max to chat copy (a -yapti, an "endi") — never
   stack particles to fake it.
5. Verify with `uzpro score`: human-voice bonus signals should appear.
