# Phase 2: research and agent superpowers

(A) Research. Use the terminal to fetch real Latin-Uzbek text from the web: uz.wikipedia.org via the MediaWiki API, kun.uz, gazeta.uz, daryo.uz and Uzbek Wikisource. Save a cleaned corpus in research/corpus/ with source URLs. Remember the CORE MISSION: this corpus is for spelling, vocabulary and frequency only, NOT a model of how to sound. Mine it with scripts for word frequencies, collocations, connectors, suffix-chain patterns and sentence-length distributions. Write research/FINDINGS.md and turn the findings into data files the linters use: frequency lists for picking native synonyms, a collocation bank, and cadence baselines.

(B) Agent superpowers.
- An MCP server (stdio, TypeScript, @modelcontextprotocol/sdk) exposing these tools: uz_lint, uz_rewrite_plan (a step-by-step fix plan with spans), uz_score, uz_translit, uz_glossary_lookup, uz_calque_check, and uz_synonym_suggest (ranked by corpus frequency and register).
- JSON output and SARIF output for CI.
- A GitHub Action and a pre-commit hook.
- An i18n mode that lints locale files (json/yaml/po) key by key.
- A batch mode for whole folders.
- Sub-skills and playbooks for: UI microcopy, marketing, Telegram posts, formal letters, and EN or RU to natural Uzbek translation.
- A self-check loop prompt for agents: draft, run uz_score, fix the top issues, and repeat until the score is at least 90.

(C) Write tests for all of the above. Keep build, tests and eval passing, and update README.md and EVAL_RESULTS.md.
