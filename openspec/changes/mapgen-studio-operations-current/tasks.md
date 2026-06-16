## 1. Packet Entrance

- [x] 1.1 Confirm D0-D5 are accepted in `OPENSPEC-PACKET-TRAIN.md`.
- [x] 1.2 Confirm `mapgen-studio-operations-current` exists but requires repair from stale S2.1 implementation closure to D6 frame-standard packet.
- [x] 1.3 Run D6 runtime projection, browser recovery deletion, TypeBox/schema, testing/parity, hardening/prework, black-ice, and downstream review lanes.
- [x] 1.4 Record packet entrance proof: dependency install freshness, baseline build/check, `git status --short --branch`, `gt status`, `gt log --no-interactive`, dirty-file quarantine, and selected baseline.

## 2. Packet Scope

- [x] 2.1 Specify `studio.operations.current` as a D4 `StudioOperationRuntime` read projection.
- [x] 2.2 Specify active and terminal-only recent operation projection for Run in Game and Save/Deploy.
- [x] 2.3 Specify fresh-daemon empty truth and daemon identity.
- [x] 2.4 Specify TTL/status matrix for active, retained terminal, expired-known tombstone, physically pruned or never-known id, and daemon identity mismatch.
- [x] 2.5 Specify client boot adoption from daemon current truth.
- [x] 2.6 Specify browser operation recovery bridge deletion.
- [x] 2.7 Preserve unrelated localStorage owners outside the deletion boundary.
- [x] 2.8 Specify TypeBox/Standard Schema origin and D3 typed not-found/error discipline.
- [x] 2.9 Preserve status polling/watchdog only as D8/D9 deletion-targeted behavior.
- [x] 2.10 Specify D8/D9 and D12 downstream handoff obligations, including `useStudioEvents.ts` protection.

## 3. Packet Proof Strategy

- [x] 3.1 Define runtime projection tests with real D4 runtime and fake retained operations.
- [x] 3.2 Define fresh-daemon empty current test.
- [x] 3.3 Define active and retained terminal operation tests.
- [x] 3.4 Define TTL/status agreement tests.
- [x] 3.5 Define boot adoption tests.
- [x] 3.6 Define browser operation recovery deletion tests and expanded symbol/API negative searches.
- [x] 3.7 Define TypeBox/schema origin and canonical DTO reuse guard tests.
- [x] 3.8 Define unrelated localStorage owner protection tests for authoring, preset, theme, and non-operation UI state.
- [x] 3.9 Define no new polling/event transport scope tests.

## 3A. Future Implementation Closure Gates

These are D6 implementation obligations recorded by this packet, not pre-acceptance authoring tasks.

- [x] 3A.1 Implement/repair `StudioOperationRuntime.current`.
- [x] 3A.2 Route `studio.operations.current` router leaf through the managed runtime.
- [x] 3A.3 Define TypeBox request/response schemas for operation current.
- [x] 3A.4 Delete browser operation recovery localStorage keys/modules.
- [x] 3A.5 Replace shell boot request-id replay with daemon-current adoption and classify the D8/D9 event-hook hello read as protected residual behavior.
- [x] 3A.6 Preserve status polling only for active operations until D8/D9.
- [x] 3A.7 Run package/app tests, negative searches, and schema guards.

## 4. Verification

- [x] 4.1 `bun run openspec -- validate mapgen-studio-operations-current --strict`.
- [x] 4.2 `bun run openspec:validate`.
- [x] 4.3 `git diff --check`.
- [x] 4.4 `bun install --frozen-lockfile`.
- [x] 4.5 Current packet-authoring base: `bun run build` and `bun run check`.
- [x] 4.6 `git status --short --branch`, `gt status`, and `gt log --no-interactive`.

Verification reconciliation note, 2026-06-16:

- These rows were stale packet-authoring entrance checks, not current D6 code
  work. Current main includes D6 via PR `#1740`, and later D12 validation
  records include full OpenSpec validation plus runtime state-machine proof
  using `studio.operations.current({})` for invalid, Run in Game, and
  Save&Deploy flows.

## 5. Closure

- [x] 5.1 Record review acceptance in `review-disposition-ledger.md`.
- [x] 5.2 Mark D6 accepted in `OPENSPEC-PACKET-TRAIN.md`.
- [x] 5.3 Commit accepted D6 packet through Graphite with clean/quarantined worktree state.
