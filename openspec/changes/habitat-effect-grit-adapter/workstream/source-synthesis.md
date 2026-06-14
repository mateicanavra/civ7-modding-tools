# Source Synthesis

**Change:** `habitat-effect-grit-adapter`
**Owner:** DRA Habitat recovery owner
**Date:** 2026-06-14

## Frame

### In

Official Effect, GritQL, Biome, and Nx behavior that affects Habitat's Grit
adapter proof substrate, plus current Habitat source evidence for Grit check,
Grit apply, process execution, tests, and proof records.

### Foreground

- Effect capabilities that replace fragile manual orchestration: typed errors,
  services/layers, scopes/finalizers, command execution, schema validation, and
  fakeable tests.
- Grit proof boundaries: pattern tests, current-tree scans, JSON/JSONL gaps,
  scan roots, ignored paths, cache, check/apply behavior.
- Biome/Nx boundaries that Habitat must record but not absorb.
- The exact current code weaknesses that make substrate work necessary.

### Exterior

- Library popularity and unofficial examples.
- New Grit patterns.
- Product/runtime Civ7 behavior.
- General command-runner migration outside the Grit adapter.

### Falsifier

Reframe if dependency/platform parity cannot preserve Habitat command behavior,
or if a non-Effect design supplies the same typed failures, command provenance,
service substitution, parse discipline, and scoped cleanup with less moving
machinery and equal proof strength.

## Official Effect Synthesis

Official Effect docs support this adapter because they document:

- `Effect<Success, Error, Requirements>` as the type shape for success, expected
  error, and dependency requirements;
- expected error channels and tagged errors for structured failure handling;
- Context/Layers for explicit service dependencies and test replacements;
- Scope/finalizers and acquire/release patterns for cleanup under success,
  failure, and interruption;
- `@effect/platform/Command` for command construction/execution with process
  name, arguments, environment, and output/exit behavior;
- `effect/Schema` for parse/validation at external data boundaries;
- TestClock and service replacement for deterministic tests.

Adapter implication: Effect is justified when it changes the structure of
failure and resource ownership. It is not justified as a wrapper around the
current `SpawnResult`.

## Official GritQL/Grit Synthesis

Official Grit docs support using Grit for structural check/apply:

- `grit check [PATHS]...` checks pattern violations, with target paths
  defaulting to `.` and cache-related options available.
- `grit apply <PATTERN_OR_WORKFLOW> [PATHS]...` applies patterns or workflows,
  with documented dry-run, force, interactive, output, stdin, cache, language,
  and range-filter options.
- `grit patterns test` proves authored pattern fixtures and supports filtering.
- Grit patterns can use snippets, AST nodes, rewrites, `$filename`, `$program`,
  `$new_files`, multifile patterns, regex, and custom functions.
- Docs recommend explicit target language declarations because defaults may
  change.

Adapter implication: native samples remain necessary but not sufficient.
Habitat must separately prove scan roots, projection, baselines, injected
violations, and apply safety.

Public docs do not define a stable audit-grade JSON schema for local proof.
Source-derived research found check JSON resembles a Semgrep-style object with
`paths` and `results`, while apply JSON support differs by mode. Therefore
Habitat must own a versioned parser contract and fail closed when the pinned
CLI behavior drifts.

## Official Biome Synthesis

Official Biome docs assign Biome the formatter/linter/import-sorter/safe-fix
role:

- `biome check` runs formatter, linter, and import sorting; `--write` applies
  safe fixes and formatting/import sorting.
- `--unsafe` is a separate semantic-risk surface.
- `biome ci` is read-only and intended for CI proof.
- reporters include JSON forms, but JSON reporter schemas are described as
  experimental.
- config discovery, VCS ignore settings, protected files, unmatched-file flags,
  stdin virtual paths, and log routing affect what a command proves.

Adapter implication: after Grit apply, Habitat may invoke Biome for formatting
handoff, but Habitat must record argv, cwd, env, config, target paths,
stdout/stderr, exit classification, and protected-path policy. Biome success is
not proof that Grit rewrote the correct structure.

## Official Nx Synthesis

Official Nx docs assign Nx task scheduling and cache ownership:

- tasks can come from package scripts, inferred tooling, or project config;
- `nx:run-commands` has explicit command/cwd/env/args behavior;
- cache hits replay outputs and terminal output instead of running the task;
- `--skip-nx-cache` is required when a proof needs fresh execution;
- affected runs use Git history plus the project graph to decide scheduled
  tasks.

Adapter implication: Nx success can prove scheduling/cache behavior when
recorded, but it cannot by itself prove live Grit behavior. Habitat proof
records must distinguish fresh execution from cache replay.

## Local Habitat Synthesis

Current Habitat evidence:

- `spawn.ts` loses argv/cwd/env/duration/failure class.
- `grit.ts` uses static scan roots, shared report cache, substring JSON parse,
  and projection by `local_name` or `check_id`.
- `runGritApplyPatterns()` uses `--force`, live roots, and no transaction.
- Grit native tests prove authored samples but not current-tree scan,
  projection, baselines, or apply safety.
- Command-class tests mock the engine and cannot prove adapter behavior under
  real command paths.

Substrate conclusion: opening `habitat-effect-grit-adapter` is necessary before
the Grit proof repair writes code for injected probes, parser/projection
hardening, raw acquisition proof, or apply transactions.

## Accepted Design Consequences

- Effect is provisionally selected for the Grit adapter substrate, with live
  adoption gated by review and dependency/platform parity.
- The first typed command-result contract lives inside the Grit adapter.
- Shared command runner extraction is a later workstream only after other
  surfaces prove they need the same contract.
- Habitat proof records normalize raw tool output; raw Grit/Biome/Nx output is
  evidence, not the durable proof schema.
- CheckReport schemaVersion 1 remains the command/report boundary for valid
  checks.
- Apply proof must be transactional and clean after every outcome.
