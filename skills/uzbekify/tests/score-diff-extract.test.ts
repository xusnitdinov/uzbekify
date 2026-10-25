import { describe, expect, it } from "vitest";
import { scoreFindings, explainScore, humanVoiceSignals } from "../src/lib/score.js";
import { diffWords, renderDiff, diffStats } from "../src/lib/diff.js";
import { extractUzbekForLint, extractMatn } from "../src/lib/extract.js";
import { lintAndScore, lintText } from "../src/lib/lint.js";
import type { Finding } from "../src/lib/types.js";

import { lintText as lintTextForTest } from "../src/lib/lint.js";

const mk = (family: string, severity: Finding["severity"], count = 1): Finding => ({
  rule: `${family}.x`,
  family,
  severity,
  match: "x",
  count,
  message: "m",
});

describe("naturalness score", () => {
  it("perfect text scores 100", () => {
    const r = scoreFindings("Toʻgʻri javobni belgilang.", []);
    expect(r.score).toBe(100);
    expect(r.band).toBe("publish");
  });

  it("errors cost more than warnings than info", () => {
    const e = scoreFindings("x", [mk("calque", "error")]).score;
    const w = scoreFindings("x", [mk("cadence", "warn")]).score;
    const i = scoreFindings("x", [mk("format", "info")]).score;
    expect(e).toBeLessThan(w);
    expect(w).toBeLessThan(i);
    expect(i).toBeLessThan(100);
  });

  it("family caps prevent one noisy family zeroing the text", () => {
    const many: Finding[] = Array.from({ length: 10 }, () => mk("ortho", "error", 4));
    const r = scoreFindings("long text ".repeat(30), many);
    expect(r.score).toBeGreaterThanOrEqual(100 - 30 - 22); // ortho cap 30 + short-text bonus n/a
  });

  it("bands map to ranges", () => {
    expect(scoreFindings("t", []).band).toBe("publish");
    expect(scoreFindings("t", Array.from({ length: 5 }, (_, i) => mk("f" + i, "warn"))).band).toBe("minor polish");
    expect(scoreFindings("t", Array.from({ length: 6 }, (_, i) => mk("fam" + i, "error"))).band).toBe("needs rewrite");
  });

  it("explainScore lists deductions", () => {
    const findings = [mk("calque", "error"), mk("register", "warn")];
    const lines = explainScore(scoreFindings("text here", findings), findings);
    expect(lines[0]).toMatch(/Naturalness: \d+\/100/);
    expect(lines.some((l) => l.includes("calque"))).toBe(true);
  });

  it("human-voice bonus rewards human-sounding text (CORE MISSION)", () => {
    const signals = humanVoiceSignals("Kod kelmayapti — yana yuborib qoʻyamiz, tekshirib koʻring.", {});
    expect(signals.signals).toContain("spoken aspect (-yapti)");
    expect(signals.signals).toContain("conversb + auxiliary (-ib qoʻy-)");
    expect(signals.bonus).toBeGreaterThanOrEqual(4);

    // robotic officialese earns no bonus
    const robot = humanVoiceSignals("Ariza belgilangan tartibda koʻrib chiqilishi lozim va natija xabardor qilinadi.", {});
    expect(robot.bonus).toBe(0);

    // bonus is capped at 6
    const chatty = humanVoiceSignals(
      "Mana, boʻldi. Kod kelmayapti — yana yuborib qoʻydim, tekshirib koʻring. Yoʻq boʻlsa yozing, endi koʻramiz. Xoʻp? Mayli, kutamiz.",
      { register: "assistant" }
    );
    expect(chatty.bonus).toBeLessThanOrEqual(6);
  });

  it("score explains the human-voice bonus", () => {
    const text = "Kod kelmayapti — yana yuborib qoʻyamiz.";
    const lines = explainScore(scoreFindings(text, [], {}), []);
    expect(lines.some((l) => l.includes("Human-voice bonus"))).toBe(true);
  });

  it("score gap: robotic officialese scores below its human rewrite", () => {
    const robot = "Mazkur xizmatdan foydalanish uchun ariza topshirilishi lozim. Ushbu imkoniyat orqali yangilashingiz mumkin.";
    const human = "Bu xizmat uchun ariza yozing. Maʼlumotlaringizni shu yerda yangilab qoʻyasiz.";
    const sRobot = scoreFindings(robot, lintTextForTest(robot), {});
    const sHuman = scoreFindings(human, [], {});
    expect(sHuman.score).toBe(100);
    expect(sRobot.score).toBeLessThan(sHuman.score);
  });

  it("seed bad text scores much lower than good text", () => {
    const bad = `Men haqiqatan ham bu ilovani yoqtiraman. To'g'ri javobni select qiling. Guruh ishi chiqmadi — nima qilasan? Karoche, update qilib qo'y.`;
    const good = `Bu ilova menga juda yoqadi. Toʻgʻri javobni belgilang. Guruh ishi oʻxshamadi — nima qilasiz? Qisqasi, yangilab qoʻying.`;
    const sBad = lintAndScore(bad).score;
    const sGood = lintAndScore(good).score;
    expect(sBad).toBeLessThan(50);
    expect(sGood).toBeGreaterThanOrEqual(90);
  });
});

describe("diff", () => {
  it("word-level LCS marks adds and removes", () => {
    const ops = diffWords("mening eski matnim", "mening yangi matnim");
    const rendered = renderDiff(ops);
    expect(rendered).toContain("{-eski-}");
    expect(rendered).toContain("{+yangi+}");
    expect(rendered).toContain("mening");
  });

  it("stats count tokens", () => {
    const s = diffStats(diffWords("bir ikki uch", "bir toʻrt uch"));
    expect(s.same).toBe(2);
    expect(s.added).toBe(1);
    expect(s.removed).toBe(1);
  });

  it("identical texts produce only same ops", () => {
    const ops = diffWords("bir xil", "bir xil");
    expect(ops.every((o) => o.type === "same")).toBe(true);
  });
});

describe("extract", () => {
  it("keeps only the first tx() arg", () => {
    const { text } = extractUzbekForLint(`tx("to'g'ri javob", "correct answer", "верно")`);
    expect(text).toContain("to'g'ri javob");
    expect(text).not.toContain("correct answer");
  });

  it("keeps uz JSON values, drops en", () => {
    const { text } = extractUzbekForLint(`{"uz":"saqlash","en":"Save"}`);
    expect(text).toContain("saqlash");
    expect(text).not.toContain("Save");
  });

  it("skips en-locale file paths", () => {
    expect(extractUzbekForLint("ship it", { filePath: "/app/locales/en.json" }).skipped).toBe("en-locale-path");
  });

  it("extracts ## Matn blocks", () => {
    const md = "## Matn\nBu toza matn.\n\n## Holat\nfinal";
    expect(extractMatn(md)).toContain("Bu toza matn.");
    expect(extractMatn(md)).not.toContain("final");
  });
});

describe("aggregate lintText", () => {
  it("runs all families", () => {
    const bad = "Karoche, update qilib, to'g'ri javobni select qiling va Tashkentga boring";
    const families = new Set(lintText(bad, {}).map((f) => f.family));
    expect(families.has("calque")).toBe(true);
    expect(families.has("russianism")).toBe(true);
    expect(families.has("ortho")).toBe(true);
  });

  it("strips soft hyphens before matching", () => {
    expect(lintText("Misl\u00ADsiz tezlik bilan", {}).some((f) => f.rule === "calque.mislsiz")).toBe(true);
  });
});
