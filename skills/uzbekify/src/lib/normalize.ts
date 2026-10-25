/**
 * Normalize Uzbek Latin apostrophe-like characters (v1-compatible, extended).
 *
 * oʻ/gʻ → U+02BB (ʻ); tutuq → U+02BC (ʼ).
 * Digraphs are protected before tutuq passes so `toʻgʻri` never becomes `toʼgʻri`.
 * English segments (contractions, code, URLs, placeholders, 2nd+ tx() args,
 * en/ru JSON values) are protected. Inbound 2026-reform letters (ö/õ/ó/ò/ō, ğ,
 * ş, ç) map to the current alphabet; output never emits ö/ğ/ş/ç.
 * Brand + ALL-CAPS tokens followed by a case suffix stay tutuq (`Goʼda`,
 * `PUBGʼga`), never an oʻ/gʻ digraph.
 */
import { TURNED, TUTUQ } from "./text.js";

const MARK = "['`´\u2018\u2019\u02BB\u02BC]";
const RAW_MARK = "['`´\u2018\u2019\u02BC]";
const DIGRAPH_PH = "\u0000DG\u0000";

/** Longer suffixes first so `dagi` is not eaten as `da`. */
const CASE_SUFFIX =
  "dagi|dan|dek|day|ning|ni|lari|larini|larni|lar|cha|ga|ka|qa|mi|da";

/** Brands whose final letter must not become oʻ/gʻ before a suffix. */
const BRAND_SRC =
  "Go|PUBG|Uzum|Payme|Click|Telegram|Instagram|Google|YouTube|Netflix|Spotify|Humo|HUMO";

/** English contractions / names we must not rewrite. */
const EN_SKIP_SRC = String.raw`\b(?:[Ii]'m|[Ww]e'd|[Yy]ou're|[Tt]hey're|[Ww]ho's|[Ww]hat's|[Ii]t's|[Tt]hat's|[Tt]here's|[Hh]ere's|[Ll]et's|[Ww]on't|[Cc]an't|[Dd]on't|[Ii]sn't|[Aa]ren't|[Hh]aven't|[Hh]asn't|[Dd]oesn't|[Dd]idn't|[Ss]houldn't|[Ww]ouldn't|[Cc]ouldn't|[Oo]'[Bb]rien|[Oo]'[Cc]onnor)\b`;

interface Stash {
  saved: string[];
  push(m: string): string;
  restore(text: string): string;
}

function makeStash(): Stash {
  const saved: string[] = [];
  return {
    saved,
    push(m: string) {
      saved.push(m);
      return `\u0000P${saved.length - 1}\u0000`;
    },
    restore(text: string) {
      return text.replace(/\u0000P(\d+)\u0000/g, (_, i) => saved[Number(i)]);
    },
  };
}

/** Inbound only: ö õ ó ò ō → oʻ, ğ → gʻ, ş → sh, ç → ch. Never emits reform letters. */
export function mapReformInbound(text: string): string {
  let out = text;
  out = out.replace(/[ÖÕÓÒŌ]/g, `O${TURNED}`);
  out = out.replace(/[öõóòō]/g, `o${TURNED}`);
  out = out.replace(/Ğ/g, `G${TURNED}`);
  out = out.replace(/ğ/g, `g${TURNED}`);
  out = out.replace(/Ş/g, (_m: string, i: number, s: string) =>
    /[A-Z]/.test(s[i + 1] ?? "") ? "SH" : "Sh"
  );
  out = out.replace(/ş/g, "sh");
  out = out.replace(/Ç/g, (_m: string, i: number, s: string) =>
    /[A-Z]/.test(s[i + 1] ?? "") ? "CH" : "Ch"
  );
  out = out.replace(/ç/g, "ch");
  return out;
}

/** Apostrophe before a suffix on a brand or ALL-CAPS token is tutuq, not oʻ/gʻ. */
function protectBrandSuffixes(text: string, stash: Stash): string {
  const boundary = `(?<![A-Za-z´'\`\u2018\u2019${TURNED}${TUTUQ}])`;
  let out = text.replace(
    new RegExp(`${boundary}(${BRAND_SRC})${MARK}(${CASE_SUFFIX})\\b`, "gi"),
    (_m, brand: string, suf: string) => stash.push(`${brand}${TUTUQ}${suf}`)
  );
  out = out.replace(
    new RegExp(`${boundary}([A-Z]{2,})${MARK}(${CASE_SUFFIX})\\b`, "g"),
    (_m, token: string, suf: string) => stash.push(`${token}${TUTUQ}${suf}`)
  );
  return out;
}

function protectDigraphs(text: string): { out: string; saved: string[] } {
  const saved: string[] = [];
  const out = text.replace(new RegExp(`([OoGg])${TURNED}`, "g"), (m) => {
    saved.push(m);
    return `${DIGRAPH_PH}${saved.length - 1}${DIGRAPH_PH}`;
  });
  return { out, saved };
}

function restoreDigraphs(text: string, saved: string[]): string {
  return text.replace(
    new RegExp(`${DIGRAPH_PH}(\\d+)${DIGRAPH_PH}`, "g"),
    (_, i) => saved[Number(i)]
  );
}

/** Normalize apostrophe-like characters to the canonical Uzbek Latin convention. */
export function normalize(text: string): string {
  const stash = makeStash();
  let out = text;

  // 0) protect zones that should never be normalized
  out = out.replace(/```[\s\S]*?```/g, stash.push); // fenced code
  out = out.replace(/`[^`\n]+`/g, stash.push); // inline code
  out = out.replace(/\bhttps?:\/\/[^\s)]+/gi, stash.push); // URLs
  out = out.replace(/\b[a-z][a-z0-9+.-]*:\/\/[^\s)]+/gi, stash.push); // scheme URLs
  out = out.replace(/\{[A-Za-z0-9_.:-]+\}/g, stash.push); // {count} placeholders
  out = out.replace(/%\([A-Za-z0-9_.:-]+\)s/g, stash.push); // python-style placeholder
  out = out.replace(/%[sdif]/g, stash.push); // printf placeholders

  // 1) 2nd+ quoted args inside tx/t/i18n.t
  out = out.replace(/\b(?:tx|t|i18n\.t)\(([^)]*)\)/g, (full, inner: string) => {
    const argRe = /(["'`])((?:\\.|(?!\1).)*)\1/g;
    const pieces: { start: number; end: number; raw: string }[] = [];
    let am: RegExpExecArray | null;
    while ((am = argRe.exec(inner))) {
      pieces.push({ start: am.index, end: am.index + am[0].length, raw: am[0] });
    }
    if (pieces.length < 2) return full;
    let rebuilt = inner;
    for (let p = pieces.length - 1; p >= 1; p--) {
      const piece = pieces[p];
      rebuilt = rebuilt.slice(0, piece.start) + stash.push(piece.raw) + rebuilt.slice(piece.end);
    }
    return full.slice(0, full.indexOf("(") + 1) + rebuilt + ")";
  });

  // 2) en/ru JSON values
  out = out.replace(
    /(["'])(?:en|en-US|en-GB|ru|ru-RU)\1\s*:\s*(["'])(?:\\.|(?!\2).)*\2/gi,
    stash.push
  );

  // 3) EN contractions
  out = out.replace(new RegExp(EN_SKIP_SRC, "gi"), stash.push);

  out = mapReformInbound(out);
  out = protectBrandSuffixes(out, stash);

  // 1) o'/g' digraphs → TURNED (ASCII, curly, acute, or mixed)
  out = out.replace(new RegExp(`([OoGg])${MARK}`, "g"), `$1${TURNED}`);

  // 2) freeze digraphs so tutuq never rewrites oʻ / gʻ
  const dig = protectDigraphs(out);
  out = dig.out;

  // 3) tutuq: vowel + mark + letter (ma'no, a'lo)
  out = out.replace(
    new RegExp(`([AaEeIiOoUu])${MARK}([A-Za-zÀ-ÿ${TURNED}${TUTUQ}])`, "g"),
    (_m, a: string, b: string) => `${a}${TUTUQ}${b}`
  );

  // 4) consonant tutuq sites: san'at, mas'ul, qat'iy, jam'i, …
  out = out.replace(
    new RegExp(
      `\\b([Ss]an|[Mm]as|[Qq]at|[Jj]am|[Aa]'?z|[Mm]ehn|[Ii]nsho)${MARK}([A-Za-z${TURNED}${TUTUQ}])`,
      "g"
    ),
    (_m, stem: string, rest: string) => `${stem.replace(/'/g, "")}${TUTUQ}${rest}`
  );

  // 5) remaining consonant + mark + vowel
  out = out.replace(
    new RegExp(
      `([NnMmLlRrTtDdSsZzKkQqGgHhPpBbVvYyJjXxCcFfWw])${MARK}([AaEeIiOoUu])`,
      "g"
    ),
    (_m, c: string, v: string) => `${c}${TUTUQ}${v}`
  );

  // 6) leftover non-digraph mark before a case suffix: tool'da, edittools'da
  out = out.replace(
    new RegExp(`([A-Za-z])${RAW_MARK}(${CASE_SUFFIX})\\b`, "g"),
    (_m, stem: string, suf: string) => `${stem}${TUTUQ}${suf}`
  );

  out = restoreDigraphs(out, dig.saved);
  out = stash.restore(out);
  return out;
}

export interface OrthographyIssue {
  issue: string;
  samples: string[];
}

/** Residual orthography problems that normalization cannot auto-fix. */
export function lintReport(text: string): OrthographyIssue[] {
  const issues: OrthographyIssue[] = [];
  const residual = text.replace(new RegExp(EN_SKIP_SRC, "gi"), "");
  const ascii = residual.match(/[A-Za-z]'[A-Za-z]/g);
  if (ascii)
    issues.push({
      issue: "ASCII apostrophe ' found inside a word",
      samples: [...new Set(ascii)].slice(0, 5),
    });
  const curly = text.match(/[`\u2018\u2019][A-Za-z]|[A-Za-z][`\u2018\u2019]/g);
  if (curly)
    issues.push({
      issue: "curly/grave quote mark found",
      samples: [...new Set(curly)].slice(0, 5),
    });
  const digTutuq = text.match(/[OoGg]\u02BC[A-Za-z]?/g);
  if (digTutuq)
    issues.push({
      issue: "o/g digraph uses tutuq ʼ — should be ʻ (U+02BB)",
      samples: [...new Set(digTutuq)].slice(0, 5),
    });
  return issues;
}
