# FINDINGS — gov corpus mining (research/gov-corpus/)

Fetched 2026-10-23/24 from gov.uz, president.uz, lex.uz, my.gov.uz, stat.uz,
uza.uz (URLs in `gov-corpus/manifest.md`). The corpus serves the CORE MISSION
two ways: (1) the correct formal register for when a user explicitly needs
official text, and (2) the robotic pattern bank the linter flags and rewrites
in every non-official register. Wikipedia/news remain spelling/vocabulary
sources only — never a model of how to sound.

## Finding 1 — The state's own product UI is human-voiced

The strongest signal in the corpus: my.gov.uz — the flagship state portal —
writes its UI like a person:

- "Xush kelibsiz!" (not "Hurmatli foydalanuvchi")
- "Barcha rasmiy hujjatlar bir joyda, qo'l ostida."
- "Bog'chaga qanday qo'yish mumkin?" (spoken question, not "Belgilangan
  tartibda ro'yxatga olish tartibi to'g'risida ma'lumot")
- "Navbatlarni hech narsani o'tkazib yubormang."
- "So'rovingiz bo'yicha hech nima topilmadi." (v1's attested pattern, live)

Meanwhile the same state's LAWS and press releases are maximally officialese
("belgilangan tartibda amalga oshiriladi", "ushbu Qonunga muvofiq"). So the
robotic register is not "how institutions write" — it is how *documents* are
written. Product, chat, marketing copy in Uzbek must sound like the portal,
not the decree. This is the design anchor for the officialese linter.

Bonus finding: my.gov.uz's own pages contain the digraph-tutuq apostrophe bug
("Bog'chaga", "E'lonlar" with the wrong mark class) — `uzpro normalize` fixes
exactly this class.

## Finding 2 — The robotic pattern bank (mined, with attestation)

Tier A — robotic everywhere except the `official` register. Even formal
non-official prose (news body, legal-lite, academic) reads better without
most of these; casual registers must never have them.

| Pattern | Attestation | Human rewrite |
|---|---|---|
| mazkur | lex.uz law: "mazkur ishni xolisona… koʻrib chiqish" | bu / shu |
| ushbu (casual copy) | lex.uz: "ushbu Qonunga muvofiq" | bu / shu (keep ushbu in official docs) |
| belgilangan tartibda | lex.uz: "qonunchilikda belgilangan tartibda amalga oshiriladi" | kerakli tartibda / oddiygina (yoki o'chiring) |
| amalga oshirilishi kerak/lozim | lex.uz: "muvofiq amalga oshirilishi kerak" | qilinishi kerak / qiling |
| har tomonlama | lex.uz: "xolisona, har tomonlama va toʻgʻri" | toʻliq / atrofilicha (by sense) |
| tegishli tarzda | lex.uz: "tegishli tarzda xabardor qilish hisoblanadi" | xabardor qilinadi (cut) |
| nazarda tutilgan hollarda | lex.uz: "qonunda nazarda tutilgan hollarda" | agar qonunda aytilgan bo'lsa |
| zimmasida bo'ladi | lex.uz: "xarajatlar … zimmasida boʻladi" | … to'laydi / … hisobidan |
| e'tiboran | lex.uz: "ariza berilgan paytdan eʼtiboran" | …dan boshlab |
| muvofiq ravishda | mission list; report-speak | cut / unga ko'ra |
| o'z navbatida | mission list | cut |
| katta e'tibor qaratildi/berildi | mission list | e'tibor qaratildi |
| belgilab berildi | president.uz headline: "yo'nalishlarini belgilab berdi" | belgiladi (in casual copy) |
| chora-tadbirlar | lex.uz title: "takomillashtirish chora-tadbirlari to'g'risida" | qadamlar / choralar |
| faoliyat yuritishini ta'minlash | lex.uz title | ishlashini ta'minlash / ishlashi uchun |
| tubdan takomillashtirish | lex.uz title | yaxshilash |
| to'g'risidagi (title chains) | lex.uz titles | haqida |
| Davlatimiz rahbari (honorific) | president.uz headlines | Prezident |

Tier B — correct inside official documents, robotic in casual copy. These are
allowed (info-level) in `news`, `legal`, `academic`, `official`; flagged in
product/assistant/youth/marketing:

| Pattern | Attestation | Human rewrite (casual) |
|---|---|---|
| tomonidan + passive | lex.uz: "maʼmuriy organ tomonidan uzaytirilishi mumkin" | active verb |
| amalga oshirildi (single, report) | fintech status (v1-attested "Toʻlov … amalga oshirildi") | keep in payment status; "bo'ldi/qildik" elsewhere |
| …-moqda chains (o'tkazilmoqda, olib borilmoqda) | gov report prose | present active: qilyapmiz / bormoqda |
| quyidagi / yuqoridagi | laws, reports | bu / shu (casual) |
| talabgor bo'lgan mutaxassislar | lex.uz title | xohlagan mutaxassislar |
| munosabati bilan | president.uz: "kuni munosabati bilan" | official congrats keep it; casual: "… kugi / … kuni" |

## Finding 3 — Headline officialese verbs (president.uz style)

The state news verb kit — fine ONLY in the news/official register:
"belgilab berdi", "ilgari surdi", "muhokama qildi", "qabul qildi", "o'tkazdi",
"yanada kengaydi", "mustahkamlamoqda". In casual rewrites these become plain
verbs: "aytdi", "boshladi", "gaplashdi", "ko'rdi", "kengaydi".

## Finding 4 — Human-voice markers (the "sounds like a person" bank)

Targets come from real informal text (v1's GP-* review corpus — actual Play
Store reviews and support chats — plus my.gov.uz UI and Telegram norms):

- Spoken aspect: **-yapti/-yapman/-yapsiz** ("umuman ishlamayapti"), **-ib
  qo'y-/qol-/yubor-/ber-/ol-** ("yangilab qo'y", "tushunib qoldim")
- Plain state verbs: "qotyapti", "kelmayapti", "tushmayapti", "o'xshamadi"
- Real glue: "mana", "endi", "bo'lsa", "axir", "-ku", "zo'r", "gap yo'q",
  "yomon emas", "judayam" (chat registers only)
- Understatement praise: "qulay", "yomon emas", "gap yo'q" — not "a'lo",
  "mukammal", "eng yaxshi tajriba"
- Question-first help: "Nima kerak?" — not "Sizga qanday yordam bera olaman?"
  (my.gov.uz FAQ questions are exactly this shape)
- Numbers and time like people say them: "300+", "bir-ikki daqiqa", not
  "belgilangan muddat davomida"

Anti-patterns (AI-tells) confirmed against the corpus: "Hurmatli
foydalanuvchi" (zero hits on my.gov.uz UI), "Ajoyib savol!", "Albatta!"
openers, "Xulosa qilib" in three-sentence answers.

## Design consequences (implemented)

1. New **officialese linter family** (register-scoped): Tier A warn/error in
   every register except `official`; Tier B skipped in formal registers,
   warned in casual ones. New `official` register preset so formal asks have
   a correct home (gov.uz/lex.uz style, from the corpus).
2. **Human-voice bonus** in the naturalness score: spoken aspect markers,
   conversb+auxiliary compounds, natural glue (chat registers), and sentence
   rhythm variance earn back points (cap +6), with the signals named in the
   score explanation.
3. **New eval set** `pairs-humanvoice.jsonl`: robotic AI/officialese lines
   from this corpus vs natural human versions; the eval runner now also
   reports the score gap (bad vs good) to prove the score rewards human text.
4. references/human-voice.md encodes Finding 4 as the primary voice target;
   SKILL.md leads with the CORE MISSION.

## Finding 5 — Web corpus (research/corpus/, mined 2026-10-24)

Sources: uz.wikipedia.org (16 plaintext extracts via the MediaWiki API), kun.uz
(11 Latin article bodies incl. the alphabet-reform law coverage), gazeta.uz +
daryo.uz RSS (Cyrillic titles/descriptions). Uzbek Wikisource is CLOSED
(uz.wikisource.org → 302 → wikisource.org 404); literature coverage came from
Wikipedia (Oʻzbek adabiyoti, Abdulla Qodiriy). CORE MISSION guard: this corpus
is for spelling/vocabulary/frequency ONLY — never a model of how to sound.

Mined stats (63,490 Latin tokens, 16,411 unique; scripts/mine-corpus.ts →
research/corpus-mining/, distilled to skills/uzbek-humanizer-pro/src/data/corpus-stats.json):

- Sentence length: median 10, mean 12.0, p95 28 words — the p95 independently
  validates the cadence linter's 28-word long-sentence threshold, which is now
  cited as the corpus baseline in uz_score output.
- Top connectors: va (1,849), keyin (82), hamda (80), yoki (68), shuningdek
  (64) — "va" is ~22× more frequent than the next connector: AI text that
  spreads "shuningdek/bundan tashqari" evenly is off-corpus.
- Top collocations: amir temur (141), bir necha (40), ishlab chiqarish (34),
  temir yoʻl (34) — confirms ishlab chiqarish/temir yoʻl as natural compounds.
- Suffix profile: lar (4,813), di-past (3,367), ni (1,905), da (1,578)… the
  -ishi nominalizer appears 500+ times in document text — the officialese
  linter's -lishi chains target is exactly the document register.
- Apostrophe chaos in the wild: a single kun.uz article contains "Özbekiston",
  "o'qish" and "oʻqish" — three different mark conventions in one page —
  confirming normalize-before-anything as ladder step 2.

## Finding 6 — 2026 alphabet reform: the law was SIGNED

The kun.uz corpus (research/corpus/kun-01-*.txt, 2026-10-21) reports that the
President signed the law changing four letters of the Latin alphabet on
Oʻzbek tili kuni, with "Ishoning, yozuvimizdagi noqulayliklarga barham
berish va tilimizning raqamli makondagi oʻrnini mustahkamlash uchun boshqa
yoʻl yoʻq edi" (Saida Mirziyoyeva). Consequences for this skill: references/
orthography.md status updated; the skill's behavior is unchanged (output stays
oʻ/gʻ/sh/ch until users actually send reform text, inbound ö/ğ/ş/ç still
normalizes) — but drafts no longer claim "signing unconfirmed".

## Data files the tooling now uses

- src/data/corpus-stats.json — wordFreq (top 800), collocations (120),
  connectors, suffix profile, sentence-length baselines. Used by: uz_score
  (baseline note) and MCP uz_synonym_suggest (ranking).
- src/data/calques.json (200), glossary.json (48), synonyms.json (68) —
  generated from the reference files by scripts/gen-data.ts; used by MCP
  uz_calque_check, uz_glossary_lookup, uz_synonym_suggest.

## Finding 7 — Informal corpus (phase 2b: the voice targets)

research/informal-corpus/: 6 Uzbek Telegram channel feeds via t.me/s/ (kun_uz,
kunuzofficial, daryo, uzdaily, darakchi, uzreport), real quoted speech from
kun.uz interviews/stories, and the v1-attested review/comment voice (GP-*/YT-*
quotes). All anonymized (handles → @***, phones → +998 ***, links → (link)).
Collection constraints documented in MANIFEST.md: uforum.uz unreachable from
this network; news comments JS-gated (darakchi.uz rendered 0 comment nodes in
a headless browser); t.me/s shows posts, not DMs.

Mined (research/informal-corpus/MINING.md):
- **Apostrophe reality**: casual Telegram writing uses o‘ (U+2018) 56× vs oʻ
  (U+02BB) 12× — real chat overwhelmingly types the curly quote. Policy:
  normalize to oʻ when rewriting; keep verbatim when quoting user voice.
- Emoji density is high in real posts (138 hits, 👇 dominates) and particles
  appear glued (-ku/-chi/-yu/-mi: 13 unique forms). Formal connectors are
  essentially absent from real chat.
- Real user voice loves: dropped subjects, code-switch shards (kk, bn, udalit,
  donat), spoken forms (nma, qale, kere, boladi), plural -sizlar/-ela glued
  commands (qoymela, qilamz), raw numbers ("800 ming", "1mln200").

## Finding 8 — The no-dash policy

Em/en dashes and the spaced " - " are the strongest machine tells in Uzbek
casual text (and AI text generally). Phase 2b makes this a hard skill rule:
the skill NEVER outputs —, – or " - " in any register. Impact measured
against v1's own goldens: 4/226 contain dashes/semicolons and are now flagged
(intentional policy divergence, disclosed in EVAL_RESULTS §3); detection on
the 408-pair corpus rose to 99.8% while good-side FPs stayed at 0.

## Finding 9 — Red-team recalibration (phase 4)

100 adversarial cases (61 misses, 39 false positives) initially broke v2;
all 100 are now handled (EVAL_RESULTS §4a). The corpus evidence that forced
the recalibration: em dashes appear 52× in real Telegram posts and 21× in
kun.uz, " - " appears in v1's native-verified goldens, and legal/news
registers legitimately use semicolons, mazkur/ushbu and report passives.
Policy split that resolves it: the no-dash rule is an OUTPUT policy (the
skill never writes dashes; humanize rewrites them), while the INPUT lint is
register-calibrated (casual strict, document registers tolerant). Golden FP
rate returned to v1's exact level (0.9%).
