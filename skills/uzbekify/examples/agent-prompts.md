# Copy-paste agent prompts (uzbekify)

## 1. Humanize a draft (any agent, CLI)
```
Use the uzbekify skill. Humanize this Uzbek text for a product UI:
"Men haqiqatan ham bu ilovani yoqtiraman. To'g'ri javobni select qiling —
ushbu imkoniyat orqali yangilashingiz mumkin."
Run: uzpro humanize on the text, apply the checklist fixes yourself, then
uzpro score --min 90 to verify. Show Matn / Oʻzgarishlar / Holat.
```

## 2. Translate EN → natural Uzbek
```
Use uzbekify (playbooks/translation-en-ru.md). Translate to natural product
Uzbek, register product, no dashes:
"Your session has expired. Please sign in again to continue."
Verify with: uzpro lint --register product and uzpro score --min 90.
```

## 3. Telegram post (chat register)
```
Use uzbekify, register chat (references/informal-chat.md). Write a short
Telegram post announcing a 20% sale this weekend, max 3 lines, one 👇,
no bullets, no dashes. Check: uzpro lint --register chat --allow-sen.
```

## 4. Cyrillic input
```
Use uzbekify. Convert to Latin, then humanize (register news):
"Тошкентда янги метро бекати очилди — тafsilotlar quyida."
Commands: uzpro translit, uzpro humanize --register news.
```

## 5. MCP round-trip (agents with MCP)
```
Connect to the uzbekify MCP server (uzpro-mcp). Use uz_rewrite_plan on my
draft, apply the plan steps in order, then confirm with uz_score that the
score is >= 90 and report the human-voice signals it detected.
```

## 6. Locale file sweep
```
Use uzbekify. Lint our locale files key by key and fix every error:
uzpro lint locales/ --i18n --format json. Report per-key findings, then
rewrite only the failing values.
```
