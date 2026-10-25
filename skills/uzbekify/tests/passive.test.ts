import { describe, expect, it } from "vitest";
import { lintPassive } from "../src/lib/linters/passive.js";

const rules = (t: string) => lintPassive(t).map((f) => f.rule);

describe("passive linter", () => {
  it("flags tomonidan + passive double marking", () => {
    expect(rules("Hisobot menejer tomonidan yuborildi.")).toContain("passive.tomonidan-double");
    expect(rules("Qaror direktor tomonidan qabul qilindi.")).toContain("passive.tomonidan-double");
    expect(rules("Menejer hisobotni yubordi.")).not.toContain("passive.tomonidan-double");
  });

  it("flags passive overuse (3+ passives)", () => {
    expect(
      rules("Ariza qabul qilindi. Maʼlumotlar tekshirildi. Toʻlov amalga oshirildi.")
    ).toContain("passive.overuse");
    expect(rules("Maʼlumotlar tekshirildi.")).not.toContain("passive.overuse");
  });

  it("does not count active -ldi verbs as passive", () => {
    expect(rules("U qildi, men bildim, biz boldi.")).not.toContain("passive.overuse");
    expect(rules("U oldi va qoldi.")).not.toContain("passive.overuse");
  });

  it("flags report-verb stacks", () => {
    expect(rules("Tadbirda taʼminlandi va tashkil etildi.")).toContain("passive.report-stack");
  });

  it("flags nominalization chains", () => {
    expect(
      rules("Rozilik olinishi talab etiladi, maʼlumotlar toʻplanishi amalga oshiriladi va saqlanishi taʼminlanadi.")
    ).toContain("passive.noun-chain");
    expect(rules("Fikr olinishi va berilishi tabiiy.")).not.toContain("passive.noun-chain");
  });
});
