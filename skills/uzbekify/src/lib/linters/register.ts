/**
 * Register family: Siz/sen address lanes, one-surface consistency, particle
 * policy per register preset.
 */
import { Finding, LintOptions, RegisterId } from "../types.js";
import { ruleFindings, Rule } from "./util.js";

/** Nouns/words that end in vowel+san but are NOT sen-verbs. */
const SAN_STOPLIST = new Set([
  "asosan", "qasosan", "josusan", "davosan", "fasosan", "mavqean", "osan",
]);

/** English -ding words that look like sen past -ding. */
const DING_STOPLIST = new Set([
  "loading", "reading", "coding", "heading", "feeding", "seeding", "weeding",
  "proceeding", "exceeding", "according", "pending", "landing", "finding",
  "funding", "sending", "building", "bedding", "bidding", "leading", "needing",
  "breeding", "speeding", "heeding", "seceding", "acceding", "impeding",
  "padding", "banding", "branding", "ending", "lending", "spending",
  "trading", "holding", "wedding", "grading", "standing", "regarding",
  "including", "depending", "surrounding", "outstanding", "understanding",
]);

const isStop = (w: string, set: Set<string>) => set.has(w.toLowerCase());

/**
 * Bare imperatives. Sentence-initial set (safer) plus an anywhere set for
 * forms that are unambiguous even mid-sentence. "Yoz" (summer), "Bor"
 * (exists) and "Och" (hungry) are excluded — they are nouns/adjectives too.
 */
const IMP_SENTENCE_INITIAL = /(?:^|[.!?]\s+|:\s*)(Kel|Qil|Tur|Ber|Kir|Chiq|Yop|Oʻtir|Toʻxta|Soʻra|Qara|Saqla|Bekor qil|Davom et|Harakat qil|Sinab koʻr|Urinib koʻr|Tekshirib koʻr)\b(?![\wʻʼ])/gm;
const IMP_ANYWHERE = /\b(?:Kel\b(?=\s+\w)|Qil\b(?=[.!?:]|$)|Tur\b(?=[.!?:]|$)|Ber\b(?=[.!?:]|$)|Kir\b(?=\s+\w)|Chiq\b(?=[.!?:]|$)|Toʻxta\b|Soʻra\b|Qara\b|Oʻtir\b|Yoz\s+va\b|Bor\s+bosing\b|Sinab koʻr(?!ing)|Urinib koʻr(?!ing)|Tekshirib koʻr(?!ing)|Harakat qil(?!ing))/gm;

export const REGISTER_RULES: Rule[] = [
  {
    id: "reg.sen-present",
    family: "register",
    re: /\b\w*[aeiyoʻ]san(?:mi|ma)?\b/gi,
    severity: "error",
    productOnly: true,
    message: "sen present (-san/-asan) on a product/quiz surface — use Siz: qilasiz / kirasiz (--allow-sen for youth)",
    skipMatch: (m) => isStop(m, SAN_STOPLIST),
  },
  {
    id: "reg.sen-past",
    family: "register",
    re: /\b\w{2,}ding\b/gi,
    severity: "warn",
    productOnly: true,
    message: "sen past (-ding) on a product surface — prefer -dingiz (qildingiz)",
    skipMatch: (m) => isStop(m, DING_STOPLIST),
  },
  {
    id: "reg.bare-imperative",
    family: "register",
    re: IMP_SENTENCE_INITIAL,
    severity: "error",
    productOnly: true,
    message: "Bare sen-imperative on product — Keling / Yozing / Kirish",
  },
  {
    id: "reg.bare-imperative-mid",
    family: "register",
    re: IMP_ANYWHERE,
    severity: "warn",
    productOnly: true,
    message: "Bare sen-imperative on product — Keling / Yozing / Kirish",
  },
  {
    id: "reg.siz-typo",
    family: "register",
    re: /\bSIz\b/g,
    severity: "error",
    message: "Casing typo: SIz → Siz",
  },
  {
    id: "reg.particle-product",
    family: "register",
    re: /\b(?:xoʻp|mayli|xoʻsh|nima gap|tinchmi)\b/gi,
    severity: "info",
    message: "Chat particles on a product surface — keep product copy particle-free (fine in chat registers)",
    skipText: undefined,
  },
  {
    id: "reg.kel-plus-san",
    family: "register",
    re: /\bKeling,?\s+\w+(?:asan|san)\b/gi,
    severity: "error",
    message: "Mixed lane: Keling (Siz) + sen ending on the same sentence — pick one address lane",
  },
];

/** Detect which address lanes a text uses. */
export function detectLanes(text: string): { siz: boolean; sen: boolean } {
  const siz =
    /\b(?:Siz|Sizga|Sizning|sizning|sizga)\b/.test(text) ||
    /\b\w+(?:asiz|ysiz|sizlar|ingiz|inglar|ngiz)\b/i.test(text) ||
    /\b(?:kiring|keling|yozing|belgilang|tanlang|tashlang|bosing|oling|koʻring|tering|saqlang|yuboring|toʻldiring|yangilang|oʻting|oching|yoqing)\b/i.test(text);
  const senText = text.replace(new RegExp([...SAN_STOPLIST].join("|"), "gi"), "");
  const sen =
    /\b(?:sen|senga|seni|sening|senda|sendan)\b/i.test(senText) ||
    /\b\w*[aeiyoʻ]san(?:mi|ma)?\b/i.test(senText) ||
    /(?:^|[.!?]\s+)(?:Kel|Qil|Tur|Ber|Kir|Chiq|Yop|Oʻtir|Toʻxta)\b(?![\wʻʼ])/m.test(senText);
  return { siz, sen };
}

export function lintRegister(text: string, opts: LintOptions = {}): Finding[] {
  const skipParticles = opts.allowSen || opts.register === "youth";
  const rules = skipParticles
    ? REGISTER_RULES.filter((r) => r.id !== "reg.particle-product")
    : REGISTER_RULES;
  const findings = ruleFindings(text, rules, opts);
  const lanes = detectLanes(text);
  if (lanes.siz && lanes.sen && !opts.allowSen) {
    findings.push({
      rule: "reg.mixed-lane",
      family: "register",
      severity: "error",
      match: "Siz + -san",
      count: 1,
      message: "Mixed address lane: Siz forms and sen/-san forms on one surface — pick one lane (Siz for product/quiz)",
    });
  }
  return findings;
}
