## 1. Packet Entrance

- [x] 1.1 Confirm D0-D2.5 are accepted in `OPENSPEC-PACKET-TRAIN.md`.
- [x] 1.2 Confirm existing `mapgen-studio-error-spine` records are stale old-S1.2 closure records requiring packet repair.
- [x] 1.3 Run D3 error-corpus and hardening/black-ice prework lanes.
- [x] 1.4 Run D3 TypeScript/schema, Effect/lifecycle, testing, and adversarial review lanes.
- [x] 1.5 Record packet entrance proof: dependency install freshness, baseline build/check, `git status --short --branch`, `gt status`, `gt log --no-interactive`, dirty-file quarantine, and selected baseline.

## 2. Packet Scope

- [x] 2.1 Specify D3 as a packet/specification repair, not an old implementation closure claim.
- [x] 2.2 Specify failure ADT ownership, namespace mapping ownership, TypeBox error-data ownership, and status-code bridge deletion boundaries.
- [x] 2.3 Specify expected failure tags for blocked, invalid, not-found, expired, daemon identity mismatch, runtime disposed, unsupported operation type, dependency unavailable, and materialization/deploy/proof failed.
- [x] 2.4 Specify D2.5 `details?: unknown` bridge deletion/narrowing target.
- [x] 2.5 Specify router/runtime-only raw `ORPCError` construction ownership.
- [x] 2.6 Specify daemon identity echo for Run in Game and Save/Deploy status misses.
- [x] 2.7 Specify typed recovery-action vocabulary.
- [x] 2.8 Specify binary D3 closure rule deleting production status-code bridge errors.
- [x] 2.9 Specify normative failure vocabulary ledger with tags, owners, codes, data schemas, and recovery actions.
- [x] 2.10 Specify deterministic lifecycle mapping matrix for Run in Game, Save/Deploy, and Autoplay.
- [x] 2.11 Specify Autoplay start/stop and verification failed outcomes.
- [x] 2.12 Specify sealed reason-code matrix for Run in Game, Save/Deploy, Autoplay, and Studio lifecycle failures.

## 3. Packet Proof Strategy

- [x] 3.1 Define failure-corpus ledger coverage and per-surface oracles.
- [x] 3.2 Define TypeBox error-data tests for every declared Studio expected error.
- [x] 3.3 Define exhaustive mapper tests for every namespace/failure-tag pair.
- [x] 3.4 Define handler/client tests proving defined oRPC errors and status-code pins.
- [x] 3.5 Define scenario tests for Run in Game, Save/Deploy, and Autoplay failure paths.
- [x] 3.6 Define negative searches for retired bridge names, permissive details, status-code truth, raw ORPC ownership, stale closure text, and legacy schema allowance.
- [x] 3.7 Define live-proof disposition boundary.
- [x] 3.8 Define `effect-orpc` import ownership scan and production status-code bridge deletion guard.
- [x] 3.9 Define failure-vocabulary tests for mapper totality, TypeBox data, and recovery-action sealing.
- [x] 3.10 Define defect-containment tests separately from expected workflow failure ADT totality.
- [x] 3.11 Define lifecycle matrix tests and Autoplay failed-outcome tests.
- [x] 3.12 Define `@civ7/control-orpc` and `@civ7/direct-control` package gate/untouched-disposition requirements.

## 3A. Future Implementation Closure Gates

These were D3 implementation obligations recorded by this packet, not
pre-acceptance authoring tasks. Implementation started on the accepted
Nx/Habitat-restacked runtime stack (`codex/runtime-effect-error-spine`).

- [x] 3A.1 Implement package-owned failure ADT, TypeBox error-data schemas, namespace mapper, and sanitized defect data.
- [x] 3A.2 Replace status-code-shaped `StudioEngineError` public truth with typed expected failures.
- [x] 3A.3 Remove or narrow expected-failure `details?: unknown` declared error data.
- [x] 3A.4 Move raw ORPC construction to router/runtime mapping ownership only.
- [x] 3A.5 Convert Run in Game, Save/Deploy, and Autoplay known failure paths to typed failures.
- [x] 3A.6 Delete production `StudioEngineError` / `RunInGameHttpError` construction, catch, import, and bridge mapping.
- [x] 3A.7 Update stale comments/docs/specs that describe old S1.2 closure or legacy Zod/permissive details.
- [x] 3A.8 Run package/app/scenario tests and negative searches, including `effect-orpc` import classification, status-code bridge deletion scans, and control package gates or untouched-package dispositions.

## 4. Verification

- [x] 4.1 `bun run openspec -- validate mapgen-studio-error-spine --strict`.
- [x] 4.2 `bun run openspec:validate`.
- [x] 4.3 `git diff --check`.
- [x] 4.4 `bun install --frozen-lockfile`.
- [x] 4.5 Historical pre-settlement packet-authoring base: `bun run build` and `bun run check`. Future migrated Nx/Habitat implementation base: replace with classified repo-local Nx/Habitat targets before code edits.
- [x] 4.6 `git status --short --branch`, `gt status`, and `gt log --no-interactive`.
- [x] 4.7 Implementation package gate: `bun run --cwd packages/studio-server check`.
- [x] 4.8 Implementation package proof: `bun run --cwd packages/studio-server test -- test/handler.test.ts test/errorSpine.test.ts test/contractTypeboxSpine.test.ts`.
- [x] 4.9 Implementation package build/declaration freshness: `bun run --cwd packages/studio-server build`.
- [x] 4.10 Implementation app gate: `bun run --cwd apps/mapgen-studio check`.
- [x] 4.11 Implementation focused app proof: `bun run --cwd apps/mapgen-studio test -- test/server/engineErrorSpine.test.ts test/runInGame/operationState.test.ts test/server/engineEffectCorpus.test.ts test/mapConfigSave/operationState.test.ts test/mapConfigSave/status.test.ts`.
- [x] 4.12 Implementation negative bridge/recovery-action scan: `rg "StudioEngineError|STUDIO_ENGINE_ERROR_MAPPINGS|toStudioEngineOrpcError|RunInGameHttpError|data\\.details|details\\?: unknown|details: Type\\.Optional\\(Type\\.Unknown|recoveryActions: Type\\.Optional\\(Type\\.Array\\(Type\\.String\\(\\)\\)" apps/mapgen-studio/src apps/mapgen-studio/test packages/studio-server/src packages/studio-server/test -g '*.ts'` returned no matches.
- [x] 4.13 Implementation browser-boundary build proof: `bun run --cwd packages/civ7-control-orpc check`, repeated `bun run --cwd packages/civ7-control-orpc build`, focused `bun run --cwd packages/civ7-control-orpc test -- test/attention-current-procedure.test.ts test/strategy-front-summary-procedure.test.ts`, `bun run --cwd packages/studio-server build`, and `bun run --cwd apps/mapgen-studio build` passed after browser feature modules moved value imports for operation DTO constants to `@civ7/studio-server/contract` and Studio's contract entrypoint moved its control contract value import to `@civ7/control-orpc/contract`.
- [x] 4.14 Implementation browser root-import proof: multiline-safe exact-root scan `rg -nU --pcre2 "^import\\s+(?!type)(?:\\{[^}]*\\}|[^\\n;]+)\\s+from\\s+[\\\"']@civ7/studio-server[\\\"']" apps/mapgen-studio/src -g '*.ts' -g '*.tsx'` returns only server modules, and the same scan with `-g '!apps/mapgen-studio/src/server/**'` returns zero browser/non-server hits.

## 5. Closure

- [x] 5.1 Record review acceptance in `review-disposition-ledger.md`.
- [x] 5.2 Mark D3 accepted in `OPENSPEC-PACKET-TRAIN.md`.
- [x] 5.3 Commit accepted D3 packet through Graphite with clean/quarantined worktree state.
- [x] 5.4 Record fresh implementation-diff review disposition, including the post-build browser-boundary review and control-package contract subpath repair.
- [x] 5.5 Commit D3 implementation through Graphite with clean/quarantined worktree state: current branch tip `feat(studio): add typed runtime failure spine`, followed by clean `git status --short --branch` on `codex/runtime-effect-error-spine`.
