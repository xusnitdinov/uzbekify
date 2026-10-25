import { describe, expect, it } from "vitest";
import { lintRussianism } from "../src/lib/linters/russianism.js";

const rules = (t: string) => lintRussianism(t).map((f) => f.rule);

describe("russianism linter", () => {
  it("catches discourse fillers", () => {
    expect(rules("Karoche, ketdik")).toContain("ru.karoche");
    expect(rules("hammasi normalni")).toContain("ru.normalni");
    expect(rules("kruto boʻldi")).toContain("ru.kruto");
    expect(rules("chotki ishlagan")).toContain("ru.chotki");
    expect(rules("tipa shunday")).toContain("ru.tipa");
    expect(rules("vapshe ishlamaydi")).toContain("ru.vapshe");
    expect(rules("spasibo aka")).toContain("ru.spasibo");
  });

  it("catches RU nouns with suffixes", () => {
    expect(rules("Zakaz holatini koʻring")).toContain("ru.zakaz");
    expect(rules("zakazlarim keldi")).toContain("ru.zakaz");
    expect(rules("nomeringizni yozing")).toContain("ru.nomer");
    expect(rules("skidka bor")).toContain("ru.skidka");
    expect(rules("pilesos chegirma")).toContain("ru.pilesos");
  });

  it("catches RU verbs + qilmoq and bare infinitives", () => {
    expect(rules("xabarni udalit qilib qoʻying")).toContain("ru.ru-verb-qil");
    expect(rules("qoʻshiqni skachat qilmoqchiman")).toContain("ru.ru-verb-qil");
    expect(rules("Sdelat qilolmadim")).toContain("ru.ru-verb-qil");
    expect(rules("Hujjatni otpravit qiling")).toContain("ru.ru-verb-qil");
    expect(rules("peredat ham boʻlmadi")).toContain("ru.ru-infinitive-bare");
  });

  it("bare infinitive rule needs Uzbek context", () => {
    expect(rules("The skachat project")).toHaveLength(0);
  });

  it("catches officialese structure calques", () => {
    expect(rules("muvofiq ravishda oshdi")).toContain("ru.muvofiq-ravishda");
    expect(rules("oʻz navbatida oshdi")).toContain("ru.oz-navbatida");
    expect(rules("hozirgi kunda koʻp")).toContain("ru.hozirgi-kunda");
    expect(rules("katta eʼtibor berildi")).toContain("ru.katta-etibor");
    expect(rules("belgilab berildi")).toContain("ru.belgilab-berildi");
    expect(rules("mavjud boʻlgan imkoniyat")).toContain("ru.mavjud-bolgan");
    expect(rules("faqatgina bugun")).toContain("ru.faqatgina");
    expect(rules("albatta ham boʻladi")).toContain("ru.albatta-ham");
  });

  it("catches boʻyicha spam within one sentence and across text", () => {
    expect(rules("Reja boʻyicha ishlar boʻyicha hisobot boʻyicha gaplashamiz.")).toContain("ru.boycha-sentence");
    const long = Array.from({ length: 15 }, (_, i) => `Band ${i} boʻyicha hisobot`).join(". ");
    expect(rules(long)).toContain("ru.boycha-density");
  });

  it("clean copy passes", () => {
    expect(lintRussianism("Qisqasi, bugun testni topshiramiz.")).toHaveLength(0);
    expect(lintRussianism("Chegirma faqat bugun kuchida.")).toHaveLength(0);
  });
});
