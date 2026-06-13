# Phase Record — H4 `habitat-biome-hygiene`

## Phase

- Project: habitat-harness (FRAME.md controlling)
- Phase: H4 — Biome hygiene, Prettier retirement, blame-shielded reformat
- Owner: workstream owner agent (Codex continuation)
- Branch/Graphite stack: `agent-F-habitat-biome-hygiene` -> `agent-F-habitat-boundary-tags` -> `agent-F-habitat-harness-scaffold` -> `agent-F-habitat-nx-adoption` -> `agent-F-habitat-harness-workstream` -> `main`
- Started: 2026-06-13
- Status: OPEN — Biome setup, format commit, blame shield, and Prettier retirement complete; task 2.4 is partially evidenced but blocked by DL-15/DL-16; Biome lint lane and harness integration remain

## Objective

- Target movement: make Biome the single owner of the hygiene layer, retire Prettier, land a dedicated blame-shielded repo-wide reformat, and wire Biome through the Habitat harness, Nx targets, `habitat fix`, `habitat check`, and CI.
- Non-goals: no product/runtime behavior changes, no Grit/file-layer rules, no changes to `eslint.config.js` except later H6 retirement, no generated-output hand edits, no semantic codemods, no out-of-scope red-test fixes.
- Done condition: H4 tasks 1.1-4.3 complete; Biome configuration and lint lane ratcheted; dedicated format-only commit recorded in `.git-blame-ignore-revs`; build-output parity verified per the proposal; habitat integration and OpenSpec validation green; Graphite branch committed cleanly.

## Authority

- Root/subtree `AGENTS.md`: root AGENTS.md governs root config, docs, package metadata, generated-output hygiene, and Graphite workflow; no closer router applies to current H4 setup files.
- Product refs: N/A (structure-only hygiene/enforcement workstream; no product behavior claim)
- Architecture refs: `docs/projects/habitat-harness/FRAME.md` hard core #1-#5, settled D3, trade-offs table, degeneration trigger; `docs/projects/habitat-harness/invariant-corpus.md` §F DL-12 formatting enforcement gap; `docs/projects/habitat-harness/review-disposition-ledger.md` F1 and F23.
- Project refs: `openspec/changes/habitat-biome-hygiene/{proposal.md,tasks.md,specs/habitat-harness/spec.md}`
- Excluded/stale inputs: stale top-level workstream-record claims that execution had not started; chat-only task state; suggested red-test triage tasks unless explicitly promoted.

## Current State

- Repo/Graphite state: active H4 branch `agent-F-habitat-biome-hygiene`, stacked above H3 (`agent-F-habitat-boundary-tags`); working diff is H4-owned evidence and guard-repair work.
- Dirty files and owner: current dirty files are the Swooper Maps contract guard plus H4 workstream records; all are owned by this H4 evidence/repair step.
- Current code evidence: H1/H2/H3 locally closed; `openspec list` showed `habitat-biome-hygiene` at 0/11 tasks at phase open; `.prettierrc` has been removed; direct `prettier` / `eslint-config-prettier` package surfaces have been removed; Biome 2.4.16 is installed and `biome.json` loads successfully; the Swooper Maps import guard now parses import declarations with TypeScript so Biome multiline imports do not create false architecture failures.
- Generated outputs affected: tracked post-format `mods/*/mod/**` hashes still match the pre-format capture exactly. A fresh root build dirties the pre-existing `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js` tracked bundle with a non-format `from "net"` import; this was not hand-edited and is recorded as DL-16 / task 2.4 stop-condition evidence.
- Tests/guards affected: the Swooper Maps contract guard now tolerates Biome multiline imports; future H4 implementation will add Biome targets/rules and CI wiring; existing `nx-boundaries` and H2 harness rules remain authoritative.

## Scope

- Write set: root Biome/Prettier config and package metadata; `.git-blame-ignore-revs`; repo-wide format-only diff; `tools/habitat-harness/**` rule pack/plugin/CLI docs for Biome targets and `habitat fix`; `.github/workflows/ci.yml`; H4 OpenSpec tasks/phase record and affected project docs.
- Protected files: generated `dist/**`, `mod/**`, `.civ7/outputs/**`, `.nx/**`, `docs/_archive/**`, official resources, and product/runtime behavior files except mechanical formatting in the dedicated reformat commit.
- Owners: Biome owns formatting, ordinary lint hygiene, import organization, and safe assists; Habitat owns rule orchestration/ratchet; Nx owns target inference/affected execution.
- Forbidden owners: no ESLint hygiene role; no Grit syntax rules; no project-plane boundary changes; no silent baseline weakening; no formatter touching generated zones.
- Consumer impact: one large blame-shielded format-only change, then deterministic hygiene enforcement through `biome:ci`, `habitat check`, and `habitat fix`.
- Downstream assumptions: H5 depends on Biome formatting for grit-apply rewrites; H7 depends on Biome staged formatting; H6 keeps ESLint boundaries-only until retirement.

## Spec/Tasks

- Spec/proposal: `openspec/changes/habitat-biome-hygiene/proposal.md` and `specs/habitat-harness/spec.md`
- Tasks: `openspec/changes/habitat-biome-hygiene/tasks.md` (0/11 at phase open)
- Validation status: `bun run openspec -- validate habitat-biome-hygiene --strict` PASS after phase-record setup

## Review

- Review lanes: pre-execution spec review CLOSED with accepted repairs; H4-specific evidence review must focus on reformat diff class, build-output parity, blame-ignore proof, ratchet baselines, and no Prettier residue.
- Blocking findings: none known at phase open.
- Accepted findings repaired: F1 serialized H4 after H3; F23 clarified H4 parity/format-diff stop condition.
- Rejected/invalidated/waived/deferred findings: none.

## Agent Fleet State

N/A - solo phase setup. Add agents before implementation review/evidence review if delegated.

## Implementation

- Completed tasks: 1.1, 1.2, 2.1, 2.2, 2.3.
- Remaining tasks: 2.4-4.3. Task 2.4 has partial evidence: root build green; tracked pre/post format hashes match; direct `mod-swooper-maps:test` green after repairing the H4-caused multiline-import guard false negative; root `bun run test` remains red through DL-15 / SDK async-teardown behavior, so 2.4 is not marked complete.
- Stop conditions triggered: task 2.4 cannot close as green yet. Fresh build produces a non-format intelligence-bridge bundle drift (`from "net"`) and root test exits 1 through package-local Vitest fan-out / SDK teardown defects. These are known out-of-scope defects unless promoted, but they block the proposal's strict 2.4 green claim.

## Verification

- Commands run:
  - `git status --short --branch`
  - `gt status`
  - `gt log short --stack`
  - `bun run openspec -- list`
  - `gt create agent-F-habitat-biome-hygiene --no-interactive`
  - `git diff --check`
  - `bun run openspec -- validate habitat-biome-hygiene --strict`
  - `bun add -d -E @biomejs/biome@2.4.16`
  - `bunx --bun @biomejs/biome init`
  - `bunx --bun @biomejs/biome --version`
  - `bunx --bun @biomejs/biome rage --formatter --linter`
  - `bunx --bun @biomejs/biome format . --max-diagnostics=40`
  - `bunx --bun @biomejs/biome format . --reporter=json --max-diagnostics=none > /tmp/h4-biome-format-dry-run.json || true`
  - `shasum -a 256 $(git ls-files 'mods/*/mod/**' | sort)`
  - `bunx --bun @biomejs/biome format --write . --max-diagnostics=80`
  - `bunx --bun @biomejs/biome format . --max-diagnostics=20`
  - `git show --shortstat --oneline --no-renames b6c2b7c384a7d5068353116efc78da88451f4f13`
  - `git show --name-only --format= --no-renames b6c2b7c384a7d5068353116efc78da88451f4f13 | rg '(^|/)dist/|(^|/)types/|(^|/)mod/|^\\.civ7/outputs/|^docs/_archive/|src/maps/generated|packages/civ7-types/generated|civ7-tables\\.gen\\.ts' || true`
  - `git blame --ignore-revs-file .git-blame-ignore-revs -L 1,5 -- vitest.config.ts`
  - `bun install`
  - `bunx --bun @biomejs/biome format . --max-diagnostics=20`
  - `rg -n -i "prettier" --glob '!docs/_archive/**' --glob '!node_modules/**' --glob '!**/node_modules/**'`
  - `bun pm why prettier`
  - `bun pm why eslint-config-prettier`
  - `bunx tsc -p packages/civ7-adapter/tsconfig.json --noEmit --pretty false`
  - `bunx nx run @civ7/adapter:build`
  - `bun run build`
  - `git show stash@{0}:mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js | rg -n "from ['\\\"]net['\\\"]|node:net"`
  - `bun test test/foundation/contract-guard.test.ts -t "keeps decomposed tectonics strategy imports local"` (from `mods/mod-swooper-maps`)
  - `bunx nx run mod-swooper-maps:test --skip-nx-cache`
  - `bun run test > /tmp/h4-root-test-after-guard.log 2>&1`
- Results: H4 branch opened cleanly above H3; OpenSpec list shows H1/H2/H3 complete and H4 at 0/11 tasks.
- Biome setup results: `@biomejs/biome` exact-pinned at 2.4.16; config loads
  successfully; formatter settings match `.prettierrc` semantics (`semi`,
  double quotes, trailing commas `es5`, line width 100, two-space indent) and
  exclude generated/protected zones.
- No-write format result: `biome format .` checked 2356 files and reported
  1557 formatting errors before any write. This is expected before the
  dedicated reformat task; task 1.2 remains open until diff-size/sample review
  and format-diff acceptance are recorded.
- Dry-run JSON evidence: 1556 unique paths with format diagnostics; extension
  summary: `.ts` 1431, `.tsx` 38, `.json` 37, `.js` 35, `.mjs` 11, `.css` 2,
  `.jsx` 1, `.jsonc` 1.
- Pre-format mod output hashes captured in
  `openspec/changes/habitat-biome-hygiene/workstream/pre-format-mod-output-hashes.txt`
  for the six tracked generated mod output files under `mods/*/mod/**`.
- Format-write result: first run formatted 2356 files, fixed 1555 files, then
  surfaced two Tailwind CSS parse errors in `apps/mapgen-studio/src/index.css`.
  `biome.json` now enables `css.parser.tailwindDirectives`; the rerun completed
  cleanly.
- Dedicated format-only commit:
  `b6c2b7c384a7d5068353116efc78da88451f4f13`
  (`style(habitat-biome): apply Biome repo format`) with 1555 files changed,
  65053 insertions, and 53126 deletions.
- Format diff review: changed path count by extension was `.ts` 1431, `.json`
  38, `.tsx` 38, `.js` 35, `.mjs` 11, `.jsx` 1, `.css` 1, `.jsonc` 1. Sampled
  hunks showed Biome mechanical rewrites only: two-space JSON expansion,
  single-to-double quote changes, trailing-comma normalization, semicolon
  insertion, and line wrapping.
- Protected/generated path grep over the format commit returned no matches.
  Post-format hashes in
  `openspec/changes/habitat-biome-hygiene/workstream/post-format-mod-output-hashes.txt`
  match the pre-format capture exactly.
- Blame-ignore probe: `git blame --ignore-revs-file .git-blame-ignore-revs -L
  1,5 -- vitest.config.ts` attributes formatted lines to pre-format commits
  (`1c5f5dd947`, `15082cf3f5`), not the Biome format commit.
- Prettier retirement result: `.prettierrc` deleted; root direct `prettier`
  devDependency removed; `mods/mod-swooper-civ-dacia` package-local
  `format` script removed; package-local `prettier` and
  `eslint-config-prettier` devDependencies removed; three
  `// prettier-ignore` formatter-control comments replaced with
  `// biome-ignore format` comments placed before the matching `@ts-ignore`
  lines. These imports intentionally stay one-line because declaration
  generation reports unresolved Civ7 runtime modules on the module-specifier
  line, and `@ts-ignore` only suppresses the next physical line.
- Prettier residue sweep: no repo config, script, direct dependency, or source
  formatter-control reference remains. Remaining `prettier` strings are
  historical/project H4 prose, plain-English prose, and `bun.lock` third-party
  metadata. `bun pm why prettier` reports only the transitive dependency from
  `json-schema-to-typescript@15.0.4` through `mod-swooper-maps`; `bun pm why
  eslint-config-prettier` reports only the optional peer edge from
  `@nx/eslint-plugin@22.7.5`.
- Post-retirement format check: `bunx --bun @biomejs/biome format .
  --max-diagnostics=20` checked 2356 files and applied no fixes.
- Adapter build repair: replacing `prettier-ignore` with `biome-ignore format`
  initially put the formatter-ignore comments between the `@ts-ignore` comment
  and the Civ7 runtime import. TypeScript then reported unresolved runtime
  modules during declaration generation. The comments were reordered so
  `biome-ignore format` precedes `@ts-ignore`, the imports stay one physical
  line, `tsc --noEmit` passes, and `@civ7/adapter:build` passes.
- Root build result: `bun run build` passed for 20 projects and 1 dependency
  task. After the successful build, only the generated
  `mods/mod-civ7-intelligence-bridge/mod/ui/civ7-intelligence-bridge.js`
  artifact drifted from tracked HEAD; the rebuilt bundle contains
  `import { createConnection } from "net";`. The generated drift was stashed
  semantically as `h4-build-generated-intelligence-bridge-bundle-drift` and
  `h4-root-build-generated-intelligence-bridge-bundle-drift`, not integrated.
- Build-output parity result: the tracked post-format hashes match the
  pre-format hashes for all six tracked `mods/*/mod/**` files, including the
  tracked intelligence-bridge bundle. Fresh-build parity is blocked by DL-16,
  because the regenerated intelligence-bridge bundle changes semantically by
  introducing a Node `net` import, not by formatting.
- Swooper Maps guard repair: Biome wrapped long `../rules/index.js` named
  imports in foundation strategy files. The existing guard parsed imports
  line-by-line and falsely concluded the strategy no longer imported local
  rules. The guard now uses the package's `typescript` dependency to parse
  `ImportDeclaration` module specifiers. Focused proof:
  `bun test test/foundation/contract-guard.test.ts -t "keeps decomposed
  tectonics strategy imports local"` passes (1 pass, 0 fail, 57 expects).
- Focused package proof: `bunx nx run mod-swooper-maps:test --skip-nx-cache`
  passes after the guard repair (567 pass, 2 skip, 0 fail).
- Root test result: `bun run test` still exits 1 after the guard repair. Failed
  Nx tasks are `@civ7/plugin-files:test`, `@civ7/plugin-git:test`,
  `@civ7/plugin-mods:test`, and `@civ7/plugin-graph:test`. The failure is the
  DL-15 package-local `vitest run` fan-out class: those package tasks execute
  the root Vitest project matrix from the plugin package cwd, causing
  mapgen-studio suites to fail resolving `mod-swooper-maps/recipes/*` exports;
  the same run also surfaces the known SDK async teardown `ENOENT` and one
  unrelated direct-control timeout. Direct `mapgen-studio:test` passes in the
  same root run (47 files, 233 tests), and direct `mod-swooper-maps:test`
  passes.
- Skipped gates and rationale: task 2.4 is not marked complete because the
  proposal asks for build/test green plus build-output parity. Root build is
  green, but root test/parity expose known out-of-scope defects that require
  promotion or separate repair before strict closure.
- Evidence boundary: H4-owned formatter/config/test-guard behavior is green;
  no claim is made that repo-wide root test or fresh-build parity is green.

## Realignment

- Downstream docs/specs/issues updated: top-level workstream record reconciled from stale pre-execution state to H4-active state.
- Tests/guards updated: none yet.
- Deferrals/triage updated: none; known red-test triage tasks remain outside H4 unless explicitly promoted.
- Downstream realignment ledger: N/A at phase open.

## Next Action

- Exact next step: decide whether DL-16 and the SDK/DL-15 root-test blockers
  are promoted into prerequisite repair slices for task 2.4 closure; otherwise
  continue H4 implementation with task 2.4 explicitly open, then return before
  closure.
- First files to inspect: `tools/habitat-harness/src/plugin.js`,
  `tools/habitat-harness/src/bin/habitat.ts`,
  `tools/habitat-harness/src/rules/rules.json`, `.github/workflows/ci.yml`,
  and the post-format parity hash files.
- Stop condition: Biome config would format generated/protected zones, create non-format semantic diff, or require hygiene ownership that overlaps Nx/Grit.
