/**
 * Passive family: passive-voice overuse, double agent marking (tomonidan +
 * passive), officialese report-verb stacks, nominalization chains.
 */
import { Finding, LintOptions } from "../types.js";
import { splitSentences } from "../text.js";

/** Document/news registers where the state-report passive is standard style. */
const FORMAL_PASSIVE_OK = new Set(["news", "legal", "academic", "official", "quiz"]);

/** Words that look passive but are plain active verbs or nouns. */
const PASSIVE_STOPLIST = new Set([
  "qildi", "bildi", "tildi", "sildi", "qindi", "oldi", "qoldi", "boldi",
  "boʻldi", "soldi", "toldi", "kuldi", "qilgan", "bilgan", "tilgan", "silgan",
  "olding", "oldingiz", "qildingiz", "bildingiz", "aylandi", "toʻldi",
  "childi", "qattildi", "yigʻildi?",
]);

const PASSIVE_WORD_RE = /\b\w+(?:ildi|indi|ilgan|ingan|iladi|ilmoqda|inadi|lanadi|landi|lanmoqda|langan)\b/gi;

/** Attested officialese report verbs (always passive-shaped). */
const REPORT_VERBS =
  /\b(?:amalga\s+oshirildi|taʼminlandi|tashkil\s+etildi|eʼlon\s+qilindi|qabul\s+qilindi|tasdiqlandi|imzolandi|koʻrib\s+chiqildi|taqdim\s+etildi|oʻrnatildi|yoʻq\s+qilindi|hisobga\s+olindi|tahlil\s+qilindi|aniqlandi|bajarildi|belgilandi|oʻtkazildi)\b/gi;

export function lintPassive(text: string, opts: LintOptions = {}): Finding[] {
  const findings: Finding[] = [];
  if (FORMAL_PASSIVE_OK.has(opts.register ?? "product")) return findings;

  const tokens = text.match(PASSIVE_WORD_RE) ?? [];
  const passives = tokens.filter((t) => !PASSIVE_STOPLIST.has(t.toLowerCase()));
  const report = text.match(REPORT_VERBS) ?? [];
  // union by token: "belgilandi" is both generic -landi and a REPORT_VERB; count once
  const total = new Set([...passives.map((t) => t.toLowerCase()), ...report.map((t) => t.toLowerCase())]).size;
  const sentences = splitSentences(text);

  // double agent marking: "X tomonidan yuborildi" → X yubordi
  PASSIVE_WORD_RE.lastIndex = 0;
  REPORT_VERBS.lastIndex = 0;
  for (const s of sentences) {
    if (!/\btomonidan\b/i.test(s.text)) continue;
    const clean = s.text.replace(PASSIVE_WORD_RE, (m) =>
      PASSIVE_STOPLIST.has(m.toLowerCase()) ? "x" : m
    );
    const passiveHere = /\w+(?:ildi|indi|ilgan|ingan|iladi|ilmoqda|inadi|lanadi|landi|lanmoqda|langan)\b/i.test(clean) || REPORT_VERBS.test(s.text);
    if (passiveHere) {
      findings.push({
        rule: "passive.tomonidan-double",
        family: "passive",
        severity: "error",
        match: s.text.slice(0, 60),
        count: 1,
        message: "Double agent marking: tomonidan marks the agent, so the verb must be active — 'Menejer yubordi', not 'Menejer tomonidan yuborildi'",
      });
      break;
    }
  }
  PASSIVE_WORD_RE.lastIndex = 0;
  REPORT_VERBS.lastIndex = 0;

  // overuse: 3+ passives anywhere (worse in one sentence)
  if (total >= 3) {
    findings.push({
      rule: "passive.overuse",
      family: "passive",
      severity: "warn",
      match: passives[0] ?? report[0] ?? "passive",
      count: total,
      // (count is the deduplicated union of passive verbs and report verbs)
      message: `Passive voice ×${total} — flip the main clauses to active (kim qilgani aytilsin)`,
    });
  }

  // officialese density
  if (report.length >= 2) {
    findings.push({
      rule: "passive.report-stack",
      family: "passive",
      severity: "info",
      match: report[0] ?? "",
      count: report.length,
      message: "Report-verb stack (amalga oshirildi / taʼminlandi …) — plain active verbs read native",
    });
  }

  // nominalization chains: olinishi … toʻplanishi … saqlanishi + passive
  for (const s of sentences) {
    const nominals = s.text.match(/\b\w{4,}ishi\b/gi) ?? [];
    if (nominals.length >= 3 && /\w+(?:ldi|lanadi|tiladi|ladi|linadi)\b/i.test(s.text)) {
      findings.push({
        rule: "passive.noun-chain",
        family: "passive",
        severity: "warn",
        match: nominals.slice(0, 2).join(", "),
        count: nominals.length,
        message: "Nominalization chain (-ishi ×3 + passive) — officialese; say who does what",
      });
      break;
    }
  }

  return findings;
}
