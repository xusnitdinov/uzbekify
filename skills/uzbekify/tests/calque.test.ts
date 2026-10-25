import { describe, expect, it } from "vitest";
import { lintCalque } from "../src/lib/linters/calque.js";

const rules = (t: string) => lintCalque(t).map((f) => f.rule);

describe("calque linter", () => {
  it("catches EN slang paste", () => {
    expect(rules("Keling ship qilaylik")).toContain("calque.ship");
    expect(rules("Need vibe check")).toContain("calque.vibe");
    expect(rules("Bu funksiya portladi")).toContain("calque.portladi");
    expect(rules("teammate bilan gaplashing")).toContain("calque.teammate");
    expect(rules("hard mode yoqildi")).toContain("calque.hard-mode");
  });

  it("keeps teaching-context 'ship' clean", () => {
    expect(lintCalque("before we ship the order")).toHaveLength(0);
  });

  it("catches EN verb + qilmoq in all converb forms", () => {
    expect(rules("maʼlumotni check qilib koʻring")).toContain("calque.en-qil");
    expect(rules("Ilovani update qilishingiz kerak")).toContain("calque.en-qil");
    expect(rules("Javobni select qiling")).toContain("calque.en-qil");
    expect(rules("Hujjatni sign qilib qoʻya qol")).toContain("calque.en-qil");
  });

  it("catches phrase calques", () => {
    expect(rules("haqiqatan ham zoʻr")).toContain("calque.haqiqatan-ham");
    expect(rules("Hurmatli foydalanuvchi, xush kelibsiz")).toContain("calque.hurmatli-foydalanuvchi");
    expect(rules("Bu raketa ilmi emas")).toContain("calque.raketa-ilmi");
    expect(rules("U chelakni tepdi")).toContain("calque.chelakni-tepdi");
    expect(rules("Men bu filmni yoqtiraman")).toContain("calque.men-yoqtiraman");
    expect(rules("qarshi emasmisiz")).toContain("calque.qarshi-emasmisiz");
  });

  it("catches marketing translationese", () => {
    expect(rules("innovatsion yechim bilan")).toContain("calque.innovatsion");
    expect(rules("Hayotingizni transformatsiya qiling")).toContain("calque.transformatsiya2");
    expect(rules("Minglab odamlar tanlagan")).toContain("calque.minglab-odamlar");
    expect(rules("Inqilobiy oʻzgarishlar")).toContain("calque.inqilobiy");
    expect(rules("Erta qush taklifi")).toContain("calque.erta-qush");
    expect(rules("Eng yaxshi tajriba sizni kutadi")).toContain("calque.tajriba-ux");
  });

  it("catches soft-wrong situation verbs", () => {
    expect(rules("Guruh ishi chiqmadi")).toContain("calque.soft-chiqmadi");
    expect(rules("Reja chiqmadi")).toContain("calque.soft-chiqmadi");
    expect(rules("kod chiqmadi")).not.toContain("calque.soft-chiqmadi");
  });

  it("catches EN place names in Uzbek text; EN-only sentences stay clean", () => {
    expect(rules("Men Tashkentda yashayman")).toContain("calque.place-en");
    expect(rules("Samarqand va Buxoro turizmi")).toHaveLength(0);
    expect(rules("Bukhara old town")).toHaveLength(0); // no Uzbek context
    expect(rules("Bukhara boʻyicha sayohat rejasini tuzing")).toContain("calque.place-en");
  });

  it("catches detached suffixes after loans", () => {
    expect(rules("Wi-Fi ga ulaning")).toContain("calque.detached-suffix");
    expect(rules("Email ingizni kiriting")).toContain("calque.detached-suffix");
    expect(rules("Wi-Fiʼga ulaning")).toHaveLength(0);
    expect(rules("OTP kodni kiriting")).toHaveLength(0);
  });

  it("catches EN UI paste with Uzbek context", () => {
    expect(rules("Forgot password? Parolni tiklash.")).toContain("calque.en-ui-paste");
    expect(rules("Forgot password?")).toHaveLength(0); // EN-only, no Uzbek context
  });

  it("clean native copy passes", () => {
    expect(lintCalque("Bu ilova menga juda yoqadi. Toʻgʻri javobni belgilang.")).toHaveLength(0);
    expect(lintCalque("Men Toshkentda yashayman.")).toHaveLength(0);
  });
});
