# Word order: SOV and natural topicalization

Uzbek is verb-final (SOV). English and Russian are not; their word order
leaks into LLM Uzbek more subtly than vocabulary does. v1 had no word-order
reference at all — this file is the fix.

## 1. The neutral clause frame

```
Time → Place → Manner → Object → Verb
U  kecha  kutubxonada      kitobni  oʻqidi
"He read the book in the library yesterday."
```

| Bad (EN order) | Natural Uzbek |
|---|---|
| U oʻqidi kitobni kecha kutubxonada | U kecha kutubxonada kitobni oʻqidi |
| Men koʻrdim seni kutubxonada | Men seni kutubxonada koʻrdim |
| Biz tashkil qildik uchrashuvni ofisda | Biz ofisda uchrashuvni tashkil qildik |

Pronoun objects may follow the verb for focus in speech (koʻrdim uni!) — that
is natural; full-noun objects after the verb are the calque tell.

## 2. Time expressions

Time adverbials sit early, usually sentence-initial or right after the topic:

| Bad | Good |
|---|---|
| Bordi kechqurun | Kechqurun bordi |
| Keladi ertaga | Ertaga keladi |
| Boʻlib oʻtdi toʻy shanba kuni | Toʻy shanba kuni boʻlib oʻtdi |

## 3. Questions stay in situ

Uzbek does not front question words like English:

| Bad (fronted) | Good (in situ) |
|---|---|
| Nima siz qilasiz? | Siz nima qilasiz? |
| Qachon u keladi? | U qachon keladi? |
| Nega siz keldingiz? | Siz nega keldingiz? (nega before verb) |
| Qayerda siz ishlaysiz? | Siz qayerda ishlaysiz? |

The question particle -mi goes on the focused word, before Oʻzbekcha
question intonation: Kelasizmi? / Sizmi kelasiz? (surprised).

## 4. Topicalization (the natural way to "front" things)

Where English uses passive or clefts ("It was X that…"), Uzbek topicalizes
with case and particles:

| Function | Tool | Example |
|---|---|---|
| Topic | -ga kelsak / boʻlsa | Pullarga kelsak, … |
| As for X | X esa | Uy esa, hali taʼmirlanmagan |
| Contrast | -u/-yu, -da particles | Keldi-yu, darrov ketdi |
| Focus before verb | bare position | Men kitobni emas, jurnalni oldim |

Do not calque English clefts: ✗ Bu meniki edim ki … ✓ Men edim.

## 5. Possessor–possessed order

Genitive possessor comes first and the possessed agrees (see morphology.md):

- mening kitobim (not kitob mening)
- doʻstimning uyi, universitetning kutubxonasi

Long chains: keep ONE -ning per chain; two -ning in a row is officialese
soup: ✗ universitetning talabalarining kitoblarining nomlari → ✅
talabalar kitoblarining nomlari / universitet talabalari kitoblari nomi —
prefer rephrasing.

## 6. Relative clauses

Uzbek relative clauses use participles (-gan/-adigan) BEFORE the noun, like
English "the man who came" → kelgan odam:

| Bad (English that-clause) | Good |
|---|---|
| odam ki kecha keldi | kecha kelgan odam |
| kitob ki men oʻqidim | men oʻqigan kitob |

Never introduce relative clauses with ki — that is Persian/RU contact
structure; ki is fine only after verbs of saying/thinking (bilamanki,
aytdiki — and even those prefer a comma in modern styles: Bilaman, …).

## 7. Adverbial clauses

-ganda/-gachA clauses come first; "when…" trailing English clauses are a
calque:

| Bad | Good |
|---|---|
| Men ketdim, u kelgandan keyin | U kelgandan keyin men ketdim |
| Uxladingizmi, dars tugaganda? | Dars tugaganda uxladingizmi? |

Because-clauses: -gani uchun / chunki precede or follow naturally, but do not
stack both (✗ chunki … -gani uchun).

## 8. Adjective order

Attributive adjectives precede the noun; multiple stacked adjectives are rare
in native style — prefer the one that matters. When two are needed, size
before color is the common pattern: katta oq uy. Do not comma-stack
adjectives the English way.
