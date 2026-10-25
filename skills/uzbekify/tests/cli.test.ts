import { describe, expect, it } from "vitest";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const CLI = path.resolve(process.cwd(), "dist/cli.js");

function tmp(content: string): string {
  const f = path.join(os.tmpdir(), `uzpro-test-${Math.random().toString(36).slice(2)}.txt`);
  fs.writeFileSync(f, content, "utf8");
  return f;
}

describe("uzpro CLI integration", () => {
  it("lint exits 1 with findings and 0 when clean", () => {
    const bad = tmp("Karoche, update qilib qoʻy.");
    const r1 = spawnSync(process.execPath, [CLI, "lint", bad], { encoding: "utf8" });
    expect(r1.status).toBe(1);
    expect(r1.stdout + r1.stderr).toContain("ru.karoche");
    const good = tmp("Bu ilova menga juda yoqadi.");
    const r2 = spawnSync(process.execPath, [CLI, "lint", good], { encoding: "utf8" });
    expect(r2.status).toBe(0);
  });

  it("lint --json emits parseable JSON", () => {
    const bad = tmp("select qiling");
    const r = spawnSync(process.execPath, [CLI, "lint", bad, "--json"], { encoding: "utf8" });
    const data = JSON.parse(r.stdout);
    expect(data.findings.length).toBeGreaterThan(0);
    expect(typeof data.score).toBe("number");
  });

  it("normalize fixes apostrophes via --write", () => {
    const f = tmp("to'g'ri javob");
    spawnSync(process.execPath, [CLI, "normalize", f, "--write"], { encoding: "utf8" });
    expect(fs.readFileSync(f, "utf8")).toBe("toʻgʻri javob");
  });

  it("normalize --check exits 1 when it would change", () => {
    const f = tmp("to'g'ri");
    const r = spawnSync(process.execPath, [CLI, "normalize", f, "--check"], { encoding: "utf8" });
    expect(r.status).toBe(1);
  });

  it("translit converts Cyrillic to Latin and back", () => {
    const f = tmp("Тошкент — маъно");
    const r = spawnSync(process.execPath, [CLI, "translit", f], { encoding: "utf8" });
    expect(r.stdout.trim()).toBe("Toshkent — maʼno");
    const f2 = tmp("Toshkent");
    const r2 = spawnSync(process.execPath, [CLI, "translit", f2, "--to", "cyrillic"], { encoding: "utf8" });
    expect(r2.stdout.trim()).toBe("Тошкент");
  });

  it("score prints a 0-100 verdict and gates with --min", () => {
    const good = tmp("Bu ilova menga juda yoqadi.");
    const r = spawnSync(process.execPath, [CLI, "score", good, "--min", "90"], { encoding: "utf8" });
    expect(r.status).toBe(0);
    expect(r.stdout).toMatch(/Naturalness: \d+\/100/);
    const bad = tmp("Karoche, ship qilaylik, vibe zoʻr");
    const r2 = spawnSync(process.execPath, [CLI, "score", bad, "--min", "90"], { encoding: "utf8" });
    expect(r2.status).toBe(1);
  });

  it("diff marks changes", () => {
    const a = tmp("mening eski matnim");
    const b = tmp("mening yangi matnim");
    const r = spawnSync(process.execPath, [CLI, "diff", a, b], { encoding: "utf8" });
    expect(r.stdout).toContain("{+yangi+}");
    expect(r.stdout).toContain("{-eski-}");
  });

  it("reads stdin with -", () => {
    const r = spawnSync(process.execPath, [CLI, "lint", "-"], {
      input: "select qiling",
      encoding: "utf8",
    });
    expect(r.status).toBe(1);
  });

  it("--format sarif emits valid SARIF JSON", () => {
    const f = tmp("Karoche, update qilib qoʻy.");
    const r = spawnSync(process.execPath, [CLI, "lint", f, "--format", "sarif"], { encoding: "utf8" });
    expect(r.status).toBe(1);
    const sarif = JSON.parse(r.stdout);
    expect(sarif.version).toBe("2.1.0");
    expect(sarif.runs[0].results.length).toBeGreaterThan(0);
  });

  it("batch mode lints a directory and reports per file", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "uzpro-batch-"));
    fs.writeFileSync(path.join(dir, "a.txt"), "Bu ilova menga juda yoqadi.", "utf8");
    fs.writeFileSync(path.join(dir, "b.txt"), "Karoche, update qilib qoʻy.", "utf8");
    const r = spawnSync(process.execPath, [CLI, "lint", dir], { encoding: "utf8" });
    expect(r.status).toBe(1);
    expect(r.stdout).toContain("a.txt");
    expect(r.stderr).toContain("b.txt");
    expect(r.stderr).toContain("ru.karoche");
  });

  it("--i18n lints locale files key by key", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "uzpro-i18n-"));
    fs.writeFileSync(path.join(dir, "uz.json"), JSON.stringify({ ok: "Saqlash", bad: "select qiling" }), "utf8");
    fs.writeFileSync(path.join(dir, "en.json"), JSON.stringify({ ok: "Save" }), "utf8");
    const r = spawnSync(process.execPath, [CLI, "lint", dir, "--i18n"], { encoding: "utf8" });
    expect(r.status).toBe(1);
    expect(r.stderr).toContain("bad");
    expect(r.stderr).toContain("calque.en-qil");
    expect(r.stdout).toContain("en.json");
  });

  it("usage errors exit 2", () => {
    const r = spawnSync(process.execPath, [CLI], { encoding: "utf8" });
    expect(r.status).toBe(2);
  });
});

describe("examples stay clean", () => {
  const dir = () => path.resolve(process.cwd(), "skills/uzbekify/examples");

  it("copy examples pass lint (product-ui, quiz, marketing)", () => {
    for (const f of ["product-ui.md", "quiz.md", "marketing.md"]) {
      const r = spawnSync(process.execPath, [CLI, "lint", path.join(dir(), f)], {
        encoding: "utf8",
      });
      expect(r.status, `${f}: ${r.stdout}${r.stderr}`).toBe(0);
    }
  });

  it("agent prompts and transcripts exist and are non-trivial", () => {
    for (const f of ["agent-prompts.md", "transcript-humanize.md", "transcript-mcp.md"]) {
      const p = path.join(dir(), f);
      expect(fs.existsSync(p), f).toBe(true);
      expect(fs.readFileSync(p, "utf8").length).toBeGreaterThan(300);
    }
  });
});

describe("eval data integrity", () => {
  it("v1 eval sets are ported completely", () => {
    const v1dir = path.resolve(process.cwd(), "skills/uzbekify/eval/v1");
    const files = fs.readdirSync(v1dir);
    expect(files).toContain("cases.jsonl");
    expect(files).toContain("goldens.json");
    expect(files).toContain("trigger-queries.json");
    const cases = fs.readFileSync(path.join(v1dir, "cases.jsonl"), "utf8").trim().split("\n");
    expect(cases.length).toBe(226);
  });

  it("v2 pairs exceed 300 with unique ids", () => {
    const dir = path.resolve(process.cwd(), "skills/uzbekify/eval/v2");
    const ids = new Set<string>();
    let n = 0;
    for (const f of fs.readdirSync(dir)) {
      for (const line of fs.readFileSync(path.join(dir, f), "utf8").split("\n").filter(Boolean)) {
        const row = JSON.parse(line);
        expect(ids.has(row.id)).toBe(false);
        ids.add(row.id);
        n++;
      }
    }
    expect(n).toBeGreaterThanOrEqual(300);
  });
});
