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

- [ ] 2.1 Refresh official Effect, GritQL, Biome, and Nx evidence packs or
  record why the existing packs remain current for the selected versions.
- [ ] 2.2 Inspect repo-local Effect usage for runtime-edge, service/layer,
  tagged-error, and platform-package precedent.
- [ ] 2.3 Select exact `effect`, `@effect/platform`, and platform package
  versions and record why those versions match the repo's Bun/Node environment.
- [ ] 2.4 Record the selected platform runtime strategy for Bun dev and built
  runner paths before dependency edits.
- [ ] 2.5 Add the accepted dependencies to `tools/habitat-harness/package.json`
  and update `bun.lock` through the package manager.
- [ ] 2.6 Add a tiny parity probe that exercises command execution,
  scoped cleanup, tagged errors, and fake service provision under the Bun dev
  path.
- [ ] 2.7 Prove the same probe under the built production runner path.
- [ ] 2.8 Record parity against the accepted command-surface contract from
  `habitat-oclif-entrypoint-repair`; if that repair has not landed, mark root,
  subcommand, and selector trust claims unclaimed rather than preserving current
  broken behavior.

## 3. Effect Runtime Boundary

- [ ] 3.1 Add `tools/habitat-harness/src/lib/effect-runtime.ts` or the accepted
  equivalent named Habitat Effect runtime bridge for adapter host boundaries.
- [ ] 3.2 Ensure reusable Grit adapter modules return Effects or pure results
  and do not call `Effect.run*` internally.
- [ ] 3.3 Convert the Grit-touched command/rule call chain to the accepted async
  adapter chain without changing valid command output classes.
- [ ] 3.4 Ensure exported Grit-touched APIs return `Promise<...>` materialized
  results rather than public Effect values, and update every repo callsite.
- [ ] 3.5 Update `tools/habitat-harness/src/index.ts` and record whether any
  external package relies on the old sync API shape.
- [ ] 3.6 Add a static guard that fails if `Effect.run*`, `NodeRuntime.run*`, or
  platform runtime calls appear outside the named runtime bridge and approved
  test helpers.

## 4. Grit-Scoped Command Result Contract

- [ ] 4.1 Define typed command result data with executable, argv, cwd, Git
  state, env delta, scan roots, cache policy, timing, exit, stdout/stderr
  artifact/digest, parse status, failure tag, and non-claims.
- [ ] 4.2 Implement `HabitatProcess` as a service with live and fake layers.
- [ ] 4.3 Execute Grit commands as argument arrays, with no shell
  interpolation.
- [ ] 4.4 Add tests for successful command, missing tool, nonzero exit, signal
  or interruption, output capture, env redaction, and duration recording.
- [ ] 4.5 Record cache/fresh status when observable and fail proof cases that
  require it when unavailable.
- [ ] 4.6 Record branch, HEAD commit, dirty marker, status digest, and
  before/after status for probe and apply flows.
- [ ] 4.7 Implement the adapter proof artifact schema, path convention,
  proof-id linkage, redaction, retention, non-claims, and downstream
  command-proof-log references.

## 5. Check Adapter Parser And Projection

- [ ] 5.1 Define the accepted raw Grit check output schema for the pinned CLI
  version and preserve raw output digests/artifacts.
- [ ] 5.2 Replace substring JSON parsing with a typed parser boundary.
- [ ] 5.3 Add parser tests for no JSON, malformed JSON, wrapper noise, missing
  `results`, schema drift, and unexpected result shape.
- [ ] 5.4 Add scan-root validation for no roots, missing roots, protected roots,
  generated roots, and approved roots.
- [ ] 5.5 Add projection tests for expected pattern identity, wrong pattern,
  missing pattern, duplicate pattern, and findings outside the requested set.
- [ ] 5.6 Ensure valid zero-findings, empty scan roots, and projection miss are
  distinct outcomes.
- [ ] 5.7 Preserve CheckReport schemaVersion 1 output for valid Grit checks.

## 6. Adapter Failure Rendering

- [ ] 6.1 Implement tagged adapter failures listed in `design.md`.
- [ ] 6.2 Normalize adapter failures into Habitat diagnostics or command
  failures without leaking raw Effect/Schema errors as durable proof format.
- [ ] 6.3 Keep rule findings as CheckReport data, not infrastructure failures.
- [ ] 6.4 Add tests for every adapter failure tag.

## 7. Injected Violation Harness

- [ ] 7.1 Implement scoped probe creation under approved scan roots.
- [ ] 7.2 Require effective-scope metadata for every current check row:
  Habitat adapter root, `rules.json` scope, Grit `$filename`/source predicate,
  exact scan roots/exclusions, matching probe, and outside-scope control probe.
- [ ] 7.3 Reject probe paths under generated, protected, ignored, or
  non-approved roots.
- [ ] 7.4 Run injected probes through the real Habitat Grit adapter path.
- [ ] 7.5 Assert exact Habitat rule id, unbaselined status, probe path, and
  expected diagnostic.
- [ ] 7.6 Assert outside-scope control probes do not produce the rule finding.
- [ ] 7.7 Remove probe files on success, adapter failure, and interruption.
- [ ] 7.8 Verify final `git status --short` is clean.
- [ ] 7.9 Provide the API consumed by
  `openspec/changes/habitat-grit-proof-repair` for all 22 current Grit checks.

## 8. Apply Transaction

- [ ] 8.1 Add clean-worktree or isolated-transaction precheck before any apply.
- [ ] 8.2 Add target public-export preflight for
  `deep_import_to_public_surface`.
- [ ] 8.3 Run dry-run or transaction-copy apply first and classify candidate
  rewrites before writing to the developer tree.
- [ ] 8.4 Inventory every live and injected candidate rewrite over exact roots,
  with classification as expected, pre-approved, rejected, or blocked.
- [ ] 8.5 Run target-export preflight and approval classification for every
  candidate rewrite.
- [ ] 8.6 Reject missing exports, unexpected files, unapproved create/remove
  operations, unapproved ranges, and dry-run mismatch.
- [ ] 8.7 Apply only the approved transaction, then run Biome over changed
  paths.
- [ ] 8.8 Run selected type/test gates after the applied diff.
- [ ] 8.9 Record applied diff, raw output digest, rewrite inventory,
  before/after file digests, command provenance, and non-claims.
- [ ] 8.10 Prove rollback/finalizers for after-write command failure,
  interruption, Biome/type gate failure, and rollback failure.
- [ ] 8.11 Roll back through isolated transaction cleanup or the recorded
  live-worktree rollback primitive.
- [ ] 8.12 Prove final clean status.

## 9. Wiring And Compatibility

- [ ] 9.1 Route `runGritRule` or its successor through the new adapter.
- [ ] 9.2 Route `runGritApplyPatterns` or its successor through the transaction
  adapter.
- [ ] 9.3 Ensure non-Grit rules still execute with unchanged public behavior.
- [ ] 9.4 Ensure valid `habitat:check -- --json --tool grit-check` remains
  CheckReport schemaVersion 1 compatible.
- [ ] 9.5 Remove or replace shared module-level `cachedReport` behavior with
  per-run proof-conscious cache policy.

## 10. Verification

- [ ] 10.1 `bun run openspec -- validate habitat-effect-grit-adapter --strict`
- [ ] 10.2 dependency/platform parity under Bun dev path
- [ ] 10.3 dependency/platform parity under built runner path
- [ ] 10.4 parser/projection/failure unit matrix
- [ ] 10.5 injected-probe unit matrix with fake services
- [ ] 10.6 apply-transaction unit matrix
- [ ] 10.7 `GRIT_TELEMETRY_DISABLED=true grit patterns test --json`
- [ ] 10.8 `bun run habitat:check -- --json --tool grit-check`
- [ ] 10.9 adapter smoke proof for one selected current check row through the
  Habitat Grit adapter, with explicit non-claim for all-22 proof execution
- [ ] 10.10 `bun run habitat:fix -- --dry-run` with injected apply match and
  no writes
- [ ] 10.11 controlled apply proof for `deep_import_to_public_surface`
- [ ] 10.12 selected Biome/type/test gates
- [ ] 10.13 `bun run --cwd tools/habitat-harness test`
- [ ] 10.14 full-depth-language guardrail scan over Habitat initiative docs
- [ ] 10.15 `git diff --check`
- [ ] 10.16 `bun run openspec:validate`

## 11. Downstream Realignment And Closure

- [ ] 11.1 Update `habitat-grit-proof-repair` phase record, proof matrix, and
  tasks to consume this adapter once accepted.
- [ ] 11.2 Update
  `docs/projects/habitat-harness/effect-orchestration-evaluation.md` with the
  provisional selection, accepted design state, and dependency/platform proof
  boundaries.
- [ ] 11.3 Update current Grit proof matrix rows with adapter proof ids after
  implementation.
- [ ] 11.4 Update Habitat README or command docs if Grit failure rendering
  changes user-visible text.
- [ ] 11.5 Record verification results and proof boundaries in this change's
  `workstream/phase-record.md`.
- [ ] 11.6 Commit via Graphite with a clean worktree.
