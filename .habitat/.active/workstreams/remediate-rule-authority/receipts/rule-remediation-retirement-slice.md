# Rule Remediation Retirement Slice

Status: closed

Branch: `codex/habitat-rule-remediation-garbage-collection`

Source matrix: `.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json`

Action class: `retirement/garbage collection`

Purpose: record the Layer 2 decision packets and Layer 3 implementation receipt
for the first clean garbage-collection slice selected from the closed Layer 1
matrix.

## Selection

Selected for deletion:

| Rule id | Semantic outcome | Proof class |
| --- | --- | --- |
| `prohibit_domain_tag_artifact_shim_imports` | Retire dead domain shim import guard. | source absence plus consumer absence |
| `prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases` | Retire completed cutover cleanup guard. | source absence plus topology/native-rail proof |
| `prohibit_narrative_swatches_stage_token` | Retire retired stage-token guard after topology/manifest absorption. | source absence plus manifest/schema proof |
| `require_full_profile_domain_stage_roots` | Retire redundant transitional profile topology assertion. | closed structure plus manifest/schema proof |
| `prohibit_morphology_dual_read_tokens` | Retire completed morphology dual-read migration guard. | source absence plus native no-shadow proof |

Excluded:

| Rule id | Reason |
| --- | --- |
| `prohibit_retired_studio_devlive_daemon_file` | Layer 2 packet contradicted direct retirement: current adjacent authority says the retired `devLive.ts` absence branch is still owned by this rule until Studio dev topology is repaired or explicitly consolidated. |

## Decision Packets

### `prohibit_domain_tag_artifact_shim_imports`

Current path:
`.habitat/blueprints/domain/prohibit_domain_tag_artifact_shim_imports/rule.json`

Input classification: `retirement/garbage collection`.

Clause table:

| Clause | Owner | Forbidden owner / false destination | Proof class | Disposition |
| --- | --- | --- | --- | --- |
| Retired `@mapgen/domain/tags` and `@mapgen/domain/artifacts` shim imports must stay absent. | MapGen domain public-surface/import policy. | A live domain blueprint boundary rule for dead shims. | source absence plus consumer absence | retire/delete |

Semantic decision: delete the rule id. It guards dead shim imports, not a live
domain boundary that needs its own Habitat rule.

Proof limit: this proves only the retired shim cleanup; it does not prove the
broader domain import/public-surface matrix.

### `prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases`

Current path:
`.habitat/civ7/mapgen/pipeline/cutover/_remainder/prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases/rule.json`

Input classification: `retirement/garbage collection`.

Clause table:

| Clause | Owner | Forbidden owner / false destination | Proof class | Disposition |
| --- | --- | --- | --- | --- |
| Legacy hydrology/narrative stage aliases are absent. | Standard recipe topology/manifest. | Long-lived `cutover/_remainder` authority. | source absence plus manifest/topology proof | retire/delete |
| Shim, dual, shadow, compare, and compatibility cutover lexemes are absent. | Pipeline runtime source/native test subset. | Permanent broad lexical no-shim policy. | source absence plus native rail proof limit | retire/delete |

Semantic decision: delete the rule id as completed cutover residue.

Proof limit: source absence and existing native rail evidence do not make every
future `shim` word globally forbidden.

### `prohibit_narrative_swatches_stage_token`

Current path:
`.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_narrative_swatches_stage_token/rule.json`

Input classification: `retirement/garbage collection`.

Clause table:

| Clause | Owner | Forbidden owner / false destination | Proof class | Disposition |
| --- | --- | --- | --- | --- |
| Retired `narrative-swatches` stage token is absent from standard recipe, maps, and tests. | Standard recipe stage topology. | Narrative domain ownership or standalone stale-token guard. | source absence plus manifest/schema proof | delete after absorption |

Semantic decision: delete the lexical token guard; existing standard recipe
topology and contract-manifest authority absorb the current stage set.

Proof limit: this does not scan archived docs and does not complete the later
standard topology inversion.

### `require_full_profile_domain_stage_roots`

Current path:
`.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/require_full_profile_domain_stage_roots/rule.json`

Input classification: `retirement/garbage collection`.

Clause table:

| Clause | Owner | Forbidden owner / false destination | Proof class | Disposition |
| --- | --- | --- | --- | --- |
| Selected full-profile domain stage roots must exist. | Standard recipe topology/manifest. | Profile-specific structure rule as separate durable authority. | closed structure plus manifest/schema proof | delete after absorption |

Semantic decision: delete the redundant transitional topology assertion.
`preserve_standard_stage_topology_and_path_invariants` and
`verify_runtime_stage_order_matches_contract_manifest` remain the live topology
surfaces.

Proof limit: this does not settle the later closed-structure inversion for
transitional hubs.

### `prohibit_morphology_dual_read_tokens`

Current path:
`.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/prohibit_morphology_dual_read_tokens/rule.json`

Input classification: `retirement/garbage collection`.

Clause table:

| Clause | Owner | Forbidden owner / false destination | Proof class | Disposition |
| --- | --- | --- | --- | --- |
| `dualRead` / `morphology.dualRead` is absent from morphology-coasts steps. | Morphology-coasts stage contracts/native pipeline tests. | Morphology domain authority or permanent migration guard. | source absence plus native rail proof | retire/delete |

Semantic decision: delete the rule id as completed dual-read migration cleanup.

Proof limit: this does not prove historical project docs are clean.

### `prohibit_retired_studio_devlive_daemon_file`

Current path:
`.habitat/civ7/mapgen/studio/devops/rules/prohibit_retired_studio_devlive_daemon_file/rule.json`

Input classification: `retirement/garbage collection`.

Packet disposition: blocked for direct retirement and excluded from this
implementation slice.

Reason: adjacent Studio dev topology authority explicitly split the
`devLive.ts` absence branch into this rule. File absence alone proves current
cleanup, not survivor authority. Keep the rule until Studio dev topology is
repaired or consolidated in its own slice.

## Implementation Receipt

Deleted packet directories:

- `.habitat/blueprints/domain/prohibit_domain_tag_artifact_shim_imports/`
- `.habitat/civ7/mapgen/pipeline/cutover/_remainder/prohibit_cutover_shims_dual_paths_and_legacy_stage_aliases/`
- `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/prohibit_narrative_swatches_stage_token/`
- `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/require_full_profile_domain_stage_roots/`
- `.habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/stages/morphology/rules/prohibit_morphology_dual_read_tokens/`

Record updates:

- `.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json` removes the five retired
  rows from the live matrix and lists them as stale/retired references.
- `.habitat/.active/dominoes/items/051-retire-clean-garbage-collection-rule-residue.md` records the garbage-collection disposition.
- `tools/habitat/test/commands/habitat-commands.test.ts` no longer uses a
  retired rule id in the multi-rule selector fixture.
- Execution-surface docs are regenerated because rule paths changed.

## Verification Receipt

Commands:

- `find .habitat -name rule.json | wc -l` -> `122`
- live manifest/support/runner resolver -> `122` live manifests, no deleted ids
  live, no missing support files, no missing runner files
- ledger coverage script -> `122` live manifests, `122` ledger rows, no missing
  rows, no extra rows, no duplicate rows
- execution-surface JSON parse/deleted-id scan -> no deleted-id hits
- live manifest + execution-surface + command-test deleted-id scan -> no hits
- `bun habitat classify .habitat` -> pass
- `bun habitat check --rule prohibit_retired_studio_devlive_daemon_file --json`
  -> pass
- `bun habitat check --rule preserve_standard_stage_topology_and_path_invariants --json`
  -> pass
- `bun habitat check --rule verify_runtime_stage_order_matches_contract_manifest --json`
  -> pass
- `bun run --cwd tools/habitat test test/commands/habitat-commands.test.ts`
  -> pass, 14 tests
- `bun run --cwd tools/habitat check` -> pass
- `git diff --check` -> pass

Next slice signal:

- Studio devops topology remains separate because one retirement candidate was
  blocked.
- The next high-leverage Layer 2 candidates are still action-class based:
  boundary inversion, closed structure inversion, runtime/source validation, or
  product-backed positive authority. Hairy split and positive-kind/deletion
  pairs should be handled in their own slices.
