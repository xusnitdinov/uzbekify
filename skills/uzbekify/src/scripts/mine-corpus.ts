#!/usr/bin/env node
/**
 * Mine the research corpus (research/corpus/*.txt) for spelling/vocabulary/
 * frequency facts. CORE MISSION guard: this data describes how Uzbek is
 * SPELLED and which words/collocations are frequent — it is never a model of
 * how to sound (see research/FINDINGS.md).
 *
 * Outputs:
 *   research/corpus-mining/report.json            — full stats
 *   research/corpus-mining/wordfreq-latin.json    — top Latin words
 *   research/corpus-mining/collocations-latin.json— top Latin bigrams
 *   research/corpus-mining/connectors.json        — connector ranking
 *   research/corpus-mining/suffix-chains.json     — suffix frequency profile
 *   research/corpus-mining/sentence-lengths.json  — distribution/baselines
 *   src/data/corpus-stats.json                    — distilled data the
 *                                                    linters/MCP tools use
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "..", "..");
const CORPUS_DIR = path.join(REPO, "research", "corpus");
const OUT_DIR = path.join(REPO, "research", "corpus-mining");
const DATA_DIR = path.join(REPO, "skills", "uzbek-humanizer-pro", "src", "data");

const CONNECTORS = [
  "va", "lekin", "ammo", "biroq", "chunki", "shuning uchun", "shu sababli",
  "natijada", "hamda", "yoki", "agar", "boʻlsa", "endi", "keyin", "soʻng",
  "bundan tashqari", "shuningdek", "yaʼni", "masalan", "qisqasi", "baribir",
  "ayni paytda", "shu bilan birga", "boshqa tomondan", "birinchi navbatda",
  "xulosa qilib", "aniqsa", "zerk", "faxatan", "nixoya", "oʻz navbatida",
  "muvofiq ravishda", "shu munosabat bilan", "buning ustiga", "uning oʻrniga",
  "boshqa soʻzlar bilan", "bir tomondan", "ikkinchi tomondan", "aynan",
  "aslida", "haqiqatda", "koʻrinib turibdi", "demak", "bas",
];

const SUFFIXES: [string, RegExp][] = [
  ["lar", /\w{2,}(lar)(?:i|ni|ga|da|dan|ning)?$/i],
  ["ning", /\w{2,}(ning)$/i],
  ["ga/ka/qa", /\w{2,}(ga|ka|qa)$/i],
  ["da", /\w{2,}(da|ta)$/i],
  ["dan", /\w{2,}(dan|tan)$/i],
  ["ni", /\w{2,}(ni)$/i],
  ["gan", /\w{2,}(gan|qan|kan)$/i],
  ["di (past)", /\w{2,}(di|dim|dik|ding|di)$/i],
  ["moq", /\w{2,}(moq|moqda)$/i],
  ["ishi (nominal)", /\w{2,}(ishi)$/i],
  ["ganida", /\w{2,}(ganda|ganda|ganida|gachA)$/i],
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith(".txt") && !e.name.endsWith(".links.txt")) out.push(p);
  }
  return out;
}

function pct(n: number, arr: number[]): number {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.floor((n / 100) * s.length)))];
}

function main(): void {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(DATA_DIR, { recursive: true });

  const files = walk(CORPUS_DIR).filter((f) => !f.includes("gov-corpus"));
  const latinWords: string[] = [];
  const cyrWords: string[] = [];
  const latinSentences: number[] = [];
  let latinChars = 0;
  let cyrChars = 0;

  for (const file of files) {
    const raw = fs.readFileSync(file, "utf8");
    const body = raw
      .split(/\r?\n/)
      .filter((l) => !l.startsWith("#"))
      .join("\n");
    const isCyr = (body.match(/[\u0400-\u04FF]/g) ?? []).length > (body.match(/[A-Za-z]/g) ?? []).length;
    if (isCyr) {
      cyrChars += body.length;
      cyrWords.push(...(body.match(/[\u0400-\u04FF\u02BB\u02BC]+/g) ?? []));
      continue;
    }
    latinChars += body.length;
    latinWords.push(...(body.match(/[A-Za-zʻʼ]+/g) ?? []));
    for (const s of body.split(/(?<=[.!?…])\s+|\n+/)) {
      const w = s.trim().split(/\s+/).filter(Boolean);
      if (w.length >= 2) latinSentences.push(w.length);
    }
  }

  const freq = new Map<string, number>();
  for (const w of latinWords) freq.set(w.toLowerCase(), (freq.get(w.toLowerCase()) ?? 0) + 1);
  const wordFreq = [...freq.entries()].sort((a, b) => b[1] - a[1]);
  const totalTokens = latinWords.length;

  const bigrams = new Map<string, number>();
  for (let i = 0; i + 1 < latinWords.length; i++) {
    const a = latinWords[i].toLowerCase();
    const b = latinWords[i + 1].toLowerCase();
    if (a.length < 3 || b.length < 3) continue;
    const g = `${a} ${b}`;
    bigrams.set(g, (bigrams.get(g) ?? 0) + 1);
  }
  const collocations = [...bigrams.entries()]
    .sort((a, b) => b[1] - a[1])
    .filter(([g]) => !/^(va|hamda|yoki|ammo|lekin|endi|keyin) /.test(g))
    .slice(0, 300);

  const lowerText = latinWords.map((w) => w.toLowerCase()).join(" ");
  const connectorCounts = CONNECTORS.map((c) => ({
    connector: c,
    count: (lowerText.match(new RegExp(`(?<=\\s|^)${c.replace(/ /g, "\\s+")}(?=\\s|[.,!?])`, "g")) ?? []).length,
  }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  const suffixCounts = SUFFIXES.map(([name, re]) => ({
    suffix: name,
    count: latinWords.filter((w) => re.test(w)).length,
  })).sort((a, b) => b.count - a.count);

  const sentences = latinSentences;
  const sentenceStats = {
    count: sentences.length,
    mean: +(sentences.reduce((a, b) => a + b, 0) / (sentences.length || 1)).toFixed(2),
    median: pct(50, sentences),
    p5: pct(5, sentences),
    p95: pct(95, sentences),
    p99: pct(99, sentences),
  };

  const write = (name: string, data: unknown) =>
    fs.writeFileSync(path.join(OUT_DIR, name), JSON.stringify(data, null, 2), "utf8");

  write("wordfreq-latin.json", { totalTokens, unique: wordFreq.length, top: wordFreq.slice(0, 2000) });
  write("collocations-latin.json", collocations);
  write("connectors.json", connectorCounts);
  write("suffix-chains.json", suffixCounts);
  write("sentence-lengths.json", sentenceStats);
  write("wordfreq-cyrillic.json", {
    note: "Cyrillic side (gazeta.uz/daryo.uz RSS) — vocabulary breadth only",
    top: [...(function () {
      const m = new Map<string, number>();
      for (const w of cyrWords) m.set(w.toLowerCase(), (m.get(w.toLowerCase()) ?? 0) + 1);
      return [...m.entries()].sort((a, b) => b[1] - a[1]);
    })()].slice(0, 500),
  });

  // Distilled data for the linters / MCP tools
  const corpusStats = {
    generated: new Date().toISOString(),
    files: files.length,
    latinTokens: totalTokens,
    cyrillicTokens: cyrWords.length,
    wordFreq: Object.fromEntries(wordFreq.slice(0, 800)),
    collocations: collocations.slice(0, 120).map(([g, n]) => ({ phrase: g, count: n })),
    connectors: connectorCounts,
    suffixProfile: suffixCounts,
    sentenceLength: sentenceStats,
  };
  fs.writeFileSync(path.join(DATA_DIR, "corpus-stats.json"), JSON.stringify(corpusStats, null, 2), "utf8");

  console.log(`Mined ${files.length} files: ${totalTokens} Latin tokens (${wordFreq.length} unique), ${cyrWords.length} Cyrillic tokens`);
  console.log(`Sentence lengths: mean ${sentenceStats.mean}, median ${sentenceStats.median}, p95 ${sentenceStats.p95}`);
  console.log(`Top connectors: ${connectorCounts.slice(0, 5).map((c) => `${c.connector}(${c.count})`).join(", ")}`);
  console.log(`Top collocations: ${collocations.slice(0, 5).map(([g, n]) => `${g}(${n})`).join(", ")}`);
  console.log(`Wrote ${OUT_DIR} and ${path.join(DATA_DIR, "corpus-stats.json")}`);
}

main();
