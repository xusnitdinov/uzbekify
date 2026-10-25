/** Shared text utilities for Uzbek linting. */

export const TURNED = "\u02BB"; // ʻ (oʻ / gʻ)
export const TUTUQ = "\u02BC"; // ʼ (maʼno)

/** Apostrophe-like marks that may appear in the wild (inbound variants). */
export const MARK_CLASS = "['`´\u2018\u2019\u02BB\u02BC]";

const EN_CONTRACTIONS = new RegExp(
  String.raw`\b(?:[Ii]'m|[Ww]e'd|[Yy]ou're|[Tt]hey're|[Ww]ho's|[Ww]hat's|[Ii]t's|[Tt]hat's|[Tt]here's|[Hh]ere's|[Ll]et's|[Oo]ne's|[Ww]on't|[Cc]an't|[Ii]sn't|[Aa]ren't|[Hh]aven't|[Hh]asn't|[Dd]oesn't|[Dd]idn't|[Ss]houldn't|[Ww]ouldn't|[Cc]ouldn't|[Oo]'[Bb]rien|[Oo]'[Cc]onnor|[Dd]on't|[Dd]oesn't)\b`,
  "gi"
);

/** Remove obvious English contractions so they don't trip apostrophe rules. */
export function stripEnglishContractions(text: string): string {
  return text.replace(EN_CONTRACTIONS, " ");
}

/** Does the text look like it contains real Uzbek? (Latin or Cyrillic Uzbek letters / common words) */
export function looksUzbek(text: string): boolean {
  if (/[ʻʼ]/.test(text)) return true;
  if (/[\u04E0\u04E1\u04E2\u04E3\u04EE\u04EF\u04B2\u04B3]/.test(text)) return true; // қ ғ ў ҳ
  const lower = text.toLowerCase();
  return (
    /\b(?:va|bir|boʻl|edi|emas|uchun|bilan|ham|lekin|agar|yoki|bor|yoʻq|kerak|juda|mana|endi|mayli|xoʻp|iltimos|qiling|belgilang|saqlash)\b/.test(
      lower
    ) ||
    /\b\w+(?:di|gan|moq|ish|lik|lar|larda|dan|ga)\b/.test(lower) === false
  );
}

export interface Sentence {
  text: string;
  words: string[];
}

/** Split into sentences on . ! ? … and newlines (JSON values often have no periods). */
export function splitSentences(text: string): Sentence[] {
  return text
    .split(/(?<=[.!?…])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => ({ text: s, words: s.split(/\s+/).filter(Boolean) }));
}

/** Uzbek word tokens (Latin script, may contain ʻ ʼ). */
export function uzbekWords(text: string): string[] {
  return text.match(/[A-Za-zʻʼ]+/g) ?? [];
}

/** Total word count (any script) for density math. */
export function wordCount(text: string): number {
  return (text.match(/[\p{L}\p{N}]+/gu) ?? []).length;
}

/** Back vowels (suffix takes -lar after these; -ler is essentially nonstandard). */
const BACK_VOWELS = new Set(["a", "o", "u", "e"]); // note: e counted separately below

export function lastVowel(word: string): string | null {
  const w = word.toLowerCase();
  for (let i = w.length - 1; i >= 0; i--) {
    const c = w[i];
    if ("aeiouʻ".includes(c) && c !== "ʻ") return c;
  }
  return null;
}

/** True when the last vowel of the stem is a back vowel (a, o, u) — plural must be -lar. */
export function stemIsBackVowel(stem: string): boolean {
  const v = lastVowel(stem);
  return v === "a" || v === "o" || v === "u";
}

/** Collect all matches of a global regex (each match string, deduplicated with counts). */
export function countMatches(text: string, re: RegExp): { total: number; samples: string[] } {
  const rx = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  const seen = new Map<string, number>();
  let m: RegExpExecArray | null;
  while ((m = rx.exec(text)) !== null) {
    const key = m[0];
    seen.set(key, (seen.get(key) ?? 0) + 1);
    if (m.index === rx.lastIndex) rx.lastIndex++; // zero-width guard
  }
  const entries = [...seen.entries()].sort((a, b) => b[1] - a[1]);
  return { total: entries.reduce((s, e) => s + e[1], 0), samples: entries.map((e) => e[0]) };
}

export { BACK_VOWELS };
