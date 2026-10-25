# End-to-end transcript: MCP (stdio JSON-RPC)

```console
$ npm run mcp        # or: node dist/mcp.js  (add to any MCP client config)
→ tools/list → [uz_lint, uz_rewrite_plan, uz_score, uz_translit,
               uz_glossary_lookup, uz_calque_check, uz_synonym_suggest]

tools/call uz_rewrite_plan
  { "text": "Karoche, update qilib qo'y — ushbu kod kelmayapti.",
    "register": "chat" }
→ { "steps": [
     { "step": 2, "title": "Fix script and apostrophes", "fixes": [
       { "rule": "ortho.ascii-apostrophe-any", "line": 1, "column": 18 } ] },
     { "step": 3, "title": "Kill calques", "fixes": [
       { "rule": "ru.karoche" }, { "rule": "calque.en-qil" } ] },
     { "step": 3, "title": "AI tells (dashes, tics)", "fixes": [
       { "rule": "aitell.em-dash" } ] },
     { "step": 6, "title": "Native synonyms for loanwords", "fixes": [
       { "rule": "loan.replaceable.update" } ] } ] }

tools/call uz_score { "text": "Qisqasi, yangilab qoʻy, kod kelmayapti.",
                      "register": "chat" }
→ { "score": 100, "humanVoiceBonus": 4,
    "humanVoiceSignals": ["spoken aspect (-yapti)",
                          "conversb + auxiliary (-ib qoʻy-)"] }
```
