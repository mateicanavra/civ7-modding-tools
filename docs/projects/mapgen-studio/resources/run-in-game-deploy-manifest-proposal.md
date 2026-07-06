# Run In Game Runtime And Deployment Model Proposal

Status: proposal

Scope: MapGen Studio Run in Game runtime, request-scoped artifact generation,
deployment into Civilization VII, runtime observation, public status, and
developer diagnostics.

## Purpose

Run in Game should be structurally simple:

1. The Studio receives one launch request.
2. The request resolves to one launch source.
3. The source becomes one generation manifest.
4. The manifest produces one request-local generated mod.
5. The generated mod is copied once into the Civ7 Mods directory.
6. The deployed copy is recorded.
7. The Civ7 runtime is observed through bounded, correlated signals.
8. The UI receives a compact public status.
9. Developers receive a separate diagnostics record when something fails.

The current system reaches toward this shape, but it still routes Run in Game
through machinery built for catalog generation. That leaves too much ambient
state in the path: source-shaped config writes, directory scanning, inherited
environment variables, shared generated outputs, shared deployed mod state, and
public error details that expose implementation internals.

This proposal collapses that state space. It does not add more shims around the
old shape. It defines the target runtime model as if we were designing the same
capability from scratch, while using the existing regression history to explain
why each boundary matters.

## Design Stance

We are the sole producer and consumer of this system right now. The target
should not preserve legacy wire names, compatibility phases, fallback config
paths, or alternate generation modes for their own sake. If a name or boundary
exists only to make an old idea continue to look valid, remove it.

The system should have a small set of real anchors:

- operation ownership;
- source resolution;
- content digests;
- explicit generation inputs;
- generated artifacts;
- deployment records;
- runtime observations;
- attribution reports;
- public status;
- developer diagnostics.

Everything else should be either a field on those anchors or a local function
parameter. Transient combinations should not receive special names.

## Questions Answered Before Renaming

The terminology in this document is based on these system questions:

1. Which source is being launched: a durable catalog config or the current
   editor state?
2. Which authority defines durable catalog membership: a tracked source index
   or a directory scan?
3. Which generation mode is running: catalog generation or request-scoped Run
   in Game generation?
4. Which manifest, workspace, generated mod, and deployment belong to this
   request?
5. Which deployed copy did Civ7 load, and what file identities and marker scans
   were captured after deployment?
6. Which bounded runtime observations correlate the Civ7 run back to the launch
   request and source digests?
7. Which operation owns the Civ7 global resources, deployed mod id, scripting
   log window, and process control at a given moment?
8. Which facts are safe for public UI status, and which raw details belong only
   in developer diagnostics?
9. Which failures belong to source resolution, artifact generation, deployment,
   runtime control, observation, attribution, cleanup, or ownership loss?
10. What remains valid after workspace cleanup, daemon restart, or generated
    output deletion?

## Current System Diagnosis

The recent failures were not caused by one bad cache entry alone. The stale
ignored file was a symptom of a larger shape mismatch:

- Run in Game currently writes request state into a file location that looks
  like durable catalog source.
- The generator discovers request state by scanning config directories and
  reading inherited environment variables.
- Catalog output and request-local generated output share parts of the same
  mental model.
- The deploy step asks Nx to rebuild a project target that can consult shared
  ignored outputs.
- The runtime observation phase then tries to correlate Civ7 logs with the
  request after several earlier steps have passed through ambient state.
- The public failure payload can expose raw command output, full request
  envelopes, file paths, and diagnostic internals.

The correction is not "make the stale file less likely." The correction is:

- catalog generation must only read catalog sources;
- Run in Game generation must only read a request manifest;
- deployment must record the deployed copy after the copy happens;
- runtime observation must correlate only to the operation that owns the launch;
- public status must not expose developer diagnostics.

## Target Vocabulary

These are the proposed names for the system. A term is first-class only when it
has properties, relationships, and a durable place in the architecture.

| Term | Definition |
| --- | --- |
| `RunInGameOperation` | The lifecycle unit created by a launch request. It owns request id, phase, lease, status, diagnostics id, and cancellation. |
| `OperationRegistry` | The Studio runtime's in-memory registry for active operations, recent tombstones, events, and public status projection. |
| `RuntimeOwnershipLease` | Single-flight ownership over shared Civ7 resources: deployed mod id, Civ7 process control, setup workflow, and scripting log observation window. |
| `CatalogSourceIndex` | The tracked list of durable catalog map sources allowed into catalog generation. It replaces directory scanning as authority. |
| `CatalogMapSource` | One durable map config source in the catalog source index. |
| `EditorLaunchSource` | The current editor state packaged for one launch. It is not a catalog source and is not written into catalog source paths. |
| `ResolvedLaunchSource` | The sanitized launch source produced by resolving either a `CatalogMapSource` or an `EditorLaunchSource`. Validation is part of construction; the noun does not need an adjective. |
| `LaunchEnvelope` | The normalized map-generation envelope used for one launch, including selected recipe, world settings, setup config, and generator settings. |
| `LaunchSourceDigest` | Content digests derived from the resolved source, including config content digest and launch envelope digest. |
| `RunCorrelation` | The correlation fields embedded in generated runtime assets and expected in runtime observations. It includes the request id and source digests; if needed, it may also include the generation manifest digest. |
| `StudioRunWorkspace` | Request-local workspace under `.mapgen-studio/run-in-game/<requestId>/`. It holds the manifest, generated mod, deployment record, and diagnostics. |
| `StudioRunGenerationManifest` | The explicit request-scoped input to artifact generation. It is not an output receipt or operation ledger. |
| `StudioRunGeneratedMod` | The complete generated mod tree produced for one request in the `StudioRunWorkspace`. |
| `RunDeployment` | The copy operation from `StudioRunGeneratedMod` into the Civ7 Mods directory. |
| `DeployedModSnapshot` | The record captured after deployment: file identities, content digests, copied file counts, expected marker scans, and deployment target. |
| `ScriptingLogObservation` | A bounded observation from Civ7's scripting log window, correlated to `RunCorrelation`. |
| `SetupRowReadback` | The Civ7 setup catalog and row observation after deployment. |
| `RuntimeMapObservation` | Optional live runtime map summary observed after game start. |
| `RunAttributionReport` | The developer-facing report that links request, source digests, generated mod, deployed copy, setup readback, and runtime observations. |
| `PublicRunStatus` | The compact UI-safe projection of operation state. It contains status, phase, safe failure category, counts, and diagnostics id. |
| `RunDiagnosticsRecord` | Developer diagnostics with paths, commands, bounded stdout/stderr, marker scans, timelines, and raw observations. |

Terms intentionally not promoted:

- "lane": use generation or deployment boundary instead.
- generic "intent": use request, manifest, or plan where those are real.
- generic "identity": qualify it as correlation id, artifact identity, file
  digest, server instance, or manifest digest.
- generic "evidence": prefer deployment record, observation, attribution
  report, or diagnostics record.
- broad pre-deploy language: split it into source resolution, artifact generation,
  deployment, runtime observation, and attribution.

## Boundary Model

Run in Game should have five hard boundaries.

### 1. Source Resolution

Input:

- selected catalog id; or
- current editor state.

Output:

- `ResolvedLaunchSource`;
- `LaunchEnvelope`;
- `LaunchSourceDigest`;
- source summary safe for public status.

Rules:

- Durable catalog launches resolve through `CatalogSourceIndex`.
- Editor launches resolve through current editor state only.
- Neither path writes into catalog config directories.
- Neither path scans directories for implicit candidates.
- UI overrides are represented in the launch envelope, not by mutating durable
  catalog files.

### 2. Artifact Generation

Input:

- `StudioRunGenerationManifest`.

Output:

- `StudioRunGeneratedMod`;
- generated artifact index;
- generation diagnostics.

Rules:

- Request-scoped generation reads exactly one manifest path.
- Catalog generation reads exactly the `CatalogSourceIndex`.
- There is no environment-variable backchannel for selecting a request source.
- Generated output for Run in Game lives under `StudioRunWorkspace`.
- Shared `mod/`, `dist/`, or source-generated directories are not request
  state.

### 3. Deployment

Input:

- `StudioRunGeneratedMod`;
- `RuntimeOwnershipLease`.

Output:

- `RunDeployment`;
- `DeployedModSnapshot`.

Rules:

- Deployment copies the request-local generated mod into the Civ7 Mods
  directory.
- The deployed copy is recorded after copy, not inferred from the generation
  output.
- The deployed snapshot captures file identities and content digests required
  for later attribution.
- Deployment does not rebuild the catalog target as a side effect.

### 4. Runtime Observation

Input:

- `RunCorrelation`;
- `RuntimeOwnershipLease`;
- log offset or observation window established before launch.

Output:

- `ScriptingLogObservation`;
- `SetupRowReadback`;
- optional `RuntimeMapObservation`.

Rules:

- Observations are bounded to the operation's ownership window.
- The scripting log observation must match the request id and source digests.
- Setup readback must show the deployed map row that Civ7 will use.
- Runtime observations never modify source or generated artifacts.

### 5. Status And Diagnostics

Input:

- operation events;
- failure category;
- attribution report id;
- diagnostics id.

Output:

- `PublicRunStatus`;
- `RunDiagnosticsRecord`.

Rules:

- Public status is compact and safe.
- Developer diagnostics are available through a deliberate diagnostics endpoint
  or local record.
- Raw command output, absolute local paths, full launch envelopes, and marker
  scans do not appear in public UI payloads by default.

## Target Flow

### Catalog Build

Catalog build is for durable shipped sources.

1. Read `CatalogSourceIndex`.
2. Load each `CatalogMapSource`.
3. Generate catalog map scripts, recipes, and durable mod artifacts.
4. Publish catalog metadata.

Catalog build must not:

- read `StudioRunWorkspace`;
- include the current editor state;
- consult request ids;
- use runtime operation leases;
- deploy to Civ7 as part of generation.

### Run In Game

Run in Game is for one request-local launch.

1. Create `RunInGameOperation`.
2. Acquire `RuntimeOwnershipLease`.
3. Resolve `ResolvedLaunchSource`.
4. Compute `LaunchSourceDigest`.
5. Write `StudioRunGenerationManifest` into `StudioRunWorkspace`.
6. Generate `StudioRunGeneratedMod` from the manifest.
7. Deploy the generated mod.
8. Capture `DeployedModSnapshot`.
9. Prepare Civ7 setup.
10. Start or focus the game.
11. Read `SetupRowReadback`.
12. Observe scripting log within the operation window.
13. Optionally collect runtime map observation.
14. Assemble `RunAttributionReport`.
15. Publish `PublicRunStatus`.
16. Keep `RunDiagnosticsRecord` for developer inspection.
17. Release `RuntimeOwnershipLease`.

## Interface Sketches

The names below are target shapes, not a commitment to exact TypeScript syntax.

```ts
type RunInGameOperation = {
  requestId: string;
  phase:
    | "resolving-source"
    | "generating-artifacts"
    | "deploying"
    | "preparing-civ7"
    | "starting-game"
    | "observing-runtime"
    | "completed"
    | "failed"
    | "cancelled";
  leaseId: string;
  publicStatusId: string;
  diagnosticsId?: string;
};

type ResolvedLaunchSource =
  | {
      kind: "catalog";
      catalogSourceId: string;
      catalogSourcePath: string;
      launchEnvelope: LaunchEnvelope;
      sourceDigest: LaunchSourceDigest;
    }
  | {
      kind: "editor";
      editorSessionId: string;
      launchEnvelope: LaunchEnvelope;
      sourceDigest: LaunchSourceDigest;
    };

type LaunchSourceDigest = {
  configContentDigest: string;
  launchEnvelopeDigest: string;
};

type RunCorrelation = {
  requestId: string;
  configContentDigest: string;
  launchEnvelopeDigest: string;
  generationManifestDigest?: string;
};
```

```ts
type StudioRunGenerationManifest = {
  kind: "studio-run-generation-manifest";
  schemaVersion: 1;
  requestId: string;
  correlation: RunCorrelation;
  source: ResolvedLaunchSource;
  workspaceRoot: string;
  outputRoot: string;
  generatedModId: string;
};

type StudioRunGeneratedMod = {
  requestId: string;
  workspaceRoot: string;
  generatedModRoot: string;
  artifactIndexPath: string;
  correlation: RunCorrelation;
};

type DeployedModSnapshot = {
  requestId: string;
  deploymentId: string;
  civ7ModsRoot: string;
  deployedModRoot: string;
  fileCount: number;
  fileDigests: Array<{
    relativePath: string;
    sha256: string;
    sizeBytes: number;
  }>;
  markerScan: {
    requestIdPresent: boolean;
    configContentDigestPresent: boolean;
    launchEnvelopeDigestPresent: boolean;
  };
  capturedAt: string;
};
```

```ts
type ScriptingLogObservation = {
  requestId: string;
  observationWindow: {
    logPath: string;
    startOffset: number;
    startedAt: string;
  };
  matchedCorrelation: boolean;
  observedAt?: string;
  summary?: Record<string, unknown>;
  missingObservations: string[];
};

type RunAttributionReport = {
  requestId: string;
  correlation: RunCorrelation;
  sourceDigest: LaunchSourceDigest;
  generatedMod: StudioRunGeneratedMod;
  deployment: DeployedModSnapshot;
  setupRow?: SetupRowReadback;
  scriptingLog?: ScriptingLogObservation;
  runtimeMap?: RuntimeMapObservation;
  attributionStatus: "complete" | "incomplete";
  validationIssues: string[];
};

type PublicRunStatus = {
  requestId: string;
  phase: RunInGameOperation["phase"];
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  safeFailureCategory?: string;
  attributionStatus?: "complete" | "incomplete";
  validationIssueCount?: number;
  diagnosticsId?: string;
};
```

## Naming Families

Use families to make related concepts legible without collapsing them:

- `Run*`: operation lifecycle concepts (`RunInGameOperation`,
  `RunDeployment`, `RunAttributionReport`, `RunDiagnosticsRecord`).
- `Launch*`: selected source and normalized input (`LaunchEnvelope`,
  `LaunchSourceDigest`).
- `StudioRun*`: request-scoped workspace and generated artifacts
  (`StudioRunWorkspace`, `StudioRunGenerationManifest`,
  `StudioRunGeneratedMod`).
- `Catalog*`: durable shipped source catalog (`CatalogSourceIndex`,
  `CatalogMapSource`).
- `Runtime*`: shared Civ7 control and observation (`RuntimeOwnershipLease`,
  `RuntimeMapObservation`).
- `Public*`: UI-safe projections (`PublicRunStatus`).

Avoid adjective-led type families. Validation should be expressed through
constructor behavior, validation results, and diagnostics, not by turning an
adjective into the primary noun.

## Public Status Contract

The public contract should answer what the user can act on:

- Is the operation queued, running, completed, failed, or cancelled?
- Which phase is active?
- If it failed, which safe category failed?
- Is a diagnostics record available?
- Is the launched map attributable to the request?
- Are there missing observations, and how many?

It should not include:

- full command lines;
- raw stdout/stderr;
- full launch envelopes;
- absolute machine-local paths unless explicitly requested through diagnostics;
- raw marker payloads;
- internal stack traces;
- generated file contents.

Recommended phase names:

- `resolving-source`;
- `generating-artifacts`;
- `deploying`;
- `preparing-civ7`;
- `starting-game`;
- `observing-runtime`;
- `completed`;
- `failed`;
- `cancelled`.

Recommended safe failure categories:

- `source-resolution-failed`;
- `artifact-generation-failed`;
- `deployment-failed`;
- `civ7-readiness-failed`;
- `setup-readback-failed`;
- `runtime-observation-timeout`;
- `runtime-control-failed`;
- `operation-cancelled`;
- `operation-ownership-lost`;
- `internal-error`.

## Diagnostics Contract

`RunDiagnosticsRecord` is the place for detail. It should be accessible to
developers and agents, not sent wholesale to the public UI.

It may include:

- operation timeline;
- daemon instance id;
- lease acquisition and release events;
- generation manifest path;
- workspace paths;
- deployment target;
- bounded command output;
- Nx task ids;
- generated artifact index;
- deployed file digests;
- marker scan results;
- scripting log window and bounded excerpts;
- attribution report;
- cleanup result.

The record should be keyed by `diagnosticsId` and linked from
`PublicRunStatus`. Public status can say "diagnostics available" without
exposing the record.

## Implementation Direction

This is not a compatibility refactor. The implementation should converge on
the target concepts directly.

Recommended sequence:

1. Introduce `CatalogSourceIndex` and make catalog generation depend on it.
2. Introduce `StudioRunWorkspace` and `StudioRunGenerationManifest`.
3. Change Run in Game generation to read exactly one manifest path.
4. Generate `StudioRunGeneratedMod` under the request workspace.
5. Deploy from `StudioRunGeneratedMod`, not from shared generated output.
6. Capture `DeployedModSnapshot` after copy.
7. Rename runtime observation and attribution code to match this document.
8. Replace broad pre-deploy status with phase-specific operation events.
9. Replace public diagnostic payloads with `PublicRunStatus` plus
   `diagnosticsId`.
10. Delete old fallback paths, env-selected request generation, and source-path
    mutation once the new path is wired.

Do not keep:

- catalog directory scanning as an implicit authority;
- request state written into catalog config paths;
- generated output restored into source paths;
- environment variables as request source selectors;
- public payloads containing raw diagnostic internals;
- fallback generation modes that can silently choose the wrong source;
- compatibility aliases for old phase or field names unless an external
  consumer is identified and documented.

## Acceptance Checks

### Source Resolution

- A durable catalog launch resolves through `CatalogSourceIndex`.
- An editor launch resolves through editor state.
- Neither launch mutates catalog source files.
- A missing catalog id fails during `resolving-source`.
- UI overrides appear in `LaunchEnvelope`, not in durable catalog files.

### Artifact Generation

- Run in Game generation receives a `StudioRunGenerationManifest` path.
- The generator refuses to run without a manifest in request-scoped mode.
- The generator does not scan catalog config directories in request-scoped
  mode.
- The generated mod lives under `StudioRunWorkspace`.
- Two concurrent or sequential requests produce distinct workspaces and
  distinct generated mod roots.

### Deployment

- Deployment copies from `StudioRunGeneratedMod`.
- `DeployedModSnapshot` is captured after copy.
- The snapshot includes file digests and marker scan results.
- A deployment failure returns `deployment-failed` publicly and writes a
  diagnostics record privately.

### Runtime Observation

- The scripting log observation window starts before game launch.
- Observed runtime markers must match `RunCorrelation`.
- Timeout returns `runtime-observation-timeout`.
- Setup row readback is recorded separately from scripting log observation.
- Runtime map observation is optional and cannot block cleanup unless explicitly
  configured.

### Status And Diagnostics

- Public status never includes raw command output, full launch envelope, marker
  payloads, or absolute local paths by default.
- Public status includes `diagnosticsId` for developer follow-up.
- `RunDiagnosticsRecord` contains enough detail to reconstruct the failure
  path.
- Failed operations do not leave the operation registry permanently stuck in an
  active state.

### Cleanup And Ownership

- `RuntimeOwnershipLease` prevents overlapping Civ7 launch/deploy operations.
- Cancellation releases the lease.
- Ownership loss produces `operation-ownership-lost`.
- Workspace cleanup does not remove the diagnostics record needed to debug a
  failed launch.

## Review Findings Incorporated

A fresh review team examined the proposal from four angles: ontology design,
principal runtime engineering, operations terminology, and document integration.
The reviewers independently converged on the same changes:

- Split correlation, deployment records, runtime observations, attribution, and
  diagnostics into separate concepts.
- Do not use a single umbrella word for all validation and correlation work.
- Replace broad pre-deploy language with source resolution, artifact
  generation, deployment, runtime observation, and attribution.
- Prefer `ResolvedLaunchSource` over adjective-led names.
- Prefer `StudioRunGenerationManifest` over names that make the manifest sound
  like an output.
- Prefer `DeployedModSnapshot` or deployment record language over generic
  evidence language.
- Move raw details behind diagnostics and keep public status compact.
- Treat old wire names and fallback behavior as migration targets, not target
  architecture.

## Summary

The correct design is a narrow, explicit pipeline:

`RunInGameOperation -> ResolvedLaunchSource -> StudioRunGenerationManifest -> StudioRunGeneratedMod -> RunDeployment -> DeployedModSnapshot -> ScriptingLogObservation -> RunAttributionReport -> PublicRunStatus + RunDiagnosticsRecord`

That pipeline removes the ambiguous middle ground where Run in Game pretends to
be catalog generation, where source files carry transient launch state, and
where public payloads accidentally become developer diagnostics. The names
should make that shape obvious enough that an implementer can see when a new
field or fallback belongs outside the model.
