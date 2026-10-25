/**
 * Literalness family: translation smell — literal idiom calques, politeness
 * shadows, connector calques, nominalization soup, RU-structure leftovers.
 */
import { Finding } from "../types.js";
import { ruleFindings, Rule } from "./util.js";

export const LITERALNESS_RULES: Rule[] = [
  // politeness shadows
  {
    id: "lit.would-you-mind",
    family: "literalness",
    re: /\bqarshi\s+emasmisiz\b/gi,
    severity: "error",
    message: "Literal EN shadow — Iltimos, …-ib qoʻying",
  },
  {
    id: "lit.rocket-science",
    family: "literalness",
    re: /\braketa\s+ilmi\b/gi,
    severity: "error",
    message: "Literal idiom calque — Bu unchalik murakkab ish emas",
  },
  {
    id: "lit.kick-bucket",
    family: "literalness",
    re: /\bchelakni\s+tepdi\b/gi,
    severity: "error",
    message: "Literal idiom calque — U vafot etdi",
  },
  {
    id: "lit.cats-dogs",
    family: "literalness",
    re: /\b(?:mushuklar?\s+va\s+itlar?|itlar\s+va\s+mushuklar?)\s+(?:yogʻmoqda|yogʻdi)\b/gi,
    severity: "error",
    message: "Literal 'raining cats and dogs' — Qattiq yomgʻir yogʻdi",
  },
  {
    id: "lit.break-leg",
    family: "literalness",
    re: /\boyogʻingni\s+sindir\b/gi,
    severity: "error",
    message: "Literal 'break a leg' — Omad tilayman",
  },
  {
    id: "lit.spill-beans",
    family: "literalness",
    re: /\bloviya\w*\s+toʻk(?:di|dingiz|amiz)?\b/gi,
    severity: "error",
    message: "Literal 'spill the beans' — sirni ochdi / rostini aytdi",
  },
  {
    id: "lit.not-from",
    family: "literalness",
    re: /\bMen\s+Oʻzbekiston\s+emasman\b/gi,
    severity: "error",
    message: "Truncated calque — Men Oʻzbekistondan emasman",
  },
  {
    id: "lit.en-order-shadow",
    family: "literalness",
    re: /\b(?:men|biz)\s+haqiqatan\s+ham\s+bu\b/gi,
    severity: "warn",
    message: "EN word-order shadow — rebuild around menga/bizga yoqadi",
  },
  {
    id: "lit.brochure-opener",
    family: "literalness",
    re: /\bHurmatli\s+foydalanuvchi\b/gi,
    severity: "warn",
    message: "False formality boilerplate — address people like a human (Assalomu alaykum! / by name)",
  },
  // connector calques
  {
    id: "lit.connector-double-cause",
    family: "literalness",
    re: /\bshuning\s+uchun\s+ham\s+shu\s+sababli\b|\bshu\s+sababli\s+ham\s+shuning\s+uchun\b/gi,
    severity: "warn",
    message: "Doubled causal connector — Shuning uchun / Shu sababli, one only",
  },
  {
    id: "lit.connector-other-words",
    family: "literalness",
    re: /\bboshqa\s+soʻzlar\s+bilan\s+aytganda\b|\bboshqacha\s+qilib\s+aytadigan\s+boʻlsak\b/gi,
    severity: "warn",
    message: "Calqued 'in other words' — Yaʼni",
  },
  {
    id: "lit.connector-other-hand",
    family: "literalness",
    re: /\bbir\s+tomondan\b[^.!?]*\bboshqa\s+tomondan\b/gi,
    severity: "warn",
    message: "Calqued 'on the other hand' pair — bir tomondan … ikkinchi tomondan",
  },
  {
    id: "lit.connector-xulosa",
    family: "literalness",
    re: /\byakuniy\s+xulosa\s+qilib\s+aytganda\b/gi,
    severity: "warn",
    message: "Connector stack — Qisqasi",
  },
  {
    id: "lit.connector-natijasida-sifatida",
    family: "literalness",
    re: /\bnatijasida\s+sifatida\b/gi,
    severity: "warn",
    message: "Double RU postposition stack — natijada",
  },
  {
    id: "lit.connector-xuddi-shu",
    family: "literalness",
    re: /\bxuddi\s+shu\s+tarzda\b/gi,
    severity: "info",
    message: "Calqued sameness — Xuddi shunday",
  },
  {
    id: "lit.connector-oxirgi-navbat",
    family: "literalness",
    re: /\boxirgi\s+navbatda\b/gi,
    severity: "info",
    message: "RU sense drift (в последнюю очередь) — oxiri / yakunda",
  },
  // nominalization soup
  {
    id: "lit.nominalization-amalga",
    family: "literalness",
    re: /\b\w+(?:ish|uv)ni\s+amalga\s+oshir(?:ish|ing|moq|di)?\b/gi,
    severity: "warn",
    message: "Nominalization soup — use the verb: bajaring / qiling",
  },
  {
    id: "lit.nominalization-bajar",
    family: "literalness",
    re: /\b\w{2,}(?:ishni|ngni|shni)\s+bajar\w*\b/gi,
    severity: "warn",
    message: "Nominalization soup — use the verb directly (Yuklab oling, not Yuklab olishni bajaring)",
  },
  {
    id: "lit.nominalization-kutish",
    family: "literalness",
    re: /\bkutishni\s+bajaring\b/gi,
    severity: "warn",
    message: "Nominalization soup — Bir oz kuting",
  },
  // legal-lite overclaims
  {
    id: "lit.overclaim",
    family: "literalness",
    re: /\b(?:100%\s+xavfsiz|hech qachon\s+oshkor\s+boʻlmaydi|barcha\s+risklar\s+kafolatlanadi|toʻliq\s+javobgarmiz|hech qanday\s+koʻrik\s+kerak\s+emas|barcha\s+(?:huquqlaridan|daʼvolardan)\s+voz\s+kech\w*)\b/gi,
    severity: "warn",
    message: "Overclaim in legal-lite copy — verify before promising; unverifiable guarantees stay out",
  },
  {
    id: "lit.vague-statute",
    family: "literalness",
    re: /\bqonun\s+bilan\s+(?:kafolatlangan|taqiqlangan|belgilangan)\b/gi,
    severity: "warn",
    message: "Vague statute citation — name the law and clause, or drop the appeal to qonun",
  },
  {
    id: "lit.statute-9xx",
    family: "literalness",
    re: /\b9\d\d-moddas\w*/g,
    severity: "warn",
    message: "9xx article numbers look invented — verify the statute before citing any modda",
  },
  // duplicated phrases
  {
    id: "lit.duplicate-phrase",
    family: "literalness",
    re: /\b(birinchi\s+navbatda)\b[^.!?]*\b\1\b/gi,
    severity: "warn",
    message: "Duplicated connector phrase — say it once",
  },
];

export function lintLiteralness(text: string): Finding[] {
  return ruleFindings(text, LITERALNESS_RULES);
}
