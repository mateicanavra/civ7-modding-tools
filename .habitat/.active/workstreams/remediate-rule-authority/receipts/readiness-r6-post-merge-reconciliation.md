# Readiness R6 Advisory Studio-Stack Reconciliation Receipt

Date: 2026-07-07

Slice: R6, advisory Studio-stack reconciliation.

Authority:
`.habitat/.active/workstreams/remediate-rule-authority/pre-descent-readiness-plan.md`
R6, as revised by the 2026-07-07 user decision to proceed without waiting for
the Studio packet-train to merge to `main`.

## Requirement Change

R6 no longer waits for a Studio-to-`main` merge. The Studio packet-train remains
read-only advisory context. This receipt scouts the current Studio tip,
classifies deltas that could affect the runway or descent seed, and carries a
final revisit hook. If the Studio stack later lands with materially different
content, final runway review must revisit only affected records and proofs.

## Refs

Record truth proof:

```bash
BASE=$(git rev-parse origin/main)
STUDIO=$(git rev-parse agent-codex-mapgen-studio-runtime-openspec-packets)
HEAD_REF=$(git rev-parse HEAD)
printf 'BASE=%s\nSTUDIO=%s\nHEAD=%s\n' "$BASE" "$STUDIO" "$HEAD_REF"
```

Output:

```text
BASE=0c97517d861a22d48a763fe92c93fc31703ad31b
STUDIO=180293b4166be9283dfee999b576d4465e0e0442
HEAD=a51d3ef0d63b36fa590403340f35df6504da3ff2
```

## Advisory Studio Delta

Record truth proof:

```bash
git diff --name-status "$BASE".."$STUDIO" -- .habitat tools/habitat package.json bun.lock nx.json
```

Output: non-empty. Representative output excerpt: the advisory Studio tip
currently changes Habitat rule packets, the Grit provider, `bun.lock`, and one
standard-recipe check:

```text
M .habitat/blueprints/domain-operation/require_domain_operation_contract_file_shape/rule.json
M .habitat/blueprints/domain-operation/require_domain_ops_registry_surface/rule.json
M .habitat/blueprints/recipe-stage/require_recipe_stage_authoring_file_shape/pattern.md
M .habitat/blueprints/recipe-stage/require_recipe_stage_authoring_file_shape/rule.json
M .habitat/civ7/mapgen/domains/ecology/rules/require_public_ecology_surfaces_and_retired_topology_removal/pattern.md
M .habitat/civ7/mapgen/domains/ecology/rules/require_public_ecology_surfaces_and_retired_topology_removal/rule.json
D .habitat/civ7/mapgen/pipeline/runtime/_remainder/prohibit_ecology_fudge_terms_and_legacy_generator_surfaces/pattern.md
D .habitat/civ7/mapgen/pipeline/runtime/_remainder/prohibit_ecology_fudge_terms_and_legacy_generator_surfaces/rule.json
A .habitat/civ7/mapgen/pipeline/runtime/_remainder/prohibit_ecology_fudge_tokens/rule.json
A .habitat/civ7/mapgen/pipeline/runtime/_remainder/prohibit_hydrology_placement_rng_and_chance_tokens/rule.json
A .habitat/civ7/mapgen/pipeline/runtime/_remainder/prohibit_legacy_generator_call_surfaces/rule.json
A .habitat/civ7/mapgen/pipeline/runtime/_remainder/prohibit_legacy_generator_module_surfaces/rule.json
A .habitat/civ7/mapgen/pipeline/runtime/_remainder/prohibit_scoped_ecology_runtime_tokens/rule.json
M .habitat/civ7/mapgen/pipeline/swooper-maps-standard-recipe/rules/verify_standard_recipe_public_authoring_surface/check.ts
M bun.lock
M tools/habitat/src/providers/grit/runner.ts
M tools/habitat/src/providers/grit/scan-roots/index.ts
M tools/habitat/src/providers/grit/source-check.ts
M tools/habitat/test/lib/grit-provider.test.ts
```

Record truth proof:

```bash
git diff --name-status "$BASE".."$STUDIO" -- mods/mod-swooper-maps/src/domain mods/mod-swooper-maps/src/recipes
```

Output: non-empty. Representative output excerpt: the advisory Studio tip
currently changes one domain model schema and multiple standard recipe files,
including new public-config files:

```text
M mods/mod-swooper-maps/src/domain/resources/model/schemas/resource-family.schema.ts
A mods/mod-swooper-maps/src/recipes/standard/stages/ecology-public-config.ts
A mods/mod-swooper-maps/src/recipes/standard/stages/foundation-public-config.ts
A mods/mod-swooper-maps/src/recipes/standard/stages/hydrology-public-config.ts
A mods/mod-swooper-maps/src/recipes/standard/stages/map-projection-public-config.ts
A mods/mod-swooper-maps/src/recipes/standard/stages/placement-public-config.ts
```

Record truth proof:

```bash
git ls-tree -r --name-only "$BASE" | rg 'rule\.json$' | wc -l
git ls-tree -r --name-only "$STUDIO" | rg 'rule\.json$' | wc -l
```

Output: `BASE` has 112 rule manifests; `STUDIO` has 116.

Classification:

- affects R3/R6 final proof timing and rule-corpus expectations if the Studio
  tip becomes the execution base;
- affects descent-002 advisory context through domain-operation rule manifest
  changes and one domain model schema delta;
- primarily affects future recipe/stage descent work through recipe public
  config files and recipe-stage rule changes;
- does not mutate this runway stack by itself and does not make the current
  descent seed false on `HEAD`.

Revisit hook:
final runway review must regenerate this scout if the Studio stack lands,
rebases, or is selected as the execution base. In particular, re-check rule
manifest parity, R3 aggregate behavior, and descent seed rows before descent
execution.

## Descent Seed Reproduction

Record truth proof:

```bash
find mods/mod-swooper-maps/src/recipes/standard -maxdepth 1 -mindepth 1 | sort
```

Output:

```text
mods/mod-swooper-maps/src/recipes/standard/artifacts
mods/mod-swooper-maps/src/recipes/standard/contract-manifest.ts
mods/mod-swooper-maps/src/recipes/standard/map-artifacts.ts
mods/mod-swooper-maps/src/recipes/standard/projection-policies
mods/mod-swooper-maps/src/recipes/standard/recipe.ts
mods/mod-swooper-maps/src/recipes/standard/runtime.ts
mods/mod-swooper-maps/src/recipes/standard/stages
mods/mod-swooper-maps/src/recipes/standard/tag-contracts.ts
mods/mod-swooper-maps/src/recipes/standard/tags.ts
```

Record truth proof:

```bash
for d in mods/mod-swooper-maps/src/domain/*/ops/*/; do [ -f "$d/contract.ts" ] || echo "$d"; done
```

Output: zero lines.

Record truth proof:

```bash
rg -o "from ['\"]([^'\"]+)['\"]" -r '$1' --no-filename mods/mod-swooper-maps/src/domain/*/ops/*/strategies/*.ts | sort | uniq -c | sort -rn
```

Output top rows:

```text
104 @swooper/mapgen-core/authoring
104 ../contract.js
 92 ./default.js
 49 ../rules/index.js
 27 @swooper/mapgen-core
 19 @swooper/mapgen-core/lib/grid
 17 ../../../model/policy/feature-score-selection.js
 12 ../../../model/schemas/index.js
  7 ../policy/index.js
```

The descent `ledger.md` seed is marked re-verified on this stack tip. No
decision packet was reopened because the current-HEAD seed reproduction did
not change the seed rows.

## Current Rule/Record Truth

Record truth proof:

```bash
find .habitat/blueprints .habitat/civ7 .habitat/docs .habitat/global .habitat/habitat -name rule.json | wc -l
jq '{corpus, liveRuleRows: (.rules|length), retiredRows: (.retiredRules|length)}' .habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json
```

Output: current `HEAD` has 111 live rule manifests, 111 live ledger rows, and
25 retired rows.

## Review

Fresh review lane: Pauli (`019f3a12-37b6-73a1-b2cd-0163880d398f`).

| Finding | Severity | Disposition | Repair Evidence |
| --- | --- | --- | --- |
| The plan still treated the 2026-07-06 docs-only Studio investigation as load-bearing current truth. | P2 | accepted | Marked that note superseded by the 2026-07-07 R6 advisory scout and routed readers to this receipt. |
| The execution-order paragraph still implied the Studio stack touched none of these inputs. | P2 | accepted | Reworded it: Studio deltas remain advisory unless selected, landed, or proven to falsify current stack records. |
| Receipt diff blocks used `Output` while quoting representative excerpts. | P3 | accepted | Relabeled those blocks as representative output excerpts. |

The reviewer found no P1 issues and verified the current-HEAD seed
reproduction. After the accepted fixes above, no accepted unresolved P1/P2
findings remain for R6.

## Non-Claims

This does not merge, rebase onto, or modify the Studio packet-train. It does
not claim the advisory Studio tip is final or green. It does not begin descent
execution or decide any descent packet. It closes R6 only under the changed
requirement: current stack seed evidence is re-verified, Studio changes are
scouted as advisory, and final review has an explicit revisit hook if that
stack becomes relevant before descent execution.
