## Why

The harness is a CLI, and this repo already has a mature CLI framework pattern:
`packages/cli` uses `@oclif/core`, `@oclif/plugin-help`, generated
`oclif.manifest.json`, command classes, help output, and direct command tests.
The H2 harness scaffold intentionally landed a small Bun-run parser to get the
ratchet/rule-pack path working quickly, but keeping bespoke argument parsing as
downstream slices add hooks, grit commands, generators, and classify behavior
would duplicate a solved local pattern.

This slice migrates `tools/habitat-harness` to oclif before the CLI surface is
hardened by H7 hooks and H8 generators/migrations. The command semantics stay
the same; only the CLI shell becomes repo-standard and easier to test.

## Target Authority Refs

- `docs/projects/habitat-harness/FRAME.md` (hard core #1, #2, #5; D7)
- `docs/projects/habitat-harness/workstream-record.md` (change-train order)
- `tools/habitat-harness/README.md` and
  `openspec/changes/habitat-harness-scaffold/specs/habitat-harness/spec.md`
  (existing normative command set)
- `packages/cli/AGENTS.md` and `packages/cli/package.json` (repo-local oclif
  implementation pattern)
- `https://oclif.io/docs/introduction/` (initializing existing projects)
- `https://oclif.io/docs/commands/` (command classes and awaited run logic)
- `https://oclif.io/docs/configuring_your_cli/` (package `oclif` config)
- `https://oclif.io/docs/command_discovery_strategies/` (pattern discovery and
  manifest behavior)
- `https://oclif.io/docs/json/` (machine JSON output behavior)
- `https://oclif.io/docs/testing/` (command test strategy)

## What Changes

- Convert `@internal/habitat-harness` from a Bun-run hand parser at
  `src/bin/habitat.ts` to an oclif CLI package with `bin/run.js`,
  `bin/dev.ts`, command classes under `src/commands/**`, and a small
  `HabitatCommand` base class.
- Preserve the command set and flag semantics from H2/H3/H4:
  `check [--json] [--output] [--owner] [--rule] [--expand-baseline] [--base]`,
  `fix [--dry-run]`, `verify [--base]`, `graph [--json]`, `classify <path>`,
  and `hook <name>`.
- Move command logic into reusable library functions so oclif command classes
  are adapters, not a second rule engine.
- Add oclif package metadata and build/manifest scripts matching the repo CLI
  pattern, while keeping generated `dist/**` and `oclif.manifest.json` out of
  hand-edited source changes.
- Repoint root scripts, Nx inferred target commands, CI, and README examples
  to the oclif runner without changing rule-pack semantics.
- Keep oclif as the outer CLI adapter. If a later implementation uses Effect
  internally, it must run the Effect program from the command and close scopes
  before `Command.run()` resolves. `effect-orpc` is not part of this CLI slice.

## What Does Not Change

- No new harness rule, baseline, taxonomy constraint, or enforcement layer.
- No product/runtime architecture changes.
- No replacement of the existing product CLI in `packages/cli`.
- No published/shared harness package; it remains repo-local.

## Requires

- `habitat-harness-scaffold`
- `habitat-boundary-tags`
- `habitat-biome-hygiene` (the oclif migration preserves the H4 `fix`,
  `verify`, and `biome:*` target wiring)

## Enables Parallel Work

- `habitat-grit-catalog`, `habitat-enforcement-consolidation`,
  `habitat-git-hooks`, and `habitat-generators-migrations` should consume the
  oclif command surface rather than extending the hand parser.

## Affected Owners

- `tools/habitat-harness/package.json`, `bin/**`, `src/commands/**`,
  `src/base/**`, `src/bin/**`, and command-support libs.
- Root `package.json` habitat scripts, `tools/habitat-harness/README.md`, and
  the harness Nx plugin command strings.
- OpenSpec/workstream records that describe the change train order.

## Forbidden Owners

- No generated `dist/**` or `oclif.manifest.json` hand edits.
- No shell-string command concatenation; spawned commands remain argument-array
  based.
- No `process.exit()` buried in reusable rule logic; command classes own exit
  behavior.
- No unawaited child process or Effect work after `Command.run()` returns.

## Stop Conditions

- The oclif runner changes any existing `habitat check` JSON schema or command
  exit semantics beyond documented oclif parse/help behavior.
- Generated manifest/build output must be committed by policy rather than
  generated during package build; if that proves necessary, stop and record
  the generated-artifact disposition before proceeding.
- The migration requires bundling the CLI into a single file; oclif docs do
  not support that as the normal path, and the repo has no such requirement.

## Consumer Impact

Existing users continue to run `bun run habitat:*`. They gain oclif help,
argument validation, command-class tests, and a CLI structure matching
`@mateicanavra/civ7-cli`. Downstream hook/generator work gets a stable command
surface before adding more subcommands.

## Verification Gates

- `bun run openspec -- validate habitat-oclif-cli --strict`
- Compatibility matrix: old and new command invocations for `check`, `fix
  --dry-run`, `verify --base HEAD --help`/parse-only probe, `graph --json`,
  `classify <path>`, and `hook <name>` preserve exit codes and structured
  output where applicable.
- `bun run habitat:check -- --json --output <tmp>` emits the existing schema
  and validates with `validateCheckReport`.
- `bun run habitat:fix -- --dry-run`, `bunx nx run
  @internal/habitat-harness:check`, `bunx nx run-many -t biome:ci
  --projects=@internal/habitat-harness`, and the harness CLI tests pass.
- Help smoke: `bun run habitat -- --help` and `bun run habitat -- check
  --help` render oclif help.
- Build discipline: package build generates the oclif manifest in the same way
  as `packages/cli`; generated outputs are not hand-edited in the source diff.
