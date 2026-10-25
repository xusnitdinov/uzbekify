/**
 * Word-order family: SOV sanity checks (advisory). Natural Uzbek puts the
 * object and time/place expressions before the verb, and keeps question
 * words in situ. English-order leftovers are classic LLM tells.
 */
import { Finding } from "../types.js";
import { ruleFindings, Rule } from "./util.js";

const PRONOUN_OBJ = /\b(?:uni|meni|seni|bizni|sizni|ularni|buni|shuni)\b/i;

export const WORDORDER_RULES: Rule[] = [
  {
    id: "wo.post-verbal-object",
    family: "wordorder",
    re: new RegExp(
      `\\b(?:oʻqidi|koʻrdi|oldi|yedi|ichdi|yozdi|aytdi|topdi|sotdi|berdi|eshitdi|tushundi|oʻqiydi|koʻradi|oladi|yozadi|topadi|sotadi|olaman|koʻraman|oʻqiyman|oʻqidim|koʻrdim|topdim|berdim|qildi|qildik|qildim|qilamiz|qildingiz|tashkil qildik)\\s+(\\w+ni)\\b`,
      "gi"
    ),
    severity: "warn",
    message: "Object after the verb (EN order) — natural Uzbek is SOV: kitobni oʻqidi, oʻqidi kitobni emas",
    skipMatch: (m) => PRONOUN_OBJ.test(m),
  },
  {
    id: "wo.post-verbal-time",
    family: "wordorder",
    re: /\b(?:bordi|keldi|ketdi|qaytdi|yoʻqoldi|oʻtdi|qatnashdi|uchdi|yugurdi|koʻrdi|uchrashdi)\s+(kecha|bugun|erta bilan|kechqurun|tunda|peshin vaqtida|ertaga|darsdan keyin|ishdan keyin)\b/gi,
    severity: "warn",
    message: "Time expression after the verb (EN order) — put it before the verb-predicate: Kechqurun darsga bordi",
  },
  {
    id: "wo.wh-fronted",
    family: "wordorder",
    re: /(?:^|[.!?]\s+)(Nima|Nega|Qachon|Qayerga|Qayerda|Qanday)\s+(men|sen|siz|u|biz|ular)\s+\w+/gm,
    severity: "info",
    message: "Question word fronted like English — Uzbek keeps it in situ: 'Siz nima qilasiz?', not 'Nima siz qilasiz?'",
  },
];

export function lintWordOrder(text: string): Finding[] {
  return ruleFindings(text, WORDORDER_RULES);
}
