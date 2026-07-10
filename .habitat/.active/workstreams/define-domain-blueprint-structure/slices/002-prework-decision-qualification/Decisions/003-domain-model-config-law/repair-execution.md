# Domain Model Config Law Repair Execution

Status: repair execution complete for enforced file-shape, topology, and test import-boundary rails

Purpose: execute the categorical repair of the Domain Model Config Law outcome. This plan consumes `red-ledger.md`, not the historical `execution.md`, and it closes every current file-shape red row or explicitly tracks broader topology red out.

Current outcome:

- `require_recipe_stage_authoring_file_shape` is enforced and green.
- `require_domain_operation_contract_file_shape` is enforced and green.
- `require_domain_source_topology` is enforced and green with 0 diagnostics in
  the current tree. Historical path-level topology track-outs live in
  `domain-source-topology.domino.md` as prior red evidence only.
- `require_public_domain_surfaces_in_tests` is enforced and green after the
  detector was tightened to include relative deep imports. Static test module
  imports are closed. Structural source-text inspections in tests are tracked
  separately as Habitat authority debt because topology law belongs in Habitat,
  not package behavior tests.

Launch surface:

- `agent-lane-appendix.md` owns the fresh-agent prompts, lane contracts, review prompts, and launch checklist for this execution plan.
- `red-ledger.md` owns the row source.
- `execution-status-register.md` owns stable row IDs, lane ownership, mutable row status, proof labels, and final disposition slots.
- This document owns stage order, gates, and acceptance criteria.

## Frame

The repair is classification-first:

```text
authority class -> positive destination shape -> Habitat red -> source burn-down -> proof
```

The prior failure was not a missing move. It was a weak closure model that let wrong destinations pass as acceptable because they were nearby, locally consumed, or convenient.

This repair therefore starts by enforcing destination shape and topology pressure, then burns down only rows that have a positive destination.

## Non-Objectives

- Do not add product behavior.
- Do not keep helper files merely because they are stage-local.
- Do not use behavior tests as structure or topology law.
- Do not weaken rules to reduce red.
- Do not solve `resource-policy-data-contract.domino.md` inside this repair unless the user explicitly pulls it in.

## Inputs

Required reads before any stage:

- `red-ledger.md`
- `execution-status-register.md`
- `repair.md`
- `agent-lane-appendix.md`
- `disposition.md`
- `resource-policy-data-contract.domino.md`
- `.habitat/blueprints/recipe-stage/require_recipe_stage_authoring_file_shape/rule.json`
- `.habitat/blueprints/domain-operation/require_domain_operation_contract_file_shape/rule.json`
- `.habitat/blueprints/domain/require_domain_source_topology/rule.json`
- `.habitat/blueprints/domain/require_public_domain_surfaces_in_tests/rule.json`
- `.habitat/scopes/domain/`
- `.habitat/blueprints/recipe-stage/`
- `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/preserve_standard_stage_topology_and_path_invariants/rule.json`

Required command baseline:

```bash
git status --short
mkdir -p /tmp/habitat-red-experiment
bun habitat check --rule require_recipe_stage_authoring_file_shape --json --output /tmp/habitat-red-experiment/stage-authoring.json
bun habitat check --rule require_domain_operation_contract_file_shape --json --output /tmp/habitat-red-experiment/op-contract.json
bun habitat check --rule require_domain_source_topology --json --output /tmp/habitat-red-experiment/domain-topology.json
bun habitat check --rule preserve_standard_stage_topology_and_path_invariants --json --output /tmp/habitat-red-experiment/standard-stage-topology.json
bun habitat check --rule require_public_domain_surfaces_in_tests --json --output /tmp/habitat-red-experiment/public-domain-tests.json
```

Manifest-selected Grit execution:

- `bun habitat check --rule require_recipe_stage_authoring_file_shape` selects `.habitat/blueprints/recipe-stage/require_recipe_stage_authoring_file_shape/rule.json`.
- `bun habitat check --rule require_domain_operation_contract_file_shape` selects `.habitat/blueprints/domain-operation/require_domain_operation_contract_file_shape/rule.json`.
- For either Grit-backed rule, Habitat reads the selected manifest's pattern, materializes an Effect-scoped temporary `grit.yaml`, and invokes pinned Grit with `--grit-dir`.
- A prior native-fixture failure is historical evidence only; it is not a current command baseline, corpus, or execution gate.
- Current-tree Habitat checks alone are not enough. The injected probes must prove the rule catches wrong carriers and ignores the intended clean owner shape before Stage 1 begins.

Required row inputs:

- `red-ledger.md` for captured red evidence and current counts.
- `execution-status-register.md`

No execution stage may start from a category label alone. It must start from the exact row IDs assigned to that stage and lane in `execution-status-register.md`.

## Stage 0: Ratchet Integrity

Objective: prove the rules themselves are suitable rails before source movement begins.

What changes:

- Harden the fixtures for `require_recipe_stage_authoring_file_shape`.
- Harden the fixtures for `require_domain_operation_contract_file_shape`.
- Confirm `require_domain_source_topology` is enforced only after every current
  topology row is closed.
- Do not revive `require_recipe_stage_root_topology`; if recipe child topology is needed, design it as source-derived authority or merge it into the existing standard recipe topology rail.
- Do not overclaim standard-stage topology. The file-shape rail may ban ad hoc stage-root helper files as destination law; `preserve_standard_stage_topology_and_path_invariants` proves only its source-derived standard stage topology checks.
- Refresh `red-ledger.md` if the final Stage 0 rule split changes diagnostic counts.
- Run exact destination preflight for every executable row. No source-edit lane may launch while its row has `pending exact path/deletion` as the destination.

Decision criteria:

- A rule must assert the required shape, not merely block named smells.
- Optional pieces are allowed only if they are part of the shared destination class.
- One-off local helper logic is red and must move to an owner or be deleted.
- Static copied lists of active stage roots are not topology authority.
- Public schemas that mimic operation inputs, outputs, strategy config, or operation contract envelopes are not destination surfaces. They close by deletion/no public schema, not by being inlined into `index.ts` or renamed into another helper.

Required proof matrix:

| Proof row | Command/evidence | Required cases | Pass condition |
| --- | --- | --- | --- |
| `S0-MANIFEST-GRIT-EXECUTION` | The selected stage and operation `rule.json` manifests plus their `bun habitat check --rule <id> --json` commands. | Manifest selection for both file-shape rules; Habitat's Effect-scoped `grit.yaml` and `--grit-dir` execution. | Both checks run through their selected manifests; injected probes remain required proof of bad/clean behavior. |
| `S0-PROBE-STAGE` | Disposable bad/clean files under the scanned standard stage tree, followed by `bun habitat check --rule require_recipe_stage_authoring_file_shape --json --output /tmp/habitat-red-experiment/stage-authoring-probe.json`, then cleanup and `git status --short`. | good `createStage({ id, steps })`; wrong root helper carrier; outsourced `createStage(StageDefinition)` with sentinel constructor; forbidden operation mirror; re-export carrier; dynamic import carrier. | Bad probes appear in diagnostics, clean probe does not, and cleanup leaves no untracked or modified probe files. |
| `S0-PROBE-OP` | Disposable bad/clean files under the scanned domain operation contract tree, followed by `bun habitat check --rule require_domain_operation_contract_file_shape --json --output /tmp/habitat-red-experiment/op-contract-probe.json`, then cleanup and `git status --short`. | good direct `defineOp({ input, output, strategies })`; good const + default export; outsourced `defineOp(DemoDefinition)` with sentinel constructor; sibling/cross-op contract import; re-export carrier; dynamic import carrier; `createOp`/`createStage` inside contract. | Bad probes appear in diagnostics, clean probe does not, and cleanup leaves no untracked or modified probe files. |
| `S0-TOPO-STAGE` | `bun habitat check --rule preserve_standard_stage_topology_and_path_invariants --json --output /tmp/habitat-red-experiment/standard-stage-topology.json` plus source inspection. | source-derived standard stage topology owner; no static copied stage-root list. | Existing topology rail is green and execution record states that per-stage helper child-file bans remain owned by `require_recipe_stage_authoring_file_shape`, not this rule. |
| `S0-TOPO-DOMAIN` | `bun habitat check --rule require_domain_source_topology --json --output /tmp/habitat-red-experiment/domain-topology.json` | domain root, ops root, operation root, model root, and artifacts root topology. | Count matches `red-ledger.md`; enforced status requires zero current topology diagnostics. |
| `S0-COUNT-STAGE` | `bun habitat check --rule require_recipe_stage_authoring_file_shape --json --output /tmp/habitat-red-experiment/stage-authoring.json` | current-tree enforced stage authoring red. | Diagnostic count and path set reconcile with `execution-status-register.md`. |
| `S0-COUNT-OP` | `bun habitat check --rule require_domain_operation_contract_file_shape --json --output /tmp/habitat-red-experiment/op-contract.json` | current-tree enforced operation contract red. | Diagnostic count and path set reconcile with `execution-status-register.md`. |
| `S0-DESTINATION-PREFLIGHT` | `execution-status-register.md` exact destination audit plus row-owner review. | every Stage 1-3 row. | Every executable row has an exact destination path, `deletion`, or exact track-out target before source edits. Rows needing symbol discovery are classified in Stage 0, not launched as edit lanes. |

Acceptance:

- PASS if manifest-selected Habitat checks and injected bad/clean probe proof run, rule IDs are normalized, the current red counts are reproducible in `red-ledger.md`, and every diagnostic is represented in `execution-status-register.md`.
- PASS only if every Stage 1-3 row has exact destination, `deletion`, or exact track-out target before source editing begins.
- FAIL if any file-shape rule false-greens a known wrong root helper carrier, ignores re-export/dynamic import carriers, or relies on stale static topology lists.
- FAIL if stage-root child topology remains only a Grit content concern and is not assigned to a source-derived Habitat topology rail before closure.
- FAIL if current-tree Habitat checks are treated as a substitute for injected bad/clean probes.
- FAIL if any source-edit lane starts from a broad destination label such as `model/*`, `domain model`, `primitives`, `policies`, `ops`, `rules`, `shared`, `config`, or `helper`.

Review loop:

- Produce `reviews/stage-0-rule-integrity-review.md`.
- Reviewer A checks positive assertion quality.
- Reviewer B checks Habitat rule type and topology authority.
- Reviewer C checks that red output and rule names match `red-ledger.md`.

Gate to Stage 1:

- Accepted P1/P2 findings repaired.
- `red-ledger.md` updated after the final Stage 0 check.
- `reviews/stage-0-rule-integrity-review.md` exists and has no unresolved P1/P2 findings.

## Stage 1: Recipe Stage Authoring Burn-Down

Objective: close all `require_recipe_stage_authoring_file_shape` red rows.

Rows: every Stage 1 row ID in `execution-status-register.md`.

What changes:

- Inline true stage-owned public authoring schema, knobs, and compile mapping into the owning stage `index.ts` only when the surface is a real stage UX facade.
- Delete `public-config.ts`, `knobs.ts`, and stage-root helper files after import-zero proof.
- Move artifact helper material to domain artifacts or stage step contracts according to the row's `Positive owner/destination` cell.
- Move Civ7 official binding/resource material out of stage roots and into the Civ7 authority package, map policy package, adapter, or domain primitive owner based on actual symbol class.
- Move projection policy and river adjacency material to the row's owner class: stage `index.ts`, domain model policy/schema, step contract, map policy package, or deletion after import-zero proof.

Decision criteria:

- Public authoring belongs to the stage `index.ts`.
- Stage roots are not schema buckets.
- Operation contract schema mirrors are never stage-owned.
- Operation-mirror public schemas are garbage state, not stage UX. If a stage public surface only forwards or reshapes operation input/output/config/strategy envelopes, delete that public surface and let the stage use its steps and operation defaults/contracts directly.
- Official Civ7 resource keys, bindings, and resource-derived schemas are not domain-owned unless they are a domain projection over Civ7 authority.
- Stage `artifacts.ts` is not an artifact destination; domain `artifacts/*.artifact.ts` is.

Acceptance:

- PASS if `bun habitat check --rule require_recipe_stage_authoring_file_shape` is green.
- PASS only if removed helper files have import-zero proof.
- PASS only if every Stage 1 row in `execution-status-register.md` has final status `closed` in the execution record.
- FAIL if any new stage-root helper file appears under `recipes/standard/stages/<stage>/` outside `index.ts`, `viz.ts`, or `log.ts`.

Review loop:

- Produce `reviews/stage-1-stage-authoring-review.md`.
- Source/import reviewer checks no wrong stage-root helper files remain.
- Semantic reviewer checks that moved Civ7/resource/policy symbols landed in the correct authority class.
- Closure reviewer checks current-tree Habitat output is green for the rule.

## Stage 2: Operation Contract Burn-Down

Objective: close all `require_domain_operation_contract_file_shape` red rows.

Rows: every Stage 2 row ID in `execution-status-register.md`.

What changes:

- Inline operation input/output/strategy envelopes into the owning `contract.ts`.
- Extract reusable property primitives to `domain/<domain>/model/schemas/**`.
- Extract reusable policy constants to `domain/<domain>/model/policy/**`.
- Replace sibling or cross-domain operation contract imports with artifact, model schema, or model policy imports.
- Delete operation-local schema bags once the contract and primitive owners are live.

Decision criteria:

- Operation contracts are definition sites, not consumers of external operation envelopes.
- A shared schema is not an operation-family contract. It is either a primitive schema, artifact schema, policy schema, or residue.
- Reusing a sibling operation contract is a topology violation unless the import is replaced with a shared primitive or artifact owner.

Acceptance:

- PASS if `bun habitat check --rule require_domain_operation_contract_file_shape` is green.
- PASS only if each red contract row has before/after import proof.
- PASS only if every Stage 2 row in `execution-status-register.md` has final status `closed` or exact track-out proof in the execution record.
- FAIL if a new shared `config.ts`, shared operation contract bucket, or root domain type bucket is introduced.

Review loop:

- Produce `reviews/stage-2-operation-contract-review.md`.
- Contract reviewer checks every `contract.ts` owns `defineOp({ input, output, strategies })` in one envelope.
- Primitive reviewer checks extracted pieces are property-level or concept-level primitives, not renamed config bags.
- Import reviewer checks no operation contract imports sibling/cross-domain operation contracts.

## Stage 3: Domain Source Topology Burn-Down

Objective: close every current-scope `require_domain_source_topology` red row
before the topology rule is enforced.

Rows: every Stage 3 row ID in `execution-status-register.md`.

What changes:

- Move domain-root `contract.ts` facade material to `index.ts`, `artifacts`, `model/schemas`, `model/policy`, or operation contracts according to row-level symbol classification.
- Move domain-root `constants.ts`, `types.ts`, shared buckets, and standalone helper files into positive domain slots or delete them.
- Create missing `model` slots for domains that need schema/policy owners.
- Normalize operation-root helper buckets:
  - `policies` -> `rules` or domain `model/policy`;
  - `signals.ts` -> `rules`, `strategy`, `model/schemas`, or deletion;
  - `lib`, `layers`, `deriveFromHistory.ts` -> exact `rules/<concern>.ts`, exact `strategies/<strategy>.ts`, exact `model/schemas|policy|data/<owner>.ts`, or deletion;
  - operation-family shared buckets -> primitives, policies, or real operation contracts, not shared folders.
- Move or delete non-source notes from operation roots.

Decision criteria:

- Domain roots target closed topology, but current closure does not claim that topology is green.
- Operation roots target closed topology, but current closure does not claim that topology is green.
- Shared buckets are decomposition signals.
- Final destinations must be exact paths or deletion. Broad labels such as `model/*`, `domain model`, `primitives`, `policies`, `ops`, and `rules` are not final dispositions.
- Allowed exact destination shapes are `model/schemas/<concept>.ts`, `model/policy/<concern>.ts`, `model/data/<dataset>.ts`, `artifacts/<artifact>.artifact.ts`, `ops/<op>/contract.ts`, `ops/<op>/rules/<concern>.ts`, `ops/<op>/strategies/<strategy>.ts`, a named Civ7 authority package path, or deletion.
- If a row is part of resource policy/data contract and cannot be closed without that model, track it only when its exact path and symbols match `resource-policy-data-contract.domino.md`.

Acceptance:

- PASS if `require_domain_source_topology` has no current-scope red left.
- PASS if any remaining advisory red is explicitly recorded with current path and the next discriminator required before symbol-level movement.
- PASS only if every Stage 3 row in `execution-status-register.md` has final status `closed` or path-level tracked-out proof in the execution record.
- FAIL if a red topology path is described narratively but not row-classified.
- FAIL if `resources/lib`, `resources/policy`, resource `signals.ts`, or resource operation contracts are broadly tracked out without exact symbol-level S06 proof.

Review loop:

- Produce `reviews/stage-3-domain-topology-review.md`.
- Topology reviewer checks destination slots and no new buckets.
- Semantic reviewer checks each move preserves ownership meaning.
- Track-out reviewer checks no row is deferred without a domino.

## Stage 4: Cross-Rule Reconciliation

Objective: prove the three rails agree after source burn-down.

What changes:

- Repair any path that was fixed for one rule but made another rule red.
- Remove obsolete imports, stale barrels, and historical packet contradictions.
- Update `red-ledger.md` to final state.
- Update `execution-status-register.md` with final row statuses, destinations, proof evidence, and review dispositions.

Acceptance:

- PASS if file-shape rules are green.
- PASS if domain topology is green. If topology red remains, this repair may
  close only by recording exact current red paths plus the next required
  discriminator; do not claim symbol-level topology closure.
- PASS if `git diff --check -- .habitat mods/mod-swooper-maps/src mods/mod-swooper-maps/test` passes.
- FAIL if any prior red path lacks final disposition.
- FAIL if the final execution record lacks a one-to-one mapping from `execution-status-register.md` row to `closed` or path-level `tracked-out`.

## Stage 5: Behavior and Package Proof

Objective: prove the structural repair did not change behavior.

Required checks:

```bash
nx run mod-swooper-maps:check
nx run mod-swooper-maps:test
bun habitat classify .habitat/.active
bun habitat classify mods/mod-swooper-maps/src/domain
bun habitat classify mods/mod-swooper-maps/src/recipes/standard
bun habitat check --rule require_recipe_stage_authoring_file_shape
bun habitat check --rule require_domain_operation_contract_file_shape
bun habitat check --rule require_domain_source_topology --json
bun habitat check --rule require_public_domain_surfaces_in_tests --json
git diff --check -- .habitat mods/mod-swooper-maps/src mods/mod-swooper-maps/test
```

Required topology accounting:

- `require_domain_source_topology` must report 0 diagnostics in enforced mode.
- `require_public_domain_surfaces_in_tests` must report 0 diagnostics in enforced mode.
- A zero exit is not enough by itself; the proof is the enforced Habitat rule
  reporting zero diagnostics.

Required import scans:

```bash
rg -n "from ['\\\"]\\./(?:public-config|knobs|biome-bindings|riverProjectionKnobs|riverProjectionPolicy|placement-inputs|placement-outputs|artifacts)\\.js['\\\"]|from ['\\\"]\\.\\./.*public-config\\.js['\\\"]" mods/mod-swooper-maps/src/recipes/standard/stages
rg -n "from ['\\\"].*/ops/.*/contract\\.js['\\\"]|from ['\\\"].*/config\\.js['\\\"]|from ['\\\"]@mapgen/domain/[^/]+/(?:contract|types|constants)\\.js['\\\"]" mods/mod-swooper-maps/src/domain mods/mod-swooper-maps/src/recipes/standard/stages
rg -n "require_operation_contract_file_shape|require_stage_authoring_owner_shape|require_recipe_stage_root_topology" .habitat/blueprints .habitat/scopes
```

Acceptance:

- PASS if all required checks pass or any intentional advisory remainder is tracked out with exact row-level owner, destination, and trigger in `execution-status-register.md`.
- FAIL if behavior checks pass but Habitat law remains unaccounted.

## Stage 6: Closure

Objective: close the repair as a trustworthy execution unit.

What changes:

- Update `red-ledger.md` with final counts.
- Update this document's status to executed only after checks and review.
- Preserve `execution.md` as historical and keep `repair-execution.md` as the active closure record.

Final closure requires:

- clean import scans for retired files and old rule names;
- fresh-agent review findings repaired or explicitly rejected with reason;
- `red-ledger.md` shows zero unclassified rows;
- `execution-status-register.md` current closure overlay matches the final proof outputs; historical row tables are not active status unless explicitly reopened;
- `require_domain_source_topology` is enforced green with the exact current diagnostic/path count recorded in `red-ledger.md`;
- Graphite commit if the user asks to land the work;
- no dirty worktree except intentional uncommitted user changes.
