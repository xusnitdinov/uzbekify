import { describe, expect, it } from "vitest";
import {
  uzLint,
  uzRewritePlan,
  uzScore,
  uzTranslit,
  uzGlossaryLookup,
  uzCalqueCheck,
  uzSynonymSuggest,
} from "../src/lib/mcp-tools.js";
import { makeServer } from "../src/mcp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

const BAD = "Mazkur xizmat uchun ariza belgilangan tartibda topshirilishi lozim. Ushbu kod kelmayapti.";

describe("MCP tool handlers", () => {
  it("uz_lint returns findings with spans and a score", () => {
    const r = uzLint(BAD);
    expect(r.findings.length).toBeGreaterThan(0);
    expect(r.findings.some((f) => f.family === "officialese")).toBe(true);
    expect(typeof r.score).toBe("number");
  });

  it("uz_lint respects the official register", () => {
    const r = uzLint(BAD, "official");
    expect(r.findings.filter((f) => f.family === "officialese")).toHaveLength(0);
  });

  it("uz_rewrite_plan returns ordered ladder steps with spans", () => {
    const plan = uzRewritePlan("To'g'ri javobni select qiling. Karoche, update qilib qo'y.");
    expect(plan.steps.length).toBeGreaterThan(0);
    expect(plan.steps.map((s) => s.step)).toEqual([...plan.steps.map((s) => s.step)].sort((a, b) => a - b));
    const officialese = plan.steps.find((s) => s.title.includes("calques"));
    expect(officialese).toBeTruthy();
    expect(officialese!.fixes[0].line).toBeGreaterThanOrEqual(1);
    expect(plan.ladder).toContain("register");
  });

  it("uz_score exposes deductions, human-voice bonus and corpus baseline", () => {
    const r = uzScore("Kod kelmayapti — yana yuborib qoʻyamiz, tekshirib koʻring.");
    expect(r.score).toBeGreaterThan(0);
    expect(r.humanVoiceSignals.length).toBeGreaterThan(0);
    expect(r.corpusBaseline.p95Words).toBeGreaterThanOrEqual(20);
  });

  it("uz_translit both directions", () => {
    expect(uzTranslit("Тошкент — маъно").result).toBe("Toshkent — maʼno");
    expect(uzTranslit("Toshkent", "cyrillic").result).toBe("Тошкент");
  });

  it("uz_glossary_lookup finds UI terms and calques", () => {
    const r = uzGlossaryLookup("Save");
    expect(r.matches.some((m) => m.uz.includes("Saqlash"))).toBe(true);
    const r2 = uzGlossaryLookup("ship");
    expect(r2.matches.some((m) => m.source === "calque-bank")).toBe(true);
  });

  it("uz_calque_check matches bank entries in text", () => {
    const r = uzCalqueCheck("Keling ship qilaylik va check qilib koʻring");
    expect(r.bankMatches.some((m) => m.bad.includes("ship"))).toBe(true);
    expect(r.linterHits.length).toBeGreaterThan(0);
  });

  it("uz_synonym_suggest ranks by corpus frequency", () => {
    const r = uzSynonymSuggest("update");
    expect(r.suggestions.length).toBeGreaterThan(0);
    expect(r.suggestions[0].prefer).toContain("yangila");
    expect(typeof r.suggestions[0].corpusFreq).toBe("number");
  });
});

describe("MCP server (in-memory client)", () => {
  it("serves tools/list and answers a tools/call round trip", async () => {
    const server = makeServer();
    const client = new Client({ name: "test", version: "0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    const tools = await client.listTools();
    const names = tools.tools.map((t) => t.name);
    for (const expected of [
      "uz_lint",
      "uz_rewrite_plan",
      "uz_score",
      "uz_translit",
      "uz_glossary_lookup",
      "uz_calque_check",
      "uz_synonym_suggest",
    ]) {
      expect(names).toContain(expected);
    }

    const res = await client.callTool({
      name: "uz_score",
      arguments: { text: "Bu xizmat uchun ariza yozing. Maʼlumotlaringizni shu yerda yangilab qoʻyasiz." },
    });
    const payload = JSON.parse((res.content as { type: string; text: string }[])[0].text);
    expect(payload.score).toBeGreaterThanOrEqual(90);

    const lint = await client.callTool({ name: "uz_lint", arguments: { text: "Karoche, update qilib qoʻy." } });
    const lintPayload = JSON.parse((lint.content as { type: string; text: string }[])[0].text);
    expect(lintPayload.findings.some((f: { rule: string }) => f.rule === "ru.karoche")).toBe(true);

    await client.close();
    await server.close();
  });
});
