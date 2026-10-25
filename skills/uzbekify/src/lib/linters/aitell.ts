/**
 * AI-tell family (phase 2b, recalibrated in phase 4): robotic punctuation and
 * structure tells, mined against research/informal-corpus/.
 *
 * OUTPUT policy (SKILL.md hard rule 2): the skill never writes em/en dashes
 * or " - " in ANY register, and the linter is the self-check that enforces
 * it, so dash rules fire in every register (formal included: a news
 * headline "… — tafsilotlar" becomes "…: tafsilotlar"). What stays clean:
 *
 *   hyphenated words      Wi-Fi, qoʻllab-quvvatlash, 2024-yil, 9-avgust
 *   numeric ranges        10-15 daqiqa, 10 - 15 (formatting.md Range row)
 *   phone numbers         +998 90 123-45-67
 *   markdown bullets      "- item" lines in a list or after a heading/colon
 *                         (the SKILL output template uses them)
 *
 *   semicolon   — error in chat, warn in casual, skipped in formal
 *   formal connectors / AI tics — casual only
 */
import { Finding, LintOptions } from "../types.js";
import { ruleFindings, Rule, hasAnyUzbek } from "./util.js";
import { splitSentences } from "../text.js";

const FORMAL_REGISTERS = new Set(["news", "legal", "academic", "official", "quiz"]);

/** Adjective stems for the stacking check. */
const ADJECTIVES = [
  "katta", "kichik", "yangi", "eski", "chiroyli", "qizil", "oq", "qora",
  "yaxshi", "zoʻr", "uzun", "qisqa", "tez", "sekin", "qulay", "arzon",
  "qimmat", "kuchli", "sodda", "murakkab", "tub", "zamonaviy", "xavfsiz",
  "samarali", "innovatsion", "unikal", "mukammal", "ideal",
];


export const AITELL_GLOBAL_RULES: Rule[] = [
  {
    id: "aitell.em-dash",
    family: "aitell",
    re: /[—–]/g,
    severity: "error",
    message: "Em/en dash — the skill never outputs these. Rewrite with a comma, a period, or restructure: 'Ishlanyapti, tez orada tugatamiz.'",
    skipText: undefined,
  },
  {
    id: "aitell.spaced-hyphen-dash",
    family: "aitell",
    // " - " between words is a dash; digit - digit is a numeric range (allowed)
    re: /(?<=[^\s\d|]) - (?=[^\s|])|(?<=\d) - (?=[^\s\d|])/g,
    severity: "error",
    message: "Spaced hyphen used as a dash — rewrite with a comma or period (the AI ' - ' tic)",
  },
  {
    id: "aitell.double-hyphen-dash",
    family: "aitell",
    re: /(?<=\S) -- (?=\S)/g,
    severity: "error",
    message: "Double-hyphen dash (AI markdown habit) — rewrite with a comma or period",
  },
];

export const AITELL_SCOPED_RULES: Rule[] = [
  {
    id: "aitell.semicolon",
    family: "aitell",
    re: /;/g,
    severity: "warn",
    message: "Semicolon — split into two sentences; people and native copy barely use them",
    skipMatch: (m, text) => !hasAnyUzbek(text, m),
  },
  {
    id: "aitell.formal-connector",
    family: "aitell",
    re: /\b(?:shuningdek|binobarin|xususan|jumladan)\b/gi,
    severity: "warn",
    message: "Formal connector in casual text — va / ham / masalan read human (officialese mazkur/ushbu have their own rule)",
  },
  {
    id: "aitell.stacked-adjectives",
    family: "aitell",
    // three stacked adjectives: bare juxtaposition, or comma/va chains that
    // include a hype word ("katta, zamonaviy va qulay"). Clean triples like
    // "tez, sodda va foydali" are native marketing rhythm and pass.
    re: new RegExp(
      `(?:(?:${ADJECTIVES.join("|")})\\s+){2}(?:${ADJECTIVES.join("|")})\\b` +
        `|\\b(?:${ADJECTIVES.join("|")})(?:\\s*,\\s*|\\s+(?:va\\s+)?){2}(?:zamonaviy|innovatsion|unikal|mukammal|ideal|samarali|tub)\\b` +
        `|\\b(?:zamonaviy|innovatsion|unikal|mukammal|ideal|samarali|tub)(?:\\s*,\\s*|\\s+(?:va\\s+)?){1,2}(?:${ADJECTIVES.join("|")})\\b`,
      "gi"
    ),
    severity: "warn",
    message: "Stacked adjectives — pick the one that matters (bare triple or a hype-word chain is EN marketing rhythm)",
  },
  {
    id: "aitell.chat-robotic-harakat",
    family: "aitell",
    re: /\bqanday\s+harakat\s+qilishim\s+kerak(ligini)?\b/gi,
    severity: "warn",
    message: "Robot-frame question — real chat says 'Nima qilishim kerak?' / 'Nma qilsam boladi?'",
  },
  {
    id: "aitell.chat-robotic-mumkin",
    family: "aitell",
    re: /\b\w+\s+mumkin\s+deb\s+oʻylayman\b/gi,
    severity: "warn",
    message: "Hedged EN-think calque — 'Boʻladi-yov' / 'Ishlaydi shekilli'",
  },
  {
    id: "aitell.chat-robotic-minnatdor",
    family: "aitell",
    re: /\bminnatdorchilik\s+bildiraman\b/gi,
    severity: "error",
    message: "Ceremonial thanks — 'Rahmat!' is the human word",
  },
  {
    id: "aitell.chat-robotic-report",
    family: "aitell",
    re: /\b(?:sodir\s+boʻldi|qayd\s+etildi|quyida\s+keltirilgan)\b/gi,
    severity: "warn",
    message: "Report-speak in casual text — say it plainly (boʻldi / shu yerda)",
  },
  {
    id: "aitell.chat-robotic-belgilangan",
    family: "aitell",
    re: /\bmuddat[ia]?\s+\S+\s+belgilangan\b/gi,
    severity: "warn",
    message: "Document tail 'belgilangan' — 'muddati 11-oktabrgacha' is enough",
  },
  {
    id: "aitell.chat-robotic-orqali",
    family: "aitell",
    re: /\borqali\s+hal\s+qilin(?:adi|di)\b/gi,
    severity: "warn",
    message: "Passive via-orqali — 'Operatorlar bn yozing, hal qiladi'",
  },
  {
    id: "aitell.chat-robotic-payment",
    family: "aitell",
    re: /\bmuvaffaqiyatli\s+amalga\s+oshirildi\b/gi,
    severity: "warn",
    chatOnly: true,
    message: "Fintech status register in casual chat — 'Toʻlov oʻtdi' (the long form belongs to payment UI only)",
  },
  {
    id: "aitell.ai-tic-en",
    family: "aitell",
    re: /\b(?:eʼtiboringiz\s+uchun\s+rahmat|sizga\s+maʼlum\s+boʻlishi\s+kerakki|ishonchingiz\s+komil\s+boʻlishi\s+mumkin|umumiy\s+olganda)\b/gi,
    severity: "warn",
    message: "Literally translated English AI tic — 'Thank you for your attention' / 'you should know that' / 'You can be sure' have no native chat equivalent; cut or say it plainly",
  },
];

const BULLET_LINE = /^\s*(?:[-*+•▪]|\d+[.)])\s+\S/;

/**
 * A line opening with "- " glued to a prose paragraph is a dash, not a list:
 * the previous line is prose (not blank, not a heading, not a bullet, not
 * ending in ":") and no neighbouring line is a bullet. Real markdown lists
 * (adjacent bullets, or a list after a heading / blank line / colon) pass.
 */
export function lintLeadingDash(text: string): Finding | null {
  const lines = text.split(/\r?\n/);
  let count = 0;
  let first: { line: number; match: string } | null = null;
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(?:```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence || !/^\s*- \S/.test(line)) continue;
    const prev = i > 0 ? lines[i - 1] : "";
    const next = i + 1 < lines.length ? lines[i + 1] : "";
    if (!prev.trim()) continue; // list after a blank line / at text start
    if (BULLET_LINE.test(prev) || BULLET_LINE.test(next)) continue; // a real list
    if (/^\s*#/.test(prev) || /[:：]\s*$/.test(prev)) continue; // list under a heading or colon
    if (/^\s*\|/.test(prev)) continue; // table context
    count++;
    if (!first) first = { line: i + 1, match: line.trim().slice(0, 40) };
  }
  if (!first) return null;
  return {
    rule: "aitell.leading-hyphen-dash",
    family: "aitell",
    severity: "error",
    match: first.match,
    count,
    line: first.line,
    column: 1,
    message: "Line-leading '- ' used as a dash inside prose (not a list) — join it with a comma or start a new sentence",
  };
}

/** Chat-only structural checks (bullets, long sentences, perfect punctuation). */
export function lintChatStructure(text: string, register: string): Finding[] {
  if (register !== "chat") return [];
  const findings: Finding[] = [];

  const bullets = (text.match(/(?:^|\n)\s*(?:[•▪*-]|\d+\.)\s+\S/g) ?? []).length;
  if (bullets > 0) {
    findings.push({
      rule: "aitell.chat-bullets",
      family: "aitell",
      severity: "warn",
      match: `${bullets} bullet line(s)`,
      count: bullets,
      message: "Bullet list inside a chat message — chat uses short lines and emoji pointers (👉), not lists",
    });
  }

  const sentences = splitSentences(text);
  const long = sentences.filter((s) => s.words.length > 15);
  if (long.length) {
    findings.push({
      rule: "aitell.chat-long-sentence",
      family: "aitell",
      severity: "warn",
      match: `${long[0].words.length} words`,
      count: long.length,
      message: "Chat sentences run short (mined Telegram mean ~10 words); split anything over 15",
    });
  }

  // perfect punctuation: every sentence capitalized + terminated, no informal markers
  const INFORMAL_MARK = /(?:[ʻ'‘`]|-ku|-chi|-da\b|-yov|xaxa|\)\)+|nma|qale|kere\b|bn\b|kk\b|[👇✅🔥😂👍])/i;
  if (sentences.length >= 3) {
    const clipped = sentences.every((s) => s.words.length <= 3) && sentences.some((s) => s.words.length === 1); // "Rahmat. Boʻldi. Yubordim."
    const perfect = sentences.every((s) => /^[A-ZÀ-ÿʻʼ"«]/.test(s.text) && /[.!?…]$/.test(s.text));
    if (perfect && !clipped && !INFORMAL_MARK.test(text)) {
      findings.push({
        rule: "aitell.perfect-punctuation",
        family: "aitell",
        severity: "info",
        match: `${sentences.length} sentences`,
        count: 1,
        message: "Too-perfect punctuation for casual chat — real chat drops capitals, terminal dots, or uses particles; loosen it",
      });
    }
  }

  return findings;
}

/** Chat ceremony: polite robotic frames a person would never type. */
export const AITELL_CHAT_CEREMONY_RULES: Rule[] = [
  {
    id: "aitell.chat-ceremony-minnatdor",
    family: "aitell",
    re: /\b(?:sizning\s+)?\w+(?:ingiz|ingizni|ingizga)?\s+uchun\s+(?:minnatdorman|minnatdorchilik\s+bildir\w*|tashakkur\w*\s+bildir\w*)\b/gi,
    severity: "warn",
    chatOnly: true,
    message: "Ceremonial thanks — 'Rahmat!' (one word, like a person)",
  },
  {
    id: "aitell.chat-ceremony-taqdim",
    family: "aitell",
    re: /\b\w+\s+taqdim\s+et(?:aman|amiz|adi)\b/gi,
    severity: "warn",
    chatOnly: true,
    message: "Presentation ceremony — 'Javob:' / 'mana:' like a person",
  },
  {
    id: "aitell.chat-ceremony-hedge",
    family: "aitell",
    re: /\b(?:olaman|boraman|qilaman|beraman)\s+deb\s+oʻylayman\b|\bumid\s+qilaman\b/gi,
    severity: "warn",
    chatOnly: true,
    message: "Hedged promise calque — say it directly or don't say it",
  },
  {
    id: "aitell.chat-ceremony-harakat",
    family: "aitell",
    re: /\b\w+(?:ni|ga)?\s+hal\s+qilishga\s+harakat\s+qil(?:aman|amiz)\b/gi,
    severity: "warn",
    chatOnly: true,
    message: "'Will try to' ceremony — 'Hal qilamiz' is the human promise",
  },
  {
    id: "aitell.chat-ceremony-tahlil",
    family: "aitell",
    re: /\b\w*\s?tahlil\s+qildim\b|\bkoʻrib\s+chiqdim\s+va\s+tahlil\s+qildim\b/gi,
    severity: "warn",
    chatOnly: true,
    message: "Analysis ceremony — 'Oʻqib chiqdim' is what a person says",
  },
  {
    id: "aitell.chat-ceremony-malumot-mumkin",
    family: "aitell",
    re: /\b\w+\s+maʼlumot\s+berishim\s+mumkin\b/gi,
    severity: "warn",
    chatOnly: true,
    message: "'… maʼlumot berishim mumkin' frame — just give the information",
  },
  {
    id: "aitell.chat-ceremony-men-sizga",
    family: "aitell",
    re: /\bMen\s+siz(?:ga|ning)?\b[^.!?]{0,50}\b(?:mumkin|kerak)\b/gi,
    severity: "info",
    chatOnly: true,
    message: "'Men sizga … mumkin' opener — drop the frame, give the thing",
  },
];

export function lintAitell(text: string, opts: LintOptions = {}): Finding[] {
  const register = opts.register ?? "product";
  const findings: Finding[] = [];

  // dashes: hard rule 2 bans them in every register (output policy)
  findings.push(...ruleFindings(text, AITELL_GLOBAL_RULES, opts));
  const leading = lintLeadingDash(text);
  if (leading) findings.push(leading);

  const scoped = AITELL_SCOPED_RULES.map((r) => {
    if ((r as Rule & { chatOnly?: boolean }).chatOnly && register !== "chat") return null;
    if ((r as Rule & { skipInFormal?: boolean }).skipInFormal && FORMAL_REGISTERS.has(register)) return null;
    if (FORMAL_REGISTERS.has(register)) return null; // formal: casual tells skipped entirely
    if (register === "chat") return { ...r, severity: "error" as const };
    return r;
  }).filter((r): r is Rule => r !== null);
  findings.push(...ruleFindings(text, scoped, opts));
  findings.push(...ruleFindings(text, AITELL_CHAT_CEREMONY_RULES.filter((r) => register === "chat" || !(r as Rule & { chatOnly?: boolean }).chatOnly), opts));
  findings.push(...lintChatStructure(text, register));
  return findings;
}
