# Design - Contract TypeBox Spine

## Component Role

D2.5 is the public contract substrate for the runtime refactor. It owns the rule that Studio public wire DTOs are defined in `@civ7/studio-server` with TypeBox and exposed to oRPC through an owned Standard Schema adapter.

This packet is baseline-aware. Some TypeBox conversion already exists. The target is not "add TypeBox somewhere"; the target is a closed, testable spine where every public contract schema can prove its TypeBox origin and later runtime packets can add failure variants, operation projections, and event payloads without re-opening schema-tech decisions.

## Packet Acceptance Versus Implementation Closure

This OpenSpec packet is accepted when the workstream is implementation-ready: the mixed baseline is inventoried, target ownership is normative, proof gates are concrete, and review finds no unresolved P1/P2 ambiguity.

Acceptance does not assert that the current code already satisfies D2.5. The current baseline intentionally still has known residue: the Studio adapter lacks origin recovery, operation-current/event schemas duplicate looser DTOs, app code casts oRPC operation payloads into app-local DTOs, stale Zod comments remain, and expected error data is still permissive. Those are implementation obligations for the future D2.5 slice, not packet-authoring failures once they are explicitly specified.

## Target Contract Topology

The implementation target has these layers:

- `packages/studio-server/src/contract/**`: TypeBox schemas for success inputs, success outputs, stream events, and declared error data.
- `packages/studio-server/src/typeboxStandardSchema.ts`: the only Studio-owned TypeBox-to-Standard Schema adapter.
- `packages/studio-server/src/recipeDag/**`: aligned with the same TypeBox/Standard Schema behavior without owning `effect-orpc` builder imports.
- `@civ7/control-orpc`: retained TypeBox authority for control procedures, not copied into Studio.
- `apps/mapgen-studio/src/**`: consumes public types derived from `@civ7/studio-server` contract output/input types; UI helpers may format labels or presentation state but cannot define public wire DTOs.

`effect-orpc` import ownership is closed for D2.5: router/runtime implementation modules may import effect-orpc. General Studio contract DTO modules, recipe-DAG contract/error modules, services, app code, and operation DTO helpers must not import effect-orpc builders. Current recipe-DAG contract/error-builder imports are migration residue; D2.5 implementation must move/delete those builder imports or encapsulate them behind router/runtime ownership in the same slice. The stale `router/index.ts` "ONLY module" comment is repaired only when the import scan and ownership placement agree.

## Adapter Rules

- Raw TypeBox `TSchema` values MUST NOT be passed directly to `oc.input`, `oc.output`, `eventIterator`, or declared error `data`.
- The adapter MUST preserve recoverable TypeBox origin. Tests need a stable way to assert that a Standard Schema wrapper came from a specific TypeBox `TSchema`.
- The adapter MUST retain TypeBox `Value.Parse` behavior when that is the accepted parity behavior, including closed-object extra stripping where current contracts depend on it.
- Adapter validation issues MUST preserve useful paths for nested DTO failures.
- If the Studio adapter and control-oRPC adapter remain separate, D2.5 MUST document why their behavior is intentionally equivalent or where it intentionally differs. Unexplained adapter drift is a blocker.

## Public DTO Ownership

`@civ7/studio-server` owns these public schemas:

- `civ7.status`, `civ7.mapSummary`, `civ7.gameInfo`, `civ7.autoplay`, `civ7.setupConfig`, `civ7.savedConfigs`, `civ7.setupCatalog`.
- `civ7.live.status`, `civ7.live.snapshot`, `civ7.live.entities`, `civ7.live.gameInfo`.
- `runInGame.start`, `runInGame.status`.
- `mapConfigs.saveDeploy`, `mapConfigs.status`.
- `studio.serverInfo`, `studio.operations.current`, `studio.events.watch`.
- declared error `data` for all Studio-owned procedures.

App-local `features/runInGame/status.ts` and `features/mapConfigSave/status.ts` currently contain phase/status shapes that D2 classified as public phase/projection corpus. D2.5 either moves those public DTOs into `@civ7/studio-server` or reduces the app modules to UI-only presentation helpers derived from package public types.

Operation-current and operation-event payloads must compose the canonical Run in Game and Save&Deploy DTO schemas. They must not redefine broader copies with `Type.Unknown()` where the endpoint DTO is already more precise. If a field is intentionally opaque, that opacity belongs in the canonical operation DTO schema and is consumed by every public operation surface.

Expected error data is a D3 boundary. Permissive `details?: unknown` may remain only when D2.5 records it as D3-bound bridge residue with sanitization and no widening beyond current behavior. If D2.5 narrows it, the narrowed shape must be TypeBox-backed and covered by declared-error data tests.

The D3-bound bridge is not open-ended. If D2.5 keeps permissive `details?: unknown`, it must update the D3 `mapgen-studio-error-spine` packet in the same implementation stack to name the bridge deletion/narrowing target and add a guard test proving the bridge is gone or bounded by the sealed error union. A D2.5 implementation cannot close while D3 still preserves unknown engine details as a durable target.

Run in Game start has a special open-input hazard: the current public TypeBox schema preserves unknown top-level keys so the host parser can deep-scan and reject raw-control keys. D2.5 must make this explicit. Either the public input schema becomes closed, or adapter-origin tests must recover the TypeBox input schema and pair it with adversarial raw-control samples proving `command`, `script`, `javascript`, `rawCommand`, `rawJs`, `session`, `stateName`, and nested variants are rejected before engine execution. Literal-name residue searches alone are not sufficient.

## Parity Rules

The implementation must make explicit decisions for:

- closed object extra stripping versus rejection;
- optional property behavior;
- default/coercion behavior previously supplied by Zod, if any;
- permissive open data for expected engine failures;
- non-uniform oRPC error code/status pins;
- stream event schema behavior for `hello | operation | live-game`;
- operation status phase exhaustiveness for Run in Game and Save&Deploy.

Any intentional behavior change must be named in the D2.5 implementation packet evidence and paired with tests. Silent differences from the accepted runtime surface block acceptance.

## Packet Blockers

D2.5 is not accepted while any of the following remain:

- the packet fails to name a known mixed-baseline residue item, owner, target, and proof gate;
- a proof gate reads as optional, vague, or dependent on chat context;
- a required implementation closeout has no test/search oracle;
- the packet leaves an unresolved P1/P2 review finding.

## Future Implementation Closeout Rules

The D2.5 implementation slice cannot close while any of the following remain:

- `zod` imports or `z.infer` in `packages/studio-server/src/contract/**`;
- package docs/comments claiming Studio success I/O remains Zod;
- app/server docs/comments claiming TypeBox-owned contract data is Zod-derived;
- package contract comments claiming Run in Game or Save&Deploy DTO schemas reproduce, mirror, or derive authority from app-local status modules;
- public DTOs in app-local Run in Game or Save&Deploy modules that are broader or different from the package contract;
- operation-current or operation-event schemas that duplicate broader operation DTOs instead of composing canonical schemas;
- expected-error data that stays permissive without a D3 bridge deletion/narrowing guard and sanitization proof;
- open public mutation inputs that are not either closed schemas or paired with recovered-schema raw-control rejection tests;
- `effect-orpc` imports outside router/runtime implementation ownership;
- direct client calls or route handlers for legacy `/api` Run in Game / Save&Deploy operations;
- public generic raw operation input/tunnel fields that bypass semantic operation leaves. Status/proof fields such as `processRestart.command` are not raw operation inputs, but they must remain TypeBox-modeled and classified so they do not become an accidental executable channel.

## Testing Strategy

D2.5 testing is contract-first:

- TypeBox `Value.Check` / `Value.Parse` sample matrices for every Studio public contract family.
- Standard Schema adapter tests proving origin recoverability, path reporting, parse behavior, and issue behavior.
- oRPC handler/client tests proving declared error data remains defined and status-code pins survive.
- Type-level tests or compile checks proving frontend request/status usage is derived from `@civ7/studio-server` contract types.
- Negative-search tests for Zod residue, stale package commentary, app-local public DTO authority, direct `/api` operation paths, and raw operation input/tunnel field names, with an explicit classification ledger for allowed historical comments or status/proof-field hits.
- Open-mutation-input tests that prove raw control/tunnel fields are rejected even when accepted by an open TypeBox shape for downstream deep validation.

Later D3-D12 packets may add new schemas to the spine, but they do not re-open whether the spine is TypeBox-owned.
