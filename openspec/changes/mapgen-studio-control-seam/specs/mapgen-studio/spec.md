## ADDED Requirements

### Requirement: Studio Consumes Live Game State Through The Control-oRPC Seam

Mapgen Studio SHALL consume live game state through the control-oRPC seam — the
`@civ7/control-orpc` contract and the `Civ7IntelligenceBridge` ingress — and SHALL
NOT read FireTuner and SHALL NOT re-implement live reads. The seam is designed
toward the tip of the live-control `codex/*` stack and is not yet on `main`; the
studio SHALL bind the real client later via a thin adapter without rewriting
consumers.

#### Scenario: Studio reads live state through the seam
- **WHEN** the studio needs live world/readiness state
- **THEN** it issues read procedures (`world.current`, `world.grid.read`,
  `readiness.current`) through a `LiveControlPort` that resolves to the
  control-oRPC client / `Civ7IntelligenceBridge` ingress
- **AND** no studio code reads FireTuner or holds a direct-control facade

#### Scenario: Studio designs against stack-top, not main
- **WHEN** the `@civ7/control-orpc` package is absent from `main` and mid-consolidation
- **THEN** the studio's seam design is captured from the live-control stack tip and
  marked "designed-toward stack-top, not yet on main"
- **AND** the studio's server/data work proceeds off `main` without waiting for the
  live-control stack to merge

#### Scenario: Bind-time contract divergence fires the falsifier
- **WHEN** the package that lands on `main` diverges structurally from the captured
  control-oRPC contract namespaces, procedure keys, or output shapes
- **THEN** the studio stops and re-baselines the seam
- **AND** the divergence is escalated as the FRAME §3 falsifier rather than worked around

### Requirement: Control Seam Is Isolated Behind One Thin Port

The studio SHALL isolate control-oRPC consumption behind a single
`LiveControlPort` interface in `src/lib/control/*`, with a bound RPCLink
implementation and a legacy direct-control-backed fallback implementation, so that
a breaking change in `@civ7/control-orpc` has a blast radius limited to that
directory.

#### Scenario: Consumers depend only on the port
- **WHEN** UI, TanStack Query options, or Zustand selections need live state
- **THEN** they import only `LiveControlPort`
- **AND** they do not import `@civ7/control-orpc`, `@civ7/direct-control`, RPCLink,
  or FireTuner

#### Scenario: Cutover is an adapter swap
- **WHEN** `@civ7/control-orpc` becomes reachable over transport
- **THEN** the bound implementation replaces the legacy implementation behind the
  same `LiveControlPort`
- **AND** consumer code and the live-runtime poll's staleness/backoff gating are
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
