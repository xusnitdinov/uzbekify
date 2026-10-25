/** Orthography family: apostrophe marks, digraph integrity, dropped marks. */
import { Finding } from "../types.js";
import { stripEnglishContractions } from "../text.js";
import { ruleFindings, Rule } from "./util.js";

const EN_APOS =
  /\b(?:[Ii]'m|[Ww]e'd|[Yy]ou're|[Tt]hey're|[Ww]ho's|[Ww]hat's|[Ii]t's|[Tt]hat's|[Tt]here's|[Hh]ere's|[Ll]et's|[Oo]ne's|[Ww]on't|[Cc]an't|[Dd]on't|[Ii]sn't|[Aa]ren't|[Hh]aven't|[Hh]asn't|[Dd]oesn't|[Dd]idn't|[Ss]houldn't|[Ww]ouldn't|[Cc]ouldn't|[Oo]'[Bb]rien|[Oo]'[Cc]onnor)\b/;

export const ORTHO_RULES: Rule[] = [
  {
    id: "ortho.ascii-o-g",
    family: "ortho",
    re: /[OoGg]['\u2018\u2019]/,
    severity: "error",
    message: "Use oʻ/gʻ with ʻ (U+02BB), not ASCII/curly quotes",
    skipText: (text) => !/[OoGg]['\u2018\u2019]/.test(stripEnglishContractions(text)),
  },
  {
    id: "ortho.digraph-tutuq",
    family: "ortho",
    re: /[OoGg]\u02BC/,
    severity: "error",
    message: "o/g digraph used tutuq ʼ — must be ʻ (U+02BB)",
  },
  {
    id: "ortho.ascii-apostrophe-any",
    family: "ortho",
    re: /[A-Za-z]['\u2018\u2019][A-Za-z]/,
    severity: "error",
    message: "Bad apostrophe inside a word — check oʻ/gʻ/ʼ (run uzpro normalize)",
    skipText: (text) => !/[A-Za-z]['\u2018\u2019][A-Za-z]/.test(stripEnglishContractions(text)),
  },
  {
    id: "ortho.grave-any",
    family: "ortho",
    re: /[\u2018\u2019]/,
    severity: "warn",
    message: "Curly quote mark found — normalize to ʻ (U+02BB) / ʼ (U+02BC)",
  },
  {
    id: "ortho.reform-letter",
    family: "ortho",
    re: /[öõóòōğşçÖÕÓÒŌĞŞÇ]/,
    severity: "warn",
    message: "2026-reform letter in output — current alphabet is oʻ/gʻ/sh/ch (uzpro normalize fixes inbound)",
  },
  {
    id: "ortho.missing-turned",
    family: "ortho",
    re: /\b(?:ozbek\w*|togr\w*|soglom\b|buladi|uzinda|ozini|oziga|ozidan)\b/gi,
    severity: "error",
    message: "Missing ʻ on oʻ/gʻ words — ozbek→oʻzbek, togri→toʻgʻri, buladi→boʻladi (run uzpro normalize where marked)",
  },
  {
    id: "ortho.missing-tutuq",
    family: "ortho",
    re: /\b(?:sanat\b|qatiy\b|masul\b|talim\b|marifat\b)\b/gi,
    severity: "error",
    message: "Missing tutuq ʼ — sanʼat, qatʼiy, masʼul, taʼlim, maʼrifat",
  },
];

export function lintOrtho(text: string): Finding[] {
  return ruleFindings(text, ORTHO_RULES);
}
