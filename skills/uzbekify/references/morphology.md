# Morphology: suffix chains, vowel harmony, consonant alternation

Uzbek is agglutinative: morphemes stack outward from the stem in a fixed
order, and several suffix classes harmonize with the stem. LLM output fails
here most often (v1's own audit found morphology ≈ 35% of LLM Uzbek errors).

## 1. The noun stack (memorize this order)

```
oʻzak (stem) + koʻplik (-lar) + egalik (possessive) + kelishik (case)
kitob      + lar         + imiz          + ga
→ kitoblarimizga   "to our books"
```

Derivational suffixes sit **before** the inflection stack:
`kitob + xon + lar + ga → kitobxonlarga`.

Common derivational suffixes: -chi (profession: futbolchi), -lik
(abstraction: doʻstlik), -dor (having/agent: samarador), -gina (small:
ozgina). Use only attested forms — do not invent combos.

## 2. Case suffixes (kelishik)

| Case | Suffix | Example |
|---|---|---|
| Nominative | — | kitob |
| Accusative | -(n)i | kitobni |
| Genitive | -(n)ing | kitobning |
| Dative | -ga/-ka/-qa | kitobga |
| Locative | -da/-ta | kitobda |
| Ablative | -dan/-tan | kitobdan |

The linker -n- appears after possessive markers: kitobim+ni → kitobimni.

## 3. Possessive markers (egalik)

| Person | Suffix | Example |
|---|---|---|
| 1sg | -(i)m | kitobim |
| 2sg | -(i)ng | kitobing |
| 3sg | -(s)i | kitobi |
| 1pl | -(i)miz | kitobimiz |
| 2pl | -(i)ngiz | kitobingiz |
| 3pl | -(s)i + lar before | kitoblari |

Agreement rule: a genitive possessor demands agreement on the possessed —
`doʻstimning fikri` (not doʻstimning fikr). This is a top LLM miss.

## 4. Vowel harmony

Uzbek vowel harmony is weaker than Turkish, but it governs the plural and a
few other classes:

| Class | Vowels | Example stems |
|---|---|---|
| Back | a, o, u | kitob, maktab, qiz |
| Front | e, i | deraza, sinf |

Practical rules that hold:

1. **Plural is -lar after back-vowel stems and in most modern usage overall;
   -ler survives only in a few front-vowel words and careful styles.**
   Back-vowel stems essentially never take -ler: `kitoblarimiz`, never
   `kitoblerimiz`. When unsure, write -lar.
2. **Locative -da is standard across stems** (maktabda, koʻchada); do not
   force a -de variant, Uzbek does not have it.
3. **Dative -ga/-ka/-qa harmonizes by stem-final consonant (see §5).**
4. **Verb aorist person endings -(a)man/-(a)san/-(a)siz/-(a)di are
   invariant**: qilaman, qilasan, qilasiz, qiladi.

Do not invent harmony classes Uzbek does not have; the facts an agent needs
are plural (-lar/-ler) and dative assimilation.

## 5. Consonant alternation (dative assimilation)

After stems ending in voiceless **q, k**, the dative -ga assimilates:

| Stem + ga (bad) | Correct | Note |
|---|---|---|
| qishloqga | qishloqqa | q + ga → qqa |
| yoʻqga → yoʻqqa? (yoʻq+ga) | yoʻqqa | same |
| yurakga | yurakka | k + ga → kka |
| kichikga | kichikka | same |
| soliqga | soliqqa | same |

Stems ending in voiced consonants and vowels keep -ga: maktabga, doʻkonga
(n is voiced), uyga, Oʻzbekistonga. Note: -sh does NOT assimilate (ishga is
correct, never ishqa).

## 6. Illegal chains (the LLM failure catalog)

| Bad | Good | What broke |
|---|---|---|
| berdimga | berdim | case on a finite verb |
| qildiklar | qildik | plural on 1pl past verb |
| fikrlarinigaga | fikrlariga | -ning + double case soup |
| kitobxonlarga → kitobxonlargaga | kitobxonlarga | double dative |
| kitobimizlar | kitoblarimiz | possessive before plural |
| kitobimning kitoblar | kitoblarim | double genitive mess |
| doʻstimning fikr | doʻstimning fikri | missing possessive agreement |
| kelganimizgaq | kelganimizga | invented suffixes |

Rebuild rule: when a word feels like soup, strip to the stem and re-add in
order: plural → possessive → case. Say the meaning out loud first.

## 7. Verb person endings (present/future)

| Person | Aorist | Example |
|---|---|---|
| 1sg | -(a)man | yozaman |
| 2sg | -(a)san | yozasan (sen lane) |
| polite | -(a)siz | yozasiz (Siz lane) |
| 3sg | -(a)di | yozadi |
| 1pl | -(a)miz | yozamiz |
| 2pl | -(a)siz(lar) | yozasiz(lar) |
| 3pl | -(a)di(lar) | yozadi(lar) |

Negative: -ma/-me before the ending (yozmayman). Question particle -mi
follows (Yozasizmi?). Never stack case endings after these.

## 8. Quick self-test

- kitob + lar + imiz + ni → **kitoblarimizni**
- doʻst + im + ga → **doʻstimga**
- maktab + da + lar? — re-think: maktablar + da → **maktablarda**
- qishloq + ga → **qishloqqa**
- U + kecha + kutubxona + da + kitob + ni + oʻqi + di →
  **U kecha kutubxonada kitobni oʻqidi**
