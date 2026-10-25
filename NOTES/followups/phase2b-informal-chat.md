# Phase 2b: real informal Uzbek (MOST IMPORTANT for the core mission)

Collect public, informal Latin-Uzbek text from these sources:
- Telegram web previews (https://t.me/s/<channel>) of popular Uzbek channels
- comment sections on Uzbek news sites
- uforum.uz threads
- public Uzbek forums and Q&A pages

Save it to research/informal-corpus/ with source URLs. Strip all usernames and personal data.

Mine this text for real chat patterns:
- short messages and dropped subjects
- particles: -chi, -da, -u, -ku, -a, -yu, -mi, axir, endi
- spoken forms: nma, qale, bovotti, kere, boladi, yoq
- RU and EN code-switching
- emoji and laughter (xaxa, ")))")
- greetings and sign-offs
- how people mix oʻ / o' / o` in casual writing

Write references/informal-chat.md with real anonymized examples, each paired with a robotic AI version of the same message.

Add a "chat" register preset and a playbook for Telegram-style DMs and posts.

Add a linter rule and score penalties for robotic tells:
- em dashes and en dashes, including " - " used as a dash
- semicolons
- bullet lists in chat
- long sentences
- formal connectors in casual text (shuningdek, binobarin, mazkur, ushbu)
- stacked adjectives
- perfect punctuation in casual register
- literally translated English AI tics

By default the skill must NEVER output em or en dashes in any register. Rewrite them with commas, periods or a restructured sentence.

Add eval cases and tests for all of this.
