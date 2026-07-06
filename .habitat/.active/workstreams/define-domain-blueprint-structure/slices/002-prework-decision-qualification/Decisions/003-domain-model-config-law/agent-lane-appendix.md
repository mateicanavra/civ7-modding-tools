# Domain Model Config Law Agent Lane Appendix

Status: reviewed launch surface for repair execution; prompt-design P1 findings incorporated

Purpose: provide the prompt and lane contracts needed to run `repair-execution.md` as a fresh-context cascade. This document is not the source of truth for row dispositions; it operationalizes `red-ledger.md`.

## Launch Frame

The repair has one governing shape:

```text
positive law -> current red -> row owner -> smallest burn-down -> proof -> review -> next stage
```

The executor must not treat current files as destination authority. Current files are evidence of residue unless they already satisfy the active Habitat rule. The destination is the positive owner named by the rule, scope, and row.

### Authority Order

Use this order when sources disagree:

1. Active Habitat rules and scope files:
   - `.habitat/blueprints/recipe-stage/require_recipe_stage_authoring_file_shape/`
   - `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/preserve_standard_stage_topology_and_path_invariants/`
   - `.habitat/blueprints/domain-operation/require_domain_operation_contract_file_shape/`
   - `.habitat/blueprints/domain/require_domain_source_topology/`
   - `.habitat/scopes/domain/`
   - `.habitat/blueprints/recipe-stage/`
2. Current packet records:
   - `red-ledger.md`
   - `repair-execution.md`
   - `repair.md`
   - `disposition.md`
3. Existing architecture/product docs and package boundaries.
4. Current code as evidence only.

Historical documents are useful for context, not closure authority. The historical `execution.md` is superseded by `repair-execution.md`.

### Shared Invariants

- Use the worktree `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown`.
- Use absolute paths for patches.
- Do not weaken Habitat rules to make code green.
- Do not introduce new `config.ts`, shared contract buckets, stage-root helper bags, or broad barrels to hide unresolved state.
- Do not use tests to enforce topology or file shape.
- Do not track out a row unless the exact path, symbols, owner, destination, and re-entry trigger are recorded.
- Do not solve `resource-policy-data-contract.domino.md` unless explicitly pulled in; current red rows are not pre-approved as that domino.
- Behavior checks prove behavior only. Habitat checks prove structure only. Graphite submission proves publication only.
- Native `grit patterns test --filter <rule>` is not a required fixture gate in this checkout unless a testable pattern corpus is registered in `.grit`. Record its current unavailability and use Habitat current-tree red plus injected bad/clean probes as the required workaround.
- Public schemas that mimic operation input, output, strategy config, or operation contract envelopes are not allowed. They close by deletion/no public schema, not by inlining, renaming, or moving into another helper.
- Use and trust Narsil first for symbol/reference/ownership checks, then use `rg` as a confirmation scan and gap detector.

## Stage Gating Model

Each stage starts with a fresh executor context. The orchestrator provides only:

- this appendix;
- `repair-execution.md`;
- `red-ledger.md`;
- `execution-status-register.md`;
- the relevant active Habitat rule directories;
- the row IDs assigned to that stage and lane.

Each stage must end with:

- row-level status updates in the execution record;
- proof commands and outputs summarized;
- accepted review findings repaired or explicitly rejected with evidence;
- Graphite commit/submission through the current stack when the stage changes files.

No source-edit lane may start until Stage 0 destination preflight has converted its owned rows from `pending exact path/deletion` to an exact path, `deletion`, or exact track-out target in `execution-status-register.md`.

## Shared Execution Preamble

Every execution lane prompt must include this preamble before the lane-specific text. Do not launch a Stage 1-3 lane from the lane-specific text alone.

```text
You are a fresh execution agent with no prior session context.

Worktree:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown

Required packet reads:
- /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown/.habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/Decisions/003-domain-model-config-law/agent-lane-appendix.md
- /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown/.habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/Decisions/003-domain-model-config-law/repair-execution.md
- /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown/.habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/Decisions/003-domain-model-config-law/red-ledger.md
- /Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown/.habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/Decisions/003-domain-model-config-law/execution-status-register.md

Authority order:
1. Active Habitat rules and scope files.
2. red-ledger.md row obligations and repair-execution.md gates.
3. disposition.md and repair.md.
4. Existing architecture/product/package-boundary docs.
5. Current source as evidence only.

Shared invariants:
- Use absolute paths for patches.
- Do not weaken Habitat rules to reduce red.
- Do not introduce config.ts, public-config.ts, knobs.ts, stage-root artifacts.ts, shared buckets, operation-family contracts, or root domain facades as destination surfaces.
- Do not use behavior tests as topology or file-shape law.
- Do not track out a row without exact path, symbols, owner, destination, and re-entry trigger.
- If the needed destination is outside this lane's allowed write scope, stop and return an escalation finding instead of editing outside the lane.

Required start:
- Run `git status --short`.
- Reproduce the relevant Habitat red for your lane before editing.
- Use Narsil MCP first for exact-symbol reference, usage, and owner-context proof for every assigned symbol that is public-config, operation-mirror, Civ7/resource, shared-bucket, or deletion-sensitive.
- Use `rg` after Narsil as confirmation import/export proof and as a gap detector.
- Use `git blame` when history affects whether a symbol is residue, policy, primitive, or artifact.

Assigned row IDs:
- <orchestrator fills exact execution-status-register.md row IDs here>

Row ownership:
- The assigned row IDs are authoritative. Category text in the lane prompt explains the class of work, but it does not expand scope beyond the assigned IDs.
- You may update execution-status-register.md only for your assigned row IDs and only in `status`, `finalDestination`, `proofClass`, `evidence`, and `review` fields.

Required return:
- Rows attempted and rows closed.
- Files changed/deleted.
- Proof commands and observed outcomes.
- Updated execution-status-register.md row status/destination/proof/review fields for owned rows, if the lane edits files.
- Any escalation findings with exact row/path/symbol/destination issue.
```

## Skill and Tool Context

### Required Skills For Execution Agents

Give execution agents these skill references in the prompt when relevant:

- `$habitat:systematic-workstream` for corpus-to-proof execution discipline.
- `$dev:refactor-typescript` or repo-local `typescript-refactoring` for TypeScript movement and import repair.
- `$dev:review-code-quality` for structural review of wrong-owner preservation, helper bags, wrappers, and complexity residue.
- `$civ7-architecture-authority` and `$civ7-product-authority` when row ownership crosses Civ7 resource, map policy, adapter, or domain semantics.

### First Tools In Each Stage

Each execution agent should use the repo-local tools before editing:

- `bun habitat check --rule <active-rule>` to reproduce red for its lane.
- `rg` for imports, exports, and old path proof.
- Narsil MCP for symbol/reference/history checks when available.
- `git blame` when ownership/history affects whether a symbol is residue, policy, primitive, or artifact.
- `nx run mod-swooper-maps:check` and `nx run mod-swooper-maps:test` only at integration gates or when a lane materially changes behavior-adjacent code.

Use `knip` only when available and useful for dead-code confidence; do not block on it if unavailable.

If a lane marks a skill as required and the agent cannot load it, the agent must stop and report that as a blocking setup finding rather than proceeding generically.

## Orchestrator Prompt

Use this prompt when creating the implementation owner thread or DRA.

```text
You are the implementation orchestrator for the Domain Model Config Law repair in:

/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown

Your job is to execute the repair workstream end to end from the active packet:

- .habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/Decisions/003-domain-model-config-law/repair-execution.md
- .habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/Decisions/003-domain-model-config-law/red-ledger.md
- .habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/Decisions/003-domain-model-config-law/agent-lane-appendix.md

Frame:

positive law -> current red -> row owner -> smallest burn-down -> proof -> review -> next stage

Do not preserve current containers by default. Current code is evidence; Habitat rules and row owners define the destination. The core failure being repaired is wrong-owner drift hidden by helper files, broad config surfaces, root facades, and shared buckets.

Non-negotiables:

- Start from the stable row IDs in execution-status-register.md.
- Do not weaken Habitat rules to reduce red.
- Do not introduce config.ts, public-config.ts, knobs.ts, stage-root artifacts.ts, shared buckets, operation-family contracts, or root domain facades as destination surfaces.
- Do not use behavior tests as structure law.
- Do not broadly defer resource rows. Track out only exact rows with exact symbol/destination/trigger evidence.
- Commit and submit through Graphite after completed stages.

Run the stages in repair-execution.md. Treat each stage as a fresh context with its own verification and review gate. Use subagents for disjoint lanes, but you remain responsible for synthesis, accepted finding disposition, and final closure.

Full-repair launch completion condition:

The following criteria describe the fully hardened repair launch target for
agents running every stage in this appendix. Current closure status is owned by
`execution-status-register.md`; if that overlay records advisory topology or
test-boundary red as tracked, do not read this appendix block as a conflicting
current-status claim.

- require_recipe_stage_authoring_file_shape is green.
- require_domain_operation_contract_file_shape is green.
- require_domain_source_topology is green, or advisory red is recorded only as
  path-level topology track-outs that do not claim symbol-level closure.
- nx run mod-swooper-maps:check and nx run mod-swooper-maps:test pass.
- red-ledger.md has no unclassified rows.
- execution-status-register.md has no pending rows.
- the worktree is clean after Graphite commit/submit.

Return at the end with: commits/PRs, stage proof summary, remaining exact track-outs if any, and any failed checks.
```

## Stage 0: Ratchet Integrity Lane Prompts

Stage 0 must run before source burn-down. It proves the rails are fit for execution.

### Lane 0A: File-Shape Rule Integrity

Use when checking the Grit rules for operation contracts and recipe stage authoring.

```text
You are Lane 0A: file-shape rule integrity reviewer/executor.

Worktree:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown

Read:
- agent-lane-appendix.md
- repair-execution.md Stage 0
- red-ledger.md Stage 0 rows
- execution-status-register.md Stage 0 rows
- .habitat/blueprints/recipe-stage/require_recipe_stage_authoring_file_shape/pattern.md
- .habitat/blueprints/domain-operation/require_domain_operation_contract_file_shape/pattern.md

Objective:
Prove that the file-shape rules are positive assertions of the destination shape, not brittle negative smell lists.

Required commands:
- `cat .grit/grit.yaml`
- `find .grit -maxdepth 3 -type f -print`
- `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns list --source local`
- `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --filter require_recipe_stage_authoring_file_shape --verbose`
- `GRIT_TELEMETRY_DISABLED=true bunx --no-install grit patterns test --filter require_domain_operation_contract_file_shape --verbose`
- `bun habitat check --rule require_recipe_stage_authoring_file_shape --json --output /tmp/habitat-red-experiment/stage-authoring.json`
- `bun habitat check --rule require_domain_operation_contract_file_shape --json --output /tmp/habitat-red-experiment/op-contract.json`

Focus:
- recipe stage index.ts must own createStage({ id, steps, optional public/knobsSchema/compile });
- operation contract.ts must own defineOp({ input, output, strategies });
- wrong carriers must not false-green because a sentinel constructor exists elsewhere;
- re-exports and dynamic imports must not bypass import law.
- if native fixtures are unavailable, that must be recorded as `NATIVE_GRIT_UNAVAILABLE_RECORDED`;
- injected bad/clean probes must cover the Stage 0 proof matrix in repair-execution.md before source burn-down.

Allowed edits:
Only Habitat rule fixture/pattern/metadata files in the two rule directories, plus the Stage 0 review record if you are assigned to write it.

Do not:
- weaken rules to reduce current red;
- edit source code under mods/;
- expand the destination class to fit current residue.

Return:
- whether each rule is fit for source burn-down;
- exact findings with file paths and severity;
- exact edits made, if any;
- native Grit discovery outcome;
- injected probe outcome;
- Habitat commands run and observed red/green counts.
```

### Lane 0D: Exact Destination Preflight

Use before any Stage 1-3 source-edit lane starts.

```text
You are Lane 0D: exact destination preflight.

Worktree:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown

Read:
- repair-execution.md Stage 0
- red-ledger.md
- execution-status-register.md
- disposition.md
- active Habitat rule directories for the three red rails

Objective:
Convert every executable Stage 1-3 row from a broad or pending destination into an exact destination path, deletion, or exact track-out target before source edits begin.

Focus:
- broad owner labels are not executable destinations;
- rows that require symbol discovery are still Stage 0 classification work, not edit-lane discretion;
- resource rows must not be tracked out broadly;
- source-edit lanes must receive exact row IDs and exact destinations.

Allowed edits:
- execution-status-register.md destination/proof/evidence fields;
- red-ledger.md only if it contradicts current Habitat output;
- Stage 0 review record.

Do not:
- edit source files;
- invent destination buckets;
- use `model/*`, `domain model`, `primitives`, `policies`, `ops`, `rules`, `shared`, `config`, or `helper` as final destinations.

Return:
- rows made exact;
- rows requiring exact track-out;
- rows still non-executable and why;
- whether Stage 1-3 source burn-down may launch.
```

### Lane 0B: Topology Authority Integrity

Use when checking whether topology pressure lives in the right Habitat mechanism.

```text
You are Lane 0B: topology authority reviewer/executor.

Worktree:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown

Read:
- repair-execution.md Stage 0
- red-ledger.md Stage 0 rows
- execution-status-register.md Stage 0 rows
- .habitat/blueprints/domain/require_domain_source_topology/
- .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/preserve_standard_stage_topology_and_path_invariants/
- .habitat/blueprints/recipe-stage/

Objective:
Ensure topology law uses Habitat topology/structure authority, not content-pattern hacks or copied static lists.

Focus:
- stage-root helper-file exclusion remains owned by the recipe stage authoring
  file-shape rail; do not claim the standard stage topology rail proves it;
- domain source topology remains advisory until current red is closed to
  symbol-level destinations;
- no retired `require_recipe_stage_root_topology` rule is revived;
- rule names use normalized topology language.

Allowed edits:
Habitat topology rule files, scope docs, and Stage 0 review/ledger updates.

Do not:
- create static lists of active stage roots as law;
- edit source files under mods/;
- mark advisory topology as enforced unless current red is green or exactly tracked out.

Return:
- the correct topology owner for stage-root child pressure;
- exact findings and repairs;
- whether Stage 0 can pass its topology gate.
```

### Lane 0C: Red Ledger Completeness

Use when checking the row source before execution starts.

```text
You are Lane 0C: red ledger completeness reviewer/executor.

Worktree:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown

Read:
- red-ledger.md
- execution-status-register.md
- repair-execution.md
- current Habitat JSON outputs for the three active rules, regenerating them if needed.

Objective:
Confirm that every current diagnostic is represented as an execution row with stage, required correction, destination class, proof, and track-out state.

Focus:
- enforced file-shape reds and advisory topology reds must be separated;
- every row must have a positive owner/destination;
- broad resource-policy track-outs are forbidden;
- old rule names must not appear in active scope/blueprint references.

Allowed edits:
red-ledger.md, execution-status-register.md, repair-execution.md, and review records.

Do not:
- edit source code;
- collapse multiple paths into one narrative row;
- accept “later” without an exact domino trigger.

Return:
- diagnostic count comparison: Habitat output vs execution-status-register.md rows;
- missing/extra/stale rows;
- exact edits made, if any;
- Stage 0 pass/fail recommendation.
```

## Stage 1: Recipe Stage Authoring Burn-Down Lanes

Stage 1 closes every `require_recipe_stage_authoring_file_shape` red.

### Lane 1A: Public Authoring Surface Consolidation

```text
You are Lane 1A: recipe public authoring consolidation.

Worktree:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown

Rows:
Use only these row IDs from `execution-status-register.md`: `S1-001`, `S1-002`, `S1-003`, `S1-004`, `S1-005`, `S1-006`, `S1-008`, `S1-009`, `S1-010`, `S1-013`, `S1-014`, `S1-015`, `S1-017`, `S1-018`, `S1-019`, `S1-021`, `S1-022`, `S1-023`, `S1-034`, `S1-035`, `S1-041`.

Required skill context:
- `$habitat:systematic-workstream`
- `$dev:refactor-typescript` or repo-local `typescript-refactoring`
- `$dev:review-code-quality`

Active rule:
- `.habitat/blueprints/recipe-stage/require_recipe_stage_authoring_file_shape/`

Allowed edits:
- Assigned stage `index.ts` files.
- Assigned stage-root helper files only for deletion or removal of exports.
- Domain `model/schemas/**` and `model/policy/**` files needed by assigned rows.
- Imports/tests directly affected by assigned rows.
- `execution-status-register.md` fields for assigned row IDs only.

Read-only unless escalated:
- Operation contracts.
- Artifact contract files.
- Civ7 packages and adapters.
- Unassigned stage roots.

Objective:
Move stage authoring into the owning stage index.ts and delete stage-root helper carriers after import-zero proof.

Decision rule:
If the symbol is a real stage-owned authoring surface, inline it into the stage index.ts. If it is reusable domain primitive or policy, move it to the domain model owner. If it mirrors operation input/output/config/strategy or an operation contract envelope, delete the mirror and do not recreate it as stage public schema.

Narsil-first proof:
Before editing a public-config or mirror row, query exact symbols with Narsil for references and owner context. Use `rg` after Narsil to confirm old import paths and deleted symbols reach zero.

Do not:
- create a new stage-local helper file;
- create or preserve public-config.ts or knobs.ts;
- preserve operation-mirror public schema by inlining it into `index.ts`;
- move reusable primitives into a broad config bucket.

Return:
- rows closed;
- files changed/deleted;
- import-zero proof for deleted helpers;
- Habitat rule status for recipe stage authoring.
```

### Lane 1B: Stage Artifact Helper Removal

```text
You are Lane 1B: stage artifact helper removal.

Worktree:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown

Rows:
Use only these row IDs from `execution-status-register.md`: `S1-007`, `S1-011`, `S1-012`, `S1-016`, `S1-020`, `S1-027`, `S1-028`, `S1-029`, `S1-030`, `S1-036`, `S1-037`.

Required skill context:
- `$habitat:systematic-workstream`
- `$dev:refactor-typescript` or repo-local `typescript-refactoring`
- `$dev:review-code-quality`

Active rule:
- `.habitat/blueprints/recipe-stage/require_recipe_stage_authoring_file_shape/`

Allowed edits:
- Assigned stage-root `artifacts.ts` files only for deletion or re-export removal.
- Import sites that currently consume those stage artifact helpers.
- Domain `artifacts/*.artifact.ts` or domain artifact index files only when moving already-proven artifact-owned exports.
- `execution-status-register.md` fields for assigned row IDs only.

Read-only unless escalated:
- Operation contracts.
- Domain model schemas/policy.
- Civ7 packages and adapters.
- Unassigned stage roots.

Objective:
Remove stage-root artifact aggregation and route consumers to domain artifact owners or step contract imports.

Decision rule:
Artifacts live under domain `artifacts/*.artifact.ts` and domain artifact indexes. Stage roots are not artifact owners. If a stage artifact helper only re-exports already-owned artifacts, replace imports and delete it. If it defines shape, move shape to the correct artifact or contract owner before deletion.

Do not:
- create new stage-root artifact barrels;
- weaken artifact contract exports;
- change runtime behavior.

Return:
- each artifacts.ts row and final disposition;
- imports rewritten;
- import-zero proof;
- Habitat stage rule status.
```

### Lane 1C: Civ7 Resource And Binding Extraction

```text
You are Lane 1C: Civ7 resource and binding extraction.

Worktree:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown

Rows:
Use only these row IDs from `execution-status-register.md`: `S1-025`, `S1-026`.

Required skill context:
- `$habitat:systematic-workstream`
- `$civ7-architecture-authority`
- `$civ7-product-authority`
- `$dev:refactor-typescript` or repo-local `typescript-refactoring`

Active rule:
- `.habitat/blueprints/recipe-stage/require_recipe_stage_authoring_file_shape/`

Allowed edits:
- Assigned stage files.
- `packages/civ7-map-policy/**` or existing Civ7 authority package files only for symbols classified close-now from assigned rows.
- Domain model files only for true domain projections over Civ7 authority.
- Imports directly affected by assigned symbols.
- `execution-status-register.md` fields for assigned row IDs only.

Read-only unless escalated:
- Resource-policy/data-contract domino surfaces.
- Unassigned resource domain rows.
- Operation contracts not directly importing assigned symbols.

Objective:
Move official Civ7 resource/binding semantics out of recipe stage roots and out of domains unless the symbol is a domain projection over Civ7 authority.

Decision rule:
Official game resource types and bindings belong in Civ7 types, Civ7 map policy, or an adapter. Domain model owners may consume those primitives but do not own official resource truth. Stage index.ts may compose public authoring from those owners.

Resource projection proof contract:
If a symbol lands in a domain as a projection over Civ7 authority, the row must record the upstream Civ7 authority owner, the projected domain concept, the consuming file, and why the domain file is not owning official truth. Without those four facts, route the symbol to Civ7 types/map-policy/adapter or exact track-out.

Required two-phase workflow:
1. Produce a symbol classification table for the assigned rows: `symbol -> current file -> class -> owner -> close-now or escalate`.
2. Edit only `close-now` symbols within allowed paths. Anything requiring new Civ7 authority design, resource-policy contract design, or broad data-model choice becomes an escalation finding.

Do not:
- leave biome/resource bindings as a stage helper exception;
- bury official resource semantics in a domain schema because it is convenient;
- solve unrelated resource-policy domino rows without exact proof.

Return:
- symbol classification table;
- destination for each symbol;
- files changed;
- package boundary and import proof.
```

### Lane 1D: Stage Policy Residue Removal

```text
You are Lane 1D: stage policy residue removal.

Worktree:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown

Rows:
Use only these row IDs from `execution-status-register.md`: `S1-024`, `S1-031`, `S1-032`, `S1-033`, `S1-038`, `S1-039`, `S1-040`.

Required skill context:
- `$habitat:systematic-workstream`
- `$dev:refactor-typescript` or repo-local `typescript-refactoring`
- `$dev:review-code-quality`

Active rule:
- `.habitat/blueprints/recipe-stage/require_recipe_stage_authoring_file_shape/`

Allowed edits:
- Assigned stage `index.ts` files.
- Assigned stage-root helper files only for movement or deletion.
- Domain `model/schemas/**`, `model/policy/**`, or step contract files directly owning assigned symbols.
- Imports/tests directly affected by assigned rows.
- `execution-status-register.md` fields for assigned row IDs only.

Read-only unless escalated:
- Civ7 packages and adapters.
- Unassigned stage roots.
- Operation contracts unrelated to assigned rows.

Objective:
Delete or move stage-root policy/projection/placement helper residue to positive owners.

Decision rule:
Stage index.ts owns authoring composition. Reusable domain policy goes to domain `model/policy`. Reusable schemas go to domain `model/schemas`. Step-specific contracts go to the step contract. Dead mirrors are deleted.

Do not:
- create a new `helpers`, `shared`, `inputs`, or `outputs` bucket under a stage root;
- preserve a file because current imports point to it;
- mix policy and schema in one broad primitive.

Return:
- row disposition table;
- files moved/deleted;
- import-zero proof;
- Habitat stage rule status.
```

## Stage 2: Operation Contract Burn-Down Lanes

Stage 2 closes every `require_domain_operation_contract_file_shape` red.

### Lane 2A: Inline Operation Contract Envelopes

```text
You are Lane 2A: operation contract envelope consolidation.

Worktree:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown

Rows:
Use only these row IDs from `execution-status-register.md`: `S2-001`, `S2-002`, `S2-005`.

Required skill context:
- `$habitat:systematic-workstream`
- `$dev:refactor-typescript` or repo-local `typescript-refactoring`
- `$dev:review-code-quality`

Active rule:
- `.habitat/blueprints/domain-operation/require_domain_operation_contract_file_shape/`

Allowed edits:
- Assigned operation `contract.ts` files.
- Assigned operation-local config/schema helper files only for deletion or movement into the contract.
- Domain `model/schemas/**` and `model/policy/**` for extracted property/concept primitives.
- Imports/tests directly affected by assigned rows.
- `execution-status-register.md` fields for assigned row IDs only.

Read-only unless escalated:
- Recipe stage files.
- Artifact contracts unless the assigned row already proves artifact ownership.
- Civ7 packages and adapters.
- Unassigned operation roots.

Objective:
Make each operation contract.ts own the defineOp({ input, output, strategies }) envelope.

Decision rule:
Input/output/strategy envelopes are definition-site material. Reusable property-level concepts move to domain model/schemas or model/policy; complete operation envelopes do not.

Do not:
- extract input/output schemas into shared operation-family contract files;
- create model/config;
- leave sibling config bags alive after import-zero proof.

Return:
- contract rows closed;
- primitives extracted, if any;
- deleted config/schema bag files;
- operation contract Habitat rule status.
```

### Lane 2B: Cross-Operation Import Elimination

```text
You are Lane 2B: cross-operation contract import elimination.

Worktree:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown

Rows:
Use only these row IDs from `execution-status-register.md`: `S2-003`, `S2-004`.

Required skill context:
- `$habitat:systematic-workstream`
- `$dev:refactor-typescript` or repo-local `typescript-refactoring`
- `$dev:review-code-quality`
- `$civ7-architecture-authority` when the imported shape is official Civ7/resource semantics.

Active rule:
- `.habitat/blueprints/domain-operation/require_domain_operation_contract_file_shape/`

Allowed edits:
- Assigned operation `contract.ts` files.
- Domain `model/schemas/**`, `model/policy/**`, `model/data/**`, and `artifacts/*.artifact.ts` files needed to replace the assigned import.
- Imports/tests directly affected by assigned rows.
- `execution-status-register.md` fields for assigned row IDs only.

Read-only unless escalated:
- Recipe stage files.
- Unassigned operation contracts.
- Civ7 packages unless the assigned symbol is classified as official Civ7/resource authority and close-now.

Objective:
Replace operation-contract-to-operation-contract imports with artifact, primitive schema, policy, or Civ7 authority imports.

Decision rule:
An operation contract is not a reusable schema owner for another operation. If the imported shape is an artifact, import from artifacts. If it is a property primitive, extract to model/schemas. If it is policy/data, move to model/policy, model/data, or Civ7 map policy by symbol class.

Do not:
- preserve imports from `../*/contract.js` or `@mapgen/domain/*/ops/*/contract.js`;
- copy a full input/output envelope as a primitive;
- create a shared contract barrel.

Return:
- before/after import table;
- primitive/artifact/policy destinations;
- Habitat operation rule status.
```

## Stage 3: Domain Source Topology Burn-Down Lanes

Stage 3 closes advisory domain topology red or records exact track-outs.

### Lane 3A: Domain Root Facade And Bucket Decomposition

```text
You are Lane 3A: domain root facade and bucket decomposition.

Worktree:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown

Rows:
Use only these row IDs from `execution-status-register.md`: `S3-001`, `S3-002`, `S3-010`, `S3-011`, `S3-012`, `S3-013`, `S3-015`, `S3-016`, `S3-018`, `S3-019`, `S3-020`, `S3-021`, `S3-025`, `S3-026`, `S3-027`.

Required skill context:
- `$habitat:systematic-workstream`
- `$dev:refactor-typescript` or repo-local `typescript-refactoring`
- `$dev:review-code-quality`
- `$civ7-architecture-authority` when row symbols might be official Civ7/resource authority.

Active rule:
- `.habitat/blueprints/domain/require_domain_source_topology/`

Allowed edits:
- Assigned domain-root residue paths.
- Domain `index.ts`, `artifacts/*.artifact.ts`, `model/schemas/**`, `model/policy/**`, `model/data/**`, and directly affected imports.
- `execution-status-register.md` fields for assigned row IDs only.

Read-only unless escalated:
- Recipe stage files except import repair directly caused by assigned moved symbols.
- Operation contracts unless importing assigned moved symbols.
- Civ7 packages unless the assigned symbol is classified close-now as official Civ7/resource authority.

Objective:
Move each domain-root residue row into the positive domain topology: index, artifacts, model/schemas, model/policy, model/data, ops, or deletion.

Decision rule:
Root facades are not owners. Shared buckets are decomposition signals. Types that represent schemas become model/schemas. Constants that drive decisions become model/policy. Official Civ7 resource truth belongs outside the domain.

Final destination rule:
Every row must name an exact destination path or deletion. `model/*`, `domain model`, `primitives`, `policies`, `ops`, and `rules` are not final disposition labels.

Do not:
- create a replacement root facade;
- introduce broad `types.ts`, `constants.ts`, `shared`, or `config` buckets;
- track out without exact row proof.

Return:
- row-by-row destination table;
- moved/deleted files;
- import scans;
- domain topology status.
```

### Lane 3B: Operation Root Topology Normalization

```text
You are Lane 3B: operation root topology normalization.

Worktree:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown

Rows:
Use only these row IDs from `execution-status-register.md`: `S3-003`, `S3-004`, `S3-005`, `S3-006`, `S3-007`, `S3-008`, `S3-009`, `S3-014`, `S3-017`, `S3-022`, `S3-023`, `S3-024`.

Required skill context:
- `$habitat:systematic-workstream`
- `$dev:refactor-typescript` or repo-local `typescript-refactoring`
- `$dev:review-code-quality`

Active rule:
- `.habitat/blueprints/domain/require_domain_source_topology/`

Allowed edits:
- Assigned operation-root residue paths.
- Assigned operation `rules/**`, `strategies/**`, `contract.ts`, and `index.ts` when normalizing an existing real operation.
- Domain `model/schemas/**`, `model/policy/**`, and `model/data/**` for extracted reusable concepts.
- Imports/tests directly affected by assigned rows.
- `execution-status-register.md` fields for assigned row IDs only.

Read-only unless escalated:
- Recipe stage files except import repair directly caused by assigned moved symbols.
- Unassigned operation roots.
- Civ7 packages and adapters.

Objective:
Normalize operation roots to positive slots: contract.ts, index.ts, rules, strategies, or delete/move to domain model owners.

Decision rule:
Operation-local implementation rules go under `rules`. Strategy implementation goes under `strategies`. Reusable domain concepts go under domain model. Fake operation-family buckets are not destination owners.

Final destination rule:
Every row must name an exact destination path or deletion. Use `ops/<op>/rules/<concern>.ts`, `ops/<op>/strategies/<strategy>.ts`, `model/schemas/<concept>.ts`, `model/policy/<concern>.ts`, `model/data/<dataset>.ts`, a named Civ7 authority package path, or deletion. Broad labels such as `domain model`, `primitives`, `policies`, and `rules` do not close a row.

Do not:
- keep `policies` as an operation-root folder;
- keep fake operations missing contract.ts/index.ts unless they are converted into real operations by explicit authority;
- move implementation helpers into model/schemas.

Return:
- topology row closure table;
- before/after tree summary;
- import-zero proof for deleted buckets;
- domain topology status.
```

### Lane 3C: Resource Domain Exact-Track-Out Guard

```text
You are Lane 3C: resource domain exact-track-out guard.

Worktree:
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown

Rows:
Editing ownership: use only these Stage 3 row IDs from `execution-status-register.md`: `S3-028`, `S3-029`, `S3-030`, `S3-031`, `S3-032`, `S3-033`, `S3-034`, `S3-035`, `S3-036`.

Reviewer-only overlap: inspect but do not edit Stage 2 resource rows `S2-004` and `S2-005`; return findings to Lane 2B or Lane 2A respectively.

Required skill context:
- `$habitat:systematic-workstream`
- `$civ7-architecture-authority`
- `$civ7-product-authority`
- `$dev:review-code-quality`

Active rules:
- `.habitat/blueprints/domain-operation/require_domain_operation_contract_file_shape/`
- `.habitat/blueprints/domain/require_domain_source_topology/`

Allowed edits:
- `red-ledger.md`, repair execution records, and review records.
- Assigned Stage 3 `domain/resources/**` source files only after classifying the row as close-now and inside the repair scope.
- Imports/tests directly affected by close-now resource rows.
- `execution-status-register.md` fields for assigned row IDs only.

Read-only unless escalated:
- `resource-policy-data-contract.domino.md` scope unless exact track-out criteria are met.
- Civ7 packages unless the assigned symbol is classified close-now as official Civ7/resource authority.
- Non-resource domains except import repair directly caused by assigned rows.

Objective:
Prevent broad resource-policy deferral from hiding rows that can be closed now.

Decision rule:
A resource row can track out only if its exact path and symbols match the resource policy/data contract domino and the execution record names the owner, destination, and re-entry trigger. Otherwise it must be closed in this repair.

Resource projection proof contract:
If a symbol lands in a domain as a projection over Civ7 authority, the row must record the upstream Civ7 authority owner, the projected domain concept, the consuming file, and why the domain file is not owning official truth. Without those four facts, route the symbol to Civ7 types/map-policy/adapter or exact track-out.

Do not:
- use “resources are complicated” as a disposition;
- track out folders wholesale;
- move official Civ7 resource semantics into domain owners unless they are true domain projections.

Return:
- resource row table with close-now vs exact-track-out;
- proof for any track-out;
- findings that block Stage 3 closure.
```

## Stage 4-6 Integration And Closure Prompts

### Integration Agent

```text
You are the cross-rule integration agent for the Domain Model Config Law repair.

Read:
- repair-execution.md Stages 4-6
- red-ledger.md final row statuses
- all stage review records
- current Habitat outputs

Objective:
Prove the stage fixes agree across all rails and no row disappeared between rules.

Mode:
Reviewer-only by default. Do not edit source files unless the orchestrator explicitly assigns a row-level repair scope after your findings.

Focus:
- a Stage 1 fix must not create Stage 2 or Stage 3 red;
- a Stage 2 primitive extraction must satisfy domain topology;
- a Stage 3 move must not reintroduce wrong stage imports or operation contract imports;
- every red-ledger row must be closed or exactly tracked out.

Return:
- cross-rule conflicts found;
- exact repair recommendations needed;
- final required checks and their results;
- whether closure may proceed.
```

### Closure Reviewer

```text
You are the closure reviewer for the Domain Model Config Law repair.

Objective:
Decide whether the repair can be called complete.

Required evidence:
- require_recipe_stage_authoring_file_shape green;
- require_domain_operation_contract_file_shape green;
- require_domain_source_topology green, or advisory red recorded only as
  path-level topology track-outs with no symbol-level closure claim;
- nx run mod-swooper-maps:check passed;
- nx run mod-swooper-maps:test passed;
- import scans from repair-execution.md passed;
- accepted P1/P2 findings are repaired or explicitly dispositioned;
- Graphite commit/submit occurred;
- worktree is clean except intentional user changes.

Required baseline:
- Run `git status --short`.
- Compare status against the orchestrator-provided intentional-dirt list.
- Fail closure on any unaccounted repair dirt or missing Graphite evidence.

Return:
- PASS or FAIL;
- if FAIL, list only blocking findings with exact evidence;
- if PASS, summarize proof by class and name any exact track-outs.
```

## Review Wave Prompts For This Appendix

Use these prompts to review changes to this appendix or the execution packet.

### Prompt-Design Reviewer

```text
You are a fresh prompt-design reviewer. Review agent-lane-appendix.md as a sub-agent prompt launch surface.

Judge against:
- statelessness: every fresh agent has enough context;
- single responsibility: each lane has one bounded job;
- return contract: each lane says exactly what to return;
- tool scope: each lane has appropriate write boundaries;
- autonomy bounding: lane prompts prevent over-search and over-execution;
- dilution: remove text that does not change agent behavior.

Do not review source code implementation. Do not suggest weakening the workstream. Return P1/P2/P3 findings with exact section references and concrete repair recommendations.
```

### Systematic-Workstream Reviewer

```text
You are a fresh systematic-workstream reviewer. Review repair-execution.md, red-ledger.md, and agent-lane-appendix.md together.

Judge whether:
- authority order is clear;
- every stage starts from row obligations;
- groups do not hide rows;
- proof classes stay separate;
- review gates block closure;
- Stage 0 prevents weak rails from causing another wrong landing.

Return only findings that would materially affect execution determinism or closure trust.
```

### Structural Quality Reviewer

```text
You are a fresh structural quality reviewer. Review whether the execution packet would prevent wrong-owner preservation and helper-bag drift.

Judge whether:
- lanes push residue into positive owners rather than renamed buckets;
- domain primitives are property/concept-level, not full config envelopes;
- official Civ7 resource semantics are routed out of domains/stages when appropriate;
- recipe stage and operation contract destinations are strict enough.

Return findings ordered by severity, with exact packet references and the repair required.
```

## Launch Checklist

Before starting implementation:

- `git status --short` is clean or all dirt is intentionally accounted for.
- `gt ls` shows the current branch at the intended stack position.
- Stage 0 agents have reviewed rule integrity, topology authority, and red ledger completeness.
- `red-ledger.md` counts match current Habitat output.
- The orchestrator has assigned disjoint write sets for the first execution wave.

Before moving from one stage to the next:

- the active rule for the stage is green or the exact allowed advisory track-outs are recorded;
- review record exists for the stage;
- no accepted P1/P2 finding remains unrepaired;
- execution record maps every stage row to `closed` or exact `tracked-out`.

Before final closure:

- all checks in `repair-execution.md` Stage 5 pass;
- no stale old rule IDs remain in active scope/blueprint references;
- Graphite commit and submit complete;
- final response reports proof classes separately.
