## 1. Design And Review Gate

- [x] 1.1 Open this adapter packet with proposal, design, spec delta, tasks,
  phase record, review disposition ledger, downstream realignment ledger, and
  source synthesis.
- [x] 1.2 Run product/outcome, Effect/substrate, Grit adapter, and
  evidence/system review lanes against the packet before implementation.
- [x] 1.3 Disposition every P1/P2 finding in
  `workstream/review-disposition-ledger.md`.
- [x] 1.4 Re-run
  `bun run openspec -- validate habitat-effect-grit-adapter --strict`.

## 2. Dependency And Platform Parity

- [x] 2.1 Refresh official Effect, GritQL, Biome, and Nx evidence packs or
  record why the existing packs remain current for the selected versions.
- [x] 2.2 Inspect repo-local Effect usage for runtime-edge, service/layer,
  tagged-error, and platform-package precedent.
- [x] 2.3 Select exact `effect`, `@effect/platform`, and platform package
  versions and record why those versions match the repo's Bun/Node environment.
- [x] 2.4 Record the selected platform runtime strategy for Bun dev and built
  runner paths before dependency edits.
- [x] 2.5 Add the accepted dependencies to `tools/habitat-harness/package.json`
  and update `bun.lock` through the package manager.
- [x] 2.6 Add a tiny parity probe that exercises command execution,
  scoped cleanup, tagged errors, and fake service provision under the Bun dev
  path.
- [x] 2.7 Prove the same probe under the built production runner path.
- [x] 2.8 Record parity against the accepted command-surface contract from
  `habitat-oclif-entrypoint-repair`; if that repair has not landed, mark root,
  subcommand, and selector trust claims unclaimed rather than preserving current
  broken behavior.

## 3. Effect Runtime Boundary

- [x] 3.1 Add `tools/habitat-harness/src/lib/effect-runtime.ts` or the accepted
  equivalent named Habitat Effect runtime bridge for adapter host boundaries.
- [x] 3.2 Ensure reusable Grit adapter modules return Effects or pure results
  and do not call `Effect.run*` internally.
- [x] 3.3 Convert the Grit-touched command/rule call chain to the accepted async
  adapter chain without changing valid command output classes.
- [x] 3.4 Ensure exported Grit-touched APIs return `Promise<...>` materialized
  results rather than public Effect values, and update every repo callsite.
- [x] 3.5 Update `tools/habitat-harness/src/index.ts` and record whether any
  external package relies on the old sync API shape.
- [x] 3.6 Add a static guard that fails if `Effect.run*`, `NodeRuntime.run*`, or
  platform runtime calls appear outside the named runtime bridge and approved
  test helpers.

## 4. Grit-Scoped Command Result Contract

- [x] 4.1 Define typed command result data with executable, argv, cwd, Git
  state, env delta, scan roots, cache policy, timing, exit, stdout/stderr
  artifact/digest, parse status, failure tag, and non-claims.
- [x] 4.2 Implement `HabitatProcess` as a service with live and fake layers.
- [x] 4.3 Execute Grit commands as argument arrays, with no shell
  interpolation.
- [x] 4.4 Add tests for successful command, missing tool, nonzero exit, signal
  or interruption, output capture, env redaction, and duration recording.
- [x] 4.5 Record cache/fresh status when observable and fail proof cases that
  require it when unavailable.
- [x] 4.6 Record branch, HEAD commit, dirty marker, status digest, and
  before/after status for probe and apply flows.
- [x] 4.7 Implement the adapter proof artifact schema, path convention,
  proof-id linkage, redaction, retention, non-claims, and downstream
  command-proof-log references.

## 5. Check Adapter Parser And Projection

- [x] 5.1 Define the accepted raw Grit check output schema for the pinned CLI
  version and preserve raw output digests/artifacts.
- [x] 5.2 Replace substring JSON parsing with a typed parser boundary.
- [x] 5.3 Add parser tests for no JSON, malformed JSON, wrapper noise, missing
  `results`, schema drift, and unexpected result shape.
- [x] 5.4 Add scan-root validation for no roots, missing roots, protected roots,
  generated roots, and approved roots.
- [x] 5.5 Add projection tests for expected pattern identity, wrong pattern,
  missing pattern, duplicate pattern, and findings outside the requested set.
- [x] 5.6 Ensure valid zero-findings, empty scan roots, and projection miss are
  distinct outcomes.
- [x] 5.7 Preserve CheckReport schemaVersion 1 output for valid Grit checks.

## 6. Adapter Failure Rendering

- [x] 6.1 Implement tagged adapter failures listed in `design.md`.
- [x] 6.2 Normalize adapter failures into Habitat diagnostics or command
  failures without leaking raw Effect/Schema errors as durable proof format.
- [x] 6.3 Keep rule findings as CheckReport data, not infrastructure failures.
- [x] 6.4 Add tests for every adapter failure tag.

## 7. Injected Violation Harness

- [x] 7.1 Implement scoped probe creation under approved scan roots.
- [x] 7.2 Require effective-scope metadata for every current check row:
  Habitat adapter root, `rules.json` scope, Grit `$filename`/source predicate,
  exact scan roots/exclusions, matching probe, and outside-scope control probe.
- [x] 7.3 Reject probe paths under generated, protected, ignored, or
  non-approved roots.
- [x] 7.4 Run injected probes through the real Habitat Grit adapter path.
- [x] 7.5 Assert exact Habitat rule id, unbaselined status, probe path, and
  expected diagnostic.
- [x] 7.6 Assert outside-scope control probes do not produce the rule finding.
- [x] 7.7 Remove probe files on success, adapter failure, and interruption.
- [x] 7.8 Verify final `git status --short` is clean.
- [x] 7.9 Provide the API consumed by
  `openspec/changes/habitat-grit-proof-repair` for all 22 current Grit checks.

## 8. Apply Transaction

- [x] 8.1 Add clean-worktree or isolated-transaction precheck before any apply.
- [x] 8.2 Add pattern-owned approval/failure intake for
  `deep_import_to_public_surface` structured rewrite inventory.
- [x] 8.3 Run dry-run or transaction-copy apply first and classify structured
  rewrite inventory or diff evidence before writing to the developer tree.
- [x] 8.4 Inventory every live and injected candidate rewrite or diff over exact
  roots, with classification as expected, pre-approved, rejected, or blocked.
- [x] 8.5 Preserve pattern-owned failure tags such as
  `GritApplyMissingTargetExport` without deriving them in core harness code.
- [x] 8.6 Reject missing pattern approval, unexpected files, isolated-copy
  create/remove diff evidence without pattern-owned create/delete approval,
  unapproved ranges, and dry-run mismatch.
- [x] 8.7 Apply only the approved transaction, then run Biome over changed
  paths.
- [x] 8.8 Run selected type/test gates after the applied diff.
- [x] 8.9 Record applied diff, raw output digest, rewrite inventory,
  before/after file digests, command provenance, and non-claims.
- [x] 8.10 Prove rollback/finalizers for after-write command failure,
  interruption, Biome/type gate failure, and rollback failure; live worktree
  create/delete rejection remains a non-claim in this packet.
- [x] 8.11 Roll back through isolated transaction cleanup or the recorded
  live-worktree rollback primitive, with create/delete safety proved only at
  the isolated-copy diff evidence boundary.
- [x] 8.12 Prove final clean status.

## 9. Wiring And Compatibility

- [x] 9.1 Route `runGritRule` or its successor through the new adapter.
- [x] 9.2 Route `runGritApplyPatterns` or its successor through the transaction
  adapter.
- [x] 9.3 Ensure non-Grit rules still execute with unchanged public behavior.
- [x] 9.4 Ensure valid `habitat:check -- --json --tool grit-check` remains
  CheckReport schemaVersion 1 compatible.
- [x] 9.5 Remove or replace shared module-level `cachedReport` behavior with
  per-run proof-conscious cache policy.

## 10. Verification

- [x] 10.1 `bun run openspec -- validate habitat-effect-grit-adapter --strict`
- [x] 10.2 dependency/platform parity under Bun dev path
- [x] 10.3 dependency/platform parity under built runner path
- [x] 10.4 parser/projection/failure unit matrix
- [x] 10.5 injected-probe unit matrix with fake services
- [x] 10.6 apply-transaction unit matrix
- [x] 10.7 `GRIT_TELEMETRY_DISABLED=true grit patterns test --json`
- [x] 10.8 `bun run habitat:check -- --json --tool grit-check`
- [x] 10.9 adapter smoke proof for one selected current check row through the
  Habitat Grit adapter, with explicit non-claim for all-22 proof execution
- [x] 10.10 `bun run habitat:fix -- --dry-run` with injected apply match and
  no writes
- [x] 10.11 controlled apply proof for `deep_import_to_public_surface`
- [x] 10.12 selected Biome/type/test gates
- [x] 10.13 `bun run --cwd tools/habitat-harness test`
- [x] 10.14 full-depth-language guardrail scan over Habitat initiative docs
- [x] 10.15 `git diff --check`
- [x] 10.16 `bun run openspec:validate`

## 11. Downstream Realignment And Closure

- [x] 11.1 Update `habitat-grit-proof-repair` phase record, proof matrix, and
  tasks to consume this adapter once accepted.
- [x] 11.2 Update
  `docs/projects/habitat-harness/effect-orchestration-evaluation.md` with the
  provisional selection, accepted design state, and dependency/platform proof
  boundaries.
- [x] 11.3 Disposition current Grit proof matrix rows: adapter substrate is
  available after acceptance, but row-level proof ids remain owned by
  `habitat-grit-proof-repair`.
- [x] 11.4 Update Habitat README or command docs if Grit failure rendering
  changes user-visible text; no README patch required because CheckReport v1
  and user-facing command text remain compatible.
- [x] 11.5 Record verification results and proof boundaries in this change's
  `workstream/phase-record.md`.
- [x] 11.6 Commit via Graphite with a clean worktree.
