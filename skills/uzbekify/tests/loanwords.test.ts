import { describe, expect, it } from "vitest";
import { lintLoanwords } from "../src/lib/linters/loanwords.js";

const rules = (t: string, opts = {}) => lintLoanwords(t, opts).map((f) => f.rule);

describe("loanword linter", () => {
  it("flags replaceable English words in Uzbek context", () => {
    expect(rules("Men bugun meeting qildim")).toContain("loan.replaceable.meeting");
    expect(rules("boss bilan gaplashdim")).toContain("loan.replaceable.boss");
    expect(rules("Deadline yaqinlashmoqda, task ni tugating")).toContain("loan.replaceable.deadline");
    expect(rules("update keldi, lekin ishlamayapti")).toContain("loan.replaceable.update");
    expect(rules("cashback oling")).toContain("loan.replaceable.cashback");
    expect(rules("Har bir doʻkonimizda individual approach va attention")).toContain("loan.replaceable.approach");
  });

  it("regression: deadline is allowed in work chat / casual registers (loanword-policy: keep in professional chat)", () => {
    const chat = "Bugun deadline, vazifani hali tugatmadim. Yigʻilishdan keyin sizga qoʻngʻiroq qilaman, boʻladimi?";
    expect(rules(chat, { register: "chat" })).not.toContain("loan.replaceable.deadline");
    expect(rules(chat, { register: "youth" })).not.toContain("loan.replaceable.deadline");
    // still flagged on clean product / formal surfaces
    for (const register of ["product", "assistant", "marketing", "quiz", "news", "legal", "official", "academic"]) {
      expect(rules(chat, { register }), register).toContain("loan.replaceable.deadline");
    }
    // only deadline is relaxed: other replaceable words still fire in chat
    expect(rules("Deadline yaqin, task ni tugating", { register: "chat" })).toContain("loan.replaceable.task");
  });

  it("keeps English-only lines clean", () => {
    expect(rules("Send the file this morning please")).toHaveLength(0);
    expect(rules("The team meeting starts at nine")).toHaveLength(0);
  });

  it("keeps assimilated KEEP-list loans clean", () => {
    expect(rules("Wi-Fiʼga ulaning va OTP kodni kiriting")).toHaveLength(0);
    expect(rules("Emailingizni yozing, promokod qoʻllang")).toHaveLength(0);
  });

  it("does not flag the Click payment brand", () => {
    expect(rules("Click orqali toʻlash")).toHaveLength(0);
  });

  it("flags EN filler swagger", () => {
    expect(rules("Bu jamoa zoʻr vibe beradi va ship qiladi")).toContain("loan.slang");
    expect(rules("whatever, qabul qilamiz")).toContain("loan.slang");
  });

  it("youth platform words flagged on clean surfaces, skipped in youth register", () => {
    expect(rules("Like bosing va story ulashing")).toContain("loan.youth-word");
    expect(rules("Like bosing", { register: "youth" })).toHaveLength(0);
  });

  it("flags EN legalese paste", () => {
    expect(rules("hold harmless shartlari bor, liability cheklangan")).toContain("loan.legalese");
  });
});
