/**
 * Cyrillic ⇄ Latin transliteration for Uzbek, with the hard cases:
 *
 *  ц → ts (but -ция → -siya: функция → funksiya; концерт → konsert by lexicon)
 *  ё → yo, ю → yu, я → ya (always, unlike Russian word-final rules)
 *  е → ye word-initially and after ъ, ь, or a vowel (ер → yer, ешик → yeshik);
 *      otherwise e (мен → men)
 *  ъ → ʼ tutuq (маъно → maʼno), but dropped before е/ё/ю/я (объект → obyekt)
 *  ь → dropped (только → toʻlqinsiz; батальон → batalyon via ьо → yo)
 *  ы → i, э → e, щ → sh
 *  ў → oʻ, қ → q, ғ → gʻ, ҳ → h, х → x
 *
 * ALL-CAPS words map to ALL-CAPS digraphs (ЎЗБЕКИСТОН → OʻZBEKISTON…)
 */
import { TURNED, TUTUQ } from "./text.js";

/** Stem exceptions where ц is s, not ts (prefix match, any suffix). */
const CYR_EXCEPTION_PREFIXES: [string, string][] = [["концерт", "konsert"]];

function applyException(word: string): { latin: string; consumed: number } | null {
  const lower = word.toLowerCase();
  for (const [cyr, lat] of CYR_EXCEPTION_PREFIXES) {
    if (lower.startsWith(cyr)) {
      // preserve capitalization style of the first letter
      const firstUpper = /^[ЈA-Z\u0410-\u042F\u0400-\u040F\u04E0\u04E2\u04EE\u04B2]/.test(word);
      const latinStem = firstUpper ? lat[0].toUpperCase() + lat.slice(1) : lat;
      return { latin: latinStem, consumed: cyr.length };
    }
  }
  return null;
}

function capitalizeDigraph(s: string): string {
  return s[0].toUpperCase() + s.slice(1);
}

const SINGLE: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", ж: "j", з: "z", и: "i", й: "y",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
  у: "u", ф: "f", х: "x", ч: "ch", ш: "sh", щ: "sh", ы: "i", э: "e",
  ў: `o${TURNED}`, "қ": "q", "ғ": `g${TURNED}`, "ҳ": "h",
  ё: "yo", ю: "yu", я: "ya",
};

const SINGLE_UPPER: Record<string, string> = {
  А: "A", Б: "B", В: "V", Г: "G", Д: "D", Ж: "J", З: "Z", И: "I", Й: "Y",
  К: "K", Л: "L", М: "M", Н: "N", О: "O", П: "P", Р: "R", С: "S", Т: "T",
  У: "U", Ф: "F", Х: "X", Ч: "CH", Ш: "SH", Щ: "SH", Ы: "I", Э: "E",
  Ў: `O${TURNED}`, "Қ": "Q", "Ғ": `G${TURNED}`, "Ҳ": "H",
  Ё: "YO", Ю: "YU", Я: "YA",
};

function wordIsAllCapsCyr(word: string): boolean {
  const letters = word.match(/[\u0410-\u042F\u0400-\u040F\u04E0\u04E2\u04EE\u04B2]/g) ?? [];
  const lower = word.match(/[\u0430-\u044F\u0450-\u045F\u04E1\u04E3\u04EF\u04B3]/g) ?? [];
  return letters.length > 0 && lower.length === 0;
}

/** Convert one Cyrillic word to Latin. */
function wordToLatin(word: string): string {
  const caps = wordIsAllCapsCyr(word);
  const out: string[] = [];
  let i = 0;

  const exc = applyException(word);
  if (exc) {
    out.push(caps ? exc.latin.toUpperCase() : exc.latin);
    i = exc.consumed;
  }

  for (; i < word.length; i++) {
    const ch = word[i];
    const lower = ch.toLowerCase();
    const isUpper = lower !== ch;

    if (lower === "ц") {
      // ция → siya (функция → funksiya, конференция → konferensiya)
      if (word.slice(i + 1, i + 4).toLowerCase() === "ия") {
        out.push(isUpper || caps ? "S" : "s");
        out.push(caps ? "IYA" : "iya");
        i += 2;
      } else {
        out.push(isUpper || caps ? "TS" : "ts");
      }
      continue;
    }

    if (lower === "е") {
      const atStart = i === 0 || (exc && i === exc.consumed);
      const prev = word[i - 1];
      const afterHardSoft = prev === "ъ" || prev === "ь" || prev === "Ъ" || prev === "Ь";
      const afterVowel = prev ? "аеёиоуыэюяў".includes(prev.toLowerCase()) : false;
      const ye = atStart || afterHardSoft || afterVowel;
      const val = ye ? "ye" : "e";
      out.push(caps ? val.toUpperCase() : isUpper ? capitalizeDigraph(val) : val);
      continue;
    }

    if (lower === "ъ") {
      // dropped before е/ё/ю/я — the following letter supplies the y
      const next = word[i + 1]?.toLowerCase();
      if (next === "е" || next === "ё" || next === "ю" || next === "я") continue;
      out.push(TUTUQ);
      continue;
    }

    if (lower === "ь") {
      // dropped; ьо → yo
      const next = word[i + 1]?.toLowerCase();
      if (next === "о") {
        out.push(caps ? "YO" : isUpper ? "Yo" : "yo");
        i += 1; // consume the о
      }
      continue;
    }

    const mapped = SINGLE[lower];
    if (mapped) {
      if (caps) out.push(mapped.toUpperCase());
      else if (isUpper) out.push(mapped.length > 1 ? capitalizeDigraph(mapped) : mapped.toUpperCase());
      else out.push(mapped);
      continue;
    }

    out.push(ch); // pass through digits, punctuation, Latin letters
  }
  return out.join("");
}

/** Cyrillic → Latin. Non-Cyrillic characters pass through untouched. */
export function cyrillicToLatin(text: string): string {
  return text.replace(/[\u0400-\u04FF\u02BC]+/gu, (word) => {
    if (!/[\u0400-\u04FF]/.test(word)) return word; // lone ʼ etc.
    return wordToLatin(word);
  });
}

/** Latin → Cyrillic, longest-match first. Input should already be normalized. */
const LAT_TOKENS: [RegExp, string][] = [
  [new RegExp(`^o${TURNED}`), "ў"],
  [new RegExp(`^g${TURNED}`), "ғ"],
  [/^Oʻ/, "Ў"],
  [/^Gʻ/, "Ғ"],
  [/^sh/, "ш"],
  [/^Sh/, "Ш"],
  [/^SH/, "Ш"],
  [/^ch/, "ч"],
  [/^Ch/, "Ч"],
  [/^CH/, "Ч"],
  [/^ts/, "ц"],
  [/^Ts/, "Ц"],
  [/^TS/, "Ц"],
  [/^yo/, "ё"],
  [/^Yo/, "Ё"],
  [/^YO/, "Ё"],
  [/^yu/, "ю"],
  [/^Yu/, "Ю"],
  [/^YU/, "Ю"],
  [/^ya/, "я"],
  [/^Ya/, "Я"],
  [/^YA/, "Я"],
  [/^ye/, "е"],
  [/^Ye/, "Е"],
  [/^YE/, "Е"],
];

/** Hard-sign stems: Latin y stands for Cyrillic ъ + е/о. */
const LAT_LEXICON: [RegExp, string][] = [
  [/^obyekt/i, "объект"],
  [/^subyekt/i, "субъект"],
  [/^obyom/i, "объём"],
  [/^obyavlan/i, "объявлян"],
];

const LAT_SINGLE: Record<string, string> = {
  a: "а", b: "б", v: "в", g: "г", d: "д", e: "е", j: "ж", z: "з", i: "и",
  y: "й", k: "к", l: "л", m: "м", n: "н", o: "о", p: "п", r: "р", s: "с",
  t: "т", u: "у", f: "ф", x: "х", q: "қ", h: "ҳ",
  A: "А", B: "Б", V: "В", G: "Г", D: "Д", E: "Е", J: "Ж", Z: "З", I: "И",
  Y: "Й", K: "К", L: "Л", M: "М", N: "Н", O: "О", P: "П", R: "Р", S: "С",
  T: "Т", U: "У", F: "Ф", X: "Х", Q: "Қ", H: "Ҳ",
};

function capitalizeFirst(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function wordToCyrillic(word: string): string {
  // -siya endings reverse-map to Cyrillic -ция (funksiya → функция, konferensiya → конференция)
  if (/siya$/i.test(word) && word.length >= 6) {
    const stem = word.slice(0, -4); // drop "siya"
    if (stem.length >= 3) return wordToCyrillic(stem) + "ция";
  }
  for (const [re, cyr] of LAT_LEXICON) {
    const m = word.match(re);
    if (m) {
      const rest = word.slice(m[0].length);
      const cap = word[0] === word[0].toUpperCase();
      return (cap ? capitalizeFirst(cyr) : cyr) + (rest ? wordToCyrillic(rest) : "");
    }
  }
  const out: string[] = [];
  let i = 0;
  while (i < word.length) {
    let matched = false;
    for (const [re, cyr] of LAT_TOKENS) {
      const m = re.exec(word.slice(i));
      if (m) {
        out.push(cyr);
        i += m[0].length;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    const ch = word[i];
    if (ch === TUTUQ) {
      out.push("ъ");
      i++;
      continue;
    }
    if (ch === "w" || ch === "W") {
      // informal chat-typing for sh — restore conservatively
      out.push("ш");
      i++;
      continue;
    }
    out.push(LAT_SINGLE[ch] ?? ch);
    i++;
  }
  return out.join("");
}

/** Latin → Cyrillic. Handles word-initial `ye` → `е` (yeshik → ешик). */
export function latinToCyrillic(text: string): string {
  return text.replace(/[A-Za-zʻʼ]+/g, (word) => {
    // word-initial "ye" was only ever a spelling of initial е
    let w = word;
    if (/^ye/i.test(w) && w.length > 2) w = w[0] === "Y" ? "E" + w.slice(2) : w.slice(1);
    const cyr = wordToCyrillic(w);
    // preserve initial capitalization (Yerkin → Еркин, not йеркин)
    if (/^[A-Z]/.test(word) && /^[а-яёўқғҳ]/.test(cyr)) return capitalizeFirst(cyr);
    return cyr;
  });
}

export type TranslitTarget = "latin" | "cyrillic";

export function translit(text: string, to: TranslitTarget = "latin"): string {
  return to === "latin" ? cyrillicToLatin(text) : latinToCyrillic(text);
}
