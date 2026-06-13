## ADDED Requirements

### Requirement: Studio Has One Game Door

MapGen Studio SHALL construct `Civ7DirectControlSession` only in the daemon
runtime's shared `Civ7TunerSession` owner or in the direct-control package's
bounded per-flow wrapper.

#### Scenario: Production constructors are allowlisted

- **WHEN** production app and package TypeScript is scanned for
  `new Civ7DirectControlSession(...)`
- **THEN** the only allowed Studio runtime owner is
  `packages/studio-server/src/services/Civ7TunerSession.ts`
- **AND** the only allowed direct-control package owner is
  `packages/civ7-direct-control/src/session/session.ts`
- **AND** app code, router leaves, operation engines, and caller-local scripts
  do not construct sessions directly

### Requirement: Studio Server Contracts Use TypeBox Success Schemas

The `@civ7/studio-server` contract success I/O schemas SHALL use
TypeBox/Standard Schema rather than direct Zod schemas.

#### Scenario: Contract schema technology is uniform

- **WHEN** `packages/studio-server/src/contract` is inspected
- **THEN** no direct `zod` import remains
- **AND** success I/O schemas are TypeBox artifacts adapted through Standard
  Schema
- **AND** request defaults remain visible in router logic rather than hidden in a
  second schema technology

### Requirement: Tuner Session Follow-Ups Are Dispositioned

The `mapgen-studio-tuner-session` change SHALL not remain open with unchecked
runtime ownership promises after S4.1.

#### Scenario: Prior follow-ups are closed or durable

- **WHEN** `openspec/changes/mapgen-studio-tuner-session/tasks.md` is inspected
- **THEN** the run-in-game session convergence item is closed by the game-door
  invariant
- **AND** the "Restart Civ7" recovery affordance is tracked in a durable deferral
  record with owner, trigger, scope, and impact

### Requirement: Runtime Simplification Residue Stays Deleted

S4.1 SHALL leave no live runtime simplification residue that implies the browser
or legacy mounts still own daemon runtime truth.

#### Scenario: Old runtime residue is absent

- **WHEN** app/package source is scanned for deleted operation polling,
  live-status polling, daemon watchdog, source-snapshot storage, retired
  satellite clients, or `RunInGameHttpError`
- **THEN** only historical docs or explicit guard/proof records may mention
  those symbols
- **AND** live code comments do not describe deleted `/api` coexistence as
  current behavior
