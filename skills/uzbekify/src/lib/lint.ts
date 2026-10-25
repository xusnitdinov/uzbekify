/** Aggregate linter: runs every family and returns findings + naturalness score. */
import { Finding, LintOptions, LintResult } from "./types.js";
import { lintOrtho } from "./linters/ortho.js";
import { lintCalque } from "./linters/calque.js";
import { lintRussianism } from "./linters/russianism.js";
import { lintRegister } from "./linters/register.js";
import { lintSuffix } from "./linters/suffix.js";
import { lintPassive } from "./linters/passive.js";
import { lintLoanwords } from "./linters/loanwords.js";
import { lintCadence } from "./linters/cadence.js";
import { lintLiteralness } from "./linters/literalness.js";
import { lintWordOrder } from "./linters/wordorder.js";
import { lintScreen } from "./linters/screen.js";
import { lintFormat } from "./linters/format.js";
import { lintOfficialese } from "./linters/officialese.js";
import { lintAitell } from "./linters/aitell.js";
import { scoreFindings } from "./score.js";

/** Normalize zero-width joiners/soft hyphens that hide patterns from rules. */
function cleanInvisible(text: string): string {
  return text.replace(/[\u00AD\u200B\u200C\u200D\uFEFF]/g, "");
}

export function lintText(text: string, opts: LintOptions = {}): Finding[] {
  const t = cleanInvisible(text);
  return [
    ...lintOrtho(t),
    ...lintCalque(t),
    ...lintRussianism(t),
    ...lintOfficialese(t, opts),
    ...lintRegister(t, opts),
    ...lintSuffix(t),
    ...lintPassive(t, opts),
    ...lintLoanwords(t, opts),
    ...lintLiteralness(t),
    ...lintWordOrder(t),
    ...lintScreen(t),
    ...lintFormat(t),
    ...lintAitell(t, opts),
    ...lintCadence(t, opts),
  ];
}

export function lintAndScore(text: string, opts: LintOptions = {}): LintResult {
  const findings = lintText(text, opts);
  const { score, band, humanVoiceBonus, humanVoiceSignals } = scoreFindings(text, findings, opts);
  return { findings, score, band, humanVoiceBonus, humanVoiceSignals };
}

export { scoreFindings };
