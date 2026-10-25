/**
 * Deterministic auto-fixes (safe, no meaning changes) + the humanize
 * pipeline: fix everything machines can fix, return the rest as an ordered
 * checklist for the agent.
 */
import { normalize } from "./normalize.js";
import { translit } from "./translit.js";
import { lintText, lintAndScore } from "./lint.js";
import { diffWords, renderDiff, diffStats } from "./diff.js";
import type { Finding, LintOptions } from "./types.js";

export interface FixSummary {
  applied: string[];
  diff: string;
  added: number;
  removed: number;
}

/** Safe, deterministic fixes. Order matters. */
export function applyFixes(text: string, opts: LintOptions = {}): { text: string; applied: string[] } {
  const applied: string[] = [];
  let out = text;

  // 1) strip zero-width characters that hide patterns
  if (/[\u00AD\u200B\u200C\u200D\uFEFF]/.test(out)) {
    out = out.replace(/[\u00AD\u200B\u200C\u200D\uFEFF]/g, "");
    applied.push("stripped zero-width/soft-hyphen characters");
  }

  // 2) Cyrillic input → Latin (only when the text is predominantly Cyrillic)
  const words = out.match(/[\p{L}]+/gu) ?? [];
  const cyr = words.filter((w) => /[\u0400-\u04FF]/.test(w)).length;
  if (words.length > 0 && cyr / words.length > 0.5) {
    out = translit(normalize(out), "latin");
    applied.push("transliterated Cyrillic → Latin");
  } else {
    // 3) normalize apostrophes / inbound reform letters
    const next = normalize(out);
    if (next !== out) {
      out = next;
      applied.push("normalized oʻ/gʻ (U+02BB) and tutuq (U+02BC) marks");
    }
  }

  // 4) dashes → commas (global no-dash policy, SKILL.md hard rule 2).
  //    Line-safe: never joins lines. Numeric ranges become 10-15 (the
  //    formatting.md range style); hyphenated words, phone numbers and
  //    markdown "- " bullets are left alone.
  const DASH_PRESENT = /[—–]|(?<=[^\s\d|]) - (?=[^\s|])|(?<=\d) - (?=[^\s\d|])|(?<=\S) -- (?=\S)/;
  if (DASH_PRESENT.test(out)) {
    out = out
      // numeric range with an en/em dash: 10–15 → 10-15
      .replace(/(?<=\d)[ \t]*[—–][ \t]*(?=\d)/g, "-")
      // line-leading dialogue/list dash: "— Salom" → "Salom"
      .replace(/^([ \t]*)[—–][ \t]*/gm, "$1")
      // sentence-leading dash after a terminator: "Keldim. — Qani?" / ". - "
      .replace(/([.!?…])[ \t]*(?:[—–]|-{1,2}(?=[ \t]))[ \t]*/g, "$1 ")
      // trailing dash at end of line: "Natija —" → "Natija"
      .replace(/[ \t]*[—–][ \t]*$/gm, "")
      // mid-line em/en dash and spaced / double hyphen between words → comma
      .replace(/[ \t]*[—–][ \t]*/g, ", ")
      .replace(/(?<=\S) -- (?=\S)/g, ", ")
      .replace(/(?<=[^\s\d|]) - (?=[^\s|])|(?<=\d) - (?=[^\s\d|])/g, ", ")
      // tidy punctuation the swap can leave behind
      .replace(/([,:;])[ \t]*,[ \t]*/g, "$1 ")
      .replace(/,[ \t]*([.!?…])/g, "$1");
    applied.push("replaced em/en/spaced-hyphen dashes with commas");
  }

  // 5) collapse repeated whitespace
  if (/[ \t]{2,}/.test(out)) {
    out = out.replace(/[ \t]{2,}/g, " ");
    applied.push("collapsed repeated spaces");
  }

  return { text: out, applied };
}

export interface ChecklistItem {
  order: number;
  step: number;
  ladder: string;
  severity: "error" | "warn" | "info";
  rule: string;
  location: string;
  match: string;
  message: string;
}

const LADDER: Record<string, { step: number; ladder: string }> = {
  register: { step: 1, ladder: "register: one address lane" },
  screen: { step: 2, ladder: "script consistency" },
  ortho: { step: 2, ladder: "script and apostrophes" },
  calque: { step: 3, ladder: "calques (EN structure)" },
  russianism: { step: 3, ladder: "calques (RU structure)" },
  officialese: { step: 3, ladder: "officialese (gov patterns)" },
  literalness: { step: 3, ladder: "translationese" },
  aitell: { step: 3, ladder: "AI tells (dashes, tics)" },
  wordorder: { step: 4, ladder: "SOV word order" },
  suffix: { step: 5, ladder: "suffix chains and harmony" },
  loanword: { step: 6, ladder: "native synonyms" },
  passive: { step: 7, ladder: "active voice" },
  cadence: { step: 7, ladder: "rhythm" },
  format: { step: 8, ladder: "formatting" },
};

const SEVERITY_ORDER: Record<Finding["severity"], number> = { error: 0, warn: 1, info: 2 };

/** Remaining findings as an ordered checklist (ladder order, errors first). */
export function toChecklist(findings: Finding[]): ChecklistItem[] {
  return [...findings]
    .sort((a, b) => {
      const la = LADDER[a.family]?.step ?? 8;
      const lb = LADDER[b.family]?.step ?? 8;
      if (la !== lb) return la - lb;
      if (SEVERITY_ORDER[a.severity] !== SEVERITY_ORDER[b.severity]) {
        return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      }
      return (a.line ?? 0) - (b.line ?? 0);
    })
    .map((f, i) => ({
      order: i + 1,
      step: LADDER[f.family]?.step ?? 8,
      ladder: LADDER[f.family]?.ladder ?? "final self-check",
      severity: f.severity,
      rule: f.rule,
      location: f.line ? `${f.line}:${f.column ?? 1}` : "-",
      match: f.match,
      message: f.message,
    }));
}

export interface HumanizeResult {
  fixed: string;
  applied: string[];
  diff: string;
  added: number;
  removed: number;
  remaining: ChecklistItem[];
  scoreBefore: number;
  scoreAfter: number;
}

export function humanize(text: string, opts: LintOptions = {}): HumanizeResult {
  const scoreBefore = lintAndScore(text, opts).score;
  const { text: fixed, applied } = applyFixes(text, opts);
  const after = lintAndScore(fixed, opts);
  const ops = diffWords(text, fixed);
  const stats = diffStats(ops);
  const core = {
    fixed,
    applied,
    diff: renderDiff(ops),
    added: stats.added,
    removed: stats.removed,
    remaining: toChecklist(after.findings),
  };
  return { ...core, scoreBefore, scoreAfter: after.score };
}
