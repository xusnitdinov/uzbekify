# Playbook: EN/RU → natural Uzbek translation

CORE MISSION: translate INTO the human voice, never into document voice.

1. Detect source language + register; pick the target preset (product /
   marketing / assistant). Formal source ≠ formal target unless asked.
2. Normalize script first (RU sources): uzpro translit, then rewrite — never
   transliterate-and-stop ("belgilangan tartibda" must not survive).
3. Kill source-language structure: EN calques (§A of the calque bank: "I
   like X" → menga yoqadi; would-you-mind → Iltimos …-ib qoʻying) and RU
   calques (§B: muvofiq ravishda, oʻz navbatida, katta eʼtibor qaratildi).
   False friends first (references/false-friends.md): aktual → dolzarb,
   magazin → doʻkon/jurnal, familiya → faqat familiya.
4. Rebuild word order to SOV; time/place before the verb; WH in situ
   ("Siz nima qilasiz?", never "Nima siz qilasiz?").
5. Morphology: rebuild noun stacks outward (kitob+lar+imiz+ni); dative
   assimilation (qishloqqa, yurakka); no -ler after back vowels.
6. Idioms: remap only when attested, otherwise paraphrase plainly
   (references/idioms-connectors.md). Never invent a maqol.
7. Voice: add ONE human signal to chat registers (-yapti, -ib qoʻy-);
   `uzpro diff before after` to show the user; `uzpro score --min 90`.

Bad→Good (RU): "Zakaz belgilangan tartibda oformlyayetsya" →
   "Buyurtma shu yerda rasmiylashadi, bir-ikki daqiqa ketadi."
Bad→Good (EN): "Would you mind updating your profile information?" →
   "Profilingizni yangilab qoʻyasizmi?"
