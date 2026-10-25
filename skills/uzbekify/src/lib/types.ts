/** Finding severity: error = clearly wrong, warn = situational/advisory, info = style note. */
export type Severity = "error" | "warn" | "info";

/** Address/register lanes the register linter can enforce. */
export type RegisterId =
  | "product"
  | "quiz"
  | "assistant"
  | "youth"
  | "marketing"
  | "academic"
  | "news"
  | "legal"
  | "official"
  | "chat";

export interface LintOptions {
  /** Allow sen/-san forms (youth mode, user-voice quotes). Default false. */
  allowSen?: boolean;
  /** Target register preset; controls particle and cadence expectations. Default "product". */
  register?: RegisterId;
  /** Disable advisory families (wordorder, cadence) for short UI strings. */
  uiMode?: boolean;
}

export interface Finding {
  /** Stable rule id, e.g. "suffix.double-case". */
  rule: string;
  /** Linter family, e.g. "suffix", "register", "calque". */
  family: string;
  severity: Severity;
  /** The matched text (first occurrence) for display. */
  match: string;
  /** How many times the rule fired in this text. */
  count: number;
  /** Human-readable explanation with the fix. */
  message: string;
  /** 1-based line of the first occurrence (when a span is known). */
  line?: number;
  /** 1-based column of the first occurrence (when a span is known). */
  column?: number;
}

export interface LintResult {
  findings: Finding[];
  /** Naturalness score 0–100 (higher = more native/human). */
  score: number;
  /** Score band label. */
  band: string;
  /** CORE MISSION: points earned back for human-voice signals. */
  humanVoiceBonus: number;
  humanVoiceSignals: string[];
}
