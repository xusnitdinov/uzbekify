# Calque bank (EN-structure + RU-structure)

250 entries: 235 bad→good→why calque pairs (§A-§G) plus §H, a false-positive
guard list of 15 patterns the linter must NOT flag (each §H row was a real
phase-4 red-team finding). v1 had ~62 entries concentrated in EN internet
slang; this bank adds the classes that actually dominate LLM/MT Uzbek: EN
verb+qilmoq hybrids, RU officialese structure, connector calques,
translationese rhythm, chat ceremony, report-speak verbs, and punctuation
tells.

How to use: when rewriting, sweep the whole text against §A (English
structure), then §B (Russian structure), then §C (connectors). If a bad form
appears, replace with the Good column — but keep step 4 (word order) and step
5 (suffix chains) of the rewrite ladder in mind.

---

## §A. English-structure calques

### A1. EN cool-slang paste (always rewrite)

| # | Bad (AI / EN paste) | Good | Why |
|---|---|---|---|
| 1 | ship qilmoq / ship it | topshirmoq / chiqarmoq / ishga tushirmoq | EN fandom verb never nativized |
| 2 | vibe | kayfiyat / muhit / taassurot | Meaning depends on context; no fixed loan |
| 3 | vibe check | holatni tekshirish / koʻrib chiqish | Meme compound |
| 4 | portladi (feature blew up = was great) | juda yoqdi / zoʻr chiqdi | Internet calque; "portladi" means exploded |
| 5 | teammate | guruhdosh / jamoadosh / hamkasb | EN team-speak |
| 6 | Systems brain | tizimli fikrlash / mantiqni tushunish | AI cosplay phrase |
| 7 | hard mode | qiyin rejim / qiyinroq variant | Gaming calque |
| 8 | Dream mode | orzular rejimi | Calque; usually rewrite to plain product language |
| 9 | crush it! | zoʻr uddalang! / yaxshi bajaring! | Motivation-speak calque |
| 10 | MVP (banter sense) | eng foydali oʻyinchi | Sports meme kept raw |
| 11 | cringe | noqulay / gʻalati tuyuldi | Register-fit the translation |
| 12 | literally | rostdan ham / aynan | Usually removable intensifier |
| 13 | random | tasodifiy / kutilmagan | Two senses, neither borrowed |
| 14 | mindset | qarash / yondashuv | Self-help calque |
| 15 | ghost qilmoq | javob bermay qolmoq / yoʻqolmoq | Dating-slang calque |
| 16 | flex qilmoq | koʻrsatmoq / maqtanmoq | Slang calque |
| 17 | salty boʻlmoq | xafa boʻlmoq / ranjimoq | Slang calque |
| 18 | GOAT | barcha vaqtlardagi eng buyugʻi | Only in sports content, then define once |

### A2. EN verb + qilmoq hybrids (use the Uzbek verb)

| # | Bad | Good | Why |
|---|---|---|---|
| 19 | check qilmoq | tekshirmoq | Native verb exists |
| 20 | update qilmoq | yangilamoq | Native verb exists |
| 21 | support qilmoq | qoʻllab-quvvatlamoq / yordam bermoq | Native verb exists |
| 22 | select qilmoq | belgilamoq / tanlamoq | Quiz Uzbek uses belgilang |
| 23 | save qilmoq | saqlamoq | Native verb exists |
| 24 | share qilmoq | ulashmoq / yubormoq | Platform verb exists |
| 25 | click qilmoq | bosmoq | Native verb exists |
| 26 | cancel qilmoq | bekor qilmoq | Native verb exists |
| 27 | delete qilmoq | oʻchirmoq | Native verb exists |
| 28 | confirm qilmoq | tasdiqlamoq | Native verb exists |
| 29 | download qilmoq | yuklab olmoq | Native verb exists |
| 30 | upload qilmoq | yuklamoq | Native verb exists |
| 31 | login qilmoq / log in qilmoq | kirmoq (tizimga) | Native verb exists |
| 32 | logout qilmoq | chiqmoq | Native verb exists |
| 33 | send qilmoq | yubormoq | Native verb exists |
| 34 | skip qilmoq | oʻtkazib yubormoq | Native verb exists |
| 35 | book qilmoq | band qilmoq | Native verb exists |
| 36 | order qilmoq | buyurtma bermoq | Native verb exists |
| 37 | pay qilmoq | toʻlamoq | Native verb exists |
| 38 | install qilmoq | oʻrnatmoq | Native verb exists |
| 39 | restart qilmoq | qayta ishga tushirmoq | Native verb exists |
| 40 | scan qilmoq | skanerlamoq | Assimilated form exists |
| 41 | register qilmoq | roʻyxatdan oʻtmoq | Native verb exists |
| 42 | fix qilmoq | tuzatmoq | Native verb exists |
| 43 | apply qilmoq (promo) | qoʻllamoq | Native verb exists |
| 44 | clear qilmoq | tozalamoq | Native verb exists |
| 45 | edit qilmoq | tahrirlamoq | Native verb exists |
| 46 | create qilmoq | yaratmoq | Native verb exists |
| 47 | view qilmoq | koʻrmoq | Native verb exists |
| 48 | try qilmoq | sinab koʻrmoq | Native verb exists |
| 49 | start qilmoq | boshlamoq | Native verb exists |
| 50 | stop qilmoq | toʻxtatmoq | Native verb exists |
| 51 | follow qilmoq | obuna boʻlmoq / kuzatib bormoq | Platform verb exists |
| 52 | post qilmoq | eʼlon qilmoq / yozmoq | Native verb exists |
| 53 | block qilmoq | bloklamoq | Assimilated form exists |
| 54 | report qilmoq | shikoyat qilmoq / haqida xabar bermoq | Native phrase exists |

### A3. Politeness and phrase calques

| # | Bad | Good | Why |
|---|---|---|---|
| 55 | Siz eshikni yopishga qarshi emasmisiz? | Iltimos, eshikni yopib qoʻying | Literal "would you mind" |
| 56 | Men haqiqatan ham bu ilovani yoqtiraman | Bu ilova menga juda yoqadi | EN "I like X" structure |
| 57 | haqiqatan ham (filler) | juda / (oʻchiring) | AI intensity filler |
| 58 | Hurmatli foyydalanuvchi, … | Assalomu alaykum! / (name) | False formality boilerplate |
| 59 | Rahmat sizga oldindan | Oldindan rahmat | Calqued "thank you in advance" |
| 60 | Men Oʻzbekiston emasman | Men Oʻzbekistondan emasman | Truncated "from" |
| 61 | Siz notoʻgʻrisiz | Fikringizga qoʻshilmayman | EN "you are wrong" rudeness |
| 62 | Zahmat boʻlmasa, menga yordam bera olasizmi? | Zahmatingiz boʻlmasa, yordam bering | Stacked double-soft calque |
| 63 | Bir savolim bor edi: … | Savolim bor edi / Soʻramoqchi edim | "I have a question" filler — fine once, calque when every message opens with it |
| 64 | Siz bilan ishlashdan xursandmiz | Siz bilan ishlash yoqimli | Calqued "happy to work with you"; xursandmiz is fine once, not as every closer |
| 65 | Bilaman ki … | Bilaman, … (comma) | EN "I know that…" ki-chain |
| 66 | Siz uchun ham davom etadi | Sizga ham tejamli / Siz ham foydalanasiz | Calqued "continues for you" |

### A4. Idiom calques (paraphrase; never invent)

| # | Bad | Good | Why |
|---|---|---|---|
| 67 | Bu raketa ilmi emas | Bu unchalik murakkab ish emas | "Not rocket science" |
| 68 | U chelakni tepdi | U vafot etdi | "Kick the bucket" |
| 69 | Mushuklar va itlar yogʻmoqda | Qattiq yomgʻir yogʻdi | "Raining cats and dogs" |
| 70 | Oyogʻingni sindir (omad tilash) | Omad tilayman! | "Break a leg" |
| 71 | Loviyani toʻkdi | Sirni ochdi | "Spill the beans" |
| 72 | Bu xamirdek oson | Bu juda oson / xamirdan qil sugʻurgandek | "Piece of cake" — the Uzbek idiom differs |
| 73 | Vaqt pul degani | Vaqt qimmat | "Time is money" — no need for degani gloss |
| 74 | Erta qush (early bird) | Erta band qilganlarga chegirma | Keep the offer, drop the idiom |
| 75 | Torte ustiga krem | Nur ustiga aʼlo nur | "Icing on the cake" has an Uzbek equivalent |
| 76 | Devlarning yelkasida turmoq | ulkan olimlar yutib bergan asosda | Calque of the Newton quote; paraphrase |
| 77 | Oxirgi somon (last straw) | sabr kosasi toʻldi / chidab boʻlmadi | Different metaphor system |
| 78 | Muzni sindirmoq (break the ice) | muzni eritmoq / gap boshlamoq | Half-calque; eritish is the native image |
| 79 | Pardani yiqitmoq (drop the curtain) | yakunlamoq / chekni qoʻymoq | Calque |
| 80 | Achchiq haqiqat (every use) | Rostini aytsak | "Bitter truth" is half-natural; one per text, usually replaceable |
| 81 | Uyqusiz tungi kabi (of a meme) | (paraphrase plainly) | Do not localize memes literally; paraphrase or drop |
| 82 | Daraxtning ildiziga yetmoq (get to the root) | mohiyatiga yetmoq | Calque |

### A5. Marketing / brochure translationese

| # | Bad | Good | Why |
|---|---|---|---|
| 83 | innovatsion yechim | yangi usul / soddalashtirilgan yoʻl | Hype stack |
| 84 | imkoniyatlar olami | barcha kerakli narsalar bir joyda | Brochure noun-world |
| 85 | maksimal darajada | imkon qadar / toʻliq | Calqued "maximally" |
| 86 | Hayotingizni transformatsiya qiling | Ishlaringizni yengillashtiring | Hype verb |
| 87 | Kelajagingizni bugun boshlang | Bugun boshlab koʻring | Boilerplate CTA |
| 88 | Chegaralarni buzdingiz | Oʻzingizga qulay yoʻlda ishlang | "Break boundaries" |
| 89 | Keyingi darajali samaradorlik | Ishlaringiz tez bitadi | "Next-level productivity" |
| 90 | Sunʼiy intellekt bilan qudratlangan | AI yordamida / AI bilan | "Powered by" calque |
| 91 | Sinergiya platformasi | (delete — name the product benefit) | Synergy speak |
| 92 | Inqilobiy oʻzgarish | katta yaxshilanish | "Revolutionary" |
| 93 | Mislsiz tezlik | Tezroq bitiring | Unverifiable claim |
| 94 | Minglab odamlar tanlovi | Koʻpchilik ishlatib koʻrgan | Fake social proof |
| 95 | Foydalanuvchi tajribasini yaxshilash | qulayroq qilish / yoqadigan qilish | "UX experience" officialese |
| 96 | Eng yaxshi tajriba | Ishlash qulay | Claim-free version |
| 97 | Sizning ideal tanlovingiz | Sizga mos variant | Ad-speak |
| 98 | Eng yaxshi narxlarni kashf eting | Narxlarni koʻring | "Discover" + superlative |
| 99 | Bugun qoʻshiling — erta qush taklifi | Bugun roʻyxatdan oʻting | Two calques in one line |
| 100 | Boʻshliqni toʻldiring (fill the gap) | Yetishmayotgan qismini toʻldiring | Half-calque |
| 101 | Toʻliq potensialingizni oching | Kuchingiz yetadigan ishni toping | "Unlock your potential" |
| 102 | Muammosiz tajriba | Xatosiz ishlaydi | "Seamless experience" |

### A6. Structure and word-order shadows

| # | Bad | Good | Why |
|---|---|---|---|
| 103 | U oʻqidi kitobni kecha kutubxonada | U kecha kutubxonada kitobni oʻqidi | SOV; time+place before object+verb |
| 104 | Nima siz qilasiz? | Siz nima qilasiz? | WH stays in situ |
| 105 | Men haqiqatan ham bu … (opener) | Bu … menga … | EN subject-first rhythm |
| 106 | kitobining mening | mening kitobim | Possessor before possessed |
| 107 | Bu juda ham katta gap boʻlishi mumkin boʻlgan muammo | Bu katta muammo boʻlishi mumkin | Stacked "could be" calque |
| 108 | boshlash uchun boshlaymiz | boshlaymiz | "To start, let's start" recursion |
| 109 | bir har bir kishi | har bir kishi / bitta kishi | Double article calque |
| 110 | Toʻgʻri javobni select qiling pastda | Toʻgʻri javobni belgilang | "below" calque survives in EN stem |

---

## §B. Russian-structure calques

### B1. RU discourse fillers (default clean Uzbek bans them)

| # | Bad | Good | Why |
|---|---|---|---|
| 111 | karoche | qisqasi / xoʻsh / endi | RU кстати/короче |
| 112 | normalni / norm | yaxshi / mayli / qoniqarli | RU нормально |
| 113 | kruto | zoʻr / ajoyib | RU круто |
| 114 | chotki | zoʻr / ajoyib | RU чётко |
| 115 | tipa | goʻyo / masalan / shunga oʻxshash | RU типа |
| 116 | vapshe | umuman / mutlaqo | RU вообще |
| 117 | ladno / ladna | mayli / xoʻp | RU ладно |
| 118 | blin | voy / (oʻchirish) | RU блин |
| 119 | poka | keyin koʻrishguncha / xayr | RU пока |
| 120 | spasibo (in UZ sentence) | rahmat | Keep one language per sentence |

### B2. Colloquial RU nouns (product copy rewrites; user voice may keep)

| # | Bad (product) | Good | Why |
|---|---|---|---|
| 121 | zakaz / zakas | buyurtma | RU заказ |
| 122 | skidka | chegirma | RU скидка |
| 123 | plastik (card) | karta | RU пластик |
| 124 | mashennik | firibgar | RU мошенник |
| 125 | nomer | raqam | RU номер |
| 126 | udalit qilmoq | oʻchirmoq | RU verb + qilmoq |
| 127 | skachat qilmoq | yuklab olmoq | RU verb + qilmoq |
| 128 | posmotret qilmoq | koʻrmoq / koʻrib chiqmoq | RU verb + qilmoq |
| 129 | sdelat qilmoq | qilmoq | RU verb + qilmoq (tautology) |
| 130 | peredat qilmoq | uzatmoq / topshirmoq | RU verb + qilmoq |
| 131 | otkryt qilmoq | ochmoq | RU verb + qilmoq |
| 132 | zakryt qilmoq | yopmoq | RU verb + qilmoq |
| 133 | proverit qilmoq | tekshirmoq | RU verb + qilmoq |
| 134 | otpravit qilmoq | yubormoq | RU verb + qilmoq |
| 135 | izmenit qilmoq | oʻzgartirmoq | RU verb + qilmoq |
| 136 | pilesos | changyutgich | RU пылесос; the assimilated word exists |
| 137 | registratsiya (button) | roʻyxatdan oʻtish | RU регистрация |

### B3. Officialese structural calques

| # | Bad | Good | Why |
|---|---|---|---|
| 138 | muvofiq ravishda | (kesib tashlang) / unga koʻra | RU соответственно connector |
| 139 | oʻz navbatida | (oʻchirish) / oʻz ketida | RU в свою очередь — adds nothing |
| 140 | hozirgi kunda / hozirgi vaqtda | hozir | RU в настоящее время filler |
| 141 | katta eʼtibor berildi | eʼtibor qaratildi | RU уделено большое внимание |
| 142 | belgilab berildi | belgilandi | RU report pair |
| 143 | ochib berildi | ochildi | RU report pair |
| 144 | taʼkidlab berildi | taʼkidlandi | RU report pair |
| 145 | koʻrsatib berildi | koʻrsatildi | RU report pair |
| 146 | mavjud boʻlgan (everywhere) | mavjud | RU participial filler |
| 147 | amalga oshirish jarayonida | bajarilmoqda / …-da | Officialese stack |
| 148 | taʼsir koʻrsatmoq | taʼsir qilmoq | RU оказывать влияние |
| 149 | eʼtibor berishni talab qiladi | muhim / eʼtibordan chetda qolmasin | RU требует внимания |
| 150 | yoʻl qoʻyilmadi (zero events) | sodir boʻlmadi / boʻlmadi | Report cliché pair with "qoidabuzarliklar" |
| 151 | tegishli chora-tadbirlar amalga oshirildi | chora koʻrildi | Officialese tail |
| 152 | boʻyicha (3+ per paragraph) | -da / toʻgʻrisida / (restructure) | RU по spam |
| 153 | X tomonidan yuborildi (with agent known) | X yubordi | RU passive + tomonidan double marking |
| 154 | tegishli tashkilotlar tomonidan | tegishli tashkilotlar | tomonidan needs a real agent role |
| 155 | asosida (every sentence) | -ga koʻra / (kesish) | RU на основе filler |
| 156 | doirasida (every event) | …-da / cheklovlarida | RU в рамках filler |
| 157 | hisobiga | tufayli / evaziga (by sense) | RU за счёт |
| 158 | zarur boʻlgan taqdirda | kerak boʻlsa | RU в случае необходимости |
| 159 | yuqorida koʻrsatilgandek | yuqoridagidek / oldingi bandda | Paper connector |
| 160 | quyidagi misolda koʻrinib turganidek | misolda koʻrinib turganidek | Redundant demonstrative |

### B4. RU syntax leaks into sentences

| # | Bad | Good | Why |
|---|---|---|---|
| 161 | menga boʻlgan sevgasi (RU-style genitive chains) | uning menga boʻlgan muhabbati | RU genitive chains; keep one -ning per chain |
| 162 | buning natijasida sifatida | natijasida | Double RU postposition stack |
| 163 | yetarli darajada yaxshi emas | yetarli emas | RU недостаточно хороший rhythm |
| 164 | juda koʻp sonli | juda koʻp | RU многочисленный calque |
| 165 | barcha tomonlama | har tomondan | RU всесторонний |
| 166 | faqatgina (both fillers) | faqat | Doubled focus particles |
| 167 | albatta ham | albatta / ham | RU конечно же stacking |

---

## §C. Connector calques and natural connectors

| # | Bad / stiff | Natural | Why |
|---|---|---|---|
| 168 | Shuning uchun ham shu sababli… | Shuning uchun… | Doubled causal connector |
| 169 | Bundan tashqari, qoʻshimcha | Bundan tashqari… | Doubled additive |
| 170 | Bir tomondan … boshqa tomondan (calqued "on the other hand") | bir tomondan … ikkinchi tomondan | Pair the Uzbek way |
| 171 | Shu bilan birga, ayni paytda | Shu bilan birga… | Doubled simultaneous connector |
| 172 | avvalo, birinchidan ikkinchidan (mixed) | Avvalo … Soʻng … | Do not mix ordinal systems |
| 173 | Yakuniy xulosa qilib aytganda | Qisqasi | Xulosa + qilib + aytganda stack |
| 174 | Boshqa soʻzlar bilan aytganda | Yaʼni | Calqued "in other words" |
| 175 | Koʻrinib turganidek, maʼlumki | (oʻchirish) | Doubled evidential opener |
| 176 | Shuni taʼkidlash joizki | Shuni aytish kerakki | Paper formula; joizki is fine in legal only |
| 177 | Xuddi shu tarzda | Xuddi shunday | Calqued sameness |
| 178 | Aynan shu sababli ham | Shu sababli | Triple stacking |
| 179 | oxirgi navbatda | oxiri / yakunda | RU в последнюю очередь sense drift |
| 180 | Birinchi navbatda (3+ uses) | Avval / Eng muhimi | Repetitive officialese |
| 181 | Boshqacha qilib aytadigan boʻlsak | Yaʼni | Long calque of "in other words" |
| 182 | Vanihoyat, xulosa qilib | Vanihoyat — (gap) | Do not stack vanihoyat + xulosa |

---

## §D. UI microcopy calques (quick table)

| # | Bad | Good | Why |
|---|---|---|---|
| 183 | Select the correct answer below → "Toʻgʻri javobni pastda select qiling" | Toʻgʻri javobni belgilang | Mixed EN stem + calque |
| 184 | Save qiling | Saqlang | EN stem |
| 185 | Submit the form → "Formani submit qiling" | Formani yuboring | EN stem |
| 186 | Are you sure delete? → "Rostdan ham delete?" | Rostdan ham oʻchirmoqchimisiz? | EN stem |
| 187 | Loading… → "Loading boʻlmoqda" | Yuklanmoqda… | Half-calque |
| 188 | No results → "Natijalar yoʻq boʻldi" | Soʻrovingiz boʻyicha hech narsa topilmadi | Calqued negation rhythm |
| 189 | Something went wrong → "Bir narsa notoʻgʻri ketdi" | Xatolik yuz berdi | Fixed idiom exists |
| 190 | Try again later → "Keyinroq qayta urinib koʻringni bajaring" | Iltimos, keyinroq qayta urinib koʻring | Verb-nominalization soup |
| 191 | Copy to clipboard → "Klipbordga nusxa olingni qiling" | Buferga nusxa olish | Suffix soup on a calque |
| 192 | Please wait → "Iltimos, kutishni bajaring" | Bir oz kuting | Nominalization calque |
| 193 | Order placed → "Buyurtma joylashtirildi" | Buyurtma qabul qilindi | "Placed" literal |
| 194 | Promo applied → "Promo qoʻllanildi qildi" | Promokod qoʻllandi | Suffix+qildi soup |
| 195 | Insufficient funds → "Mablagʻlar yetarli emas holatda" | Mablagʻ yetarli emas | Trailing holatda calque |
| 196 | Field is required → "Maydon talab qilinadi" | Bu maydon toʻldirilishi shart | Fixed formula |
| 197 | Back to home → "Uyga qaytish" | Bosh sahifaga qaytish | Literal "home" |
| 198 | Pickup point → "Olib ketish nuqtasi" (ok) / "Pickup punkti" (bad) | Topshirish punkti | Half-EN compound |
| 199 | Empty cart → "Boʻsh savat bor" | Savat boʻsh | Existential calque |
| 200 | Terms of use → "Foydalanishning shartlari boʻyicha" | Foydalanish shartlari | Genitive soup |

---

## §E. Chat ceremony (phase 2b/4 mined — chat register)

| # | Bad (AI ceremony) | Good (human) | Why |
|---|---|---|---|
| 201 | Sizning murojaatingiz uchun minnatdorman | Rahmat! | One word, like a person |
| 202 | Xabaringiz uchun tashakkurlar bildiramiz | Rahmat | Plural ceremony on a single thanks |
| 203 | Javobni quyida taqdim etaman | Javob: | Presentation ceremony |
| 204 | Men buni hal qilishga harakat qilaman | Hal qilaman | 'Will try to' hedging |
| 205 | …maʼlumot berishim mumkin | …aytib beraman | Frame without content |
| 206 | Xabaringizni koʻrib chiqdim va tahlil qildim | Oʻqib chiqdim | Analysis ceremony |
| 207 | Albatta, men buni tez orada… | Tez orada… | 'Of course' filler |
| 208 | Ushbu maʼlumot sizga foydali boʻladi deb umid qilaman | Foydali boʻldi deb oʻylayman | Hope-frame closer |
| 209 | Sizning soʻrovingiz muvaffaqiyatli roʻyxatdan oʻtkazildi | Roʻyxatdan oʻtdingiz | Status ceremony |
| 210 | Men sizga… javob topdim va uni taqdim etaman | Javobni topdim: | Double ceremony |

## §F. Report-speak verbs (gov corpus, phase 4)

| # | Bad (report) | Good (plain) | Why |
|---|---|---|---|
| 211 | amaldagi qonunchilikka muvofiq | qonunga koʻra | Current-legislation frame |
| 212 | tadbirkorlik subyektlari | tadbirkorlar | Bureaucratic 'subjects' |
| 213 | viloyat hududida | viloyatda | 'Territory of' padding |
| 214 | bartaraf etildi | tuzatildi | Report verb |
| 215 | ijrosi taʼminlandi | bajarildi | Fulfillment ceremony |
| 216 | aks ettirildi | kirdi / koʻrsatildi | Mirror-verb report |
| 217 | barpo etildi | qurildi | Construction report |
| 218 | hisobga olingan holda | hisobga olib | Absolute-clause calque |
| 219 | …oshirish maqsadida | …uchun | Purpose frame |
| 220 | ajratilishi rejalashtirilgan | ajratishmoqchi | Double-passive plan |
| 221 | xabar beriladi | xabar qilamiz | Impersonal report |
| 222 | yoʻl-yoʻriq beriladi | aytamiz | Guidance report |
| 223 | foydalanishga topshirildi | foydalanishga berildi | Handover ceremony |
| 224 | takliflar ilgari surildi | taklif berdi | State-news verb kit |
| 225 | belgilab olindi | belgilandi | 'Belgilab berdi' family |

## §G. Punctuation & structure tells (phase 2b/4, all registers)

| # | Bad | Good | Why |
|---|---|---|---|
| 226 | Ishlanyapti — tez orada | Ishlanyapti, tez orada | Em dash → comma (output policy: never) |
| 227 | Natija — 30% tejamkorlik | Natija: 30% tejamkorlik | Dash → colon for reveal |
| 228 | Bir bosish — va tayyor | Bir bosishda tayyor | Dash → restructure |
| 229 | ochiladi -- yangi imkoniyat | ochiladi, yangi imkoniyat | Double-hyphen markdown habit |
| 230 | soʻz—soʻzga | soʻzma-soʻz | Glued dash compounds → hyphen |
| 231 | Salom; ketdik | Salom, ketdik | Semicolon in chat |
| 232 | • birinchi • ikkinchi (chatda) | Birinchi… keyin ikkinchi… | Bullet lists in chat |
| 233 | katta zamonaviy qulay platforma | katta va qulay platforma | Bare triple stack |
| 234 | eng zamonaviy va innovatsion yechim | zamonaviy yechim | Hype pair |
| 235 | individual yondashuv asosida | ehtiyojingizga moslab | Brochure frame |

## §H. False-positive guards (what NOT to flag; phase 4)

| # | Fine as-is (do not flag) | Note |
|---|---|---|
| 236 | Buxoroda bozor yonib ketdi — tafsilotlar | News "— tafsilotlar" is attested kun.uz headline style (input lint skips formal registers; output policy still avoids) |
| 237 | Guruh ishi oʻxshamadi - nima qilasiz? | v1's own native-verified golden uses " - "; outside chat it's fine |
| 238 | Xizmat mavjud holatda taqdim etiladi; zarar uchun kafolat bermaymiz | Legal prose keeps semicolons |
| 239 | Tez, sodda va foydali | Clean marketing triple — only bare stacks or hype chains flag |
| 240 | Rahmat. Boʻldi. Yubordim. | Clipped chat: perfect punctuation rule exempts ≤3-word sentences with a 1-word line |
| 241 | I visited Samarkand and Bukhara last year | EN-only sentences are not Uzbek findings (context guard) |
| 242 | Ariza holati: Koʻrib chiqilmoqda | The status label is attested; the "qayta koʻrib chiqiladi" chain is the flag |
| 243 | Sinab koʻring va natijani koʻring | Polite -ing imperative; never a bare sen imperative |
| 244 | Ushbu Qonun kuchga kirgan kundan eʼtiboran qoʻllanadi | official register keeps document wording |
| 245 | Vazirlik tomonidan yangi yoʻriqnoma qabul qilindi | news register keeps the state-report passive |
| 246 | 10-15 daqiqa kuting | Hyphen ranges are fine; en dash 10–15 is the tell |
| 247 | Bankka boring | bank+ka is assimilated; only unassimilated bankga would flag |
| 248 | quyidagi gaplardan… (quiz) | quiz/news keep the formal pointer |
| 249 | keliningiz, oʻtishingizda, yigʻilishlar | Not suffix errors — legal chains and real plurals |
| 250 | Murojaatingiz uchun rahmat | Fine (single thanks); the minnatdorman ceremony is the flag |

## Review rule (same as v1, kept)

If the English word is the product name or a globally fixed tech term, keep it
(Wi‑Fi, OTP, PIN, email, Google). If it is filler swagger or a verb with a
native equivalent, kill it. See `loanword-policy.md` for the KEEP list.
