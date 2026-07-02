# Domain Closed Structure Working Document

Status: active working document

Built: 2026-07-02

Owner: Habitat authority-tree workstream steward

Related frame: `.habitat/frames/CLOSED-STRUCTURE-ENFORCEMENT-METHOD-FRAME.md`

Standalone dominoes: `.habitat/workstreams/domain-closed-structure-dominoes/`

## Purpose

This document is the working surface for the first closed-structure cutover for
the MapGen `domain` kind.

It is normative: it names the structure that must be true, records the metrics
that made that structure visible, and marks everything outside the structure red
until it is moved, deleted, renamed, or admitted by explicit architecture law.
It is not a queue, not a ledger, and not a new reporting layer.

## Authority Validation

Controlling sources:

- Direct user law: do not create more reporting layers; choose one concrete
  structure, enforce it, burn down the mismatches.
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`:
  domains own pure algorithms, contract-first ops, strategies, rules, domain
  types, and reusable domain semantics; steps own orchestration; stages own
  authoring/config; recipes own ordering.
- `docs/projects/engine-refactor-v1/resources/spec/SPEC-step-domain-operation-modules.md`:
  canonical domain layout is domain root `index.ts` plus operation modules under
  `ops/<op-id>/`; operation contracts live in op-local `contract.ts`.
- `docs/projects/engine-refactor-v1/resources/spec/SPEC-packaging-and-file-structure.md`:
  domain libraries are recipe-independent, imported by recipes/maps, and must
  not import recipes or maps; shared config fragments live with closest real
  owner.
- `docs/system/libs/mapgen/policies/IMPORTS.md`: standard recipe imports use
  named domain surfaces only: domain root, `/ops`, and `/config.js`.
- `civ7-architecture-authority` ownership boundaries: `shared`, `common`,
  `utils`, `internal`, `support`, and broad barrels are not owners.

Independent review inputs:

- Architecture review confirmed that `contract` is a boundary role, not a
  mandate for domain-root `contract.ts`; op-level `contract.ts` remains
  canonical.
- Frame review found the prior allow-list too permissive: `public/`, `shared/`,
  broad `lib/`, and broad `artifacts/` preserved dumping-ground slots.
- Live-source review found that recipe and map consumers already obey
  the three public surfaces. The disorder is inside domain roots and domain
  internals.

## Selected Kind

Kind: `domain`.

Current instance folders:

- `ecology`
- `foundation`
- `hydrology`
- `morphology`
- `narrative`
- `placement`
- `resources`

Target-domain caveat: canonical docs treat `foundation`, `morphology`,
`hydrology`, `ecology`, and target `gameplay` as the durable domain set.
`placement` is a legacy Gameplay phase name and `narrative` is legacy naming
absorbed into Gameplay. The closed grammar must not freeze legacy folders as
permanent ontology.

Exterior for this run:

- broad operation topology cleanup below `ops/<op-id>/`;
- recipe/stage/step file topology;
- adapter/runtime package boundaries;
- generic helper cleanup outside the domain grammar.

## Current Recommendation

Assert a closed slot grammar for MapGen domain roots:

```text
A domain root is not a permissive feature folder. It has exactly the public
surfaces and named capability slots the architecture recognizes. Publicness is
controlled by root exports, not by a `public/` directory. Support code lives at
the nearest real owner, not in `shared/`, `utils/`, or broad `lib/`.
```

The first enforcement slice should make the domain root red for:

- domain-root `contract.ts`;
- `public/`;
- `shared/`;
- arbitrary root helper files;
- arbitrary root capability folders;
- broad `artifacts/` contents outside `artifacts/contract/`;
- `ops/shared`, `ops/*-shared`, and other non-op folders under `ops/`.

This is not a forbids-first strategy. The law is positive and closed:
`domain` has only the slots named by the grammar. The current tree happens to
surface that law as negative failures because legacy folders and duplicate files
occupy unnamed slots. A `structure.toml` implementation may encode explicit
forbidden names where the runner needs clear failure messages, but those forbids
are only the teeth of the allow-list. They are not the architecture.

## Operating Frame

The unit of work is one normative entry at a time. A normative entry is the law
we are asserting; a rule packet is only the enforcement artifact when that law
maps cleanly to one proof surface.

The loop for each entry is the closed-structure burn-down geometry:

```text
Assess -> Design structure -> Analyze red -> Investigate change classes ->
Lock in -> Design fan-out -> Implement -> Review -> Polish and realign
```

- Assess: select one architecture-backed kind and name the authority source.
- Design structure: state the positive closed structure.
- Analyze red: read the current tree against that structure.
- Investigate change classes: classify displaced files and symbols by owner
  move, not by current folder.
- Lock in: write the structure clauses, file-shape gates, allowed move classes,
  and exclusions before implementation starts.
- Design fan-out: split rows across agents only after the decision book exists.
- Implement: move, delete, or rewrite red paths.
- Review: verify red/green gates, import safety, proof sufficiency, and packet
  overlap.
- Polish and realign: remove stale overlap, update touched authority docs, and
  close the stack cleanly.

Entries are the unit of architectural intent. Rule packets are implementation
artifacts. The mapping can be one entry to one structure rule, one entry to one
Grit rule, one entry to structure plus Grit, several entries to one consolidated
packet when they share the same proof class, or one entry to no packet when
existing source architecture already enforces it.

For this domain run, structure enforcement and content/shape enforcement stay
separate:

- `structure.toml` owns filesystem topology only: required slots, optional
  slots, closed child sets, and retired/unnamed slots.
- Grit/GritQL owns source shape: `defineDomain(...)`, import/export shape,
  `createDomain(...)`, and logic-smuggling checks.
- Package-local validators or tests own claims that require semantic execution.
- Narsil is discovery and verification evidence, not an enforcement layer.

The first selected entry is `Domain Root Contract Surface`. Its structural
slice is a closed allow-list for the domain root plus immediate `ops/` children.
Its content slice is the root `index.ts` shape. The first burn-down target is
duplicate root `contract.ts` because it has no accepted architecture slot and no
live consumers.

This frame is not enough if it only says which filenames are legal. Each legal
slot also needs a content shape before agents move code into it. The second
order analysis for each domino is therefore:

1. Name the legal slots for the slice.
2. Compare the existing instances of those slots.
3. Name what each slot must contain and must not contain.
4. Classify displaced content by destination class before moving it.

For Domino 001, that means root `index.ts` must be enforced with Grit in
addition to the topology gate. `index.ts` is the domain contract and public
surface. It must not become the file where displaced root helpers are pasted.
Any extra public export from `index.ts` must point at an accepted destination
slot whose own content law has been named.

## Change Classes

These are the reusable operations agents may use after a domino has locked its
structure and red-path inventory. Agents classify into this list before editing.
They do not invent storage buckets during implementation.

| Class | Use When | Owner Destination |
| --- | --- | --- |
| Duplicate authority deletion | A file repeats a stronger domain root, op contract, or registry surface. | Delete after import proof. |
| Domain vocabulary/policy promotion | Cross-op constants, classifiers, official-game compatibility policy, or domain semantic names must remain domain-owned. | `<domain>/policy/<concern>.ts`; re-export from `index.ts` only when public. |
| Domain config consolidation | Stage-facing schemas, config types, defaults, and deterministic compile transforms belong to the domain config surface. | `<domain>/config.ts` or a config-owned side module re-exported by it. |
| Artifact contract extraction | A schema defines a pipeline truth product consumed across ops/stages. | `<domain>/artifacts/contract/<artifact>.contract.ts`. |
| Op-local implementation move | A rule, validator, scoring helper, or type exists only for one op. | `ops/<op-id>/rules/`, `ops/<op-id>/policy/`, or `ops/<op-id>/types.ts`. |
| Operation-family decomposition | A non-op folder under `ops/` mixes config, policy, helper math, and op-local rules. | Split every export into one of the locked classes; never preserve the family folder. |
| Core mechanics extraction | Pure map/grid/math mechanics are cross-domain and independent of Civ7 or mod policy. | `packages/mapgen-core/src/lib/**`; requires an explicit core-owner sublaw in the domino that performs it. |
| Official Civ7 policy/resource ownership | Derived official game tables, legality data, resource facts, and map-policy facts belong to a reusable Civ7 policy owner rather than a domain workaround. | `@civ7/map-policy` or its accepted repo-local equivalent, not `packages/civ7-types`. |
| Projection/stage ownership move | A value binds pure domain truth to engine globals, recipe stage projection, or map materialization. | Owning stage/step projection file under `recipes/standard/stages/**`. |
| Civ7 adapter ownership move | Code imports or wraps engine runtime globals or `base-standard` APIs. | `packages/civ7-adapter/**` or explicit mod runtime integration. |
| Civ7 types ownership move | Ambient Civ7 runtime declarations or engine global types are missing or misplaced. | `packages/civ7-types/**`; not MapGen behavior or policy. |
| Gameplay absorption | Legacy narrative/placement/gameplay material defines motifs, overlays, gameplay plans, or map-facing intent rather than physics-domain truth. | A selected Gameplay domino; excluded from domain-root topology burn-down until that law exists. |
| No replacement | The symbol has no live consumer or repeats a stronger owner. | Delete. |

The companion shape classes are fixed:

- `index.ts`: domain contract and intentional public exports only.
- `ops.ts`: `createDomain(...)` binding only.
- `config.ts`: config schemas, config types, defaults, and deterministic
  compile transforms only.
- `policy/<concern>.ts`: one named cross-op policy/vocabulary concern.
- `lib/<concern>/...`: data, corpus, derivation, or proof material, not
  algorithm storage.
- `artifacts/contract/<artifact>.contract.ts`: one artifact contract per file.
- `ops/<op-id>/...`: op-local contracts, strategies, rules, types, and policy.

## Repeatable Inventory Automation

These are the current commands for re-running the overlap and source-shape
inventory. They are commands, not a new reporting layer. Run them from the repo
root of the Habitat authority worktree.

Rule overlap inventory for the selected blueprint:

```bash
jq -r '[.id, .placement.blueprint, .placement.category, .placement.niche, .runner.name, (.runner.mode // ""), ((.scanRoots // []) | join(";")), ((.pathCoverage // []) | map(.patterns[]?) | join(";"))] | @tsv' \
  .habitat/blueprints/domain/*/rule.json \
  | column -t -s $'\t'
```

Rule category counts for the selected blueprint:

```bash
jq -r '.placement.category' .habitat/blueprints/domain/*/rule.json \
  | sort \
  | uniq -c
```

Domain-root direct-child inventory:

```bash
for d in mods/mod-swooper-maps/src/domain/*; do
  [ -d "$d" ] || continue
  printf "%s\t" "${d##*/}"
  find "$d" -mindepth 1 -maxdepth 1 -exec basename {} \; | sort | paste -sd, -
done
```

Registered operations versus actual immediate `ops/` child folders:

```bash
for f in mods/mod-swooper-maps/src/domain/*/ops/contracts.ts; do
  domain="${f#mods/mod-swooper-maps/src/domain/}"
  domain="${domain%%/*}"
  ops_dir="${f%/contracts.ts}"
  registered="$(rg -c '^  [a-zA-Z0-9]+:' "$f" || true)"
  children="$(find "$ops_dir" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')"
  printf "%s\tregistered=%s\tchildren=%s\n" "$domain" "$registered" "$children"
done
```

Root `index.ts`, `ops.ts`, and `config.ts` shape scan:

```bash
rg -n --glob 'mods/mod-swooper-maps/src/domain/*/{index,ops,config}.ts' \
  'defineDomain|createDomain|^import |^export ' \
  mods/mod-swooper-maps/src/domain
```

Red-path consumer scan for Domino 001:

```bash
for p in \
  mods/mod-swooper-maps/src/domain/ecology/{types,biome-bindings,feature-engine-legality}.ts \
  mods/mod-swooper-maps/src/domain/foundation/constants.ts \
  mods/mod-swooper-maps/src/domain/hydrology/{river-class,river-network-metrics}.ts
do
  [ -f "$p" ] || continue
  stem="${p##*/}"
  stem="${stem%.ts}"
  printf '\n### %s\n' "$p"
  rg -n "from [\"'].*${stem}\.js[\"']|@mapgen/domain/.*/${stem}\.js" \
    mods/mod-swooper-maps/src --glob '*.ts' || true
done
```

Once the `index.ts` content gate is registered, the proof command should be:

```bash
bun habitat check --rule require_domain_root_index_contract_surface --json
```

## Metrics

Observed with Grit and source analysis:

- `7/7` domain roots match `defineDomain(...)` in `index.ts`.
- `7/7` domain runtime modules match `createDomain(...)` in `ops.ts`.
- `7/7` domain roots are exported from `mods/mod-swooper-maps/src/domain/index.ts`.
- Registered op counts from `ops/contracts.ts`: ecology `34`, foundation `18`,
  hydrology `19`, morphology `19`, narrative `0`, placement `3`, resources `8`
  (`109` registered ops total).
- Top-level directories under `ops/` total ecology `35`, foundation `18`,
  hydrology `20`, morphology `20`, narrative `0`, placement `3`, resources `8`.
  The three-count delta is structural debt: `score-shared`, `shared`, and
  `mountains-shared` are not registered operations.
- Recipe assembly imports `/ops` for active domains only; narrative is absent.
- Step contracts import domain roots to access op contracts (`30` source step or
  artifact contract imports from domain roots in `recipes/standard/stages`).
- Stage indexes and runtime steps import per-domain `config.ts` facades for
  knobs and compile-time transforms (`37` source imports from
  `@mapgen/domain/<domain>/config.js` in `recipes/standard/stages`).
- Maps do not need direct domain access except one type-inference test.

Observed with Narsil after moving the primary checkout to the stack head and
querying the reindexed source tree:

- Symbol/reference search resolved the MapGen core authoring owners:
  `defineDomain` in `packages/mapgen-core/src/authoring/domain.ts` and the
  `authoring/contracts` re-export, `createDomain` in `authoring/domain.ts`,
  `collectCompileOps` in `authoring/bindings.ts`, and `createRecipe` in
  `authoring/recipe.ts`.
- `defineDomain` references show both the intended root `index.ts` domain
  declarations and six duplicate root `contract.ts` declarations. The duplicate
  files are source evidence of drift, not an alternate architecture slot.
- `createDomain` references in live mod source are exactly the seven root
  `<domain>/ops.ts` files. This confirms `/ops` is the domain runtime/compile
  binding entrypoint, not a general public barrel.
- Narsil chunks show `createDomain(...)` returns `{ contract, ops }`, where
  `ops` is a `DomainOpsSurface` with compile and runtime registries.
- Narsil chunks show `collectCompileOps(...)` merges each domain
  `ops._compileRegistry`; `createRecipe(...)` derives runtime ops from
  `compileOpsById`, binds step contract ops in `finalizeOccurrences(...)`, and
  passes `compileOpsById` into `compileRecipeConfig(...)`.
- Narsil dependency analysis of `recipes/standard/recipe.ts` confirms the recipe
  composes the six active domain `/ops` modules plus the ordered standard stage
  list. The recipe does not import root domain `contract.ts`.
- The server reports call graph enabled but `get_call_graph` returned
  "Call graph not available" for this repo. This document therefore uses
  Narsil symbols, references, chunks, dependencies, and import graph, not
  call-path claims.

Observed root disorder:

- `6/7` domains have root `contract.ts`; no external consumers import it.
- Root `domain/config.ts` has no current consumers.
- `ops.ts` is runtime-only except morphology also exports config schemas
  and constants from `/ops`.
- Current root helper files include `types.ts`, `constants.ts`,
  `biome-bindings.ts`, `feature-engine-legality.ts`, `river-class.ts`,
  `river-network-metrics.ts`, and `models.ts`.
- Current root folders include `shared`, `lib`, `policy`, `artifacts`,
  `corridors`, `orogeny`, `overlays`, `tagging`, and `utils`.

Representation/design pressure:

- The architecture is scale-continuous in structure: domain -> op -> strategy
  repeats the same pattern of explicit contract, typed data, pure compute, and
  named projection boundary.
- Scale-invariant does not mean every domain has identical semantics. It means
  each domain exposes the same kind of boundary regardless of whether its truth
  is mesh-space, tile-space, climate fields, ecological suitability, or
  gameplay plans.
- Truth/projection separation is the representation law: physics domains publish
  engine-agnostic truth; Gameplay/map projection owns engine-facing ids,
  adapter writes, readbacks, and projection artifacts.

## Normative Entries

### Entry 1: Domain Root Contract Surface

Metric: `index.ts` is the live resolver for `@mapgen/domain/<domain>` and all
domains define `defineDomain(...)` there.

Interpretation: root `index.ts` is the domain's thin public contract and export
face. This does not make `index.ts` a dumping-ground barrel.

Normative law: domain-root `index.ts` is allowed and required. Domain-root
`contract.ts` is not allowed. Operation `contract.ts` remains canonical.

Action: delete/absorb root `contract.ts`; preserve op-local contract files.

### Entry 2: Runtime Domain Surface

Metric: recipe assembly imports `/ops` for active domains. Narsil shows
`createDomain(...)` builds a `DomainOpsSurface`; `collectCompileOps(...)` reads
its compile registry; `createRecipe(...)` derives runtime op bindings from the
compiled registry.

Interpretation: `ops.ts` is a real compile/runtime binding module, not a helper
or public convenience barrel.

Normative law: root `ops.ts` is required and must only create the domain binding
surface from the root domain contract and op implementations. It may not export
stage config schemas, constants, rule helpers, or op-family support modules.

Action: remove morphology's config-schema exports from `ops.ts`; move them to
`config.ts` or their owning op/stage surface.

### Entry 3: Config Surface

Metric: per-domain `config.ts` is actively consumed by stages and steps;
root `domain/config.ts` is not.

Interpretation: per-domain config facades are legitimate when they expose
schema/type-only authoring fragments or deterministic compile-time transforms
used by stages. A root config barrel is only legitimate if it has real
cross-domain consumers.

Normative law: `<domain>/config.ts` is optional but allowed. Root
`domain/config.ts` is optional and should be deleted unless it becomes a
schema/type-only cross-domain facade with active consumers.

Action: keep current per-domain config facades; mark root `domain/config.ts`
for deletion unless a consumer appears before enforcement.

### Entry 4: No `public/`

Metric: consumers already use root, `/ops`, or `/config.js`; no consumer needs a
`public/` path.

Interpretation: `public/` would encode visibility as a folder and become a
generic expansion slot.

Normative law: no `public/` directory. Publicness is controlled only by explicit
exports from `index.ts`, `ops.ts`, or `config.ts`.

Action: route each public helper to a semantic owner; re-export only when it is
intentionally part of the domain contract.

### Entry 5: No `shared/`, No `utils/`

Metric: `shared/` currently holds knob schemas and multipliers; `utils/` exists
under legacy narrative.

Interpretation: these names describe convenience, not ownership.

Normative law: no domain-root `shared/`, `utils/`, `common/`, `internal/`, or
`support/`. A value shared across stages belongs in `config.ts`, op-local
`rules/`, domain `policy/`, domain data-only `lib/`, an artifact contract, an
owning stage/step surface, or core SDK utilities.

Action: move shared knob schemas and multipliers into `config.ts` or
config-owned side modules; move cross-cutting math/grid/RNG helpers to core SDK
if they are truly general.

### Entry 6: Narrow Data, Policy, And Artifact Slots

Metric: resources already has `policy/`, `lib/`, and `artifacts/contract/`;
ownership docs explicitly recognize those shapes.

Interpretation: these slots are valid only when their contents are narrow.

Normative law:

- `policy/` is domain-level cross-op policy, one concern per file.
- `lib/` is data/corpus/derivation/proof material only, not algorithms.
- `artifacts/contract/` is artifact contracts only, one artifact per file.

Action: allow those slots with content restrictions; reject broad `artifacts/`
and broad implementation `lib/`.

### Entry 7: Operation Shape Repeats The Domain Shape

Metric: operation modules are the step-callable contract units; current
operation helper folders include `ops/shared`, `ops/mountains-shared`, and
`ops/score-shared`.

Interpretation: the same scale-invariant law applies one level down. A folder
under `ops/` is either an operation id or an explicitly op-local slot.

Normative law: under `ops/`, `contracts.ts`, `index.ts`, and `<op-id>/` are
allowed. Shared operation support must move into the op that owns it, into an
op-family extracted as a real op, or into core SDK if it is cross-domain utility.

Action: do not bless `ops/shared` or `ops/*-shared` as permanent topology.

## Closed Slot Grammar

The right shape is closed, slot-based, and allowless. A slot exists only because
the architecture names its role.

```text
mods/mod-swooper-maps/src/domain/
  index.ts
    # What: aggregate barrel for known domain instances only.
    # Called by: rare package-local domain aggregation; not recipe runtime.
    # Role: export-only barrel.
    # System map: content package domain catalog, not architecture authority.

  config.ts?
    # What: schema/type-only cross-domain config fragments, if real consumers exist.
    # Called by: stages/steps needing cross-domain config fragments.
    # Role: optional export-only facade; no runtime config object.
    # System map: authoring surface support, not pipeline truth.

  <domain>/
    # What: one cohesive domain owner: Foundation, Morphology, Hydrology, Ecology,
    #       Resources, or target Gameplay; legacy Placement/Narrative are transitional.
    # Called by: recipes/stages/steps/maps through named surfaces only.
    # Role: domain owner boundary.
    # System map: pure recipe-independent content logic.

    index.ts
      # What: defineDomain(...) plus explicit public semantic exports.
      # Called by: step contracts and selected projection/placement code via
      #            @mapgen/domain/<domain>.
      # Role: domain contract and public export face; thin, explicit.
      # System map: operation contract surface for recipe authoring.

    ops.ts
      # What: createDomain(domain, implementations).
      # Called by: recipe compile/runtime op assembly through collectCompileOps.
      # Role: compile/runtime binding entry point.
      # System map: exposes pure domain op registries to recipe config
      #             compilation and executable recipe runtime.

    config.ts?
      # What: domain-owned knob schemas, schema types, and deterministic
      #       compile-time transforms used by stages.
      # Called by: stage indexes, step normalize/config code.
      # Role: recipe-facing config facade.
      # System map: stage authoring surface support; no hidden runtime config.

    ops/
      # What: operation contract registry plus operation modules.
      # Called by: domain root, runtime ops surface, and step contracts.
      # Role: operation-family container.
      # System map: pure compute/plan/select domain logic.

      contracts.ts
        # What: registry of op contracts for this domain.
        # Called by: domain root `index.ts`.
        # Role: contract registry.
        # System map: compile-time domain surface for steps.

      index.ts
        # What: registry of op implementations satisfying the contracts registry.
        # Called by: root `ops.ts`.
        # Role: implementation registry.
        # System map: runtime binding surface for recipe execution.

      <op-id>/
        # What: one operation, verb-forward and action-specific.
        # Called by: steps through the domain op surface.
        # Role: step-callable pure operation boundary.
        # System map: smallest reusable/testable domain algorithm unit.

        contract.ts
          # What: defineOp({ kind, id, input, output, strategies }).
          # Called by: op implementation, types.ts, contracts registry, step schemas.
          # Role: operation contract.
          # System map: typed truth/plan/score/select boundary.

        index.ts
          # What: createOp(contract, { strategies, customValidate? }).
          # Called by: ops implementation registry.
          # Role: operation runtime export.
          # System map: connects contract to pure strategies.

        types.ts?
          # What: OpTypeBag-derived type aliases and narrow convenience types.
          # Called by: op-local rules/strategies and tests.
          # Role: type-only surface.
          # System map: keeps contracts typed without leaking rule internals.

        strategies/
          # What: strategy implementations preserving the op input/output contract.
          # Called by: op `index.ts`.
          # Role: algorithm variants.
          # System map: controlled variability, selected by op config envelope.

          index.ts
            # What: explicit strategy exports for this op.
            # Called by: op `index.ts`.
            # Role: export-only barrel.
            # System map: local strategy assembly.

          <strategy>.ts
            # What: createStrategy(contract, strategyId, { run, normalize? }).
            # Called by: strategies/index.ts.
            # Role: pure algorithm implementation.
            # System map: domain behavior variant with stable I/O.

        rules/
          # What: op-local pure heuristics, scoring helpers, validators.
          # Called by: strategies within the same op.
          # Role: internal implementation.
          # System map: local logic; never a public or step-callable surface.

          index.ts
            # What: explicit rule exports for this op only.
            # Called by: op-local strategies.
            # Role: local export-only barrel.
            # System map: prevents cross-op rule leakage.

          <rule>.ts
            # What: one pure heuristic/check/scoring decision.
            # Called by: op-local strategies/rules.
            # Role: internal implementation.
            # System map: local algorithm detail.

        policy/?
          # What: op-owned policy concerns used only by this op.
          # Called by: this op's strategies/rules.
          # Role: internal policy implementation.
          # System map: policy that is too narrow for domain-level `policy/`.

    policy/?
      # What: domain-level cross-op policy, one concern per file.
      # Called by: multiple ops in this domain; root exports only if public.
      # Role: domain policy owner.
      # System map: official/game/repo policy translated into pure domain rules.

      <concern>.ts
        # What: one named policy concern.
        # Called by: domain ops or stage code through intentional root export.
        # Role: policy module.
        # System map: prevents policy from hiding in strategies or helpers.

    lib/?
      # What: reference data, official corpus derivations, runtime-id proofs,
      #       earthlike expectation tables.
      # Called by: domain ops/policy; root exports only when public contract data.
      # Role: data and derivation substrate; not algorithms.
      # System map: evidence/corpus layer supporting deterministic planning.

      <corpus-or-derivation>.ts
        # What: one data/proof/derivation concern.
        # Called by: policy or ops.
        # Role: data module.
        # System map: keeps data separate from executable strategy logic.

    artifacts/
      # What: artifact contract namespace only.
      # Called by: stages/steps that publish or consume domain-owned artifacts.
      # Role: artifact contract owner, not a general artifact helper folder.
      # System map: typed pipeline truth/projection dependency surface.

      contract/
        # What: one-file-per-artifact contract modules.
        # Called by: stage artifact assemblers and step contracts.
        # Role: artifact contract collection.
        # System map: explicit data-flow boundary.

        <artifact>.contract.ts
          # What: one defineArtifact contract plus schema/validator if needed.
          # Called by: artifact assemblers and step contracts.
          # Role: artifact contract.
          # System map: named pipeline product.
```

Not admitted:

- `public/`: visibility is controlled by exports, not folders.
- `shared/`, `utils/`, `common/`, `internal/`, `support/`: these are not owners.
- domain-root `contract.ts`: duplicate root contract owner.
- domain-root arbitrary helpers such as `types.ts`, `models.ts`,
  `river-class.ts`, `river-network-metrics.ts`, `feature-engine-legality.ts`,
  or `biome-bindings.ts`.
- broad `artifacts/` contents outside `artifacts/contract/`.
- non-op folders directly under `ops/`, including `shared`, `score-shared`, and
  `mountains-shared`.

## Standalone Dominoes

Domino-specific execution detail lives in
`.habitat/workstreams/domain-closed-structure-dominoes/`.

Current standalone domino:

- `001-domain-root-immediate-ops-topology.md`: closes each domain root and each
  immediate `ops/` child set, owns the exact red-path inventory, records the
  per-domino agent lanes, and carries the implementation/write-set planning for
  the first cutover.

The aggregate document keeps the domain-wide frame, authority validation,
metrics, normative entries, and closed grammar. A domino document owns the
iteration-specific red paths, decisions, expected changed files, prompts,
verification plan, and rule-packet collapse candidates.
