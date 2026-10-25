# Cyrillic ⇄ Latin transliteration spec

Default skill output is **Latin**. Convert Cyrillic input to Latin before any
other step of the rewrite ladder (and only when the user did not explicitly ask
for Cyrillic output). `uzpro translit` implements this spec; the hard cases
below are exactly where naive letter-by-letter conversion fails.

## Full letter map (Cyrillic → Latin)

| Cyrillic | Latin | Notes |
|---|---|---|
| а б в г д | a b v g d | direct |
| ж | j | not zh |
| з и й к л | z i y k l | й → y |
| м н о п | m n o p | direct |
| р с т у ф | r s t u f | direct |
| х | x | х → x, never h |
| ч | ch | digraph |
| ш | sh | digraph |
| щ | sh | Russian loans; щё → sho etc. |
| ъ | ʼ (U+02BC) | tutuq — see hard case 5 |
| ы | i | Russian loans only |
| ь | — (dropped) | see hard case 6 |
| э | e | эълон → eʼlon |
| ю | yu | see hard case 3 |
| я | ya | see hard case 3 |
| ё | yo | see hard case 2 |
| е | e / ye | see hard case 4 |
| ц | ts / s | see hard case 1 |
| ў | oʻ | U+02BB after o |
| қ | q | never k |
| ғ | gʻ | U+02BB after g |
| ҳ | h | х → x and ҳ → h must not collapse |

## The hard cases

1. **ц → ts, but -ция → -siya.** функция → funksiya, конференция →
   konferensiya, акция → aksiya. The lexical exception концерт → konsert (ц →
   s before ерт). цех → tsex, цирк → tsirk default.
2. **ё → yo, always.** ёзув → yozuv, ёшлар → yoshlar, мой → moy. ё never
   reduces, including word-final and after consonants.
3. **ю → yu, я → ya, always.** юқори → yuqori, яна → yana, тилла stays til+la
   (я would still be ya if present). Unlike Russian, Uzbek я/ю never reduce to
   a/i after consonants.
4. **е → ye word-initially, after vowels, and after ъ/ь; else e.** ешик →
   yeshik, ер → yer, етти → yetti, Европа → Yevropa; мен → men, келди →
   keldi. The word-start rule is the one agents forget most: Ешik → yeshik.
5. **ъ → ʼ tutuq — except before е/ё/ю/я, where it disappears and the next
   letter keeps its y.** маъно → maʼno, таъсир → taʼsir; объект → obyekt,
   субъект → subyekt, объявление → obyavleniye. (Latin → Cyrillic reverse:
   obyekt → объект.)
6. **ь is dropped; ьо → yo.** только-style words: батальон → batalyon,
   семья → se-mya → semya; семь → sem.
7. **ў, қ, ғ, ҳ are their own letters.** ў → oʻ (not u, not o), қ → q (not k),
   ғ → gʻ (not g), ҳ → h (not x). Informal Cyrillic merges ҳ into х
   ("олх жуда яхши"); map by lexicon when the meaning demands h.
8. **щ → sh** (Russian loans only; Uzbek has no native щ).
9. **Digraphs first.** When converting Latin → Cyrillic, consume sh/ch/oʻ/gʻ
   before single letters (shoshilmoq → шошилмоқ, not сносилмок).
10. **Capitalization is preserved per letter, ALL-CAPS per digraph.**
    Тошкент → Toshkent; Ёшлар → Yoshlar; ЕВРОПА → YEVROPA; ЎЗБЕКИСТОН →
    OʻZBEKISTON (O + U+02BB, not Oʻ lowercased).

## Latin → Cyrillic (when the user asks for Cyrillic output)

- Consume digraphs first: oʻ→ў, gʻ→ғ, sh→ш, ch→ч, yo→ё, yu→ю, ya→я.
- Word-initial ye → е (yeshik → ешик); Latin y elsewhere → й.
- ʼ → ъ. q → қ, h → ҳ, x → х, j → ж, ts → ц.
- -siya endings reverse to -ция: funksiya → функция, konferensiya →
  конференция, aksiya → акция.
- Lexicon: obyekt → объект, subyekt → субъект (with suffixes: obyektda →
  объектда).

## Channel note (from v1, kept)

Kun.uz Telegram posts run Cyrillic while kun.uz/uz runs Latin. When a post has
a Cyrillic body + Latin labels (RASMIY | LIVE | SPORT), convert the body and
leave the labels alone. One script per body block.

## Spot-check after converting

1. Read one full sentence aloud.
2. Check every oʻ/gʻ/ҳ/қ/ғ in the output.
3. Search for leftover ASCII `'` — there must be none.
4. If the text mixes scripts inside a word (kItgirl), fix the word, don't
   re-transliterate the whole file.
