/**
 * i18n mode: lint locale files key by key (JSON, YAML, PO).
 *
 * Values are linted individually so findings carry the key path; locale keys
 * (msgid / JSON keys) are never linted, and non-Uzbek locales are skipped
 * unless the file looks Uzbek (uz.* name or uz meta).
 */
import fs from "node:fs";
import { lintText } from "./lint.js";
import type { Finding, LintOptions } from "./types.js";


export interface KeyFinding {
  key: string;
  value: string;
  line?: number;
  findings: Finding[];
}

export interface I18nReport {
  file: string;
  locale: string;
  totalKeys: number;
  lintedKeys: number;
  keys: KeyFinding[];
}

/** Minimal gettext .po parser: msgid/msgstr pairs with line numbers. */
export function parsePo(text: string): { key: string; value: string; line: number }[] {
  const out: { key: string; value: string; line: number }[] = [];
  let key: string | null = null;
  let value: string | null = null;
  let keyLine = 1;
  let line = 1;
  for (const rawLine of text.split(/\r?\n/)) {
    const m = rawLine.match(/^(msgid|msgstr)\s+"((?:[^"\\]|\\.)*)"\s*$/);
    if (m) {
      if (m[1] === "msgid") {
        if (key !== null && value !== null && key !== "") out.push({ key, value, line: keyLine });
        key = m[2];
        value = null;
        keyLine = line;
      } else if (key !== null) {
        value = m[2];
      }
    } else if (/^"/.test(rawLine.trim()) && key !== null && value !== null) {
      // continuation line
      const cont = rawLine.trim().match(/^"((?:[^"\\]|\\.)*)"$/);
      if (cont) value += (value.endsWith(" ") || cont[1].startsWith(" ") ? "" : " ") + cont[1];
    }
    line++;
  }
  if (key !== null && value !== null && key !== "") out.push({ key, value, line: keyLine });
  return out.map((e) => ({
    ...e,
    value: e.value.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\"),
  }));
}

function flattenJson(obj: unknown, prefix = ""): { key: string; value: string }[] {
  const out: { key: string; value: string }[] = [];
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const p = prefix ? `${prefix}.${k}` : k;
      if (typeof v === "string") out.push({ key: p, value: v });
      else if (v && typeof v === "object") out.push(...flattenJson(v, p));
    }
  }
  return out;
}

function looksUzbek(values: string[]): boolean {
  const sample = values.slice(0, 40).join(" ");
  return (
    /[ʻʼ]/.test(sample) ||
    /\b(?:va|bilan|uchun|boʻl|emas|kerak|ham|lekin|agar|yoki|iltimos|saqlash|chiqish|kirish|soni|narx)\b/i.test(sample)
  );
}

export async function lintLocaleFile(
  filePath: string,
  opts: LintOptions = {}
): Promise<I18nReport> {
  const raw = fs.readFileSync(filePath, "utf8");
  const ext = filePath.split(".").pop()?.toLowerCase() ?? "";
  let entries: { key: string; value: string; line?: number }[] = [];
  let locale = "";

  const base = filePath.replace(/\\/g, "/").toLowerCase();
  const localeMatch = base.match(/(?:^|\/)([a-z]{2}(?:[-_][a-z]{2})?)\.(?:json|ya?ml|po)$/);
  if (localeMatch) locale = localeMatch[1];

  if (ext === "po") {
    entries = parsePo(raw);
    const meta = raw.match(/"Language:\s*([a-z-]+)"/i);
    if (meta) locale = meta[1];
  } else if (ext === "json") {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }
    // locale-shaped files: {"key": "value"} or {"uz": {"key": "value"}}
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const rec = parsed as Record<string, unknown>;
      const firstLevelLocale = Object.keys(rec).find(
        (k) => /^[a-z]{2}(-[A-Za-z]{2})?$/.test(k) && rec[k] && typeof rec[k] === "object"
      );
      if (firstLevelLocale) {
        locale = firstLevelLocale;
        entries = flattenJson(rec[firstLevelLocale]);
      } else {
        entries = flattenJson(rec);
      }
    }
  } else {
    // yaml/yml (dynamic import keeps lint startup fast and offline-friendly)
    const { default: YAML } = await import("yaml");
    const parsed = YAML.parse(raw) as unknown;
    if (parsed && typeof parsed === "object") {
      const rec = parsed as Record<string, unknown>;
      const firstLevelLocale = Object.keys(rec).find(
        (k) => /^[a-z]{2}(-[A-Za-z]{2})?$/.test(k) && rec[k] && typeof rec[k] === "object"
      );
      if (firstLevelLocale) {
        locale = firstLevelLocale;
        entries = flattenJson(rec[firstLevelLocale]);
      } else {
        entries = flattenJson(rec);
      }
    }
  }

  const isUzbekFile =
    locale.startsWith("uz") ||
    base.includes("uzbek") ||
    looksUzbek(entries.map((e) => e.value));

  if (!isUzbekFile) {
    return { file: filePath, locale: locale || "unknown", totalKeys: entries.length, lintedKeys: 0, keys: [] };
  }

  const keys: KeyFinding[] = [];
  for (const e of entries) {
    const findings = lintText(e.value, opts);
    if (findings.length) keys.push({ key: e.key, value: e.value, line: e.line, findings });
  }
  return {
    file: filePath,
    locale: locale || "uz",
    totalKeys: entries.length,
    lintedKeys: entries.length,
    keys,
  };
}
