# Phase 6: the v1 vs v2 BENCHMARK (the headline deliverable)

Goal: a fair, reproducible benchmark that shows a BIG, real difference between uzbek-humanizer (v1, reference-v1/) and uzbek-humanizer-pro (v2). It must be honest. Don't tune v2 on the test set, and don't cherry-pick.

1. Held-out test set: benchmark/heldout/. Build it BEFORE looking at v2's rules again, and freeze it with a sha256 hash recorded in benchmark/HASHES.
   - At least 150 items, written fresh. Mix: chat/Telegram (30), UI microcopy (25), marketing (25), translation from English (25), translation from Russian (20), formal letter (15), news-style summary (10).
   - Each item has a task prompt and, where possible, a real human reference taken from the informal and gov corpora.
   - Items must NOT come from any file v2's rules were developed on.
2. Generation. For every item, produce TWO outputs:
   - (a) with ONLY v1's SKILL.md and references loaded as instructions
   - (b) with ONLY v2's SKILL.md and references loaded
   Use the same model (yourself) and the same prompt wrapper for both. Use separate subagents/contexts if available so neither sees the other skill. Also produce (c) a no-skill baseline. Save everything to benchmark/outputs/{baseline,v1,v2}/.
3. Automatic metrics on all three output sets:
   - v2 naturalness score
   - v1 linter hits
   - v2 linter hits
   - dash count (em/en/" - ")
   - officialese/bureaucratic phrase rate
   - Russian calque rate
   - apostrophe/script errors
   - sentence length vs the human corpus baseline
   - particle/spoken-form use in the chat register
   - lexical overlap with the human references (chrF)
   Report means, confidence intervals and win rates.
4. Blind pairwise judging. For each item, show v1 vs v2 outputs in random order, labeled A and B. Judge which sounds more like a real native Uzbek human, using the rubric in reference-v1 eval/bakeoff-rubric.md extended for naturalness. Record the reasoning. Use a separate judge context that doesn't know which is which. Report v2 win, tie and loss rates per category.
5. Native review kit. Export benchmark/native-review.html: a simple offline page showing a random 40-item blind A/B sample. A human (the author, a native Uzbek speaker) picks the better one per item, and the page shows the unblinded result at the end. This is the gold standard. Make it pretty and easy to use.
6. Report.
   - benchmark/BENCHMARK.md with tables per category, an overall verdict, and 10 striking side-by-side examples where v2 sounds clearly more human.
   - Also include any examples where v1 won, for honesty.
   - Generate charts as SVG in benchmark/charts/.
   - Put the headline numbers and a chart in README.md.
   - Make it a single `npm run bench` command, reproducible from scratch.
7. If v2 does NOT clearly win (at least 70% pairwise win rate overall), DO NOT fake it. Go back, improve v2's SKILL.md, references and rules using what the losses teach you (never the held-out items themselves), then rerun on a SECOND fresh held-out set. Repeat until v2 clearly wins. Document every iteration in BENCHMARK.md.
8. Keep all tests passing. Never git push or npm publish.

## 9. HARD MODE tier (user request: make some benchmarks VERY hard, and v2 must pass them)

Build a separate benchmark/hard/ set of at least 60 brutal items, frozen and hashed like the held-out set. Include:
- Long multi-paragraph texts (300+ words) where robotic patterns are subtle and spread out.
- Register switches inside one task, e.g. a formal letter that quotes a casual Telegram message, or a UI with both error copy and marketing copy.
- Heavy Uzbek, Russian and English code-mixing where some loans are correct and must be KEPT (over-correcting fails).
- Cyrillic and Latin mixed in the same input, plus wrong apostrophes (', `, ‘, ʼ) everywhere.
- Idioms, proverbs, sarcasm, humor and youth slang that must stay natural and not get flattened.
- Robotic text with NO obvious red flags: grammatical, no calques, but still clearly AI-sounding (rhythm, generic phrasing, over-politeness, symmetric structure, every sentence the same length).
- Gov and legal text that must STAY formal and correct. Making it casual counts as a failure.
- Translation traps from English and Russian: false friends, aspect and modality, evidentials (-ibdi, -gan ekan), and politeness levels (siz, sen, sizlar).
- Inputs already written by a native human, which v2 must leave basically unchanged. Any unnecessary rewrite counts as a failure.
- Dash-heavy English-style text that has to be restructured without dashes, without breaking the meaning.

Each item needs explicit pass criteria (a checklist in hard/criteria.jsonl) checked by both automatic tests and the blind judge.
- Report the hard-tier pass rate separately for baseline, v1 and v2.
- Target: v2 passes at least 85% of the hard tier, and v1 should score much lower.
- If v2 falls short, improve v2's general rules using what failures teach you. Never hardcode answers to the hard items. Then verify on a SECOND fresh hard set, so it's not overfitting.
- Document all of this in BENCHMARK.md under a "Hard mode" section.

## 10. FINAL v1 rerun (user request, do this at the very END)

After v2 is fully finished and frozen, rerun EVERY benchmark on v1 one last time: the held-out set(s), the hard tier(s), the automatic metrics, and the blind pairwise judging. v1 here means the user's published GitHub version, reference-v1/ (github.com/xusnitdinov/uzbek-humanizer). Run the exact same `npm run bench` pipeline on v1 and v2 so the final numbers are a true apples-to-apples comparison. Put a final "v1 (GitHub) vs v2" table at the top of BENCHMARK.md and README.md with every metric side by side.
