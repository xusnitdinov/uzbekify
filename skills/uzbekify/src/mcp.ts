#!/usr/bin/env node
/**
 * uzpro-mcp — MCP server (stdio) for uzbek-humanizer-pro.
 *
 * Tools: uz_lint, uz_rewrite_plan, uz_score, uz_translit, uz_glossary_lookup,
 * uz_calque_check, uz_synonym_suggest.
 *
 * Register in Claude Desktop / any MCP client:
 *   { "mcpServers": { "uzpro": { "command": "node", "args": ["dist/mcp.js"] } } }
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  uzLint,
  uzRewritePlan,
  uzScore,
  uzTranslit,
  uzGlossaryLookup,
  uzCalqueCheck,
  uzSynonymSuggest,
} from "./lib/mcp-tools.js";

const REGISTER_DESC =
  "target register: product (default), quiz, assistant, youth, marketing, academic, news, legal, official";

function makeServer(): McpServer {
  const server = new McpServer({ name: "uzpro", version: "2.0.0" });

  server.tool(
    "uz_lint",
    "Lint Uzbek text with all uzpro linter families; returns findings with line/column spans",
    { text: z.string(), register: z.string().optional(), allow_sen: z.boolean().optional() },
    async ({ text, register, allow_sen }) => ({
      content: [{ type: "text", text: JSON.stringify(uzLint(text, register, allow_sen), null, 2) }],
    })
  );

  server.tool(
    "uz_rewrite_plan",
    "Step-by-step humanizer fix plan (the 8-step rewrite ladder) with spans per finding",
    { text: z.string(), register: z.string().optional(), allow_sen: z.boolean().optional() },
    async ({ text, register, allow_sen }) => ({
      content: [{ type: "text", text: JSON.stringify(uzRewritePlan(text, register, allow_sen), null, 2) }],
    })
  );

  server.tool(
    "uz_score",
    "Naturalness score 0-100 with deductions and the human-voice bonus (CORE MISSION)",
    { text: z.string(), register: z.string().optional(), allow_sen: z.boolean().optional() },
    async ({ text, register, allow_sen }) => ({
      content: [{ type: "text", text: JSON.stringify(uzScore(text, register, allow_sen), null, 2) }],
    })
  );

  server.tool(
    "uz_translit",
    "Cyrillic ⇄ Latin transliteration (handles ц ё ю я е ъ ь ў қ ғ ҳ hard cases)",
    { text: z.string(), to: z.enum(["latin", "cyrillic"]).optional() },
    async ({ text, to }) => ({
      content: [{ type: "text", text: JSON.stringify(uzTranslit(text, to ?? "latin"), null, 2) }],
    })
  );

  server.tool(
    "uz_glossary_lookup",
    "Look up UI glossary terms (EN↔UZ) and calque-bank entries (bad→good)",
    { query: z.string() },
    async ({ query }) => ({
      content: [{ type: "text", text: JSON.stringify(uzGlossaryLookup(query), null, 2) }],
    })
  );

  server.tool(
    "uz_calque_check",
    "Check text against the 200-entry calque bank (EN + RU structure + officialese)",
    { text: z.string() },
    async ({ text }) => ({
      content: [{ type: "text", text: JSON.stringify(uzCalqueCheck(text), null, 2) }],
    })
  );

  server.tool(
    "uz_synonym_suggest",
    "Native synonym suggestions ranked by corpus frequency, with context",
    { word: z.string(), register: z.string().optional() },
    async ({ word, register }) => ({
      content: [{ type: "text", text: JSON.stringify(uzSynonymSuggest(word, register), null, 2) }],
    })
  );

  return server;
}

// Direct execution (node dist/mcp.js) → stdio server
const isMain = process.argv[1]?.endsWith("mcp.js") || process.argv[1]?.endsWith("mcp.ts");
if (isMain) {
  const server = makeServer();
  await server.connect(new StdioServerTransport());
}

export { makeServer };
