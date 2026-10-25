/** Shared rule engine for all linter families. */
import type { Finding, LintOptions, Severity } from "../types.js";
import { stripEnglishContractions } from "../text.js";

export interface Rule {
  id: string;
  family: string;
  re: RegExp;
  severity: Severity;
  message: string;
  /** Whole-text guard: skip rule entirely when true. */
  skipText?: (text: string) => boolean;
  /** Per-match guard: return true to ignore this match. Receives the full match text. */
  skipMatch?: (match: string, text: string) => boolean;
  /** Skipped when sen forms are allowed (youth / user-voice). */
  productOnly?: boolean;
  /** Only fires when the text has at least this many words (density rules). */
  minWords?: number;
  /** Skip entirely in formal registers (aitell chat-robotic class). */
  skipInFormal?: boolean;
  /** Fire only in the chat register (aitell). */
  chatOnly?: boolean;
}

function lineColAt(text: string, index: number): { line: number; column: number } {
  const before = text.slice(0, index);
  const line = (before.match(/\n/g) ?? []).length + 1;
  const column = index - (before.lastIndexOf("\n") + 1) + 1;
  return { line, column };
}

export function ruleFindings(text: string, rules: Rule[], opts: LintOptions = {}): Finding[] {
  const findings: Finding[] = [];
  for (const rule of rules) {
    if (rule.productOnly && opts.allowSen) continue;
    if (rule.skipText?.(text)) continue;
    const rx = new RegExp(rule.re.source, rule.re.flags.includes("g") ? rule.re.flags : rule.re.flags + "g");
    let m: RegExpExecArray | null;
    let count = 0;
    let first = "";
    let span: { line: number; column: number } | undefined;
    while ((m = rx.exec(text)) !== null) {
      if (m[0].length === 0) {
        rx.lastIndex++;
        continue;
      }
      if (rule.skipMatch?.(m[0], text)) continue;
      if (!first) {
        first = m[0];
        span = lineColAt(text, m.index);
      }
      count++;
    }
    if (count > 0) {
      findings.push({
        rule: rule.id,
        family: rule.family,
        severity: rule.severity,
        match: first,
        count,
        message: rule.message,
        ...(span ? { line: span.line, column: span.column } : {}),
      });
    }
  }
  return findings;
}

/** English words that end like Uzbek suffixes but are pure English. */
const EN_GERUND_STOP = new Set([
  "morning", "evening", "loading", "building", "something", "nothing", "anything",
  "wedding", "offering", "shipping", "warning", "according", "during",
  "turning", "earning", "learning", "burning", "boarding", "farming", "timing",
  "amazing", "coming", "doing", "going", "being", "seeing", "using", "making",
  "taking", "getting", "working", "running", "walking", "talking", "trying",
  "asking", "telling", "feeling", "finding", "keeping", "letting", "putting",
  "saying", "thinking", "bring", "thing", "things", "everything",
]);

const UZ_MORPH_ENDINGS = [
  "lar", "larni", "larda", "lardan", "larga", "larning", "ga", "ka", "qa", "da",
  "dan", "ni", "ning", "moq", "moqda", "gan", "gani", "di", "dim", "dik", "ding",
  "diq", "man", "san", "miz", "siz", "sin", "ngiz", "ingiz", "asiz", "ysiz", "ng",
];

const UZ_IMPERATIVE = new Set([
  "kiriting", "yozing", "belgilang", "tanlang", "bosing", "oling", "koʻring",
  "tering", "saqlang", "yuboring", "toʻldiring", "yangilang", "oʻting", "oching",
  "yoqing", "kuting", "boshlang", "tashlang", "chiqing", "tugating", "belgilang",
]);

const UZ_FUNCTION =
  /\b(?:va|lekin|ham|uchun|bilan|edi|emas|bor|yoʻq|keyin|endi|mana|mayli|iltimos|kerak|yoki|agar|chunki|hamma|yana|juda|baribir|xolos|gina|men|menga|meni|biz|bizga|bizni|bu|shu)\b/i;
const UZ_CONTENT =
  /\b(?:ilova|dastur|telefon|raqam|parol|kod|matn|rasm|tugma|fayl|xabar|toʻlov|buyurtma|chegirma|balans|profil|sozlama|savol|javob|foydalanuvchi|mijoz|jarima|sana|qonun|shartnoma|hujjat|modda|sud)\b/i;
const UZ_MARK = /[\u02BB\u02BC\u0400-\u04FF]/;

/** Count Uzbek signals on the line containing `around`. */
function uzbekSignalCount(line: string): number {
  let n = 0;
  for (const w of line.match(/[\p{L}\p{N}]+/gu) ?? []) {
    const lower = w.toLowerCase();
    if (!/[a-z]/i.test(lower)) {
      n += 2; // Cyrillic or marked word counts double
      continue;
    }
    if (EN_GERUND_STOP.has(lower)) continue;
    if (UZ_MORPH_ENDINGS.some((e) => lower.length > e.length && lower.endsWith(e))) n++;
  }
  for (const w of line.match(/[A-Za-zʻʼ]+/g) ?? []) {
    if (UZ_IMPERATIVE.has(w.toLowerCase())) n++;
  }
  if (UZ_FUNCTION.test(line)) n++;
  if (UZ_CONTENT.test(line)) n++;
  if (UZ_MARK.test(line)) n += 2;
  return n;
}

export function lineAround(text: string, around: string): string {
  const idx = text.toLowerCase().indexOf(around.toLowerCase());
  if (idx < 0) return text;
  const lineStart = Math.max(0, text.lastIndexOf("\n", idx));
  const nl = text.indexOf("\n", idx);
  const lineEnd = nl === -1 ? text.length : nl;
  return text.slice(lineStart, lineEnd);
}

/**
 * Guard: does the line contain enough Uzbek to apply an English-word rule?
 * Fires on ≥2 signals (morphology double-counts), or one strong mark.
 */
export function hasUzbekContext(text: string, around: string, min = 2): boolean {
  return uzbekSignalCount(lineAround(text, around)) >= min;
}

/** Looser guard for unambiguous English UI boilerplate phrases. */
export function hasAnyUzbek(text: string, around: string): boolean {
  return uzbekSignalCount(lineAround(text, around)) >= 1;
}

/** English words that must never be touched when checking apostrophes. */
export { stripEnglishContractions };
