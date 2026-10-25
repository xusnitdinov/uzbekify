# Literalness patterns (translation smell)

Idiom and politeness calques plus EN rhythm leftovers — the patterns the
`literalness` linter family encodes.

## Politeness shadows

| Bad | Good | Source |
|---|---|---|
| Siz eshikni yopishga qarshi emasmisiz? | Iltimos, eshikni yopib qoʻying | "Would you mind…" |
| Rahmat sizga oldindan | Oldindan rahmat | "Thank you in advance" |
| Siz bilan ishlashdan xursandmiz (every closer) | Siz bilan ishlash yoqimli | "Happy to work with you" |

## Idiom calques

| Bad | Good | Source |
|---|---|---|
| Bu raketa ilmi emas | Bu unchalik murakkab ish emas | "not rocket science" |
| U chelakni tepdi | U vafot etdi | "kick the bucket" |
| Mushuklar va itlar yogʻmoqda | Qattiq yomgʻir yogʻdi | "raining cats and dogs" |
| Oyogʻingni sindir | Omad tilayman | "break a leg" |
| Loviyani toʻkdi | Sirni ochdi | "spill the beans" |

## Truncated and scrambled structures

| Bad | Good |
|---|---|
| Men Oʻzbekiston emasman | Men Oʻzbekistondan emasman |
| U oʻqidi kitobni kecha kutubxonada | U kecha kutubxonada kitobni oʻqidi |
| Nima siz qilasiz? | Siz nima qilasiz? |
| Men haqiqatan ham bu ilovani yoqtiraman | Bu ilova menga juda yoqadi |

## Translationese rhythm

| Pattern | Fix |
|---|---|
| men/biz + haqiqatan ham + bu … | rebuild around menga/bizga yoqadi |
| Brochure stack (innovatsion yechim, imkoniyatlar olami, maksimal darajada) | plain benefit |
| Every sentence starts with the same word | vary openers |
| -ishni amalga oshirish nominalization soup | use the verb: bajaring |
| ki-chains (bilamanki, aytdiki every sentence) | comma + clause |
| EN filler discourse (Haqiqatan ham! / Albatta!) | cut or vary |

## Nominalization soup (very common in MT)

| Bad | Good |
|---|---|
| Yuklab olishni bajaring | Yuklab oling |
| Tekshirishni amalga oshiring | Tekshiring |
| Saqlashni bajarishni amalga oshirish | Saqlang |
| Koʻrib chiqish jarayonini oʻtkazing | Koʻrib chiqing |
| Toʻlovni amalga oshirishni bajaring | Toʻlang |
