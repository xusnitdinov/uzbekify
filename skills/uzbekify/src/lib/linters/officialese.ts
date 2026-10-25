/**
 * Officialese family — the CORE MISSION bank.
 *
 * Patterns mined from research/gov-corpus/ (lex.uz law text, president.uz
 * headlines, gov titles; see research/FINDINGS.md). The state's own product
 * UI (my.gov.uz) is human-voiced, so these document-register patterns are
 * robotic everywhere except the `official` register:
 *
 * - Tier A: flagged in EVERY register except `official`.
 * - Tier B: document-speak that is legitimate in formal registers
 *   (news/legal/academic/official); flagged only in casual copy.
 */
import { Finding, LintOptions } from "../types.js";
import { ruleFindings, Rule } from "./util.js";

const FORMAL_REGISTERS = new Set(["news", "legal", "academic", "official", "quiz"]);

interface OfficialeseRule extends Rule {
  /** "A" = every register except official; "B" = casual registers only. */
  tier: "A" | "B";
}

const OFFICIALESE_RULES: OfficialeseRule[] = [
  // ---------------- Tier A: robotic everywhere except official ----------------
  {
    id: "off.mazkur",
    family: "officialese",
    tier: "A",
    re: /\bmazkur\b/gi,
    severity: "warn",
    message: "Document-speak — bu / shu (mazkur belongs in decrees, not human copy)",
  },
  {
    id: "off.ushbu",
    family: "officialese",
    tier: "A",
    re: /\bushbu\b/gi,
    severity: "warn",
    message: "Document-speak — bu / shu (keep ushbu only in official documents)",
  },
  {
    id: "off.belgilangan-tartibda",
    family: "officialese",
    tier: "A",
    re: /\bbelgilangan\s+tartibda\b/gi,
    severity: "warn",
    message: "Bureaucratic filler — say the actual steps, or drop it (lex.uz register)",
  },
  {
    id: "off.amalga-oshirilishi-kerak",
    family: "officialese",
    tier: "A",
    re: /\bamalga\s+oshirilishi\s+(?:kerak|lozim|shart|zarur)\b/gi,
    severity: "warn",
    message: "Document-speak — qilinishi kerak / qiling (amalga oshirilishi is law-text phrasing)",
  },
  {
    id: "off.har-tomonlama",
    family: "officialese",
    tier: "A",
    re: /\bhar\s+tomonlama\b/gi,
    severity: "warn",
    message: "Law-text adverb stack (xolisona, har tomonlama…) — toʻliq / atrofilicha by sense",
  },
  {
    id: "off.tegishli-tarzda",
    family: "officialese",
    tier: "A",
    re: /\btegishli\s+(?:tarzda|tartibda)\b/gi,
    severity: "warn",
    message: "Law-text filler — cut it; the verb already says how",
  },
  {
    id: "off.nazarda-tutilgan",
    family: "officialese",
    tier: "A",
    re: /\bnazarda\s+tutilgan\s+hollarda\b/gi,
    severity: "warn",
    message: "Law-text conditional — agar … boʻlsa / qoidaga koʻra",
  },
  {
    id: "off.zimmasida-boladi",
    family: "officialese",
    tier: "A",
    re: /\bzimmasida\s+boʻladi\b|\bzimmasida\s+yuqorida\b/gi,
    severity: "warn",
    message: "Law-text possession — … toʻlaydi / … hisobidan boʻladi",
  },
  {
    id: "off.e-tiboran",
    family: "officialese",
    tier: "A",
    re: /\bpaytdan\s+eʼtiboran\b|\bkundan\s+eʼtiboran\b/gi,
    severity: "warn",
    message: "Law-text time marker — …dan boshlab",
  },
  {
    id: "off.chora-tadbirlar",
    family: "officialese",
    tier: "A",
    re: /\bchora-tadbirlar\b/gi,
    severity: "warn",
    message: "Resolution-speak — qadamlar / choralar",
  },
  {
    id: "off.faoliyat-yuritish",
    family: "officialese",
    tier: "A",
    re: /\bfaoliyat\s+yuritish(?:ini|ni)?\b/gi,
    severity: "warn",
    message: "Document-speak — ishlash / ishlashi",
  },
  {
    id: "off.tubdan-takomillashtirish",
    family: "officialese",
    tier: "A",
    re: /\btubdan\s+takomillashtirish\b/gi,
    severity: "warn",
    message: "Resolution-title speak — yaxshilash / oʻzgartirish",
  },
  {
    id: "off.davlatimiz-rahbari",
    family: "officialese",
    tier: "A",
    re: /\bDavlatimiz\s+rahbari\b/g,
    severity: "warn",
    message: "State-news honorific — Prezident (casual copy)",
  },

  {
    id: "off.passive-nomen-require",
    family: "officialese",
    tier: "A",
    re: /\b(?:qabul\s+qilinishi|topshirilishi|taqdim\s+etilishi|koʻrib\s+chiqilishi|roʻyxatdan\s+oʻtkazilishi|taʼminlanishi|yaratilishi|hal\s+qilinishi|koʻrilishi|uzaytirilishi|oʻtkazilishi|bajarilishi|yangilanishi)\s+(?:kerak|lozim|shart|zarur|mumkin)\b/gi,
    severity: "warn",
    message: "Law-text passive chain (-lishi kerak) — say who does what: yozing / beramiz / koʻramiz",
  },
  {
    id: "off.talab-etiladi",
    family: "officialese",
    tier: "A",
    re: /\b(?:taqdim\s+etish\s+)?talab\s+etiladi\b/gi,
    severity: "warn",
    message: "Law-text requirement — … kerak / …ngiz kerak",
  },
  {
    id: "off.ozgartirish-qoshimcha",
    family: "officialese",
    tier: "A",
    re: /\boʻzgartirish\s+va\s+qoʻshimcha(lar)?\s+kiritish\b/gi,
    severity: "warn",
    message: "lex.uz title-speak — oʻzgartirish kiritildi / oʻzgartirdik",
  },
  {
    id: "off.yanada-rivojlantirish",
    family: "officialese",
    tier: "A",
    re: /\byanada\s+(?:rivojlantirish|takomillashtirish|oshirish)\b/gi,
    severity: "warn",
    message: "Resolution boilerplate — rivojlantirdik / oshirdik (say who acts)",
  },
  {
    id: "off.samarali-hamkorlik",
    family: "officialese",
    tier: "A",
    re: /\bsamarali\s+hamkorlik\b/gi,
    severity: "warn",
    message: "Report boilerplate — hamkorlik qildik / birga ishlaymiz",
  },
  {
    id: "off.yolga-qoyildi",
    family: "officialese",
    tier: "A",
    re: /\byoʻlga\s+qoʻyildi\b/gi,
    severity: "warn",
    message: "Report phrase — boshladik / joriy qildik",
  },
  {
    id: "off.ta-minlandi-imkoniyat",
    family: "officialese",
    tier: "A",
    re: /\bimkoniyati\s+bilan\s+taʼminlan(?:di|moqda|adi|gandir)\b/gi,
    severity: "warn",
    message: "Report-speak — foydalanadi / ola oladi",
  },

  {
    id: "off.amaldagi-qonunchilik",
    family: "officialese",
    tier: "A",
    re: /\bamaldagi\s+qonunchilik(?:ka)?\s+muvofiq\b/gi,
    severity: "warn",
    message: "Document frame — qonunga koʻra",
  },
  {
    id: "off.subyektlar",
    family: "officialese",
    tier: "A",
    re: /\b(?:tadbirkorlik|kichik\s+biznes|biznes)\s+subyektlar(?:i)?\b/gi,
    severity: "warn",
    message: "Bureaucratic 'subyektlar' — tadbirkorlar / kichik biznes",
  },
  {
    id: "off.hududida",
    family: "officialese",
    tier: "A",
    re: /\b[\wʻʼ]+\s+hududida\b/gi,
    severity: "warn",
    message: "'X hududida' — just the place: viloyatda, shaharda",
  },
  {
    id: "off.yuqorida-sanab",
    family: "officialese",
    tier: "A",
    re: /\byuqorida\s+sanab\s+oʻtilgan\b/gi,
    severity: "warn",
    message: "Document pointer — yuqoridagi",
  },
  {
    id: "off.hisobga-olingan-holda",
    family: "officialese",
    tier: "A",
    re: /\bhisobga\s+olingan\s+holda\b/gi,
    severity: "warn",
    message: "Report frame — hisobga olib",
  },
  {
    id: "off.xabar-beriladi",
    family: "officialese",
    tier: "A",
    re: /\bxabar\s+beriladi\b/gi,
    severity: "warn",
    message: "Report verb — xabar qilamiz / yozamiz",
  },
  {
    id: "off.bartaraf-etildi",
    family: "officialese",
    tier: "A",
    re: /\bbartaraf\s+etildi\b/gi,
    severity: "warn",
    message: "Report verb — tuzatildi / yoʻq qilindi",
  },
  {
    id: "off.ijrosi-taminlandi",
    family: "officialese",
    tier: "A",
    re: /\b[\wʻʼ]+\s+ijrosi(?:\s+[\wʻʼ]+)?\s+taʼminlandi\b/gi,
    severity: "warn",
    message: "Report verb — bajarildi",
  },
  {
    id: "off.aks-ettirildi",
    family: "officialese",
    tier: "A",
    re: /\baks\s+ettirildi\b/gi,
    severity: "warn",
    message: "Report verb — kirdi / koʻrsatildi",
  },
  {
    id: "off.barpo-etildi",
    family: "officialese",
    tier: "A",
    re: /\bbarpo\s+etildi\b/gi,
    severity: "warn",
    message: "Report verb — qurildi",
  },
  {
    id: "off.maqsidа",
    family: "officialese",
    tier: "A",
    re: /\b\w+(?:ni|sifatini|ni)\s+(?:oshirish|yaxshilash|taʼminlash)\s+maqsadida\b/gi,
    severity: "warn",
    message: "Purpose frame 'maqsadida' — … uchun",
  },
  {
    id: "off.rejalashtirilgan",
    family: "officialese",
    tier: "A",
    re: /\b\w{3,}(?:ilishi|iladi|ishi)\s+rejalashtiril(?:gan|adi)\b/gi,
    severity: "warn",
    message: "Double-passive plan-speak — … rejalashtirilgan → ajratishmoqchi",
  },
  {
    id: "off.eng-hype",
    family: "officialese",
    tier: "A",
    re: /\beng\s+(?:zamonaviy|innovatsion|unikal)\b/gi,
    severity: "warn",
    message: "Superlative hype pair — pick one plain adjective",
  },
  {
    id: "off.yol-yoriq-beriladi",
    family: "officialese",
    tier: "A",
    re: /\byoʻl-yoʻriq\s+beriladi\b/gi,
    severity: "warn",
    message: "Report verb — aytamiz / koʻrsatamiz",
  },
  {
    id: "off.muvaffaqiyatli-ro-yxat",
    family: "officialese",
    tier: "A",
    re: /\bmuvaffaqiyatli\s+(?:roʻyxatdan\s+oʻtkazildi|qayta\s+is(?:h|hl)andi|qabul\s+qilindi|qayd\s+etildi)\b/gi,
    severity: "warn",
    message: "Status ceremony — Roʻyxatdan oʻtdingiz / qabul qildik",
  },
  {
    id: "off.qabul-qilinishi-uchun",
    family: "officialese",
    tier: "A",
    re: /\bqabul\s+qilinishi\s+uchun\b/gi,
    severity: "warn",
    message: "Passive purpose frame — buyurtma uchun / qabul qilish uchun",
  },

  {
    id: "off.individual-yondashuv",
    family: "officialese",
    tier: "A",
    re: /\bindividual\s+yondashuv\s+asosida\b/gi,
    severity: "warn",
    message: "Brochure frame — ehtiyojingizga moslab",
  },
  {
    id: "off.qayta-korib-chiqiladi",
    family: "officialese",
    tier: "A",
    re: /\bqayta\s+koʻrib\s+chiqil(?:adi|di)\b/gi,
    severity: "warn",
    message: "Report passive (the status label 'Koʻrib chiqilmoqda' is fine; this chain is not) — qayta koʻramiz",
  },
  {
    id: "off.foydalanishga-topshirildi",
    family: "officialese",
    tier: "A",
    re: /\bfoydalanishga\s+topshirildi\b/gi,
    severity: "warn",
    message: "Report verb — foydalanishga berildi / ochib berdik",
  },
  {
    id: "off.ilgari-suruldi",
    family: "officialese",
    tier: "A",
    re: /\b(?:takliflar|tashabbuslar)\s+ilgari\s+surildi\b/gi,
    severity: "warn",
    message: "State-news verb kit — taklif berdi / boshladi",
  },
  // ---------------- Tier B: document-speak, fine in formal registers ----------------
  {
    id: "off.quyidagi",
    family: "officialese",
    tier: "B",
    re: /\bquyidagi\b/gi,
    severity: "info",
    message: "Document pointer — bu / shu reads human in casual copy (quyidagi is fine in reports)",
  },
  {
    id: "off.yuqoridagi",
    family: "officialese",
    tier: "B",
    re: /\byuqoridagi\b/gi,
    severity: "info",
    message: "Document pointer — oldingi / shu reads human (yuqoridagi is report-speak)",
  },
  {
    id: "off.olib-borilmoqda",
    family: "officialese",
    tier: "B",
    re: /\bolib\s+boril(?:moqda|di)\b/gi,
    severity: "warn",
    message: "Report verb — qilyapmiz / bordi / ishlayapmiz (active, human)",
  },
  {
    id: "off.otkazilmoqda",
    family: "officialese",
    tier: "B",
    re: /\boʻtkazil(?:moqda|yapti)\b/gi,
    severity: "warn",
    message: "Report passive — oʻtkazyapmiz / boʻlib oʻtyapti (human voice)",
  },
  {
    id: "off.bayonot-verb",
    family: "officialese",
    tier: "B",
    re: /\b(?:belgilab\s+berdi|ilgari\s+surdi|eʼtiborga\s+ol(?:indi|inmoqda)|yoʻl\s+qoʻyil\w*|xabardor\s+qilin\w*)\b/gi,
    severity: "info",
    message: "State-news verb kit — use plain verbs in casual copy (aytdi, boshladi, koʻrdi)",
  },
  {
    id: "off.doirasida",
    family: "officialese",
    tier: "B",
    re: /\b[\wʻʼ]+(?:lar|lari|larimiz)?\s+doirasida\b/gi,
    severity: "info",
    message: "Report frame (doirasida) — say it plainly: xaridlaganingiz uchun / tadbirda",
  },
  {
    id: "off.munosabati-bilan",
    family: "officialese",
    tier: "B",
    re: /\bmunosabati\s+bilan\b/gi,
    severity: "info",
    message: "Official-congrats connector — casual copy says … kuni / … kugi",
  },
];

/** AI chat-tells (human-voice killers) — every register except official. */
const AI_TELL_RULES: Rule[] = [
  {
    id: "off.ai-opener",
    family: "officialese",
    re: /(?:^|[.!?]\s+)(Ajoyib\s+savol!?|Albatta!\s|Tabriklar!\s|Zoʻr\s+tanlov!)/gm,
    severity: "warn",
    message: "AI chat-tell opener — answer directly like a person would",
  },
  {
    id: "off.xulosa-short",
    family: "officialese",
    re: /\bXulosa\s+qilib\b/gi,
    severity: "info",
    message: "Qisqasi — humans do not announce a conclusion in a short answer",
  },
];

/** mazkur/ushbu are standard legal wording: warn in casual copy, info in formal prose. */
const DOWNGRADE_IN_FORMAL = new Set(["off.mazkur", "off.ushbu"]);

/** Document-style registers that keep Tier A wording: laws, decrees, papers. */
const DOCUMENT_REGISTERS = new Set(["official", "legal", "academic"]);

export function lintOfficialese(text: string, opts: LintOptions = {}): Finding[] {
  const register = opts.register ?? "product";
  const rules: Rule[] = [];
  for (const r of OFFICIALESE_RULES) {
    if (register === "official") continue; // official register keeps the full document style
    if (r.tier === "A" && DOCUMENT_REGISTERS.has(register)) continue; // legal/academic keep document wording
    if (r.tier === "B" && FORMAL_REGISTERS.has(register)) continue; // fine in formal prose
    if (register === "quiz") {
      rules.push({ ...r, severity: "info" }); // quiz formal: notes, not warnings
      continue;
    }
    rules.push(r);
  }
  if (register !== "official") rules.push(...AI_TELL_RULES);
  return ruleFindings(text, rules, opts);
}
