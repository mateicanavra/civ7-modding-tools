## ADDED Requirements

### Requirement: Studio Consumes Live Game State Through The Control-oRPC Seam

Mapgen Studio SHALL consume live game state through the control-oRPC seam — the
`@civ7/control-orpc` contract and the `Civ7IntelligenceBridge` ingress — and SHALL
NOT read FireTuner and SHALL NOT re-implement live reads. The seam is bound
through a thin adapter so consumers do not import transport details directly.

#### Scenario: Studio reads live state through the seam
- **WHEN** the studio needs live world/readiness state
- **THEN** it issues read procedures (`world.current`, `world.grid.read`,
  `readiness.current`) through a `LiveControlPort` under `src/lib/control/*`
  that resolves to the control-oRPC client / `Civ7IntelligenceBridge` ingress
- **AND** no studio code reads FireTuner or holds a direct-control facade

#### Scenario: Studio binds to the landed control substrate
- **WHEN** the Studio shell polls live runtime status through its own `/rpc`
  client
- **THEN** it composes that status with `liveControlPort.readiness.current()`
  through the Studio-hosted `/api/civ7/rpc` middleware
- **AND** the readiness value is merged into the existing live-runtime status model
  without changing poll staleness/backoff behavior

#### Scenario: Bind-time contract divergence fires the falsifier
- **WHEN** the mainline control-oRPC package diverges structurally from the
  consumed contract namespaces, procedure keys, or output shapes
- **THEN** the studio stops and re-baselines the seam
- **AND** the divergence is escalated as the FRAME §3 falsifier rather than worked around

### Requirement: Control Seam Is Isolated Behind One Thin Port

The studio SHALL isolate control-oRPC consumption behind a single
`LiveControlPort` interface in `src/lib/control/*`, with a bound RPCLink
implementation, so that a breaking change in `@civ7/control-orpc` has a blast
radius limited to that directory and the Studio-hosted middleware adapter.

#### Scenario: Consumers depend only on the port
- **WHEN** UI, TanStack Query options, or Zustand selections need live state
- **THEN** they import only the `src/lib/control/*` port surface
- **AND** they do not import `@civ7/control-orpc`, `@civ7/direct-control`, RPCLink,
  or FireTuner

#### Scenario: Transport changes stay behind the port
- **WHEN** the control-oRPC transport changes
- **THEN** the update is isolated to `src/lib/control/*` and the server middleware
  adapter
- **AND** consumer code and the live-runtime poll's staleness/backoff gating remain
  unchanged

### Requirement: Studio Read Surface Preserves Parity And The Read-Only Boundary

The control seam SHALL move the source of live reads without changing live-runtime
poll semantics, and SHALL restrict the studio to read-only control procedures.

#### Scenario: Poll semantics preserved across the move
- **WHEN** the studio's live-runtime poll reads through the seam
- **THEN** its staleness/backoff gating and per-field error envelope behavior are
  identical to the pre-seam behavior
- **AND** failures are surfaced as typed `{ ok: false, error }` results, not thrown
  transport errors

#### Scenario: Studio does not send mutations
- **WHEN** the studio operates within the redesign workstream
- **THEN** it sends only procedures whose contract `risk` metadata is `read-only`
- **AND** it does not hand-assemble or send control-oRPC mutation envelopes
