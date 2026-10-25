/**
 * Regression guards for the skill's own documentation: example OUTPUTS must
 * obey hard rule "no dashes", numbered rule lists must not repeat a number,
 * and known typos must not come back.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { lintAitell } from "../src/lib/linters/aitell.js";

const SKILL = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const read = (rel: string) => readFileSync(path.join(SKILL, rel), "utf8");
const DASH_RULE = /^aitell\.(em-dash|en-dash|spaced-hyphen|double-hyphen|leading-hyphen-dash)/;
const dashFindings = (s: string) => lintAitell(s).filter((f) => DASH_RULE.test(f.rule));

function mdFiles(): string[] {
  const out = ["SKILL.md"];
  for (const dir of ["references", "playbooks", "examples"]) {
    for (const f of readdirSync(path.join(SKILL, dir))) if (f.endsWith(".md")) out.push(`${dir}/${f}`);
  }
  return out;
}

describe("skill docs", () => {
  it("no 'foyydalanuvchi' typo anywhere in the skill", () => {
    for (const f of [...mdFiles(), "src/data/calques.json"]) {
      expect(read(f), f).not.toMatch(/foyydalanuvchi/);
    }
  });

  it("rewrite-ladder hard rules are numbered 1..n without repeats", () => {
    const md = read("references/rewrite-ladder.md");
    const section = md.split("## Hard rules")[1].split("\n## ")[0];
    const nums = [...section.matchAll(/^(\d+)\. /gm)].map((m) => Number(m[1]));
    expect(nums.length).toBeGreaterThan(5);
    expect(nums).toEqual(nums.map((_, i) => i + 1));
  });

  it("register-preset examples are dash-free", () => {
    const md = read("references/register-presets.md");
    const lines = md.split("\n").filter((l) => /^\s+\d+\. /.test(l));
    expect(lines.length).toBeGreaterThan(50);
    for (const l of lines) {
      const ex = l.replace(/^\s+\d+\. /, "");
      expect(dashFindings(ex).map((f) => f.rule), ex).toEqual([]);
    }
  });

  it("playbook Good outputs are dash-free", () => {
    for (const f of ["playbooks/translation-en-ru.md", "playbooks/ui-microcopy.md", "playbooks/marketing.md"]) {
      const md = read(f);
      const goods = [...md.matchAll(/→\s*\n?\s*"([^"]+)"/g)];
      expect(goods.length, f).toBeGreaterThan(0);
      for (const m of goods) {
        expect(dashFindings(m[1]).map((x) => x.rule), `${f}: ${m[1]}`).toEqual([]);
      }
    }
    expect(read("playbooks/ui-microcopy.md")).not.toMatch(/Saqlab boʻlmadi —/);
  });

  it("output templates use hyphen ranges, not en dashes", () => {
    expect(read("SKILL.md")).not.toMatch(/2–5 namuna/);
    expect(read("references/rewrite-ladder.md")).not.toMatch(/2–5 namuna|— qisqacha/);
  });
});
