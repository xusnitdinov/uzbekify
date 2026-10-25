/**
 * Loanword family: English loanword overuse with native alternatives, plus
 * the KEEP-list density check. Assimilated tech terms (Wi‑Fi, OTP, email…)
 * are fine; replaceable English words are flagged with the native verb/noun.
 */
import { Finding, LintOptions } from "../types.js";
import { hasUzbekContext, hasAnyUzbek } from "./util.js";
import { wordCount } from "../text.js";

interface Loanword {
  en: string;
  uz: string;
}

/** English words that must be rewritten when they appear in Uzbek copy. */
const REPLACEABLE: Loanword[] = [
  { en: "check", uz: "tekshirish" },
  { en: "update", uz: "yangilash" },
  { en: "support", uz: "qoʻllab-quvvatlash / yordam" },
  { en: "share", uz: "ulashish / yuborish" },
  { en: "save", uz: "saqlash" },
  { en: "cancel", uz: "bekor qilish" },
  { en: "delete", uz: "oʻchirish" },
  { en: "confirm", uz: "tasdiqlash" },
  { en: "download", uz: "yuklab olish" },
  { en: "upload", uz: "yuklash" },
  { en: "login", uz: "kirish" },
  { en: "logout", uz: "chiqish" },
  { en: "send", uz: "yuborish" },
  { en: "skip", uz: "oʻtkazib yuborish" },
  { en: "price", uz: "narx" },
  { en: "task", uz: "vazifa" },
  { en: "team", uz: "jamoa" },
  { en: "project", uz: "loyiha" },
  { en: "deadline", uz: "muddat" },
  { en: "meeting", uz: "uchrashuv / yigʻilish" },
  { en: "feedback", uz: "fikr / mulohaza" },
  { en: "boss", uz: "rahbar" },
  { en: "account", uz: "hisob / akkaunt (login contexts)" },
  { en: "friend", uz: "doʻst" },
  { en: "easy", uz: "oson" },
  { en: "fast", uz: "tez" },
  { en: "free", uz: "bepul / erkin" },
  { en: "sale", uz: "chegirma / sotuv" },
  { en: "discount", uz: "chegirma" },
  { en: "gift", uz: "sovgʻa" },
  { en: "message", uz: "xabar" },
  { en: "cashback", uz: "keshbek" },
  { en: "content", uz: "kontent" },
  { en: "motivate", uz: "ragʻbatlantirish" },
  { en: "approach", uz: "yondashuv" },
  { en: "attention", uz: "eʼtibor" },
  { en: "status", uz: "holat" },
  { en: "report", uz: "hisobot" },
  { en: "order", uz: "buyurtma" },
  { en: "income", uz: "daromad" },
];

/** EN filler swagger words — always errors in Uzbek copy (context-guarded). */
const SLANG_RE = /\b(?:ship|vibe|teammate|cringe|random|literally|mindset|hard\s+mode|whatever|superhero)\b/gi;

/** Youth-only platform words — errors on product surfaces (youth register skips). */
const YOUTH_RE = /\b(?:like|story|stories|reel|reels|DM|DMs|follow|following|donat|crack|apk|vlog|stream|look)\b/gi;

/** Legalese paste — warn with Uzbek phrasing. */
const LEGALESE_RE = /\b(?:hold\s+harmless|liability|indemnification|indemnitee|force\s+majeure|waive|waiver|without\s+prejudice|non-?binding|binding)\b/gi;

/** Assimilated/global terms that are fine, but density matters. */
const KEEP_RE =
  /\b(?:Wi-?Fi|OTP|PIN|email|Google|Telegram|Instagram|onlayn|oflayn|link|chat|QR|promokod|keshbek|skrinshot|laptop|foto|video|bonus|app|cookie|profil|test|lokatsiya|tarif)\b/gi;

export function lintLoanwords(text: string, opts: LintOptions = {}): Finding[] {
  const findings: Finding[] = [];

  const slang = text.match(SLANG_RE) ?? [];
  if (slang.length) {
    findings.push({
      rule: "loan.slang",
      family: "loanword",
      severity: "error",
      match: slang[0] ?? "",
      count: slang.length,
      message: "EN filler swagger does not belong in Uzbek copy — see the loanword policy (kayfiyat, zoʻr, hamkasb, tasodifiy, rostdan ham, qarash)",
    });
  }

  if (opts.register !== "youth") {
    const youth = (text.match(YOUTH_RE) ?? []).filter((m) => hasAnyUzbek(text, m));
    if (youth.length) {
      findings.push({
        rule: "loan.youth-word",
        family: "loanword",
        severity: "warn",
        match: youth[0] ?? "",
        count: youth.length,
        message: "Youth/Telegram platform word on a clean surface — Xabar yozing / obuna boʻling / Yoqdi deb belgilang (youth register only)",
      });
    }
  }

  const legalese = (text.match(LEGALESE_RE) ?? []).filter((m) => hasAnyUzbek(text, m));
  if (legalese.length) {
    findings.push({
      rule: "loan.legalese",
      family: "loanword",
      severity: "warn",
      match: legalese[0] ?? "",
      count: legalese.length,
      message: "EN legalese paste — use Uzbek phrasing unless citing the exact contract term (javobgarlik, zarar qoplash, majburiy kuchga ega)",
    });
  }

  for (const { en, uz } of REPLACEABLE) {
    const re = new RegExp(`\\b${en}\\b`, "gi");
    const hits = text.match(re) ?? [];
    if (hits.length && hasUzbekContext(text, en)) {
      findings.push({
        rule: `loan.replaceable.${en}`,
        family: "loanword",
        severity: "warn",
        match: hits[0] ?? "",
        count: hits.length,
        message: `English "${en}" in Uzbek text — prefer ${uz}`,
      });
    }
  }

  if (wordCount(text) >= 40) {
    const keeps = text.match(KEEP_RE) ?? [];
    const density = (keeps.length / wordCount(text)) * 100;
    if (density > 8) {
      findings.push({
        rule: "loan.density",
        family: "loanword",
        severity: "info",
        match: keeps[0] ?? "",
        count: keeps.length,
        message: `Assimilated-loan density ${density.toFixed(1)}% — fine for tech copy, but check the audience understands each one`,
      });
    }
  }

  return findings;
}
