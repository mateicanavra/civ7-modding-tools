# Narsil Graph Evidence

Status: evidence artifact

Repo id used: `civ7-modding-tools`.

Hybrid search was not used. Evidence came from symbol/reference/call tools plus
local `rg` corroboration.

## Tool Calls

```text
mcp__narsil_code_intel_civ7.find_references(repo="civ7-modding-tools", symbol="defineDomain")
mcp__narsil_code_intel_civ7.find_references(repo="civ7-modding-tools", symbol="storyTagStrategicCorridors")
mcp__narsil_code_intel_civ7.find_references(repo="civ7-modding-tools", symbol="storyTagOrogenyBelts")
mcp__narsil_code_intel_civ7.find_references(repo="civ7-modding-tools", symbol="publishStoryOverlay")
mcp__narsil_code_intel_civ7.find_references(repo="civ7-modding-tools", symbol="getStoryOverlay")
mcp__narsil_code_intel_civ7.get_callers(repo="civ7-modding-tools", function="storyTagStrategicCorridors", transitive=true, max_depth=3)
mcp__narsil_code_intel_civ7.get_callers(repo="civ7-modding-tools", function="storyTagOrogenyBelts", transitive=true, max_depth=3)
mcp__narsil_code_intel_civ7.get_callers(repo="civ7-modding-tools", function="publishStoryOverlay", transitive=true, max_depth=3)
```

## Raw Returned Evidence

| Symbol | References returned | Callers returned |
| --- | --- | --- |
| `defineDomain` | `mods/mod-swooper-maps/src/domain/narrative/index.ts` defines `defineDomain({ id: "narrative", ops })`; indexed docs include prior architecture review rows describing narrative as dead code with zero recipe wiring and empty ops. | Not queried as a recipe liveness target. |
| `storyTagStrategicCorridors` | Archived JS, docs, `mods/mod-swooper-maps/test/story/corridors.test.ts`, `mods/mod-swooper-maps/src/domain/narrative/corridors/index.ts`, and root narrative facade. | Only transitive caller returned was archived original JS `generateMap`; current TypeScript callers are tests/re-exports, corroborated by `rg`. |
| `storyTagOrogenyBelts` | Archived JS, docs, `mods/mod-swooper-maps/test/story/orogeny.test.ts`, `mods/mod-swooper-maps/src/domain/narrative/orogeny/belts.ts`, and root narrative facade. | Only transitive caller returned was archived original JS `generateMap`; current TypeScript caller is test/re-export. |
| `publishStoryOverlay` | Current TypeScript references are narrative internals and story tests, plus docs/Habitat evidence. | Callers are narrative internals plus archived JS; no current standard recipe stage caller returned. |
| `getStoryOverlay` | Current TypeScript references are overlay registry, root facade, and story tests. | Not queried as caller; local `rg` found story tests and archived JS. |

## Interpretation

| Symbol | Decision implication |
| --- | --- |
| `defineDomain` | Narrative has a domain shell, while current source/docs indicate no recipe binding. |
| `storyTagStrategicCorridors` | Current production recipe does not call this behavior. |
| `storyTagOrogenyBelts` | Current production recipe does not call this behavior. |
| `publishStoryOverlay` | Overlay publication is internal to the narrative source network and tests. |
| `getStoryOverlay` | Overlay read API is test-live and historical, not production-recipe live. |

## Corroborating Local Graph Checks

```bash
rg -n "@mapgen/domain/narrative|domain/narrative|storyTag|StoryOverlay|Narrative|narrative\\b" \
  mods/mod-swooper-maps/src packages \
  --glob '!mods/mod-swooper-maps/src/domain/narrative/**'
```

The current MapGen production source references narrative through:

- `mods/mod-swooper-maps/src/domain/index.ts`;
- `mods/mod-swooper-maps/src/domain/config.ts`;
- placement/discovery comments about Civ7 live narrative system products;
- unrelated `packages/civ7-control-orpc` runtime narrative UI control surfaces.

```bash
rg -n "@mapgen/domain/narrative|storyTag|StoryOverlay|Narrative|narrative\\b" \
  mods/mod-swooper-maps/test packages mods/mod-swooper-maps/src/recipes \
  --glob '!mods/mod-swooper-maps/src/domain/narrative/**'
```

This found story tests importing the narrative public barrel and no standard
recipe import of narrative domain ops.

## Limitations

The call graph under-reported some TypeScript test calls while still reporting
symbol references. For liveness, Narsil reference evidence and local `rg`
together are stronger than the caller graph alone. Narsil also indexes docs, so
archived JS and historical docs appear in reference sets; those rows are
explanatory evidence, not current runtime liveness.
