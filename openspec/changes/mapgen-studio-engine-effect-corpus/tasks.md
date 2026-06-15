## 1. Packet Entrance

- [x] 1.1 Confirm D0 and D1 packet acceptance.
- [x] 1.2 Confirm no existing `mapgen-studio-engine-effect-corpus` change exists on this baseline.
- [x] 1.3 Run fresh D2 inventory/review lanes and disposition all P1/P2 findings before D2 acceptance.

## 2. Corpus Ledgers

- [x] 2.1 Complete `runtime-corpus-ledger.md` for app-hosted Studio engines, operation stores, daemon/context seams, event hub usage, and live-game watcher seams.
- [x] 2.2 Complete `control-orpc-classification-ledger.md` for every production `civ7ControlOrpcMutationProcedure` declaration and every retained behavior-based display/view state machine.
- [x] 2.3 Classify every frame-required corpus item as `studio-runtime-scope`, `retained-package-authority`, `future-domino`, or `delete-or-collapse`.
- [x] 2.4 Assign every `studio-runtime-scope`, `future-domino`, and `delete-or-collapse` row to a named downstream OpenSpec domino.
- [x] 2.5 Record risk and re-entry trigger for every retained/deferred surface.

## 3. Omission Guards

- [x] 3.1 Positive scan for app-hosted engine symbols in `apps/mapgen-studio/src/server/studio/engines.ts`.
- [x] 3.2 Positive scan for `StudioServerContext` host-injected runtime functions.
- [x] 3.3 Positive scan for every `civ7ControlOrpcMutationProcedure` production declaration.
- [x] 3.4 Positive scan for retained behavior-based control-oRPC state machines, including display explore, display queue close/current, camera focus, and appshot capture.
- [x] 3.5 Manual-state scan for `Promise.resolve()`, mutable `Map`, `setTimeout`, closure flags, and app-local `StudioEngineError` in Studio runtime sources.
- [x] 3.6 Negative review assertion that no manual Studio engine, operation store, queue, server identity owner, deploy runner, process control helper, scripting log proof helper, event publisher, live-game watcher, live-game read model, operation phase/projection artifact, active error bridge, or retained control-oRPC behavior state machine remains unclassified.
- [x] 3.7 Shortcut scan for fallback/shim/temporary/dual-path/support-both/optional-target/only-if-needed language.

## 4. Verification

- [x] 4.1 `bun run openspec -- validate mapgen-studio-engine-effect-corpus --strict`.
- [x] 4.2 `bun run openspec:validate`.
- [x] 4.3 `git diff --check`.

## 5. Closure

- [x] 5.1 Record review acceptance in `review-disposition-ledger.md`.
- [x] 5.2 Mark D2 accepted in `OPENSPEC-PACKET-TRAIN.md`.
- [x] 5.3 Commit accepted D2 packet through Graphite with clean/quarantined worktree state.

## 6. Implementation Refresh

- [x] 6.1 Create the D2 implementation Graphite branch
  `codex/runtime-effect-engine-effect-corpus` above the committed D1 slice.
- [x] 6.2 Re-scan the restacked D1/D2 source corpus for app-hosted Studio
  runtime surfaces, `StudioServerContext` host functions,
  `civ7ControlOrpcMutationProcedure` declarations, and retained display/view
  behavior state machines.
- [x] 6.3 Add a durable D2 corpus guard test that fails when a current runtime
  source token or control-oRPC mutation surface lacks explicit ledger coverage.
- [x] 6.4 Repair ledger token coverage exposed by the guard: exact
  `runInGameOperations`, `saveDeployOperations`, `serverInstanceId`,
  `StudioServerContext.*` host functions, proof-builder symbols, and
  `focusCiv7CameraOnPlot`.
- [x] 6.5 Run focused test/OpenSpec/type gates and record evidence.
- [x] 6.6 Run fresh review for D2 corpus omissions/proof gaps and disposition
  findings.
- [x] 6.7 Commit D2 implementation refresh through Graphite with clean
  post-commit status proof.

Implementation refresh evidence, 2026-06-15:

- Green: `bun run --cwd apps/mapgen-studio test --
  test/server/engineEffectCorpus.test.ts` (5 tests).
- Green: `bun run openspec -- validate mapgen-studio-engine-effect-corpus --strict`.
- Green: `bun run openspec:validate` (186 passed, 0 failed).
- Green: `bun run nx run mapgen-studio:check --outputStyle=static`.
- Green: `git diff --check`.
- Generated-output audit: no tracked changes under `packages/mapgen-core/dist`,
  `mods/mod-swooper-maps/dist`, `mods/mod-swooper-maps/mod`, or
  `mods/mod-swooper-maps/src/maps/generated` after Nx check regenerated map
  artifacts.
- Habitat owner check: `bun tools/habitat-harness/bin/dev.ts check --owner
  @internal/habitat-harness --json` remains non-green only on the stack-owned
  `workspace-entrypoints` failure in
  `packages/civ7-control-orpc/package.json`; D2-relevant `mapgen-docs`,
  `nx-boundaries`, `biome-ci`, `grit-studio-recipe-artifacts`, file-layer
  generated-output guards, and baseline integrity pass.
- Post-commit proof: D2 was committed through Graphite on
  `codex/runtime-effect-engine-effect-corpus`. The observed commit before this
  bookkeeping amend was `7d55f559f` (`test(studio): guard engine Effect
  corpus`); this file is amended into the same Graphite slice, so the durable
  commit identity after bookkeeping is the branch tip reported by `git log -1`.
  After the D2 Graphite commit, `git status --short --branch` returned only
  `## codex/runtime-effect-engine-effect-corpus`, and `gt status` passed
  through to Git status with `nothing to commit, working tree clean`.
