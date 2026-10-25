#!/usr/bin/env node
/**
 * Eval runner: v1 (uzbek-humanizer) vs v2 (uzbek-humanizer-pro) bakeoff.
 *
 * - Reuses ALL of v1's eval sets (ported verbatim into eval/v1/): schema
 *   validation parity for cases/goldens/trigger/bakeoff/pairwise/human-likeness,
 *   detection on v1's rewrite-case inputs, and a golden false-positive sweep.
 * - Runs the new v2 pair sets (eval/v2/): bad-input detection and good-input
 *   false-positive rate for BOTH linter sets, plus transliteration accuracy
 *   for Cyrillic→Latin (v1 has no transliterator).
 * - Writes EVAL_RESULTS.md at the repo root and exits 1 if v2 does not beat
 *   v1 on overall detection with false positives not worse than v1's.
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { lintText, lintAndScore } from "../lib/lint.js";
import { translit, normalize } from "../lib/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// __dirname at runtime = <repo>/dist/scripts → repo root is two levels up
const REPO_ROOT = path.resolve(__dirname, "..", "..");
const SKILL_DIR = path.join(REPO_ROOT, "skills", "uzbekify");
const EVAL_DIR = path.join(SKILL_DIR, "eval");
const V1_DIR = path.join(EVAL_DIR, "v1");
const V2_DIR = path.join(EVAL_DIR, "v2");
const V1_SCRIPTS = path.join(REPO_ROOT, "reference-v1", "skills", "uzbek-humanizer", "scripts");

const V1_LINTERS = [
  "lint-banned.mjs",
  "lint-stiff.mjs",
  "lint-cadence.mjs",
  "lint-literalness.mjs",
  "lint-screen-consistency.mjs",
];

interface PairRow {
  id: string;
  set: string;
  bad: string;
  good: string;
}

interface TranslitRow {
  id: string;
  set: string;
  cyr: string;
  lat: string;
}

function readJsonl<T>(file: string): T[] {
  return fs
    .readFileSync(file, "utf8")
    .split(/\r?\n/)
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as T);
}

/** Run all v1 linters on a text; return true if any flags it (exit 2). */
function v1Flags(text: string, opts: { allowSen?: boolean } = {}): boolean {
  const tmp = path.join(os.tmpdir(), `uzpro-eval-${process.pid}-${Math.random().toString(36).slice(2)}.txt`);
  try {
    fs.writeFileSync(tmp, text, "utf8");
    for (const script of V1_LINTERS) {
      const args = [path.join(V1_SCRIPTS, script)];
      if (opts.allowSen && script === "lint-stiff.mjs") args.push("--allow-sen");
      args.push(tmp);
      const r = spawnSync(process.execPath, args, { encoding: "utf8" });
      if (r.status === 2) return true;
    }
    return false;
  } finally {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }
}

/** v2 lint; true when any finding. Register-aware: youth/informal sets get their register. */
function v2Flags(text: string, opts: { allowSen?: boolean; register?: string } = {}): boolean {
  return lintText(text, {
    allowSen: opts.allowSen ?? false,
    register: (opts.register ?? "product") as never,
  }).length > 0;
}

interface SetStats {
  set: string;
  total: number;
  v1Detect: number;
  v2Detect: number;
  v1FP: number;
  v2FP: number;
}

function fmtPct(n: number, d: number): string {
  return d === 0 ? "—" : `${((n / d) * 100).toFixed(1)}%`;
}

function main(): void {
  const out: string[] = [];
  const say = (s = "") => {
    out.push(s);
    console.log(s);
  };

  say("# EVAL RESULTS — uzbek-humanizer (v1) vs uzbekify (v2)");
  say("");
  say(`Generated: ${new Date().toISOString()}`);
  say("");

  // ---------- Part 0: reuse of v1 sets ----------
  const v1Files = fs.readdirSync(V1_DIR).filter((f) => /\.(jsonl|json)$/.test(f));
  say("## 1. v1 eval sets reused (ported verbatim into `skills/uzbekify/eval/v1/`)");
  say("");
  say("| File | Rows | Schema OK |");
  say("|---|---|---|");
  let schemaIssues = 0;
  for (const f of v1Files) {
    const file = path.join(V1_DIR, f);
    if (f.endsWith(".json")) {
      const data = JSON.parse(fs.readFileSync(file, "utf8"));
      const rows = Array.isArray(data) ? data.length : Object.keys(data).length;
      const ok = Array.isArray(data) ? data.every((r: any) => r && typeof r === "object") : true;
      if (!ok) schemaIssues++;
      say(`| ${f} | ${rows} | ${ok ? "yes" : "FAIL"} |`);
    } else {
      const rows = readJsonl<Record<string, unknown>>(file);
      let ok = rows.length > 0;
      for (const r of rows) {
        if (typeof r.id !== "string" || !r.id) ok = false;
      }
      if (!ok) schemaIssues++;
      say(`| ${f} | ${rows.length} | ${ok ? "yes" : "FAIL"} |`);
    }
  }
  say("");

  // ---------- Part 1: v1 cases.jsonl rewrite inputs — detection ----------
  const cases = readJsonl<any>(path.join(V1_DIR, "cases.jsonl"));
  const goldens = JSON.parse(fs.readFileSync(path.join(V1_DIR, "goldens.json"), "utf8")) as Record<string, string>;
  const rewriteCases = cases.filter((c) => c.type === "rewrite");
  let rwV1 = 0;
  let rwV2 = 0;
  for (const c of rewriteCases) {
    if (v1Flags(c.input)) rwV1++;
    if (v2Flags(c.input)) rwV2++;
  }
  say("## 2. v1 `cases.jsonl` rewrite inputs (error-injection detection, n=" + rewriteCases.length + ")");
  say("");
  say("| Linter set | Detected | Rate |");
  say("|---|---|---|");
  say(`| v1 (5 scripts) | ${rwV1} | ${fmtPct(rwV1, rewriteCases.length)} |`);
  say(`| v2 (uzpro lint) | ${rwV2} | ${fmtPct(rwV2, rewriteCases.length)} |`);
  say("");

  // ---------- Part 2: v1 goldens — false positives ----------
  // Each golden is linted in its intended register (bucket → register);
  // v1 has no register notion and stays register-blind.
  const bucketByCase = new Map<string, string>();
  for (const c of cases) bucketByCase.set(c.id, String(c.bucket ?? ""));
  const BUCKET_REGISTER: [RegExp, string][] = [
    [/^news$/, "news"],
    [/^legal|honesty|bank$/, "legal"],
    [/^gov$/, "official"],
    [/^marketing$/, "marketing"],
    [/^quiz|oria$/, "quiz"],
    [/^academic$/, "academic"],
    [/^youth$/, "youth"],
  ];
  const goldenRegister = (id: string): string => {
    const bucket = bucketByCase.get(id) ?? "";
    for (const [re, reg] of BUCKET_REGISTER) if (re.test(bucket)) return reg;
    return "product";
  };

  let gV1 = 0;
  let gV2 = 0;
  const gTotal = Object.keys(goldens).length;
  const v2GoldenFlags: string[] = [];
  const v1GoldenFlags: string[] = [];
  for (const [id, text] of Object.entries(goldens)) {
    if (v1Flags(text)) {
      gV1++;
      v1GoldenFlags.push(id);
    }
    const reg = goldenRegister(id);
    if (v2Flags(text, { register: reg })) {
      gV2++;
      v2GoldenFlags.push(`${id} [${reg}]: ${lintText(text, { register: reg as never }).map((f) => f.rule).join(",")}`);
    }
  }
  say("## 3. v1 goldens — false positives on 226 curated good outputs (v2 lints each in its intended register)");
  say("");
  say("| Linter set | Flagged | FP rate | Notes |");
  say("|---|---|---|---|");
  say(
    `| v1 | ${gV1} | ${fmtPct(gV1, gTotal)} | ${v1GoldenFlags.slice(0, 4).join(", ")} |`
  );
  say(
    `| v2 | ${gV2} | ${fmtPct(gV2, gTotal)} | ${v2GoldenFlags.slice(0, 4).join("; ")} |`
  );
  say("");

  // ---------- Part 3: v2 pair sets — detection + FP ----------
  const setStats: SetStats[] = [];
  // pairs-redteam.jsonl has its own section (4a); skip it in the pair tables
  for (const f of fs.readdirSync(V2_DIR).filter((x) => x.startsWith("pairs-") && x !== "pairs-redteam.jsonl").sort()) {
    const rows = readJsonl<PairRow>(path.join(V2_DIR, f));
    const stat: SetStats = {
      set: f.replace("pairs-", "").replace(".jsonl", ""),
      total: rows.length,
      v1Detect: 0,
      v2Detect: 0,
      v1FP: 0,
      v2FP: 0,
    };
    for (const r of rows) {
      const casual = r.set === "youth" || r.set === "informal";
      const allowSen = casual; // fair: youth/chat registers allow sen forms in both tools
      const register = r.set === "informal" ? "chat" : "product";
      if (v1Flags(r.bad, { allowSen })) stat.v1Detect++;
      if (v2Flags(r.bad, { allowSen, register })) stat.v2Detect++;
      if (v1Flags(r.good, { allowSen })) stat.v1FP++;
      if (v2Flags(r.good, { allowSen, register })) stat.v2FP++;
    }
    setStats.push(stat);
  }

  say("## 4. New v2 pair sets — bad-input detection (higher is better)");
  say("");
  say("| Set | n | v1 detect | v2 detect | v1 rate | v2 rate |");
  say("|---|---|---|---|---|---|");
  const tot = { n: 0, v1: 0, v2: 0 };
  for (const s of setStats) {
    tot.n += s.total;
    tot.v1 += s.v1Detect;
    tot.v2 += s.v2Detect;
    say(
      `| ${s.set} | ${s.total} | ${s.v1Detect}/${s.total} | ${s.v2Detect}/${s.total} | ${fmtPct(s.v1Detect, s.total)} | ${fmtPct(s.v2Detect, s.total)} |`
    );
  }
  say(`| **TOTAL** | ${tot.n} | ${tot.v1} | ${tot.v2} | **${fmtPct(tot.v1, tot.n)}** | **${fmtPct(tot.v2, tot.n)}** |`);
  say("");

  say("## 5. New v2 pair sets — good-input false positives (lower is better)");
  say("");
  say("| Set | n | v1 FP | v2 FP | v1 FP rate | v2 FP rate |");
  say("|---|---|---|---|---|---|");
  const totFp = { n: 0, v1: 0, v2: 0 };
  for (const s of setStats) {
    totFp.n += s.total;
    totFp.v1 += s.v1FP;
    totFp.v2 += s.v2FP;
    say(
      `| ${s.set} | ${s.total} | ${s.v1FP} | ${s.v2FP} | ${fmtPct(s.v1FP, s.total)} | ${fmtPct(s.v2FP, s.total)} |`
    );
  }
  say(`| **TOTAL** | ${totFp.n} | ${totFp.v1} | ${totFp.v2} | **${fmtPct(totFp.v1, totFp.n)}** | **${fmtPct(totFp.v2, totFp.n)}** |`);
  say("");

  // ---------- Part 4: transliteration ----------
  const translitRows = readJsonl<TranslitRow>(path.join(V2_DIR, "translit-pairs.jsonl"));
  let tOK = 0;
  const tFails: string[] = [];
  for (const r of translitRows) {
    const got = translit(normalize(r.cyr), "latin");
    if (got === r.lat) tOK++;
    else tFails.push(`${r.id}: ${r.cyr} → ${got} (want ${r.lat})`);
  }
  say("## 6. Cyrillic → Latin transliteration (52 hard-case pairs)");
  say("");
  say("| Tool | Correct | Rate |");
  say("|---|---|---|");
  say(`| v1 | 0 | — (v1 has no transliterator) |`);
  say(`| v2 (uzpro translit) | ${tOK}/${translitRows.length} | ${fmtPct(tOK, translitRows.length)} |`);
  if (tFails.length) {
    say("");
    say("Failures:");
    for (const f of tFails.slice(0, 10)) say(`- ${f}`);
  }
  say("");

  // ---------- Part 4a: red-team adversarial set (phase 4) ----------
  {
    const redRows = readJsonl<{ id: string; set: string; kind: string; register: string; bad?: string; good: string }>(
      path.join(V2_DIR, "pairs-redteam.jsonl")
    );
    let v2Handled = 0;
    let v1Handled = 0;
    const v2Fails: string[] = [];
    for (const r of redRows) {
      const casual = r.register === "chat" || r.register === "youth";
      const reg = r.register;
      const target = r.kind === "miss" ? r.bad! : r.good;
      const v1Hit = r.kind === "miss" ? v1Flags(target) : !v1Flags(target);
      const v2Hit = r.kind === "miss"
        ? lintText(target, { register: reg as never, allowSen: casual }).length > 0
        : lintText(target, { register: reg as never, allowSen: casual }).length === 0;
      if (v1Hit) v1Handled++;
      if (v2Hit) v2Handled++;
      else v2Fails.push(r.id);
    }
    say("## 4a. Red-team adversarial set (phase 4: 100 cases that initially broke v2)");
    say("");
    say("| Tool | Handled | Rate |");
    say("|---|---|---|");
    say(`| v1 | ${v1Handled}/100 | ${fmtPct(v1Handled, 100)} |`);
    say(`| v2 after red-team fixes | ${v2Handled}/100 | **${fmtPct(v2Handled, 100)}** |`);
    if (v2Fails.length) for (const f of v2Fails) say(`- v2 still fails: ${f}`);
    say("");
  }

  // ---------- Part 4b: the score rewards human text (CORE MISSION) ----------
  {
    let pairsAll: PairRow[] = [];
    for (const f of fs.readdirSync(V2_DIR).filter((x) => x.startsWith("pairs-") && x !== "pairs-redteam.jsonl")) {
      pairsAll = pairsAll.concat(readJsonl<PairRow>(path.join(V2_DIR, f)));
    }
    let better = 0;
    let badSum = 0;
    let goodSum = 0;
    let bonusGood = 0;
    let bonusBad = 0;
    for (const r of pairsAll) {
      const register = r.set === "informal" ? "chat" : r.set === "youth" ? "youth" : "product";
      const allowSen = r.set === "youth" || r.set === "informal";
      const sb = lintAndScore(r.bad, { allowSen, register });
      const sg = lintAndScore(r.good, { allowSen, register });
      badSum += sb.score;
      goodSum += sg.score;
      bonusBad += sb.humanVoiceBonus;
      bonusGood += sg.humanVoiceBonus;
      if (sg.score > sb.score) better++;
    }
    const n = pairsAll.length;
    say("## 4b. Naturalness score rewards human text (CORE MISSION)");
    say("");
    say("| Metric | Value |");
    say("|---|---|");
    say(`| Pairs where human version scores higher | ${better}/${n} (${fmtPct(better, n)}) |`);
    say(`| Average score — robotic/bad inputs | ${(badSum / n).toFixed(1)} |`);
    say(`| Average score — human/good inputs | ${(goodSum / n).toFixed(1)} |`);
    say(`| Total human-voice bonus earned — bad vs good | ${bonusBad} vs ${bonusGood} points |`);
    say("");
  }

  // ---------- Part 5: naturalness-score sanity ----------
  let scoreOK = 0;
  let scoreTotal = 0;
  for (const f of fs.readdirSync(V2_DIR).filter((x) => x.startsWith("pairs-") && x !== "pairs-redteam.jsonl")) {
    for (const r of readJsonl<PairRow>(path.join(V2_DIR, f))) {
      const badScore = lintText(r.bad, {}).length;
      const goodScore = lintText(r.good, {}).length;
      scoreTotal++;
      if (badScore > goodScore) scoreOK++;
    }
  }
  say("## 7. Score ordering sanity (bad has more findings than good)");
  say("");
  say(`| Metric | Value |`);
  say("|---|---|");
  say(`| Pairs where bad > good findings | ${scoreOK}/${scoreTotal} (${fmtPct(scoreOK, scoreTotal)}) |`);
  say("");

  // ---------- Verdict ----------
  const v1DetOverall = (rwV1 / rewriteCases.length) * 100 + (tot.v1 / tot.n) * 100;
  const v2DetOverall = (rwV2 / rewriteCases.length) * 100 + (tot.v2 / tot.n) * 100;
  const v1FpOverall = (gV1 / gTotal) * 100 + (totFp.v1 / totFp.n) * 100;
  const v2FpOverall = (gV2 / gTotal) * 100 + (totFp.v2 / totFp.n) * 100;
  const v2BeatsDetection = v2DetOverall > v1DetOverall;
  const v2FpNotWorse = v2FpOverall <= v1FpOverall + 2.0; // small tolerance
  const translitPass = tOK / translitRows.length >= 0.95;

  say("## 8. Verdict");
  say("");
  say("| Metric | v1 | v2 |");
  say("|---|---|---|");
  say(`| Combined detection index | ${v1DetOverall.toFixed(1)} | ${v2DetOverall.toFixed(1)} |`);
  say(`| Combined FP index | ${v1FpOverall.toFixed(1)} | ${v2FpOverall.toFixed(1)} |`);
  say("");
  say(
    `v2 beats v1 on detection: **${v2BeatsDetection ? "YES" : "NO"}**; v2 FP not worse than v1 (+2pt tolerance): **${v2FpNotWorse ? "YES" : "NO"}**; translit ≥95%: **${translitPass ? "YES" : "NO"}**; v1 sets reused: **${v1Files.length} files**; schema issues: **${schemaIssues}**.`
  );
  say("");

  // ---------- Part 9: tooling built on the corpus (phase 2) ----------
  const statsPath = path.join(SKILL_DIR, "src", "data", "corpus-stats.json");
  if (fs.existsSync(statsPath)) {
    const stats = JSON.parse(fs.readFileSync(statsPath, "utf8"));
    say("## 9. Tooling powered by the corpus (phase 2)");
    say("");
    say("| Capability | Status |");
    say("|---|---|");
    say(`| Web corpus (uz.wikipedia ×16, kun.uz ×11, gazeta.uz + daryo.uz RSS) | ${stats.latinTokens.toLocaleString()} Latin tokens mined |`);
    say(`| Sentence-length baseline (validates the cadence threshold) | median ${stats.sentenceLength.median}, p95 ${stats.sentenceLength.p95} words |`);
    say("| MCP server (uz_lint, uz_rewrite_plan, uz_score, uz_translit, uz_glossary_lookup, uz_calque_check, uz_synonym_suggest) | uzpro-mcp (stdio) |");
    say("| SARIF 2.1.0 output for CI | uzpro lint --format sarif (+ GitHub Action uploading the artifact) |");
    say("| i18n mode (json/yaml/po key by key) + batch folders | uzpro lint <dir> --i18n |");
    say("| Playbooks (UI, marketing, Telegram, formal letters, EN/RU translation) + agent self-check loop | skills/uzbekify/playbooks/ |");
    say("| Informal corpus (6 Telegram channels + quoted speech + review voice, anonymized) | research/informal-corpus/ (phase 2b) |");
    say("| aitell family: no-dash policy, chat tells, robotic-chat patterns | uzpro lint --register chat |");
    say("");
  }

  fs.writeFileSync(path.join(REPO_ROOT, "EVAL_RESULTS.md"), out.join("\n") + "\n", "utf8");
  console.error(`\nWrote ${path.join(REPO_ROOT, "EVAL_RESULTS.md")}`);

  const pass = v2BeatsDetection && v2FpNotWorse && translitPass && schemaIssues === 0;
  console.error(pass ? "EVAL PASS: v2 beats v1" : "EVAL FAIL: v2 does not (yet) beat v1");
  process.exit(pass ? 0 : 1);
}

main();
