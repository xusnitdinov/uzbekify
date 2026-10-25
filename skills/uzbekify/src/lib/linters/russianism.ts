/**
 * Russianism family: RU discourse fillers, RU verb + qilmoq, bare RU
 * infinitives, colloquial RU nouns, and structural officialese calques.
 */
import { Finding } from "../types.js";
import { ruleFindings, Rule, hasAnyUzbek } from "./util.js";
import { splitSentences } from "../text.js";

export const RUSSIANISM_RULES: Rule[] = [
  // ---- discourse RU fillers (clean default bans them) ----
  { id: "ru.karoche", family: "russianism", re: /\bkaroche\b/gi, severity: "error", message: "RU discourse — qisqasi / xoʻsh / endi (youth mode only)" },
  { id: "ru.normalni", family: "russianism", re: /\bnormalni\b/gi, severity: "error", message: "RU discourse — yaxshi / mayli / qoniqarli" },
  { id: "ru.kruto", family: "russianism", re: /\bkruto\b/gi, severity: "error", message: "RU discourse — zoʻr / ajoyib" },
  { id: "ru.chotki", family: "russianism", re: /\bchotki\b/gi, severity: "error", message: "RU discourse — zoʻr / ajoyib" },
  { id: "ru.tipa", family: "russianism", re: /\btypa\b|\btipa\b/gi, severity: "warn", message: "RU filler — goʻyo / masalan / shunga oʻxshash" },
  { id: "ru.vapshe", family: "russianism", re: /\bvapshe\b/gi, severity: "warn", message: "RU filler — umuman / mutlaqo" },
  { id: "ru.ladno", family: "russianism", re: /\bladno\b|\bladna\b/gi, severity: "warn", message: "RU filler — mayli / xoʻp" },
  { id: "ru.blin", family: "russianism", re: /\bb?lin\b/gi, severity: "warn", message: "RU interjection — remove or use voy / vay" },
  { id: "ru.spasibo", family: "russianism", re: /\bspasibo\b/gi, severity: "error", message: "RU word in Latin Uzbek text — rahmat" },
  { id: "ru.poka", family: "russianism", re: /\bpoka\b/gi, severity: "warn", message: "RU filler — keyin koʻrishguncha / xayr" },

  // ---- colloquial RU nouns (product copy rewrites; user voice may keep) ----
  { id: "ru.zakaz", family: "russianism", re: /\bzakaz\w*|\bzakas\w*/gi, severity: "warn", message: "Colloquial RU noun — buyurtma in product copy" },
  { id: "ru.skidka", family: "russianism", re: /\bskidka\w*/gi, severity: "warn", message: "Colloquial RU noun — chegirma in product copy" },
  { id: "ru.plastik", family: "russianism", re: /\bplastik\b/gi, severity: "warn", message: "Colloquial RU noun — karta in product copy" },
  { id: "ru.mashennik", family: "russianism", re: /\bmashennik\w*/gi, severity: "warn", message: "Colloquial RU noun — firibgar" },
  { id: "ru.nomer", family: "russianism", re: /\bnomer\w*/gi, severity: "warn", message: "Colloquial RU noun — raqam" },
  { id: "ru.pilesos", family: "russianism", re: /\bpilesos\w*/gi, severity: "warn", message: "RU noun — changyutgich" },
  { id: "ru.registratsiya", family: "russianism", re: /\bregistratsiya\b/gi, severity: "warn", message: "RU noun — roʻyxatdan oʻtish" },

  // ---- RU verb + qilmoq / bare RU infinitives ----
  {
    id: "ru.ru-verb-qil",
    family: "russianism",
    re: /\b(?:udalit|skachat|posmotret|sdelat|peredat|otkryt|zakryt|izmenit|vbrosit|kinut|ostavit|proverit|otpravit|skazat)\s+qil\w*/gi,
    severity: "error",
    message: "RU verb + qilmoq — use the Uzbek verb (oʻchirmoq, yuklab olish, tekshirmoq, yubormoq…)",
  },
  {
    id: "ru.ru-infinitive-bare",
    family: "russianism",
    re: /\b(?:udalit|skachat|posmotret|sdelat|peredat|otkryt|zakryt|izmenit|proverit|otpravit|zvonit|kupit|vybrat)\b/gi,
    severity: "error",
    message: "Transliterated RU infinitive in Uzbek text — use the Uzbek verb",
    skipMatch: (m, text) => !hasAnyUzbek(text, m),
  },

  // ---- structural Russian-structure calques ----
  { id: "ru.muvofiq-ravishda", family: "russianism", re: /\bmuvofiq\s+ravishda\b/gi, severity: "warn", message: "RU calque (соответственно) — cut it, or unga koʻra / mos ravishda when the sense is real" },
  { id: "ru.oz-navbatida", family: "russianism", re: /\boʻz\s+navbatida\b/gi, severity: "warn", message: "RU connector calque (в свою очередь) — usually removable" },
  { id: "ru.hozirgi-kunda", family: "russianism", re: /\bhozirgi\s+(?:kunda|vaqtda)\b/gi, severity: "info", message: "Paper filler (в настоящее время) — hozir is enough" },
  { id: "ru.katta-etibor", family: "russianism", re: /\bkatta\s+eʼtibor\s+(?:beril(?:di|moqda)|qaratil(?:di|moqda))\b/gi, severity: "warn", message: "RU report calque (уделено большое внимание) — eʼtibor qaratildi / eʼtibor berildi" },
  { id: "ru.belgilab-berildi", family: "russianism", re: /\b(?:belgilab|ochib|koʻrsatib|taʼkidlab)\s+berildi\b/gi, severity: "warn", message: "RU report verb pair — belgilandi / ochildi / koʻrsatildi" },
  { id: "ru.mavjud-bolgan", family: "russianism", re: /\bmavjud\s+boʻlgan\b/gi, severity: "warn", message: "RU participle calque — mavjud alone is enough" },
  { id: "ru.amalga-oshirish-jarayonida", family: "russianism", re: /\bamalga\s+oshirish\s+jarayonida\b/gi, severity: "info", message: "Officialese stack — bajarish jarayonida or just …-da" },
  { id: "ru.ta-sir", family: "russianism", re: /\btaʼsir\s+koʻrsat(?:moq|di)\b/gi, severity: "info", message: "RU pair (оказывать влияние) — taʼsir qilmoq" },
  { id: "ru.faqatgina", family: "russianism", re: /\bfaqatgina\b/gi, severity: "warn", message: "Doubled focus particles — faqat" },
  { id: "ru.albatta-ham", family: "russianism", re: /\balbatta\s+ham\b/gi, severity: "warn", message: "RU конечно же stacking — albatta or ham, not both" },
  { id: "ru.yetarli-darajada", family: "russianism", re: /\byetarli\s+darajada\s+\w+\s+emas\b/gi, severity: "warn", message: "RU calque rhythm — yetarli emas" },
  { id: "ru.kop-sonli", family: "russianism", re: /\bkoʻp\s+sonli\b/gi, severity: "warn", message: "RU многочисленный calque — juda koʻp" },
  { id: "ru.barcha-tomonlama", family: "russianism", re: /\bbarcha\s+tomonlama\b/gi, severity: "warn", message: "RU всесторонний calque — har tomondan" },
  { id: "ru.bizning-tomonimizdan", family: "russianism", re: /\bbizning\s+\w+imizdan\b/gi, severity: "warn", message: "Ghost possessive — biz tomonimizdan / bizni (the -imizdan doubling is a calque)" },
];

/** In-sentence boʻyicha spam (2+ in one sentence) and whole-text density. */
export function lintBoycha(text: string): Finding[] {
  const findings: Finding[] = [];
  for (const s of splitSentences(text)) {
    const n = (s.text.match(/\bboʻyicha\b/gi) ?? []).length;
    if (n >= 2) {
      findings.push({
        rule: "ru.boycha-sentence",
        family: "russianism",
        severity: "warn",
        match: "boʻyicha ×" + n,
        count: 1,
        message: `"boʻyicha" ×${n} in one sentence — RU structural calque (по); restructure or keep one`,
      });
      break;
    }
  }
  const words = text.match(/[\p{L}]+/gu) ?? [];
  const matches = text.match(/\bboʻyicha\b/gi) ?? [];
  if (matches.length >= 3 && words.length >= 30 && (matches.length / words.length) * 100 >= 2.5) {
    findings.push({
      rule: "ru.boycha-density",
      family: "russianism",
      severity: "info",
      match: "boʻyicha",
      count: matches.length,
      message: `"boʻyicha" appears ${matches.length}× — vary with "-da" or restructure`,
    });
  }
  return findings;
}

export function lintRussianism(text: string): Finding[] {
  return [...ruleFindings(text, RUSSIANISM_RULES), ...lintBoycha(text)];
}
