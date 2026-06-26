# Habitat Authority Contract

Status: active authority frame with provisional blueprint hierarchy

## What This Establishes

`.habitat` is the durable repository-local source of truth for structural enforcement intent. Other files may execute, bridge, cache, generate, or test that intent, but they do not define it independently.

The current hierarchy is:

```text
.habitat/<authority-area>/blueprints/<blueprint>/<category>/<artifact-kind>/<packet>/
```

Blueprints are broad concept-level units: the thing being authored, the thing that needs to execute, and the thing that must exist with certain shapes and interactions. Categories are single-word universal engineering purpose groupings. Artifact kinds define mutability.

Execution mechanics stay in Habitat Toolkit source under `tools/habitat`. External tools such as Nx, Biome, Grit, Husky, CI, shell scripts, and package scripts are invocation mechanisms whose structural meaning must trace back to this tree.

## Already True

- Collected packets live under blueprint paths.
- Packet-local `category.md` files record current category, lifecycle, admission, evidence, and caveats.
- Rule identity is co-located as `<packet>.rule.json`.
- Pattern, baseline, command-check, and provisional operation files are co-located with their packets.
- The Toolkit compatibility registry index lives at `.habitat/habitat/blueprints/toolkit/structure/triage/rule-pack-index/index.json`.

## Authority Rules

1. A structural check packet is admitted only by a packet folder under a blueprint at `<category>/check/<packet>`.
2. A structural rule is admitted only by that folder's `<packet>.rule.json` record or a documented transitional adapter in the Habitat Toolkit blueprint.
3. A source-pattern rule is authored as `<packet>.pattern.md` in the owning packet folder until the final manifest shape is accepted.
4. Baseline/current-tree evidence is accepted only when co-located with the owning packet as `<packet>.baseline.json` until the final manifest shape is accepted.
5. A command-backed check is accepted only when its script is read-only and co-located as `<packet>.check.{sh,mjs,py,ts}`.
6. Habitat-owned fix/generate/migrate operations require explicit operation identity and must not be registered as read-only checks unless they are genuinely read-only.
7. `triage` packets are excluded from default execution until admitted, split, renamed, or removed.
8. No new loose lint, validation, structural-check, or pattern script may be introduced as authored policy without Habitat authority-tree identity.

## Current Authority Areas

| Path | Blueprint role |
| --- | --- |
| `global/blueprints/workspace/**` | Whole-workspace hygiene, boundaries, protected surfaces, and repo structure. |
| `docs/blueprints/documentation/**` | Documentation content, site, publication, and maintenance authority. |
| `habitat/blueprints/toolkit/**` | Habitat Toolkit self-authority, service shape, provider boundaries, registry bridge, and legacy compatibility packets. |
| `civ7/blueprints/platform-integration/**` | Civ7 adapter, control, game UI, and oRPC integration surfaces. |
| `civ7/blueprints/official-resources/**` | Official-resource-derived generated projections and protected resource surfaces. |
| `civ7/mapgen/blueprints/core-sdk/**` | MapGen core package/runtime and SDK surface. |
| `civ7/mapgen/blueprints/domain-model/**` | MapGen domain model boundaries, contracts, and runtime capability discipline. |
| `civ7/mapgen/blueprints/standard-pipeline/**` | Standard stage, recipe, runtime validation, and pipeline policy. |
| `civ7/mapgen/blueprints/map-output/**` | Map output contracts, generated entrypoints, projection callsites, and shipped catalogs. |
| `civ7/mapgen/blueprints/studio/**` | Studio integration, recipe artifacts, worker safety, and dev runner topology. |

## Current Owner-Tool Classes

Owner-tool classes such as `source-check`, `command-check`, `file-layer`, `format-check`, `nx`, and `grit-check` describe existing rule execution adapters. They are not top-level ontology categories and should not become authority-tree directories.

## Migration Implications

Next consolidation work should teach Toolkit discovery to route by the blueprint path shape, keep `triage` excluded from default execution, convert transitional source/command checks into clearer admitted artifacts, and continue migrating embedded structural authority from tests/scripts into this tree.

## Stop Conditions

Stop a consolidation slice if it creates any of these states:

- authored structural policy exists with no Habitat identity;
- generic tool dispatch is modeled as repo-authored `.habitat` config instead of Toolkit source;
- a pattern, baseline, or adapter exists outside its packet folder with no bridge rationale;
- external config claims structural meaning not represented in `.habitat`;
- tests are used as structural gates without Habitat registration or explicit product-test classification;
- narrow subjects, runner names, or current defect names are promoted into blueprints without domain proof.
