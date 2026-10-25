#!/usr/bin/env node
/**
 * Generate src/data/*.json from the human-authored reference files so the
 * MCP tools (uz_glossary_lookup, uz_calque_check, uz_synonym_suggest) and
 * any external consumer can query structured data instead of parsing prose.
 *
 *   node dist/scripts/gen-data.js
 *     → src/data/glossary.json    (EN↔UZ UI terms + register notes)
 *     → src/data/calques.json     (bad | good | why | class, from calque-bank)
 *     → src/data/synonyms.json    (avoid→prefer pairs from synonym-taste)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "..", "..");
const SKILL = path.join(REPO, "skills", "uzbekify");
const REFS = path.join(SKILL, "references");
const DATA = path.join(SKILL, "src", "data");

interface CalqueEntry {
  id: string;
  bad: string;
  good: string;
  why: string;
  class: string;
}

interface GlossaryEntry {
  en: string;
  uz: string;
}

interface SynonymEntry {
  avoid: string;
  prefer: string;
  context: string;
}

function readMd(name: string): string {
  return fs.readFileSync(path.join(REFS, name), "utf8");
}

function cells(line: string): string[] {
  return line
    .split("|")
    .map((c) => c.trim())
    .filter((c) => c.length > 0 && !/^-+$/.test(c));
}

function parseCalques(): CalqueEntry[] {
  const md = readMd("calque-bank.md");
  const out: CalqueEntry[] = [];
  let cls = "general";
  for (const line of md.split(/\r?\n/)) {
    const h = line.match(/^#{2,3}\s+(?:§)?([A-D])[.\s]*(.*)/);
    if (h) {
      cls = h[2].trim() || h[1];
      continue;
    }
    if (!line.trim().startsWith("|")) continue;
    const c = cells(line);
    if (c.length < 4) continue;
    if (!/^\d+$/.test(c[0])) continue; // numbered rows only
    out.push({
      id: `calque-${c[0]}`,
      bad: c[1],
      good: c[2],
      why: c[3],
      class: cls,
    });
  }
  return out;
}

function parseGlossary(): GlossaryEntry[] {
  const md = readMd("ui-glossary.md");
  const out: GlossaryEntry[] = [];
  for (const line of md.split(/\r?\n/)) {
    if (!line.trim().startsWith("|")) {
      // nav lines like "Home → Bosh sahifa · About → Biz haqimizda"
      for (const m of line.matchAll(/([A-Za-z][A-Za-z0-9 %'’()\/-]{2,40})\s*→\s*([A-Za-zʻʼ][^\n·|]{2,60})/g)) {
        out.push({ en: m[1].trim(), uz: m[2].trim() });
      }
      continue;
    }
    const c = cells(line);
    if (c.length >= 2 && /^[A-Z]/.test(c[0]) && /[a-zʻʼ]/.test(c[1])) {
      out.push({ en: c[0], uz: c[1] });
    }
  }
  return out.filter((g) => g.en.toLowerCase() !== "en" && g.uz.toLowerCase() !== "uz");
}

function parseSynonyms(): SynonymEntry[] {
  const md = readMd("synonym-taste.md");
  const out: SynonymEntry[] = [];
  let context = "general";
  for (const line of md.split(/\r?\n/)) {
    const h = line.match(/^#{2,3}\s+(\d+)\.\s+(.*)/);
    if (h) {
      context = h[2].trim();
      continue;
    }
    if (!line.trim().startsWith("|")) continue;
    const c = cells(line);
    if (c.length < 2) continue;
    const lower = c.map((x) => x.toLowerCase());
    if (lower.includes("prefer") || lower.includes("avoid") || lower.includes("bad")) continue;
    // matrices differ; take the first two lexical columns
    if (/[ʻʼa-z]/i.test(c[0]) && /[ʻʼa-z]/i.test(c[1])) {
      out.push({ avoid: c[0], prefer: c[1], context });
    }
  }
  return out.slice(0, 250);
}

function main(): void {
  fs.mkdirSync(DATA, { recursive: true });
  const calques = parseCalques();
  const glossary = parseGlossary();
  const synonyms = parseSynonyms();
  fs.writeFileSync(path.join(DATA, "calques.json"), JSON.stringify({ generated: new Date().toISOString(), entries: calques }, null, 2), "utf8");
  fs.writeFileSync(path.join(DATA, "glossary.json"), JSON.stringify({ generated: new Date().toISOString(), entries: glossary }, null, 2), "utf8");
  fs.writeFileSync(path.join(DATA, "synonyms.json"), JSON.stringify({ generated: new Date().toISOString(), entries: synonyms }, null, 2), "utf8");
  console.log(`calques: ${calques.length}, glossary: ${glossary.length}, synonyms: ${synonyms.length} → src/data/`);
}

main();
