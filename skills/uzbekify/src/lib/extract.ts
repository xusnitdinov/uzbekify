/**
 * Extract Uzbek-facing text from bilingual / i18n source for linting.
 * Ported from v1 extract-uzbek.mjs: keeps tx()/t() FIRST string arg, "uz": JSON
 * values, ## Matn blocks; skips en/ru locale values; skips en-locale file paths.
 */

function unescapeStr(s: string): string {
  return s
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, "\\");
}

export interface ExtractResult {
  text: string;
  skipped: "en-locale-path" | null;
}

export function extractUzbekForLint(
  text: string,
  opts: { filePath?: string } = {}
): ExtractResult {
  const lower = (opts.filePath ?? "").replace(/\\/g, "/").toLowerCase();
  if (/(^|\/)en(\.json|\.ya?ml|\/)|locales\/en|messages\/en|\/en-us\b/.test(lower)) {
    return { text: "", skipped: "en-locale-path" };
  }

  const chunks: string[] = [];

  // tx("uz…", "en…") / t("…") — keep first string arg only
  const callRe = /\b(?:tx|t|i18n\.t)\(\s*(["'`])((?:\\.|(?!\1).)*)\1/g;
  let m: RegExpExecArray | null;
  while ((m = callRe.exec(text))) chunks.push(unescapeStr(m[2]));

  // "uz": "…", 'uz-UZ': '…'
  const uzKeyRe =
    /(["'])(?:uz|uz-UZ|uz_Latn|o['ʻʼ]?zbek(?:cha)?)\1\s*:\s*(["'])((?:\\.|(?!\2).)*)\2/gi;
  while ((m = uzKeyRe.exec(text))) chunks.push(unescapeStr(m[3]));

  // ## Matn blocks
  const parts = text.split(/^##\s+/m);
  for (const part of parts) {
    if (/^Matn\b/i.test(part.trim())) {
      chunks.push(part.replace(/^Matn[^\n]*\n?/i, ""));
    }
  }

  if (chunks.length) return { text: chunks.join("\n"), skipped: null };

  // Strip obvious EN/RU locale value lines, then lint remainder
  const stripped = text
    .replace(
      /(["'])(?:en|en-US|en-GB|ru|ru-RU)\1\s*:\s*(["'])(?:\\.|(?!\2).)*\2/gi,
      ""
    )
    .replace(
      /\b(?:tx|t|i18n\.t)\(\s*(["'`])(?:\\.|(?!\1).)*\1\s*((?:,\s*(["'`])(?:\\.|(?!\3).)*\3)+)/g,
      (full: string) => {
        const first = full.match(/\b(?:tx|t|i18n\.t)\(\s*(["'`])((?:\\.|(?!\1).)*)\1/);
        return first ? first[0] + ")" : full;
      }
    );

  return { text: stripped, skipped: null };
}

/** Extract the ## Matn section from a skill-output style markdown file. */
export function extractMatn(text: string): string {
  const blocks: string[] = [];
  const parts = text.split(/^##\s+/m);
  for (const part of parts) {
    if (/^Matn\b/i.test(part.trim())) {
      blocks.push(part.replace(/^Matn[^\n]*\n?/i, ""));
    }
  }
  return blocks.length ? blocks.join("\n") : text;
}
