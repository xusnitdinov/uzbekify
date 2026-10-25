import { describe, expect, it } from "vitest";
import { lintRegister, detectLanes } from "../src/lib/linters/register.js";

const rules = (t: string, opts = {}) => lintRegister(t, opts).map((f) => f.rule);

describe("register linter", () => {
  it("flags sen-present incl. question forms, stops nouns", () => {
    expect(rules("Nima qilasan?")).toContain("reg.sen-present");
    expect(rules("Yangisini soʻraysanmi?")).toContain("reg.sen-present");
    expect(rules("Balansingizni tekshirasanmi?")).toContain("reg.sen-present");
    expect(rules("Asosan ertalab darslar oʻtadi")).not.toContain("reg.sen-present");
    expect(rules("Bu mavzu asosan oddiy")).not.toContain("reg.sen-present");
  });

  it("allow-sen skips sen rules (youth mode)", () => {
    expect(rules("Nima qilasan?", { allowSen: true })).not.toContain("reg.sen-present");
  });

  it("flags bare imperatives on product surfaces", () => {
    expect(rules("Kel, javobni yoz")).toContain("reg.bare-imperative");
    expect(rules("Bekor qilish uchun: Bekor qil.")).toContain("reg.bare-imperative");
    expect(rules("Davom etish uchun Bor bosing.")).toContain("reg.bare-imperative-mid");
    expect(rules("Keling, javobni yozing.")).toHaveLength(0);
  });

  it("does not flag the noun yoz (summer) or bor (exists)", () => {
    expect(rules("Yoz tasirli boʻldi, Siz ham koʻring.")).not.toContain("reg.bare-imperative");
    expect(rules("Pul bor, tashvish yoʻq.")).not.toContain("reg.bare-imperative");
  });

  it("flags sen-past without being fooled by English -ding words", () => {
    expect(rules("Siz kelganingizda qilding?")).toContain("reg.sen-past");
    expect(rules("Loading barayotgan paytda kuting")).not.toContain("reg.sen-past");
  });

  it("flags the SIz typo", () => {
    expect(rules("SIz toʻgʻri yoʻldasiz")).toContain("reg.siz-typo");
  });

  it("flags mixed address lanes on one surface", () => {
    expect(rules("Siz kelasizmi yoki kelasan?")).toContain("reg.mixed-lane");
    expect(rules("Xush kelibsiz! Endi nima qilasiz?")).not.toContain("reg.mixed-lane");
  });

  it("particle rule is register-scoped", () => {
    expect(rules("Xoʻp, soʻrov qabul qilindi")).toContain("reg.particle-product");
    expect(rules("Xoʻp, soʻrov qabul qilindi", { register: "youth" })).toHaveLength(0);
    // judayam/gap yoʻq stay clean (youth register markers, not product errors)
    expect(rules("Bu judayam zoʻr, gap yoʻq!")).toHaveLength(0);
  });

  it("detectLanes separates lanes", () => {
    expect(detectLanes("Nima qilasiz? Keling.")).toEqual({ siz: true, sen: false });
    expect(detectLanes("Nima qilasan? Kel.")).toEqual({ siz: false, sen: true });
  });
});
