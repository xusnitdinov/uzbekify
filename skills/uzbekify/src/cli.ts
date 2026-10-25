#!/usr/bin/env node
/**
 * uzpro — single CLI for uzbek-humanizer-pro.
 *
 * Subcommands:
 *   uzpro lint      <file|->        lint Uzbek text (all families) [--json] [--allow-sen]
 *                                   [--register product|quiz|youth|academic|news|legal|assistant|marketing]
 *                                   [--matn-only] [--whole-file] [--min N]
 *   uzpro normalize <file|->        fix apostrophes/reform letters [--write] [--check]
 *   uzpro translit  <file|->        Cyrillic→Latin (default) or --to cyrillic
 *   uzpro score     <file|->        naturalness 0–100 with explanations [--json] [--min N]
 *   uzpro diff      <a> <b>         word-level before/after diff
 *
 * Exit codes: 0 = clean/pass, 1 = findings/fail, 2 = usage error.
 */
import fs from "node:fs";
import path from "node:path";
import { lintAndScore, lintText } from "./lib/lint.js";
import { normalize, lintReport } from "./lib/normalize.js";
import { translit } from "./lib/translit.js";
import { extractUzbekForLint, extractMatn } from "./lib/extract.js";
import { scoreFindings, explainScore } from "./lib/score.js";
import { diffWords, renderDiff, diffStats } from "./lib/diff.js";
import { toSarif } from "./lib/sarif.js";
import { lintLocaleFile } from "./lib/i18n.js";
import { runInit, type AgentId } from "./lib/init.js";
import { applyFixes, humanize as humanizeText, toChecklist } from "./lib/fix.js";
import type { Finding, RegisterId } from "./lib/types.js";

const PROG = "uzpro";

const VALID_REGISTERS = ["product","quiz","assistant","youth","marketing","academic","news","legal","official","chat"];
const I18N_EXTS = [".json", ".yaml", ".yml", ".po"];

const USAGE = `Usage:
  ${PROG} init [--all] [--dry-run] [--force] [--no-mcp] [--agent ID]
              auto-detect Claude Code / Cursor / Codex / Windsurf / Gemini / Copilot
              and install the skill + rules + MCP config (idempotent)
  ${PROG} lint <file|dir|-> [--format text|json|sarif] [--fix] [--allow-sen]
                        [--register R] [--matn-only] [--whole-file] [--min N] [--i18n]
  ${PROG} humanize <file|-> [--write] [--json] [--register R]
              apply all deterministic fixes, print a diff, and return the remaining
              issues as an ordered checklist
  ${PROG} normalize <file|-> [--write] [--check]
  ${PROG} translit <file|-> [--to latin|cyrillic] [--write]
  ${PROG} score <file|-> [--json] [--min N] [--register R]
  ${PROG} diff <fileA> <fileB>
  ${PROG} --version

Exit codes: 0 = clean/pass · 1 = findings/fail · 2 = usage error`;

function usage(): never {
  console.error(USAGE);
  process.exit(2);
}

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length];
}

function unknownCommand(cmd: string): never {
  const known = ["init", "lint", "humanize", "normalize", "translit", "score", "diff"];
  const withDistance = known.map((k) => ({ k, d: levenshtein(cmd, k) })).sort((a, b) => a.d - b.d);
  const close = withDistance[0].d <= 2 ? withDistance[0].k : undefined;
  console.error(`Unknown command: ${cmd}`);
  console.error(close ? `Did you mean "${close}"?` : `Valid commands: ${known.join(", ")}`);
  usage();
}

interface LintTarget {
  file: string;
  text: string;
}

function lintTargets(file: string): LintTarget[] {
  if (file === "-") {
    return [{ file: "stdin", text: fs.readFileSync(0, "utf8") }];
  }
  if (!fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    process.exit(2);
  }
  const stat = fs.statSync(file);
  if (!stat.isDirectory()) return [{ file, text: fs.readFileSync(file, "utf8") }];
  const out: LintTarget[] = [];
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (e.name.startsWith(".") || e.name === "node_modules" || e.name === "dist") continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.po$/i.test(e.name)) continue; // PO files only make sense with --i18n
      else if (/\.(md|txt|json|jsonl|ya?ml)$/i.test(e.name)) out.push({ file: p, text: fs.readFileSync(p, "utf8") });
    }
  };
  walk(file);
  return out;
}

/** Extract the lintable text for one target (extraction-aware), then lint it. */
function lintOne(
  t: LintTarget,
  flags: Set<string>,
  register: RegisterId,
  allowSen: boolean
): { text: string; findings: Finding[] } {
  let text = t.text;
  if (flags.has("--matn-only")) {
    text = extractMatn(text);
  } else if (!flags.has("--whole-file")) {
    const { text: uz, skipped } = extractUzbekForLint(t.text, {
      filePath: t.file === "stdin" ? "" : path.resolve(t.file),
    });
    if (skipped === "en-locale-path") return { text: "", findings: [] };
    // keep the whole input when extraction finds nothing Uzbek-shaped
    text = uz.trim() ? uz : t.text;
  }
  return { text, findings: lintText(text, { allowSen, register }) };
}

function readInput(file: string): { text: string; label: string } {
  if (file === "-") {
    if (process.stdin.isTTY) {
      console.error("No piped input on stdin.");
      process.exit(2);
    }
    return { text: fs.readFileSync(0, "utf8"), label: "stdin" };
  }
  if (!fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    process.exit(2);
  }
  const stat = fs.statSync(file);
  if (stat.isDirectory()) {
    // lint a directory of .txt/.md/.json files
    const files = fs
      .readdirSync(file)
      .filter((f) => /\.(txt|md|json|jsonl)$/i.test(f))
      .map((f) => path.join(file, f));
    return { text: files.map((f) => fs.readFileSync(f, "utf8")).join("\n"), label: file };
  }
  return { text: fs.readFileSync(file, "utf8"), label: file };
}

const VERSION = "3.0.0";

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (!cmd || cmd === "--version" || cmd === "-v") {
    if (cmd) {
      console.log(`uzbekify ${VERSION} (bin: uzpro / uzbekify / uzpro-mcp)`);
      process.exit(0);
    }
    usage();
  }

  let file = "";
  let fileB = "";
  const flags = new Set<string>();
  let flagValue: Record<string, string> = {};
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === "--to" || a === "--register" || a === "--min" || a === "--format") {
      flagValue[a.slice(2)] = rest[++i];
      if (!flagValue[a.slice(2)]) usage();
    } else if (a.startsWith("--")) {
      flags.add(a);
    } else if (!file) {
      file = a;
    } else if (!fileB) {
      fileB = a;
    } else usage();
  }
  if (flags.has("--help") || flags.has("-h")) usage();

  const register = (flagValue["register"] ?? "product") as RegisterId;
  if (flagValue["register"] && !VALID_REGISTERS.includes(flagValue["register"])) {
    console.error(`Unknown register "${flagValue["register"]}". Valid: ${VALID_REGISTERS.join(", ")}`);
    process.exit(2);
  }
  const allowSen = flags.has("--allow-sen") || register === "youth";

  if (cmd === "lint") {
    if (!file) usage();
    const format = (flagValue["format"] ?? (flags.has("--json") ? "json" : "text")).toLowerCase();
    if (!["text", "json", "sarif"].includes(format)) usage();
    const min = Number(flagValue["min"] ?? 0);

    // ---- i18n mode: locale files key by key ----
    if (flags.has("--i18n")) {
      const targets = lintTargets(file).filter((t) => I18N_EXTS.includes(path.extname(t.file).toLowerCase()));
      if (!targets.length) {
        console.error(`No locale files (.json/.yaml/.yml/.po) found in: ${file}`);
        process.exit(2);
      }
      const reports = await Promise.all(targets.map((t) => lintLocaleFile(t.file, { allowSen, register })));
      const allFindings = reports.flatMap((r) => r.keys.flatMap((k) => k.findings));
      if (format === "sarif") {
        console.log(
          JSON.stringify(
            toSarif(
              reports.flatMap((r) =>
                r.keys.map((k) => ({ file: r.file, findings: k.findings.map((f) => ({ ...f, line: k.line ?? f.line })), keyPath: k.key }))
              )
            ),
            null,
            2
          )
        );
      } else if (format === "json") {
        console.log(JSON.stringify({ reports, totalFindings: allFindings.length }, null, 2));
      } else {
        for (const r of reports) {
          if (!r.keys.length) {
            console.log(`Clean: ${r.file} (${r.totalKeys} keys)`);
            continue;
          }
          console.error(`${r.file} [${r.locale}] — ${r.keys.length} key(s) with findings:`);
          for (const k of r.keys) {
            console.error(`  ${k.key}: ${JSON.stringify(k.value.slice(0, 60))}`);
            for (const f of k.findings) {
              console.error(`    - [${f.severity}] ${f.rule}: "${f.match}" → ${f.message}`);
            }
          }
        }
      }
      process.exit(allFindings.length > 0 ? 1 : 0);
    }

    // ---- --fix: apply safe auto-fixes to a single target, print diff ----
    if (flags.has("--fix")) {
      const targets = lintTargets(file);
      if (targets.length !== 1) {
        console.error("--fix works on a single file or stdin (got " + targets.length + " targets)");
        process.exit(2);
      }
      const t = targets[0];
      const fix = applyFixes(t.text, { allowSen, register });
      const fixed = fix.text;
      const applied = fix.applied;
      const diff = diffWords(t.text, fixed);
      const rendered = renderDiff(diff);
      if (t.file !== "stdin") fs.writeFileSync(t.file, fixed, "utf8");
      else process.stdout.write(fixed);
      console.error(`Fixes applied (${applied.length}):`);
      for (const a of applied) console.error(`  - ${a}`);
      if (fixed !== t.text) console.error(`\nDiff:\n${rendered}`);
      const after = lintText(fixed, { allowSen, register });
      if (after.length) {
        console.error(`\nRemaining issues (${after.length}) — fix order:`);
        for (const item of toChecklist(after)) {
          console.error(`  ${item.order}. [${item.severity}] ${item.location} ${item.rule}: "${item.match}" → ${item.message}`);
        }
        process.exit(1);
      }
      console.error("Clean after fixes.");
      process.exit(0);
    }

    // ---- normal / batch mode ----
    const targets = lintTargets(file);
    if (!targets.length) {
      console.error(`No lintable files (.md/.txt/.json/.jsonl/.yaml/.yml/.po) found in: ${file}`);
      process.exit(2);
    }
    const perFile = targets.map((t) => {
      const { text, findings } = lintOne(t, flags, register, allowSen);
      const { score, band, humanVoiceBonus, humanVoiceSignals } = lintAndScore(text, { allowSen, register });
      return { file: t.file, text, findings, score, band, humanVoiceBonus, humanVoiceSignals };
    });

    if (format === "sarif") {
      console.log(JSON.stringify(toSarif(perFile), null, 2));
      process.exit(perFile.some((x) => x.findings.length > 0) ? 1 : 0);
    }

    if (format === "json") {
      const shape = perFile.map(({ text, ...rest }) => ({ ...rest, textLength: text.length }));
      // single target keeps the classic object shape; batches return an array
      console.log(JSON.stringify(shape.length === 1 ? shape[0] : shape, null, 2));
      process.exit(perFile.some((x) => x.findings.length > 0) ? 1 : 0);
    }

    let anyFindings = false;
    let worstScore = 100;
    for (const x of perFile) {
      if (!x.findings.length) {
        console.log(`Clean (${x.score}/100): ${x.file}`);
        continue;
      }
      anyFindings = true;
      worstScore = Math.min(worstScore, x.score);
      console.error(`Findings (${x.findings.length}) — score ${x.score}/100 (${x.band}) — ${x.file}`);
      for (const f of x.findings) {
        const loc = f.line ? `:${f.line}:${f.column ?? 1}` : "";
        console.error(`- [${f.severity}] ${f.rule}${loc} ×${f.count}: "${f.match}" → ${f.message}`);
      }
    }
    process.exit(anyFindings || (min > 0 && worstScore < min) ? 1 : 0);
  }

  if (cmd === "humanize") {
    if (!file) usage();
    const { text } = readInput(file);
    const h = humanizeText(text, { allowSen, register });
    if (flags.has("--json")) {
      console.log(JSON.stringify({ applied: h.applied, added: h.added, removed: h.removed, scoreBefore: h.scoreBefore, scoreAfter: h.scoreAfter, remaining: h.remaining, fixed: h.fixed }, null, 2));
    } else {
      if (flags.has("--write") && file !== "-") fs.writeFileSync(file, h.fixed, "utf8");
      else process.stdout.write(h.fixed.endsWith("\n") ? h.fixed : h.fixed + "\n");
      console.error(`Humanize: ${h.scoreBefore}/100 → ${h.scoreAfter}/100`);
      console.error(`Fixes applied (${h.applied.length}):`);
      for (const a of h.applied) console.error(`  - ${a}`);
      if (h.added + h.removed > 0) console.error(`\nDiff:\n${h.diff}`);
      if (h.remaining.length) {
        console.error(`\nRemaining checklist (${h.remaining.length}) — do these in order:`);
        for (const item of h.remaining) {
          console.error(`  ${item.order}. step ${item.step} [${item.severity}] ${item.location} ${item.rule}: "${item.match}" → ${item.message}`);
        }
        process.exit(1);
      }
      console.error("\nNothing left for the agent — text is clean.");
    }
    process.exit(h.remaining.length > 0 ? 1 : 0);
  }

  if (cmd === "init") {
    const allAgents: AgentId[] = ["claude-code", "cursor", "codex", "windsurf", "gemini", "copilot"];
    const agentFlag = flagValue["agent"];
    let targets: AgentId[] | undefined;
    if (agentFlag) {
      if (!allAgents.includes(agentFlag as AgentId)) {
        console.error(`Unknown agent "${agentFlag}". Valid: ${allAgents.join(", ")}`);
        process.exit(2);
      }
      targets = [agentFlag as AgentId];
    }
    const os = await import("node:os");
    const home = process.env.UZBEKIFY_HOME || os.homedir();
    const dryRun = flags.has("--dry-run");
    const { detected, targets: used, actions } = runInit(
      { home, cwd: process.cwd(), force: flags.has("--force"), dryRun, withMcp: !flags.has("--no-mcp"), targets },
      flags.has("--all")
    );
    console.log(`uzbekify init ${dryRun ? "(dry run) " : ""}— detected: ${detected.length ? detected.join(", ") : "none"} → installing for: ${used.join(", ")}`);
    for (const a of actions) {
      const mark = a.kind === "skip" ? "=" : "+";
      console.log(`  ${mark} [${a.agent}] ${a.detail} → ${a.path}`);
    }
    if (dryRun) console.log("Dry run: nothing written.");
    else console.log("Done. Idempotent: rerun anytime. MCP server: uzpro-mcp (stdio).");
    process.exit(0);
  }

  if (cmd === "normalize") {
    if (!file) usage();
    const { text, label } = readInput(file);
    const next = normalize(text);
    if (flags.has("--check")) {
      if (next !== text) {
        console.error(`Would normalize: ${label}`);
        process.exit(1);
      }
      const issues = lintReport(next);
      if (issues.length) {
        for (const i of issues) console.error(`- ${i.issue}: ${i.samples.join(", ")}`);
        process.exit(1);
      }
      console.log(`Check ok: ${label}`);
      process.exit(0);
    }
    if (flags.has("--write")) {
      if (file === "-") {
        console.error("--write needs a file path, not stdin");
        process.exit(2);
      }
      fs.writeFileSync(file, next, "utf8");
      const issues = lintReport(next);
      if (issues.length) {
        console.error(`Normalized ${file} with remaining issues:`);
        for (const i of issues) console.error(`- ${i.issue}: ${i.samples.join(", ")}`);
        process.exit(1);
      }
      console.log(`Normalized ${file}`);
      process.exit(0);
    }
    process.stdout.write(next);
    process.exit(0);
  }

  if (cmd === "translit") {
    if (!file) usage();
    const to = (flagValue["to"] ?? "latin") as "latin" | "cyrillic";
    if (to !== "latin" && to !== "cyrillic") usage();
    const { text } = readInput(file);
    const next = translit(to === "latin" ? normalize(text) : text, to);
    if (flags.has("--write")) {
      if (file === "-") {
        console.error("--write needs a file path, not stdin");
        process.exit(2);
      }
      fs.writeFileSync(file, next, "utf8");
      console.log(`Transliterated ${file} → ${to}`);
      process.exit(0);
    }
    process.stdout.write(next);
    process.exit(0);
  }

  if (cmd === "score") {
    if (!file) usage();
    const { text: raw, label } = readInput(file);
    let text = raw;
    if (flags.has("--matn-only")) text = extractMatn(text);
    else if (!flags.has("--whole-file")) {
      const { text: uz } = extractUzbekForLint(raw, { filePath: path.resolve(file === "-" ? "" : file) });
      text = uz;
    }
    const { findings, score, band } = lintAndScore(text, { allowSen, register });
    const result = scoreFindings(text, findings);
    if (flags.has("--json")) {
      console.log(JSON.stringify({ label, score, band, deductions: result.deductions, findings }, null, 2));
    } else {
      for (const line of explainScore(result, findings)) console.log(line);
    }
    const min = Number(flagValue["min"] ?? 0);
    process.exit(min > 0 && score < min ? 1 : 0);
  }

  if (!["init", "lint", "humanize", "normalize", "translit", "score", "diff"].includes(cmd)) {
    unknownCommand(cmd);
  }

  if (cmd === "diff") {
    if (!file || !fileB) usage();
    const a = readInput(file).text;
    const b = readInput(fileB).text;
    const ops = diffWords(a, b);
    console.log(renderDiff(ops));
    const s = diffStats(ops);
    console.error(`${s.same} unchanged, ${s.added} added, ${s.removed} removed`);
    process.exit(0);
  }

  usage();
}

main();
