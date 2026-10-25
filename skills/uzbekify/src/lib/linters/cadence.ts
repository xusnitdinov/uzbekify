/**
 * Cadence family: rhythm/prosody — monotone sentence lengths, template-word
 * overuse, repeated trigrams and sentence openers, abstract noun stacks,
 * overlong sentences.
 */
import { Finding, LintOptions } from "../types.js";
import { splitSentences, uzbekWords } from "../text.js";

export function lintCadence(text: string, opts: LintOptions = {}): Finding[] {
  const findings: Finding[] = [];
  const sentences = splitSentences(text);
  const totalWords = uzbekWords(text).length;

  // monotone run: 5+ near-identical sentence lengths (needs ≥6 sentences,
  // and only when sentences are long enough — quiz stems are uniformly short by design)
  const avgLen = sentences.length ? sentences.reduce((s2, x) => s2 + x.words.length, 0) / sentences.length : 0;
  if (sentences.length >= 6 && avgLen > 6) {
    const lens = sentences.map((s) => s.words.length);
    let monoRun = 1;
    let hit = false;
    for (let i = 1; i < lens.length; i++) {
      monoRun = Math.abs(lens[i] - lens[i - 1]) <= 1 ? monoRun + 1 : 1;
      if (monoRun >= 5) {
        hit = true;
        break;
      }
    }
    if (hit) {
      findings.push({
        rule: "cadence.monotone",
        family: "cadence",
        severity: "warn",
        match: `${lens.slice(0, 6).join(", ")}…`,
        count: 1,
        message: "Monotone cadence: 5+ sentences of near-identical length — vary the rhythm (short punch + longer line)",
      });
    }
  }

  // template-word overuse: same word ≥6 times in a text of ≥40 words
  if (totalWords >= 40) {
    const counts = new Map<string, number>();
    for (const w of uzbekWords(text)) {
      const k = w.toLowerCase();
      if (k.length < 4) continue;
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    const overused = [...counts.entries()].filter(([, n]) => n >= 6);
    for (const [word, n] of overused.slice(0, 3)) {
      findings.push({
        rule: "cadence.template-word",
        family: "cadence",
        severity: "info",
        match: word,
        count: n,
        message: `"${word}" appears ${n} times — template repetition; vary or cut`,
      });
    }
  }

  // repeated 3-word phrase (officialese echo: "birinchi navbatda ×3")
  if (totalWords >= 8) {
    const words = uzbekWords(text).map((w) => w.toLowerCase());
    const grams = new Map<string, number>();
    for (let i = 0; i + 3 <= words.length; i++) {
      const g = words.slice(i, i + 3).join(" ");
      grams.set(g, (grams.get(g) ?? 0) + 1);
    }
    let repeated = [...grams.entries()].find(([, n]) => n >= 3);
    if (!repeated) {
      // long bigram echo (>=12 chars): "birinchi navbatda" x3
      const bigrams = new Map<string, number>();
      for (let i = 0; i + 2 <= words.length; i++) {
        const g = words.slice(i, i + 2).join(" ");
        if (g.length >= 12) bigrams.set(g, (bigrams.get(g) ?? 0) + 1);
      }
      repeated = [...bigrams.entries()].find(([, n]) => n >= 3);
    }
    if (repeated) {
      findings.push({
        rule: "cadence.repeated-phrase",
        family: "cadence",
        severity: "warn",
        match: repeated[0],
        count: repeated[1],
        message: `"${repeated[0]}" repeated ${repeated[1]} times — template echo; restructure`,
      });
    }
  }

  // repeated sentence openers (≥3 sentences starting with the same word, ≥5 sentences total)
  if (sentences.length >= 5) {
    const openers = new Map<string, number>();
    for (const s of sentences) {
      const first = s.words[0]?.toLowerCase().replace(/[.!?…,;:]+$/, "");
      if (!first || first.length < 3) continue;
      openers.set(first, (openers.get(first) ?? 0) + 1);
    }
    for (const [word, n] of openers) {
      if (n >= 3) {
        findings.push({
          rule: "cadence.repeated-opener",
          family: "cadence",
          severity: "warn",
          match: word,
          count: n,
          message: `${n} sentences start with "${word}" — restructure or merge`,
        });
      }
    }
  }

  // abstract noun stack (v1 parity, extended)
  const ABSTRACT = "(?:taʼminlash|amalga oshirish|jarayon|holat|imkoniyat|funksional|faoliyat|vazifalar|choralar)";
  const stackRe = new RegExp(`\\b${ABSTRACT}\\b(?:\\s+\\b${ABSTRACT}\\b){2,}`, "i");
  const stack = text.match(stackRe);
  if (stack) {
    findings.push({
      rule: "cadence.abstract-stack",
      family: "cadence",
      severity: "warn",
      match: stack[0],
      count: 1,
      message: "Abstract noun stack: 3+ bureaucratic nouns in a row — say who does what",
    });
  }

  // overlong sentences
  const longLimit = opts.register === "academic" || opts.register === "legal" ? 40 : 28;
  const longs = sentences.filter((s) => s.words.length > longLimit);
  if (longs.length) {
    findings.push({
      rule: "cadence.long-sentence",
      family: "cadence",
      severity: "info",
      match: `${longs[0].words.length} words`,
      count: longs.length,
      message: `Sentence(s) over ${longLimit} words — split for readability`,
    });
  }

  return findings;
}
