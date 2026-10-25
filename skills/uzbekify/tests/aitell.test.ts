import { describe, expect, it } from "vitest";
import { lintAitell } from "../src/lib/linters/aitell.js";
import { lintText } from "../src/lib/lint.js";
import { lintAndScore } from "../src/lib/lint.js";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const rules = (t: string, register = "product") =>
  lintAitell(t, { register }).map((f) => f.rule);

describe("aitell: dashes (output policy is global; input lint is register-calibrated)", () => {
  it("flags em and en dashes in casual registers", () => {
    for (const register of ["product", "chat", "assistant", "youth", "marketing"]) {
      expect(rules("Ishlanyapti — tez orada tugatamiz.", register)).toContain("aitell.em-dash");
      expect(rules("En dash – ham shunday", register)).toContain("aitell.em-dash");
    }
  });

  it("skips em dashes in formal registers where they are attested style (news '— tafsilotlar', laws, papers)", () => {
    for (const register of ["news", "legal", "official", "academic", "quiz"]) {
      expect(rules("Buxoroda bozor yonib ketdi — tafsilotlar", register)).not.toContain("aitell.em-dash");
    }
  });

  it("flags the spaced-hyphen tic in chat and the double-hyphen tic in casual copy; ranges and brands stay clean", () => {
    expect(rules("Bu katta - juda katta gap", "chat")).toContain("aitell.spaced-hyphen-dash");
    expect(rules("Ochiladi -- yangi imkoniyat.")).toContain("aitell.double-hyphen-dash");
    // real humans (and v1's native-verified goldens) use " - " outside chat
    expect(rules("Guruh ishi oʻxshamadi - nima qilasiz?", "quiz")).not.toContain("aitell.spaced-hyphen-dash");
    expect(rules("10 - 15 daqiqa kuting")).toHaveLength(0);
    expect(rules("Wi-Fi va Telegram-bot")).toHaveLength(0);
  });

  it("dash-free rewrite scores higher", () => {
    const dashy = "Kod kelmayapti — yana yubordim.";
    const clean = "Kod kelmayapti, yana yubordim.";
    expect(lintAndScore(clean, {}).score).toBeGreaterThan(lintAndScore(dashy, {}).score);
  });
});

describe("aitell: register-scoped tells", () => {
  it("semicolons: error in chat, warn in casual, skipped in formal (legal prose keeps them)", () => {
    expect(lintAitell("Salom; ketdik.", { register: "chat" })[0].severity).toBe("error");
    expect(lintAitell("Salom; ketdik.", { register: "product" })[0].severity).toBe("warn");
    expect(lintAitell("Salom; ketdik.", { register: "legal" })).toHaveLength(0);
    expect(lintAitell("Salom; ketdik.", { register: "news" })).toHaveLength(0);
    // EN-only semicolons are not an Uzbek finding
    expect(lintAitell("Bukhara is a UNESCO site; Samarkand too.", { register: "product" })).toHaveLength(0);
  });

  it("formal connectors in casual text", () => {
    expect(rules("shuningdek, yangi imkoniyat", "chat")).toContain("aitell.formal-connector");
    expect(rules("binobarin, bu muhim", "product")).toContain("aitell.formal-connector");
  });

  it("stacked adjectives: bare triples and hype-word chains flag; clean marketing triples pass", () => {
    expect(rules("katta zamonaviy qulay platforma")).toContain("aitell.stacked-adjectives");
    expect(rules("yangi tez qulay yechim")).toContain("aitell.stacked-adjectives");
    expect(rules("katta, zamonaviy va qulay platforma")).toContain("aitell.stacked-adjectives");
    expect(rules("katta qulay platforma")).toHaveLength(0);
    expect(rules("Tez, sodda va foydali.")).toHaveLength(0);
    expect(rules("Oson, tez va qulay.")).toHaveLength(0);
  });

  it("English AI tics translated literally", () => {
    expect(rules("Eʼtiboringiz uchun rahmat!")).toContain("aitell.ai-tic-en");
    expect(rules("Sizga maʼlum boʻlishi kerakki, jarayon davom etmoqda")).toContain("aitell.ai-tic-en");
    expect(rules("Ishonchingiz komil boʻlishi mumkin")).toContain("aitell.ai-tic-en");
  });

  it("chat-robotic phrasing patterns", () => {
    expect(rules("qanday harakat qilishim kerakligini bilmayapman", "chat")).toContain("aitell.chat-robotic-harakat");
    expect(rules("Bu ishlashi mumkin deb oʻylayman", "chat")).toContain("aitell.chat-robotic-mumkin");
    expect(rules("minnatdorchilik bildiraman")).toContain("aitell.chat-robotic-minnatdor");
    expect(rules("jiddiy yoʻqotishlar sodir boʻldi", "chat")).toContain("aitell.chat-robotic-report");
    expect(rules("Batafsil maʼlumot quyida keltirilgan", "chat")).toContain("aitell.chat-robotic-report");
    expect(rules("muddati 11-oktabrgacha belgilangan", "chat")).toContain("aitell.chat-robotic-belgilangan");
    expect(rules("Operatorlar orqali hal qilinadi", "chat")).toContain("aitell.chat-robotic-orqali");
    expect(rules("Toʻlovingiz muvaffaqiyatli amalga oshirildi", "chat")).toContain("aitell.chat-robotic-payment");
  });

  it("chat-only structure checks", () => {
    expect(rules("• birinchi\n• ikkinchi\nUch - toʻrt", "chat")).toContain("aitell.chat-bullets");
    const long = "Bu gap juda uzun boʻlib ketdi va chat uchun yaramaydi chunki odamlar qisqa yozadi va biz ham shunday qilishimiz kerak.";
    expect(rules(long, "chat")).toContain("aitell.chat-long-sentence");
    expect(rules(long, "product")).not.toContain("aitell.chat-long-sentence");
  });

  it("perfect punctuation in casual register only; clipped chat and particles are exempt", () => {
    const perfect = "Assalomu alaykum. Rahmat saga. Yaxshi ishlading. Hammasi tugadi.";
    expect(rules(perfect, "chat")).toContain("aitell.perfect-punctuation");
    expect(rules(perfect, "product")).not.toContain("aitell.perfect-punctuation");
    expect(rules("Assalomu alaykum. Rahmat aka. Boʻldi-ku, yetdi.", "chat")).not.toContain("aitell.perfect-punctuation");
    expect(rules("Rahmat. Boʻldi. Yubordim.", "chat")).not.toContain("aitell.perfect-punctuation");
  });

  it("payment status stays correct in product register", () => {
    expect(rules("Toʻlov muvaffaqiyatli amalga oshirildi", "product")).not.toContain("aitell.chat-robotic-payment");
  });
});

describe("informal corpus + reference file integration", () => {
  const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../..");

  it("informal corpus files exist with manifest and mining report", () => {
    const dir = path.join(REPO, "research", "informal-corpus");
    const files = readdirSync(dir);
    expect(files).toContain("MANIFEST.md");
    expect(files).toContain("MINING.md");
    expect(files.filter((f) => f.startsWith("tg-")).length).toBeGreaterThanOrEqual(5);
    expect(files).toContain("kun-quotes.txt");
    expect(files).toContain("v1-review-voice.txt");
    const manifest = readFileSync(path.join(dir, "MANIFEST.md"), "utf8");
    expect(manifest).toContain("uforum.uz"); // collection constraints documented
  });

  it("references/informal-chat.md pairs real × robotic", () => {
    const md = readFileSync(
      path.join(REPO, "skills", "uzbekify", "references", "informal-chat.md"),
      "utf8"
    );
    expect(md).toContain("nma qilsam boladi");
    expect(md).toContain("Robotic AI version");
    expect(md).toContain("yaxwi ediku");
  });

  it("real chat lines score at least as well as their robotic twins (sample)", () => {
    const cases: [string, string][] = [
      ["Salom! Koʻryapmiz, javobni tez orada yozamiz.", "Sizning murojaatingiz koʻrib chiqilmoqda; natijasi haqida xabardor qilinasiz."],
      ["Rahmat aka!", "Sizning murojaatingiz uchun minnatdorchilik bildiraman."],
      ["Batafsil 👇", "Batafsil maʼlumot quyida keltirilgan."],
    ];
    for (const [human, robot] of cases) {
      const sh = lintAndScore(human, { register: "chat", allowSen: true }).score;
      const sr = lintAndScore(robot, { register: "chat", allowSen: true }).score;
      expect(sh).toBeGreaterThanOrEqual(sr);
    }
  });

  it("informal eval set exists and detects cleanly", () => {
    const rows = readFileSync(
      path.join(REPO, "skills", "uzbekify", "eval", "v2", "pairs-informal.jsonl"),
      "utf8"
    )
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l));
    expect(rows.length).toBeGreaterThanOrEqual(40);
    for (const r of rows) {
      expect(lintText(r.bad, { register: "chat", allowSen: true }).length, r.id).toBeGreaterThan(0);
      expect(lintText(r.good, { register: "chat", allowSen: true }), r.id).toHaveLength(0);
    }
  });
});
