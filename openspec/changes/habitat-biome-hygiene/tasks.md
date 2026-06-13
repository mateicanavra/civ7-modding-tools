## 1. Biome Setup

- [ ] 1.1 `bun add -d -E @biomejs/biome`; `bunx --bun @biomejs/biome init`;
  configure `biome.json` (formatter matching `.prettierrc` semantics; linter
  scoped per proposal; excludes for generated zones, `mod/**`, `dist/**`,
  `.nx`, `.civ7/outputs`, `docs/_archive`, vendor files).
- [ ] 1.2 Dry-run `biome format` repo-wide; review diff size; adjust config
  until the delta is the accepted one-time cost (record stats in phase
  record).

## 2. Reformat And Prettier Retirement

- [ ] 2.1 Capture pre-reformat build-output hashes (`mod/**`).
- [ ] 2.2 Dedicated format-only commit: `bunx --bun @biomejs/biome format
  --write .`; add commit SHA to new `.git-blame-ignore-revs`.
- [ ] 2.3 Remove `.prettierrc` and prettier references (deps, docs, editor
  config); `bun install`.
- [ ] 2.4 Verify build/test green and `mod/**` byte parity with 2.1 hashes.

## 3. Lint Hygiene Lane

- [ ] 3.1 Enable Biome linter with the minimal green rule set; for each
  desired-but-red recommended rule, register a rule-pack entry with a ratchet
  baseline instead of disabling silently (list in phase record).
- [ ] 3.2 Wire harness: `biome:format|check|ci` inferred targets; `habitat
  fix` runs format + safe assists; `habitat check` runs `biome:ci`; CI
  affected targets include `biome:ci`.

## 4. Verification And Closure

- [ ] 4.1 All proposal verification gates pass (biome ci, parity, blame probe,
  habitat integration, no prettier residue).
- [ ] 4.2 Harness README documents editor setup and the never-`lint`-named
  target convention.
- [ ] 4.3 `bun run openspec -- validate habitat-biome-hygiene --strict`;
  realign docs; close per workstream record.
