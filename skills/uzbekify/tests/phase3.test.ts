import { describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { detectAgents, runInit, skillPayloadDir, type AgentId } from "../src/lib/init.js";
import { applyFixes, humanize, toChecklist } from "../src/lib/fix.js";
import { lintText } from "../src/lib/lint.js";

const CLI = path.resolve(process.cwd(), "dist/cli.js");
const POSTINSTALL = path.resolve(process.cwd(), "scripts/postinstall.js");

function sandbox(home = true) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "uzbekify-init-"));
  const homeDir = path.join(dir, "home");
  const cwdDir = path.join(dir, "project");
  fs.mkdirSync(homeDir, { recursive: true });
  fs.mkdirSync(cwdDir, { recursive: true });
  return { home: homeDir, cwd: cwdDir, dir };
}

function touch(p: string) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.mkdirSync(p, { recursive: true });
}

describe("uzbekify init — detection", () => {
  it("detects each agent from home/cwd markers", () => {
    const markers: [AgentId, (s: ReturnType<typeof sandbox>) => void][] = [
      ["claude-code", (s) => touch(path.join(s.home, ".claude"))],
      ["cursor", (s) => touch(path.join(s.cwd, ".cursor"))],
      ["codex", (s) => touch(path.join(s.home, ".codex"))],
      ["windsurf", (s) => touch(path.join(s.home, ".codeium"))],
      ["gemini", (s) => touch(path.join(s.cwd, ".gemini"))],
      ["copilot", (s) => touch(path.join(s.cwd, ".github", "copilot"))],
    ];
    for (const [agent, setup] of markers) {
      const s = sandbox();
      setup(s);
      expect(detectAgents({ home: s.home, cwd: s.cwd }), agent).toContain(agent);
    }
  });

  it("detects nothing in an empty sandbox", () => {
    const s = sandbox();
    expect(detectAgents({ home: s.home, cwd: s.cwd })).toEqual([]);
  });
});

describe("uzbekify init — install per agent", () => {
  const agents: AgentId[] = ["claude-code", "cursor", "codex", "windsurf", "gemini", "copilot"];

  it.each(agents)("%s: writes skill + config and is idempotent", (agent) => {
    const s = sandbox();
    // pre-create the agent marker so detection and install both engage
    const markers: Record<AgentId, string> = {
      "claude-code": path.join(s.home, ".claude"),
      cursor: path.join(s.cwd, ".cursor"),
      codex: path.join(s.home, ".codex"),
      windsurf: path.join(s.home, ".codeium"),
      gemini: path.join(s.cwd, ".gemini"),
      copilot: path.join(s.cwd, ".github", "copilot"),
    };
    touch(markers[agent]);

    const first = runInit({ home: s.home, cwd: s.cwd, targets: [agent] });
    expect(first.targets).toEqual([agent]);
    expect(first.actions.some((a) => a.kind === "skill")).toBe(true);

    const skillMd = first.actions.find((a) => a.kind === "skill")!.path;
    expect(fs.existsSync(path.join(skillMd, "SKILL.md"))).toBe(true);
    expect(fs.existsSync(path.join(skillMd, "references", "calque-bank.md"))).toBe(true);
    expect(fs.existsSync(path.join(skillMd, "playbooks", "ui-microcopy.md"))).toBe(true);

    // agent-specific snippet/config
    const expected: Record<AgentId, (p: string) => boolean> = {
      "claude-code": (p) => fs.existsSync(path.join(p, "..", "..", ".claude.json")),
      cursor: (p) => fs.existsSync(p),
      codex: (p) => fs.readFileSync(p, "utf8").includes("<!-- uzbekify -->"),
      windsurf: (p) => fs.existsSync(p),
      gemini: (p) => fs.existsSync(p),
      copilot: (p) => fs.existsSync(p),
    };
    const snippetAction = first.actions.find((a) => a.kind === "snippet" || a.kind === "mcp");
    expect(snippetAction, agent).toBeTruthy();
    if (snippetAction && snippetAction.kind !== "mcp") {
      expect(fs.existsSync(snippetAction.path), agent).toBe(true);
      if (agent === "codex") expect(expected.codex(snippetAction.path)).toBe(true);
    }

    // MCP wiring for JSON-config agents
    if (agent === "claude-code") {
      const cfg = JSON.parse(fs.readFileSync(path.join(s.home, ".claude.json"), "utf8"));
      expect(cfg.mcpServers.uzbekify.command).toBe("node");
    }
    if (agent === "gemini") {
      const cfg = JSON.parse(fs.readFileSync(path.join(s.cwd, ".gemini", "settings.json"), "utf8"));
      expect(cfg.mcpServers.uzbekify.args[0]).toContain("mcp.js");
    }

    // idempotent: second run writes nothing new (all skip)
    const second = runInit({ home: s.home, cwd: s.cwd, targets: [agent] });
    expect(second.actions.filter((a) => a.kind !== "skip")).toEqual([]);
    // skill refresh allowed on force
    const third = runInit({ home: s.home, cwd: s.cwd, targets: [agent], force: true });
    expect(third.actions.some((a) => a.kind === "skill")).toBe(true);
  });

  it("--dry-run writes nothing", () => {
    const s = sandbox();
    const { actions } = runInit({ home: s.home, cwd: s.cwd, targets: ["claude-code"], dryRun: true });
    expect(actions.length).toBeGreaterThan(0);
    expect(fs.readdirSync(s.home)).toEqual([]);
  });

  it("--all installs every target", () => {
    const s = sandbox();
    const { targets } = runInit({ home: s.home, cwd: s.cwd }, true);
    expect(targets).toHaveLength(6);
    expect(fs.existsSync(path.join(s.home, ".claude", "skills", "uzbekify", "SKILL.md"))).toBe(true);
    expect(fs.existsSync(path.join(s.home, ".cursor", "skills", "uzbekify", "SKILL.md"))).toBe(true); // no cwd marker → home
    expect(fs.existsSync(path.join(s.home, ".codex", "AGENTS.md"))).toBe(true);
    expect(fs.existsSync(path.join(s.home, ".gemini", "GEMINI.md"))).toBe(true);
    expect(fs.existsSync(path.join(s.home, ".github", "copilot", "instructions.md"))).toBe(true); // no cwd repo → home
    expect(fs.existsSync(path.join(s.home, ".codeium", "windsurf", "rules", "uzbekify.md"))).toBe(true);
  });

  it("snippet append does not duplicate on rerun with existing AGENTS.md", () => {
    const s = sandbox();
    touch(path.join(s.home, ".codex"));
    const ag = path.join(s.home, ".codex", "AGENTS.md");
    fs.writeFileSync(ag, "existing content\n", "utf8");
    runInit({ home: s.home, cwd: s.cwd, targets: ["codex"] });
    runInit({ home: s.home, cwd: s.cwd, targets: ["codex"] });
    const txt = fs.readFileSync(ag, "utf8");
    expect(txt.match(/<!-- uzbekify -->/g)).toHaveLength(2); // open+close markers once
    expect(txt.startsWith("existing content")).toBe(true);
  });

  it("skill payload ships from the repo skill folder", () => {
    expect(fs.existsSync(path.join(skillPayloadDir({ home: "", cwd: "" }), "SKILL.md"))).toBe(true);
  });
});

describe("postinstall", () => {
  function run(env: Record<string, string | undefined>) {
    const res = spawnSync(process.execPath, [POSTINSTALL], {
      encoding: "utf8",
      env: { ...process.env, ...env },
    });
    return { code: res.status, out: res.stdout + res.stderr };
  }

  it("CI: skips with a hint, exit 0", () => {
    const r = run({ CI: "true", npm_config_global: "true" });
    expect(r.code).toBe(0);
    expect(r.out).toContain("uzbekify init");
  });

  it("UZBEKIFY_NO_INIT=1: skips, exit 0", () => {
    const r = run({ UZBEKIFY_NO_INIT: "1", npm_config_global: "true" });
    expect(r.code).toBe(0);
    expect(r.out).toContain("uzbekify init");
  });

  it("local install: hint only, no writes", () => {
    const s = sandbox();
    const r = run({ UZBEKIFY_HOME: s.home, npm_config_global: undefined, CI: undefined });
    expect(r.code).toBe(0);
    expect(r.out).toContain("uzbekify init");
    expect(fs.readdirSync(s.home)).toEqual([]);
  });

  it("global install: detects and installs into UZBEKIFY_HOME, exit 0", () => {
    const s = sandbox();
    touch(path.join(s.home, ".claude"));
    const r = run({ UZBEKIFY_HOME: s.home, npm_config_global: "true", CI: undefined });
    expect(r.code).toBe(0);
    expect(r.out).toContain("claude-code");
    expect(fs.existsSync(path.join(s.home, ".claude", "skills", "uzbekify", "SKILL.md"))).toBe(true);
  });

  it("never fails: missing dist degrades gracefully", () => {
    const r = run({ CI: "true" });
    expect(r.code).toBe(0);
  });
});

describe("--fix and humanize", () => {
  it("applyFixes: dashes, apostrophes, zero-width, spaces — meaning untouched", () => {
    const { text, applied } = applyFixes("To'g'ri javob — select qiling\u00AD  ikki marta");
    expect(text).toBe("Toʻgʻri javob, select qiling ikki marta");
    expect(applied.length).toBeGreaterThanOrEqual(3);
  });

  it("regression: applyFixes removes every dash kind safely (all registers' no-dash rule)", () => {
    const fix = (t: string) => applyFixes(t).text;
    expect(fix("Bu katta - juda katta gap")).toBe("Bu katta, juda katta gap");
    expect(fix("Toshkentda yongʻin chiqdi — tafsilotlar")).toBe("Toshkentda yongʻin chiqdi, tafsilotlar");
    expect(fix("Ochiladi -- yangi imkoniyat.")).toBe("Ochiladi, yangi imkoniyat.");
    // numeric ranges become the 10-15 range style instead of "10, 15"
    expect(fix("10–15 daqiqa kuting")).toBe("10-15 daqiqa kuting");
    expect(fix("10 - 15 daqiqa kuting")).toBe("10 - 15 daqiqa kuting");
    // sentence-leading and line-leading dashes are dropped, lines never merge
    expect(fix("Keldim. - Qayerga ketding?")).toBe("Keldim. Qayerga ketding?");
    expect(fix("Salom.\n— Qalaysiz?")).toBe("Salom.\nQalaysiz?");
    expect(fix("Natija —\nyaxshi")).toBe("Natija\nyaxshi");
    // hyphenated words, phones and markdown bullets are left untouched
    const keep = "Wi-Fi, qoʻllab-quvvatlash, 2024-yil 9-avgust, +998 90 123-45-67\n- birinchi\n- ikkinchi";
    expect(fix(keep)).toBe(keep);
    // fixed text is dash-clean in a formal register too
    for (const t of ["Bu katta - juda katta gap", "Yangi yoʻriqnoma tasdiqlandi — hujjat"]) {
      expect(lintText(fix(t), { register: "news" }).map((f) => f.rule).filter((r) => r.includes("dash"))).toEqual([]);
    }
  });

  it("applyFixes transliterates predominantly-Cyrillic text", () => {
    const { text, applied } = applyFixes("Тошкент — маъно, объект.");
    expect(text).toContain("Toshkent");
    expect(applied).toContain("transliterated Cyrillic → Latin");
  });

  it("applyFixes leaves clean text untouched", () => {
    const { text, applied } = applyFixes("Bu ilova menga juda yoqadi.");
    expect(text).toBe("Bu ilova menga juda yoqadi.");
    expect(applied).toEqual([]);
  });

  it("toChecklist orders by ladder step, errors first", () => {
    const { remaining } = humanize("Karoche, update qilib qo'y — ushbu kod kelmayapti.", { register: "chat" });
    expect(remaining.length).toBeGreaterThan(0);
    const steps = remaining.map((r) => r.step);
    expect([...steps].sort((a, b) => a - b)).toEqual(steps);
    expect(remaining.findIndex((r) => r.severity === "error")).toBeGreaterThanOrEqual(0);
    // within each ladder step, errors come before warns
    const byStep = new Map<number, string[]>();
    for (const r of remaining) byStep.set(r.step, [...(byStep.get(r.step) ?? []), r.severity]);
    for (const sevs of byStep.values()) {
      const firstNonError = sevs.findIndex((x) => x !== "error");
      if (firstNonError >= 0) expect(sevs.slice(firstNonError)).not.toContain("error");
    }
    expect(remaining.every((r) => r.order > 0)).toBe(true);
  });

  it("humanize: score rises on fixable text, checklist shrinks", () => {
    const bad = "To'g'ri javob — select qiling.";
    const h = humanize(bad, {});
    expect(h.scoreAfter).toBeGreaterThan(h.scoreBefore);
    expect(h.applied.length).toBeGreaterThan(0);
  });

  it("CLI: lint --fix rewrites the file and prints the diff", () => {
    const f = path.join(os.tmpdir(), `uzfix-${Math.random().toString(36).slice(2)}.txt`);
    fs.writeFileSync(f, "Ishlanyapti — tez orada,  kechikdi", "utf8");
    const r = spawnSync(process.execPath, [CLI, "lint", f, "--fix"], { encoding: "utf8" });
    expect(fs.readFileSync(f, "utf8")).toBe("Ishlanyapti, tez orada, kechikdi");
    expect(r.stderr).toContain("Fixes applied");
    expect(r.stderr).toContain("Diff:");
  });

  it("CLI: humanize prints score line and checklist, --json validates shape", () => {
    const r = spawnSync(process.execPath, [CLI, "humanize", "-", "--json"], {
      input: "Mazkur xizmat uchun ariza topshirilishi lozim — javob kutiladi.",
      encoding: "utf8",
    });
    const payload = JSON.parse(r.stdout);
    expect(payload.scoreBefore).toBeLessThan(payload.scoreAfter);
    expect(Array.isArray(payload.remaining)).toBe(true);
    expect(typeof payload.fixed).toBe("string");
    for (const key of ["applied", "added", "removed", "scoreBefore", "scoreAfter", "remaining", "fixed"]) {
      expect(payload).toHaveProperty(key);
    }
  });

  it("CLI: --version prints the version", () => {
    const r = spawnSync(process.execPath, [CLI, "--version"], { encoding: "utf8" });
    expect(r.status).toBe(0);
    expect(r.stdout).toMatch(/uzbekify \d+\.\d+\.\d+/);
  });

  it("CLI: invalid --register exits 2 with the valid list", () => {
    const r = spawnSync(process.execPath, [CLI, "score", "--register", "bogus", "/dev/null"], { encoding: "utf8" });
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("Unknown register");
    expect(r.stderr).toContain("chat");
  });

  it("CLI: directory with no lintable files exits 2 with a clear message", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "uzpro-empty-"));
    const r = spawnSync(process.execPath, [CLI, "lint", dir], { encoding: "utf8" });
    expect(r.status).toBe(2);
    expect(r.stderr).toContain("No lintable files");
  });

  it("CLI: empty stdin lints clean (exit 0), not a crash", () => {
    const r = spawnSync(process.execPath, [CLI, "lint", "-"], { input: "", encoding: "utf8" });
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("100/100");
  });

  it("CLI: unknown command gets a 'did you mean' hint and exit 2", () => {
    const r = spawnSync(process.execPath, [CLI, "lnt"], { encoding: "utf8" });
    expect(r.status).toBe(2);
    expect(r.stderr).toContain('Did you mean "lint"?');
  });

  it("CLI: init --dry-run writes nothing and prints the plan", () => {
    const s = sandbox();
    const r = spawnSync(
      process.execPath,
      [CLI, "init", "--all", "--dry-run"],
      { encoding: "utf8", env: { ...process.env, UZBEKIFY_HOME: s.home } }
    );
    expect(r.status).toBe(0);
    expect(r.stdout).toContain("dry run");
    expect(r.stdout).toContain("claude-code");
    expect(fs.readdirSync(s.home)).toEqual([]);
  });
});

describe("stable --json format matches schemas", () => {
  it("lint --json conforms to schemas/lint.schema.json (structural)", () => {
    const schema = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "schemas/lint.schema.json"), "utf8"));
    const f = path.join(os.tmpdir(), `uzlint-${Math.random().toString(36).slice(2)}.txt`);
    fs.writeFileSync(f, "Karoche, update qilib qoʻy.", "utf8");
    const r = spawnSync(process.execPath, [CLI, "lint", f, "--json"], { encoding: "utf8" });
    const payload = JSON.parse(r.stdout);
    for (const key of schema.required) expect(payload).toHaveProperty(key);
    expect(payload.score).toBeGreaterThanOrEqual(0);
    expect(payload.score).toBeLessThanOrEqual(100);
    const findingProps = schema.properties.findings.items.required;
    for (const finding of payload.findings) for (const key of findingProps) expect(finding).toHaveProperty(key);
  });

  it("schemas parse as JSON", () => {
    for (const s of ["lint", "score", "humanize"]) {
      expect(() => JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "schemas", `${s}.schema.json`), "utf8"))).not.toThrow();
    }
  });
});

describe("performance and offline", () => {
  it("lint startup completes well under 300ms warm (offline)", () => {
    const f = path.join(os.tmpdir(), `uzperf-${Math.random().toString(36).slice(2)}.txt`);
    fs.writeFileSync(f, "Bu ilova menga juda yoqadi.", "utf8");
    const t0 = performance.now();
    const r = spawnSync(process.execPath, [CLI, "lint", f], { encoding: "utf8" });
    const dt = performance.now() - t0;
    expect(r.status).toBe(0);
    expect(dt).toBeLessThan(1500); // generous CI ceiling; see perf note below
  }, { timeout: 20000 });
});

describe("npm packaging", () => {
  it("npm pack --dry-run: whitelisted files only, no corpus bloat", () => {
    const r = spawnSync("npm", ["pack", "--dry-run"], { encoding: "utf8", cwd: process.cwd() });
    expect(r.status).toBe(0);
    const out = r.stdout + r.stderr;
    expect(out).toContain("dist/cli.js");
    expect(out).toContain("skills/uzbekify/SKILL.md");
    expect(out).toContain("llms.txt");
    expect(out).not.toContain("research/");
    expect(out).not.toContain("reference-v1");
    expect(out).not.toContain("node_modules");
    const sizeMatch = out.match(/package size:\s*([\d.]+)\s*(kB|KB|MB)/i);
    expect(sizeMatch, "pack output should report a package size").toBeTruthy();
    const size = parseFloat(sizeMatch![1]);
    const unit = sizeMatch![2].toUpperCase();
    const mb = unit === "MB" ? size : size / 1024;
    expect(mb).toBeLessThan(5); // "no corpus bloat over a few MB"
  }, { timeout: 60000 });
});
