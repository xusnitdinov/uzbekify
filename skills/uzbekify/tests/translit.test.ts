import { describe, expect, it } from "vitest";
import { cyrillicToLatin, latinToCyrillic, translit } from "../src/lib/translit.js";

describe("transliterator: Cyrillic → Latin hard cases", () => {
  it.each([
    ["маъно", "maʼno"],
    ["таъсир", "taʼsir"],
    ["санъат", "sanʼat"],
    ["объект", "obyekt"],
    ["субъект", "subyekt"],
    ["объявление", "obyavleniye"],
    ["функция", "funksiya"],
    ["конференция", "konferensiya"],
    ["акция", "aksiya"],
    ["концерт", "konsert"],
    ["концерти", "konserti"],
    ["цех", "tsex"],
    ["цирк", "tsirk"],
    ["ёзув", "yozuv"],
    ["мой", "moy"],
    ["юқори", "yuqori"],
    ["яна", "yana"],
    ["Зоя", "Zoya"],
    ["ер", "yer"],
    ["етти", "yetti"],
    ["ешингиз", "yeshingiz"],
    ["Европа", "Yevropa"],
    ["мен", "men"],
    ["келди", "keldi"],
    ["эълон", "eʼlon"],
    ["батальон", "batalyon"],
    ["семья", "semya"],
    ["только", "tolko"],
    ["щётка", "shyotka"],
    ["товарищ", "tovarish"],
    ["ўзбек", "oʻzbek"],
    ["тоʻғри", "toʻgʻri"],
    ["ғоя", "gʻoya"],
    ["қабул", "qabul"],
    ["Фарғона", "Fargʻona"],
    ["ҳозир", "hozir"],
    ["Тошкент", "Toshkent"],
    ["Муҳаммад", "Muhammad"],
    ["ЎЗБЕКИСТОН", "OʻZBEKISTON"],
    ["ЕВРОПА", "YEVROPA"],
    ["Мен китоб ўқидим, у ҳам ўқийди.", "Men kitob oʻqidim, u ham oʻqiydi."],
    ["Институтига бориб, объектларни кўрдим.", "Institutiga borib, obyektlarni koʻrdim."],
  ])("%s → %s", (cyr, lat) => {
    expect(cyrillicToLatin(cyr)).toBe(lat);
  });

  it("does not collapse ҳ/х", () => {
    expect(cyrillicToLatin("ҳам хам")).toBe("ham xam");
  });

  it("passes non-Cyrillic through", () => {
    expect(cyrillicToLatin("Latin stays 123!")).toBe("Latin stays 123!");
  });
});

describe("transliterator: Latin → Cyrillic", () => {
  it.each([
    ["Toshkent", "Тошкент"],
    ["maʼno", "маъно"],
    ["funksiya", "функция"],
    ["konferensiya", "конференция"],
    ["yeshik", "ешик"],
    ["yozuv", "ёзув"],
    ["yuqori", "юқори"],
    ["choʻqqiga", "чўққига"],
    ["obyekt", "объект"],
    ["subyektda", "субъектда"],
    ["qishloqqa", "қишлоққа"],
  ])("%s → %s", (lat, cyr) => {
    expect(latinToCyrillic(lat)).toBe(cyr);
  });

  it("round-trips a sentence", () => {
    const lat = "Toshkent — Oʻzbekiston poytaxti.";
    expect(cyrillicToLatin(latinToCyrillic(lat))).toBe(lat);
  });

  it("default direction is latin", () => {
    expect(translit("маъно")).toBe("maʼno");
    expect(translit("maʼno", "cyrillic")).toBe("маъно");
  });
});
