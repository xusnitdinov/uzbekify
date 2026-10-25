import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { lintLocaleFile, parsePo } from "../src/lib/i18n.js";
import { toSarif } from "../src/lib/sarif.js";
import { lintText } from "../src/lib/lint.js";

function tmpfile(name: string, content: string): string {
  const f = path.join(os.tmpdir(), `uzpro-i18n-${Math.random().toString(36).slice(2)}-${name}`);
  fs.writeFileSync(f, content, "utf8");
  return f;
}

describe("i18n mode (locale files key by key)", () => {
  it("lints a uz.json key by key and skips en.json", async () => {
    const uz = tmpfile("uz.json", JSON.stringify({
      save: "Saqlash",
      bad: "To'g'ri javobni select qiling",
      ok: "Parolni unutdingizmi?",
    }));
    const en = tmpfile("en.json", JSON.stringify({ save: "Save", cancel: "Cancel please, it's fine" }));
    const ru = tmpfile("ru.json", JSON.stringify({ save: "Сохранить" }));

    const r1 = await lintLocaleFile(uz);
    expect(r1.locale).toBe("uz");
    expect(r1.totalKeys).toBe(3);
    expect(r1.keys.map((k) => k.key)).toEqual(["bad"]);

    expect((await lintLocaleFile(en)).lintedKeys).toBe(0);
    expect((await lintLocaleFile(ru)).lintedKeys).toBe(0);
  });

  it("handles nested locale json ({'uz': {...}}) and yaml", async () => {
    const nested = tmpfile("messages.json", JSON.stringify({ uz: { home: "Bosh sahifa", bad: "Karoche, update qilib qoʻy" } }));
    const r = await lintLocaleFile(nested);
    expect(r.locale).toBe("uz");
    expect(r.keys.map((k) => k.key)).toEqual(["bad"]); // keys are relative to the locale subtree

    const yaml = tmpfile("uz.yaml", 'uz:\n  home: "Bosh sahifa"\n  bad: "Mazkur xizmat uchun ariza topshirilishi lozim"\n');
    const ry = await lintLocaleFile(yaml);
    expect(ry.locale).toBe("uz");
    expect(ry.keys[0].findings.some((f) => f.rule === "off.mazkur")).toBe(true);
  });

  it("parses .po msgid/msgstr with continuations", async () => {
    const po = tmpfile("uz.po", [
      'msgid ""',
      'msgstr ""',
      '"Language: uz\\n"',
      "",
      'msgid "Continue"',
      'msgstr "Davom etish"',
      "",
      'msgid "Retry body"',
      'msgstr "Iltimos, update qilib"',
      '"koʻring"',
      "",
    ].join("\n"));
    const r = await lintLocaleFile(po);
    expect(r.totalKeys).toBe(2); // header msgid "" excluded
    const bad = r.keys.find((k) => k.key === "Retry body");
    expect(bad?.findings.length).toBeGreaterThan(0);
    expect(bad?.line).toBeGreaterThan(5);
  });

  it("parsePo handles escapes", () => {
    const rows = parsePo('msgid "a"\nmsgstr "bir\\niki\\n"');
    expect(rows[0].value).toBe("bir\niki\n");
  });
});

describe("SARIF output", () => {
  it("maps findings to SARIF 2.1.0 results with locations", () => {
    const findings = lintText("Salom.\nKaroche, update qilib qoʻy.", {});
    const sarif = toSarif([{ file: "copy/uz.md", findings }]) as any;
    expect(sarif.version).toBe("2.1.0");
    const results = sarif.runs[0].results;
    expect(results.length).toBe(findings.length);
    expect(results[0].ruleId).toBeTruthy();
    expect(["error", "warning", "note"]).toContain(results[0].level);
    expect(results[0].locations[0].physicalLocation.artifactLocation.uri).toBe("copy/uz.md");
    expect(results[0].locations[0].physicalLocation.region.startLine).toBeGreaterThanOrEqual(1);
  });

  it("keyPath becomes a logical location (i18n)", () => {
    const findings = lintText("select qiling", {});
    const sarif = toSarif([{ file: "uz.json", findings, keyPath: "saveButton" }]) as any;
    expect(sarif.runs[0].results[0].locations[0].logicalLocations[0].fullyQualifiedName).toBe("saveButton");
  });
});

describe("generated data files", () => {
  const dataDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../src/data");

  it("calques.json has the full bank (incl. §E-§G phase-4 sections)", () => {
    const d = JSON.parse(fs.readFileSync(path.join(dataDir, "calques.json"), "utf8"));
    expect(d.entries.length).toBeGreaterThanOrEqual(235);
    expect(d.entries.some((e: { bad: string }) => e.bad.includes("minnatdorman"))).toBe(true); // §E
    expect(d.entries.some((e: { bad: string }) => e.bad.includes("amaldagi qonunchilikka"))).toBe(true); // §F
    expect(d.entries.some((e: { bad: string }) => e.bad.includes("ochiladi --"))).toBe(true); // §G
    expect(d.entries.some((e: { good: string }) => e.good.includes("Natija: 30%"))).toBe(true); // §G dash→colon
    expect(d.entries[0]).toHaveProperty("bad");
    expect(d.entries[0]).toHaveProperty("good");
    expect(d.entries[0]).toHaveProperty("why");
  });

  it("glossary.json and synonyms.json parse with entries", () => {
    const g = JSON.parse(fs.readFileSync(path.join(dataDir, "glossary.json"), "utf8"));
    const s = JSON.parse(fs.readFileSync(path.join(dataDir, "synonyms.json"), "utf8"));
    expect(g.entries.length).toBeGreaterThanOrEqual(40);
    expect(s.entries.length).toBeGreaterThanOrEqual(40);
  });

  it("corpus-stats.json carries baselines and frequency data", () => {
    const c = JSON.parse(fs.readFileSync(path.join(dataDir, "corpus-stats.json"), "utf8"));
    expect(c.latinTokens).toBeGreaterThan(10000);
    expect(c.sentenceLength.p95).toBeGreaterThan(15);
    expect(Object.keys(c.wordFreq).length).toBeGreaterThan(100);
    expect(c.collocations.length).toBeGreaterThan(20);
  });
});
