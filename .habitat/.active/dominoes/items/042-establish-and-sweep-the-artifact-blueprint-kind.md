# Domino 042: Establish And Sweep The Artifact Blueprint Kind

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Indexed Result

`artifact` was affirmed as the immutable MapGen data-product blueprint kind and `.habitat/blueprints/artifact/` was created. The 24 artifact-vocabulary manifest rows were re-read: no existing row moved to live artifact authority, because each whole predicate was dependency-tag, domain, domain-operation, mod-map, standard-recipe context, Studio context, build-output, or unresolved projection/artifact debt. A later artifact-shape ratchet admitted `require_artifact_file_shape` as live artifact blueprint authority for `*.artifact.ts` owner files and `require_artifact_index_aggregate_shape` as live artifact blueprint authority for `artifacts/index.ts` aggregate surfaces.

## Detail

#### 42. Establish And Sweep The Artifact Blueprint Kind

Purpose: admit `artifact` as the real immutable data-product blueprint kind,
then use it as a concrete destination while re-reading the bounded current
artifact-vocabulary rule set. This is a staged domino, not a broad corpus
campaign.

Stage 1: artifact kind creation.

- Use `.habitat/.active/frames/BLUEPRINT-KIND-GATHERING-FRAME.md` as the method frame.
- Affirm `artifact` from source-backed constructibility evidence:
  `docs/system/libs/mapgen/reference/ARTIFACTS.md`,
  `docs/system/libs/mapgen/how-to/add-a-new-artifact.md`,
  `packages/mapgen-core/src/authoring/artifact/**`,
  `packages/mapgen-core/src/core/types.ts`, and current Swooper Maps artifact
  definitions.
- Create `.habitat/blueprints/artifact/` as affirmed blueprint authority.
- Include artifact contracts inside artifact authority; do not create an
  `artifact-contract` sibling blueprint.
- Keep `dependency-tag` separate: `artifact:*` remains a dependency-tag prefix
  when the rule governs edge/tag ids rather than artifact values.

Stage 2: bounded artifact-vocabulary sweep.

- Analyze the `24` live rule manifests that currently mention artifact
  vocabulary.
- Decision set for each row:
  - move to `.habitat/blueprints/artifact/<rule-id>/` only when the whole
    predicate governs every valid artifact value/contract: stable id, schema,
    immutable publish/read behavior, artifact helper surface,
    producer/consumer contract, value-store semantics, or buffer exception;
  - keep the row in its current honest context when artifact language is
    incidental to another owner, such as dependency-tag, domain,
    domain-operation, mod-map, Studio recipe-DAG, standard-recipe parity, or
    generated-output hygiene;
  - if the rule clearly points at artifact blueprint authority but cannot move
    whole because it needs a split, rewrite, or inversion from current owner
    language, either leave it in the smallest honest `_remainder` with an
    explicit pending action or move it to an artifact-local `_remainder` only
    after documenting that lane as sorted artifact-blueprint debt, not live
    artifact authority;
  - do not introduce `_triage`; the existing `_remainder` lane is the visual
    marker for reviewed-but-not-admitted debt.
- Update `.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json` for every inspected
  row, including explicit non-moves and pending actions.
- Record the disposition receipt in this file so future agents can tell which
  artifact-vocabulary rows have been processed.

Current preflight metrics:

- Live rule manifests: `126`.
- Artifact-vocabulary live rule manifests: `24`.
- Artifact-vocabulary rows already in top-level blueprints: `7`.
- Artifact-vocabulary rows in context/remainder/candidate lanes: `17`.
- Artifact-vocabulary rows still under `_blueprints`: `1`
  (`verify_visualization_runtime_build_artifacts`, likely generic build output
  rather than product artifact authority).
- Source-side constructibility evidence is strong:
  `82` `defineArtifact(...)` calls, `70` `artifact:*` ids, `56` contract
  `artifacts: { ... }` blocks, and `261` `deps.artifacts` reads/publishes in
  current MapGen source scopes.

Done Means:

- `.habitat/blueprints/artifact/` exists.
- The bounded 24-row artifact-vocabulary set has been read and dispositioned.
- Whole-rule artifact authority moved to artifact.
- Artifact-pressure rows that cannot move whole have explicit pending actions
  in the ledger and, if physically moved under artifact `_remainder`, are
  clearly marked as not-yet-live blueprint authority.
- Non-fitting rows remain in honest existing authority lanes with evidence for
  why artifact is not their owner.
- The rule ledger and execution-surface map reflect the final tree.

Dependencies:

- Dependency-tag gathering has landed.
- The artifact term-closure migration has landed, so Habitat metadata no
  longer uses generic `artifact` as a rule category or operation concept.

Proof:

- Focused rule checks pass for the inspected 24-row artifact-vocabulary corpus.
- Manifest path proof and stale-reference scans pass.
- The final receipt distinguishes artifact value/contract authority from
  dependency-tag, projection, config, and garbage pressure.

Disposition receipt:

- Created `.habitat/blueprints/artifact/README.md` as the affirmed blueprint
  marker. No `rule.json` packet was admitted under the blueprint from the
  initial 24-row vocabulary sweep.
- Later admitted `.habitat/blueprints/artifact/require_artifact_file_shape/`
  as live artifact blueprint authority. It requires every
  `mods/mod-swooper-maps/src/**/artifacts/*.artifact.ts` owner file to expose
  stable `Schema`, `artifact = defineArtifact(...)`, and `validate(...)`
  exports, and bans semantic artifact alias and semantic validation/assertion
  export names.
- Later admitted
  `.habitat/blueprints/artifact/require_artifact_index_aggregate_shape/` as
  live artifact blueprint authority. It requires every
  `mods/mod-swooper-maps/src/**/artifacts/index.ts` aggregate file to import
  sibling artifact modules as namespaces, export `artifactContracts`, and
  export `validators` as the corresponding `.validate` surfaces without
  embedding schema or validation logic in the barrel.
- Primary corpus is exactly the `24` live manifests whose `rule.json` text
  mentions artifact vocabulary. Adjacent runner/body-only artifact text was
  reviewed as exclusion evidence, not added to the primary manifest corpus.
- Runner/body-only exclusions: `prohibit_relative_domain_reaches_from_recipes_and_maps`
  stays domain public-surface authority; `require_domain_contract_roots_in_step_contracts`
  stays recipe-step authority; `prohibit_recipe_dag_runtime_source_dependencies`
  and `require_recipe_dag_contract_metadata` stay Studio recipe-DAG authority.
- No artifact-local `_remainder` was introduced. The one artifact-pressure row,
  `prohibit_realized_map_artifact_tags`, stays in `map-output/_remainder`
  because it is still unresolved projection/artifact debt, not live artifact
  blueprint authority.

| Rule | Final disposition | Why not artifact authority | Pending action |
| --- | --- | --- | --- |
| `require_typed_dependency_and_effect_tag_constants` | retained dependency-tag blueprint | `artifact:*` is dependency-edge vocabulary inside `requires`/`provides`, not artifact values. | Generalize only if dependency-tag rules later cover broader registry use. |
| `prohibit_domain_ops_projection_effect_dependencies` | retained domain-operation blueprint | Governs operation purity against map projection/effect keys in domain ops. | Revisit only if future dependency-tag import/placement rules absorb it without weakening operation authority. |
| `prohibit_domain_artifacts_modules` | retained domain blueprint | Bans retired domain `artifacts.ts` topology. | No artifact action; keep with domain topology. |
| `prohibit_domain_tag_artifact_shim_imports` | retained domain blueprint | Protects retired domain shim imports. | No artifact action; keep with domain public-surface governance. |
| `prohibit_retired_domain_root_catalogs` | retired by Domain Source Topology closure | Domain-root tag/artifact catalogs are owned by domain-source topology, not artifact authority. | Deleted in `domain-root-topology-delete-absorbed-root-shape-rules-001`; `require_domain_source_topology` is the survivor authority. |
| `block_studio_config_leakage_into_shipped_catalog` | retained mod-map blueprint | Shipped catalog metadata is a mod-map output surface. | Keep with mod-map shipped catalog authority. |
| `validate_generated_map_entrypoint_contracts` | retained mod-map blueprint | Generated map entrypoint contracts are mod-map output authority. | Keep with mod-map generated entrypoint authority. |
| `preserve_decomposed_foundation_contract_surfaces` | retained foundation context rules | Artifact tags are one part of a foundation currentness guard. | Keep contextual until a future split names a positive artifact rule. |
| `preserve_morphology_contracts_and_overlay_ownership` | retained morphology `_remainder` | Mixed belt-driver contract and story-overlay ownership pressure. | Split or project through a future narrative/overlay boundary frame. |
| `prohibit_runtime_continent_step_tokens` | retained morphology `_remainder` | Runtime continent implementation-token cleanup; artifact language is incidental. | Split cross-domain implementation cleanup before promotion. |
| `prohibit_realized_map_artifact_tags` | retained map-output `_remainder` | Unresolved realized-map truth/projection pressure; not safe as artifact authority. | Run `PROJECTION-CONTRACT-SURFACE-FRAME.md` or decide garbage/projection owner. |
| `prohibit_legacy_plate_driver_and_plot_mountains_dependencies` | retained standard-recipe `_remainder` | Concrete retired dependency cleanup across selected standard-recipe files. | Split morphology contract cleanup from map-morphology implementation cleanup. |
| `prohibit_map_projection_dependencies_in_physics_contracts` | retained recipe-wide standard-recipe rules | Protects standard-recipe physics contracts from map projection dependencies. | Revisit only if physics contract families become parameterized projection-surface authority. |
| `verify_standard_recipe_artifacts_match_source_stages` | retained recipe-wide standard-recipe rules | Generated standard-recipe output parity is scoped to one recipe instance. | Keep contextual until projection/output parity is parameterized. |
| `prohibit_foundation_projection_legacy_motion_source` | retained foundation stage rules | Exact foundation projection step consumer guard. | Revisit only if a projection-step surface absorbs related cleanup rows. |
| `prohibit_migrated_consumer_effect_gating_tokens` | retained map stage rules | Guards one migrated map-hydrology consumer contract from retired gates. | Revisit during cleanup or dependency-tag lifecycle work. |
| `prohibit_misplaced_projection_adapter_calls` | retained map stage rules | Projection adapter callsite ownership, not artifact value authority. | Revisit after a parameterized projection-step or recipe-step callsite model exists. |
| `prohibit_morphology_dual_read_tokens` | retained morphology stage rules | Transitional morphology-coasts dual-read cleanup. | Retire when the migration cleanup is obsolete. |
| `prohibit_morphology_stage_config_bag_imports` | retained morphology stage rules | Morphology-stage import-boundary rule. | Revisit when consumer-side config facade rules are named generally. |
| `prohibit_morphology_story_overlay_contract_artifact` | retired by narrative burn-down | Current story overlay artifacts and compatibility types were removed. | Future story artifacts start from positive owner authority. |
| `prohibit_runtime_continent_contract_tokens` | retained morphology stage rules | Contract/runtime-token separation in morphology contracts and artifact files. | Revisit when runtime-token forbids become positive contract-surface rules. |
| `ensure_studio_worker_bundle_is_browser_safe` | retained Studio browser-worker rules | Studio worker runtime safety; artifacts are allowed boundary text, not owner. | Revisit only if a future worker blueprint admits shared browser-worker requirements. |
| `require_studio_ui_recipe_artifact_imports` | retained Studio recipe-DAG rules | Studio UI/recipe-DAG import boundary for recipe artifacts. | Split later if UI artifact consumption becomes broader than recipe-DAG. |
| `verify_visualization_runtime_build_artifacts` | then-retained visualization `_blueprints` candidate; superseded by Domino 43 | Required `dist` build outputs, not product artifact contracts. | Process in targeted `_blueprints`/runtime-dependencies candidate pruning; completed by Domino 43 demotion to visualization `rules/`. |

Review disposition:

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| Reconcile the artifact row universe before moving anything. | P1 | accepted | Receipt defines 24 manifest-hit rows plus 4 runner/body-only exclusions. |
| Do not admit rows whose whole rule is dependency, domain, projection, generated-output, Studio, or context authority. | P1 | accepted | No live rule packet moved under `blueprints/artifact` from the initial 24-row sweep; later artifact-owner file shape authority moved only after a separate positive shape model was accepted. |
| Treat `prohibit_realized_map_artifact_tags` as projection/artifact debt, not live artifact authority. | P2 | accepted | Row retained in `map-output/_remainder`; ledger pending action updated. |
| Verification must prove movement, not just selection. | P2 | accepted | No rule movement occurred; closure proof uses corpus counts, path proof, classify, and diff checks. |
