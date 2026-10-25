/**
 * Naturalness score 0–100 with explanations.
 *
 * Start at 100 and subtract per finding (errors hurt most), with a per-family
 * cap so one noisy family can't zero out a text, plus a loan-density shaping
 * term. Bands: 90+ publish, 75–89 minor polish, 50–74 needs rewrite, <50 rewrite.
 */
import { Finding, LintOptions, Severity } from "./types.js";
import { wordCount, splitSentences } from "./text.js";

const WEIGHT: Record<Severity, number> = { error: 7, warn: 2.5, info: 1 };
const FAMILY_CAP: Record<string, number> = {
  ortho: 30,
  calque: 25,
  russianism: 20,
  register: 22,
  suffix: 25,
  passive: 14,
  loanword: 16,
  cadence: 14,
  literalness: 20,
  wordorder: 12,
  screen: 18,
  format: 14,
  officialese: 22,
  aitell: 30,
};

export interface ScoreResult {
  score: number;
  band: string;
  deductions: { family: string; points: number; findings: number }[];
  humanVoiceBonus: number;
  humanVoiceSignals: string[];
}

/**
 * CORE MISSION: reward text that sounds like a real person. Spoken aspect
 * markers (-yapti), conversb+auxiliary compounds (-ib qo'y-), natural glue in
 * chat registers, and sentence-rhythm variance earn points back (cap +6).
 */
export function humanVoiceSignals(text: string, opts: LintOptions = {}): { bonus: number; signals: string[] } {
  const signals: string[] = [];
  const casual = opts.register === "assistant" || opts.register === "youth" || opts.register === "marketing" || opts.register === "chat";

  if (/\b\w+(?:yapti|yapman|yapsiz|yapsan|yaptular)\b/i.test(text)) signals.push("spoken aspect (-yapti)");
  if (/\b\w+(?:ib|yb)\s+(?:qoʻy|qol|yubor|ber|ol|koʻr|oʻt)\w*/i.test(text)) signals.push("conversb + auxiliary (-ib qoʻy-)");
  if (casual && /\b(?:mana|endi|boʻlsa|axir|mayli|xoʻp|zoʻr|gap yoʻq|yomon emas|judayam)\b/i.test(text)) {
    signals.push("natural spoken glue");
  }
  const sentences = splitSentences(text);
  if (sentences.length >= 5) {
    const lens = sentences.map((s) => s.words.length);
    const mean = lens.reduce((a, b) => a + b, 0) / lens.length;
    const std = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / lens.length);
    if (std >= 3) signals.push("varied sentence rhythm");
  }
  const bonus = Math.min(signals.length * 2, 6);
  return { bonus, signals };
}

export function scoreFindings(text: string, findings: Finding[], opts: LintOptions = {}): ScoreResult {
  const byFamily = new Map<string, Finding[]>();
  for (const f of findings) {
    const list = byFamily.get(f.family) ?? [];
    list.push(f);
    byFamily.set(f.family, list);
  }

  const deductions: ScoreResult["deductions"] = [];
  let total = 0;
  for (const [family, list] of byFamily) {
    let points = 0;
    for (const f of list) points += WEIGHT[f.severity] * Math.min(f.count, 4);
    points = Math.min(points, FAMILY_CAP[family] ?? 16);
    if (points > 0) {
      deductions.push({ family, points: Math.round(points * 10) / 10, findings: list.length });
      total += points;
    }
  }

  // small texts get less slack: a single error dominates a 6-word button
  const words = wordCount(text);
  if (words > 0 && words < 15 && findings.some((f) => f.severity === "error")) {
    total += 4;
  }

  const { bonus, signals } = humanVoiceSignals(text, opts);
  const score = Math.max(0, Math.min(100, Math.round(100 - total + bonus)));
  const band =
    score >= 90 ? "publish" : score >= 75 ? "minor polish" : score >= 50 ? "needs rewrite" : "rewrite from scratch";

  deductions.sort((a, b) => b.points - a.points);
  return { score, band, deductions, humanVoiceBonus: bonus, humanVoiceSignals: signals };
}

/** Human-readable explanation block for the score. */
export function explainScore(result: ScoreResult, findings: Finding[]): string[] {
  const lines: string[] = [];
  lines.push(`Naturalness: ${result.score}/100 (${result.band})`);
  if (result.humanVoiceBonus > 0) {
    lines.push(`Human-voice bonus +${result.humanVoiceBonus}: ${result.humanVoiceSignals.join("; ")}`);
  }
  if (!findings.length) {
    lines.push("No findings — text passes every linter family.");
    return lines;
  }
  for (const d of result.deductions) {
    const fam = findings.filter((f) => f.family === d.family);
    const top = fam
      .slice(0, 2)
      .map((f) => `"${f.match}" (${f.rule})`)
      .join("; ");
    lines.push(`- ${d.family}: −${d.points} (${d.findings} finding${d.findings > 1 ? "s" : ""}) — ${top}`);
  }
  return lines;
}
