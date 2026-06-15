## Why

`habitat-grit-proof-repair` cannot honestly implement its injected-violation
harness, raw acquisition proof, parser/schema classification, or apply safety
proof on top of the current Grit adapter. Current source evidence shows:

- `tools/habitat-harness/src/lib/spawn.ts` returns only `exitCode`, `stdout`,
  and `stderr`; it discards argv, cwd, env delta, duration, signal, cache
  provenance, and structured failure class.
- `tools/habitat-harness/src/lib/grit.ts` discovers scan paths at module load,
  caches one shared report, parses JSON by whole-string or brace substring, and
  collapses no-JSON, malformed JSON, schema drift, pattern projection misses,
  and empty scan roots toward generic diagnostics.
- `runGritApplyPatterns()` hardcodes the single apply pattern, always passes
  `--force`, runs against live roots, and has no clean-worktree transaction,
  target-export preflight, diff proof, rollback resource, or interruption
  cleanup.

Official Effect docs support the exact substrate Habitat lacks: typed error
channels, service requirements through Context/Layers, scoped finalizers,
platform Command execution, Schema validation at external boundaries, and
fakeable services for tests. Official Grit docs support using Grit for
structural check/apply, but they do not define a stable public JSON schema or
Habitat baseline model. Therefore Habitat must own a typed adapter that treats
Grit output as input evidence and emits stable Habitat proof records.

This change opens that adapter workstream. It is a prerequisite for the Grit
proof repair tasks that touch injected probes, adapter parse/projection,
command provenance, and apply transactions.

## Target Authority Refs

- `docs/projects/habitat-harness/dra-takeover-frame.md` Product Outcome, Hard
  Core, Grit Pattern Corpus Ledger, Full Workstream Loop.
- `docs/projects/habitat-harness/recovery-claim-ledger.md` rows
  `CLAIM-H5-GRIT`, `CLAIM-P1-BASELINE`, `CLAIM-PRODUCT-TRANSFORMS`, and
  `CLAIM-P1-EFFECT-FIT`.
- `docs/projects/habitat-harness/grit-pattern-corpus-ledger.md` current 22
  check rows and current apply row.
- `docs/projects/habitat-harness/effect-orchestration-evaluation.md`.
- `docs/projects/habitat-harness/research/official-docs-effect.md`,
  `official-docs-gritql.md`, `official-docs-biome.md`, and
  `official-docs-nx.md`.
- `docs/projects/habitat-harness/research/local-effect-adoption-fit.md`.
- `openspec/changes/habitat-grit-proof-repair/**`, especially the accepted
  Effect/substrate review findings.

## What Changes

- Select Effect as the implementation substrate for the Habitat Grit adapter,
  with live dependency adoption gated behind review completion and an explicit
  dependency/platform parity task.
- Introduce a typed Grit command-result contract inside this adapter. The
  contract records command kind, executable, argv, cwd, selected env delta,
  scan roots, cache dir, cache/fresh status, start/end/duration, exit
  status/signal, stdout/stderr capture, raw output digest, parse status, and
  structured failure tag.
- Model Grit check as typed acquisition, parse/schema, projection, baseline
  handoff, and proof-record steps. Rule findings remain report data;
  infrastructure failures become tagged adapter failures.
- Replace substring-style JSON parsing with a fail-closed parser boundary for
  no JSON, malformed JSON, wrapper noise, missing `results`, schema drift,
  unexpected result shape, empty scan roots, pattern projection misses, and
  cache/provenance ambiguity.
- Add service-injected tests for process, filesystem, workspace roots, clock,
  baseline store, Grit CLI output, and probe cleanup.
- Add a controlled injected-violation harness capability used by
  `habitat-grit-proof-repair`: create probe files under approved scan roots,
  run the real Habitat Grit path, assert exact rule projection, remove probes
  on every exit path, and prove final repo cleanliness.
- Add an apply transaction for `deep_import_to_public_surface`: clean-worktree
  precheck, target-export preflight, dry-run proof, approved rewrite set,
  actual apply, Biome handoff, selected type/test gate, rollback/finalizer, and
  final clean-status proof.
- Preserve CheckReport schemaVersion 1 compatibility at the command boundary.

## What Does Not Change

- No new Grit check or apply semantics are introduced in this adapter packet.
- No oclif command-shell replacement is approved.
- No Nx scheduling/cache, Biome formatting, baseline policy, file-layer, hook
  side-effect, generated-output, or product/runtime authority moves into Effect.
- No product/runtime Civ7 behavior is claimed from adapter proof.
- No broad command runner migration is approved. The first typed command-result
  contract is Grit-scoped and may be extracted later only after cross-adapter
  evidence proves the shared boundary.

## Requires

- `habitat-oclif-entrypoint-repair` for final selector-based proof trust.
- Accepted `habitat-grit-proof-repair` design packet and proof matrix contract.
- Official Effect, GritQL, Biome, and Nx source refresh plus repo-local Effect
  usage inspection before implementation.
- Dependency/platform parity proof before any live adapter path switches from
  the current runner.

## Enables Parallel Work

- `habitat-grit-proof-repair` tasks for injected violations, raw acquisition,
  adapter parse/projection, and apply safety.
- Pattern-generator metadata repair, because generated enforced rules can use
  the same authority/proof fields.
- The first new Grit pilot after command trust and Grit proof semantics are
  repaired.

## Affected Owners

- `tools/habitat-harness/src/lib/grit.ts`
- new Habitat Grit adapter modules under `tools/habitat-harness/src/lib/**`
- `tools/habitat-harness/src/lib/spawn.ts` only if implementation routes the
  Grit-scoped process contract through the shared helper without changing other
  callers
- `tools/habitat-harness/src/lib/command-engine.ts` and
  `tools/habitat-harness/src/rules/architecture.ts` only for wiring the Grit
  adapter result into existing rule reports
- `tools/habitat-harness/test/grit/**` and `tools/habitat-harness/test/lib/**`
- `tools/habitat-harness/package.json` and `bun.lock` for Effect dependencies
- `openspec/changes/habitat-grit-proof-repair/**` for downstream task and proof
  unblocking records

## Forbidden Owners

- No edits to product/runtime source outside controlled probe fixtures.
- No generated `dist/**`, `mod/**`, `.civ7/outputs/resources/**`, generated
  map/type/table output, or official-resource submodule edits.
- No new enforced pattern semantics in `.grit/patterns/habitat/checks/**` or
  `tools/habitat-harness/src/rules/rules.json`.
- No Nx/Biome/taxonomy configuration changes.
- No hook behavior changes.
- No `Effect.run*` scattered through rule libraries; runtime execution remains
  at command/hook/adapter host boundaries.
- No shell-interpolated command strings for Grit proof execution.

## Stop Conditions

- Dependency/platform parity cannot preserve current root/dev/built Habitat
  behavior and command output classes.
- `@effect/platform/Command` or the chosen platform layer cannot provide the
  required argv/cwd/env/stdout/stderr/exit/provenance record under the repo's
  Bun and built command paths.
- Implementing the adapter requires changing CheckReport schemaVersion 1 before
  the command/report contract has its own accepted change.
- The adapter cannot distinguish rule findings from infrastructure failures.
- Apply transaction proof cannot guarantee final cleanup and clean worktree
  state under success, failure, and interruption.
- A reviewer accepts a P1/P2 finding about owner-layer transfer, proof
  inflation, shortcut language, unsafe apply, or command parity loss.

## Consumer Impact

Agents and contributors keep the same Habitat command surface, but Grit proof
becomes structurally trustworthy:

- malformed or drifting Grit output fails as an adapter failure, not a silent
  pass;
- scan roots, cache status, command provenance, pattern projection, and raw
  output digests are recorded as data;
- injected violations can prove exact Habitat rule ids without dirtying the
  repo;
- the existing apply codemod cannot be used as safe-transform evidence until
  the transaction proof passes;
- future Grit pilots inherit a proof substrate rather than re-implementing
  process, parse, and cleanup policy per pattern.

## Verification Gates

- `bun run openspec -- validate habitat-effect-grit-adapter --strict`
- Effect dependency/platform parity tests against the accepted command-surface
  contract under Bun dev and built runner paths
- Grit adapter unit tests with fake process/fs/baseline/clock services
- parser failure matrix: no JSON, malformed JSON, wrapper noise, missing
  `results`, schema drift, unexpected result shape, empty scan roots, pattern
  projection miss, cache ambiguity
- native Grit sample test remains green
- current-tree `habitat:check -- --json --tool grit-check`
- adapter smoke proof for one selected current check row, with an explicit
  non-claim that all-22 injected proof remains owned by
  `habitat-grit-proof-repair`
- `habitat:fix -- --dry-run` with injected apply match and no writes
- controlled apply transaction for `deep_import_to_public_surface`
- selected Biome/type/test gates after applied diff
- rollback/final cleanup proof
- `bun run --cwd tools/habitat-harness test`
- `bun run openspec:validate`
