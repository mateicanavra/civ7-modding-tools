# Enforcement Review Prompts

Status: completed first review wave; accepted findings incorporated into `red-ledger.md` and `repair-execution.md`

Purpose: preserve the actual prompts used to review the Habitat pattern and topology experiment so later agents can see the review frame, not just the conclusion.

## Shared Frame

You are a fresh peer reviewer with no prior context. Review the current Domain Model Config Law Habitat rule work in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown`.

The work is not source cleanup. It is enforcement design and red accounting. The goal is to determine whether the Habitat patterns and topology rules are correct positive assertions, whether the rule types are appropriate, and whether the red output is captured durably enough to drive the next execution pass.

Anchor documents:

- `.habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/Decisions/003-domain-model-config-law/disposition.md`
- `.habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/Decisions/003-domain-model-config-law/execution.md`
- `.habitat/.active/workstreams/define-domain-blueprint-structure/slices/002-prework-decision-qualification/Decisions/003-domain-model-config-law/repair.md`
- `.habitat/blueprints/domain-operation/require_domain_operation_contract_file_shape/`
- `.habitat/blueprints/recipe-stage/require_recipe_stage_authoring_file_shape/`
- `.habitat/blueprints/domain/require_domain_source_topology/`

Review from a positive authority model:

- Do not ask "what bad things are blocked?"
- Ask "what must this class of file or topology be?"
- Anything outside that class is red until moved, deleted, decomposed, or explicitly tracked out.

## Prompt 1: File-Shape Pattern Reviewer

Objective: adversarially review the operation contract and recipe stage authoring file-shape patterns.

Focus:

- Are the patterns positive assertions of the destination shape?
- Do they catch wrong carriers such as helper config files, re-exports, dynamic imports, root domain facades, and operation schema mirrors?
- Are broad allowlists hiding unclassified authority?
- Do the fixtures prove the intended law and likely false-positive cases?
- Are the names normalized and clear?

Avoid:

- Do not propose source cleanup.
- Do not weaken rules to reduce red.
- Do not accept current coupling as ownership proof.

Produce:

- Findings ordered by severity.
- Exact file/rule references.
- A short accepted-fix recommendation for each P1/P2.

## Prompt 2: Topology and Rule-Type Reviewer

Objective: adversarially review whether the topology rules use the correct Habitat mechanism and whether they are enforcement-ready.

Focus:

- Is topology expressed through `structure.toml`, not Grit file-shape patterns?
- Does any topology rule hardcode stale runtime lists that should be derived from source authority?
- Does each topology rule use a normalized topology name?
- Is each rule correctly marked enforced vs advisory for the current workstream?
- If a rule is advisory, does its red output still have a durable ledger?

Avoid:

- Do not bless manual root lists unless they are the actual source of authority.
- Do not conflate recipe standard stage topology with all recipe stage topology.

Produce:

- Findings ordered by severity.
- Whether each topology rule should be enforced now, advisory now, merged into an existing rule, or retired.

## Prompt 3: Red Ledger and Execution Artifact Reviewer

Objective: review whether the red output is captured in a form that can drive deterministic repair execution.

Focus:

- Is every actual red path recorded?
- Are enforced file-shape reds separated from advisory topology reds?
- Is the rejected experiment evidence retired rather than carried forward as law?
- Are stale rule names removed?
- Does the execution document consume the ledger and gate closure on green Habitat checks?

Avoid:

- Do not add more narrative in place of rows.
- Do not treat prior execution claims as closure if current rules are red.

Produce:

- Missing row classes.
- Stale or conflicting packet claims.
- Required sections for the repair execution document.

