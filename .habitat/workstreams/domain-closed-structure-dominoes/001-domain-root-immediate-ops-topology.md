# Domino 001: Domain Root And Immediate Ops Topology

Status: locked planning for review

Parent overview: `../domain-closed-structure-working-document.md`

Related method frame: `../../frames/CLOSED-STRUCTURE-ENFORCEMENT-METHOD-FRAME.md`

Owner: Habitat authority-tree workstream steward

## Frame

Frame name: Domain Root And Immediate Ops Topology

Built by: Habitat authority-tree workstream steward

For situation: the first standalone closed-structure domino for MapGen domains,
covering each domain root and each immediate `ops/` child.

Built when: 2026-07-02

Mode: co-framing

Object-path: objective

### Scope And Provenance

Durable enforced instance set:

- `mods/mod-swooper-maps/src/domain/ecology/`
- `mods/mod-swooper-maps/src/domain/foundation/`
- `mods/mod-swooper-maps/src/domain/hydrology/`
- `mods/mod-swooper-maps/src/domain/morphology/`
- `mods/mod-swooper-maps/src/domain/resources/`

Transitional enforced instance:

- `mods/mod-swooper-maps/src/domain/placement/` is included only for duplicate
  root-contract deletion and immediate `ops/` topology parity. This does not
  admit Placement as durable domain ontology or pre-decide Gameplay absorption.

In scope:

- Direct children of each enforced domain root.
- Direct children of each enforced domain `ops/` folder.
- The first live Habitat structure gate for that topology.
- The first burn-down of files made red by that topology.
- Rule packets whose predicate is subsumed by the new topology gate.

Out of scope:

- Deep operation internals below `ops/<op-id>/`.
- Strategy/rule file grammar below an operation.
- Recipe, stage, step, adapter, Studio, generated-output, and runtime topology.
- `mods/mod-swooper-maps/src/domain/narrative/**`. Narrative is not a durable
  architecture-backed domain in this slice; it is assigned to a later Gameplay
  absorption law.

Source pointers:

- `../domain-closed-structure-working-document.md`
- `../../frames/CLOSED-STRUCTURE-ENFORCEMENT-METHOD-FRAME.md`
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`
- `docs/projects/engine-refactor-v1/resources/spec/SPEC-packaging-and-file-structure.md`
- `docs/system/libs/mapgen/policies/IMPORTS.md`
- `.agents/skills/civ7-architecture-authority/references/ownership-boundaries.md`

### WHAT

This frame treats the domain root plus immediate `ops/` child set as the unit of
analysis, makes closed topology the primary signal, and holds deeper operation
grammar exterior. A domain root is allowed to expose the canonical public
surface, runtime binding surface, config surface, and narrowly named owner
slots. Any root helper file, duplicate root contract, generic support folder,
or non-operation child under `ops/` is red until moved, deleted, or explicitly
reclassified by architecture authority.

### WHY

This frame gives the first closed cut enough force to collapse real structural
debt without pretending the whole domain tree has already been adjudicated. The
rejected alternative was a full recursive domain-tree cutover. That would make
too many deep strategy/rule placement decisions before the first live topology
gate proves itself. The other rejected alternative was a narrow root-only pass,
which would leave `ops/shared`, `ops/score-shared`, and
`ops/mountains-shared` alive even though they are the same structural disease
one level down.

### Selection Commitments

In:

- Direct domain-root children.
- Direct children of each domain `ops/` folder.
- Registered operation ids as the only allowed operation folders.
- Exact red-path inventory and locked write-set categories.
- Agent prompts that produce decisions needed before mechanical execution.

Foreground:

- Positive allow-list first; explicit forbids are only failure messages.
- No `semantics.ts` bucket in this domino.
- No `shared`, `utils`, `common`, `internal`, or `support` owner.
- No generic non-op family folder under `ops/`.

Exterior:

- The grammar inside each operation folder.
- The final Gameplay consolidation.
- Deep policy/lib/artifact internals beyond the existence of legal slots.
- Any reporting or ledger surface beyond this one domino document.

### Hard Core And Protective Belt

Hard core:

1. The selected topology is closed and allow-list first.
2. Root `index.ts`, root `ops.ts`, and `ops/contracts.ts` carry real domain
   boundary roles; root `contract.ts` does not.
3. `config.ts`, `policy/`, `lib/`, and `artifacts/contract/` are owner slots,
   not dumping grounds.
4. A child under `ops/` is either `contracts.ts`, `index.ts`, or a registered
   operation id.
5. Execution is not complete until red paths are burned down and overlapping
   rule packets are removed, absorbed, or retained with a distinct concern.

Protective belt:

- The first implementation can use explicit forbidden-name clauses for clearer
  failure output, as long as the asserted law remains the allow-list.
- `artifacts/` is accepted only as the namespace for `artifacts/contract/`.
- Red paths move outside the domain tree when truth/projection ownership
  requires that move.
- Legacy `narrative` is excluded from this domino's enforced instance set. It is
  not admitted as a domain-root helper topology.

### Reframe Conditions

Specific falsifier: if the Habitat structure runner cannot express closed
direct-child topology for domain roots and immediate `ops/` children without a
custom source parser or another reporting layer, this domino must be reframed
around the smallest existing live enforcement owner that can fail the same
invalid state.

Degeneration trigger: if three or more red paths need a new generic bucket to
avoid deletion or owner placement, stop and reframe; the topology is admitting
debt instead of closing it.

### Assumptions

- The current live folder set is `ecology`, `foundation`, `hydrology`,
  `morphology`, `narrative`, `placement`, and `resources`.
- The durable enforced domain set for this domino is `ecology`, `foundation`,
  `hydrology`, `morphology`, and `resources`.
- `placement` is a transitional enforced instance for root-contract and
  immediate-ops cleanup only.
- Existing `ops/contracts.ts` files in the enforced set define the registered
  operation ids for this domino.
- Current source paths are implementation evidence, not architecture authority.
- Agent lanes are read-only until the steward accepts their dispositions.

## Reference

### Selected Law

```text
A MapGen domain root has only the closed direct-child slots named below.
A direct child of a domain `ops/` folder is either the operation contract
registry, the operation implementation registry, or a registered operation id.
```

### Allow-List

```text
mods/mod-swooper-maps/src/domain/<domain>/
  index.ts
  ops.ts
  config.ts?
  ops/
  policy/?
  lib/?
  artifacts/

mods/mod-swooper-maps/src/domain/<domain>/artifacts/
  contract/

mods/mod-swooper-maps/src/domain/<domain>/ops/
  contracts.ts
  index.ts
  <registered-op-id>/
```

Not admitted in this domino:

- `contract.ts` at the domain root.
- `semantics.ts` as a generic domain-root bucket.
- `types.ts`, `models.ts`, `constants.ts`, or other root helper files.
- `shared/`, `utils/`, `common/`, `internal/`, or `support/`.
- `public/`.
- broad `artifacts/` contents outside `artifacts/contract/`.
- non-op direct children under `ops/`, including `shared`, `score-shared`, and
  `mountains-shared`.

### Red Path Inventory

Duplicate root contracts, delete after import proof:

- `mods/mod-swooper-maps/src/domain/ecology/contract.ts`
- `mods/mod-swooper-maps/src/domain/foundation/contract.ts`
- `mods/mod-swooper-maps/src/domain/hydrology/contract.ts`
- `mods/mod-swooper-maps/src/domain/morphology/contract.ts`
- `mods/mod-swooper-maps/src/domain/placement/contract.ts`
- `mods/mod-swooper-maps/src/domain/resources/contract.ts`

Root helper files:

- `mods/mod-swooper-maps/src/domain/ecology/types.ts`
- `mods/mod-swooper-maps/src/domain/ecology/biome-bindings.ts`
- `mods/mod-swooper-maps/src/domain/ecology/feature-engine-legality.ts`
- `mods/mod-swooper-maps/src/domain/foundation/constants.ts`
- `mods/mod-swooper-maps/src/domain/hydrology/river-class.ts`
- `mods/mod-swooper-maps/src/domain/hydrology/river-network-metrics.ts`

Root generic folders:

- `mods/mod-swooper-maps/src/domain/ecology/shared/`
- `mods/mod-swooper-maps/src/domain/foundation/shared/`
- `mods/mod-swooper-maps/src/domain/hydrology/shared/`
- `mods/mod-swooper-maps/src/domain/morphology/shared/`

Immediate `ops/` non-op children:

- `mods/mod-swooper-maps/src/domain/ecology/ops/score-shared/`
- `mods/mod-swooper-maps/src/domain/hydrology/ops/shared/`
- `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared/`

Already legal direct slots in this domino, with deeper grammar outside this
domino:

- `mods/mod-swooper-maps/src/domain/foundation/lib/`
- `mods/mod-swooper-maps/src/domain/resources/lib/`
- `mods/mod-swooper-maps/src/domain/resources/policy/`
- `mods/mod-swooper-maps/src/domain/resources/artifacts/contract/`

Narrative exclusion:

- `mods/mod-swooper-maps/src/domain/narrative/**` is not in the enforced
  instance set for Domino 001. Its legal destination is a later Gameplay
  absorption domino, not a domain-root bucket.

### Disposition Rules

Each red path gets exactly one disposition before code movement:

- Delete: no live consumer, duplicate owner, or dead legacy.
- Move to `config.ts`: stage/step authoring schemas, config types, deterministic
  compile-time transforms.
- Move to `policy/<concern>.ts`: domain-level cross-op policy with a named
  concern and real consumers.
- Move to `lib/<concern>/...`: data, corpus, proof, or derivation material, not
  executable helper storage.
- Move to `artifacts/contract/<artifact>.contract.ts`: artifact contracts and
  schemas that define a pipeline truth product.
- Move into an owning `ops/<op-id>/...`: op-local rules, scoring helpers,
  validators, or policy.
- Move outside domain: projection, runtime, stage orchestration, adapter, or
  Gameplay-owned material.

There is no `semantics.ts` disposition in this domino.

### External-Owner Sublaws

Domino 001 includes two external-owner sublaws because burning down current red
paths requires moving content out of the domain tree.

Core mechanics sublaw:

```text
Pure grid and scalar math helpers with no domain vocabulary, Civ7 policy, recipe
stage meaning, adapter calls, or mod-specific semantics belong to
packages/mapgen-core/src/lib/**.
```

Exact destinations:

- `packages/mapgen-core/src/lib/grid/validation.ts` owns rectangular grid
  dimension and field-length validation.
- `packages/mapgen-core/src/lib/grid/distance/mask.ts` owns reusable mask-based
  hex-grid distance transforms.
- `packages/mapgen-core/src/lib/grid/local-extrema.ts` owns reusable grid local
  maximum checks.
- `packages/mapgen-core/src/lib/math/range.ts` owns scalar range/window helpers
  in addition to `normalizeRange`.
- `packages/mapgen-core/src/lib/math/clamp.ts` already owns `clamp01` and
  `clampU8`; duplicate local clamp helpers are deleted and imports are rewired.

Verification boundary: `bun run --cwd packages/mapgen-core check` plus the
nearest mod check after source imports are rewritten.

Civ7 map-policy sublaw:

```text
Derived official Civ7 map policy facts, legality tables, and feature/resource
policy facts belong to @civ7/map-policy. MapGen domains may translate those
facts into domain vocabulary, but they do not own the generated official table
derivation.
```

Exact destinations:

- `packages/civ7-map-policy/src/catalogs/feature-placement.ts` owns ecology
  placeable official feature keys and feature index ordering.
- `packages/civ7-map-policy/src/catalogs/feature-legality.ts` owns official
  feature terrain/biome legality lookup derived from generated policy tables.
- `packages/civ7-map-policy/src/index.ts` re-exports accepted public catalog
  surfaces.

Verification boundary: `bun run --cwd packages/civ7-map-policy check`.

### Domino 001 Disposition Law

The semantic remainder is the content displaced when the closed topology makes
current paths illegal. Domino 001 permits only the move classes below.

State meanings:

- Execute: Domino 001 owns the move.
- Execute with sublaw: Domino 001 owns the burn-down under the external-owner
  sublaws above.
- Excluded: Domino 001 does not enforce or move the row.

| State | Current path or export | Move class | Destination |
| --- | --- | --- | --- |
| Execute | Six enforced-domain root `contract.ts` files | Duplicate authority deletion | Delete after import proof; root `index.ts` and op-local `ops/contracts.ts` are the valid contract surfaces. |
| Execute | `ecology/types.ts`: `BiomeSymbol`, `BIOME_SYMBOL_ORDER`, `BIOME_SYMBOL_TO_INDEX`, `biomeSymbolFromIndex` | Domain vocabulary/policy promotion | `mods/mod-swooper-maps/src/domain/ecology/policy/biome-vocabulary.ts` |
| Execute with sublaw: Civ7 map-policy | `ecology/types.ts`: official feature key ordering and feature placement key derivation | Official Civ7 policy/resource ownership | `packages/civ7-map-policy/src/catalogs/feature-placement.ts`; ecology imports or re-exports only the accepted public shape it owns. |
| Execute | `ecology/types.ts`: `PlotEffectKey` | Domain vocabulary/policy promotion | `mods/mod-swooper-maps/src/domain/ecology/policy/plot-effects.ts` |
| Execute with sublaw: Civ7 map-policy | `ecology/feature-engine-legality.ts`: official feature terrain/biome legality derivation | Official Civ7 policy/resource ownership | `packages/civ7-map-policy/src/catalogs/feature-legality.ts`; domain ecology keeps only internal-biome compatibility translation in `mods/mod-swooper-maps/src/domain/ecology/policy/feature-engine-legality.ts`. |
| Execute | `ecology/biome-bindings.ts` | Projection/stage ownership move | `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/biome-bindings.ts` |
| Execute | `ecology/shared/placement-schema.ts` | Artifact contract extraction | `mods/mod-swooper-maps/src/domain/ecology/artifacts/contract/feature-intent-placement.contract.ts` |
| Execute | `foundation/constants.ts` | Domain vocabulary/policy promotion | `mods/mod-swooper-maps/src/domain/foundation/policy/boundary-type.ts` |
| Execute | `foundation/shared/knobs.ts` and `foundation/shared/knob-multipliers.ts` | Domain config consolidation | Merge into `mods/mod-swooper-maps/src/domain/foundation/config.ts`; delete `foundation/shared/`. |
| Execute | `hydrology/river-class.ts` | Domain vocabulary/policy promotion | `mods/mod-swooper-maps/src/domain/hydrology/policy/river-class.ts` |
| Execute | `hydrology/river-network-metrics.ts` | Domain vocabulary/policy promotion | `mods/mod-swooper-maps/src/domain/hydrology/policy/river-network-metrics.ts` |
| Execute | `hydrology/shared/knobs.ts` and config-facing multiplier exports | Domain config consolidation | Merge into `mods/mod-swooper-maps/src/domain/hydrology/config.ts`; delete `hydrology/shared/`. |
| Execute | `HYDROLOGY_NAVIGABLE_RIVER_PROJECTION_POLICY` | Projection/stage ownership move | `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/config.ts` |
| Execute | Unused hydrology projection/refinement defaults in `hydrology/shared/knob-multipliers.ts` | No replacement | Delete after import proof. |
| Execute | `hydrology/ops/shared/wind-field.ts` | Artifact contract extraction | `mods/mod-swooper-maps/src/domain/hydrology/artifacts/contract/wind-field.contract.ts` |
| Execute | `morphology/shared/knobs.ts` and `morphology/shared/knob-multipliers.ts` | Domain config consolidation | Merge into `mods/mod-swooper-maps/src/domain/morphology/config.ts`; delete `morphology/shared/`. |
| Execute | `morphology/ops/mountains-shared/config.ts`: `MountainsConfigSchema`, `MountainsConfig` | Domain config consolidation | `mods/mod-swooper-maps/src/domain/morphology/config.ts` |
| Execute | `morphology/ops/mountains-shared/config.ts`: `assertSameMountainFamilySelection` and stable stringify helpers | Projection/stage ownership move | `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/mountain-ranges-public-config.ts` |
| Execute | `morphology/ops/mountains-shared/rules/resolveBoundaryRegime.ts` and `resolveBoundaryStrength.ts` | Domain vocabulary/policy promotion | `mods/mod-swooper-maps/src/domain/morphology/policy/boundary-regime.ts` |
| Execute | `morphology/ops/mountains-shared/rules/computeOrogenyPotential.ts` and `computeFracturePotential.ts` | Domain vocabulary/policy promotion | `mods/mod-swooper-maps/src/domain/morphology/policy/orogenic-potential.ts` |
| Execute | `morphology/ops/mountains-shared/rules/computeMountainScore.ts` | Domain vocabulary/policy promotion | `mods/mod-swooper-maps/src/domain/morphology/policy/mountain-score.ts` |
| Execute | `morphology/ops/mountains-shared/rules/computeHillScore.ts` | Domain vocabulary/policy promotion | `mods/mod-swooper-maps/src/domain/morphology/policy/hill-score.ts` |
| Execute | `morphology/ops/mountains-shared/rules/resolveDriverStrength.ts` | Domain vocabulary/policy promotion | `mods/mod-swooper-maps/src/domain/morphology/policy/driver-strength.ts` |
| Execute | `morphology/ops/mountains-shared/rules/normalizeMountainFractal.ts` and `encodeNormalizedToU8.ts` | Domain vocabulary/policy promotion | `mods/mod-swooper-maps/src/domain/morphology/policy/terrain-score-encoding.ts` |
| Execute with sublaw: core mechanics | `morphology/ops/mountains-shared/rules/computeDistanceToMask.ts` | Core mechanics extraction | `packages/mapgen-core/src/lib/grid/distance/mask.ts` |
| Execute with sublaw: core mechanics | `morphology/ops/mountains-shared/rules/isStrictLocalMaximumHex.ts` | Core mechanics extraction | `packages/mapgen-core/src/lib/grid/local-extrema.ts` |
| Execute with sublaw: core mechanics | `morphology/ops/mountains-shared/rules/util.ts` | Core mechanics extraction | Delete; replace `clamp01` imports with `packages/mapgen-core/src/lib/math/clamp.ts#clamp01` and `clampByte` uses with `clampU8`. |
| Execute | `morphology/ops/mountains-shared/rules/types.ts` | Domain config consolidation | Delete; imports use `MountainsConfig` from `mods/mod-swooper-maps/src/domain/morphology/config.ts`. |
| Execute | `morphology/ops/mountains-shared/rules.ts` and `rules/index.ts` | Operation-family decomposition | Delete after imports point at exact policy/core destinations. |
| Execute with sublaw: core mechanics | `ecology/ops/score-shared/index.ts`: `validateGridSize` | Core mechanics extraction | `packages/mapgen-core/src/lib/grid/validation.ts` |
| Execute with sublaw: core mechanics | `ecology/ops/score-shared/index.ts`: `rampUp01`, `rampDown01`, `window01` | Core mechanics extraction | `packages/mapgen-core/src/lib/math/range.ts` |
| Execute | `ecology/ops/score-shared/index.ts`: `PhysicalCandidate`, confidence/stress conversion, candidate comparison/selection | Domain vocabulary/policy promotion | `mods/mod-swooper-maps/src/domain/ecology/policy/physical-candidate-selection.ts` |
| Excluded: Gameplay law | `mods/mod-swooper-maps/src/domain/narrative/**` | Gameplay absorption | Selected by a Gameplay absorption domino, not Domino 001. |

This table is the decision book for Domino 001. If implementation finds a
symbol that does not fit a row, the domino stops for a narrow law update; agents
do not invent `semantics.ts`, `shared/`, `utils/`, `common/`, `internal/`, or
`support/`.

### Current Slot Shape Findings

Existing legal slots are not equally clean:

- `index.ts`: all enforced domains call `defineDomain(...)`. Three are already
  contract-only after the default export (`foundation`, `morphology`,
  `placement`). `resources` exports accepted `lib/` and `policy` surfaces.
  `ecology` and `hydrology` export from illegal root helpers.
- `ops.ts`: six domains are pure `createDomain(domain, implementations)`.
  `morphology/ops.ts` additionally exports config schemas/constants and is the
  first known content violation for the runtime surface.
- `config.ts`: foundation, hydrology, and morphology are facades over illegal
  `shared/` backing modules; placement composes config from operation
  contracts; ecology and resources have no root config facade.

Domino 001 is mechanically trusted only when the topology rule is paired with
the root `index.ts` content rule and the disposition law above. Narrative is not
a blocked row inside this domino; it is out of the enforced instance set.

### Content Gate For Root `index.ts`

Domino 001 introduces a Grit rule named
`require_domain_root_index_contract_surface`.

Required shape:

- file path: `mods/mod-swooper-maps/src/domain/<domain>/index.ts`;
- import `defineDomain` from `@swooper/mapgen-core/authoring/contracts`;
- import the operation contract registry from `./ops/contracts.js`;
- define the domain via `defineDomain({ id: "<domain>", ops } as const)`;
- default-export that domain value.

Forbidden shape:

- importing from `./ops/index.js`, `./ops.ts`, strategies, rules, recipe,
  stage, adapter, runtime, or generated output;
- defining schemas, constants, predicates, helper functions, or domain
  vocabulary inline in `index.ts`;
- re-exporting from illegal root files such as `./types.js`,
  `./contract.js`, `./models.js`, `./constants.js`, or arbitrary root helper
  paths;
- re-exporting from any path outside the enforced allow-list.

Allowed exports after the disposition law is implemented:

- explicit exports from accepted destination slots only: `./policy/<concern>.js`,
  `./lib/<concern>/index.js`, `./artifacts/contract/<artifact>.contract.js`,
  or a stable op contract surface when architecture authority says that value
  is public.

This Grit gate prevents the failure mode where the structure rule deletes root
helper files but agents paste their contents into `index.ts` to keep imports
green.

### Expected Changed Files

Enforcement files expected to change:

- New Habitat structure rule packet:
  `.habitat/blueprints/domain/enforce_domain_root_immediate_ops_topology/`.
- Its `rule.json`.
- Its `structure.toml`.
- New Grit-backed rule packet:
  `.habitat/blueprints/domain/require_domain_root_index_contract_surface/`.
- Adjacent pattern/proof/baseline files required by existing Habitat rule
  conventions for those two rule packets.
- Generated Habitat execution-surface maps if the rule registry requires them.

Source files expected to be deleted:

- The six root `contract.ts` files listed above, after import proof.
- `mods/mod-swooper-maps/src/domain/ecology/ops/score-shared/index.ts`
- `mods/mod-swooper-maps/src/domain/hydrology/ops/shared/wind-field.ts`
- `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared/config.ts`
- `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared/rules.ts`
- `mods/mod-swooper-maps/src/domain/morphology/ops/mountains-shared/rules/**`
- Empty `shared/`, `score-shared/`, and `mountains-shared/` folders after file
  moves.

Source files expected to be moved or rewritten by the disposition law:

- The six root helper files listed above.
- The four root `shared/` folders listed above.
- The three immediate `ops/` non-op folders listed above.
- `packages/civ7-map-policy/src/catalogs/feature-placement.ts`
- `packages/civ7-map-policy/src/catalogs/feature-legality.ts`
- `packages/civ7-map-policy/src/index.ts`
- `packages/mapgen-core/src/lib/grid/validation.ts`
- `packages/mapgen-core/src/lib/grid/distance/mask.ts`
- `packages/mapgen-core/src/lib/grid/local-extrema.ts`
- `packages/mapgen-core/src/lib/math/range.ts`
- `packages/mapgen-core/src/lib/math/clamp.ts` only if the public export surface
  requires a naming addition; otherwise only imports change to existing
  `clamp01` and `clampU8`.
- `mods/mod-swooper-maps/src/domain/ecology/policy/biome-vocabulary.ts`
- `mods/mod-swooper-maps/src/domain/ecology/policy/feature-engine-legality.ts`
- `mods/mod-swooper-maps/src/domain/ecology/policy/plot-effects.ts`
- `mods/mod-swooper-maps/src/domain/ecology/policy/physical-candidate-selection.ts`
- `mods/mod-swooper-maps/src/domain/ecology/artifacts/contract/feature-intent-placement.contract.ts`
- `mods/mod-swooper-maps/src/domain/foundation/config.ts`
- `mods/mod-swooper-maps/src/domain/foundation/policy/boundary-type.ts`
- `mods/mod-swooper-maps/src/domain/hydrology/config.ts`
- `mods/mod-swooper-maps/src/domain/hydrology/policy/river-class.ts`
- `mods/mod-swooper-maps/src/domain/hydrology/policy/river-network-metrics.ts`
- `mods/mod-swooper-maps/src/domain/hydrology/artifacts/contract/wind-field.contract.ts`
- `mods/mod-swooper-maps/src/domain/morphology/config.ts`
- `mods/mod-swooper-maps/src/domain/morphology/policy/boundary-regime.ts`
- `mods/mod-swooper-maps/src/domain/morphology/policy/orogenic-potential.ts`
- `mods/mod-swooper-maps/src/domain/morphology/policy/mountain-score.ts`
- `mods/mod-swooper-maps/src/domain/morphology/policy/hill-score.ts`
- `mods/mod-swooper-maps/src/domain/morphology/policy/driver-strength.ts`
- `mods/mod-swooper-maps/src/domain/morphology/policy/terrain-score-encoding.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-ecology/biome-bindings.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/map-rivers/config.ts`
- `mods/mod-swooper-maps/src/recipes/standard/stages/morphology-features/mountain-ranges-public-config.ts`

Source files expected not to change in this domino:

- Files below valid `ops/<registered-op-id>/` folders except when they import
  moved red-path modules.
- Files below valid `policy/`, `lib/`, or `artifacts/contract/` slots except
  for import updates caused by moved red-path modules.
- Recipe, stage, step, adapter, and generated output files outside the exact
  stage paths named above unless a moved public import path requires a narrow
  import update.
- `mods/mod-swooper-maps/src/domain/narrative/**`; the Gameplay absorption
  domino owns it.

### Agent Lanes

#### Sagan: Investigation Design Lane

Purpose: audit the locked disposition law before implementation.

Prompt:

```text
You are Sagan. Run the investigation design lane for Domino 001:
Domain Root And Immediate Ops Topology.

Read:
- .habitat/workstreams/domain-closed-structure-working-document.md
- .habitat/workstreams/domain-closed-structure-dominoes/001-domain-root-immediate-ops-topology.md
- .habitat/frames/CLOSED-STRUCTURE-ENFORCEMENT-METHOD-FRAME.md
- docs/projects/engine-refactor-v1/architecture-normalization-packet.md
- docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md
- docs/projects/engine-refactor-v1/resources/spec/SPEC-packaging-and-file-structure.md
- docs/system/libs/mapgen/policies/IMPORTS.md

Do not edit files.

Return findings only. Check whether every enforced red path has exactly one
state (`Execute`, `Execute with sublaw`, or `Excluded`), a move class, and a
legal destination. For each defect, include the path, the missing or wrong
classification, the authority evidence, and the exact correction.

Use current source as evidence, not authority. Do not create a generic
semantics.ts, shared/, utils/, support/, common/, or public/ destination.
Use the Domino 001 Disposition Law table as the decision book.
```

#### Maxwell: Systematic Workstream Lane

Purpose: turn the selected law into a mechanical implementation and proof plan.

Prompt:

```text
You are Maxwell. Run the systematic workstream lane for Domino 001:
Domain Root And Immediate Ops Topology.

Read:
- .habitat/workstreams/domain-closed-structure-working-document.md
- .habitat/workstreams/domain-closed-structure-dominoes/001-domain-root-immediate-ops-topology.md
- .habitat/frames/CLOSED-STRUCTURE-ENFORCEMENT-METHOD-FRAME.md
- .habitat/AUTHORITY-TOOL-SEPARATION.md
- .habitat/README.md
- existing .habitat/blueprints/domain/**/rule.json
- existing .habitat/blueprints/domain/**/structure.toml

Do not edit files.

Return findings only. Check whether the named rule packets, rule ids,
red/green commands, generated-file expectations, packet dispositions, and
closure proof below are sufficient for mechanical execution. If a part is not
sufficient, return the exact correction.

Do not propose a new reporting layer, a custom harness, or a source parser
inside structure.toml enforcement.
```

### Execution Gate

The steward can start implementation when both lanes have returned:

- every enforced red path has state `Execute`, `Execute with sublaw`, or
  `Excluded`;
- the Habitat rule packet owner is
  `enforce_domain_root_immediate_ops_topology`;
- the Grit/content rule packet owner is
  `require_domain_root_index_contract_surface`;
- generated Habitat maps are identified;
- overlapping rule packets have an initial absorbed/deleted/retained
  disposition.

### Verification Plan

- Run `bun habitat check --rule enforce_domain_root_immediate_ops_topology --json`
  red before source burn-down.
- Burn down red paths according to accepted dispositions.
- Rerun `bun habitat check --rule enforce_domain_root_immediate_ops_topology --json`
  green.
- Run `bun habitat check --rule require_domain_root_index_contract_surface --json`.
- Run `bun run --cwd packages/civ7-map-policy check`.
- Run `bun run --cwd packages/mapgen-core check`.
- Run `bun run --cwd mods/mod-swooper-maps lint`.
- Run `bun run --cwd mods/mod-swooper-maps verify`.
- Run `bun habitat classify .habitat`.
- Run `bun run --cwd tools/habitat check`.
- Run `git diff --check`.

### Rule Packet Collapse Candidates

Absorbed or deleted after live enforcement:

- `prohibit_domain_entrypoint_self_reexports`
- `prohibit_domain_artifacts_modules`
- `prohibit_retired_domain_root_catalogs`

Retained or narrowed:

- `require_public_domain_surfaces_in_recipes_and_maps`
- `require_public_domain_surfaces_in_tests`
- `prohibit_recipe_imports_in_domain_source`
- `prohibit_unknown_bag_config_usage`

No rule packet is deleted until scan-root and failure-condition parity are
shown against the new gate.
