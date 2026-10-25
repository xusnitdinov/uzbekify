/**
 * Screen-consistency family: one-surface checks — jumla/gap stem mixing,
 * literary+chatty clash, repeated imperative stems, Cyrillic leaks (with the
 * Uzbek Cyrillic letters қ ғ ў ҳ that v1 missed), mixed-alphabet tokens.
 */
import { Finding } from "../types.js";

export function lintScreen(text: string): Finding[] {
  const findings: Finding[] = [];

  const hasJumla = /\bjumla\b/i.test(text);
  const hasGap = /\bgap(?:lar|ni|ga|da|dan|imiz|ingiz|si)?\b/i.test(text);
  if (hasJumla && hasGap) {
    findings.push({
      rule: "screen.jumla-gap",
      family: "screen",
      severity: "warn",
      match: "jumla + gap",
      count: 1,
      message: "Mixed stem lexicon: both jumla and gap on one surface — quiz Uzbek prefers gap",
    });
  }

  const literary = /\b(?:mazkur|ushbu|amalga oshirish|taʼminlash|murojaatnomangiz)\b/i.test(text);
  const chatty = /\b(?:xoʻp|mayli|karoche|gap yoʻq|judayam)\b/i.test(text);
  if (literary && chatty) {
    findings.push({
      rule: "screen.literary-chatty",
      family: "screen",
      severity: "warn",
      match: "literary + chatty",
      count: 1,
      message: "Literary officialese and chatty particles on one surface — pick one voice",
    });
  }

  const stems = text.match(/\b(?:belgilang|toping|tanlang|yuboring)\b/gi) ?? [];
  if (stems.length >= 4) {
    const counts = new Map<string, number>();
    for (const s of stems) {
      const k = s.toLowerCase();
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    for (const [k, n] of counts) {
      if (n >= 4) {
        findings.push({
          rule: "screen.repeated-stem",
          family: "screen",
          severity: "info",
          match: k,
          count: n,
          message: `Repeated template stem "${k}" ×${n} on one surface — vary the instructions`,
        });
      }
    }
  }

  // Cyrillic leak — full Cyrillic range incl. Uzbek қ ғ ў ҳ (v1 missed these)
  const cyr = text.match(/[\u0400-\u04FF]{2,}/g);
  if (cyr) {
    findings.push({
      rule: "screen.cyrillic-leak",
      family: "screen",
      severity: "error",
      match: [...new Set(cyr)].slice(0, 3).join(", "),
      count: cyr.length,
      message: "Cyrillic in Latin Uzbek text — transliterate (uzpro translit) or quote deliberately",
    });
  }

  // mixed-alphabet single token (kItgirl words)
  const mixed = text.match(/\b(?=[A-Za-z]*[\u0400-\u04FF])(?=[\u0400-\u04FF]*[A-Za-z])[A-Za-z\u0400-\u04FF]+\b/g);
  if (mixed) {
    findings.push({
      rule: "screen.mixed-alphabet",
      family: "screen",
      severity: "error",
      match: mixed[0],
      count: mixed.length,
      message: "Word mixes Latin and Cyrillic letters — pick one script per word (uzpro translit)",
    });
  }

  return findings;
}
