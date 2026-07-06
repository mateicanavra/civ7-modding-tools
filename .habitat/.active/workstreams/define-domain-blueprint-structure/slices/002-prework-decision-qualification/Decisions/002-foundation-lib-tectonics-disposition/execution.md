# Foundation Lib Tectonics Execution Workstream

Status: Slice 1 closed; remaining execution planned/open

Parent packet: `Foundation Lib / Tectonics Disposition Decision Packet`

## Execution Frame

This record carries source execution for the closed Foundation Lib / Tectonics
Disposition packet. The disposition table is the oracle. Current source paths
are implementation evidence only.

Execution principle:

```text
closed row disposition -> tests first -> exact owner construction -> caller migration -> old-owner deletion -> row proof -> fresh review
```

In scope:

- remaining artifact-contract split for `foundation/lib/require.ts`,
  `foundation/lib/tectonics/internal-contract.ts`, and
  `foundation/lib/tectonics/schemas.ts`;
- remaining core mechanics extraction for the live helpers still in
  `foundation/lib/tectonics/shared.ts`;
- migration of foundation callers to the accepted artifact and core owners;
- deletion of residual `foundation/lib/**` only after import and behavior proof.

Out of scope:

- new domain topology law, `structure.toml`, Grit packet authoring, or source
  shape enforcement beyond consuming already accepted artifact scope/pattern
  authority;
- generated output edits;
- new recipe-stage topology;
- broad cleanup of non-foundation duplicate helpers or non-domain artifact
  folders;
- changing artifact ids or behavior for product reasons not required by the
  closed disposition rows.

Each remaining slice is a fresh execution context. The executor starts from the
inputs and row ledger in this document, makes only the implementation-time
decisions allowed here, lays down tests or names existing characterization tests
before source movement, implements, gets fresh-agent review, repairs accepted
findings, then gates into the next slice.

## Authority Inputs

Required reads for every remaining slice:

- `README.md`
- `synthesis/disposition-table.md`
- `require-guards.domino.md`
- `tectonics-shared-core.domino.md`
- `reviews/review-findings.md`
- `../../../../scopes/domain/scopes/artifacts/scope.md`
- `../../../../scopes/domain/scopes/artifacts/files/artifact-ts.md`
- `../../../../scopes/domain/scopes/artifacts/patterns/artifact-shape.md`
- `.agents/skills/civ7-architecture-authority/references/source-map.md`
- `.agents/skills/civ7-architecture-authority/references/ownership-boundaries.md`
- `mods/mod-swooper-maps/AGENTS.md`
- `packages/mapgen-core/src/AGENTS.md` for core slices

Decision rules:

- The active artifact destination is
  `mods/mod-swooper-maps/src/domain/foundation/artifacts/<artifact>.artifact.ts`.
- Artifact files export stable names: `Schema`, `artifact`, `validate`, and
  optional `assert`. Validation/assertion functions do not encode the domain or
  artifact name in the export.
- `assert` exists only when publish-time `validate` cannot know an external
  compatibility context and an operation still needs fail-fast boundary
  narrowing.
- `foundation/lib` is not an owner and must not survive as a compatibility
  bucket.
- `packages/mapgen-core` APIs must remain vocabulary-free: no `foundation`,
  `tectonics`, `drift`, artifact `{ u, v }`, or reset-policy language.
- Current recipe/stage artifact definitions are source evidence. They do not
  override the domain artifact destination, but they must be reconciled during
  artifact construction.
- `artifact:foundation.crustInit` is current source naming evidence for a
  recipe-stage handoff. The closed destination remains `crust.artifact.ts`;
  if execution proves a second distinct artifact contract is required, stop and
  reopen the row instead of silently adding `crust-init.artifact.ts`.

## Global Preflight

Run before any remaining implementation slice:

```bash
git status --short --branch
gt log --no-interactive | head -60
find mods/mod-swooper-maps/src/domain/foundation/lib -maxdepth 4 -type f | sort
bun habitat classify mods/mod-swooper-maps/src/domain/foundation
bun habitat classify packages/mapgen-core/src/lib
bun --silent nx show project mod-swooper-maps --json
bun --silent nx show project mapgen-core --json
```

Use Narsil MCP as the first graph pass for touched symbols/importers when
caller impact is non-obvious. Use local Git (`git blame`, `git log --follow`)
when historical ownership or stale source status materially affects a row.

If `nx run mod-swooper-maps:test` is red before a slice begins, record the
pre-slice failure and prove post-slice equivalence before accepting conditional
test proof. KNIP may be used as supporting evidence for deletion rows, no fix
mode, but broad unrelated output does not fail the slice by itself.

## Remaining Row Ledger

| Row | Destination/action | Executor must decide | Tests first | Required proof labels | Blocking falsifier | Closure scan |
| --- | --- | --- | --- | --- | --- | --- |
| `requireMesh` | `foundation/artifacts/mesh.artifact.ts` validation and optional contextual assertion. | Whether any direct op boundary still needs `assert` after publish validation. | Artifact valid/invalid mesh shape; optional contextual assertion if kept. | Unit behavior; import proof; mod check/test. | Mesh validity depends on operation normalization or recipe-only state. | `requireMesh`, `foundation/lib/require` |
| `requireCrust` | `foundation/artifacts/crust.artifact.ts`. | Whether `crustInit` is an alias of the crust artifact or a distinct contract that reopens the row. | Crust payload arrays and expected cell-count compatibility. | Unit behavior; recipe artifact reconciliation; import proof. | `crustInit` proves a distinct artifact with different payload law. | `requireCrust`, `crustInit` decision note |
| `requireMantlePotential` | `foundation/artifacts/mantle-potential.artifact.ts`. | Whether source-count checks are fully publish-time. | Source arrays and cell-count validation. | Unit behavior; import proof. | Source count requires unavailable operation context. | `requireMantlePotential` |
| `requireMantleForcing` | `foundation/artifacts/mantle-forcing.artifact.ts`. | Whether mesh cell count remains contextual. | Forcing arrays, stress, vector, class lengths. | Unit behavior; import proof. | Forcing shape requires operation-local normalization. | `requireMantleForcing` |
| `requirePlateGraph` | `foundation/artifacts/plate-graph.artifact.ts`. | Whether plate metadata from recipe artifact source must be included in validation. | Cell-to-plate array, plate list/metadata cases. | Unit behavior; recipe artifact reconciliation; import proof. | Current recipe shape contradicts packet destination enough to reopen. | `requirePlateGraph` |
| `requirePlateMotion` | `foundation/artifacts/plate-motion.artifact.ts`. | Whether `assert` is justified for mesh cell count plus accepted plate count. | Plate and cell array lengths; optional contextual assertion if kept. | Unit behavior; import proof; affected operation tests. | Plate count cannot be supplied without creating a new shared owner. | `requirePlateMotion` |
| `requireTectonics` | `foundation/artifacts/current-tectonics.artifact.ts`. | Whether all old guard fields are part of publish validation. | Current tectonics valid/invalid arrays. | Unit behavior; import proof. | Payload is not the same artifact as current recipe `tectonics`. | `requireTectonics` |
| `requireTectonicHistory` | `foundation/artifacts/tectonic-history.artifact.ts`. | Whether `plateIdByEra` and era-field arrays are fully covered in the artifact contract. | Era count, era arrays, totals, plate-id-by-era cases. | Unit behavior; import proof. | History payload splits into multiple runtime truth products. | `requireTectonicHistory` |
| `requireTectonicProvenance` | `foundation/artifacts/tectonic-provenance.artifact.ts`. | Whether optional operation input still needs truthy-branch `assert`. | Era count, tracer index, provenance scalar arrays. | Unit behavior; import proof. | Optional input semantics require new operation contract law. | `requireTectonicProvenance` |
| `internal-contract.ts` event schemas | `foundation/artifacts/tectonic-events.artifact.ts`. | Exact artifact id spelling and whether existing segment/hotspot event publishers share this one fixed contract. | Event record and list validation. | Unit behavior; op contract import proof. | Source evidence contradicts the closed artifact destination and forces row reopening before implementation. | `lib/tectonics/internal-contract`, `TectonicEvent` |
| `internal-contract.ts` era-field schemas | `foundation/artifacts/tectonic-era-fields.artifact.ts`. | Exact field coverage and import reconciliation inside the fixed artifact destination. | Era-field array constructors and field coverage. | Unit behavior; op contract import proof. | Source evidence contradicts the closed artifact destination and forces row reopening before implementation. | `FoundationTectonicEraFieldsInternal` |
| `PlateIdByEraSchema` | `foundation/artifacts/plate-id-by-era.artifact.ts`. | Exact artifact id spelling and import reconciliation inside the fixed artifact destination. | Per-era `Int16Array` list validation. | Unit behavior; import proof. | Source evidence contradicts the closed artifact destination and forces row reopening before implementation. | `PlateIdByEraSchema` |
| `TracerIndexByEraSchema` | `foundation/artifacts/tracer-index-by-era.artifact.ts`. | Exact artifact id spelling and import reconciliation inside the fixed artifact destination. | Per-era `Uint32Array` list validation. | Unit behavior; import proof. | Source evidence contradicts the closed artifact destination and forces row reopening before implementation. | `TracerIndexByEraSchema` |
| `NeighborhoodMesh` | `CsrPointMesh2D` in `packages/mapgen-core/src/lib/mesh/neighborhood-mesh.ts`. | Type name only if existing core convention requires a narrower name. | Assignability test from current mesh shape. | Core unit/type behavior; mod check. | Type requires foundation-specific fields. | `NeighborhoodMesh`, `tectonics/shared` |
| `clampByte` | `quantizeU8(value)` in `packages/mapgen-core/src/lib/math/quantize.ts`. | None beyond preserving exact non-finite/rounding semantics. | NaN, infinities, rounding, saturation. | Core unit behavior; mod behavior. | Existing `clampU8` is exact after all, invalidating new API need. | `clampByte` |
| `clampInt8` | `quantizeI8Symmetric(value)` in `packages/mapgen-core/src/lib/math/quantize.ts`. | None beyond exact `[-127, 127]` semantics. | NaN, infinities, rounding, saturation. | Core unit behavior; mod behavior. | Existing `clampInt`/other core API is exact. | `clampInt8` |
| `normalizeToInt8` | `quantizeUnitVec2I8(vec, epsilon = 1e-9)` in `packages/mapgen-core/src/lib/grid/vector-field.ts`, returning `x/y`. | Caller-side adaptation from `x/y` to artifact `u/v`. | Zero/tiny/non-finite/cardinal/diagonal/bounds. | Core unit behavior; affected op tests. | The helper must return artifact-specific `u/v` in core. | `normalizeToInt8` |
| `computeMeanEdgeLen` | `meanMeshEdgeLength(mesh, maxEdges = 100_000)` in core mesh. | Preserve duplicate avoidance, fallback, cap, wrap semantics. | Empty fallback, duplicate avoidance, invalid/zero skip, periodic wrap, cap. | Core unit behavior; mod check. | Mesh shape or wrap semantics are foundation-specific. | `computeMeanEdgeLen` |
| `findNearestCell` | `findNearestMeshCell(mesh, x, y)` in core mesh. | Preserve strict first tie and periodic distance. | Empty, periodic distance, tie cases. | Core unit behavior; mod check. | Query semantics depend on foundation-specific coordinate law. | `findNearestCell` |
| `chooseDriftNeighbor` | `selectMeshNeighborByVectorProjection(params)` in core mesh; callers pass dequantized vector components. | Preserve signed-byte coercion either in caller or exact core parameter contract. | No-neighbor, zero-vector, periodic displacement, first tie, projection. | Core unit behavior; affected op tests. | Selection semantics require tectonics/drift vocabulary in core. | `chooseDriftNeighbor` |

## Slice 1: Mechanical Cleanup

Status: closed

### Objective

Execute only the mechanical subset of the closed disposition table: dead/stale
deletion, foundation-internal policy/rules moves, and replacement of the local
`shared.ts` `clamp01` wrapper with existing core
`clampFinite(value, 0, 1, 0)` semantics.

Do not reopen this slice unless later regression evidence names one of its
executed rows.

### Executed Rows

| Row class | Execution |
| --- | --- |
| Crust buoyancy policy | Moved `foundation/lib/crust/buoyancy.ts` to `foundation/model/policy/crust-buoyancy.ts`; updated live operation imports. |
| Reference-area policy | Moved `foundation/lib/normalize.ts` to `foundation/model/policy/reference-area.ts`; updated live operation, test, and canonical doc anchors. |
| Tectonic event types | Split `EVENT_TYPE` to `foundation/model/policy/tectonic-event-types.ts`; updated live operation-rule imports. |
| Reset threshold policy | Split reset threshold constants and `deriveResetThreshold` to `foundation/ops/compute-tectonic-provenance/rules/reset-threshold-policy.ts`; updated provenance rules. |
| Tracer advection constant | Split `ADVECTION_STEPS_PER_ERA` to `foundation/ops/compute-tracer-advection/rules/constants.ts`; updated tracer-advection rules. |
| Existing core replacement | Removed the local `foundation/lib/tectonics/shared.ts` `clamp01` export; updated the live hotspot-events importer to use `clampFinite(value, 0, 1, 0)` from `@swooper/mapgen-core/lib/math`. |
| Dead duplicate files | Deleted `foundation/lib/tectonics/index.ts`, `events.ts`, `fields.ts`, `membership.ts`, `provenance.ts`, `rollups.ts`, and `tracing.ts`. |
| Stale constants | Deleted stale `ERA_COUNT_MIN`, `ERA_COUNT_MAX`, `OROGENY_ERA_GAIN_MIN`, and `OROGENY_ERA_GAIN_MAX` with the old `foundation/lib/tectonics/constants.ts` owner. Live era-count ownership remains `compute-era-plate-membership/rules/constants.ts`. |

### Proof

- Narsil repo id `civ7-modding-tools#2fa31857` was available.
- Narsil `find_references` confirmed live consumers for
  `deriveFoundationReferenceArea`, `deriveBuoyancy`, `EVENT_TYPE`,
  `ADVECTION_STEPS_PER_ERA`, `deriveResetThreshold`, and the local `clamp01`
  wrapper.
- `bunx --bun knip --no-exit-code --reporter compact` reported the dead
  duplicate tectonics files as unused, with broad unrelated repo output treated
  as supporting evidence only.
- `nx run mod-swooper-maps:check` passed.
- Focused Bun foundation tests passed:
  `bun test test/foundation/reference-area-policy.test.ts test/foundation/m11-tectonic-events.test.ts test/foundation/m11-tectonic-segments-history.test.ts test/foundation/mesh-first-ops.test.ts test/foundation/m11-plate-graph-resistance.test.ts`.
- Focused old-path scans found no source/test hits for deleted or moved Slice
  1 paths.
- `bun habitat classify .habitat/.active` passed.
- `git diff --check -- .habitat/.active mods/mod-swooper-maps/src mods/mod-swooper-maps/test`
  passed.

Verification limitation:

- `nx run mod-swooper-maps:test` failed inside `mod-swooper-maps:habitat:check`.
- A clean detached worktree at pre-slice `HEAD` (`b5507a183e`) failed the same
  Habitat/Grit owner checks, proving the full target failure was an existing
  stack gate state, not a Slice 1 regression.

### Review

Fresh-agent review found no remaining open P1/P2 findings after repair. No
Slice 2 work appears in Slice 1. `require.ts`, `internal-contract.ts`,
`schemas.ts`, and deferred `shared.ts` helpers remain for the artifact-contract
and core-extraction slices.

## Slice 2: Artifact Contract Construction

Status: planned/open

### Objective

Create the direct domain artifact contract owner files and tests before
touching operation callers. This slice constructs the artifact owners; it does
not delete `require.ts`, `internal-contract.ts`, or `schemas.ts`.

### Write Set

Create/edit:

- `mods/mod-swooper-maps/src/domain/foundation/artifacts/*.artifact.ts`
- focused artifact tests under `mods/mod-swooper-maps/test/foundation/**`
- recipe/stage artifact definitions only as needed to import or re-export the
  new domain artifact contracts without changing ids

Protected:

- operation implementation bodies, except import-only changes required by test
  compilation;
- `foundation/lib/require.ts`;
- `foundation/lib/tectonics/internal-contract.ts`;
- `foundation/lib/tectonics/schemas.ts`;
- `packages/mapgen-core/**`.

### Stage Gate

Before implementation, the executor writes an artifact corpus table in this
record or an adjacent packet note with one row per artifact file:

```text
artifact file -> current source schemas/guards -> artifact id evidence -> validate coverage -> assert candidate -> tests
```

Pass:

- every artifact destination in the row ledger is present in the corpus;
- current recipe/stage artifact definitions are reconciled as evidence;
- `crustInit` is explicitly classified as alias/current recipe evidence for
  `crust.artifact.ts` or the slice stops to reopen the row.

Fail:

- a destination is added only because current source happens to have that name;
- the corpus hides multiple artifact contracts inside one file;
- the executor cannot name the artifact id source for a planned file.

### Tests First

Add tests before implementation, or name existing tests that already prove the
same behavior. Tests must specify:

- each artifact file exports `Schema`, `artifact`, `validate`, and only a
  justified optional `assert`;
- each artifact file contains exactly one artifact definition;
- `validate` returns a readonly issue list, does not throw for invalid payloads,
  and does not mutate, normalize, repair, fill, or coerce payloads;
- valid payloads return no issues;
- invalid constructors, array lengths, era counts, source counts, and plate
  counts return issues;
- semantic validation/assertion export names do not exist.

Pass:

- tests fail on the pre-change tree for missing owner files or missing behavior,
  not because they encode an impossible or instance-specific pattern;
- every artifact file has at least one positive and one negative case.

Fail:

- tests bake one artifact's concrete payload into reusable pattern authority;
- tests require an `assert` before the implementation-time assert matrix
  justifies it.

### Acceptance Criteria

Pass:

- every artifact destination in the row ledger is constructed directly under
  `foundation/artifacts/`, obeys the artifact file pattern, and has a row status
  recording destination, tests, validation coverage, and proof label;
- artifact-internal validation semantics from old schemas and guards are owned
  by `validate`;
- no operation logic, registries, examples, normalization, or repair behavior
  enters artifact files;
- recipe/stage artifact definitions either import/re-export the direct domain
  artifacts or are recorded as still-migrating current evidence for Slice 3;
- `foundation/lib/**` remains present for caller migration in Slice 3.

Fail:

- validation is copied into operation-local guard files;
- `foundation/artifacts/contract/` is introduced;
- semantic exports like `validateFoundationPlateMotionArtifact` or
  `assertFoundationPlateMotionArtifact` are added;
- old guard predicates are preserved without a row-level assert decision.
- any artifact row is left for Slice 3 without a constructed destination and
  test/proof status.

### Verification

```bash
! rg -n "export function (validate|assert)[A-Z]|validateFoundation|assertFoundation" mods/mod-swooper-maps/src/domain/foundation/artifacts -g '*.ts'
rg -n "defineArtifact\\(" mods/mod-swooper-maps/src/domain/foundation/artifacts -g '*.artifact.ts'
bun test mods/mod-swooper-maps/test/foundation
nx run mod-swooper-maps:check
git diff --check -- mods/mod-swooper-maps/src mods/mod-swooper-maps/test .habitat/.active
```

## Slice 3: Artifact Caller Migration And Legacy Deletion

Status: planned/open

### Objective

Move callers from `foundation/lib/require.ts`,
`foundation/lib/tectonics/internal-contract.ts`, and
`foundation/lib/tectonics/schemas.ts` to the direct artifact contracts, decide
and burn down every old guard call, then delete the obsolete files only after
import proof.

### Write Set

Edit:

- foundation operation contracts, rules, strategies, and tests importing old
  artifact schemas/types or old `require*` guards;
- recipe/stage artifact definitions and step contracts that still own artifact
  definitions after Slice 2;
- `execution.md` proof sections for assert decisions and legacy deletion proof.

Delete only after proof:

- `mods/mod-swooper-maps/src/domain/foundation/lib/require.ts`
- `mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/internal-contract.ts`
- `mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/schemas.ts`

Protected:

- `packages/mapgen-core/**`;
- new core API work;
- generated output.

### Stage Gate

Before operation import edits, the executor writes an assert matrix:

```text
guard -> direct callers/wrappers -> publish validation covers? -> external context needed? -> assert kept/deleted -> test
```

Keep `assert` only when all are true:

- the check requires context unavailable at publish time;
- the context is external compatibility, not artifact-internal validity;
- the operation has a real direct-input boundary that still needs fail-fast
  narrowing;
- a focused test proves the contextual failure path;
- the export remains generic `assert`.

Delete old guard calls when:

- `validate` can determine publishability from the value itself;
- the operation receives the value through a recipe/pipeline path that already
  validates publication;
- the old call only duplicated constructor, existence, or length checks now
  owned by the artifact;
- keeping the call would recreate a shared validation bucket, pass-through
  wrapper, or copied operation-local reusable guard.

Pass:

- each old `require*` export is either deleted because publish validation owns
  it or replaced by a namespace-imported artifact `assert` with a recorded row
  reason;
- pass-through wrappers disappear;
- no operation-local copied reusable validation remains.

Fail:

- an `assert` is kept because it is easy, not because context requires it;
- callers import semantic assertion names;
- a wrapper file becomes a new `foundation/lib` under another name.

### Tests First

Before import edits or guard deletion, each guard row must either name existing
characterization coverage or add focused tests for the behavior that remains
observable after migration:

- publish-time validation paths for artifact-internal failures;
- contextual assertion failure paths for any kept `assert`;
- operation behavior for optional inputs such as tectonic provenance;
- recipe/stage artifact publication where that is the validation boundary.

Pass:

- every guard row in the assert matrix has a test label before source movement;
- tests fail on the pre-change tree only for missing migrated owner behavior, or
  existing tests are named as sufficient characterization evidence.

Fail:

- import edits begin while any guard row has no test or named coverage;
- old guard behavior is deleted based only on typecheck/import proof.

### Acceptance Criteria

Pass:

- no source/test imports reference the old `require`, `internal-contract`, or
  `schemas` paths;
- operation contracts import schemas/types from domain artifact files;
- operation bodies no longer call old `require*` functions;
- `require.ts`, `internal-contract.ts`, and `schemas.ts` are deleted;
- affected operation and artifact tests pass.

Fail:

- any live source import remains from old paths;
- deletion depends only on manual confidence, not import/type/test proof;
- old type names survive only because callers were not migrated.

### Verification

```bash
! rg -n "foundation/lib/require|\\.\\./\\.\\./lib/require|requireMesh|requireCrust|requireMantlePotential|requireMantleForcing|requirePlateGraph|requirePlateMotion|requireTectonics|requireTectonicHistory|requireTectonicProvenance" mods/mod-swooper-maps/src mods/mod-swooper-maps/test -g '*.ts'
! rg -n "lib/tectonics/internal-contract|lib/tectonics/schemas" mods/mod-swooper-maps/src mods/mod-swooper-maps/test -g '*.ts'
test ! -e mods/mod-swooper-maps/src/domain/foundation/lib/require.ts
test ! -e mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/internal-contract.ts
test ! -e mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/schemas.ts
bun test mods/mod-swooper-maps/test/foundation
nx run mod-swooper-maps:check
nx run mod-swooper-maps:test
git diff --check -- mods/mod-swooper-maps/src mods/mod-swooper-maps/test .habitat/.active
```

If `nx run mod-swooper-maps:test` fails on the same pre-existing Habitat owner
gate, record the baseline comparison and run the focused foundation tests plus
`nx run mod-swooper-maps:check` as non-regression proof.

## Slice 4: Core API Construction

Status: planned/open

### Objective

Add accepted vocabulary-free core APIs to existing `@swooper/mapgen-core`
subpaths and pin their exact semantics with tests before foundation caller
migration.

### Write Set

Create/edit:

- `packages/mapgen-core/src/lib/math/quantize.ts`
- `packages/mapgen-core/src/lib/math/index.ts`
- `packages/mapgen-core/src/lib/grid/vector-field.ts`
- `packages/mapgen-core/src/lib/grid/index.ts`
- `packages/mapgen-core/src/lib/mesh/neighborhood-mesh.ts`
- `packages/mapgen-core/src/lib/mesh/index.ts`
- `packages/mapgen-core/test/lib/**`

Protected:

- foundation callers;
- artifact contract files;
- new package subpaths not accepted by the disposition table;
- generated output.

### Tests First

Add core tests before implementation:

- `quantizeU8`: `NaN -> 0`, `-Infinity -> 0`, `+Infinity -> 255`, rounding,
  lower/upper saturation;
- `quantizeI8Symmetric`: `NaN -> 0`, infinities saturate to `-127/127`,
  rounding, `[-127, 127]`;
- `quantizeUnitVec2I8`: zero, tiny, non-finite, cardinal, diagonal, and bounds,
  returning core `x/y`;
- `CsrPointMesh2D` assignability from current mesh shape;
- `meanMeshEdgeLength`: empty fallback, duplicate avoidance, invalid/zero skip,
  periodic wrap, max cap;
- `findNearestMeshCell`: empty `-1`, periodic distance, strict first tie;
- `selectMeshNeighborByVectorProjection`: no-neighbor, zero-vector, periodic
  displacement, first tie, projection behavior.

Pass:

- tests fail on the pre-change tree only because accepted APIs are missing or
  unimplemented;
- tests match legacy semantics and the closed domino evidence.

Fail:

- tests encode improved behavior rather than accepted compatibility;
- tests mention foundation, tectonics, drift, or artifact `u/v` names.

### Acceptance Criteria

Pass:

- new APIs are exported through existing `lib/math`, `lib/grid`, and `lib/mesh`
  surfaces;
- no core implementation imports mod, foundation, Civ7 runtime, or generated
  output;
- existing helpers such as `clampU8`, `clampInt`, and hex-grid direction
  helpers are reused only where exact semantics still hold;
- `nx run mapgen-core:test`, `nx run mapgen-core:check`, and
  `nx run mapgen-core:habitat:check` pass, or any pre-slice Habitat failure is
  baseline-proved unchanged before accepting conditional proof.

Fail:

- a broad `shared`, `utils`, or compatibility wrapper is introduced;
- semantic drift is hidden by adapting tests to implementation;
- core returns artifact-specific `{ u, v }`.

### Verification

```bash
nx run mapgen-core:test
nx run mapgen-core:check
nx run mapgen-core:habitat:check
! rg -n "foundation|tectonics|drift" packages/mapgen-core/src/lib/math packages/mapgen-core/src/lib/grid packages/mapgen-core/src/lib/mesh -g '*.ts'
rg -n "\\{[^}\\n]*(u|v):|\\b(u|v):" packages/mapgen-core/src/lib/math packages/mapgen-core/src/lib/grid packages/mapgen-core/src/lib/mesh -g '*.ts' || true
git diff --check -- packages/mapgen-core/src packages/mapgen-core/test .habitat/.active
```

The `foundation|tectonics|drift` scan is a hard failure. The `u/v` scan is an
artifact-shape review signal: output must be dispositioned by the
architecture/proof reviewer before Slice 4 closes.

## Slice 5: Core Caller Migration And `shared.ts` Deletion

Status: planned/open

### Objective

Migrate foundation callers from `foundation/lib/tectonics/shared.ts` to the new
core APIs, remove duplicated local helper surfaces that the core APIs supersede,
and delete `shared.ts` only after all imports are gone.

### Write Set

Edit:

- foundation operations and tests importing `foundation/lib/tectonics/shared.js`;
- operation-local duplicated `computeMeanEdgeLen` and `findNearestCell`
  implementations when they are replaced by accepted core APIs;
- `execution.md` proof rows.

Delete only after proof:

- `mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/shared.ts`

Protected:

- artifact contract migration rows if not already closed;
- non-foundation duplicate helpers;
- product behavior or generated output.

### Stage Gate

Before caller migration, record current importers and map every import to the
accepted core API:

```text
old helper -> caller -> replacement API -> adapter needed? -> focused test -> closure scan
```

Decision criteria:

- `normalizeToInt8` callers adapt core `{ x, y }` to artifact `{ u, v }` at the
  artifact boundary only.
- `chooseDriftNeighbor` callers preserve signed-byte coercion either before
  calling core or through an exact core parameter contract.
- no core API gains foundation vocabulary to make caller migration easier.
- deletion waits until no old helper import remains.

### Tests First

Before caller migration, each helper row must either name existing
characterization coverage or add focused tests for the behavior being preserved:

- quantization non-finite and rounding behavior at affected callers;
- vector adaptation from core `x/y` to artifact `u/v`;
- signed-byte coercion before mesh-neighbor selection;
- periodic wrap, tie-break, fallback, and max-edge behavior for mesh helpers.

Pass:

- every helper row in the migration map has a test label before source
  movement;
- tests fail on the pre-change tree only for missing migrated owner behavior, or
  existing tests are named as sufficient characterization evidence.

Fail:

- import edits begin while any helper row has no test or named coverage;
- `shared.ts` deletion relies only on import scans.

### Acceptance Criteria

Pass:

- no source/test imports from `foundation/lib/tectonics/shared`;
- no live references remain to `NeighborhoodMesh`, `clampByte`, `clampInt8`,
  `normalizeToInt8`, `computeMeanEdgeLen`, `findNearestCell`, or
  `chooseDriftNeighbor` from the old file;
- `shared.ts` is deleted;
- affected foundation behavior tests and mod check pass;
- core tests from Slice 4 still pass.

Fail:

- caller adapters silently change non-finite, tie-break, wrap, or signed-byte
  semantics;
- `shared.ts` remains as a partial bucket;
- migration broadens into unrelated helper cleanup.

### Verification

```bash
! rg -n "from .*tectonics/shared|NeighborhoodMesh|clampByte|clampInt8|normalizeToInt8|computeMeanEdgeLen|findNearestCell|chooseDriftNeighbor" mods/mod-swooper-maps/src mods/mod-swooper-maps/test packages/mapgen-core/src packages/mapgen-core/test -g '*.ts'
test ! -e mods/mod-swooper-maps/src/domain/foundation/lib/tectonics/shared.ts
nx run mapgen-core:test
nx run mapgen-core:check
nx run mapgen-core:habitat:check
nx run mod-swooper-maps:check
bun test mods/mod-swooper-maps/test/foundation
git diff --check -- packages/mapgen-core/src packages/mapgen-core/test mods/mod-swooper-maps/src mods/mod-swooper-maps/test .habitat/.active
```

## Slice 6: Final Packet Closure

Status: planned/open

### Objective

Prove the remaining Foundation Lib tectonics disposition work is complete and
the packet can hand off to the next prework slice with no hidden deferrals.

### Acceptance Criteria

Pass:

- `mods/mod-swooper-maps/src/domain/foundation/lib` no longer exists;
- every row in the remaining row ledger has a closed proof label and closure
  scan result;
- no accepted P1/P2 review finding remains open;
- packet README, disposition table, domino closure records, and this execution
  record agree about status;
- worktree is clean after Graphite commit.

Fail:

- any row is deferred without a named owner and trigger;
- any `foundation/lib/**` file remains without a sealed authority decision that
  reopens this packet before final closure;
- any old `foundation/lib/**` import remains in source or tests;
- final proof relies on stale pre-slice command output.

### Final Verification

```bash
test ! -e mods/mod-swooper-maps/src/domain/foundation/lib
! rg -n "foundation/lib|\\.\\./\\.\\./lib|\\.\\./\\.\\./\\.\\./lib|lib/tectonics" mods/mod-swooper-maps/src mods/mod-swooper-maps/test -g '*.ts'
! rg -n "from .*tectonics/shared|requireMesh|requireCrust|requireMantlePotential|requireMantleForcing|requirePlateGraph|requirePlateMotion|requireTectonics|requireTectonicHistory|requireTectonicProvenance" mods/mod-swooper-maps/src mods/mod-swooper-maps/test -g '*.ts'
nx run mapgen-core:test
nx run mapgen-core:check
nx run mapgen-core:habitat:check
nx run mod-swooper-maps:check
nx run mod-swooper-maps:habitat:check
nx run mod-swooper-maps:test
bun habitat classify .habitat/.active
git diff --check -- .habitat/.active mods/mod-swooper-maps/src mods/mod-swooper-maps/test packages/mapgen-core/src packages/mapgen-core/test
gt status --no-interactive
test -z "$(git status --short)"
```

## Review Loops

Each implementation slice gets a fresh review wave before closure:

- Source/consumer reviewer: importers, Narsil/rg evidence, deleted-path scans,
  and stale old-owner references.
- Behavior reviewer: exact guard predicates, typed-array validation, quantize
  behavior, vector behavior, mesh traversal, tie-break, fallback, and wrap
  semantics.
- Architecture/proof reviewer: owner placement, artifact export shape,
  mapgen-core vocabulary neutrality, proof labels, and no generic buckets.
- Closure reviewer: row ledger, execution record truth, dirty state, Graphite
  state, and finding disposition.

Accepted P1/P2 findings block the next slice until repaired, rejected with
source evidence, invalidated by later evidence, or resolved by sealed authority
or explicit user decision. The disposition must be recorded in
`reviews/review-findings.md` before the next slice opens.

## Graphite Closure

Each source-moving slice should commit through Graphite as a small stack layer
with a concise conventional subject. The final packet closure commit should
name the completed execution state, not merely documentation churn.
