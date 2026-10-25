/** Format family: money, dates, phone formatting for Uzbek UI/prose. */
import { Finding } from "../types.js";
import { ruleFindings, Rule, hasAnyUzbek } from "./util.js";

export const FORMAT_RULES: Rule[] = [
  {
    id: "fmt.money-dollar",
    family: "format",
    re: /\$\s?\d[\d.,]*/g,
    severity: "warn",
    message: "Dollar amount in $1,250,000 form — Uzbek UI writes sums as 1 250 000 soʻm / 100 dollardan",
    skipMatch: (m, text) => !hasAnyUzbek(text, m),
  },
  {
    id: "fmt.money-comma",
    family: "format",
    re: /\b\d{1,3},\d{3}\b\s*(?:soʻm|sum)/gi,
    severity: "warn",
    message: "Thousands separator in soʻm amounts is a space: 1 250 000 soʻm",
  },
  {
    id: "fmt.date-en",
    family: "format",
    re: /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4}\b|\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
    severity: "warn",
    message: "EN date format — Uzbek writes 2024-yil 9-avgust",
    skipMatch: (m, text) => !hasAnyUzbek(text, m),
  },
  {
    id: "fmt.date-dotted",
    family: "format",
    re: /\b\d{2}\.\d{2}\.\d{4}(?:-yil)?\b/g,
    severity: "warn",
    message: "Dotted date — Uzbek standard is 2024-yil 1-may",
  },
];

export function lintFormat(text: string): Finding[] {
  return ruleFindings(text, FORMAT_RULES);
}
