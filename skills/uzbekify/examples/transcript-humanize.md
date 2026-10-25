# End-to-end transcript: humanize (agent-runnable, real output)

Input file `bad.md`:

```
Mazkur xizmatdan foydalanish uchun ariza topshirilishi lozim — belgilangan
tartibda. Hurmatli foydalanuvchi, javob: select qiling; natija xabardor
qilinadi.
```

```console
$ uzpro humanize bad.md
Mazkur xizmatdan foydalanish uchun ariza topshirilishi lozim, belgilangan
tartibda. Hurmatli foydalanuvchi, javob: select qiling; natija xabardor
qilinadi.
Humanize: 34/100 → 52/100
Fixes applied (1):
  - replaced em/en/spaced-hyphen dashes with commas

Diff:
Mazkur xizmatdan foydalanish uchun ariza topshirilishi lozim {-lozim — belgilangan-} ...
```

Remaining checklist (what the agent fixes by hand, in ladder order):

1. step 1 [warn] register …
2. step 2 [error] ortho.ascii-apostrophe-any …
3. step 3 [error] calque.hurmatli-foydalanuvchi → cut it or Assalomu alaykum!
4. step 3 [error] calque.en-qil "select qiling" → belgilang
5. step 3 [warn] off.mazkur → bu / shu
6. step 3 [warn] off.belgilangan-tartibda → say the actual steps
7. step 3 [warn] off.passive-nomen-require "topshirilishi lozim" → ariza yozing

After the agent applies the checklist (target text):

```
Bu xizmat uchun ariza yozing. Javobni belgilab, natijani yozib yuboramiz.
```

```console
$ uzpro score - <<< "Bu xizmat uchun ariza yozing. Javobni belgilab, natijani yozib yuboramiz."
Naturalness: 100/100 (publish)
```
