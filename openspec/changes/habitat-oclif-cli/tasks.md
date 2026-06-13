## 1. Phase Opening And Compatibility Map

- [x] 1.1 Open `openspec/changes/habitat-oclif-cli/workstream/phase-record.md`
  before implementation; record current branch, inherited H4 state, oclif doc
  sources, and the command compatibility matrix.
- [x] 1.2 Capture current `habitat` command behavior for the compatibility
  matrix: help/default output, `check --json`, `check --output`, filtered
  `--rule`, `fix --dry-run`, `graph --json`, `classify <path>`, `hook <name>`,
  and parse/exit behavior for an invalid command.

## 2. Package And Build Shape

- [x] 2.1 Add `@oclif/core` and `@oclif/plugin-help` to
  `@internal/habitat-harness` dependencies; add the oclif build-time tooling
  used by the repo CLI as needed, using existing lockfile versions where
  possible.
- [x] 2.2 Add `bin/run.js` and `bin/dev.ts` runners, package `bin`, `files`,
  scripts, and `oclif` config (`commands: ./dist/commands`, topic separator
  space, help plugin) following `packages/cli` conventions.
- [x] 2.3 Update the harness TypeScript build config so `check` remains
  no-emit and `build` emits the CLI/runtime files needed for oclif manifest
  generation; no generated `dist/**` or manifest file is hand-edited.

## 3. Command Refactor

- [x] 3.1 Extract the current `src/bin/habitat.ts` command logic into
  reusable libraries for check/report emission, fix, verify, graph, classify,
  and hook dispatch. Reusable logic must not call `process.exit()`.
- [x] 3.2 Add oclif command classes for `check`, `fix`, `verify`, `graph`,
  `classify`, and `hook`, with typed `Flags`/`Args`, summaries,
  descriptions, examples, and awaited work inside `run()`.
- [x] 3.3 Preserve machine-readable JSON semantics: `check --json` and
  `graph --json` remain parseable by existing harness consumers, and command
  logs do not pollute JSON output.
- [x] 3.4 Update root `habitat:*` scripts, Nx inferred target command strings,
  CI references, and README examples to call the oclif runner.

## 4. Tests And Probes

- [x] 4.1 Add command tests using the repo's existing oclif style
  (`CommandClass.run([...])` with Vitest mocks/spies), including check JSON,
  filtered rule selection, fix dry-run, classify, hook stub, and parse errors.
- [x] 4.2 Add smoke probes for `habitat --help`, `habitat check --help`, and
  root script compatibility.
- [x] 4.3 Run the compatibility matrix from 1.2 against the oclif CLI and
  record old-vs-new deltas. Only oclif-native help/parse formatting may differ.

## 5. Verification And Closure

- [x] 5.1 Run `bun run openspec -- validate habitat-oclif-cli --strict`.
- [x] 5.2 Run `bunx nx run @internal/habitat-harness:build`,
  `bunx nx run @internal/habitat-harness:check`,
  `bunx nx run @internal/habitat-harness:test` if a test target exists, and
  `bun run habitat:check -- --json --output <tmp>`.
- [x] 5.3 Run downstream smoke targets that rely on the CLI command strings:
  `bunx nx run @internal/habitat-harness:check`,
  `bunx nx run-many -t biome:ci --projects=@internal/habitat-harness`, and
  `bun run habitat:fix -- --dry-run`.
- [x] 5.4 Realign `docs/projects/habitat-harness/workstream-record.md`,
  downstream OpenSpec Requires entries, and harness README; close per
  workstream record.
