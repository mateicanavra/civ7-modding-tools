# Native Map Controls

Status: active; design approved 2026-09-27, integration not complete.
DRA: root. Opened: 2026-09-27.
Branch: `agent-root-civ7-native-map-controls-frame`.

## Frame

Map authors should see the physical heightfield and connected minor/navigable
river network produced by Swooper realized faithfully in Civ7, rather than
reconstructed by unrelated native generators. Studio must remain usable from
the same isolated checkout throughout the work.

This is one workstream with two separately reviewable implementation lanes:
[elevation](elevation.md) and [rivers](rivers.md). They share resource/API
grounding, a [resource compatibility prerequisite](resources.md), capability
contracts, native readback, and a [study loop](studies.md).
Research can run in parallel; integrated behavior lands in one linear Graphite
stack, elevation before rivers. This order reduces experimental confounding; it
is not a claim that the river setter technically requires our elevation setter.

Non-goals: redesign geophysics, retune maps to pass new screenshots, finish the
unrelated Controller/Play migration, upgrade Habitat wholesale, invent generic
blueprints, or change volcano placement merely because naming is now exposed.
New resource-schema compatibility is in scope because it gates current-source
generation and changes facts consumed by placement.

The existing API materializer is only the installed-resource sync and
TypeScript-declaration generator. It does not run, emulate, rebuild, or isolate
the Civ7 engine. Native verification means running map scripts in the installed
game. Keep any diagnostic map fixture small and use the existing build/deploy
path; do not introduce a replacement engine or general test framework.

Done means: current official resources and generated policy agree; the portable
definition projects authored elevation and both river classes through the
qualified realization; studies and downstream guards pass; a correlated live
run shows functioning native results; displaced compensation is removed only
where its necessity has been disproven. A mock, build, or screenshot alone does
not satisfy this outcome.

## Authority And Baseline

Current user instructions and root/subtree AGENTS govern. The accepted
`docs/projects/civ7-capability-realization/` model owns realization boundaries;
`docs/projects/engine-refactor-v1/architecture-normalization-packet.md` owns
MapGen truth/projection. Shared Habitat laws come from the pinned published
pack; `.habitat/AUTHORITY.md` permits only qualified local rules. OpenSpec is
downstream change management, not new architecture authority.

Selected base: `agent-root-civ7-capability-migration-frame`,
`10e6b74493bd5aae7d0016389dd09bd8f12d2512`, 31 commits above main
`fd60a16ad7605ad34c8afa9668aa847b52931022`.

- Main already contains the latest accepted physical climate/resource/lake work
  (`299dbac3e7`) and seed-stateless latitude change (`bfe11d752c`). The old
  `claude/wind-field-rca` branch is not missing accepted algorithm work.
- Domain, Core, and committed map-config trees are identical between main and
  the selected tip. Runtime migration `aef45dd515` places native implementation
  in the realization app; that newer owner is why this work extends the tip.
- Existing main checkout edits for the separate Earthlike FIX experiment are
  protected and excluded. No edits are copied from that checkout.
- Fluree branches, the earlier Studio runner, and the existing capability
  checkout remain untouched. Only this worktree owns these new changes.
- The parent controller-service admission/live-proof gaps remain gaps. This
  request authorizes the bounded MapGen investigation, not silent completion or
  redesign of that separate migration.

## First-Phase Findings

Evidence is the installed 1.5 Earth map and accompanying common-generation
script, compared with pinned resource commit `aba19f44`. Relative game paths:

- `Base/modules/base-standard/maps/EarthMaps/Earth_Huge.js:51`: bulk
  `setElevation(numberArray)`, followed by `generateCliffsFromElevation()`.
- The Earth fixture has 6,996 integer values (0..1550), matching 106 x 66 plots.
  Coordinate/array comparison supports row-major indexing. Units, native range,
  coercion, and typed-array acceptance are not documented by this example.
- `Earth_Huge.js:55`: `setRiverInfo(x, y, direction, riverType)` specifies both
  minor and navigable segments, with tributaries and class transitions. Embedded
  source comments include lake tiles; blanket water-tile rejection is invalid.
- `scripts/common-generation.js:64`: procedural modeling and explicit
  finalization are alternative branches. Finalization defaults are
  `true, 25, 2, 2`; Earth disables aesthetic validation. Parameter names in JS
  are evidence, not a complete native behavioral contract.
- Validation, area recalculation, floodplain generation, and water-cache
  refresh still occur. Direct setters do not justify deleting all maintenance.
- Custom river and volcano naming are demonstrated after finalization.
  Existing volcano feature placement is not newly enabled by this update.
- Exact edge/direction interpretation, native repair, overflow handling,
  confluences, lake outlets, and finalization idempotence need bounded live
  probes before implementation parameters are selected.

The resource prerequisite is broader than cotton: omitted Weight has official
SQL default 1, not the old explicit 10; the schema now uses MinimumPerLandmass
and LandmassUnique; MapResourceMinimumAmountModifier is absent. Relabeling old
hemisphere behavior or defaulting all old minima to zero is not an acceptable
migration. Trace and update policy and its placement consumers together.
Preserve positive fractional weights. Regional minima apply to every admitted
resource with eligible plots in a positive engine landmass region, not only
required-for-age resources or each connected physical island. The resource
plan bounds this change without claiming Firaxis distribution-algorithm parity.

## Owner Map

| Concern | Owner | Must not own it |
| --- | --- | --- |
| Physical heightfield and drainage | Existing Swooper domain artifacts | Native adapter/readback |
| Gameplay projection and recipe order | Existing Swooper map-elevation/map-rivers steps and named policy | Core, Studio, native adapter |
| Portable capabilities and deterministic mock | `packages/civ7-adapter` | Engine globals |
| Native setters, finalization, observations | Realization app `src/runtime/map-script` | Portable definition or shared adapter package |
| Official declarations and provenance | API materializer -> generated `packages/civ7-api` | Handwritten declaration patches |
| Official static policy/defaults | `packages/civ7-map-policy` generator | Physics operations or UI |
| Measurements/targets/studies | Existing Standard metric bank | A second diagnostic authority |

The existing stage sequence remains the starting design: morphology projection,
lake projection, elevation, rivers, ecology, placement. No new stage is justified
only to mirror a native function name. Engine observations remain local evidence,
not mutable cross-stage causal artifacts.

## Sequencing And Parallelization

Each numbered domino becomes a meaningful Graphite layer with focused tests,
review, and a clean commit. The exact branch is created when the slice starts,
not as a collection of empty placeholders.

```mermaid
flowchart LR
  A[Source and baseline] --> B[Generator and resource compatibility]
  B --> C[Native contract probes]
  C --> D[Elevation projection]
  D --> E[Minor and navigable rivers]
  E --> F[Integrated studies and deletion]
  R[Parallel design and review] -.-> C
  R -.-> D
  R -.-> E
  classDef baseline fill:#e6f3f1,stroke:#25786c,color:#173d36
  classDef implementation fill:#edf0ff,stroke:#5268ac,color:#22356d
  classDef review fill:#fff2d6,stroke:#8a681f,color:#59430e
  class A,B baseline
  class C,D,E implementation
  class R,F review
```

1. **Frame and baseline:** reconcile branch lineage, shipped controls, current
   owners, candidate deletion set, study gaps, and development startup.
2. **Studio prerequisite:** fix the reproducible React declaration-resolution
   failure and undeclared upstream math types without casts or disabled checks;
   launch the baseline application.
3. **Official-source compatibility:** repair source-map asset-edge handling in
   the native materializer, retain provenance, and migrate new resource schema
   plus affected placement consumers. Use separate layers for independently
   testable parser and resource-policy changes. Publish a coherent snapshot and
   regenerate outputs through their owners; no knowingly broken gitlink layer.
   The installed map catalog also contains a binary `.Civ7Map` row: admit it
   explicitly as non-script evidence rather than raising JavaScript-root counts.
   See resources.md for fractional-weight, non-required-resource minimum and
   engine-region fixtures; its placement result becomes the controls baseline.
4. **Native contract probes:** asymmetric elevation/cliff fixture; connected
   minor/main-river fixture; then confluence, lake, seam and endpoint cases.
   Observe before/after finalization and subsequent maintenance. Record exact
   supported semantics, refuse unsupported claims, and review the design lock.
5. **Elevation:** explicit projected intent, admitted capability/mock, native
   write/readback, error metrics and integrated guards. No stock elevation
   overwrite remains on the adopted path.
6. **River network:** connected physical receiver lowering, minor and navigable
   writers, explicit finalization, native type/direction/connectivity evidence,
   and downstream feature/placement integration. No second river planner.
7. **Study and deletion:** stable cohorts plus correlated live results; remove
   each displaced generator/heuristic/repair only with its deletion receipt;
   re-run affected guards after removal and independent architecture review.

Investigation and independent test-fixture design can run concurrently. One
owner serializes changes to shared capability types, mocks, metric capture,
resource snapshot, and Graphite state. One lane owns the shared live Civ process
and deployed mod tree. No agent mutates a sibling worktree.

## Design Lock And Review

Review the plan with the user before changing the cross-owner native projection
architecture. Bounded prerequisite fixes may proceed with source-backed design
and focused tests. Unresolved probe results are explicit design inputs, not
implementation permission to guess units or connectivity.

The user approved this sequence and owner boundary on 2026-09-27 ("Proceed with
this design"). Implementation is authorized; unresolved native contracts still
require the planned probes rather than assumptions.

Before each behavior layer: predeclare expected effect and HOLD guards; name
writers/callers; run architecture and runtime/physics adversarial review. After
the layer: execute focused tests, study delta, and integration review. Accepted
material findings must be repaired before a dependent layer advances.

Alternatives considered:

- **Selected:** existing truth -> explicit projection -> native write/finalize
  -> observations, preserving the established owner/stage architecture.
- **Rejected as destination:** retain stock generation, then repair its outputs.
  This leaves two decision-makers and cannot promise our minor network survives.
- **Rejected:** move physical routing/conversion into native adapter or Core.
  Engine glue would become a second Swooper semantic owner.
- **Probe-dependent initialization:** retain only a native initialization pass
  that experiments demonstrate is required and does not overwrite intent.
  This is an unresolved native contract question, not an authorized dual path.

## Proof And Working State

Discovery team: independent branch-lineage, shipped-controls/resource-schema,
and architecture/study lanes. Prerequisite repairs receive separate review.
Skills: git-worktrees, graphite, current civ7-mapgen-workstream,
civ7-architecture-authority, civ7-product-authority, Habitat workstream-runner
and workstream-review-loops. Older main-only skill paths are not authority on
this tip.

Baseline setup: isolated worktree created and Graphite parent tracked; frozen
Bun install succeeded. The first Studio dev graph built generation dependencies
but failed UI declaration emission because RJSF could not resolve React types
under the isolated linker. The first native refresh failed transactionally on
a retained SCSS import; it did not replace the pinned snapshot or generated API.
These are reproduced prerequisite failures, not failures of new river/elevation
implementation. No behavioral integration or native probe is claimed yet.

The startup dependency repairs restore graph-owned UI build and local
generation. Studio runs in this worktree at `http://127.0.0.1:5173/`, with daemon
port 5174. Arc was opened; local generation completed with 145/145 resources,
5/5 wonders, and zero final water/lake/class drift. This is a smoke run using
the browser's existing Studio Current config, not a frozen study cohort or live
Civ7 proof. Native Arc capture did not expose the visual preview, so rendering
is not claimed verified from that capture.
An independent browser check did verify a nonblank generated preview on the
same server. Its existing Latest Juicy/Huge seed -978072323 config shows a
21-mismatch water diagnostic; that is a separate baseline observation, not a
native-controls regression or a passing guard.

The materializer prerequisite admits only evidenced bare SCSS side effects.
Pinned baseline declaration shards remain byte-identical; its receipt advances
to schema 4 with no stylesheet omissions. Installed-source adoption is the next
coherent layer: 960 embedded sources (716 TS, 244 TSX), 11 stylesheet dispositions,
and 15 map rows (14 JS roots plus one `.Civ7Map`) differ from the pinned corpus.
Resource refresh and publication completed at
`89cee44d5ae7192f126e8ae09484c04400df9146`, from installed game 1.5.0.40
(1306154), Steam build 25245002. The source receipt covers 10,794 files and
192,609,798 bytes, SHA-256
`6859927406ee2837555eed8e91767c28cf00b011f44e470dae89b4f63c07046f`.
Generated policy and placement consumers now use the current source. The API
projection preserves the exact bare imports in two newly consolidated UI
loaders, restoring the declaration closure without inferring engine behavior.
The loader change is shipped behavior, not missing XML tags or an engine change.
Current-source API generation produces 965 declaration shards, SHA-256
`f25259815e4b4c1f6929cd2cc2333fd6de6bd64315101d3d44378ba906a186d5`.
Its uncached API/materializer check graph passes 64 tests, unchanged shell
contract checks, typechecks, freshness and Habitat policies. The missing native
`ResourceDefinition` type is opaque only inside the existing module-resolution
test fixture, not invented in production declarations.
The graph-owned materializer check passes all 43 tests, typecheck, both Habitat
policy rules and generated freshness after regeneration. Independent patch
review found no P1/P2 defects. Frozen dependency installation makes no changes.
The UI build passes with the Nx cache explicitly bypassed; the earlier failed
build remains in Nx's flaky-task history, not a suppressed current failure.
The CLI topic build also passes; the command is unavailable in a fresh checkout
until that graph-owned build creates its command manifest.

The existing `earthlike/relief-representative` sample passes both integrity and
relief targets. See studies.md for its reproducible inputs and honest headless
evidence boundary. It also passes after resource migration with the reported
relief and river measurements unchanged. The 20-scenario `earthlike/placement`
cohort passes its integrity, placement and resource targets after migration.
These are not full-bank or native-runtime passes.

### Design Review Dispositions

Independent architecture/study review found four material amendments, all
accepted: reconcile accepted versus rejected lakes before river lowering;
separate headless/mock studies from native evidence; require bounded navigation
and freshwater/river-adjacency witnesses; and make fractional resource weights
and eligible engine-region minima explicit. The lane plans include the repairs.
No ownership redesign was requested by that review.

Keep raw command logs and generated study results outside authored source or in
owner-defined ignored output homes. Commit conclusions, inputs and exact proof
references here rather than dumping generated evidence into documentation.

## Next Packet

Start here, then read resources.md, elevation.md, rivers.md and studies.md. Confirm current
Graphite tip and clean status; preserve the separate main edits. Current-source
compatibility is verified; proceed through the approved actual-game probe gates
before changing production elevation or river behavior. Discover resolved
Nx targets and current CLI help rather than copying historical metrics aliases.
Do not report live parity while run identity/correlation remains unresolved.
