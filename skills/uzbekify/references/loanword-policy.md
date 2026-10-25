# Loanword policy (KEEP / REPLACEABLE / youth-only)

Maqsad "sof" koʻrinish emas — odamlar ishlatadigan, maʼnosi ravshan soʻzni
qoldiring. Soxta adabiy poklik matnni robotdek qiladi (v1 rule, kept).

## KEEP (normal product/daily copy)

Wi‑Fi, foto, OTP, laptop, brand, cookie, email, PIN, Google, Telegram,
Instagram, onlayn, oflayn, link, chat, QR-kod, video, bonus, promokod,
keshbek, skrinshot, Telegram-bot, profil, test, lokatsiya, menejer, ofis,
karta, fayl. Standard forms are
assimilated spellings: onlayn (not online), promokod (not promo-code),
lokatsiya, keshbek.

## REPLACEABLE (Uzbek equivalent exists — the linter flags these)

check→tekshirish, update→yangilash, support→yordam/qoʻllab-quvvatlash,
share→ulashish/yuborish, click→bosish, save→saqlash, cancel→bekor qilish,
delete→oʻchirish, confirm→tasdiqlash, download→yuklab olish, upload→yuklash,
login→kirish, logout→chiqish, send→yuborish, skip→oʻtkazib yuborish,
price→narx, task→vazifa, team→jamoa, project→loyiha, deadline→muddat,
meeting→uchrashuv/yigʻilish, feedback→fikr, boss→rahbar, friend→doʻst,
easy→oson, fast→tez, free→bepul, sale→chegirma, discount→chegirma,
gift→sovgʻa, message→xabar.

## Youth-only (Telegram/peer, on explicit request, draft label)

story, post, reel, like, follow, DM, podcast, stream, vlog, meme, donat,
crack, apk. Product copy never uses these; `DMʼga yozing` → `Xabar yozing`,
`like bosing` → `Yoqdi deb belgilang`.

## REWRITE always (EN filler swagger — error severity)

ship, vibe, teammate, Systems brain, portladi, hard mode, cringe, random,
literally, mindset. Full table with fixes in `calque-bank.md` §A1.

## Ambiguous — context decides

| Word | Keep when | Rewrite when |
|---|---|---|
| app | UI/store context ("Ilovani yangilang" preferred, "app" ok in store listings) | general prose |
| account | login/bank product | profile sense (hisob/profil) |
| plan | tariff name | user intention (reja) |
| support | department name | in-sentence (yordam) |
| deadline | professional chat | career quiz (muddat qisib qolsa) |
| meeting | work calendar | general meeting (uchrashuv) |

## Density rule

Tech-heavy copy can run ~8% assimilated loans. Beyond that, or when the same
EN word appears 3+ times, swap alternates in. The linter's `loan.density`
info-rule measures this.
