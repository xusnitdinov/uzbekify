/**
 * Calque family: English-structure calques, EN cool-slang paste, soft-wrong
 * situation verbs, brochure stacks, EN place names, detached suffixes,
 * marketing translationese. Extends v1's banned list.
 */
import { Finding } from "../types.js";
import { ruleFindings, Rule, hasUzbekContext, hasAnyUzbek } from "./util.js";

const SHIP_META =
  /\b(?:before|after|to|will|can|should|must|don't|do not|does not|did not|when you|we|you)\s+ship\b/i;

export const CALQUE_RULES: Rule[] = [
  // ---- EN cool slang / paste (v1 bans, kept) ----
  {
    id: "calque.ship",
    family: "calque",
    re: /\bship\b/gi,
    severity: "error",
    message: "EN cool slang — prefer topshirmoq / chiqarmoq / ishga tushirmoq / yakunlamoq",
    skipMatch: (m, text) => {
      const i = text.toLowerCase().indexOf(m.toLowerCase());
      const window = text.slice(Math.max(0, i - 24), i + m.length);
      return SHIP_META.test(window) || /\bship\s+(?:order|date|hygiene)\b/i.test(window);
    },
  },
  {
    id: "calque.vibe",
    family: "calque",
    re: /\bvibe\b/gi,
    severity: "error",
    message: "EN cool slang — prefer kayfiyat / muhit / taassurot",
    skipMatch: (m, text) => {
      const i = text.toLowerCase().indexOf(m.toLowerCase());
      const window = text.slice(Math.max(0, i - 20), i + m.length + 8);
      return /\b(?:telegram|akkurat|teaching|mode)\s+vibe\b/i.test(window);
    },
  },
  { id: "calque.portladi", family: "calque", re: /\bportladi\b/gi, severity: "error", message: "Internet calque — prefer juda yoqdi / zoʻr chiqdi (or oʻxshamadi for failures)" },
  { id: "calque.teammate", family: "calque", re: /\bteammate\b/gi, severity: "error", message: "Prefer guruhdoshingiz / jamoadoshingiz / hamkasb" },
  { id: "calque.systems-brain", family: "calque", re: /\bsystems\s+brain\b/gi, severity: "error", message: "AI cosplay phrase — prefer tizimli fikrlash / mantiqni tushunish" },
  { id: "calque.hard-mode", family: "calque", re: /\bhard\s+mode\b/gi, severity: "error", message: "Prefer qiyin rejim / qiyinroq variant" },
  { id: "calque.dream-mode", family: "calque", re: /\bdream\s+mode\b/gi, severity: "warn", message: "Prefer orzular rejimi — or real product language" },
  { id: "calque.rocket-science", family: "calque", re: /\brocket\s+science\b/gi, severity: "error", message: "Literal 'rocket science' — Bu unchalik murakkab ish emas" },

  // ---- EN verb + qilmoq hybrids ----
  {
    id: "calque.en-qil",
    family: "calque",
    re: /\b(?:check|support|update|select|save|share|click|cancel|delete|confirm|download|upload|login|log\s?in|log\s?out|follow|skip|book|order|pay|send|join|open|close|copy|paste|install|register|restart|scan|sign\s?in|sign\s?up|sign|try|start|stop|call|text|post|block|report|search|fix|clear|apply|add|remove|view|edit|create|new|complete|renew|motivate|look)\s+qil\w*/gi,
    severity: "error",
    message: "EN verb + qilmoq — use the Uzbek verb (tekshirmoq, yangilamoq, saqlamoq, yubormoq…)",
  },

  // ---- phrase-level EN calques ----
  { id: "calque.haqiqatan-ham", family: "calque", re: /\bhaqiqatan\s+ham\b/gi, severity: "warn", message: "AI filler intensity — usually removable; prefer juda / really cut" },
  { id: "calque.hurmatli-foydalanuvchi", family: "calque", re: /\bHurmatli\s+foydalanuvchi\b/gi, severity: "error", message: "Brochure opener — cut it or address the person directly (Assalomu alaykum!)" },
  { id: "calque.innovatsion", family: "calque", re: /\b(?:innovatsion\s+yechim|imkoniyatlar\s+olami|maksimal\s+darajada)\b/gi, severity: "error", message: "Hype brochure stack — write the plain benefit" },
  { id: "calque.qarshi-emasmisiz", family: "calque", re: /\bqarshi\s+emasmisiz\b/gi, severity: "error", message: "Literal 'would you mind' — prefer Iltimos, …-ib qoʻying" },
  { id: "calque.qarshi-bolmasa", family: "calque", re: /\bqarshi\s+boʻlmasa\b/gi, severity: "warn", message: "Literal 'if you don't mind' — prefer agar qulay boʻlsa / boʻlsa" },
  { id: "calque.raketa-ilmi", family: "calque", re: /\braketa\s+ilmi\b/gi, severity: "error", message: "Literal 'rocket science' — Bu unchalik murakkab ish emas" },
  { id: "calque.chelakni-tepdi", family: "calque", re: /\bchelakni\s+tepdi\b/gi, severity: "error", message: "Literal 'kicked the bucket' — U vafot etdi" },
  { id: "calque.men-yoqtiraman", family: "calque", re: /\bMen\s+(?:haqiqatan\s+ham\s+)?(?:bu\s+)?\w{0,20}?\s*yoqtiraman\b/gi, severity: "warn", message: "EN 'I like X' structure — prefer Bu … menga juda yoqadi / yoqdi" },
  { id: "calque.qayta-aloqa", family: "calque", re: /\bqayta\s+aloqa\b/gi, severity: "warn", message: "RU calque обратная связь — prefer Fikringiz uchun rahmat / Izohingiz uchun tashakkur" },
  { id: "calque.tajriba-ux", family: "calque", re: /\b(?:foydalanuvchi\s+tajriba(?:si|sini)?|tajribani\s+yaxshilash|user\s+experience|eng\s+yaxshi\s+tajriba)\b/gi, severity: "warn", message: "UX 'experience' → tajriba is not the native review word — prefer qulay / yoqdi / foydalanish" },
  { id: "calque.amalga-oshirish-tautology", family: "calque", re: /\bamalga\s+oshirishni\s+amalga\s+oshir(?:moq|di|amiz)?\b/gi, severity: "error", message: "Tautological officialese — use bajarmoq / qilmoq once" },
  { id: "calque.rahmat-oldindan", family: "calque", re: /\bRahmat\s+sizga\s+oldindan\b/gi, severity: "warn", message: "Calqued 'thank you in advance' — Oldindan rahmat" },

  // ---- marketing translationese ----
  { id: "calque.transformatsiya", family: "calque", re: /\b\w+\w\s+(?:hayotingizni|ishlaringizni)\s+transformatsiya\s+qil(?:ing|moq)?\b|\b(?:hayotingizni|ishlaringizni)\s+transformatsiya\b/gi, severity: "warn", message: "Hype translationese — Ishlaringizni yengillashtiring" },
  { id: "calque.transformatsiya2", family: "calque", re: /\btransformatsiya\s+qil/gi, severity: "warn", message: "Hype translationese — oʻzgartiring / yengillashtiring" },
  { id: "calque.chegaralarni-buzish", family: "calque", re: /\bchegaralarni\s+buz(?:ing|moq)?\b/gi, severity: "warn", message: "'Break boundaries' calque — Oʻzingizga qulay yoʻlda ishlang" },
  { id: "calque.kelajakni-boshlang", family: "calque", re: /\bkelajagingizni\s+bugun\s+boshlang\b/gi, severity: "warn", message: "Boilerplate CTA calque — Bugun boshlab koʻring" },
  { id: "calque.keyingi-darajali", family: "calque", re: /\bkeyingi\s+darajali\b/gi, severity: "warn", message: "'Next-level' calque — say the concrete benefit" },
  { id: "calque.qudratlangan", family: "calque", re: /\b\w+\s+qudratlangan\b/gi, severity: "warn", message: "'Powered by' calque — … yordamida / … bilan" },
  { id: "calque.minglab-odamlar", family: "calque", re: /\bminglab\s+(?:odamlar|foydalanuvchi\w*|mijoz\w*|tashkilot\w*)\b/gi, severity: "warn", message: "Fake social proof — Koʻpchilik ishlatib koʻrgan (only with real data)" },
  { id: "calque.inqilobiy", family: "calque", re: /\binqilobiy\b/gi, severity: "warn", message: "'Revolutionary' — katta yaxshilanish" },
  { id: "calque.mislsiz", family: "calque", re: /\bmislsiz\b/gi, severity: "warn", message: "Unverifiable claim — Tezroq bitiring" },
  { id: "calque.ideal-tanlov", family: "calque", re: /\b(?:ideal\s+tanlovingiz|sizning\s+ideal\s+tanlovingiz)\b/gi, severity: "warn", message: "Ad-speak — Sizga mos variant" },
  { id: "calque.kashf-eting", family: "calque", re: /\bkashf\s+et(?:ing|moq|adi)\b/gi, severity: "warn", message: "Product-CTA 'discover' — Koʻrib chiqing / koʻring" },
  { id: "calque.potensial-ochish", family: "calque", re: /\bpotensial\w*\s+och(?:ing|moq|adi)\b/gi, severity: "warn", message: "'Unlock your potential' — Kuchingiz yetadigan ishni toping" },
  { id: "calque.muammosiz-tajriba", family: "calque", re: /\bmuammosiz\s+tajriba\b/gi, severity: "warn", message: "'Seamless experience' — Xatosiz ishlaydi" },
  { id: "calque.erta-qush", family: "calque", re: /\berta\s+qush\b/gi, severity: "warn", message: "'Early bird' calque — Erta band qilganlarga chegirma" },
  { id: "calque.boshliqni-toldirish", family: "calque", re: /\bboʻshliqni\s+toʻldir(?:ing|moq)?\b/gi, severity: "warn", message: "'Fill the gap' calque — name the missing thing" },
  { id: "calque.dunyodagi-eng", family: "calque", re: /\bdunyodagi\s+eng\s+(?:yaxshi|zoʻr|kuchli|yetakchi)\s+\w*/gi, severity: "warn", message: "Superlative overclaim — unless verified, drop 'dunyodagi eng'" },
  { id: "calque.tegishli-hamkorlik", family: "calque", re: /\btegishli\s+hamkorlik\b/gi, severity: "warn", message: "RU calque соответствующее сотрудничество — cut it" },
  { id: "calque.narx-kafolat", family: "calque", re: /\beng\s+yaxshi\s+narx-kafolat\b/gi, severity: "warn", message: "Marketing compound calque — plain promise with real terms" },
  { id: "calque.kafolatlanadi", family: "calque", re: /\bkafolatlanadi\b/gi, severity: "info", message: "Verify guarantees before promising — kafolat needs real terms" },

  {
    id: "calque.kuchli-tayyorgarlik",
    family: "calque",
    re: /\bkuchli\s+tayyorgarlik\b/gi,
    severity: "warn",
    message: "Collocation miss (RU буквальный 'сильная подготовка') — puxta tayyorgarlik",
  },
  {
    id: "calque.haridni-amalga-oshirish",
    family: "calque",
    re: /\bxaridni\s+amalga\s+oshirish\b/gi,
    severity: "warn",
    message: "Button nominalization — Xarid qilish / Toʻlash reads native on a CTA",
  },
  // ---- soft-wrong situation verbs (chiqmadi class) ----
  {
    id: "calque.soft-chiqmadi",
    family: "calque",
    re: /\b(?:Guruh|Loyiha|Reja|Suhbat|Imtihon|Ish)\s*(?:ishi\s+)?chiqmadi\b/gi,
    severity: "warn",
    message: "Situation-wrong verb: guruh ishi/loyiha oʻxshamadi, reja amalga oshmadi, imtihon yaxshi oʻtmadi, suhbat oʻxshamadi",
  },
  {
    id: "calque.asabiylashgan",
    family: "calque",
    re: /\b(?:Asabiylashgan|Nervniy)\s+doʻst/gi,
    severity: "warn",
    message: "Prefer stressdagi / tashvishdagi doʻst (nervniy is an RU leak)",
  },

  // ---- EN place names in UZ prose (\w* so suffixes match: Tashkentda) ----
  {
    id: "calque.place-en",
    family: "calque",
    re: /\b(?:Tashkent|Samarkand|Bukhara|Fergana|Andijan|Khiva|Kokand|Termez|Urgench|Khorezm|Nukus|Margilan|Karshi|Shakhrisabz|Jizzakh)\w*/g,
    severity: "error",
    message: "EN place name in Uzbek text — Toshkent/Samarqand/Buxoro/Fargʻona/…",
    skipMatch: (m, text) => !hasAnyUzbek(text, m),
  },

  // ---- detached suffixes after EN words: "Wi-Fi ga", "Email ingizni" ----
  {
    id: "calque.detached-suffix",
    family: "calque",
    re: /\b(?:Wi-?Fi|OTP|PIN|email|Google|Telegram|Instagram|cookie|promokod|keshbek|app|login|account|file|order|status|deadline|meeting|task|team|project|boss|report|message|feedback|check|update|share|save|send|like|story|reel)\s+(?:ga|ka|qa|da|dan|ni|ning|lar|lari|larni|bilan|ingiz|ingizni|ingizga|imiz)\b/gi,
    severity: "warn",
    message: "Detached suffix after a loanword — merge it (Wi-Fiʼga, Emailingizni) or restructure (cookie sozlamalari)",
  },

  // ---- EN UI boilerplate paste (context-guarded) ----
  {
    id: "calque.en-ui-paste",
    family: "calque",
    re: /\b(?:Forgot\s+password|Loading|Something\s+went\s+wrong|Try\s+again\s+later|No\s+results(?:\s+found)?|Save\s+changes|Copy\s+link|Delete\s+account|Invalid\s+password|Please\s+wait|Are\s+you\s+sure|Welcome\s+back|Create\s+account|Sign\s+up|Log\s+in)\b/g,
    severity: "warn",
    message: "English UI string pasted into Uzbek copy — localize it (Parolni unutdingizmi? / Xatolik yuz berdi / …)",
    skipMatch: (m, text) => !hasAnyUzbek(text, m),
  },
];

export function lintCalque(text: string): Finding[] {
  return ruleFindings(text, CALQUE_RULES);
}
