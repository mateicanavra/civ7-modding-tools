# Underscore Blueprint Burndown Frame

Status: systematic implementation frame for resolving the Civ7
`_blueprints` candidate layer

Built: 2026-06-30

Owner: DRA Habitat authority-tree workstream

Durability: standalone frame for the next systematic workstream. Use this
after Domino 45, when `map-output` is closed and the remaining Civ7
candidate-blueprint layer is the highest leverage source of visible half-state.

## Purpose

Burn down the remaining Civ7 niche-local `_blueprints` packets without
replacing loose labels with new loose labels.

The workstream should process every current Civ7 `_blueprints` packet through
the same domino loop: metrics and evidence first, semantic owner decision
second, physical movement third, review and corpus repair last. The expected
end state for the active slice is not "all rules are blueprints." The expected
end state is that every scoped Civ7 row is visibly one of these:

- admitted under top-level `blueprints/<kind>/`;
- moved to an honest niche or child-niche `rules/` lane;
- moved to the smallest honest `_remainder/` with a concrete pending split,
  consolidation, replacement, or retirement action; or
- deleted only if the rule is proven obsolete and the deletion is recorded.

## Source Boundary

Authority sources, in order:

1. Current user direction: make bolder source-backed moves, avoid ineffective
   relabeling, use `_remainder` only for rows that need split or future work
   before they can be honest authority, and leave `global/workspace`,
   `habitat/toolkit`, and non-Civ7 documentation pockets out of the active
   slice until their separate design questions are ready. Exception: if a
   non-Civ7 directory contains a rule whose whole predicate is actually hidden
   Civ7 blueprint authority, pull that row into the relevant Civ7 domino and
   record why the old directory hid the real owner.
2. `.habitat/AUTHORITY.md` and `.habitat/AUTHORITY-TREE-SHAPE.md`.
3. `.habitat/AUTHORITY-ONTOLOGY.md` for blueprint, niche, instance, and
   capability language.
4. Existing method frames:
   - `.habitat/.active/frames/BLUEPRINT-KIND-GATHERING-FRAME.md`
   - `.habitat/.active/frames/DESTINATION-SIMPLIFICATION-FRAME.md`
   - `.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-remediation-layer1-action-matrix.json`
5. Current `.habitat/**/rule.json` manifests as corpus and placement evidence.
6. Current source code, package docs, and canonical architecture docs as
   constructibility and ownership evidence.

Do not use current `_blueprints/<candidate>` folder names as ontology. They
are candidate labels only.

## Current Corpus

Full baseline at frame creation:

| Metric | Count |
| --- | ---: |
| Live rule manifests | 126 |
| Live `_blueprints` manifests | 21 |
| `_blueprints` rows processed in domino receipts | 0 |
| Candidate pockets | 11 |
| Top-level areas | 5 |

Active Civ7 slice:

| Metric | Count |
| --- | ---: |
| Active Civ7 `_blueprints` manifests | 9 |
| Active Civ7 candidate pockets | 6 |
| Active top-level areas | 2 |
| Deferred non-Civ7 `_blueprints` manifests | 12 |

The full remaining `_blueprints` corpus is recorded here so later agents can
see what is intentionally deferred, but the next implementation turn should
scope only to `civ7/resources` and `civ7/platform`.

| Area | Candidate pocket | Rule ids |
| --- | --- | --- |
| `civ7/resources` | `civ7-map-policy` | `block_hand_edits_to_generated_map_policy_tables`, `ensure_map_policy_dependency_independence`, `preserve_evidence_provenance_labels` |
| `civ7/resources` | `civ7-types` | `block_hand_edits_to_generated_civ7_types` |
| `docs` | `docs-site` | `require_docs_site_root_inputs`, `validate_docs_site_config_inputs`, `verify_docs_site_link_integrity` |
| `docs` | `mapgen-canonical-docs` | `require_mapgen_doc_ground_truth_anchors_heading`, `require_mapgen_doc_mini_toc_shape`, `validate_mapgen_docs_anchors_and_references` |
| `civ7/platform` | `civ7-adapter` | `enforce_adapter_only_base_standard_imports`, `prohibit_adapter_local_legacy_generator_logic` |
| `civ7/platform` | `control-orpc` | `preserve_transport_pure_orpc_contracts` |
| `civ7/platform` | `direct-control-session` | `require_sanctioned_direct_control_session_owners` |
| `civ7/platform` | `intelligence-bridge` | `require_narrow_game_ui_bridge_bootstrap` |
| `global/workspace` | `project-boundary-model` | `enforce_workspace_import_boundaries`, `validate_boundary_taxonomy_against_workspace_graph` |
| `habitat/toolkit` | `cli` | `verify_habitat_cli_smoke_contract` |
| `habitat/toolkit` | `grit-provider` | `prohibit_product_scan_roots_in_grit_provider` |
| `habitat/toolkit` | `service-module` | `validate_habitat_service_module_file_shape`, `validate_habitat_service_module_root_topology` |

Active Civ7 rows:

| Area | Candidate pocket | Rule ids |
| --- | --- | --- |
| `civ7/resources` | `civ7-map-policy` | `block_hand_edits_to_generated_map_policy_tables`, `ensure_map_policy_dependency_independence`, `preserve_evidence_provenance_labels` |
| `civ7/resources` | `civ7-types` | `block_hand_edits_to_generated_civ7_types` |
| `civ7/platform` | `civ7-adapter` | `enforce_adapter_only_base_standard_imports`, `prohibit_adapter_local_legacy_generator_logic` |
| `civ7/platform` | `control-orpc` | `preserve_transport_pure_orpc_contracts` |
| `civ7/platform` | `direct-control-session` | `require_sanctioned_direct_control_session_owners` |
| `civ7/platform` | `intelligence-bridge` | `require_narrow_game_ui_bridge_bootstrap` |

Deferred pockets by default:

| Area | Reason deferred |
| --- | --- |
| `docs/**` | Documentation authority can use this loop later, but it is not part of the immediate Civ7 blueprint organization slice unless a docs rule is actually hidden Civ7 blueprint authority. |
| `global/workspace/**` | Project boundary modeling needs separate design and stronger opinions before movement unless a row is actually hidden Civ7 blueprint authority rather than workspace-boundary authority. |
| `habitat/toolkit/**` | Toolkit self-authority is recursive and needs separate design care unless a row is actually hidden Civ7 blueprint authority rather than Toolkit implementation authority. |

Full runner/category profile:

| Profile | Count |
| --- | ---: |
| `habitat` runner | 14 |
| `grit` runner | 6 |
| `nx` runner | 1 |
| `boundary` category | 8 |
| `structure` category | 5 |
| `output` category | 3 |
| `quality` category | 3 |
| `contract` category | 2 |

## Workstream Shape

Run this as one systematic Civ7 workstream with repeated domino loops. Each
loop should be separately commit-sized and receipt-backed. Do not try to make
one mega-commit for all 9 active rows unless the implementation proves purely
mechanical after the resources loop.

Active sequence:

1. `civ7/resources`
2. `civ7/platform`

Deferred sequence, not part of the next implementation request unless the
hidden-Civ exception is triggered:

1. `docs`
2. `global/workspace`
3. `habitat/toolkit`

This order keeps the immediate work on Civilization authority pockets with
known package/domain documentation. Resources is lower-risk generated-resource
surface work. Platform has service and runtime boundaries and should follow
after the resources loop has proven the method. Workspace boundary modeling
and Toolkit self-authority are intentionally left to a later, more careful
design pass. The only active exception is hidden Civ7 authority: if a deferred
row's full predicate governs a Civ7 kind or Civ7 operating area rather than
docs/workspace/toolkit itself, process it with the relevant Civ7 pocket instead
of leaving it parked by directory.

## One Full Domino Loop

Each pocket or adjacent pocket group should run this full loop.

### Stage 0: Preflight And Scope Lock

Inputs:

- current branch and dirty state;
- current `_blueprints` manifest list;
- authority docs and relevant owner docs;
- current ledger rows for scoped rule ids.

Actions:

1. Confirm the worktree is clean before editing.
2. Recount live `_blueprints` rows and scoped pocket rows.
3. Scan deferred non-Civ7 `_blueprints` rows for hidden Civ7 ownership:
   include a row only when its whole predicate governs the Civ7 owner being
   processed rather than docs, workspace, or Toolkit authority.
4. Name the scoped write set before edits.
5. Name protected paths and generated outputs.
6. Decide whether the loop covers one pocket or a small adjacent group.

Stop if the branch is dirty with unrelated edits or if the selected pocket
depends on unresolved downstack movement.

### Stage 1: Investigation, Metrics, And Evidence

Produce a compact pocket inventory before deciding destinations.

For every scoped rule, capture:

- rule id;
- current path;
- current manifest placement;
- runner and support files;
- `ownerProject`;
- `pathCoverage`;
- `forbids`, `why`, and `message`;
- source paths scanned or enforced by the rule;
- existing package or domain docs that name the owner.

Required metrics:

- row count by candidate pocket;
- runner/category mix;
- exact source roots scanned;
- number of rows that are exact single-package or single-doc-surface checks;
- number of rows that cross packages, owners, or execution layers;
- number of rows whose whole predicate is instance-specific.
- number of deferred non-Civ7 rows inspected for hidden Civ7 authority, and
  number pulled into the active scope.

This stage should make visible whether the candidate label is a real kind, a
subsystem context, a package surface, or split debt.

### Stage 2: Ontological Design And Semantic Discernment

Apply the same tests to every candidate label.

#### Blueprint Admission Test

Admit a candidate as top-level `blueprints/<kind>/` only if most answers are
yes and no single answer invalidates the claim:

- Can there be multiple valid instances of this thing?
- Can Habitat identify an instance by manifests, roots, package surfaces,
  generated outputs, or contract files?
- Could Habitat generate, validate, repair, or migrate an instance of it?
- Do the scoped rules describe what must hold for every valid instance?
- Can the current concrete instance be named separately from the kind?
- Is the thing narrower than a niche and broader than a single defect rule?

#### Honest Niche Test

Move to niche or child-niche `rules/` when:

- the rule governs a package, service, site, docs surface, resource surface,
  subsystem, or operating area;
- another valid instance could implement the same kind differently;
- the row is source-backed current context authority, even if it may later be
  generalized; and
- a new blueprint would only reify a package name, runner name, current
  directory, or output label.

#### Remainder Test

Move to `_remainder` only when:

- the rule mixes two or more real owners;
- the rule needs a source-obvious split before it can be honest authority;
- the rule is a negative cleanup guard that should be replaced by a positive
  rule later;
- the destination would require a new enforcement surface not built in this
  loop; or
- keeping the row in `rules/` would falsely imply current live authority.

Every `_remainder` row must get a pending action in the ledger and domino
receipt. "Look again later" is not a pending action.

#### Rejection Test

Reject candidate labels that are only:

- current folder names;
- package names without constructible instance grammar;
- runner classes;
- output/result labels;
- defect labels;
- broad infrastructure nouns;
- local service implementation roles;
- one current product instance.

### Stage 3: Decision Matrix

Before moving files, write the pocket decision matrix in working notes or
directly into the domino receipt draft:

| Rule | Decision | Destination | Reason | Pending action |
| --- | --- | --- | --- | --- |

Allowed decisions:

- `admit blueprint`
- `move to niche rules`
- `move to child-niche rules`
- `move to remainder`
- `delete obsolete`
- `pull hidden Civ7 row into scope`
- `leave for later pocket` only when the row is outside the current scope

Decision requirements:

- One row, one decision.
- Whole-rule fit is mandatory for blueprint admission.
- If a new child niche is created, name why it is an operating area rather than
  a renamed bucket.
- If a row remains in `_remainder`, name the future action and trigger.

### Stage 4: Implementation And Physical Moves

Make the physical tree match the decision matrix.

For each moved packet:

1. Move the entire packet directory.
2. Update `rule.json`:
   - `placement.niche`
   - `placement.blueprint`
   - `placement.category` only if the prior category was wrong
   - `supportFiles.baseline`
   - runner file paths
3. Repair relative imports inside `check.*` files when packet depth changes.
4. Keep rule ids stable.
5. Do not rewrite rule behavior unless the decision matrix explicitly calls
   for a split or deletion.
6. Remove empty `_blueprints` directories.

If behavior changes are needed, stop and decide whether the loop has become a
split/rewrite domino rather than a placement domino.

### Stage 5: Review Loop

Use four review lanes. These can be agents or local review passes, but the
outputs must be reflected in the receipt.

| Lane | Accountability | Review question |
| --- | --- | --- |
| Corpus auditor | Completeness | Did every scoped `_blueprints` row receive exactly one disposition? |
| Semantic reviewer | Ontology | Did any move admit a folder label, package name, runner, or output label as a fake blueprint? |
| Interface reviewer | Execution | Do manifests, support files, runner files, imports, path coverage, and generated execution-surface records still resolve? |
| Closure reviewer | Process | Did dominoes, ledger, authority docs, and verification evidence match the final tree? |

Accepted P1/P2 findings block closure. If a finding says a row was moved to an
over-broad label, repair the destination instead of adding explanatory prose to
justify the weak label.

### Stage 6: Documentation, Ledger, And Corpus Repair

Required updates for each loop:

- Add or update the relevant disposition receipt under
  `.habitat/.active/dominoes/items/`.
- Update `.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-remediation-layer1-action-matrix.json` for every scoped row.
- Update `.habitat/AUTHORITY.md` if a current niche is added, removed, or
  renamed.
- Update `.habitat/AUTHORITY-TREE-SHAPE.md` if the loop establishes a new
  general placement precedent.
- Update the relevant frame document only when the method changes.
- Regenerate execution-surface docs if any rule path or runner file path
  changes.

The ledger is the corpus control surface. The receipt explains why the moves
were made. Do not let one substitute for the other.

### Stage 7: Verification And Closure

Minimum checks per loop:

```bash
find .habitat -path '*/_blueprints/*/rule.json' -print | wc -l
bun habitat check --rule <each moved-or-touched-rule> --json
bun habitat classify .habitat
git diff --check
```

Also run:

- support file and runner file resolution check over all live `rule.json`
  manifests;
- ledger row count check: one matrix row per live manifest;
- stale placement scan for the processed candidate pocket;
- execution-surface regeneration when paths move;
- broader owner checks only when they are expected to be meaningful for the
  touched scope. If a broad owner check fails on unrelated pre-existing
  hygiene, record the failing rule and do not run broad fixers over unrelated
  files.

Close only when:

- the processed `_blueprints` pocket is physically gone or explicitly reduced;
- every scoped row has a receipt and ledger update;
- selected-rule checks pass;
- path references resolve;
- the worktree is clean after commit.

## Pocket-Specific Starting Hypotheses

These are hypotheses, not decisions. Re-read source before moving.

### Domino A: `civ7/resources`

Scope:

- `civ7-map-policy`
- `civ7-types`

Starting read:

- `civ7-map-policy` likely describes an official-resource-derived package
  surface, not necessarily a reusable blueprint kind.
- `civ7-types` likely describes generated Civ7 runtime declaration output,
  probably a resource child-niche or protected generated-output context.

Likely outcomes:

- Move rows to `civ7/resources/map-policy/rules` and
  `civ7/resources/civ7-types/rules`, unless source proves a constructible kind
  worth admitting.
- Use `_remainder` only for rows that mix protected generated-output guards
  with package dependency policy in one predicate.

Do not create:

- `generated-output` blueprint;
- `resource-output` blueprint;
- generic `official-resource` blueprint without constructibility proof.

### Deferred Domino B: `docs`

Not part of the next active Civ7 implementation slice unless source inspection
proves a row is hidden Civ7 blueprint authority.

Scope:

- `docs-site`
- `mapgen-canonical-docs`

Starting read:

- `docs-site` is likely a documentation publishing/site operating area.
- `mapgen-canonical-docs` is likely a docs authority context for canonical
  MapGen docs, not a blueprint kind.

Likely outcomes:

- Move to `docs/site/rules` and `docs/mapgen-canonical/rules`, or a similarly
  honest docs child-niche naming if current docs authority uses another
  convention.
- Keep all three MapGen canonical docs rows together unless one is actually a
  general docs rule.

Do not create:

- `docs-site` top-level blueprint just because the docs app is buildable;
- `mapgen-canonical-docs` blueprint unless a constructible canonical-doc type
  exists with reusable instance grammar.

### Domino C: `civ7/platform`

Scope:

- `civ7-adapter`
- `control-orpc`
- `direct-control-session`
- `intelligence-bridge`

Starting read:

- This is the first semantically harder pocket.
- `civ7-adapter` may be an honest platform child niche or an admitted kind,
  depending on whether rules describe every adapter instance or the current
  package boundary.
- `control-orpc`, `direct-control-session`, and `intelligence-bridge` look
  like service/subsystem boundaries before they look like blueprint kinds.

Likely outcomes:

- Move most rows to platform child-niche `rules` lanes.
- Admit a blueprint only if source proves constructible multiplicity and
  reusable instance grammar.
- Use `_remainder` for rules that mix runtime session lifecycle, Studio/server
  ownership, and platform package boundaries.

Do not create:

- generic `adapter-boundary` blueprint;
- generic `runtime-session` blueprint;
- `bridge` blueprint by label affinity.

### Deferred Domino D: `global/workspace`

Not part of the next active Civ7 implementation slice unless source inspection
proves a row is hidden Civ7 blueprint authority rather than workspace-boundary
authority.

Scope:

- `project-boundary-model`

Starting read:

- This may be the strongest remaining candidate for an actual blueprint/model:
  it has graph tags, taxonomy, Nx boundaries, and validation against workspace
  facts.
- It also may simply be global workspace structure authority.

Likely outcomes:

- If constructibility passes, admit `project-boundary-model` or a better name
  under top-level `blueprints/`.
- If not, move to `global/workspace/rules` with exact pending action for what
  would be needed to make the model constructible.

Do not create:

- `graph` blueprint;
- `nx-boundary` blueprint;
- `workspace-project` blueprint as a side effect.

### Deferred Domino E: `habitat/toolkit`

Not part of the next active Civ7 implementation slice unless source inspection
proves a row is hidden Civ7 blueprint authority rather than Toolkit
self-authority.

Scope:

- `cli`
- `grit-provider`
- `service-module`

Starting read:

- Highest recursion risk because Habitat is governing itself.
- `service-module` may be a real constructible kind if the Toolkit has a
  reusable module anatomy and validation grammar.
- `cli` and `grit-provider` are likely Toolkit operating areas unless their
  rules govern reusable constructible kinds.

Likely outcomes:

- Consider admitting `service-module` only after source inspection of Toolkit
  service module shape.
- Move `cli` and `grit-provider` to honest Toolkit child-niche rules if they
  are package/service area authority.
- Use `_remainder` for rows whose real owner is Toolkit source architecture
  but whose current check is a temporary migration guard.

Do not create:

- `cli` blueprint from command UX alone;
- `provider` blueprint from one provider implementation;
- runner-derived ontology.

## Team Design

Use an orchestrator-plus-review-lanes topology.

Accountable owner:

- Owns the decision matrix, file moves, receipt, ledger updates, verification,
  and final commit.

Parallel or local review lanes:

- Corpus auditor: verifies scoped rows, paths, counts, and no hidden leftover
  `_blueprints`.
- Semantic reviewer: adversarially checks whether a destination is a real kind
  or an empty relabel.
- Interface reviewer: verifies manifests, runner/support references, imports,
  and execution-surface regeneration.
- Closure reviewer: verifies domino receipt, ledger, docs, tests, and clean
  worktree.

If agent capacity is unavailable, the owner must still run the four review
lanes locally and record that in the receipt.

## Review Mandate

Before closing a loop, answer these:

- Did every scoped `_blueprints` row get exactly one disposition?
- Did any rule move because of name affinity rather than source-backed owner
  evidence?
- Did any newly created niche describe a governed operating area rather than a
  catch-all bucket?
- Did any newly admitted blueprint pass constructibility, multiplicity, and
  instance contrast?
- Did every `_remainder` row receive a concrete future action?
- Do manifests, support files, runner files, and generated execution-surface
  records match the final physical tree?
- Does the ledger now let a later agent know what is processed versus still
  unprocessed?

## Expected End State

After the active Civ7 dominoes:

- `find .habitat/civ7 -path '*/_blueprints/*/rule.json'` returns zero rows,
  unless a row is explicitly deferred with a source-backed reason.
- The Civ7 authority tree has no unprocessed candidate-blueprint layer.
- Every former Civ7 `_blueprints` row has an explicit domino receipt.
- Any non-Civ7 row pulled in by the hidden-Civ exception has an explicit
  receipt and no longer hides Civ7 authority under its old directory.
- `.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-remediation-layer1-action-matrix.json` has current paths,
  placements, dispositions, and pending actions for all scoped rows.
- Any new blueprint directories are source-backed constructible kinds.
- Any new child niches are governed operating areas, not renamed output or
  implementation-detail buckets.
- Any residual `_remainder` rows have concrete split, consolidation,
  replacement, or retirement actions.
- Deferred docs, workspace, and Toolkit `_blueprints` rows may remain for
  later design work when they are not hidden Civ7 authority.

## Falsifiers

Stop and reframe if:

- a pocket needs broad source rewrites before any honest move can be made;
- more than half the rows in a pocket need splitting before placement;
- a proposed destination is only a synonym for the old candidate folder;
- a new blueprint would be named after a runner, output file, package name, or
  current defect;
- verification requires touching unrelated generated or protected files;
- the branch is affected by concurrent restack changes that alter the scoped
  corpus.

## Next-Turn Implementation Prompt

Use this prompt to resume implementation:

```text
Continue from branch `codex/swooper-standard-recipe-sorting` in
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame`.

Read `.habitat/.active/frames/UNDERSCORE-BLUEPRINT-BURNDOWN-FRAME.md` as the
controlling frame. Execute the active Civ7 `_blueprints` burn-down as a
systematic workstream, one domino loop at a time, in this order:

1. `civ7/resources`
2. `civ7/platform`

Leave `docs`, `global/workspace`, and `habitat/toolkit` `_blueprints` pockets
out of scope for now because they require separate design care. Exception:
before each Civ7 loop, scan deferred non-Civ7 `_blueprints` rows for hidden
Civ7 authority. Pull in a deferred row only when its whole predicate actually
governs the Civ7 owner being processed rather than docs, workspace, or Toolkit
authority, and record why the old directory hid the real owner.

For each loop: re-count the scoped corpus, inspect source-backed ownership,
build the decision matrix, make physical packet moves, update manifests,
update the relevant `.habitat/.active/dominoes/items/` record, update
`.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-remediation-layer1-action-matrix.json`, update authority docs if
niches or blueprints change, regenerate execution-surface docs if paths move,
run selected-rule checks, verify support/runner refs and ledger coverage, and
commit through Graphite. Do not create renamed catch-all buckets. Admit a
blueprint only when it passes constructibility and whole-rule ownership.
Use `_remainder` only with concrete pending split/consolidation/replacement or
retirement actions.
```
