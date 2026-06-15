# D12 Design - Game Door Invariant And Runtime Closeout

## D1. Closeout Component

D12 is the runtime closeout component. It does not introduce a new runtime
engine; it installs invariant documents, guard tests, classification ledgers,
and negative-search gates that keep D0-D11 ownership from drifting.

The closeout unit has five products:

- an evergreen game-door invariant;
- sanctioned direct-control session guardrails;
- schema/status/runtime-surface classification ledgers;
- final residue and proof ledgers;
- Graphite stack drain proof.

## D2. Game Door Ownership

The invariant is:

> Studio game-wire calls flow through the daemon runtime's shared
> `Civ7TunerSession`; bounded direct-control package flows may construct a
> per-flow session only through a sanctioned `@civ7/direct-control` scoped
> wrapper.

Forbidden owners include app code, router leaves, operation engines, local
scripts, control-oRPC hosts, and test helpers promoted into production. They may
request game work through sanctioned services; they may not construct socket
sessions directly.

## D3. Guard Shape

The direct-control guard is source-based and allowlist exact. It scans
production `apps/` and `packages/` TypeScript and excludes tests, generated
output, and build artifacts. The allowlist mirrors the invariant doc and fails
when a future implementation reaches around the game door.

The guard is paired with a surface classification ledger so developers can tell
the difference between:

- sanctioned daemon shared-session ownership;
- sanctioned direct-control package protocol ownership;
- public/manual diagnostic reads;
- forbidden runtime mutation or freshness ownership.

`workstream/control-orpc-surface-corpus.md` is the D12 packet corpus for
`@civ7/control-orpc`. It is keyed by `procedureKey` so future implementation
can prove every hosted game-action/effect surface has a risk, owner, and
session-consumption classification.

## D4. TypeBox And Status Closeout

D12 is the final check that the TypeBox spine stayed intact. Studio server
public contract schemas under `packages/studio-server/src/contract/**` cannot
import Zod directly. If a runtime success schema still depends on Zod, D12
migrates it to TypeBox/Standard Schema or records a blocker; it cannot leave a
mixed contract stack as a cheap exit.

Retained public/manual operation status endpoints are classified separately from
background freshness authority. A retained endpoint is allowed only if it is a
diagnostic request/response read with a named consumer and no browser polling,
watchdog, or recovery loop. Otherwise D12 deletes it.

`workstream/status-endpoint-corpus.md` names the retained surfaces and
distinguishes diagnostic reads from mutation-state reads/projections:
`civ7.live.status`, `runInGame.status`, `mapConfigs.status`,
`studio.operations.current`, `studio.serverInfo`, and `civ7.status`. It also
separates mutating entries (`runInGame.start`, `mapConfigs.saveDeploy`,
`civ7.autoplay`) so status classification does not hide workflow ownership.

## D5. Tuner Session Disposition

The `mapgen-studio-tuner-session` change cannot remain open with unchecked
ownership promises. D12 closes each promise by name:

- Run in Game session ownership is converged onto `Civ7TunerSession` or assigned
  to a sanctioned `@civ7/direct-control` scoped wrapper with guard tests;
- Restart Civ7 recovery is implemented, rejected with product authority, or
  moved to canonical deferral with owner, risk, scope, and re-entry trigger.

No active runtime doc may continue saying Run in Game convergence is out of
scope without pointing at this disposition.

## D6. Residue Sweep

The final sweep spans code, tests, active OpenSpec changes, project docs, and
evergreen docs. It removes or classifies:

- `RunInGameHttpError` and HTTP transport-bridge residue;
- `StudioEngineError` and active status-code bridge residue;
- Zod contract residue;
- browser operation recovery keys;
- operation polling/watchdog hooks;
- browser live-status cadence;
- app-local dev supervision and daemon Bun watcher residue;
- old satellite client/path symbols;
- generic public mutation DTOs that bypass semantic TypeBox unions;
- direct-control runtime-port aliases exported from public root packages;
- stale comments that describe deleted `/api`, polling, or coexistence paths as
  current behavior.

Historical workstream records may mention deleted symbols as evidence. Active
target docs and source comments may not preserve them as implementation paths.

Generic mutation residue is not searched as one vague category. D12 splits it
into public Studio contract/router/workflow DTOs, control-oRPC/direct-control
internals, and tests/historical docs. A protocol-shaped record can be valid
inside `@civ7/control-orpc`; the same shape as a public Studio mutation DTO is a
blocker.

## D7. Final Stack Proof

D12 implementation closure includes Graphite stack submission and drain proof.
The final stack is submitted, merged bottom-to-top, synced with
`gt sync --no-restack --no-interactive --force`, and checked so merged branches
are not left checked out in worktrees. This is the only packet that owns stack
drain as part of its closure.

## D8. Proof Boundaries

OpenSpec validation proves packet shape only. Guard tests prove source
invariants. Negative searches prove deletion. Package/app gates prove code still
builds and tests. Live proof is consumed from the behavior-changing slices
D1/D9/D10/D11; D12 runs new live proof only if its implementation changes live
runtime behavior or a final closeout claim lacks required live evidence.
