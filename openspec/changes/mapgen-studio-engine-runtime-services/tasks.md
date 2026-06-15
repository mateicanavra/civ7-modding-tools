## 1. Packet Entrance

- [x] 1.1 Confirm D0-D3 are accepted in `OPENSPEC-PACKET-TRAIN.md`.
- [x] 1.2 Confirm `mapgen-studio-engine-runtime-services` is absent on the selected base and requires a new OpenSpec change.
- [x] 1.3 Run D4 runtime-corpus and hardening/black-ice prework lanes.
- [x] 1.4 Run D4 TypeScript/schema, Effect/lifecycle, testing, and adversarial review lanes.
- [x] 1.5 Record packet entrance proof: dependency install freshness, baseline build/check, `git status --short --branch`, `gt status`, `gt log --no-interactive`, dirty-file quarantine, and selected baseline.

## 2. Packet Scope

- [x] 2.1 Specify `StudioOperationRuntime` as package-owned Effect service state, not an app closure wrapper.
- [x] 2.2 Specify runtime ownership of server identity, operation registries, TTL, current projection, event publication hooks, mutation gate, and worker supervision.
- [x] 2.3 Specify Run in Game and Save/Deploy internal ADTs and public projection boundary.
- [x] 2.4 Decide Autoplay as a typed immediate runtime command admitted through the shared mutation gate.
- [x] 2.5 Specify accepted-then-background semantics.
- [x] 2.6 Specify interrupt-and-project runtime disposal policy.
- [x] 2.7 Specify app-host boundary after D4 and D5 handoff.
- [x] 2.8 Specify no fallback/dual lifecycle authority and no app-local queue/registry/server-identity ownership at implementation closure.
- [x] 2.9 Specify package handler integration through managed runtime rather than mocked app engine callbacks.
- [x] 2.10 Specify D4/D6 current-operation boundary and D10 live-watcher exclusion.
- [x] 2.11 Specify terminal TTL tombstone/typed-expiry semantics.
- [x] 2.12 Specify preserved Run in Game duplicate fingerprint idempotency as runtime-owned behavior.
- [x] 2.13 Specify bounded app leaf adapter ports and prohibit app-owned phase/failure/fingerprint/worker lifecycle authority.

## 3. Packet Proof Strategy

- [x] 3.1 Define runtime-corpus ledger coverage and per-surface oracles.
- [x] 3.2 Define singleton-per-runtime and daemon restart truth tests.
- [x] 3.3 Define cross-operation gate tests for Run in Game, Save/Deploy, and Autoplay.
- [x] 3.4 Define accepted-then-background tests.
- [x] 3.5 Define disposal tests for accepted/running workers.
- [x] 3.6 Define compile-time internal ADT projection exhaustiveness tests.
- [x] 3.7 Define public DTO/export privacy tests.
- [x] 3.8 Define TTL/status miss tests.
- [x] 3.9 Define negative searches for app-local lifecycle ownership, partial-patch stores, unscoped workers, D3 bridge resurrection, and effect-orpc ownership.
- [x] 3.10 Define package handler integration and app daemon composition-only tests.
- [x] 3.11 Define typed expiry/tombstone tests and active-record prune guards.
- [x] 3.12 Define post-disposal admission tests for Run in Game, Save/Deploy, and Autoplay.
- [x] 3.13 Define poison-callback handler tests for app context lifecycle callbacks.
- [x] 3.14 Define all-public-surfaces export privacy tests and source-runtime import negative tests.
- [x] 3.15 Define app DTO authority and partial-patch mutation negative gates.
- [x] 3.16 Define duplicate Run in Game fingerprint table tests and app fingerprint-owner negative searches.
- [x] 3.17 Define app leaf adapter boundary tests and negative gates for phase/failure/fingerprint/background-worker ownership.

## 3A. Implementation Closure Gates

These are D4 implementation obligations recorded by this packet. Implementation
evidence is recorded in `workstream/testing-ledger.md` and review disposition is
recorded in `workstream/review-disposition-ledger.md`.

- [x] 3A.1 Implement package-owned `StudioOperationRuntime` with Effect Layer/Ref/SynchronizedRef/Semaphore-or-Queue ownership.
- [x] 3A.2 Move server identity, Run in Game registry, Save/Deploy registry, TTL, current projection, and operation event publication into the runtime service.
- [x] 3A.3 Route Run in Game, Save/Deploy, and Autoplay admission through the runtime mutation gate.
- [x] 3A.4 Replace public-shape mutation stores with internal ADTs plus projection.
- [x] 3A.5 Implement scoped worker supervision and disposal projection.
- [x] 3A.6 Delete app-local lifecycle ownership from `createStudioEngines` and app operation stores.
- [x] 3A.7 Preserve D3 typed failure semantics and D2.5 TypeBox public DTO ownership.
- [x] 3A.8 Replace mutation lifecycle engine callbacks in `StudioServerContext` with package runtime services and leaf adapter ports.
- [x] 3A.9 Run package/app/scenario tests and negative searches.

## 4. Verification

- [x] 4.1 `bun run openspec -- validate mapgen-studio-engine-runtime-services --strict`.
- [x] 4.2 `bun run openspec:validate`.
- [x] 4.3 `git diff --check`.
- [x] 4.4 `bun install --frozen-lockfile`.
- [x] 4.5 Historical pre-settlement packet-authoring base: `bun run build` and `bun run check`.
- [x] 4.6 `git status --short --branch`, `gt status`, and `gt log --no-interactive`.

## 5. Closure

- [x] 5.1 Record review acceptance in `review-disposition-ledger.md`.
- [x] 5.2 Mark D4 accepted in `OPENSPEC-PACKET-TRAIN.md`.
- [x] 5.3 Commit accepted D4 packet through Graphite with clean/quarantined worktree state.

## 6. Implementation Closure

- [x] 6.1 Record fresh implementation-diff review findings and dispositions.
- [x] 6.2 Repair worker Effect failure-channel handling so leaf failures project terminal state and clear active state.
- [x] 6.3 Repair public declaration privacy so generated DTS does not expose internal operation ADTs or the internal runtime service graph.
- [x] 6.4 Record browser-runner/preview recovery residue as outside D4 and owned by D6/D9/D10/D12.
- [x] 6.5 Run focused package/app gates and D4 negative-search proof.
- [x] 6.6 Commit D4 implementation through Graphite with clean/quarantined post-commit worktree state; proof is the current branch-tip implementation commit plus clean `git status --short --branch` on `codex/runtime-effect-engine-runtime-services` after amendment.
