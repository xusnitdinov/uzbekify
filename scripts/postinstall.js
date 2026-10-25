#!/usr/bin/env node
/**
 * uzbekify postinstall — safe, idempotent, never fails the install.
 *
 * Behavior:
 * - CI environments or UZBEKIFY_NO_INIT=1 → print "run: uzbekify init" and exit 0.
 * - Local (non-global) installs → print a hint and exit 0 (no filesystem writes).
 * - Global installs (npm install -g uzbekify) → auto-detect installed agents
 *   and install the skill for each (same as `uzbekify init`), then print what
 *   happened. Any error is caught and reported; exit code stays 0.
 * - npm --ignore-scripts skips this file entirely by design.
 */
import os from "node:os";

async function main() {
  if (process.env.UZBEKIFY_NO_INIT === "1") {
    console.log("uzbekify: auto-init disabled (UZBEKIFY_NO_INIT=1). Run: uzbekify init");
    return;
  }
  if (process.env.CI) {
    console.log("uzbekify: CI detected, skipping auto-init. Run: uzbekify init");
    return;
  }
  const isGlobal = process.env.npm_config_global === "true";
  if (!isGlobal) {
    console.log("uzbekify installed locally. To wire it into your AI agents, run: uzbekify init");
    return;
  }

  // Global install: perform an idempotent init.
  const { runInit } = await import(
    new URL("../dist/lib/init.js", import.meta.url).href
  );
  const home = process.env.UZBEKIFY_HOME || os.homedir();
  const { detected, actions } = runInit({ home, cwd: process.cwd() });
  const written = actions.filter((a) => a.kind !== "skip");
  const skipped = actions.filter((a) => a.kind === "skip");
  console.log(`uzbekify: detected agents: ${detected.length ? detected.join(", ") : "none"}`);
  for (const a of written) console.log(`  + ${a.agent}: ${a.detail} → ${a.path}`);
  if (skipped.length) console.log(`  = ${skipped.length} already up to date`);
  if (!written.length) console.log("  Nothing new to install. Run `uzbekify init --all` to force every target.");
  console.log("uzbekify ready. Try: uzpro score --min 90 <file>");
}

main().catch((err) => {
  // Never fail the install.
  console.log(`uzbekify: auto-init skipped (${err && err.message ? err.message : String(err)}). Run: uzbekify init`);
  process.exit(0);
});
