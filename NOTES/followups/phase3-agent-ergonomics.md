# Phase 3: agent ergonomics (zero-friction for any AI agent)

1. SKILL.md: short and scannable.
   - A frontmatter description that triggers reliably on any Uzbek write, translate or rewrite request.
   - A 30-second quickstart at the top.
   - A decision table mapping each task to its playbook, register, and command or tool.
   - Progressive disclosure: link to references only when needed.
2. `npx uzbekify init` auto-detects Claude Code, Cursor, Codex, Windsurf, Gemini CLI or Copilot and writes the right files: skills folder, AGENTS.md or .cursor/rules snippet, and MCP config. Also ship llms.txt and a single-file AGENTS.md drop-in.
3. CLI and MCP I/O:
   - stdin/stdout piping
   - a stable --json format with JSON Schema files
   - meaningful exit codes
   - --fix applies safe auto-fixes and prints a diff
   - actionable error messages
4. No network or API keys required. Lint starts in under 300ms. Works fully offline.
5. A `uzpro humanize` command applies all deterministic fixes and returns the remaining issues as an ordered checklist for the agent.
6. An examples/ folder with copy-paste agent prompts and end-to-end transcripts.
7. Tests for install/init for each agent target. Keep build, tests and eval passing.

## Naming (user decision)
- The npm package name is **uzbekify**. Set `"name": "uzbekify"` in the publishable package.json.
- The main install is `npx uzbekify init`. A global install, `npm i -g uzbekify`, must also work.
- Make `uzbekify` the primary CLI bin, and keep `uzpro` as a short alias.
- Add a `bin` entry and a proper `files` whitelist. The package must pass `npm pack --dry-run`, with only the needed files and no corpus bloat over a few MB.
- Brand the README, SKILL.md and docs as "uzbekify" (the successor to uzbek-humanizer). Skill folder name: skills/uzbekify/.
- Do NOT npm publish or git push. The user will publish it himself.
- User wants the headline install to be `npm install -g uzbekify` (plain npm install, not npx). Make that the primary documented command. Add a safe postinstall that auto-detects installed agents and installs the skill (idempotent, never fails the install, respects CI and --ignore-scripts, prints a clear message). If scripts are disabled, it prints "run: uzbekify init". Keep `npx uzbekify init` only as the alternative.
