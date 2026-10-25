/**
 * `uzbekify init` — zero-friction installation for any AI agent.
 *
 * Auto-detects Claude Code, Cursor, Codex, Windsurf, Gemini CLI and Copilot
 * and writes the right files per target: the skill folder (SKILL.md +
 * references + playbooks + examples), an AGENTS.md/rules/instructions
 * snippet, and MCP config where the target supports it. Idempotent: reruns
 * refresh skill files and never duplicate config entries. Fully offline.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type AgentId = "claude-code" | "cursor" | "codex" | "windsurf" | "gemini" | "copilot";

export interface InitOptions {
  home: string;
  cwd: string;
  /** Package root that contains skills/uzbekify (defaults to this module's ../../..). */
  skillSource?: string;
  force?: boolean;
  dryRun?: boolean;
  withMcp?: boolean; // default true
  targets?: AgentId[]; // default: detected or all with --all
}

export interface InitAction {
  agent: AgentId;
  kind: "skill" | "snippet" | "mcp" | "skip";
  path: string;
  detail: string;
}

const SKILL_DIR_NAME = "uzbekify";

function skillSourceRoot(opt: InitOptions): string {
  if (opt.skillSource) return opt.skillSource;
  const here = path.dirname(fileURLToPath(import.meta.url)); // dist/lib or src/lib
  // From dist: <pkg>/dist/lib → <pkg>. From src (tests): skills/uzbekify/src/lib → repo root.
  for (const root of [path.resolve(here, "..", ".."), path.resolve(here, "..", "..", "..", "..")]) {
    if (exists(path.join(root, "skills", SKILL_DIR_NAME, "SKILL.md"))) return root;
  }
  return path.resolve(here, "..", "..");
}

/** The shipped skill payload: SKILL.md + references + playbooks + examples. */
export function skillPayloadDir(opt: InitOptions): string {
  return path.join(skillSourceRoot(opt), "skills", SKILL_DIR_NAME);
}

function exists(p: string): boolean {
  return fs.existsSync(p);
}

function copySkillTo(dest: string, opt: InitOptions, agent: AgentId): InitAction {
  const src = skillPayloadDir(opt);
  const target = path.join(dest, "skills", SKILL_DIR_NAME);
  const marker = path.join(target, "SKILL.md");
  if (!opt.force && exists(marker)) {
    const same =
      fs.readFileSync(marker, "utf8") === fs.readFileSync(path.join(src, "SKILL.md"), "utf8");
    if (same) return { agent, kind: "skip", path: target, detail: "skill already up to date" };
  }
  if (!opt.dryRun) {
    fs.mkdirSync(target, { recursive: true });
    for (const sub of ["SKILL.md", "references", "playbooks", "examples"]) {
      const from = path.join(src, sub);
      const to = path.join(target, sub);
      if (!exists(from)) continue;
      fs.cpSync(from, to, { recursive: true });
    }
  }
  return { agent, kind: "skill", path: target, detail: "SKILL.md + references + playbooks + examples" };
}

const SNIPPET_MARKER = "<!-- uzbekify -->";

const AGENTS_SNIPPET = `${SNIPPET_MARKER}
# uzbekify — natural Uzbek for agents

Use the uzbekify skill whenever you write, rewrite, translate or review
Uzbek. Quick check: run \`uzpro lint <file>\` (or \`uzbekify lint\`); aim for
score >= 90 (\`uzpro score --min 90\`). Deterministic fixes: \`uzpro
humanize <file>\`. Full skill: skills/uzbekify/SKILL.md in this workspace.
${SNIPPET_MARKER}`;

function appendSnippet(file: string, snippet: string, agent: AgentId, opt: InitOptions): InitAction {
  const existing = exists(file) ? fs.readFileSync(file, "utf8") : "";
  if (existing.includes(SNIPPET_MARKER)) {
    if (!opt.force) return { agent, kind: "skip", path: file, detail: "snippet already present" };
  }
  if (!opt.dryRun) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const base = existing ? (existing.endsWith("\n") ? existing : existing + "\n") : "";
    fs.writeFileSync(file, base + snippet + "\n", "utf8");
  }
  return { agent, kind: "snippet", path: file, detail: "instructions snippet" };
}

function writeIfNew(file: string, content: string, agent: AgentId, kind: InitAction["kind"], detail: string, opt: InitOptions): InitAction {
  if (exists(file) && fs.readFileSync(file, "utf8") === content && !opt.force) {
    return { agent, kind: "skip", path: file, detail: "up to date" };
  }
  if (!opt.dryRun) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content, "utf8");
  }
  return { agent, kind, path: file, detail };
}

interface McpConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

function mcpEntry(): McpConfig {
  return { command: "node", args: [mcpServerPath()] };
}

function mcpServerPath(): string {
  const here = path.dirname(fileURLToPath(import.meta.url)); // dist/lib
  return path.resolve(here, "..", "mcp.js");
}

function upsertJsonMcp(file: string, agent: AgentId, opt: InitOptions): InitAction {
  let json: Record<string, unknown> = {};
  if (exists(file)) {
    try {
      json = JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, unknown>;
    } catch {
      return { agent, kind: "skip", path: file, detail: "existing config is not valid JSON; add mcpServers manually" };
    }
  }
  const servers = (json.mcpServers ?? {}) as Record<string, unknown>;
  if (servers.uzbekify && !opt.force) {
    return { agent, kind: "skip", path: file, detail: "MCP server already configured" };
  }
  servers.uzbekify = mcpEntry();
  json.mcpServers = servers;
  if (!opt.dryRun) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(json, null, 2) + "\n", "utf8");
  }
  return { agent, kind: "mcp", path: file, detail: "mcpServers.uzbekify → uzpro-mcp (stdio)" };
}

export function detectAgents(opt: InitOptions): AgentId[] {
  const { home, cwd } = opt;
  const found: AgentId[] = [];
  if (exists(path.join(home, ".claude")) || exists(path.join(cwd, ".claude"))) found.push("claude-code");
  if (exists(path.join(home, ".cursor")) || exists(path.join(cwd, ".cursor"))) found.push("cursor");
  if (exists(path.join(home, ".codex")) || exists(path.join(cwd, ".codex"))) found.push("codex");
  if (exists(path.join(home, ".codeium")) || exists(path.join(cwd, ".codeium"))) found.push("windsurf");
  if (exists(path.join(home, ".gemini")) || exists(path.join(cwd, ".gemini"))) found.push("gemini");
  if (
    exists(path.join(home, ".github", "copilot")) ||
    exists(path.join(cwd, ".github", "copilot")) ||
    exists(path.join(cwd, ".github", "copilot-instructions.md"))
  ) {
    found.push("copilot");
  }
  return found;
}

export function initForAgent(agent: AgentId, opt: InitOptions): InitAction[] {
  const { home, cwd } = opt;
  const actions: InitAction[] = [];
  const mcp = opt.withMcp !== false;

  switch (agent) {
    case "claude-code": {
      const root = exists(path.join(cwd, ".claude")) ? path.join(cwd, ".claude") : path.join(home, ".claude");
      actions.push(copySkillTo(root, opt, agent));
      actions.push(upsertJsonMcp(path.join(home, ".claude.json"), agent, { ...opt, withMcp: mcp }));
      break;
    }
    case "cursor": {
      const root = exists(path.join(cwd, ".cursor")) ? path.join(cwd, ".cursor") : path.join(home, ".cursor");
      actions.push(copySkillTo(root, opt, agent));
      actions.push(
        writeIfNew(
          path.join(root, "rules", "uzbekify.mdc"),
          `---\ndescription: uzbekify — natural Uzbek rules\nalwaysApply: false\n---\n${AGENTS_SNIPPET}\n`,
          agent,
          "snippet",
          ".cursor/rules/uzbekify.mdc",
          opt
        )
      );
      break;
    }
    case "codex": {
      const root = exists(path.join(cwd, ".codex")) ? path.join(cwd, ".codex") : path.join(home, ".codex");
      actions.push(copySkillTo(root, opt, agent));
      actions.push(appendSnippet(path.join(root, "AGENTS.md"), AGENTS_SNIPPET, agent, opt));
      break;
    }
    case "windsurf": {
      const root = exists(path.join(cwd, ".codeium")) ? path.join(cwd, ".codeium") : path.join(home, ".codeium");
      const dir = path.join(root, "windsurf");
      actions.push(copySkillTo(dir, opt, agent));
      actions.push(
        writeIfNew(path.join(dir, "rules", "uzbekify.md"), AGENTS_SNIPPET + "\n", agent, "snippet", "Windsurf rules file", opt)
      );
      break;
    }
    case "gemini": {
      const root = exists(path.join(cwd, ".gemini")) ? path.join(cwd, ".gemini") : path.join(home, ".gemini");
      actions.push(copySkillTo(root, opt, agent));
      actions.push(appendSnippet(path.join(root, "GEMINI.md"), AGENTS_SNIPPET, agent, opt));
      actions.push(upsertJsonMcp(path.join(root, "settings.json"), agent, { ...opt, withMcp: mcp }));
      break;
    }
    case "copilot": {
      const gh = exists(path.join(cwd, ".github")) ? path.join(cwd, ".github") : path.join(home, ".github");
      actions.push(copySkillTo(path.join(gh, "copilot"), opt, agent));
      actions.push(
        appendSnippet(
          exists(path.join(cwd, ".github")) ? path.join(cwd, ".github", "copilot-instructions.md") : path.join(home, ".github", "copilot", "instructions.md"),
          AGENTS_SNIPPET,
          agent,
          opt
        )
      );
      break;
    }
  }
  return actions;
}

export function runInit(opt: InitOptions, all = false): { detected: AgentId[]; targets: AgentId[]; actions: InitAction[] } {
  const detected = detectAgents(opt);
  let targets = opt.targets ?? detected;
  if (all) {
    targets = ["claude-code", "cursor", "codex", "windsurf", "gemini", "copilot"];
  }
  if (targets.length === 0) {
    targets = ["claude-code"]; // sensible default when nothing is detected
  }
  const actions = targets.flatMap((a) => initForAgent(a, opt));
  return { detected, targets, actions };
}
