# Enforcement Review Findings

Status: historical review record; superseded as current-runbook instruction by `repair-execution.md`, `red-ledger.md`, and `execution-status-register.md`

Historical observations in this record retain their original evidence. Current
rule authority is the selected `.habitat/**/rule.json` manifest and `bun habitat
check --rule <id>`; Grit-backed checks use Habitat's Effect-scoped `grit.yaml`
and `--grit-dir` execution.

## Accepted Findings

### P1: Constructor Presence Was Too Weak As File Shape

The first pattern version treated `createStage(...)` or `defineOp(...)` presence as the positive shape. The second review caught that the next version still checked required keys as independent token presence. Both were insufficient. A file can contain the constructor and still outsource the actual authoring or operation contract body to wrong owners.

Accepted repair:

- `require_domain_operation_contract_file_shape` now requires `input`, `output`, and `strategies` inside the same `defineOp({ ... })` envelope.
- `require_recipe_stage_authoring_file_shape` now requires `id` and `steps` inside the same `createStage({ ... })` envelope.
- Both patterns include red fixtures where stray tokens appear outside an outsourced constructor payload.
- Stage 0 of `repair-execution.md` still requires fixture hardening before source burn-down.

### P1: Stage Helper Files Were False-Green Without Topology Pressure

The first rule version only scanned stage `index.ts` imports. That meant `public-config.ts`, `knobs.ts`, `biome-bindings.ts`, `artifacts.ts`, and placement helper files could remain in stage roots and still pass.

Accepted repair:

- Direct files under `recipes/standard/stages/<stage>/` are currently recorded as red pressure in `red-ledger.md`.
- Final topology law for those files must be added to the existing source-derived `preserve_standard_stage_topology_and_path_invariants` rail or an equivalent source-derived Habitat topology rule. Do not call the Grit predicate itself the final topology law.
- Stage-root topology for active standard stages must be source-derived from existing recipe/stage authority, not a static copied list.

### P1: Static Recipe Stage Topology Rule Was The Wrong Rule Shape

The experimental `require_recipe_stage_root_topology` rule hardcoded the active stage list. That recreated stale manual authority and contradicted existing source-derived stage topology work.

Accepted repair:

- The experimental rule was retired.
- Its red paths are still represented through the enforced stage authoring file-shape rule and, where needed, the future source-derived standard recipe topology rule.

### P1: Import Law Was Bypassable

The first import checks only matched `import_statement`. Re-export carriers and dynamic imports would bypass the rule.

Accepted repair:

- Operation and stage patterns now include module-source checks for `export { ... } from`, `export * from`, and `import(...)`.

### P2: Rule Names Drifted From Normalized Authority

Old names were ambiguous:

- `require_operation_contract_file_shape`
- `require_stage_authoring_owner_shape`

Accepted repair:

- `require_domain_operation_contract_file_shape`
- `require_recipe_stage_authoring_file_shape`
- `require_domain_source_topology`

### P2: Prior Packet Claims Conflicted With Current Red

The old `execution.md` said the work was closure-ready while the repair frame and Habitat checks showed active red. That was an unsafe status conflict.

Accepted repair:

- `execution.md` is now explicitly historical.
- `repair.md` points to `red-ledger.md` and `repair-execution.md`.
- `red-ledger.md` is the row source for the current repair pass.

## Remaining Reviewer Requirements

Before source burn-down starts:

- Re-run file-shape fixture tests and current-tree Habitat checks.
- Confirm no stale old rule IDs remain in packet or scope docs.
- Review `red-ledger.md` for exact row completeness, including line(s), stage of record, required correction, destination class, proof, and track-out state.
- Review `repair-execution.md` for deterministic stage gates.

## Second Review Wave

### P1: Red Ledger Was Not Row-Usable Enough

The first ledger listed `Path / Diagnostics / Class`, but not the stage of record, required correction, positive destination class, proof, or track-out state.

Accepted repair:

- `red-ledger.md` now carries an execution coverage register.
- `repair-execution.md` gates Stage 0 on row-level coverage before source burn-down.

### P1: Broad Track-Out Could Hide Red Rows

The initial track-out section named `resource-policy-data-contract.domino.md` broadly. That could hide resource-domain topology rows that are not actually covered by the domino.

Accepted repair:

- The only pre-approved track-out is exact-path and exact-trigger based.
- Resource red rows not explicitly listed in the track-out register remain in the repair execution.

### P1: Historical Execution Claims Needed Hard Invalidation

The historical `execution.md` still contained readable closure claims that contradicted the active red ledger.

Accepted repair:

- `execution.md` now carries a supersession banner at the top.
- `red-ledger.md` and `repair-execution.md` are the active current-state documents.

### P1: Domain Topology Advisory Is Not Yet Enforced Law

`require_domain_source_topology` is a correct structure rule shape, but it is currently advisory. It cannot be described as enforced law until it is promoted or every remaining advisory red is tracked out with an owner and trigger.

Accepted repair:

- `repair-execution.md` treats domain topology as advisory red until Stage 3/4 closure.
- Closure cannot claim domain topology law is active unless the rule is enforced and green, or advisory red is row-tracked out.

## Agent Lane Hardening Review Wave

### P1: Execution Lane Prompts Needed Stateless Row And Write Scope Contracts

The first lane appendix draft did not restate enough context inside Stage 1-3 prompts and did not authorize the status register updates required by closure.

Accepted repair:

- `agent-lane-appendix.md` now has a shared execution preamble that must be included before every Stage 1-3 lane prompt.
- The preamble requires exact orchestrator-filled row IDs from `execution-status-register.md`; those IDs outrank category text.
- Every execution lane has required skills, active rule, allowed edits, read-only boundaries, and status-register write authority limited to assigned rows.

### P1: Stable Row IDs, Status, Proof Labels, And Row-To-Lane Ownership Were Missing

The earlier packet had path-keyed red rows but no stable mutable execution register.

Accepted repair:

- `execution-status-register.md` now owns stable row IDs, lane ownership, status, final destination, proof class, evidence, and review fields.
- The register carries 41 Stage 1 rows, 5 Stage 2 rows, and 36 Stage 3 rows.
- `repair-execution.md` now requires execution to start from exact row IDs in `execution-status-register.md`, not category labels.

### P1: Stage 0 Fixture And Rail Proof Was Not Mechanical Enough

Stage 0 previously said fixture checks must pass without naming exact commands or required fixture cases.

Accepted repair:

- `repair-execution.md` now contains a Stage 0 proof matrix with exact Grit fixture commands, Habitat current-tree commands, required bad/good carrier cases, and pass conditions.
- Lane 0A references that proof matrix directly.

### P1: Recipe Stage Authority Reference Pointed To A Nonexistent Scope Path

The packet referenced `.habitat/scopes/recipe-stage/`, which does not exist in this worktree.

Accepted repair:

- The active references now point to `.habitat/blueprints/recipe-stage/` and the source-derived standard recipe topology rule under `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/preserve_standard_stage_topology_and_path_invariants/`.

### P1: Resource Projection Proof Was Prompt-Only, Not Closure-Enforced

The lane prompt defined a resource projection proof contract, but the status register did not require it.

Accepted repair:

- `execution-status-register.md` now defines `RESOURCE_PROJECTION_CONTRACT`.
- Resource and Civ7-binding rows require that proof label when they close into a domain projection rather than track out.
- Closure requires upstream Civ7 owner, projected domain concept, consuming file, and non-ownership rationale for any such row.

### P2: Escalated Rows And Proof Classes Needed Closure Semantics

The status schema allowed `escalated` and proof labels without enough canonical proof class mapping.

Accepted repair:

- `escalated` is explicitly non-closable and must become `closed` or exact `tracked-out` before Stage 4/6 closure.
- Every proof label now has a canonical proof class and non-claim boundary.

## Launch-Blocking Review Wave

### P1 (Historical, Superseded): Native Grit Fixture Commands Were Not Real Proof In This Checkout

Historical finding: the launch packet required `grit patterns test --filter ...`,
but that review's root `.grit/grit.yaml` registered `patterns: []`, so native
Grit could not discover the Habitat-owned pattern files as a testable corpus.

Superseding repair:

- `execution-status-register.md` preserves that observation as `HISTORICAL_ROOT_GRIT_UNAVAILABLE_RECORDED`, not a current execution label.
- Current Stage 0 proof selects `.habitat/blueprints/recipe-stage/require_recipe_stage_authoring_file_shape/rule.json` or `.habitat/blueprints/domain-operation/require_domain_operation_contract_file_shape/rule.json` with `bun habitat check --rule <id>`; Habitat materializes the Effect-scoped `grit.yaml` and invokes pinned Grit with `--grit-dir`.
- Stage 0 requires disposable injected bad/clean probes for both enforced file-shape rules.
- Current-tree Habitat checks alone are explicitly insufficient as a fixture substitute.

### P1: Lane Prompts Still Used Category Scope Instead Of Exact Row IDs

Some lane prompts said "use rows involving..." or similar category language. That reopened the original drift: agents could expand scope, skip rows, or treat category labels as destinations.

Accepted repair:

- Stage 1, Stage 2, and Stage 3 lane prompts now list exact `execution-status-register.md` row IDs.
- The shared gating model states that no source-edit lane may launch until Stage 0 destination preflight resolves each row to an exact path, `deletion`, or exact track-out target.

### P1: Broad Destination Cells Could Still Launch Source Edits

The status register intentionally starts rows as pending, but execution could have launched from `pending exact path/deletion` if the orchestrator skipped classification.

Accepted repair:

- Stage 0 adds `S0-R05` exact destination preflight.
- `repair-execution.md` fails Stage 0 if any source-edit lane starts from broad destination labels such as `model/*`, `domain model`, `primitives`, `policies`, `ops`, `rules`, `shared`, `config`, or `helper`.
- `agent-lane-appendix.md` adds Lane 0D to convert pending rows into exact destinations before edits.

### P1: Advisory Domain Topology Could Be Mistaken For Green

`require_domain_source_topology` exits successfully while producing advisory diagnostics. A proof label named green was unsafe unless green means zero diagnostics.

Accepted repair:

- `HABITAT_DOMAIN_TOPOLOGY_GREEN` now means zero diagnostics only.
- Stage 0 uses `HABITAT_DOMAIN_TOPOLOGY_ADVISORY_RECONCILED` for current advisory red count reconciliation.
- `red-ledger.md` states that a zero exit from advisory topology is not green.

### P1: Resource Lane Overlapped Stage 2 Write Ownership

Lane 3C could edit Stage 2 resource operation rows already assigned to Lanes 2A/2B.

Accepted repair:

- Lane 3C edits only Stage 3 resource topology rows.

## Source-Execution Correction Wave

### P1: Operation-Mirror Public Schemas Were Still Treated As Possible Destinations

The launch packet still allowed some operation schema mirrors to close by being inlined into stage `index.ts` or by moving reusable pieces into broad stage/model destinations. That preserved the same garbage idea under a better path: a stage public authoring surface that exists only to mimic operation inputs, outputs, config, strategy, or contract envelopes.

Accepted repair:

- Operation-mirror public schemas now close by deletion/no public schema.
- Stage public authoring survives only when it is a real stage-owned UX facade, not a mirror of lower-layer operation contracts.
- `agent-lane-appendix.md`, `repair-execution.md`, `red-ledger.md`, and `execution-status-register.md` now encode this as a launch criterion for Stage 1.
- Source lanes must use Narsil exact-symbol reference/ownership checks before public-config or mirror edits, then use `rg` for confirmation and import-zero proof.

### P1: Narsil-First Proof Was Not Enforced Consistently

The first correction said source lanes must use Narsil first, but the shared execution preamble still told agents to use `rg` first and Narsil only when ownership or history affected the decision. Most public-config rows also lacked `NARSIL_REFERENCE_ZERO`, so agents could close mirror deletion with grep-only proof.

Accepted repair:

- The shared execution preamble now requires Narsil first for public-config, operation-mirror, Civ7/resource, shared-bucket, and deletion-sensitive symbols.
- Public-config and operation-mirror Stage 1 rows now require Narsil reference proof plus `rg` confirmation.

### P1: Public-Config Rows Still Advertised Broad Preservation Destinations

Ecology and hydrology public-config rows still listed stage `index.ts` and broad model destinations as possible closure paths. That left room to preserve operation mirrors by moving them.

Accepted repair:

- Ecology, hydrology, morphology, foundation, and placement public-config/mirror rows now state `deletion/no public schema` for mirror material.
- Exact domain model owners remain allowed only for non-mirror symbols proven by Narsil/source inspection.

### P2: Intermediate Gates Used Broad Track-Out Language

Stage 4 and Stage 5 acceptance used weaker “named track-outs” and “tracked out in red-ledger.md” wording.

Accepted repair:

- Intermediate gates now distinguish exact closure from path-level topology
  track-outs in `execution-status-register.md`, matching final closure.
- Stage 2 resource rows `S2-004` and `S2-005` are reviewer-only for Lane 3C; findings route back to Lane 2B or Lane 2A.

## Historical Upfront Proof Results (Superseded)

Historical run from `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown`; this capture is not current execution authority.

### Historical Native Grit Discovery

Observed:

- `.grit/grit.yaml` contains `patterns: []`.
- `.grit` contains only `.grit/grit.yaml`.
- `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --filter require_recipe_stage_authoring_file_shape --verbose` failed with `No testable patterns found`.
- `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --filter require_domain_operation_contract_file_shape --verbose` failed with `No testable patterns found`.

Disposition:

- This former root `.grit` observation is retained as historical evidence only and must not be run or claimed in the current checkout.
- `NATIVE_GRIT_UNAVAILABLE_RECORDED` was the historical proof label; the active closure overlay uses `HISTORICAL_ROOT_GRIT_UNAVAILABLE_RECORDED` and manifest-selected Habitat checks.

### Historical Injected Habitat Probe Record

Disposable probe files were added under the actual Habitat scan roots, checked, then removed.

Observed after the 2026-07-05 proof refresh:

- Stage authoring probe check produced 7 probe diagnostics in `/tmp/habitat-red-experiment/stage-authoring-probe.json`:
  - `__habitat_probe_dynamic/index.ts`
  - `__habitat_probe_opmirror/index.ts`
  - `__habitat_probe_outsourced/index.ts`
  - `__habitat_probe_helper/public-config.ts`
  - `__habitat_probe_reexport/index.ts`
- Stage clean probe `__habitat_probe_clean/index.ts` produced no diagnostics.
- Operation contract probe check produced 9 probe diagnostics in `/tmp/habitat-red-experiment/op-contract-probe.json`:
  - `__habitat_probe__/ops/create-op-carrier/contract.ts`
  - `__habitat_probe__/ops/outsourced-contract/contract.ts`
  - `__habitat_probe__/ops/sibling-import/contract.ts`
  - `__habitat_probe__/ops/reexport-contract/contract.ts`
  - `__habitat_probe__/ops/dynamic-import/contract.ts`
- Operation clean probe `__habitat_probe__/ops/clean-contract/contract.ts` produced no diagnostics.
- Probe files and empty probe directories were removed; `find mods/mod-swooper-maps/src -path '*__habitat_probe*' -print` returned no rows.
- Cleanup proof: `/tmp/habitat-red-experiment/file-shape-after-probe-cleanup.json` is green for both enforced file-shape rules.

Disposition:

- These probe results are historical evidence. Any current rule change requires fresh manifest-selected Habitat checks and fresh injected bad/clean probes before source burn-down.
