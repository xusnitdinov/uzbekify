import { describe, expect, it } from "vitest";
import { lintOfficialese } from "../src/lib/linters/officialese.js";

const rules = (t: string, register = "product") =>
  lintOfficialese(t, { register }).map((f) => f.rule);

describe("officialese linter (gov-corpus pattern bank)", () => {
  it("flags Tier A document-speak in casual registers", () => {
    expect(rules("Mazkur xizmat uchun ariza yozing")).toContain("off.mazkur");
    expect(rules("Ushbu imkoniyat orqali yangilashingiz mumkin")).toContain("off.ushbu");
    expect(rules("Ariza belgilangan tartibda topshiriladi")).toContain("off.belgilangan-tartibda");
    expect(rules("Dalillar har tomonlama tekshirilishi shart")).toContain("off.har-tomonlama");
    expect(rules("tegishli tarzda xabardor qilish")).toContain("off.tegishli-tarzda");
    expect(rules("tegishli tartibda taqdim etilishi lozim")).toContain("off.tegishli-tarzda");
    expect(rules("nazarda tutilgan hollarda uzaytiriladi")).toContain("off.nazarda-tutilgan");
    expect(rules("Xarajatlar tashkilot zimmasida boʻladi")).toContain("off.zimmasida-boladi");
    expect(rules("ariza berilgan paytdan eʼtiboran")).toContain("off.e-tiboran");
    expect(rules("chora-tadbirlar toʻgʻrisida qaror")).toContain("off.chora-tadbirlar");
    expect(rules("faoliyat yuritishini taʼminlash")).toContain("off.faoliyat-yuritish");
    expect(rules("tubdan takomillashtirish")).toContain("off.tubdan-takomillashtirish");
    expect(rules("Davlatimiz rahbari qatnashdi")).toContain("off.davlatimiz-rahbari");
  });

  it("flags -lishi kerak passive chains and requirement formulas", () => {
    expect(rules("Qaror bir kunda qabul qilinishi kerak")).toContain("off.passive-nomen-require");
    expect(rules("Ariza roʻyxatdan oʻtkazilishi lozim")).toContain("off.passive-nomen-require");
    expect(rules("Hujjatlarni taqdim etish talab etiladi")).toContain("off.talab-etiladi");
  });

  it("flags report boilerplate", () => {
    expect(rules("samarali hamkorlik yoʻlga qoʻyildi")).toContain("off.samarali-hamkorlik");
    expect(rules("yanada rivojlantirish maqsadida")).toContain("off.yanada-rivojlantirish");
    expect(rules("aholi imkoniyati bilan taʼminlandi")).toContain("off.ta-minlandi-imkoniyat");
    expect(rules("oʻzgartirish va qoʻshimchalar kiritish toʻgʻrisida")).toContain("off.ozgartirish-qoshimcha");
  });

  it("Tier B report verbs flagged in casual, allowed in formal registers", () => {
    expect(rules("Ishlar olib borilmoqda", "product")).toContain("off.olib-borilmoqda");
    expect(rules("Natijalar eʼlon qilindi va xabardor qilindi", "product")).toContain("off.bayonot-verb");
    expect(rules("Quyidagi hujjatlarni topshiring", "product")).toContain("off.quyidagi");
    expect(rules("Ishlar olib borilmoqda", "news")).toHaveLength(0);
    expect(rules("Quyidagi gapni toping", "quiz")).toHaveLength(0);
    expect(rules("Yoʻl qoʻyilmadi", "news")).toHaveLength(0);
  });

  it("official register keeps the full document style", () => {
    const law = "Ushbu Qonunga muvofiq mazkur tartib belgilangan tartibda amalga oshirilishi kerak.";
    expect(lintOfficialese(law, { register: "official" })).toHaveLength(0);
  });

  it("ushbu/mazkur: warn in casual, info in quiz, skipped in document registers (legal/academic/official)", () => {
    expect(lintOfficialese("Ushbu band loyihaviy matn hisoblanadi.", { register: "product" })[0].severity).toBe("warn");
    expect(lintOfficialese("Ushbu band loyihaviy matn hisoblanadi.", { register: "quiz" })[0].severity).toBe("info");
    expect(lintOfficialese("Ushbu band loyihaviy matn hisoblanadi.", { register: "legal" })).toHaveLength(0);
    expect(lintOfficialese("Mazkur tadqiqotda natijalar tahlil qilinadi.", { register: "academic" })).toHaveLength(0);
  });

  it("flags AI chat-tells", () => {
    expect(rules("Ajoyib savol! Keling koʻramiz")).toContain("off.ai-opener");
    expect(rules("Albatta! Yordam beraman")).toContain("off.ai-opener");
    expect(rules("Xulosa qilib, juda qulay")).toContain("off.xulosa-short");
  });

  it("human-voiced product copy passes", () => {
    expect(lintOfficialese("Bu xizmat uchun ariza yozing. Maʼlumotlaringizni shu yerda yangilab qoʻyasiz.", { register: "product" })).toHaveLength(0);
  });
});
