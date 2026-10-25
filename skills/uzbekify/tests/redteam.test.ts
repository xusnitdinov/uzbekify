import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { lintText } from "../src/lib/lint.js";

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../..");

describe("phase-4 red-team set", () => {
  const rows = fs
    .readFileSync(path.join(REPO, "skills/uzbekify/eval/v2/pairs-redteam.jsonl"), "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));

  it("has exactly 100 cases, each labeled with kind and register", () => {
    expect(rows.length).toBe(100);
    const ids = new Set(rows.map((r) => r.id));
    expect(ids.size).toBe(100);
    for (const r of rows) {
      expect(["miss", "fp"]).toContain(r.kind);
      expect(["product", "chat", "youth", "marketing", "news", "legal", "academic", "official", "quiz"]).toContain(r.register);
      expect(["miss", "false-positive"]).toContain(r.initial);
      if (r.kind === "miss") expect(typeof r.bad).toBe("string");
      expect(typeof r.good).toBe("string");
    }
  });

  it("v2 now handles all 100 (misses caught, false-positives clean)", () => {
    for (const r of rows) {
      const allowSen = r.register === "chat" || r.register === "youth";
      const opts = { register: r.register as never, allowSen };
      if (r.kind === "miss") {
        const findings = lintText(r.bad, opts);
        expect(findings.length, `${r.id}: should be caught`).toBeGreaterThan(0);
      } else {
        const findings = lintText(r.good, opts);
        expect(findings, `${r.id}: should be clean (${findings.map((f) => f.rule).join(",")})`).toHaveLength(0);
      }
    }
  });

  it("the human rewrite of every miss-case stays clean in its register", () => {
    for (const r of rows.filter((x) => x.kind === "miss")) {
      const allowSen = r.register === "chat" || r.register === "youth";
      const findings = lintText(r.good, { register: r.register as never, allowSen });
      expect(findings, `${r.id}: good side flagged (${findings.map((f) => f.rule).join(",")})`).toHaveLength(0);
    }
  });
});
