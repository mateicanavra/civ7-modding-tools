# Habitat Authority Contract

Status: active authority frame with provisional physical hierarchy

## What This Establishes

Use `.habitat/FRAME.md` as the current living lens for authority-tree
direction, source order, stack geolocation, and pruning posture. Use
`.habitat/AUTHORITY-ONTOLOGY.md` as the normative conceptual model for Habitat,
blueprints, instances, capabilities, niches, admission, and authority
activation. Use `.habitat/DOMINO-FRAME.md` as the operating frame for choosing,
reviewing, and carrying authority-tree dominoes across Graphite branches and
agent handoffs. This file defines the durable authority contract that those
frames apply to the current repository tree.

`.habitat` is the durable repository-local source of truth for structural enforcement intent. Other files may execute, bridge, cache, generate, or test that intent, but they do not define it independently.

The current physical hierarchy has four packet lanes:

```text
.habitat/blueprints/<blueprint>/<packet>/
.habitat/<niche>/_blueprints/<candidate>/<packet>/
.habitat/<niche>/rules/<packet>/
.habitat/<niche>/_remainder/<packet>/
.habitat/<niche>/<child-niche>/...
```

Top-level `blueprints/` is affirmed constructible kind authority. Niches are
authored jurisdictions and may nest into child niches. Niche-local
`_blueprints/` is candidate blueprint-shaped inventory that has not yet been
affirmed as blueprint authority. The `rules` lane is transitional inventory for
the niche itself. The `_remainder` lane is transitional visual debt for packets
that a slice has reviewed and sorted but cannot yet move to a final owner. It
is not a niche, blueprint, capability, or final ontology plane;
sorted-but-deferred packets must not stay in `rules/` as if they were
intentional current-context authority. Categories and artifact kinds are
manifest placement facts, not physical grouping directories.

Execution mechanics stay in Habitat Toolkit source under `tools/habitat`. External tools such as Nx, Biome, Grit, Husky, CI, shell scripts, and package scripts are invocation mechanisms whose structural meaning must trace back to this tree.

Temporary execution support that cannot yet move into Toolkit source lives under
`.habitat/_support/execution/`. That directory is a bridge, not a niche,
blueprint, category, artifact kind, or authored policy root.

## Already True

- Collected packets live under top-level affirmed `blueprints/`, niche-local
  `_blueprints/` candidate paths, or niche/context `rules` inventory paths.
- Niche-wide authority no longer uses `_self` as a physical blueprint path.
  Existing `_self` placement facts remain transitional manifest inventory only.
- Rule manifests are discovered at `.habitat/**/rule.json`.
- Rule identity is manifest-authored as `id`; physical path is not identity.
- Current placement is manifest-authored as inventory metadata. It records
  where the rule belongs now without freezing the final ontology or requiring
  the manifest to live at that path forever.
- Runner files and baselines are explicit manifest references, even when they
  are currently sibling role files.
- Pattern, baseline, Habitat script, and provisional operation files are
  co-located with their packets under generic role filenames.
- Transitional shared execution helpers are centralized under `.habitat/_support/execution/` rather than packet authoring sites.
- The Toolkit rule registry owner-root index lives at `.habitat/index.json` as root registry metadata, not as an authority packet.
- The current tree has zero `triage` packets; the kind remains reserved for future unadmitted evidence only.

## Authority Rules

1. A structural check is admitted into the current inventory only by a
   `rule.json` manifest with stable identity, current placement, and explicit
   runner/artifact references.
2. A source-pattern rule is authored as a `grit` runner manifest pointing at
   its `pattern.md` file.
3. Baseline/current-tree evidence is accepted only when referenced from the
   owning rule manifest.
4. A command-backed check is accepted only when its manifest points at a
   read-only `check.{sh,mjs,ts}` script.
5. Current placement should match the best known niche, owner, category, and
   artifact kind in `rule.json`, but moving the manifest is an inventory
   operation, not an identity change.
6. Habitat-owned fix/generate/migrate operations require explicit operation identity and must not be registered as read-only checks unless they are genuinely read-only.
7. `triage` packets are excluded from default execution until admitted, split, renamed, or removed.
8. No new loose lint, validation, topology, or pattern script may be introduced as authored policy without Habitat authority-tree identity.

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
| `civ7/mapgen/domains/**` | MapGen domain model boundaries, contracts, and runtime capability discipline. |
| `civ7/mapgen/pipeline/**` | Standard stage, recipe, runtime validation, and pipeline policy. |
| `civ7/mapgen/map-output/**` | Map output contracts, generated entrypoints, projection callsites, and shipped catalogs. |
| `civ7/mapgen/studio/**` | Studio integration, recipe artifacts, worker safety, and dev runner topology. |

## Current Runners

Runners are execution owners, not ontology categories. `grit` runs `pattern.md`;
`habitat` runs Habitat-native packet forms such as `structure.toml`,
`check.*`, and file-layer guards; `nx` runs graph targets. These runner names
must not become authority-tree directories.

## Migration Implications

Toolkit discovery now routes through location-independent rule manifests:
identity, current placement, runner entrypoints, and baselines are read from
`rule.json`. Next consolidation work can physically move manifests and their
referenced files into better blueprint, capability, or niche locations without
changing rule identity or behavior. The current physical tree intentionally
splits affirmed constructible kind authority into top-level
`.habitat/blueprints/`, marks not-yet-affirmed niche-local candidates as
`_blueprints/`, keeps `rules/` for niche-wide and explicitly contextual
inventory, and uses `_remainder/` for reviewed deferred packets that still need
later movement, split, projection, consolidation, or retirement. Future layout
and registry changes should use
`AUTHORITY-ONTOLOGY.md` as the concept source for distinguishing blueprint kind
authority, instance facts, capability facets, and niche governance.

## Stop Conditions

Stop a consolidation slice if it creates any of these states:

- authored structural policy exists with no Habitat identity;
- generic tool dispatch is modeled as repo-authored `.habitat` config instead of Toolkit source;
- a pattern, baseline, or adapter exists outside manifest references with no
  authority or bridge rationale;
- external config claims structural meaning not represented in `.habitat`;
- tests are used as structural gates without Habitat registration or explicit product-test classification;
- niches, narrow subjects, runner names, or current defect names are promoted into blueprints without domain proof.
