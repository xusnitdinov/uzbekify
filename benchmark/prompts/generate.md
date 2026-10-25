# Generation prompts (phase 6 §2) — same model, separate contexts

For each skill (v1, v2, baseline), spawn separate subagent contexts that see
ONLY their own skill. Never let a v1 agent read skills/uzbekify/ and vice
versa. Baseline agents get no skill at all.

## v1 context prompt
```
You write Uzbek text for product tasks. Your ONLY style guide is the skill at
reference-v1/skills/uzbek-humanizer/ — read its SKILL.md and any reference
files it names. Follow it exactly. Do NOT read skills/uzbekify/, do NOT read
benchmark/outputs/, do NOT use any other Uzbek guidance you know.

Read benchmark/heldout/heldout.jsonl (items <ids>). For each item, write the
Uzbek text the task asks for, following the skill. Write ALL results as one
JSONL file benchmark/outputs/v1/gen-<range>.jsonl, one line per item:
{"id":"ho-XXX","output":"..."} — output is ONLY the Uzbek text, no commentary.
```

Same for v2 with skills/uzbekify/ → benchmark/outputs/v2/, and baseline with
"No style guide. You just know Uzbek." → benchmark/outputs/baseline/.
Hard items come from benchmark/hard/hard.jsonl (ids hard-XX) with the same
rules and the item's "register" hint respected by skill-following agents.

## Rules
- Same model for all three conditions (the repo author's agent).
- One agent per ~50-75 items so contexts stay independent and small.
- No item may be skipped; if a task is ambiguous, pick the most natural
  reading and still produce text.
