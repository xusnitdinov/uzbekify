import { describe, expect, it } from "vitest";
import { lintSuffix } from "../src/lib/linters/suffix.js";

const rules = (t: string) => lintSuffix(t).map((f) => f.rule);

describe("suffix linter", () => {
  it("flags case on finite verbs", () => {
    expect(rules("Men kitobni doʻstimga berdimga")).toContain("suf.verb-case");
    expect(rules("Biz rejani qildiklarga tuzdik")).toContain("suf.verb-case");
    expect(rules("U kelganingizda keldi")).not.toContain("suf.verb-case");
    expect(rules("Roʻyxatdan oʻtishingizda")).not.toContain("suf.verb-case");
    expect(rules("kelganimizda")).not.toContain("suf.verb-case");
  });

  it("flags double case after -ning", () => {
    expect(rules("Toshkentningga boring")).toContain("suf.double-case");
    expect(rules("fikrlarinigaga qarab")).toContain("suf.double-dative"); // v1 canonical soup
    expect(rules("doʻstimning fikri")).not.toContain("suf.double-case");
  });

  it("flags double dative with stoplist", () => {
    expect(rules("kitobxonlargaga")).toContain("suf.double-dative");
    expect(rules("oʻyingaga")).toContain("suf.double-dative");
    expect(rules("boshqaga qarang")).not.toContain("suf.double-dative");
    expect(rules("bochkaga soling")).not.toContain("suf.double-dative");
  });

  it("flags possessive+plural stacking", () => {
    expect(rules("kitobimizlar")).toContain("suf.possessive-plural");
    expect(rules("kitoblarimiz")).not.toContain("suf.possessive-plural");
    expect(rules("kitoblarimizni oling")).not.toContain("suf.possessive-plural");
  });

  it("flags -ler after back vowels, keeps front loans", () => {
    expect(rules("kitoblerimiz")).toContain("suf.ler-back-vowel");
    expect(rules("Kartaleringiz roʻyxatini koʻring.")).toContain("suf.ler-back-vowel");
    expect(rules("Talabalerimiz")).toContain("suf.ler-back-vowel"); // talaba(lar) + back a + ler
    expect(rules("galereyaga boring")).not.toContain("suf.ler-back-vowel");
    expect(rules("Palermoga sayohat")).not.toContain("suf.ler-back-vowel");
  });

  it("flags missing possessive agreement", () => {
    expect(rules("doʻstimning fikr juda chuqur")).toContain("suf.possessive-agreement");
    expect(rules("doʻstimning fikri juda chuqur")).not.toContain("suf.possessive-agreement");
    expect(rules("doʻstimning fikrlari")).not.toContain("suf.possessive-agreement");
  });

  it("flags unassimilated dative after q/k", () => {
    expect(rules("Qishloqga bordim")).toContain("suf.dative-unassimilated");
    expect(rules("qishloqqa bordim")).not.toContain("suf.dative-unassimilated");
    expect(rules("Yurakka qon quyildi")).not.toContain("suf.dative-unassimilated");
    expect(rules("ishga boring")).not.toContain("suf.dative-unassimilated");
  });

  it("flags triple genitive chains", () => {
    expect(rules("Taraflarning kelishuvining shartlarining buzilishi")).toContain("suf.genitive-chain");
    expect(rules("doʻstimning fikri")).not.toContain("suf.genitive-chain");
  });

  it("verbal-noun plural rule keeps real nouns", () => {
    expect(rules("oʻzgartirishlarni kiritishlariga ruxsat")).toContain("suf.verbal-noun-plural");
    expect(rules("Oʻzgarishlar haqida xabar beramiz.")).not.toContain("suf.verbal-noun-plural");
    expect(rules("yigʻilishlar boshlandi")).not.toContain("suf.verbal-noun-plural");
  });

  it("clean morphology passes", () => {
    expect(lintSuffix("Iltimos, kitoblarimizni oʻqib chiqing.")).toHaveLength(0);
    expect(lintSuffix("Doʻstimga berdim.")).toHaveLength(0);
  });
});
