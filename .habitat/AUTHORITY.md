# Habitat Authority Contract

Status: active authority frame with provisional niche/blueprint hierarchy

## What This Establishes

Use `.habitat/FRAME.md` as the current living lens for authority-tree
direction, source order, stack geolocation, and pruning posture. This file
defines the durable authority contract that the frame applies.

`.habitat` is the durable repository-local source of truth for structural enforcement intent. Other files may execute, bridge, cache, generate, or test that intent, but they do not define it independently.

The current hierarchy is:

```text
.habitat/<niche>/blueprints/<blueprint>/<category>/<artifact-kind>/<packet>/
```

Niches are authored jurisdictions. Blueprints are buildable or enforceable things inside those jurisdictions. Categories are single-word universal engineering purpose groupings. Artifact kinds define mutability.

Execution mechanics stay in Habitat Toolkit source under `tools/habitat`. External tools such as Nx, Biome, Grit, Husky, CI, shell scripts, and package scripts are invocation mechanisms whose structural meaning must trace back to this tree.

Temporary execution support that cannot yet move into Toolkit source lives under
`.habitat/_support/execution/`. That directory is a bridge, not a niche,
blueprint, category, artifact kind, or authored policy root.

## Already True

- Collected packets live under niche-local blueprint paths.
- Niche-wide authority uses `_self` as a temporary blueprint placeholder.
- Packet-local `category.md` files record current category, lifecycle, admission, evidence, and caveats.
- Rule identity is co-located as `<packet>.rule.json`.
- Pattern, baseline, command-check, and provisional operation files are co-located with their packets.
- Transitional source-check adapters and shared execution helpers are centralized under `.habitat/_support/execution/` rather than packet authoring sites.
- The Toolkit compatibility registry index lives at `.habitat/habitat/toolkit/blueprints/_self/structure/triage/preserve_transitional_rule_pack_owner_roots/index.json`.

## Authority Rules

1. A structural check packet is admitted only by a packet folder under a blueprint at `<category>/check/<packet>`.
2. A structural rule is admitted only by that folder's `<packet>.rule.json` record or documented transitional support under `.habitat/_support/execution/`.
3. A source-pattern rule is authored as `<packet>.pattern.md` in the owning packet folder until the final manifest shape is accepted.
4. Baseline/current-tree evidence is accepted only when co-located with the owning packet as `<packet>.baseline.json` until the final manifest shape is accepted.
5. A command-backed check is accepted only when its script is read-only and co-located as `<packet>.check.{sh,mjs,py,ts}`.
6. Habitat-owned fix/generate/migrate operations require explicit operation identity and must not be registered as read-only checks unless they are genuinely read-only.
7. `triage` packets are excluded from default execution until admitted, split, renamed, or removed.
8. No new loose lint, validation, structural-check, or pattern script may be introduced as authored policy without Habitat authority-tree identity.

## Current Niches

| Path | Role |
| --- | --- |
| `global/workspace/**` | Whole-workspace hygiene, boundaries, protected surfaces, and repo structure. |
| `docs/**` | Documentation content, site, publication, and maintenance authority. |
| `habitat/toolkit/**` | Habitat Toolkit self-authority, service shape, provider boundaries, registry bridge, and legacy compatibility packets. |
| `civ7/platform/**` | Civ7 adapter, control, game UI, and oRPC integration surfaces. |
| `civ7/resources/**` | Official-resource-derived generated projections and protected resource surfaces. |
| `civ7/mapgen/core/**` | MapGen core library authority. |
| `civ7/mapgen/sdk/**` | MapGen SDK entrypoint authority. |
| `civ7/mapgen/visualization/**` | MapGen visualization/runtime dependency authority. |
| `civ7/mapgen/domain/**` | MapGen domain model boundaries, contracts, and runtime capability discipline. |
| `civ7/mapgen/pipeline/**` | Standard stage, recipe, runtime validation, and pipeline policy. |
| `civ7/mapgen/map-output/**` | Map output contracts, generated entrypoints, projection callsites, and shipped catalogs. |
| `civ7/mapgen/studio/**` | Studio integration, recipe artifacts, worker safety, and dev runner topology. |

## Current Owner-Tool Classes

Owner-tool classes such as `source-check`, `command-check`, `file-layer`, `format-check`, `nx`, and `grit-check` describe existing rule execution adapters. They are not top-level ontology categories and should not become authority-tree directories.

## Migration Implications

Next consolidation work should teach Toolkit discovery to route by the niche/blueprint path shape, keep `triage` excluded from default execution, convert transitional source/command checks into clearer admitted artifacts, and continue migrating embedded structural authority from tests/scripts into this tree.

## Stop Conditions

Stop a consolidation slice if it creates any of these states:

- authored structural policy exists with no Habitat identity;
- generic tool dispatch is modeled as repo-authored `.habitat` config instead of Toolkit source;
- a pattern, baseline, or adapter exists outside its packet folder with no bridge rationale such as `.habitat/_support/execution/README.md`;
- external config claims structural meaning not represented in `.habitat`;
- tests are used as structural gates without Habitat registration or explicit product-test classification;
- niches, narrow subjects, runner names, or current defect names are promoted into blueprints without domain proof.
