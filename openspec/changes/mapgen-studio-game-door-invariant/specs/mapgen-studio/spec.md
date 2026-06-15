## ADDED Requirements

### Requirement: Studio Has One Game Door

MapGen Studio SHALL construct `Civ7DirectControlSession` only in sanctioned
game-door owners.

#### Scenario: Production constructors are allowlisted

- **WHEN** production app and package TypeScript is scanned for
  `new Civ7DirectControlSession(...)`
- **THEN** the only allowed Studio runtime owner is the daemon shared
  `Civ7TunerSession` service
- **AND** the only allowed direct-control package owner is the sanctioned
  direct-control scoped wrapper
- **AND** app code, router leaves, operation engines, control-oRPC hosts, and
  caller-local scripts do not construct sessions directly

### Requirement: Studio Runtime Contracts And Status Surfaces Are Classified

The runtime closeout SHALL leave Studio public contracts and public/manual
status reads with explicit ownership.

#### Scenario: Contract schema technology is uniform

- **WHEN** `packages/studio-server/src/contract` is inspected
- **THEN** no direct `zod` import remains
- **AND** public contract schemas are TypeBox artifacts adapted through Standard
  Schema
- **AND** request defaults are visible at the router/service interpretation
  point rather than hidden in a second schema technology

#### Scenario: Public/manual status endpoints are classified

- **WHEN** Run in Game, Save&Deploy, Autoplay, and current-operation status
  surfaces are inspected
- **THEN** retained public/manual status endpoints are classified as diagnostic
  request/response reads, mutation-state reads/projections, or identity reads
  with named consumers
- **AND** the classification names `civ7.live.status`, `runInGame.status`,
  `mapConfigs.status`, `studio.operations.current`, `studio.serverInfo`, and
  `civ7.status`
- **AND** retained status endpoints do not own background freshness, browser
  polling, watchdog recovery, or operation truth
- **AND** unclassified status endpoints are deleted

### Requirement: Tuner Session Follow-Ups Are Dispositioned

The `mapgen-studio-tuner-session` change SHALL not remain open with unchecked
runtime ownership promises after D12.

#### Scenario: Prior follow-ups are closed or durable

- **WHEN** `openspec/changes/mapgen-studio-tuner-session/tasks.md` is inspected
- **THEN** Run in Game session ownership is closed by convergence onto
  `Civ7TunerSession` or by sanctioned direct-control wrapper ownership with
  guard tests
- **AND** Restart Civ7 recovery is implemented, rejected with product authority,
  or tracked in a durable deferral with owner, trigger, scope, risk, and re-entry
  action
- **AND** active runtime docs classify every Run in Game convergence/session
  residue through D12 or a durable owner
  without pointing to that disposition

### Requirement: Runtime Simplification Residue Stays Deleted

D12 SHALL leave no live runtime simplification residue that implies the browser,
legacy mounts, app-local dev supervision, or generic mutation routes still own
daemon runtime truth.

#### Scenario: Old runtime residue is absent or classified

- **WHEN** app/package source, active docs, and active OpenSpec changes are
  scanned for runtime residue
- **THEN** `RunInGameHttpError`, `StudioEngineError`, browser operation
  recovery, operation polling, daemon watchdog, browser live-status cadence,
  app-local dev supervision, old satellite clients, generic public Studio
  mutation DTOs, and direct-control public aliases are absent from live paths
- **AND** any remaining matches are classified as historical evidence,
  diagnostic request/response, guard text, or durable deferral
- **AND** active live code comments do not describe deleted `/api`, polling, or
  coexistence paths as current behavior

### Requirement: Control-oRPC Runtime Surfaces Are Classified

D12 SHALL leave `@civ7/control-orpc` game-action and effect surfaces classified
by owner, risk, and session-consumption behavior.

#### Scenario: Control-oRPC procedure keys are classified

- **WHEN** `packages/civ7-control-orpc/src/modules/*/contract.ts` procedure
  metadata is inspected
- **THEN** every procedure key is classified as `read-only`,
  `runtime-support`, or `mutation`
- **AND** mutation procedure families are typed game-action requests that
  consume `Civ7ControlOrpcContext.directControl` and host-supplied
  `endpointDefaults`
- **AND** Studio hosting of control-oRPC does not construct its own
  `Civ7DirectControlSession` outside the sanctioned game door
- **AND** generic protocol records such as `operationType` plus numeric args are
  allowed only inside control-oRPC/direct-control internals, tests, or
  historical evidence, not as public Studio mutation DTOs

### Requirement: Runtime Refactor Stack Closes Cleanly

D12 SHALL close the packet train with explicit proof classes and stack state.

#### Scenario: Final proof ledger is complete

- **WHEN** D12 implementation closes
- **THEN** its proof ledger separates OpenSpec validation, guard tests,
  package/app gates, negative searches, consumed live proof, new live proof if
  required, Graphite submit/merge/drain, and residual risks
- **AND** all D0-D12 packet statuses are accepted or have a precise not-green
  handoff

#### Scenario: Graphite stack is drained

- **WHEN** review/merge policy allows final stack closure
- **THEN** the runtime refactor stack is submitted with Graphite, merged
  bottom-to-top, synced with `gt sync --no-restack --no-interactive --force`,
  and checked so merged branches are not checked out in worktrees
