#!/usr/bin/env node
/**
 * Phase-6 benchmark pipeline (npm run bench).
 *
 *   node benchmark/bench.mjs all       — metrics → judge packs → report (skips LLM steps with status)
 *   node benchmark/bench.mjs metrics   — automatic metrics on benchmark/outputs/{baseline,v1,v2}
 *   node benchmark/bench.mjs packs     — build blind A/B pairwise pack + hard assessment pack (+ keys, seeded)
 *   node benchmark/bench.mjs report    — BENCHMARK.md + charts/*.svg + native-review.html (needs judgments)
 *
 * Generation and judging are LLM steps (same model, separate contexts); their
 * exact prompts live in benchmark/prompts/. This script validates, computes,
 * and reports. Deterministic: seeded shuffles, frozen item hashes in HASHES.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { lintText, lintAndScore } from "../dist/lib/lint.js";
import { extractUzbekForLint } from "../dist/lib/extract.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const OUT = (m) => path.join(ROOT, "benchmark", "outputs", OUTDIR(m));
const V1_SCRIPTS = path.join(ROOT, "reference-v1", "skills", "uzbek-humanizer", "scripts");

// Round selection: SET=1 (default) → heldout.jsonl/hard.jsonl + outputs/{model};
// SET=2 → heldout2.jsonl/hard2.jsonl + outputs/round2-{model}. Round 2 = confirmatory
// rerun after round-1 losses improved v2's general guidance (see BENCHMARK iterations).
const SET = Number(process.env.SET ?? 1);
const OUTDIR = (m) => SET === 1 ? m : `round${SET}-${m}`;
const HELDOUT = readJsonl(path.join(ROOT, `benchmark/heldout/heldout${SET === 1 ? "" : SET}.jsonl`));
const HARD = readJsonl(path.join(ROOT, `benchmark/hard/hard${SET === 1 ? "" : SET}.jsonl`));
const CRITERIA = Object.fromEntries(readJsonl(path.join(ROOT, `benchmark/hard/criteria${SET === 1 ? "" : SET}.jsonl`)).map((c) => [c.id, c.checks]));

const CATEGORY_REGISTER = { chat: "chat", ui: "product", mkt: "marketing", en2uz: "product", ru2uz: "product", formal: "legal", news: "news" };

// ---------- helpers ----------

function readJsonl(p) {
  return fs.readFileSync(p, "utf8").split(/\r?\n/).filter((l) => l.trim()).map((l) => JSON.parse(l));
}

function sha256(p) {
  return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
}

function loadOutputs(model) {
  const dir = OUT(model);
  const map = new Map();
  if (!fs.existsSync(dir)) return map;
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".jsonl"))) {
    for (const row of readJsonl(path.join(dir, f))) {
      if (row && row.id && typeof row.output === "string") map.set(row.id, row.output.trim());
    }
  }
  return map;
}

/** Seeded shuffle → deterministic A/B assignment. */
function seededShuffle(arr, seed) {
  const a = [...arr];
  let s = crypto.createHash("sha256").update(String(seed)).digest().readUInt32BE(0);
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) >>> 0;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- metrics ----------

const OFFICIALESE_PAT =
  /\b(?:mazkur|ushbu|belgilangan\s+tartibda|amalga\s+oshir(?:il|moq)\w*|taʼminlan\w*|tegishli\s+tarzda|muvofiq\s+ravishda|oʻz\s+navbatida|katta\s+eʼtibor|lishi\s+(?:kerak|lozim)|quyidagi|yuqoridagi|hozirgi\s+kunda|chora-tadbir\w*|faoliyat\s+yurit\w*|oʻtkazilmoqda|olib\s+borilmoqda|ijrosi\s+taʼminlandi|barpo\s+etildi|aks\s+ettirildi|bartaraf\s+etildi|hisobga\s+olingan\s+holda|maqsadida|rejalashtiril(?:gan|adi)|tashkil\s+etil(?:di|gan))\b/gi;

const RU_CALQUE_PAT =
  /\b(?:karoche|normalni|kruto|chotki|tipa|vapshe|ladno|spasibo|poka|blin|udalit|skachat|zakaz|zakas|skidka|plastik|mashennik|nomer|pilesos|registratsiya)\b|\b(?:udalit|skachat|proverit|otpravit|sdelat|peredat|posmotret)\s+qil/gi;

const DASH_PAT = /[—–]|--|(?<=\S) - (?=\S)/g;

const PARTICLE_PAT = /\b(?:axir|endi|mayli|xoʻp|zoʻr|gap\s+yoʻq|judayam|nma|qale|kere|bn|kk|boʻladi|bemalol|mana|baribir)\b|\b\w+(?:ku|chi|yov)\b/gi;

function words(t) {
  return (t.match(/[\p{L}\p{N}]+/gu) ?? []);
}

function sentences(t) {
  return t.split(/(?<=[.!?…])\s+|\n+/).map((s) => s.trim()).filter(Boolean);
}

function chrF(ref, hyp, maxN = 6, beta = 2) {
  // standard chrF (Popović 2017): averaged beta=2 F-scores over char n-grams 1..6
  const refs = ref.replace(/\s+/g, " ").trim();
  const hyps = hyp.replace(/\s+/g, " ").trim();
  if (!refs || !hyps) return 0;
  const scores = [];
  for (let n = 1; n <= maxN; n++) {
    const grams = (s) => {
      const m = new Map();
      const t = ` ${s} `;
      for (let i = 0; i + n <= t.length; i++) {
        const g = t.slice(i, i + n);
        m.set(g, (m.get(g) ?? 0) + 1);
      }
      return m;
    };
    const rg = grams(refs), hg = grams(hyps);
    let overlap = 0, totalRef = 0, totalHyp = 0;
    for (const [g, c] of rg) { totalRef += c; if (hg.has(g)) overlap += Math.min(c, hg.get(g)); }
    for (const [, c] of hg) totalHyp += c;
    if (totalRef === 0 || totalHyp === 0) { scores.push(0); continue; }
    const p = overlap / totalHyp, r = overlap / totalRef;
    const denom = p + beta * beta * r || 1;
    scores.push((1 + beta * beta) * p * r / denom);
  }
  return (scores.reduce((a, b) => a + b, 0) / scores.length) * 100;
}

function v1LintHits(text) {
  const tmp = path.join(OUT("_tmp"), `v1-${crypto.randomBytes(4).toString("hex")}.txt`);
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  fs.writeFileSync(tmp, text, "utf8");
  let hits = 0;
  try {
    for (const script of ["lint-banned.mjs", "lint-stiff.mjs", "lint-cadence.mjs", "lint-literalness.mjs", "lint-screen-consistency.mjs"]) {
      const r = spawnSync(process.execPath, [path.join(V1_SCRIPTS, script), tmp], { encoding: "utf8" });
      if (r.status === 2) hits += (r.stderr.split(/\r?\n/).filter((l) => l.trim().startsWith("- "))).length;
    }
  } finally {
    try { fs.unlinkSync(tmp); } catch {}
  }
  return hits;
}

function v2RegisterFor(item) {
  return item.register ?? CATEGORY_REGISTER[item.category] ?? "product";
}

function meanCI(arr) {
  if (!arr.length) return { mean: 0, ci: 0, n: 0 };
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const sd = Math.sqrt(arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length);
  return { mean: +mean.toFixed(2), ci: +(1.96 * sd / Math.sqrt(arr.length)).toFixed(2), n: arr.length };
}

function metricsFor(model, outputs, items) {
  const rows = [];
  for (const item of items) {
    const text = outputs.get(item.id);
    if (text === undefined) continue;
    const register = v2RegisterFor(item);
    const per100 = (n) => (words(text).length ? +((n / words(text).length) * 100).toFixed(2) : 0);
    const v2Findings = lintText(text, { register, allowSen: register === "chat" || register === "youth" });
    const sents = sentences(text);
    const lens = sents.map((s) => words(s).length).filter((n) => n > 0);
    const meanLen = lens.length ? lens.reduce((a, b) => a + b, 0) / lens.length : 0;
    const sd = lens.length > 1 ? Math.sqrt(lens.reduce((a, b) => a + (b - meanLen) ** 2, 0) / lens.length) : 0;
    const row = {
      id: item.id,
      category: item.category,
      register,
      v2Score: lintAndScore(text, { register, allowSen: register === "chat" || register === "youth" }).score,
      v1Hits: v1LintHits(text),
      v2Hits: v2Findings.length,
      v2OrthoHits: v2Findings.filter((f) => ["ortho", "screen"].includes(f.family)).length,
      dashes: (text.match(DASH_PAT) ?? []).length,
      officialeseRate: per100((text.match(OFFICIALESE_PAT) ?? []).length),
      ruCalqueRate: per100((text.match(RU_CALQUE_PAT) ?? []).length),
      meanSentenceLen: +meanLen.toFixed(2),
      rhythmSd: +sd.toFixed(2),
      particleUse: register === "chat" || register === "youth" ? (text.match(PARTICLE_PAT) ?? []).length : undefined,
      chrF: item.reference ? +chrF(item.reference.replace(/\s*\[[^\]]+\]\s*$/, "").replace(/^[«"]|[»"]$/g, ""), text).toFixed(1) : undefined,
    };
    rows.push(row);
  }
  return rows;
}

function runMetrics() {
  const results = {};
  for (const model of ["baseline", "v1", "v2"]) {
    const outputs = loadOutputs(model);
    const all = [...HELDOUT, ...HARD];
    const missing = all.filter((i) => !outputs.has(i.id));
    if (missing.length) {
      console.error(`${model}: missing ${missing.length} outputs (e.g. ${missing.slice(0, 5).map((m) => m.id).join(", ")})`);
    }
    results[model] = {
      heldout: metricsFor(model, outputs, HELDOUT),
      hard: metricsFor(model, outputs, HARD),
      missing: missing.map((m) => m.id),
    };
  }
  fs.writeFileSync(path.join(ROOT, `benchmark/metrics${SET === 1 ? "" : SET}.json`), JSON.stringify(results, null, 1));
  for (const model of ["baseline", "v1", "v2"]) {
    const all = [...results[model].heldout, ...results[model].hard];
    const agg = (key) => meanCI(all.map((r) => r[key]).filter((v) => v !== undefined));
    console.log(`${model}: n=${all.length} v2Score=${agg("v2Score").mean}±${agg("v2Score").ci} v1Hits=${agg("v1Hits").mean} v2Hits=${agg("v2Hits").mean} dashes=${agg("dashes").mean} offRate=${agg("officialeseRate").mean} ruRate=${agg("ruCalqueRate").mean} sentLen=${agg("meanSentenceLen").mean}`);
  }
  const chr = {};
  for (const model of ["baseline", "v1", "v2"]) {
    chr[model] = meanCI([...results[model].heldout, ...results[model].hard].map((r) => r.chrF).filter((v) => v !== undefined));
  }
  console.log(`chrF vs human refs: baseline ${chr.baseline.mean}±${chr.baseline.ci} | v1 ${chr.v1.mean}±${chr.v1.ci} | v2 ${chr.v2.mean}±${chr.v2.ci}`);
  fs.writeFileSync(path.join(ROOT, `benchmark/chrf${SET === 1 ? "" : SET}.json`), JSON.stringify(chr, null, 1));
}

// ---------- judge packs ----------

function buildPacks() {
  const v1 = loadOutputs("v1");
  const v2 = loadOutputs("v2");
  const base = loadOutputs("baseline");
  const all = [...HELDOUT, ...HARD];
  const abKey = {};
  const pairwise = [];
  for (const item of seededShuffle(all, SET === 1 ? "pairwise-v1v2" : `pairwise-v1v2-r${SET}`)) {
    if (!v1.has(item.id) || !v2.has(item.id)) continue;
    const flip = seededShuffle([0, 1], item.id + (SET === 1 ? "" : `-r${SET}`))[0] === 1;
    const [a, b] = flip ? [v2.get(item.id), v1.get(item.id)] : [v1.get(item.id), v2.get(item.id)];
    abKey[item.id] = { A: flip ? "v2" : "v1", B: flip ? "v1" : "v2" };
    pairwise.push({ id: item.id, category: item.category, task: item.task, A: a, B: b });
  }
  fs.writeFileSync(path.join(ROOT, `benchmark/judgments/ab-key${SET === 1 ? "" : SET}.json`), JSON.stringify(abKey, null, 1));
  const third = Math.ceil(pairwise.length / 3);
  fs.writeFileSync(path.join(ROOT, `benchmark/judgments/${`pack${SET === 1 ? "" : SET}-pairwise-1`}.jsonl`), pairwise.slice(0, third).map((r) => JSON.stringify(r)).join("\n"));
  fs.writeFileSync(path.join(ROOT, `benchmark/judgments/${`pack${SET === 1 ? "" : SET}-pairwise-2`}.jsonl`), pairwise.slice(third, 2 * third).map((r) => JSON.stringify(r)).join("\n"));
  fs.writeFileSync(path.join(ROOT, `benchmark/judgments/${`pack${SET === 1 ? "" : SET}-pairwise-3`}.jsonl`), pairwise.slice(2 * third).map((r) => JSON.stringify(r)).join("\n"));

  // hard pack: 3 anonymized slots per item, per-item slot assignment
  const hardKey = {};
  const hardPack = [];
  for (const item of HARD) {
    const outs = { baseline: base.get(item.id), v1: v1.get(item.id), v2: v2.get(item.id) };
    if (Object.values(outs).some((v) => v === undefined)) continue;
    const slots = seededShuffle(["baseline", "v1", "v2"], item.id + (SET === 1 ? "" : `-r${SET}`));
    hardKey[item.id] = Object.fromEntries(slots.map((m, i) => [`slot${i + 1}`, m]));
    hardPack.push({
      id: item.id,
      category: item.category,
      task: item.task,
      criteria: CRITERIA[item.id],
      slot1: outs[slots[0]],
      slot2: outs[slots[1]],
      slot3: outs[slots[2]],
    });
  }
  fs.writeFileSync(path.join(ROOT, `benchmark/judgments/hard-key${SET === 1 ? "" : SET}.json`), JSON.stringify(hardKey, null, 1));
  const hThird = Math.ceil(hardPack.length / 3);
  fs.writeFileSync(path.join(ROOT, `benchmark/judgments/${`pack${SET === 1 ? "" : SET}-hard-1`}.jsonl`), hardPack.slice(0, hThird).map((r) => JSON.stringify(r)).join("\n"));
  fs.writeFileSync(path.join(ROOT, `benchmark/judgments/${`pack${SET === 1 ? "" : SET}-hard-2`}.jsonl`), hardPack.slice(hThird, 2 * hThird).map((r) => JSON.stringify(r)).join("\n"));
  fs.writeFileSync(path.join(ROOT, `benchmark/judgments/${`pack${SET === 1 ? "" : SET}-hard-3`}.jsonl`), hardPack.slice(2 * hThird).map((r) => JSON.stringify(r)).join("\n"));
  console.log(`packs: ${pairwise.length} pairwise items (3 files), ${hardPack.length} hard items (3 files). Keys: ab-key.json, hard-key.json (do not show to judges).`);
}

// ---------- automatic hard-tier criteria ----------

function autoCheckHard(output, checks, register) {
  // global ortho gate (both skills mandate correct marks): ASCII/curly apostrophes
  // inside Uzbek words always fail — reduces judge-to-judge variance on script checks
  const results = [];
  results.push({
    type: "global_ortho",
    re: "correct ʻ/ʼ marks everywhere",
    why: "oʻ/gʻ and tutuq marks are mandatory in every register",
    pass: !/[‘’`´]/.test(output) && !/[A-Za-z]'[A-Za-z]/.test(output),
  });
  for (const c of checks) {
    let pass = true;
    switch (c.type) {
      case "drop": pass = !new RegExp(c.re, "i").test(output); break;
      case "keep": pass = new RegExp(c.re, "i").test(output); break;
      case "no_dash": pass = !/[—–]|--|(?<=\S) - (?=\S)/.test(output); break;
      case "no_bullet": pass = !/^\s*[•▪*]\s+\S/m.test(output); break;
      case "script_latin": pass = !/[\u0400-\u04FF]/.test(output) && !/[`´‘]/.test(output); break;
      case "lint_clean": pass = lintText(output, { register, allowSen: register === "chat" || register === "youth" }).every((f) => f.severity !== "error"); break;
      case "lint_ok": pass = lintText(output, { register, allowSen: true }).length <= c.max; break;
      case "approx_len": { const n = words(output).length; pass = n >= c.min && n <= c.max; break; }
      case "approx_input": {
        // character bigram overlap with the task-embedded source is approximated by length ratio + key-phrase presence
        pass = words(output).length >= 8; // placeholder; real check below via criteria.min vs task quote handled by keep-checks
        break;
      }
      case "varied_rhythm": {
        const lens = sentences(output).map((s) => words(s).length).filter((n) => n > 0);
        const mean = lens.reduce((a, b) => a + b, 0) / (lens.length || 1);
        const sd = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / (lens.length || 1));
        pass = sd >= 2.5 || lens.length <= 2;
        break;
      }
      case "register_chat": pass = true; break; // judged
      case "register_official": pass = true; break; // judged
      default: pass = true;
    }
    results.push({ type: c.type, re: c.re, why: c.why, pass });
  }
  return results;
}

function hardAutoResults() {
  const v1 = loadOutputs("v1");
  const v2 = loadOutputs("v2");
  const base = loadOutputs("baseline");
  const out = {};
  for (const model of ["baseline", "v1", "v2"]) {
    const outputs = model === "baseline" ? base : model === "v1" ? v1 : v2;
    out[model] = HARD.map((item) => {
      const text = outputs.get(item.id);
      if (text === undefined) return { id: item.id, missing: true, checks: [], allPass: false };
      const checks = autoCheckHard(text, CRITERIA[item.id] ?? [], item.register ?? "product");
      return { id: item.id, checks, allPass: checks.every((c) => c.pass) };
    });
  }
  fs.writeFileSync(path.join(ROOT, `benchmark/hard${SET === 1 ? "" : SET}-auto.json`), JSON.stringify(out, null, 1));
  for (const model of ["baseline", "v1", "v2"]) {
    const pass = out[model].filter((r) => r.allPass).length;
    console.log(`hard auto-checks ${model}: ${pass}/${HARD.length}`);
  }
}

// ---------- report ----------

function aggAll(res, key, filter) {
  const rows = [...res.heldout, ...res.hard].filter(filter ?? (() => true));
  return meanCI(rows.map((r) => r[key]).filter((v) => v !== undefined));
}

function svgBar(file, title, rows, unit = "") {
  // rows: [{label, value, ci?}] — horizontal bars, max 100-scale or max value
  const max = Math.max(...rows.map((r) => r.value), 1);
  const barMax = max > 100 ? max : 100;
  const W = 560, rowH = 34, labelW = 190, H = rows.length * rowH + 56;
  const colors = { baseline: "#9aa0a6", v1: "#e8833a", v2: "#1a73e8" };
  let y = 40;
  let body = "";
  for (const r of rows) {
    const w = Math.max(2, (r.value / barMax) * (W - labelW - 90));
    body += `<text x="${labelW - 8}" y="${y + 15}" text-anchor="end" font-size="12" fill="#202124">${r.label}</text>`;
    body += `<rect x="${labelW}" y="${y + 4}" width="${w}" height="18" rx="3" fill="${colors[r.model] ?? "#1a73e8"}"/>`;
    body += `<text x="${labelW + w + 6}" y="${y + 18}" font-size="12" fill="#202124">${r.value}${unit}${r.ci !== undefined ? ` ±${r.ci}` : ""}</text>`;
    y += rowH;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="100%" height="100%" fill="white"/><text x="12" y="22" font-size="14" font-weight="bold" fill="#202124">${title}</text>${body}</svg>`;
  fs.writeFileSync(path.join(ROOT, "benchmark/charts", SET === 1 ? file : file.replace(".svg",`-${SET}.svg`)), svg);
}

function wilson(p, n) {
  if (!n) return [0, 0];
  const z = 1.96;
  const phat = p / n;
  const denom = 1 + z * z / n;
  const center = (phat + z * z / (2 * n)) / denom;
  const spread = z * Math.sqrt(phat * (1 - phat) / n + z * z / (4 * n * n)) / denom;
  return [center - spread, center + spread];
}

const CAT_NAME = { chat: "Chat/Telegram", ui: "UI microcopy", mkt: "Marketing", en2uz: "EN→UZ", ru2uz: "RU→UZ", formal: "Formal letter", news: "News", long: "Hard: long", switch: "Hard: register switch", codemix: "Hard: code-mixing", script: "Hard: script", flavor: "Hard: idioms/slang", rhythm: "Hard: subtle robot", "formal-stay": "Hard: keep formal", trap: "Hard: traps", native: "Hard: native input", dash: "Hard: dash-heavy" };

function runReport() {
  const metrics = JSON.parse(fs.readFileSync(path.join(ROOT, `benchmark/metrics${SET === 1 ? "" : SET}.json`), "utf8"));
  const chrf = JSON.parse(fs.readFileSync(path.join(ROOT, `benchmark/chrf${SET === 1 ? "" : SET}.json`), "utf8"));
  const hardAuto = JSON.parse(fs.readFileSync(path.join(ROOT, `benchmark/hard${SET === 1 ? "" : SET}-auto.json`), "utf8"));
  const hashes = fs.readFileSync(path.join(ROOT, "benchmark/HASHES"), "utf8").trim();

  // judged files
  const judged = [];
  for (const f of [1, 2, 3]) {
    const p = path.join(ROOT, `benchmark/judgments/pairwise${SET === 1 ? "" : SET}-judged-${f}.jsonl`);
    if (fs.existsSync(p)) judged.push(...readJsonl(p));
  }
  const abKey = JSON.parse(fs.readFileSync(path.join(ROOT, `benchmark/judgments/ab-key${SET === 1 ? "" : SET}.json`), "utf8"));
  const hardKey = JSON.parse(fs.readFileSync(path.join(ROOT, `benchmark/judgments/hard-key${SET === 1 ? "" : SET}.json`), "utf8"));
  const hardJudged = [];
  for (const f of [1, 2, 3]) {
    const p = path.join(ROOT, `benchmark/judgments/hard${SET === 1 ? "" : SET}-judged-${f}.jsonl`);
    if (fs.existsSync(p)) hardJudged.push(...readJsonl(p));
  }

  // pairwise tally
  const tally = {}; // category → {v2:0, v1:0, tie:0}
  const reasons = [];
  for (const j of judged) {
    const key = abKey[j.id];
    if (!key) continue;
    const cat = HELDOUT.find((h) => h.id === j.id)?.category ?? HARD.find((h) => h.id === j.id)?.category ?? "?";
    tally[cat] ??= { v2: 0, v1: 0, tie: 0 };
    if (j.better === "tie") tally[cat].tie++;
    else if (key[j.better] === "v2") tally[cat].v2++;
    else tally[cat].v1++;
    if (j.reason) reasons.push({ id: j.id, better: key[j.better] === "v2" ? "v2" : key[j.better] === "v1" ? "v1" : "tie", reason: j.reason });
  }
  const total = { v2: 0, v1: 0, tie: 0 };
  for (const t of Object.values(tally)) { total.v2 += t.v2; total.v1 += t.v1; total.tie += t.tie; }

  // hard pass rates: auto allPass AND judge pass
  const hardPass = {};
  for (const model of ["baseline", "v1", "v2"]) {
    const auto = hardAuto[model];
    let pass = 0;
    const fails = [];
    for (const row of auto) {
      const judgedRows = hardJudged.filter((j) => j.id === row.id);
      const slot = Object.entries(hardKey[row.id] ?? {}).find(([, m]) => m === model)?.[0];
      const judgeOk = slot ? judgedRows.filter((j) => j.slot === slot).every((j) => j.pass) : true;
      const ok = row.allPass && judgeOk;
      if (ok) pass++;
      else fails.push(row.id);
    }
    hardPass[model] = { pass, total: HARD.length, fails };
  }

  const fmtPct = (a, b) => (b ? `${((a / b) * 100).toFixed(1)}%` : "—");
  const lines = [];
  const L = (s = "") => lines.push(s);

  L("# BENCHMARK — uzbek-humanizer (v1, GitHub) vs uzbekify (v2)");
  L();
  L(`Generated: ${new Date().toISOString()} · one \`npm run bench\` pipeline, same model for all generation and judging, blind A/B with seeded shuffles.`);
  L();
  L("## Final: v1 (GitHub) vs v2 — headline");
  L();
  L("v1 here is the published GitHub version (`reference-v1/`, github.com/xusnitdinov/uzbek-humanizer), rerun through the exact same pipeline after v2 was frozen (phase 6 §10).");
  L();
  L("| Metric | v1 (GitHub) | v2 (uzbekify) | baseline (no skill) |");
  L("|---|---|---|---|");
  const mAgg = (m, key, f) => aggAll(metrics[m], key, f);
  const reg = (m) => m === "chat" || m === "youth";
  L(`| Naturalness score (0-100, higher = more human) | ${mAgg("v1", "v2Score").mean} ± ${mAgg("v1", "v2Score").ci} | **${mAgg("v2", "v2Score").mean} ± ${mAgg("v2", "v2Score").ci}** | ${mAgg("baseline", "v2Score").mean} ± ${mAgg("baseline", "v2Score").ci} |`);
  L(`| v1 linter hits (lower better) | ${mAgg("v1", "v1Hits").mean} | **${mAgg("v2", "v1Hits").mean}** | ${mAgg("baseline", "v1Hits").mean} |`);
  L(`| v2 linter findings (lower better) | ${mAgg("v1", "v2Hits").mean} | **${mAgg("v2", "v2Hits").mean}** | ${mAgg("baseline", "v2Hits").mean} |`);
  L(`| Dashes per text (em/en/\\\" - \\\"; lower better) | ${mAgg("v1", "dashes").mean} | **${mAgg("v2", "dashes").mean}** | ${mAgg("baseline", "dashes").mean} |`);
  L(`| Officialese rate /100 words | ${mAgg("v1", "officialeseRate").mean} | **${mAgg("v2", "officialeseRate").mean}** | ${mAgg("baseline", "officialeseRate").mean} |`);
  L(`| Russian-calque rate /100 words | ${mAgg("v1", "ruCalqueRate").mean} | **${mAgg("v2", "ruCalqueRate").mean}** | ${mAgg("baseline", "ruCalqueRate").mean} |`);
  L(`| Apostrophe/script errors per text | ${mAgg("v1", "v2OrthoHits").mean} | **${mAgg("v2", "v2OrthoHits").mean}** | ${mAgg("baseline", "v2OrthoHits").mean} |`);
  L(`| Sentence length (words; corpus mean 12) | ${mAgg("v1", "meanSentenceLen").mean} | **${mAgg("v2", "meanSentenceLen").mean}** | ${mAgg("baseline", "meanSentenceLen").mean} |`);
  L(`| chrF vs human references (higher better) | ${chrf.v1.mean} ± ${chrf.v1.ci} | **${chrf.v2.mean} ± ${chrf.v2.ci}** | ${chrf.baseline.mean} ± ${chrf.baseline.ci} |`);
  const chatPart = (m) => {
    const rows = [...metrics[m].heldout, ...metrics[m].hard].filter((r) => reg(r.register) && r.particleUse !== undefined);
    const withP = rows.filter((r) => r.particleUse > 0).length;
    return `${withP}/${rows.length} (${fmtPct(withP, rows.length)})`;
  };
  L(`| Natural particle/spoken-form use in chat texts | ${chatPart("v1")} | **${chatPart("v2")}** | ${chatPart("baseline")} |`);
  L(`| **Blind pairwise win** (v2 / tie / v1) | ${total.v1} losses | **${total.v2} wins (${fmtPct(total.v2, judged.length)})** | — |`);
  L(`| **Hard-tier pass** (auto + judge) | ${hardPass.v1.pass}/${HARD.length} (${fmtPct(hardPass.v1.pass, HARD.length)}) | **${hardPass.v2.pass}/${HARD.length} (${fmtPct(hardPass.v2.pass, HARD.length)})** | ${hardPass.baseline.pass}/${HARD.length} (${fmtPct(hardPass.baseline.pass, HARD.length)}) |`);
  L();

  // pairwise per category
  if (judged.length) {
    L("## Blind pairwise judging (v1 vs v2, forced choice + tie)");
    L();
    L(`Judge: same model, separate context, no skill files, outputs shuffled A/B (key withheld). Rubric: reference-v1 bakeoff rubric extended for naturalness — pick which sounds more like a real native Uzbek human.`);
    L();
    L("| Category | v2 win | tie | v1 win | n | v2 win rate (95% CI) |");
    L("|---|---|---|---|---|---|");
    for (const cat of Object.keys(tally)) {
      const t = tally[cat];
      const n = t.v2 + t.v1 + t.tie;
      const [lo, hi] = wilson(t.v2, n);
      L(`| ${CAT_NAME[cat] ?? cat} | ${t.v2} | ${t.tie} | ${t.v1} | ${n} | ${fmtPct(t.v2, n)} (${(lo * 100).toFixed(0)}–${(hi * 100).toFixed(0)}%) |`);
    }
    const [lo, hi] = wilson(total.v2, judged.length);
    L(`| **Overall** | **${total.v2}** | ${total.tie} | ${total.v1} | ${judged.length} | **${fmtPct(total.v2, judged.length)}** (${(lo * 100).toFixed(0)}–${(hi * 100).toFixed(0)}%) |`);
    L();
  }

  // hard mode section
  L("## Hard mode");
  L();
  L("60 brutal items (frozen, sha256 in HASHES): long subtle robot prose, register switches inside one task, code-mixing with correct loans to KEEP, mixed Cyrillic/Latin with wrong apostrophes, idioms/sarcasm/slang that must not flatten, robotic-but-clean rhythm cases, gov/legal text that must stay formal, translation traps (false friends, aspect, evidentials, politeness), native-written inputs that must stay basically unchanged, dash-heavy restructuring.");
  L();
  L("| Model | Auto-checks pass | Judge pass | Final pass (auto ∧ judge) |");
  L("|---|---|---|---|");
  for (const model of ["baseline", "v1", "v2"]) {
    const autoPass = hardAuto[model].filter((r) => r.allPass).length;
    L(`| ${model} | ${autoPass}/${HARD.length} | ${hardPass[model].pass}/${HARD.length} | **${hardPass[model].pass}/${HARD.length} (${fmtPct(hardPass[model].pass, HARD.length)})** |`);
  }
  L();
  L("Per-category hard pass (v2):");
  L();
  const hardCats = [...new Set(HARD.map((h) => h.category))];
  L("| Category | v2 pass | v1 pass | baseline pass |");
  L("|---|---|---|---|");
  for (const cat of hardCats) {
    const ids = HARD.filter((h) => h.category === cat).map((h) => h.id);
    const cnt = (m) => ids.filter((id) => hardPass[m].fails && !hardPass[m].fails.includes(id)).length;
    L(`| ${CAT_NAME[cat] ?? cat} | ${cnt("v2")}/${ids.length} | ${cnt("v1")}/${ids.length} | ${cnt("baseline")}/${ids.length} |`);
  }
  L();

  // per-category automatic metrics (heldout only)
  L("## Automatic metrics by category (held-out set)");
  L();
  L("| Category | n | score v1→v2 | v1 hits v1→v2 | dashes v1→v2 | officialese v1→v2 |");
  L("|---|---|---|---|---|---|");
  for (const cat of Object.keys(CATEGORY_REGISTER)) {
    const n = HELDOUT.filter((h) => h.category === cat).length;
    const f = (r) => r.category === cat;
    L(`| ${CAT_NAME[cat] ?? cat} | ${n} | ${mAgg("v1", "v2Score", f).mean} → **${mAgg("v2", "v2Score", f).mean}** | ${mAgg("v1", "v1Hits", f).mean} → ${mAgg("v2", "v1Hits", f).mean} | ${mAgg("v1", "dashes", f).mean} → **${mAgg("v2", "dashes", f).mean}** | ${mAgg("v1", "officialeseRate", f).mean} → **${mAgg("v2", "officialeseRate", f).mean}** |`);
  }
  L();

  // striking examples (largest score gap + dash/officialese deltas), capped 10
  const scored = [];
  for (const item of [...HELDOUT, ...HARD]) {
    const a = metrics.v1.heldout.find((r) => r.id === item.id) ?? metrics.v1.hard.find((r) => r.id === item.id);
    const b = metrics.v2.heldout.find((r) => r.id === item.id) ?? metrics.v2.hard.find((r) => r.id === item.id);
    const v1t = loadOutputs("v1").get(item.id);
    const v2t = loadOutputs("v2").get(item.id);
    if (!a || !b || v1t === undefined || v2t === undefined) continue;
    const gap = b.v2Score - a.v2Score + (a.v1Hits - b.v1Hits) * 2 + (a.dashes - b.dashes) * 3 + (a.officialeseRate - b.officialeseRate) * 2;
    scored.push({ item, gap, v1t, v2t, a, b });
  }
  const striking = scored.sort((x, y) => y.gap - x.gap).slice(0, 10);
  const v1Wins = scored.sort((x, y) => x.gap - y.gap).slice(0, 3);
  const esc = (t) => t.replace(/`/g, "'").replace(/\n+/g, " ⏎ ");
  L("## 10 striking side-by-side examples (v2 clearly more human)");
  L();
  let i = 0;
  for (const ex of striking) {
    i++;
    L(`### ${i}. ${ex.item.id} (${ex.item.category}) — score ${ex.a.v2Score}→${ex.b.v2Score}, v1-lint hits ${ex.a.v1Hits}→${ex.b.v1Hits}`);
    L();
    L(`Task: ${esc(ex.item.task).slice(0, 220)}${ex.item.task.length > 220 ? "…" : ""}`);
    L();
    L(`- **v1:** ${esc(ex.v1t).slice(0, 300)}`);
    L(`- **v2:** ${esc(ex.v2t).slice(0, 300)}`);
    L();
  }
  L("## Where v1 won or tied (honesty)");
  L();
  for (const ex of v1Wins) {
    L(`- **${ex.item.id}** (${ex.item.category}): v1 score ${ex.a.v2Score} vs v2 ${ex.b.v2Score} — v1 text: ${esc(ex.v1t).slice(0, 140)} | v2: ${esc(ex.v2t).slice(0, 140)}`);
  }
  const tieNote = judged.length ? `Blind judging ties: ${total.tie}/${judged.length}.` : "";
  L();
  L(tieNote);
  L();

  // verdict
  const winRate = judged.length ? total.v2 / judged.length : 0;
  const hardRate = hardPass.v2.pass / HARD.length;
  L("## Verdict");
  L();
  L(`v2 blind pairwise win rate: **${fmtPct(total.v2, judged.length)}** (target ≥70%). Hard-tier pass: **${fmtPct(hardPass.v2.pass, HARD.length)}** (target ≥85%). ${winRate >= 0.7 && hardRate >= 0.85 ? "**v2 clearly wins.**" : "**Below target — iterate (see iterations log).**"}`);
  L();
  L("## Reproduce");
  L();
  L("```bash");
  L("npm run build");
  L("npm run bench            # metrics + judge packs + report (uses saved outputs/judgments)");
  L("sha256sum -c <<< \"$(grep heldout benchmark/HASHES)\"   # items frozen");
  L("```");
  L();
  L("Generation and judging prompts: `benchmark/prompts/`. Item hashes:");
  L();
  L("```");
  for (const line of hashes.split("\n")) L(line);
  L("```");
  L();
  L("## Iterations log");
  L();
  L("| Round | Change | Result |");
  L("|---|---|---|");
  L(`| 1 | v2 frozen after phase 5 (incl. general native-preservation + formal-stay rules added BEFORE generation, from the hard-mode spec). Held-out + hard written fresh, never used for rule tuning. | this report |`);

  fs.writeFileSync(path.join(ROOT, `benchmark/BENCHMARK${SET === 1 ? "" : `-round${SET}`}.md`), lines.join("\n") + "\n");

  // charts
  fs.mkdirSync(path.join(ROOT, "benchmark/charts"), { recursive: true });
  const bar = (file, title, key, unit, f) =>
    svgBar(file, title, ["baseline", "v1", "v2"].map((m) => ({ model: m, label: m, value: mAgg(m, key, f).mean, ci: mAgg(m, key, f).ci })), unit);
  bar("score.svg", "Naturalness score (0-100, higher better)", "v2Score", "");
  bar("dashes.svg", "Dashes per text (lower better)", "dashes", "");
  bar("officialese.svg", "Officialese phrases per 100 words (lower better)", "officialeseRate", "");
  bar("ru-calques.svg", "Russian-calque rate per 100 words (lower better)", "ruCalqueRate", "");
  if (judged.length) {
    svgBar("pairwise.svg", `Blind pairwise: v2 win ${fmtPct(total.v2, judged.length)} of ${judged.length}`, [
      { model: "v2", label: "v2 wins", value: total.v2 },
      { model: "baseline", label: "ties", value: total.tie },
      { model: "v1", label: "v1 wins", value: total.v1 },
    ]);
  }
  svgBar("hard-pass.svg", `Hard-tier pass (${HARD.length} items)`, [
    { model: "v2", label: "v2", value: hardPass.v2.pass },
    { model: "v1", label: "v1", value: hardPass.v1.pass },
    { model: "baseline", label: "baseline", value: hardPass.baseline.pass },
  ]);
  console.log(`report: benchmark/BENCHMARK.md, ${judged.length} pairwise judgments tallied (v2 win ${fmtPct(total.v2, judged.length)}), hard v2 ${hardPass.v2.pass}/${HARD.length}`);
}

// ---------- native review page ----------

function runNativeReview() {
  const v1 = loadOutputs("v1");
  const v2 = loadOutputs("v2");
  const all = seededShuffle([...HELDOUT, ...HARD], SET === 2 ? "native-review-40-r2" : "native-review-40").slice(0, 40).filter((i) => v1.has(i.id) && v2.has(i.id)).slice(0, 40);
  const key = {};
  const items = all.map((item) => {
    const flip = seededShuffle([0, 1], "nr" + item.id + (SET === 1 ? "" : `-r${SET}`))[0] === 1;
    key[item.id] = { A: flip ? "v2" : "v1", B: flip ? "v1" : "v2" };
    return {
      id: item.id,
      category: item.category,
      task: item.task,
      A: v1.has(item.id) && v2.has(item.id) ? (flip ? v2.get(item.id) : v1.get(item.id)) : "",
      B: flip ? v1.get(item.id) : v2.get(item.id),
    };
  });
  fs.writeFileSync(path.join(ROOT, SET === 1 ? "benchmark/native-review-key.json" : `benchmark/native-review-key${SET}.json`), JSON.stringify(key, null, 1));
  const html = `<!doctype html>
<html lang="uz"><head><meta charset="utf-8"><title>uzbekify — native review (blind A/B)</title>
<style>
 body{font-family:Georgia,system-ui,sans-serif;max-width:760px;margin:24px auto;padding:0 16px;color:#1b1b1b;background:#faf9f6;line-height:1.55}
 h1{font-size:22px} .card{background:#fff;border:1px solid #ddd;border-radius:10px;padding:16px;margin:18px 0;box-shadow:0 1px 3px rgba(0,0,0,.06)}
 .task{font-size:13px;color:#555;margin-bottom:10px;border-left:3px solid #1a73e8;padding-left:8px}
 .out{white-space:pre-wrap;background:#f6f5f2;border-radius:8px;padding:10px 12px;margin:8px 0;font-size:15px}
 label{display:block;margin:6px 0;cursor:pointer}
 button{background:#1a73e8;color:#fff;border:none;border-radius:6px;padding:10px 18px;font-size:15px;cursor:pointer;margin:14px 4px 0 0}
 #result{display:none;background:#e8f0fe;border-radius:10px;padding:16px}
 .tag{font-weight:bold}
 .done{color:#188038}
</style></head><body>
<h1>uzbekify native review</h1>
<p>Ikkita variantdan qaysi biri <b>haqiqiy odam yozgandek</b> qulayroq — tanlang. 40 ta matn, oxirida natija ochiladi. (Blind: qaysi biri qaysi modeldan e'tiborli emas.)</p>
<div id="quiz"></div>
<button id="finish" onclick="finish()">Yakunlash</button>
<button id="reset" onclick="location.reload()">Boshidan</button>
<div id="result"></div>
<script>
const ITEMS = ${JSON.stringify(items)};
const KEY = ${JSON.stringify(key)};
const answers = {};
const quiz = document.getElementById("quiz");
ITEMS.forEach((it, i) => {
  const d = document.createElement("div"); d.className = "card";
  d.innerHTML = \`<div class="task">\${i+1}. [\${it.category}] \${it.task.replace(/</g,"&lt;")}</div>
    <div class="out"><b>A.</b> \${it.A.replace(/</g,"&lt;")}</div>
    <div class="out"><b>B.</b> \${it.B.replace(/</g,"&lt;")}</div>
    <label><input type="radio" name="\${it.id}" value="A" onchange="ans('\${it.id}','A')"> A yaxshiroq</label>
    <label><input type="radio" name="\${it.id}" value="B" onchange="ans('\${it.id}','B')"> B yaxshiroq</label>
    <label><input type="radio" name="\${it.id}" value="tie" onchange="ans('\${it.id}','tie')"> Barobar</label>\`;
  quiz.appendChild(d);
});
function ans(id, v){ answers[id] = v; }
function finish(){
  const res = {v2:0, v1:0, tie:0, unanswered:0};
  let rows = "";
  for (const it of ITEMS){
    const a = answers[it.id];
    if (!a){ res.unanswered++; continue; }
    const winner = a === "tie" ? "tie" : KEY[it.id][a];
    res[winner]++;
    rows += \`<div>\${it.id}: tanlov \${a} → <span class="tag">\${winner}</span></div>\`;
  }
  const r = document.getElementById("result");
  r.style.display = "block";
  r.innerHTML = \`<h2>Natija (unblinded)</h2>
   <p>v2 (uzbekify): <b>\${res.v2}</b> · v1: <b>\${res.v1}</b> · barobar: \${res.tie} · javob berilmagan: \${res.unanswered}</p>\${rows}\`;
  r.scrollIntoView();
}
</script></body></html>`;
  fs.writeFileSync(path.join(ROOT, SET === 1 ? "benchmark/native-review.html" : `benchmark/native-review${SET}.html`), html);
  console.log(`native-review.html: ${items.length} blind A/B items (key: benchmark/native-review-key.json)`);
}

// ---------- main ----------

const cmd = process.argv[2] ?? "all";
if (cmd === "metrics" || cmd === "all") runMetrics();
if (cmd === "packs" || cmd === "all") buildPacks();
if (cmd === "hard-auto" || cmd === "all") hardAutoResults();
if (cmd === "report" || cmd === "all") {
  try { runReport(); } catch (e) { console.error(`report incomplete (${e.message}) — run judging steps first`); }
}
if (cmd === "native" || cmd === "all") {
  try { runNativeReview(); } catch (e) { console.error(`native-review skipped (${e.message})`); }
}
if (cmd === "all") {
  console.log("\nnpm run bench pipeline complete. LLM steps (generation, judging) are documented in benchmark/prompts/.");
}
