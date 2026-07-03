# Command-Check Split Systematic Wave

Status: active workstream on `codex/habitat-command-check-split-systematic-wave`.

## Objective

Split the remaining `needs_split` command-check rows assertion by assertion. Move only proven structural authority into `grit-check`, delegate duplicated assertions to existing narrower rules, and leave topology, graph, currentness, generated-output, and package-runtime semantics out of Grit.

The goal is state-space collapse, not a blanket command-check-to-Grit conversion.

## Source Order

1. User direction for the command-check split wave.
2. `.habitat/.active/frames/FRAME.md`.
3. `docs/projects/habitat-harness/command-check-split-canary/vertical-slice-reference.md`.
4. `docs/projects/habitat-harness/command-check-split-canary/insights.md`.
5. `docs/projects/habitat-harness/source-check-conversion-inventory/matrix.md`.
6. `docs/projects/habitat-harness/source-check-conversion-inventory/grit-capability-notes.md`.
7. Direct rule packets: `rule.json`, `category.md`, `.check.*`, `.pattern.md`, baselines, and adjacent authority.
8. Current package source touched by each command script.
9. Focused Habitat proof output.

## Team Topology

The topology is orchestrator plus lane specialists, followed by review gates.

| Role | Owner | Write Scope | Accountability |
| --- | --- | --- | --- |
| Orchestrator | Current thread | Shared workstream docs, generated analytics, inventory truth, final commit | Branch state, final decisions, proof labeling, integration |
| Domain lane | Agent | `.habitat/civ7/mapgen/domain/**`, `lanes/domain.*` | Four mapgen-domain split rows |
| Pipeline lane | Agent | `.habitat/civ7/mapgen/pipeline/**`, `lanes/pipeline.*` | Three mapgen-pipeline split rows |
| Studio/projection lane | Agent | `.habitat/civ7/mapgen/{studio,map-output}/**`, `lanes/studio-projection.*` | Three studio/projection split rows |
| Platform/docs lane | Orchestrator | `.habitat/civ7/platform/**`, `.habitat/docs/**`, `lanes/platform-docs.*` | Two platform/docs split rows |
| Grit reviewer | Orchestrator review gate | Review ledger only | Challenge weak Grit/non-Grit classifications |
| Proof auditor | Orchestrator review gate | Review/proof ledger only | Coverage, JSONL validity, stale references, proof labels |

## Controlled Rows

- `block_unapproved_base_standard_boundary_leaks`
- `enforce_domain_refactor_boundary_profile`
- `enforce_studio_dev_runner_topology`
- `preserve_decomposed_foundation_contract_surfaces`
- `preserve_morphology_contracts_and_overlay_ownership`
- `preserve_standard_stage_topology_and_path_invariants`
- `prohibit_ecology_fudge_terms_and_legacy_generator_surfaces`
- `require_owned_domain_config_catalog_surfaces`
- `require_projection_calls_in_projection_steps`
- `require_recipe_dag_contract_metadata`
- `validate_mapgen_docs_anchors_and_references`
- `verify_standard_recipe_public_authoring_surface`

## Assertion Dispositions

| Disposition | Use When | Forbidden Use |
| --- | --- | --- |
| `grit-check` | Structural source/Markdown/import/export/identifier/call/path authority with an explicit pattern and focused proof. | Graph traversal, runtime module execution, generated-output parity, warning-policy heuristics. |
| `existing-rule` | A narrower accepted rule already owns the assertion and focused proof can run there. | Merely similar rules with broader/different oracle. |
| `data-driven-topology` | Exact file/tree/order/currentness facts are Habitat structural authority but not source pattern matching. | Runtime behavior or package API semantics. |
| `package-local-validator` | Oracle is package behavior, generated output correctness, API semantics, or command/runtime execution. | Source-shape policy that Grit can express cleanly. |
| `demote-delete` | Duplicate, stale, transitional, compatibility residue, broad heuristic noise, or not worth enforcing. | Live authority without an explicit replacement or accepted narrowing. |

## Lane Workflow

1. Read required grounding and direct packet files.
2. Run or inspect baseline command-check status for the rule.
3. Split each `.check.*` file into assertion rows before editing.
4. Assign one disposition per assertion.
5. Implement only clear, proofable moves.
6. Delete or shrink a `.check.*` only after every branch has a disposition.
7. Record focused proof commands and accepted failures.
8. Return lane JSONL and lane notes for orchestrator synthesis.

## Stop Conditions

- A proposed Grit pattern is broad regex noise rather than structural authority.
- A command script contains a branch with no owner and no explicit demotion.
- Existing-rule delegation cannot be proven with focused rule output.
- Topology/currentness gets hidden in Grit.
- A generated-output or package-runtime oracle would be silently dropped.
- Aggregate command-check failures are new and unlabeled.

## Closure Boundary

This wave closes when the 12 rows are represented in `assertion-corpus.jsonl`, every assertion has a disposition and outcome, proof ledgers distinguish focused proof from known aggregate red, and truth records/analytics match the implemented state.
