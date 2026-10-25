import { describe, expect, it } from "vitest";
import { normalize, lintReport, mapReformInbound } from "../src/lib/normalize.js";
import { TURNED, TUTUQ } from "../src/lib/text.js";

describe("normalize (v1-compatible apostrophe handling)", () => {
  const cases: [string, string][] = [
    ["to'g'ri", `to${TURNED}g${TURNED}ri`],
    [`to${TURNED}g${TURNED}ri`, `to${TURNED}g${TURNED}ri`],
    ["do'stim", `do${TURNED}stim`],
    ["ma'no", `ma${TUTUQ}no`],
    ["va'da", `va${TUTUQ}da`],
    ["Who's there?", "Who's there?"],
    ["I'm fine", "I'm fine"],
    [`tx("to'g'ri", "Who's right?", "ok")`, `tx("to${TURNED}g${TURNED}ri", "Who's right?", "ok")`],
    [`{"uz":"to'g'ri","en":"Who's there?"}`, `{"uz":"to${TURNED}g${TURNED}ri","en":"Who's there?"}`],
    ["bo\u02BClmayapti", `bo${TURNED}lmayapti`],
    ["q\u00F6\u015Filaman", `qo${TURNED}shilaman`],
    ["Payme Go'da", `Payme Go${TUTUQ}da`],
    ["PUBG'ga", `PUBG${TUTUQ}ga`],
    ["Uzum'da", `Uzum${TUTUQ}da`],
    ["TO'G'RI", `TO${TURNED}G${TURNED}RI`],
    ["tool'da", `tool${TUTUQ}da`],
  ];
  it.each(cases)("%s → %s", (input, expected) => {
    expect(normalize(input)).toBe(expected);
  });

  it("never turns a digraph into tutuq", () => {
    expect(normalize("to'g'ri do'st")).not.toMatch(/[OoGg]\u02BC/);
  });

  it("protects code blocks, URLs, placeholders", () => {
    expect(normalize("`who's here` to'g'ri")).toBe("`who's here` toʻgʻri".replace("toʻ", `to${TURNED}`));
    expect(normalize("https://x.io/who's to'g'ri")).toContain("who's");
    expect(normalize("{count} to'g'ri")).toContain("{count}");
  });

  it("maps reform letters inbound only", () => {
    expect(mapReformInbound("Toğri qöşilaman Ŝ")).not.toMatch(/[öğşç]/);
    expect(normalize("\u00D5ZIDAN")).toBe(`O${TURNED}ZIDAN`);
  });

  it("lintReport finds residuals", () => {
    expect(lintReport(`bo${TUTUQ}lmayapti`)).toHaveLength(1);
    expect(lintReport(`to${TURNED}g${TURNED}ri`)).toHaveLength(0);
    expect(lintReport("qat'iy")).toHaveLength(1); // raw ASCII flagged; normalize fixes it
  });
});
