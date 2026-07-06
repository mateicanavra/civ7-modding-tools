# Blueprint Descent Roadmap

Status: living selection-state record

Built: 2026-07-06

Owner: DRA Habitat authority-tree workstream steward

Purpose:
hold the cross-descent view of the blueprint authority initiative: which
descents have closed, which is selected, and which are queued with what
evidence. This is the one document that shows the whole burn-down at
blueprint-kind altitude.

What this document is not:
it is not law and not a method frame. Method geometry is owned by
`.habitat/.active/frames/BLUEPRINT-AUTHORITY-RATCHET-DESCENT-FRAME.md`. Each
opened descent owns its concrete HOW in its own workstream. Queue order beyond
the selected descent is selection pressure, not commitment: every ascent
re-runs selection against the tree as it exists then, and this document is
updated to match.

Maintenance rule:
update this roadmap at every descent closure and ascent, and whenever a
readiness slice changes a queue entry's inputs. If two closures pass without an
update, treat this document as stale and rebuild it from receipts before using
it for selection.

## Current Position

- Descent 1 (domain root) is closed. Survivor law:
  `.habitat/blueprints/domain/require_domain_source_topology/`. Closure
  receipt:
  `.habitat/.active/workstreams/remediate-rule-authority/receipts/domain-source-topology-ratchet-closure.md`.
- The runway to the next descent is owned by
  `.habitat/.active/workstreams/remediate-rule-authority/pre-descent-readiness-plan.md`
  (R1 helper consolidation, R2 config-facade consolidation, R3 aggregate check
  runnability, R4 stale-blocker record refresh).
- Descent 2 (domain-operation interior) is selected. Opening packet:
  `.habitat/.active/workstreams/descend-002-domain-operation-interior/`.
  Execution is gated on readiness slices R2, R3, R4.

Live rule corpus at this writing: 112 rules. Each descent should reduce that
number by absorbing negative guards into positive law; a descent that closes
without shrinking the rule surface owes an explicit explanation in its receipt.

## Descent Queue

| # | Descent | Subject | Expected law surfaces | Rules expected to retire or absorb | Decision density | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Domain root | `src/domain/<domain>/` root + immediate `ops/` topology | `require_domain_source_topology` structure scopes | 2 deleted at closure | closed via prework decisions 001-003 | closed |
| 2 | Domain-operation interior | `ops/<op>/` support surfaces: `strategies/`, `rules/`, `policy/` internals, strategy import law, contract metadata owner | operation scope tree under `.habitat/scopes/domain/scopes/ops/scopes/operation/**`, enforced via the domain-operation blueprint | up to 5: `require_ecology_canonical_op_module_topology`, `prohibit_domain_artifacts_modules`, `prohibit_foundation_strategy_nonlocal_imports`, `prohibit_foundation_rules_tectonics_shim_reexports`, `validate_ecology_op_contract_quality` (split) | 4 decision packets | selected; opening |
| 3 | Domain model interior | `model/schemas`, `model/policy`, `model/data` internals | model subscope file grammars | unknown-bag/config residue candidates | low; Decision 003 sealed most semantics | queued |
| 4 | Recipes and stages | `src/recipes/standard/` root grammar, 25 stage shapes, `steps/` internals, truth/projection seam | recipe root scope, recipe-stage scope tree, source-owned step-contract and projection surfaces | `prohibit_map_projection_dependencies_in_physics_contracts` (blocked slice unblocks here), `prohibit_foundation_step_contract_config_bags`, stage cast/sentinel rows | highest in queue: stage-kind meaning, projection namespace, `@mapgen/domain/config.js` gap | queued |
| 5 | Mod-map closure | generated map entrypoints, shipped catalog root shape | mod-map blueprint root grammar | protective trio consolidates | low | queued |
| 6 | Structural test-debt migration | package tests asserting topology/file shape (domino 093) | Habitat rules/patterns replacing structural tests | test-file scan blocker for `require_public_domain_surfaces_in_tests` resolves here | medium; gated on toolkit test-file scan capability | queued |
| 7 | Toolkit and workspace self-law | `.habitat` service modules, non-Civ lanes, Biome rail relation | habitat-toolkit blueprint surfaces | 16 non-Civ lane rows classified | low-medium | queued |
| 8 | Aggregate green gate | whole-corpus proof | one aggregate command, one light | rule count visibly reduced across descents | none; proof only | end state |

## Queue Rationale And Epistemics

Descent 2 before anything else:
the residual rule cluster already points there (the ledger's
`domain-operation source-owner design blocker`), the terrain is uniform (101
operation roots share one depth-1 grammar, already enforced), and the scope
law is largely drafted under
`.habitat/scopes/domain/scopes/ops/scopes/operation/`. It has the highest
law-per-decision ratio available: four decisions close the interior of every
operation in the product.

Known knowns for descent 2: terrain censuses (import classes, support-dir
variance, contract metadata coverage) are recorded in the opening packet's row
ledger seed. Known unknowns: the four decision packets. Where unknown-unknowns
have historically appeared: execution drift creating new hiding places,
toolkit capability blind spots (the `.gritignore` test-exclusion falsifier,
the aggregate check hang), semantic collisions in process naming, and stale
blockers. Standing mitigations: staleness re-verification at container open
(readiness slice R4 is the current instance), capability probes inside
evidence lanes, and the house naming rule (process language never reuses
source-domain words).

Descent 3 is small and warm:
`model/` roots are closed to `schemas`/`policy`/`data` but their internals are
open. Decision 003 (domain model config law) already sealed the semantics;
what remains is file grammar. It can fold into descent 2's stack as a second
slice if its red proves tiny, or stand alone.

Descent 4 is the big across move and deliberately not first:
it must resolve the truth/projection boundary through source-owned contracts
(the corrective audit already rejected a Habitat stage-kind sidecar), decide
projection namespace semantics, and close the `@mapgen/domain/config.js` gap.
That is the heaviest user-decision density in the queue. Descent 2 proves the
interior-ratchet machinery on uniform terrain before spending it on the
gnarliest seam. Two stages currently contain only a support directory and one
contains only `viz.ts`; the recipe root has nine ungoverned children. Real
red exists here and none of it is blocked on descent 2.

Descent 6 follows 4 because most structural tests assert recipe/stage shapes;
migrating them before those shapes are law would encode the wrong authority.

Descent 7 closes the system over itself; its rows are already classified in
the ledger and none block product-side descents.

## Relationship To Other Records

- Method: `.habitat/.active/frames/BLUEPRINT-AUTHORITY-RATCHET-DESCENT-FRAME.md`.
- Runway: `.habitat/.active/workstreams/remediate-rule-authority/pre-descent-readiness-plan.md`.
- Selected descent: `.habitat/.active/workstreams/descend-002-domain-operation-interior/`.
- Operational rule state:
  `.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json`.
- Historical domino record: `.habitat/.active/dominoes/index.md`.

Non-claims:
this roadmap proves nothing about current rule state; counts and statuses are
snapshots dated by the entries above. Queue entries 3-8 are not scoped
containers; each requires its own opening frame with coordinates before any
execution.
