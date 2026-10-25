# Agent self-check loop (draft → score → fix → repeat)

Use this loop whenever you produce or rewrite Uzbek. Repeat until the score
is at least 90 — usually one or two passes.

```
1. Draft/re-write the text following SKILL.md's 8-step ladder.
2. Run:  echo "<matn>" | uzpro score -            (or uzpro score file.md)
3. If score >= 90 and no [error] findings → done; include the score in Holat.
4. Otherwise list the top deductions (they are sorted by points):
   - fix every [error] first (ortho, calque, suffix, register mix),
   - then [warn] families (officialese, passive, wordorder…),
   - then add ONE human-voice signal if the bonus is 0 (chat registers).
5. Re-run step 2. Max 3 passes; if still < 90, the draft needs a full
   rewrite from the meaning, not more patches.
```

MCP users: call `uz_score`, fix, then `uz_rewrite_plan` for the remaining
steps with spans, and `uz_lint` for the final check.

Example pass: "Mazkur xizmat uchun ariza topshirilishi lozim." → score 95→?
rewrite "Bu xizmat uchun ariza yozing." → 100 (human-voice bonus may apply
with a second sentence). Report both scores in Oʻzgarishlar.
