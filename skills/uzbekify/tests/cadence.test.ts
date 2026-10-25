import { describe, expect, it } from "vitest";
import { lintCadence } from "../src/lib/linters/cadence.js";
import { lintLiteralness } from "../src/lib/linters/literalness.js";
import { lintWordOrder } from "../src/lib/linters/wordorder.js";
import { lintScreen } from "../src/lib/linters/screen.js";
import { lintFormat } from "../src/lib/linters/format.js";

describe("cadence linter", () => {
  it("flags monotone runs", () => {
    const mono = Array.from({ length: 7 }, () => "Bu esa juda ham uzunroq boʻlgan tekis gapdir.").join(" ");
    expect(lintCadence(mono).map((f) => f.rule)).toContain("cadence.monotone");
  });

  it("flags repeated long bigrams (birinchi navbatda ×3)", () => {
    const t = "Birinchi navbatda maʼlumot. Birinchi navbatda tahlil. Birinchi navbatda natija.";
    expect(lintCadence(t).map((f) => f.rule)).toContain("cadence.repeated-phrase");
  });

  it("flags repeated sentence openers", () => {
    const t = "Kechqurun dars boʻldi. Kechqurun kino boʻldi. Kechqurun uchrashuv boʻldi. Kechqurun hammasi boʻldi. Kechqurun tugadi.";
    expect(lintCadence(t).map((f) => f.rule)).toContain("cadence.repeated-opener");
  });

  it("flags abstract noun stacks", () => {
    expect(lintCadence("taʼminlash amalga oshirish jarayon holat").map((f) => f.rule)).toContain("cadence.abstract-stack");
  });

  it("varied prose passes", () => {
    const good = "Bugun dars ertaroq tugadi. Keyin kutubxonaga bordim va ikki soat oʻqidim. Kechqurun doʻstim bilan kinoga bordik. Zoʻr film ekan. Uyga kech qaytdik.";
    expect(lintCadence(good)).toHaveLength(0);
  });
});

describe("literalness linter", () => {
  const rules = (t: string) => lintLiteralness(t).map((f) => f.rule);

  it("idiom and politeness calques", () => {
    expect(rules("qarshi emasmisiz")).toContain("lit.would-you-mind");
    expect(rules("raketa ilmi")).toContain("lit.rocket-science");
    expect(rules("chelakni tepdi")).toContain("lit.kick-bucket");
    expect(rules("mushuklar va itlar yogʻmoqda")).toContain("lit.cats-dogs");
    expect(rules("oyogʻingni sindir")).toContain("lit.break-leg");
    expect(rules("Men Oʻzbekiston emasman")).toContain("lit.not-from");
  });

  it("connector calques", () => {
    expect(rules("Shuning uchun ham shu sababli kechikdik")).toContain("lit.connector-double-cause");
    expect(rules("Boshqa soʻzlar bilan aytganda, bu ishlamaydi")).toContain("lit.connector-other-words");
    expect(rules("Bir tomondan qimmat, boshqa tomondan sifatsiz")).toContain("lit.connector-other-hand");
    expect(rules("Yakuniy xulosa qilib aytganda, hammasi yaxshi")).toContain("lit.connector-xulosa");
    expect(rules("natijasida sifatida yaxshilandi")).toContain("lit.connector-natijasida-sifatida");
  });

  it("nominalization soup", () => {
    expect(rules("Yuklab olishni amalga oshiring")).toContain("lit.nominalization-amalga");
    expect(rules("Yuklab olishni bajaring")).toContain("lit.nominalization-bajar");
    expect(rules("Biz ishni bajardik")).toHaveLength(0);
    expect(rules(" rejani bajardik")).toHaveLength(0);
  });

  it("legal overclaims", () => {
    expect(rules("Maʼlumotlar 100% xavfsiz")).toContain("lit.overclaim");
    expect(rules("barcha risklar kafolatlanadi")).toContain("lit.overclaim");
    expect(rules("qonun bilan kafolatlangan")).toContain("lit.vague-statute");
    expect(rules("kodeksining 999-moddasiga muvofiq")).toContain("lit.statute-9xx");
  });
});

describe("wordorder linter", () => {
  const rules = (t: string) => lintWordOrder(t).map((f) => f.rule);

  it("post-verbal objects (SOV)", () => {
    expect(rules("U oʻqidi kitobni")).toContain("wo.post-verbal-object");
    expect(rules("U kitobni oʻqidi")).toHaveLength(0);
    expect(rules("Koʻrdim uni")).toHaveLength(0); // pronoun focus OK
  });

  it("post-verbal time adverbs", () => {
    expect(rules("Bordi kechqurun")).toContain("wo.post-verbal-time");
    expect(rules("Kechqurun bordi")).toHaveLength(0);
  });

  it("fronted WH questions", () => {
    expect(rules("Nima siz qilasiz?")).toContain("wo.wh-fronted");
    expect(rules("Siz nima qilasiz?")).toHaveLength(0);
  });
});

describe("screen linter", () => {
  const rules = (t: string) => lintScreen(t).map((f) => f.rule);

  it("jumla+gap mixing with suffixes", () => {
    expect(rules("Quyidagi jumla ichida toʻgʻri gapni toping")).toContain("screen.jumla-gap");
    expect(rules("Notoʻgʻri gapni toping")).toHaveLength(0);
  });

  it("literary + chatty clash", () => {
    expect(rules("Mazkur hujjat boʻyicha amalga oshirish rejalashtirildi, karoche mayli")).toContain("screen.literary-chatty");
  });

  it("Cyrillic leak includes Uzbek letters (қ ғ ў ҳ)", () => {
    expect(rules("ўзбекча matn")).toContain("screen.cyrillic-leak");
    expect(rules("қабул qilindi")).toContain("screen.cyrillic-leak");
  });

  it("mixed-alphabet tokens", () => {
    expect(rules("Profilобновлен boʻldi")).toContain("screen.mixed-alphabet");
  });

  it("clean Latin text passes", () => {
    expect(lintScreen("Bu toza oʻzbekcha matn. Toʻgʻri javobni belgilang.")).toHaveLength(0);
  });
});

describe("format linter", () => {
  const rules = (t: string) => lintFormat(t).map((f) => f.rule);

  it("money and dates", () => {
    expect(rules("Narxi: $1,250,000 soʻm")).toContain("fmt.money-dollar");
    expect(rules("1,250,000 soʻm toʻlang")).toContain("fmt.money-comma");
    expect(rules("Sana: Aug 9, 2024 belgilandi")).toContain("fmt.date-en");
    expect(rules("01.05.2024-yil kelishildi")).toContain("fmt.date-dotted");
    expect(rules("Narxi: 1 250 000 soʻm. Sana: 2024-yil 9-avgust.")).toHaveLength(0);
  });
});
