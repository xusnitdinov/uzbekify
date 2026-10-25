/**
 * Pure tool handlers for the uzpro MCP server. Kept free of transport
 * concerns so they can be unit-tested directly.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { lintText, lintAndScore, scoreFindings } from "./lint.js";
import { translit, normalize } from "./index.js";
import type { Finding, LintOptions, RegisterId } from "./types.js";

// ---------- data loading (dist/data or src/data) ----------

interface CalqueEntry { id: string; bad: string; good: string; why: string; class: string }
interface GlossaryEntry { en: string; uz: string }
interface SynonymEntry { avoid: string; prefer: string; context: string }
interface CorpusStats {
  wordFreq: Record<string, number>;
  collocations: { phrase: string; count: number }[];
  connectors: { connector: string; count: number }[];
  sentenceLength: { count: number; mean: number; median: number; p5: number; p95: number; p99: number };
  latinTokens: number;
}

function loadData<T>(name: string, fallback: T): T {
  const here = path.dirname(fileURLToPath(import.meta.url));
  for (const candidate of [path.join(here, "data", name), path.join(here, "..", "data", name)]) {
    if (fs.existsSync(candidate)) return JSON.parse(fs.readFileSync(candidate, "utf8")) as T;
  }
  return fallback;
}

let calquesCache: CalqueEntry[] | null = null;
let glossaryCache: GlossaryEntry[] | null = null;
let synonymsCache: SynonymEntry[] | null = null;
let corpusCache: CorpusStats | null = null;

function calques(): CalqueEntry[] {
  if (!calquesCache) calquesCache = (loadData<{ entries: CalqueEntry[] }>("calques.json", { entries: [] })).entries;
  return calquesCache;
}
function glossary(): GlossaryEntry[] {
  if (!glossaryCache) glossaryCache = (loadData<{ entries: GlossaryEntry[] }>("glossary.json", { entries: [] })).entries;
  return glossaryCache;
}
function synonyms(): SynonymEntry[] {
  if (!synonymsCache) synonymsCache = (loadData<{ entries: SynonymEntry[] }>("synonyms.json", { entries: [] })).entries;
  return synonymsCache;
}
function corpus(): CorpusStats {
  if (!corpusCache) corpusCache = loadData<CorpusStats>("corpus-stats.json", {
    wordFreq: {}, collocations: [], connectors: [], latinTokens: 0,
    sentenceLength: { count: 0, mean: 0, median: 0, p5: 0, p95: 28, p99: 40 },
  });
  return corpusCache;
}

const VALID_REGISTERS: RegisterId[] = ["product","quiz","assistant","youth","marketing","academic","news","legal","official","chat"];

function optsOf(register?: string, allowSen?: boolean): LintOptions {
  const reg = (VALID_REGISTERS as string[]).includes(register ?? "") ? (register as RegisterId) : "product";
  return { register: reg, allowSen: Boolean(allowSen) || reg === "youth" };
}

// ---------- the 7 tools ----------

export function uzLint(text: string, register?: string, allowSen?: boolean) {
  const findings = lintText(text, optsOf(register, allowSen));
  const { score, band, humanVoiceBonus, humanVoiceSignals } = lintAndScore(text, optsOf(register, allowSen));
  return { score, band, humanVoiceBonus, humanVoiceSignals, findings };
}

/** The rewrite ladder step each linter family feeds (SKILL.md steps 1-8). */
const FAMILY_STEP: Record<string, { step: number; title: string }> = {
  ortho: { step: 2, title: "Fix script and apostrophes" },
  calque: { step: 3, title: "Kill calques" },
  russianism: { step: 3, title: "Kill calques (RU structure)" },
  officialese: { step: 3, title: "Kill officialese (gov patterns)" },
  wordorder: { step: 4, title: "Restore SOV word order" },
  suffix: { step: 5, title: "Fix suffix chains and harmony" },
  register: { step: 1, title: "One address lane (register)" },
  passive: { step: 7, title: "Active voice / rhythm" },
  cadence: { step: 7, title: "Check rhythm" },
  literalness: { step: 3, title: "Kill translationese" },
  loanword: { step: 6, title: "Native synonyms for loanwords" },
  screen: { step: 2, title: "Script consistency" },
  format: { step: 8, title: "Formatting" },
};

export function uzRewritePlan(text: string, register?: string, allowSen?: boolean) {
  const opts = optsOf(register, allowSen);
  const findings = lintText(text, opts);
  const { score, band } = lintAndScore(text, opts);
  const steps = new Map<number, { step: number; title: string; fixes: Finding[] }>();
  for (const f of findings) {
    const s = FAMILY_STEP[f.family] ?? { step: 8, title: "Final self-check" };
    const entry = steps.get(s.step) ?? { step: s.step, title: s.title, fixes: [] };
    entry.fixes.push(f);
    steps.set(s.step, entry);
  }
  const plan = [...steps.values()].sort((a, b) => a.step - b.step).map((s) => ({
    step: s.step,
    title: s.title,
    fixes: s.fixes.map((f) => ({
      rule: f.rule,
      severity: f.severity,
      match: f.match,
      count: f.count,
      line: f.line ?? null,
      column: f.column ?? null,
      message: f.message,
    })),
  }));
  return {
    score,
    band,
    register: opts.register,
    ladder: "1 register → 2 script → 3 calques/officialese → 4 word order → 5 morphology → 6 synonyms → 7 rhythm → 8 self-check",
    steps: plan,
  };
}

export function uzScore(text: string, register?: string, allowSen?: boolean) {
  const opts = optsOf(register, allowSen);
  const findings = lintText(text, opts);
  const { score, band, deductions, humanVoiceBonus, humanVoiceSignals } = scoreFindings(text, findings, opts);
  return {
    score,
    band,
    deductions,
    humanVoiceBonus,
    humanVoiceSignals,
    corpusBaseline: {
      note: "corpus median/p95 sentence length (news/wiki — spelling reference only, NOT a voice model)",
      medianWords: corpus().sentenceLength.median,
      p95Words: corpus().sentenceLength.p95,
    },
  };
}

export function uzTranslit(text: string, to: "latin" | "cyrillic" = "latin") {
  const result = to === "latin" ? translit(normalize(text), "latin") : translit(text, "cyrillic");
  return { to, result };
}

export function uzGlossaryLookup(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return { matches: [] };
  const g = glossary()
    .filter((e) => e.en.toLowerCase().includes(q) || e.uz.toLowerCase().includes(q))
    .slice(0, 20)
    .map((e) => ({ source: "ui-glossary", en: e.en, uz: e.uz }));
  const c = calques()
    .filter((e) => e.bad.toLowerCase().includes(q) || e.good.toLowerCase().includes(q))
    .slice(0, 20)
    .map((e) => ({ source: "calque-bank", en: e.bad, uz: e.good, why: e.why }));
  return { matches: [...g, ...c] };
}

const STOPWORD_FIRST = new Set(["the", "this", "when", "and", "hard", "dream", "one", "very", "need", "group", "team"]);

export function uzCalqueCheck(text: string) {
  const t = text.toLowerCase();
  const matches = calques()
    .filter((e) => {
      const bad = e.bad.toLowerCase();
      // split variants ("ship qilmoq / ship it", "feature (as filler)")
      const variants = bad.split(/[/()]|→|;/).map((v) => v.trim()).filter(Boolean);
      return variants.some((v) => {
        const m = v.match(/[a-zʻʼ][a-zʻʼ' -]{2,}/);
        if (!m) return false;
        const phrase = m[0].trim();
        if (t.includes(phrase)) return true;
        // fall back to a distinctive first word ("ship qilaylik" ↔ "ship qilmoq")
        const first = phrase.split(/\s+/)[0];
        return first.length >= 4 && !STOPWORD_FIRST.has(first) && new RegExp(`\\b${first}\\b`).test(t);
      });
    })
    .slice(0, 50)
    .map((e) => ({ id: e.id, bad: e.bad, good: e.good, why: e.why, class: e.class }));
  const lintHits = lintText(text, optsOf()).filter((f) => ["calque", "russianism", "officialese"].includes(f.family));
  return { bankMatches: matches, linterHits: lintHits.map((f) => ({ rule: f.rule, match: f.match, message: f.message })) };
}

export function uzSynonymSuggest(word: string, register?: string) {
  const q = word.trim().toLowerCase();
  if (!q) return { suggestions: [] };
  const freq = corpus().wordFreq;
  const fromSynonyms = synonyms()
    .filter((e) => e.avoid.toLowerCase().includes(q) || e.prefer.toLowerCase().includes(q))
    .slice(0, 15)
    .map((e) => ({
      avoid: e.avoid,
      prefer: e.prefer,
      context: e.context,
      corpusFreq: freq[e.prefer.toLowerCase().split(/[\s,]/)[0] ?? ""] ?? 0,
    }));
  const fromCalques = calques()
    .filter((e) => e.bad.toLowerCase().split(/[\s/(/)]/).includes(q))
    .slice(0, 10)
    .map((e) => ({ avoid: e.bad, prefer: e.good, context: e.class, corpusFreq: freq[e.good.toLowerCase().split(/\s/)[0] ?? ""] ?? 0 }));
  const suggestions = [...fromSynonyms, ...fromCalques]
    .sort((a, b) => b.corpusFreq - a.corpusFreq)
    .slice(0, 12);
  return {
    query: word,
    register: register ?? "product",
    rankedBy: "corpus frequency (uz.wikipedia + kun.uz Latin corpus)",
    suggestions,
  };
}
