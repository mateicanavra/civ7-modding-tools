# Advisor Wave 1: Scope And Decomposition

Status: complete

Purpose: decompose the Run in Game runtime/materialization restructuring into
OpenSpec packet candidates before any packet is drafted.

## Shared Grounding

All advisors are read-only and anchored to:

- `docs/projects/mapgen-studio/resources/run-in-game-deploy-manifest-proposal.md`
- `docs/projects/mapgen-studio/workstream/run-in-game-runtime-openspec-packets/process.md`
- relevant Civ7 OpenSpec/product/architecture/testing context for their lens.

Shared hard core:

- collapse state space;
- do not preserve legacy behavior;
- no shims;
- no fallbacks;
- no dual paths;
- no compatibility lanes;
- no optional target shapes;
- behavior tests are for behavior only;
- the structural authority matrix assigns each structure/topology assertion to
  one runner;
- permanent structure is asserted positively in its required shape;
- current code is evidence, not target authority.

## Advisors

| Agent | Lens | Agent id |
| --- | --- | --- |
| Nietzsche | Contract and identity boundaries | `019f3595-ef56-73f3-9849-f13f9b3d401a` |
| Feynman | Operation lifecycle, ownership, concurrency | `019f3595-f0e2-70f1-ac1b-5c86b861179b` |
| Harvey | Generation, deployment, artifact boundaries | `019f3595-f2f9-7223-8e1c-2920407315c7` |
| Galileo | Diagnostics, attribution, public status | `019f3595-f492-7d83-b306-67e48e47885d` |
| Euler | Testing strategy and verification rails | `019f3595-f5ea-7a30-8383-f5a23f1c622d` |

## Output Contract

Each advisor report must include:

- natural packet groupings;
- domino order;
- concrete components/files likely touched;
- boundary enforcement;
- design questions that must be resolved before packet drafting;
- packet sizing risks or verification risks specific to the lens.

## Synthesis State

Advisor reports and adversarial review complete. This file is the Stage 1
decomposition record used to draft the packet train.

## Converged Findings

All five advisors independently converged on the same dominant system shape:

1. Public status, operation identity, and diagnostics must be split before the
   implementation continues to move. The current public DTO mixes UI state,
   request details, generation artifacts, failure internals, attribution data,
   and developer diagnostics.
2. Fingerprint/content digest is not operation identity. A fresh launch with the
   same authored content is a new operation. Expired old request ids remain
   lookup facts; they do not block future starts.
3. Source resolution is the first true domain boundary. Catalog source and
   editor state must become explicit source kinds before generation can be made
   deterministic.
4. Catalog generation and Run in Game generation must split by input authority:
   catalog generation reads `CatalogSourceIndex`; Run in Game generation reads
   `StudioRunGenerationManifest`.
5. Request-scoped generation must not write catalog source paths, shared
   generated TypeScript entries, shared `mod/`, or shared `dist/` as request
   state.
6. Deployment evidence comes from the post-copy deployed artifact, not from local
   generated output, command stdout, or inferred Nx success.
7. Runtime observation starts only after manifest, generated mod, and deployed
   snapshot are complete. Runtime observation cannot compensate for missing
   artifact records.
8. Diagnostics and attribution need developer-owned records referenced by id;
   they must not be embedded in public status, event streams, or UI display
   props.
9. The old env/config-file request path must be deleted after replacement
   boundaries exist. It must not survive as a support-both mode.

## Resolved Design Questions

| Question | Decision |
| --- | --- |
| Does identical authored input mean the same operation? | No. Request id is operation identity. Content digests support correlation and attribution only. |
| Does HTTP abort cancel a Run in Game operation? | No. Only explicit cancellation cancels. Browser disconnects do not replay or cancel mutation. |
| Should Run in Game keep durable/disposable materialization modes? | No as target architecture. Run in Game always performs request-scoped generation. Save/Deploy remains the durable catalog/deploy path. |
| Who owns `CatalogSourceIndex`? | The Swooper Maps mod owns it as tracked source data because it defines shipped catalog membership. |
| Who owns `StudioRunGenerationManifest` schema? | `@civ7/studio-contract` owns the schema/type. The Swooper Maps generator consumes it as an input contract. |
| Should request map script identity use `studio-current`, source id, or request id? | Request-scoped script/map-row identity is derived from request id. Source id is metadata/correlation. |
| Does Run in Game generation use env vars for request selection or correlation? | No. Correlation lives in the manifest and generated assets. |
| Does deployment rebuild as a side effect? | No. Generation produces a request-local generated mod. Deployment copies and snapshots. |
| Should diagnostics be in-memory only? | No. Diagnostics and attribution records live under the request workspace so they survive daemon restart within retention policy. |
| Are public safe categories identical to developer failure reason codes? | No. Public categories are coarse and closed; developer reasons stay in diagnostics. |
| Can runtime observation compensate for missing artifact records? | No. Runtime observation requires completed manifest, generated mod, and deployed snapshot records. |
| Is automatic process restart after disposable row miss target behavior? | No as implicit behavior. Any disruptive recovery must become an explicit recovery operation/action, not hidden branch logic. |

## Adversarial Review Disposition

The second advisor pass rejected the first nine-packet synthesis as too coarse.
The accepted repairs are:

- diagnostics cannot be a dangling public id: the first public-contract packet
  must create a resolvable private diagnostics record;
- public Run in Game errors are public API too, so they obey the same safe
  payload rules as status/current/events;
- operation identity/admission must be request-id scoped before source and
  generation packets depend on it;
- cancellation is in scope and must be explicit, idempotent, terminal, and
  lease-releasing;
- ownership loss is modeled with a durable operation record, not with
  client-side guessing;
- old paths are deleted by the packet that replaces them, not by a final
  compatibility cleanup packet;
- deleted paths are not enforced with behavior tests for old keys; packets use
  the structural authority matrix where topology and ownership need durable
  enforcement;
- catalog index introduction and catalog generation cutover are separate,
  because Run in Game must not be broken before request-scoped generation
  exists;
- generation needs a pure render/file-plan boundary before a manifest-only
  generator can be cleanly added;
- deployment target identity is a real design decision. The target architecture
  uses a stable Studio-run deployed mod id, `mod-swooper-studio-run`, with
  request-scoped map rows/scripts inside it;
- runtime observation and attribution synthesis are separate packets;
- `RuntimeMapObservation` is out of this packet train. Runtime observation
  means scripting-log observation and setup-row readback for this migration;
- retention is explicit: request workspaces and diagnostics are retained for
  72 hours and at least the latest 100 terminal operations. Cleanup runs at
  daemon startup and terminalization, never while an operation is active.

## Packet Decomposition

### Packet 1: Public Run Status, Errors, And Diagnostics Envelope

Defines the closed public Run in Game vocabulary before internals move.

- Public phases:
  `resolving-source`, `generating-artifacts`, `deploying`, `preparing-civ7`,
  `starting-game`, `observing-runtime`, `completed`, `failed`, `cancelled`.
- Public failure categories:
  `request-validation`, `source-resolution`, `artifact-generation`,
  `deployment`, `runtime-control`, `runtime-observation`, `attribution`,
  `cleanup`, `ownership`, `dependency-unavailable`, `operation-cancelled`,
  `internal-defect`.
- `PublicRunStatus`, status events, current projection, and declared oRPC error
  data are closed schemas and never carry raw diagnostics.
- Every public `diagnosticsId` resolves to a private `RunDiagnosticsRecord`.

### Packet 2: Operation Registry Identity And Durable Operation Record

Makes request id the operation identity and removes content-fingerprint
admission.

- `requestId` is the only admission identity.
- Content digests support attribution and correlation only.
- Expired request ids are lookup facts and never block fresh launches with the
  same authored content.
- A minimal durable `RunOperationRecord` records request id, daemon id, phase,
  status, diagnostics id, timestamps, and terminal outcome.
- On daemon startup, non-terminal records owned by another daemon terminalize as
  `failed` with public category `ownership`.

### Packet 3: Explicit Cancellation And Terminalization

Adds the explicit cancellation surface and cleanup semantics.

- `runInGame.cancel({ requestId })` cancels only a matching active operation.
- Repeated cancellation is idempotent.
- Terminal operations are not mutated by cancellation.
- Cancellation interrupts the worker, releases held resources, records
  diagnostics, emits exactly one terminal event, and projects public status
  `cancelled` with category `operation-cancelled`.

### Packet 4: Catalog Source Identity And Index Contract

Creates durable catalog identity without changing request generation yet.

- Defines `catalogSourceId`, `configPath`, display metadata, and digest inputs.
- Adds tracked Swooper Maps `CatalogSourceIndex` as source data.
- Adds validation that every catalog source id/path pair is unique and resolves.
- Leaves current active generation behavior intact until request-scoped
  generation exists.

### Packet 5: Launch Source Resolution

Replaces mixed request fields with a closed source contract.

- Public start input becomes a discriminated
  `CatalogLaunchSource | EditorLaunchSource`.
- The Studio app supplies editor state only; server/runtime owns source
  resolution; Swooper owns catalog index data and reading.
- Server resolution produces `ResolvedLaunchSource`, `LaunchEnvelope`,
  `LaunchSourceDigest`, and `LaunchEnvelopeDigest`.
- Accepted start input no longer includes top-level raw `config`,
  `sourceSnapshot`, `materialization`, or `selectedConfig.sourcePath`.

### Packet 6: Swooper Map Artifact Render File Plan

Extracts generation rendering from writing.

- Introduces a pure render/file-plan module for Swooper map artifacts.
- Catalog generation and Run in Game generation consume the same renderer.
- The file plan defines modinfo, config, text, data, map row, runtime script,
  and marker-bearing output paths before anything writes them.

### Packet 7: Studio Run Workspace, Correlation, And Generation Manifest

Creates the request-scoped artifact root and one generator input.

- `StudioRunWorkspace` is `.mapgen-studio/run-in-game/<requestId>/`.
- `RunArtifactId` is `run-${sha256(requestId).slice(0, 20)}` and is the only
  filesystem/XML/map-row-safe projection of a request id.
- `RunCorrelation` is `requestId`, `runArtifactId`, `launchSourceDigest`,
  `launchEnvelopeDigest`, and `generationManifestDigest`.
- `generationManifestDigest` is SHA-256 over canonical sorted JSON of the
  manifest with the digest field omitted.
- Runtime writes exactly one `StudioRunGenerationManifest` from a
  `ResolvedLaunchSource` before invoking generation.

### Packet 8: Manifest-Only Swooper Run Generator

Generates a request-local mod tree from one manifest.

- Generator accepts exactly one manifest path.
- `StudioRunGeneratedMod` is written only under the request workspace.
- Generated row id is
  `MAP_${runArtifactId.replace(/-/g, "_").toUpperCase()}`.
- Generated script is `maps/${runArtifactId}.js`.
- Generated assets embed the full `RunCorrelation`.
- Request generation writes no catalog configs, shared generated entries,
  shared `mod/`, or shared `dist/`.

### Packet 9: Catalog Generation Cutover To Source Index

Moves durable catalog generation onto explicit catalog source data.

- Catalog map artifact generation reads only `CatalogSourceIndex`.
- Directory scanning is not catalog authority.
- `studio-current` is not catalog input.
- Studio recipe/schema/catalog targets remain catalog-only and do not build
  request runtime artifacts.

### Packet 10: Studio Runtime Generator Integration

Connects Run in Game to manifest-only generation and deletes replaced request
generation.

- Run in Game invokes the manifest-only generator port.
- Run in Game no longer uses `materializeRunInGameConfig`,
  `deploySwooperMapsForRun`, request-selection env vars, source-path mutation,
  cleanup regeneration, or request-specific Nx env cache inputs.
- Public status advances through source, artifact generation, and deployment
  phases using the closed Packet 1 vocabulary.

### Packet 11: Deployment Snapshot And Runtime Ownership Lease

Makes deployment a copy-and-record boundary and protects shared Civ7 state.

- Deployment copies from `StudioRunGeneratedMod` into stable deployed mod id
  `mod-swooper-studio-run`.
- Studio ensures the setup configuration used for Run in Game enables that
  stable Studio-run mod.
- `RuntimeOwnershipLease` covers Civ7 setup/start plus writes to the Studio-run
  deployed mod. Save/Deploy cannot write its deployed mod surface while Run in
  Game holds the lease.
- `RunDeployment` and `DeployedModSnapshot` are recorded after copy, never
  inferred from generation or command success.
- Deploy never rebuilds.

### Packet 12: Runtime Observation

Collects runtime evidence after deployment is complete.

- Observation starts only after manifest, generated mod, deployment, and
  deployed snapshot records exist.
- Observation collects scripting-log correlation and setup-row readback.
- Observations match `RunCorrelation`.
- Runtime map readback is not modeled in this packet train.
- Direct Civ7 control remains inside `@civ7/direct-control`.

### Packet 13: Attribution Report

Synthesizes recorded facts into one developer-facing report.

- `RunAttributionReport` is created with the workspace/manifest and appended as
  generation, deployment, and observation records complete.
- The report composes manifest digest, generated mod digest, deployment
  snapshot, scripting-log observation, setup-row readback, and terminal result.
- Launch success depends on the start/game-control outcome. Attribution can be
  `complete` or `incomplete`; only correlation mismatch that proves the wrong
  artifact ran fails the operation.
- Attribution records are never embedded in public status/current/events.

### Packet 14: Diagnostics Retention, Copy Diagnostics, And Guard Closure

Closes the packet train with retention and negative guards only.

- Request workspaces, diagnostics, and attribution are retained for 72 hours and
  at least the latest 100 terminal operations.
- Cleanup runs at daemon startup and terminalization and never deletes active
  operations.
- Copy Diagnostics reads the private diagnostics/attribution records by
  diagnostics id.
- Permanent structural authority rows lock the active Run in Game topology:
  closed public DTO owner, source-resolution owner, single manifest input,
  request-workspace write root, manifest generator target, copy-only deployment,
  diagnostics lookup owner, and attribution report owner.
- Packet-local temporary Grit patterns may block transition hazards until the
  permanent assertion lands; they must carry an explicit promotion/removal
  decision.

## Packet Order

```text
1. Public Run Status, Errors, And Diagnostics Envelope
2. Operation Registry Identity And Durable Operation Record
3. Explicit Cancellation And Terminalization
4. Catalog Source Identity And Index Contract
5. Launch Source Resolution
6. Swooper Map Artifact Render File Plan
7. Studio Run Workspace, Correlation, And Generation Manifest
8. Manifest-Only Swooper Run Generator
9. Catalog Generation Cutover To Source Index
10. Studio Runtime Generator Integration
11. Deployment Snapshot And Runtime Ownership Lease
12. Runtime Observation
13. Attribution Report
14. Diagnostics Retention, Copy Diagnostics, And Guard Closure
```

## Cross-Packet Enforcement Themes

- Public behavior tests cover only observable behavior: accepted/rejected API
  calls, redaction behavior, operation status transitions, cancellation,
  generation output, deployment, runtime observation, diagnostics lookup, and
  successful live launch.
- Permanent structural rules are positive rows in the structural authority
  matrix: public contracts are closed schemas with no open catch-all fields;
  request generation has one manifest input; catalog generation has one catalog
  source index; request generation writes only under the request workspace;
  deployment copies from generated mod to deployed mod; diagnostics and
  attribution are reachable only by explicit lookup.
- Temporary structural hazards are packet-local Grit patterns, not behavior
  tests. Each has a named lifecycle: candidate, registered advisory, registered
  enforced, or removed after the positive assertion supersedes it.

## Review State

This synthesis must be sent back to the advisors for adversarial review before
packet drafting begins.
