## 1. Biome Setup

- [x] 1.1 `bun add -d -E @biomejs/biome`; `bunx --bun @biomejs/biome init`;
  configure `biome.json` (formatter matching `.prettierrc` semantics; linter
  scoped per proposal; excludes for generated zones, `mod/**`, `dist/**`,
  `.nx`, `.civ7/outputs`, `docs/_archive`, vendor files).
- [x] 1.2 Dry-run `biome format` repo-wide; review diff size; the reformat
  delta is accepted only if confined to whitespace/quote-style/trailing-comma
  classes — verified by `git diff -w` on the reformat commit being
  empty-or-quotes/commas-only plus a sampled diff review recorded in the
  phase record (with diff stats).

## 2. Reformat And Prettier Retirement

- [x] 2.1 Capture pre-reformat build-output hashes (`mod/**`).
- [x] 2.2 Dedicated format-only commit: `bunx --bun @biomejs/biome format
  --write .`; add commit SHA to new `.git-blame-ignore-revs`.
- [x] 2.3 Remove `.prettierrc` and prettier references (deps, docs, editor
  config); `bun install`.
- [x] 2.4 Verify build/test green and build-output parity with 2.1 hashes per
  the proposal stop condition (formatting-independent `mod/**` artifacts
  byte-identical; bundled JS minify-normalized if it differs, recorded as a
  trade-off).

## 3. Lint Hygiene Lane

- [x] 3.1 Enable Biome linter with the minimal green rule set; for each
  desired-but-red recommended rule, register a rule-pack entry with a ratchet
  baseline instead of disabling silently (list in phase record).
- [x] 3.2 Wire harness: `biome:format|check|ci` inferred targets; `habitat
  fix` runs format + safe assists; `habitat check` runs `biome:ci`; CI
  affected targets include `biome:ci`.

## 4. Verification And Closure

- [x] 4.1 All proposal verification gates pass (biome ci, parity, blame probe,
  habitat integration, no prettier residue).
- [x] 4.2 Harness README documents editor setup and the never-`lint`-named
  target convention.
- [x] 4.3 `bun run openspec -- validate habitat-biome-hygiene --strict`;
  realign docs; close per workstream record.
