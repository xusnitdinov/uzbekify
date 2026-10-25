# Judging prompts (phase 6 §4 + §9) — blind, separate context

## Pairwise (v1 vs v2)
```
You are a native Uzbek speaker. For each row in benchmark/judgments/pack-pairwise-N.jsonl
(task + output A + output B), decide which output sounds more like a REAL
native Uzbek human wrote it. Rubric dimensions (from reference-v1 eval/bakeoff-rubric.md,
extended): orthography, morphology, naturalness (weight heaviest), register fit,
calques, human voice (particles/rhythm). Forced choice: A, B, or tie (only when
truly equal). One line per item to benchmark/judgments/pairwise-judged-N.jsonl:
{"id":"...","better":"A|B|tie","reason":"one short sentence in English"}
Do NOT read any skill folder or outputs directory — judge only what is in the pack.
```

## Hard tier (3 anonymized slots per item)
```
You are a native Uzbek speaker checking hard-mode criteria. For each row in
benchmark/judgments/pack-hard-N.jsonl, judge EACH slot's output against the
item's criteria list (task + criteria included in the row). Judge meaning
first: does the output satisfy the check in spirit? Write one line per
(id, slot) to benchmark/judgments/hard-judged-N.jsonl:
{"id":"hard-XX","slot":"slot1","pass":true,"reason":"short"}
Do NOT read any skill folder or outputs directory.
```
