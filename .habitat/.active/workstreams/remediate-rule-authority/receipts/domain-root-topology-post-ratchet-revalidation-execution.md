# Domain-Root Topology Post-Ratchet Rule Revalidation Execution

Status: reviewed execution record; no rule packets mutated

Scope:
run the active post-ratchet rule revalidation workstream for the completed
Domain-Root Topology ratchet. This record captures classification, DRA
synthesis, decision packets, review disposition, and the next remediation-slice
handoff. It does not delete rule packets, mutate runners, grow baselines, or
move source.

## Container 0: Orientation And Authority Seal

Branch:
`codex/domain-root-rule-revalidation-execution`

Stack:
opened above `codex/rule-revalidation-workstream-plan`.

Corpus parity:

| Measure | Result |
| --- | --- |
| Live `.habitat/**/rule.json` manifests | 114 |
| Ledger rows | 114 |
| Missing live rows | 0 |
| Stale live-ledger rows | 0 |

Ratchet authority proof:

| Command | Result | Proof label | Proof limit |
| --- | --- | --- | --- |
| `bun habitat check --json --rule require_domain_source_topology` | pass | Habitat wrapper behavior | Does not by itself prove absorption or safe deletion. |
| `bun habitat check --json --rule require_domain_ops_binding_surface` | pass | Habitat wrapper behavior | Does not by itself prove absorption or safe deletion. |
| `bun habitat check --json --rule require_domain_ops_registry_surface` | pass | Habitat wrapper behavior | Does not by itself prove absorption or safe deletion. |
| `bun habitat check --json --rule require_domain_operation_contract_file_shape` | pass | Habitat wrapper behavior | Does not by itself prove absorption or safe deletion. |
| `bun habitat classify mods/mod-swooper-maps/src/domain` | pass | Routing/classification evidence | Names relevant routing, not semantic deletion authority. |

NARSIL:
`mcp__narsil_code_intel_civ7.validate_repo` confirmed the worktree is a readable
Git repository. `search_chunks` was used as discovery only and cross-checked
against current files and Habitat commands.

## Containers 1-3: Pre-Filter And Lane Analysis

Candidate formation:

- 33 rule ids had current `.habitat` rule-file term evidence tied to domain
  source topology, domain operation surfaces, artifact surfaces, public domain
  surfaces, recipe-stage authoring, or adjacent residuals.
- Additional lane candidates were admitted from the active workstream lane
  definitions when current manifest/path evidence made them plausible.
- Broad ledger text search was rejected as too permissive because it returned
  103 rows and mostly reflected old receipt vocabulary.

Lane agents were read-only. They did not edit, stage, or commit.

| Lane | Agent label | Outcome |
| --- | --- | --- |
| Retired Domain-Root Layout Guards | Lane 1 agent | Six row records returned. |
| Domain Operation Surface Law | Lane 2 agent | Eleven row records returned. |
| Public Domain Import Boundaries | Lane 3 agent | Six row records returned. |
| MapGen Artifact Owner Surfaces | Lane 4 agent | Six row records returned. |
| Recipe Stage Authoring Surface | Lane 5 agent | Eight row records returned. |
| Source-Domain Residuals And Exclusion Guard | Lane 6 agent | Nine row records returned. |

### Compact Row Records

These compact records are the durable audit surface for this execution. They do
not replace the operational ledger row text.

| Rule | Scope result | Action decision | Rationale | Residual risk or dependency |
| --- | --- | --- | --- | --- |
| `require_domain_source_topology` | admitted context | context admission | Positive topology ratchet is the absorber for direct domain-root shape. | None for this pass. |
| `require_domain_model_schema_policy_owner_shape` | admitted context | context admission | Confirms model/schema/policy ownership adjacent to the topology ratchet. | None for this pass. |
| `require_domain_ops_binding_surface` | admitted context | context admission | Live operation binding surface law after the ratchet. | None for this pass. |
| `require_domain_ops_registry_surface` | admitted context | context admission | Live operation registry surface law after the ratchet. | None for this pass. |
| `require_domain_operation_contract_file_shape` | admitted context | context admission | Positive operation contract file-shape authority. | Possible absorber for op-contract config-bag row needs injected proof. |
| `prohibit_domain_entrypoint_self_reexports` | admitted live | no action | Still protects domain public entrypoint self-reexport shape. | No deletion dependency. |
| `block_adapter_context_imports_from_domain_ops` | admitted live | no action | Domain ops still must not reach adapter context. | No deletion dependency. |
| `block_engine_runtime_imports_from_domain_ops` | admitted live | no action | Domain ops still must stay runtime-neutral. | No deletion dependency. |
| `prohibit_cross_op_runtime_calls` | admitted live | no action | Cross-op runtime execution remains prohibited. | No deletion dependency. |
| `prohibit_domain_ops_projection_effect_dependencies` | admitted live | no action | Projection/effect dependencies remain outside domain ops. | No deletion dependency. |
| `prohibit_rng_callback_state_in_ops` | admitted live | no action | RNG callback state remains outside op implementation. | No deletion dependency. |
| `prohibit_root_config_facade_imports_in_domain_ops` | admitted live | no action | Root config facade import guard remains adjacent to op-contract shape. | May overlap later with op-contract config-bag absorber proof. |
| `prohibit_runtime_orchestration_helpers_in_domain_ops` | admitted live | no action | Runtime orchestration helpers remain outside domain ops. | No deletion dependency. |
| `require_public_domain_surfaces_in_recipes_and_maps` | admitted live | no action | Recipe/map imports remain routed through public domain surfaces. | No deletion dependency. |
| `require_public_domain_surfaces_in_tests` | admitted live | split by owner | Test-file scan remains native because current Grit execution ignores test files. | Existing blocker remains. |
| `require_domain_contract_roots_in_step_contracts` | admitted live | no action | Recipe step contracts still require domain contract roots. | May become home for future step-contract config-facade split. |
| `require_runtime_domain_op_bundle_imports` | admitted live | no action | Runtime import bundle law remains live. | No deletion dependency. |
| `prohibit_recipe_imports_in_domain_source` | admitted live | no action | Domain source must not import recipe layer. | No deletion dependency. |
| `require_morphology_public_surface_imports` | admitted live | no action | Morphology public-surface import law remains live. | No deletion dependency. |
| `require_artifact_file_shape` | admitted context | context admission | Artifact file-shape authority remains green after topology work. | No deletion dependency. |
| `require_artifact_index_aggregate_shape` | admitted context | context admission | Artifact index aggregate shape remains green after topology work. | No deletion dependency. |
| `prohibit_realized_map_artifact_tags` | admitted live | no action | Realized-map artifact-tag guard remains separate from domain topology. | No deletion dependency. |
| `require_recipe_stage_authoring_file_shape` | admitted context | context admission | Recipe-stage authoring shape is adjacent context, not a domain-root deletion owner. | Foundation stage Grit rows are not acted on in this pass. |
| `verify_standard_recipe_public_authoring_surface` | admitted context | runtime/source validation | Public-authoring verification remains a native/currentness rail, not a static Grit absorber. | Does not authorize deleting Foundation stage Grit rows here. |
| `require_public_ecology_surfaces_and_retired_topology_removal` | admitted context | context admission | Actual Ecology public surface guard remains context for domain topology. | No action in this pass. |
| `prohibit_foundation_decomposed_ops_legacy_internal_imports` | admitted live | no action | Foundation ops legacy-internal import guard remains outside root topology deletion. | No deletion dependency. |
| `prohibit_foundation_legacy_aggregate_tectonic_op_surface` | admitted live | no action | Foundation aggregate op surface guard remains live. | No deletion dependency. |
| `prohibit_foundation_legacy_aggregate_tectonics` | admitted live | no action | Foundation aggregate tectonics guard remains live. | No deletion dependency. |
| `prohibit_retired_domain_root_catalogs` | admitted decision packet | consolidation/dedup | Direct root `tags.ts` and `artifacts.ts` are absorbed by `require_domain_source_topology`. | Review accepted after both injected old shapes failed the absorber. |
| `require_domain_ops_root_presence` | admitted decision packet | consolidation/dedup | Enumerated ops-root presence is absorbed by generic domain-root topology. | Review accepted after injected missing `ops` failed the absorber. |
| `prohibit_domain_artifacts_modules` | admitted decision packet | closed structure inversion | Direct-root clause is absorbed, but nested `artifacts.ts` residual remains. | Deletion blocked until nested topology is positively asserted. |
| `require_ecology_canonical_op_module_topology` | admitted decision packet | closed structure inversion | Actual Ecology rule is a proxy for generic operation-module topology. | Blocked by source-owned topology design. |
| `prohibit_foundation_step_contract_config_bags` | admitted decision packet | split by owner | Step-contract import-boundary pressure and retired token clause require separation. | Future split/generalization slice. |
| `prohibit_foundation_op_contract_config_bags` | admitted decision packet | consolidation/dedup | Op-contract config imports likely consolidate into positive operation contract shape. | Needs injected absorber proof before deletion. |
| `prohibit_foundation_stage_cast_merge_hacks` | out of scope for this ratchet | split by owner | Recipe-stage/Foundation-Studio literal rule lacks a separable domain-root/domain-operation clause. | Prior context-admission records and package tests remain live; no ledger change in this execution. |
| `prohibit_foundation_stage_sentinel_passthrough` | out of scope for this ratchet | boundary inversion | Recipe-stage/Foundation-Studio literal rule lacks a separable domain-root/domain-operation clause. | Prior context-admission records and package tests remain live; no ledger change in this execution. |
| `prohibit_unknown_bag_config_usage` | out of scope | no action | Not tied to the completed domain-root/domain-operation topology ratchet. | Skip. |
| `require_studio_ui_recipe_artifact_imports` | out of scope | no action | Studio recipe-DAG boundary, not this topology blast radius. | Skip. |
| `verify_standard_recipe_artifacts_match_source_stages` | out of scope | no action | Generated-output/source-stage currentness, not this topology blast radius. | Skip. |
| `verify_visualization_runtime_build_artifacts` | out of scope | no action | Runtime/build generated-output verification, not this topology blast radius. | Skip. |
| `prohibit_sibling_stage_private_step_imports` | out of scope | no action | Recipe-stage internal import law without separable domain-root/domain-operation clause. | Skip. |
| `require_shared_visualization_contracts_at_stage_surfaces` | out of scope | no action | Visualization/stage contract surface, not this topology blast radius. | Skip. |
| `prohibit_wrapper_only_advanced_config` | out of scope | no action | Recipe-stage wrapper config guard, not this topology blast radius. | Skip. |
| `preserve_decomposed_foundation_contract_surfaces` | out of scope | split by owner | Foundation contract currentness bundle is larger than this topology pass. | Skip. |
| `prohibit_morphology_stage_config_bag_imports` | out of scope | no action | Morphology stage boundary, not this topology blast radius. | Skip. |
| `prohibit_runtime_local_config_default_merging` | out of scope | no action | Runtime/source validation, not this topology blast radius. | Skip. |

## Container 4: DRA Synthesis

Fresh semantic-decision agents produced read-only packets for rows whose compact
records were insufficient. The DRA synthesis accepted or revised the packet
outcomes below after review.

| Rule | Action decision | Outcome | Implementation state |
| --- | --- | --- | --- |
| `prohibit_retired_domain_root_catalogs` | consolidation/dedup | Consolidate/delete into `require_domain_source_topology`. | Review accepted; queued for a later deletion slice. |
| `require_domain_ops_root_presence` | consolidation/dedup | Consolidate/delete into `require_domain_source_topology`. | Review accepted; queued for a later deletion slice. |
| `prohibit_domain_artifacts_modules` | closed structure inversion | Retain; root clause is absorbed, nested `artifacts.ts` residual remains. | Deletion blocked. |
| `require_ecology_canonical_op_module_topology` | closed structure inversion | Replace later with generic operation-module topology authority. | Blocked by source-owned topology design. |
| `prohibit_foundation_step_contract_config_bags` | split by owner | Split/generalize live step-contract import boundary; delete retired token clause. | Future split/generalization slice. |
| `prohibit_foundation_op_contract_config_bags` | consolidation/dedup | Consolidate operation-contract import clauses into positive operation contract shape; delete retired token residue. | Needs injected absorber proof before deletion. |
| `prohibit_foundation_stage_cast_merge_hacks` | split by owner | Review rejected admission into this ratchet pass. | Out of scope here; prior ledger state stands. |
| `prohibit_foundation_stage_sentinel_passthrough` | boundary inversion | Review rejected admission into this ratchet pass. | Out of scope here; prior ledger state stands. |

## Container 6: Deletion-Proof Candidate Stage

The first detached-worktree probe was invalid because the temporary worktree
lacked the active dependency layout and failed before rule execution. It is not
counted as proof.

The valid proof path used focused injected bad shapes, Habitat checks, and
immediate cleanup. One follow-up direct-root `artifacts.ts` proof was run in the
active worktree and removed before closure.

### Review-Accepted Deletion Candidates

#### `prohibit_retired_domain_root_catalogs`

deleteReason:
direct domain-root `tags.ts` and `artifacts.ts` catalogs are fully absorbed by
the closed domain-root scope in `require_domain_source_topology`.

oldShape:
`mods/mod-swooper-maps/src/domain/<domain>/tags.ts` and direct
`artifacts.ts`.

absorber:
`require_domain_source_topology`.

recurrenceRisk:
denied inside direct domain-root shape because the positive topology rejects
both files at the owner layer.

liveReferenceReconciliation:
rule packet, ledger row, authority-slice receipts, active Slice 001 docs,
domino item 042, and historical Habitat execution-surface/source-check docs
reference the id. A deletion slice must update live ledger/active workstream
references and leave older historical docs as history or archive/regenerate
through their owner.

proof:
injected `mods/mod-swooper-maps/src/domain/ecology/tags.ts` failed
`require_domain_source_topology` with `[unexpected-child]` and also failed the
old rule. A follow-up injected
`mods/mod-swooper-maps/src/domain/ecology/artifacts.ts` also failed
`require_domain_source_topology` with `[unexpected-child]` and failed the old
rule. Current source has no live direct root catalog files.

reviewAcceptance:
accepted after the direct `artifacts.ts` proof was added.

blockedBy:
later remediation-slice opening and live-reference reconciliation.

#### `require_domain_ops_root_presence`

deleteReason:
hardcoded six-domain ops-root presence is fully absorbed by
`require_domain_source_topology`, which requires `ops` for every domain root.

oldShape:
explicit open structure scopes for ecology, foundation, hydrology, morphology,
placement, and resources ops roots.

absorber:
`require_domain_source_topology`.

recurrenceRisk:
denied for missing current or future domain `ops` roots covered by the generic
domain-root topology.

liveReferenceReconciliation:
rule packet, ledger row, operation authority-slice receipt, and Slice 002
prework/execution/review records reference the id. A deletion slice must update
live operational records and preserve historical references as history.

proof:
renaming `mods/mod-swooper-maps/src/domain/ecology/ops` caused
`require_domain_source_topology` to fail with `[missing-required-child]`. The
old rule also failed, proving duplicate coverage for the old shape.

reviewAcceptance:
accepted.

blockedBy:
later remediation-slice opening and live-reference reconciliation.

### Review-Rejected Or Blocked Deletion Candidates

#### `prohibit_foundation_stage_cast_merge_hacks`

Blocked:
review found this recipe-stage/Foundation-Studio literal rule is outside the
domain-root/domain-operation topology admission frame. Existing context-admission
records and package tests still treat the exact predicates as live coverage.
This execution does not change the ledger row or queue deletion.

#### `prohibit_foundation_stage_sentinel_passthrough`

Blocked:
review found this recipe-stage/Foundation-Studio literal rule is outside the
domain-root/domain-operation topology admission frame. Existing context-admission
records and package tests still treat the exact predicates as live coverage.
This execution does not change the ledger row or queue deletion.

#### `prohibit_domain_artifacts_modules`

Blocked:
deletion is unsafe. A refined injected probe placed
`artifacts.ts` under an existing operation support directory:

```text
mods/mod-swooper-maps/src/domain/ecology/ops/resource-score-balance/rules/artifacts.ts
```

`require_domain_source_topology` passed and
`prohibit_domain_artifacts_modules` failed, proving the rule still owns a
residual nested filename guard that current positive topology does not catch.

#### `prohibit_foundation_op_contract_config_bags`

Blocked:
semantic packet says operation-contract import clauses likely consolidate into
`require_domain_operation_contract_file_shape`, but this pass did not run
injected absolute config-facade import probes. Deletion waits for absorber proof
over the exact import forms and retired-token reconciliation.

#### `prohibit_foundation_step_contract_config_bags`

Blocked:
rule needs split/generalization. Live step-contract config-facade import
pressure belongs in recipe-step contract boundary authority; the
`FoundationConfigSchema` clause is retired residue.

#### `require_ecology_canonical_op_module_topology`

Blocked:
actual Ecology rule is an exemplar proxy for generic operation-module topology.
Current positive source topology only partially absorbs it. A generic
source-owned verifier/generator and support-directory exception model must be
designed before mutation.

## Container 7: Fresh Review Gate

Fresh review agents were adversarial and read-only.

| Finding | Disposition |
| --- | --- |
| Foundation stage cast/sentinel rows were falsely selected for deletion in this topology pass. | Accepted. Both rows are removed from the selected deletion slice and left unchanged in the ledger. |
| Direct-root `artifacts.ts` absorber proof was missing for `prohibit_retired_domain_root_catalogs`. | Accepted. Added focused injected proof for direct `artifacts.ts`. |
| Pending-review language could be consumed as mutation authorization. | Accepted. This receipt now uses review-accepted candidate language only after review and keeps mutation in a later slice. |
| Ledger gate state and counts were stale. | Accepted. The ledger now queues a named no-mutation slice and refreshed counts. |
| Compact per-row records were missing. | Accepted. Added compact row records in this receipt. |
| Decision table did not expose exact action labels. | Accepted. Added exact `actionDecision` column. |

## Container 8: Remediation-Slice Handoff

Next slice id:
`domain-root-topology-delete-absorbed-root-shape-rules-001`

Status:
queued for a later remediation branch; no mutation in this execution branch.

Selected rows:

- `prohibit_retired_domain_root_catalogs`
- `require_domain_ops_root_presence`

Excluded adjacent rows:

- `prohibit_foundation_stage_cast_merge_hacks`: out of scope for this ratchet;
  live prior context-admission and package-test coverage remain.
- `prohibit_foundation_stage_sentinel_passthrough`: out of scope for this
  ratchet; live prior context-admission and package-test coverage remain.
- `prohibit_domain_artifacts_modules`: residual nested shape not absorbed.
- `prohibit_foundation_op_contract_config_bags`: absorber proof still needed.
- `prohibit_foundation_step_contract_config_bags`: split/generalization needed.
- `require_ecology_canonical_op_module_topology`: source-owned topology design
  needed.

Allowed write set for later remediation slice:

- selected rule packet directories under `.habitat`;
- active ledger rows and slice metadata;
- active receipt references where they are live operational records;
- generated execution-surface docs only through their owning regeneration path.

Forbidden write set for later remediation slice:

- Foundation stage Grit rule packets selected above as excluded adjacent rows;
- package tests unless the slice is explicitly reframed to include native test
  owner cleanup;
- Habitat baselines except to prove no baseline growth;
- source movement or runner mutation.

Verification for later remediation slice:

- focused checks for surviving absorber rules;
- live manifest/ledger parity;
- no live references to deleted ids outside historical records or regenerated
  docs;
- `bun habitat classify .habitat`;
- `git diff --check`;
- review disposition with accepted P1/P2 findings cleared.

Stop conditions:

- review contests deletion proof;
- live references cannot be reconciled without broad generated-doc churn;
- deleting a packet changes current `bun habitat check` behavior outside the
  selected old shapes.
