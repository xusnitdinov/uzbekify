/**
 * Suffix-chain sanity + vowel harmony family.
 *
 * Uzbek is agglutinative: noun stack is oʻzak + koʻplik + egalik + kelishik.
 * These rules catch the chains an LLM actually produces: case on a finite
 * verb, double case, double dative, possessive+plural stacking, -ler after
 * back vowels, missing possessive agreement, unassimilated dative after q/k,
 * triple genitive chains, verbal-noun plural officialese.
 */
import { Finding } from "../types.js";
import { ruleFindings, Rule } from "./util.js";

const DATIVE_STOP = new Set(["boshqaga", "qisqaga", "bochkaga", "bankaga"]);

/**
 * Verb-derived stems whose +lar is officialese soup (kiritishlariga…).
 * Real nouns (yoʻnalish, oʻzgarish, yigʻilish, munosabat…) take -lar freely.
 */
const VERBAL_NOUN_PLURAL_RE =
  /\b(?:kiritishlar|oʻzgartirishlar|bajarilishlar|taqdim\s+etishlar|amalga\s+oshirishlar|oʻtkazishlar|hisobga\s+olishlar|koʻrib\s+chiqishlar|topshirishlar|taʼminlashlar)\w*\b/gi;

export const SUFFIX_RULES: Rule[] = [
  {
    id: "suf.verb-case",
    family: "suffix",
    re: /\b\w+?(?:dim|dik|ding|dilar)(?:ga|qa|ka|ning|dan|ni|da|lar|larga|larning|lardan|larni|larida|lariga)\b/gi,
    severity: "error",
    message: "Case suffix stacked on a finite verb (berdimga class) — verbs take no case; put dative on the noun (doʻstimga berdim)",
  },
  {
    id: "suf.double-case",
    family: "suffix",
    re: /\b\w+ning(?:ni|ga|da|dan|ning)\b/gi,
    severity: "error",
    message: "Double case after -ning — the genitive chain already marks it: doʻstimning fikri(ga), not fikrininigaga",
  },
  {
    id: "suf.double-dative",
    family: "suffix",
    // -ga-ga, or an assimilated -qa/-ka dative doubled (qishloqqaga,
    // yurakkaga). A lone "qaga/kaga" is just a -qa/-ka vowel stem taking a
    // normal -ga (daqiqaga, boshqaga, qisqaga, bochkaga), so it is not matched.
    re: /\b\w+?(?:gaga|qqaga|kkaga)\b/gi,
    severity: "error",
    message: "Double dative -ga-ga — one dative only (kitobxonlarga, oʻyinga)",
    skipMatch: (m) => DATIVE_STOP.has(m.toLowerCase()),
  },
  {
    id: "suf.possessive-plural",
    family: "suffix",
    re: /\b\w+imizlar?\b/gi,
    severity: "error",
    message: "Possessive+plural stacking — rebuild outward: kitob+lar+imiz → kitoblarimiz",
  },
  {
    id: "suf.plural-double",
    family: "suffix",
    re: /\b\w+larlar?\b/gi,
    severity: "error",
    message: "Plural stacked on plural — one -lar is enough",
  },
  {
    id: "suf.possessive-agreement",
    family: "suffix",
    re: /\b\w+ning\s+(?:fikr|kitob|maktab|uy|ish|gap)(?![iIl1])/gi,
    severity: "warn",
    message: "Missing possessive agreement — doʻstimning fikri / maktabi: the possessed noun agrees with the genitive",
  },
  {
    id: "suf.dative-unassimilated",
    family: "suffix",
    re: /\b\w+[qk]ga\b/gi,
    severity: "warn",
    message: "Dative assimilates after q/k stems: qishloq+ga → qishloqqa, yurak+ga → yurakka, kichik+ga → kichikka",
    skipMatch: (m) => DATIVE_STOP.has(m.toLowerCase()),
  },
  {
    id: "suf.genitive-chain",
    family: "suffix",
    re: /\b(\w+ning)\s+(\w+ning)\s+(\w+ning)\b/gi,
    severity: "warn",
    message: "Triple genitive chain — one -ning per chain; rephrase (kelishuv shartlarining buzilishi)",
  },
  {
    id: "suf.verbal-noun-plural",
    family: "suffix",
    re: VERBAL_NOUN_PLURAL_RE,
    severity: "warn",
    message: "Verbal noun + plural is officialese — kiritishga / kiritilsin (noun plurals like yoʻnalishlar are fine)",
  },
];

/** -ler after a back-vowel stem (kitoblerimiz class). Custom scan for precision. */
export function lintLerHarmony(text: string): Finding | null {
  const tokens = text.match(/[A-Za-zʻʼ]+/g) ?? [];
  const hits: string[] = [];
  for (const tok of tokens) {
    const lower = tok.toLowerCase();
    const idx = lower.indexOf("ler");
    if (idx <= 2) continue; // need a real stem before "ler"
    const stem = lower.slice(0, idx);
    if (stem.length < 3) continue; // galereya-class loans
    const lastVowel = [...stem].reverse().find((c) => "aeiou".includes(c));
    if (lastVowel === "a" || lastVowel === "o" || lastVowel === "u") {
      hits.push(tok);
    }
  }
  if (!hits.length) return null;
  return {
    rule: "suf.ler-back-vowel",
    family: "suffix",
    severity: "error",
    match: hits[0],
    count: hits.length,
    message: "Back-vowel stem with -ler — plural harmony: kitoblarimiz, maktablar (‑ler is nonstandard after a/o/u)",
  };
}

export function lintSuffix(text: string): Finding[] {
  const findings = ruleFindings(text, SUFFIX_RULES);
  const harmony = lintLerHarmony(text);
  if (harmony) findings.push(harmony);
  return findings;
}
