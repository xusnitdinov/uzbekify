import { describe, expect, it } from "vitest";
import { lintOrtho } from "../src/lib/linters/ortho.js";

const rules = (t: string) => lintOrtho(t).map((f) => f.rule);

describe("ortho linter", () => {
  it("flags ascii/curly apostrophes on o/g", () => {
    expect(rules("to'g'ri")).toContain("ortho.ascii-o-g");
    expect(rules("bo‘lsa")).toContain("ortho.ascii-o-g");
  });

  it("flags tutuq used as digraph mark", () => {
    expect(rules("bo\u02BClmayapti")).toContain("ortho.digraph-tutuq");
  });

  it("keeps English contractions clean", () => {
    expect(lintOrtho("Who's on first? I'm fine.")).toHaveLength(0);
    expect(lintOrtho("one's own task")).toHaveLength(0);
  });

  it("flags reform letters", () => {
    expect(rules("Toğri qöshilaman")).toContain("ortho.reform-letter");
  });

  it("flags missing turned/comma marks (ozbek, togri, buladi, sanat)", () => {
    expect(rules("ozbek tili")).toContain("ortho.missing-turned");
    expect(rules("togri javob")).toContain("ortho.missing-turned");
    expect(rules("buladi")).toContain("ortho.missing-turned");
    expect(rules("bu sanat asari")).toContain("ortho.missing-tutuq");
    expect(rules("taʼlim va maʼrifat")).not.toContain("ortho.missing-tutuq");
  });

  it("clean Uzbek passes", () => {
    expect(lintOrtho("Toʻgʻri javobni belgilang.")).toHaveLength(0);
  });
});
