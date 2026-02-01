<toc>
  <item id="purpose" title="Purpose"/>
  <item id="status" title="Wiring status (today)"/>
  <item id="target-direction" title="Target direction (canonical intent)"/>
  <item id="contract" title="Contract (expected inputs/outputs)"/>
  <item id="ops" title="Ops surface (current)"/>
  <item id="anchors" title="Ground truth anchors"/>
  <item id="open-questions" title="Open questions"/>
</toc>

# Narrative domain

## Purpose

Narrative is the target-canonical domain intended to encode “story overlays” and themed motifs over the otherwise-mechanistic pipeline:
- rifts, margins, volcanic chains,
- “paradise islands” and corridors,
- and other author-driven map narratives.

The intent is to keep Narrative as a **truth-domain overlay** that composes cleanly with Morphology/Hydrology/Ecology, while staying deterministic and testable.

## Wiring status (today)

As of the current standard recipe:
- Narrative is **not** included as a stage.
- Narrative does **not** contribute ops to the recipe’s `compileOpsById` registry.
- The Narrative domain package exists, but has no op contracts defined.

Do not assume Narrative is active in the pipeline unless/until these facts change.

## Target direction (canonical intent)

Narrative should eventually be:
- a truth-domain overlay stage (or set of stages),
- producing explicit narrative artifacts and/or effect tags that downstream steps can consume,
- without “secretly” mutating other domains’ artifacts beyond documented contracts.

## Contract (expected inputs/outputs)

Not yet defined as a canonical contract in code.

When implemented, expected posture:
- Requires: Morphology/Hydrology truth artifacts (and possibly Foundation drivers).
- Provides: narrative overlay artifacts and/or tagged dependencies that downstream projection steps can use.

## Ops surface (current)

Currently empty.

## Ground truth anchors

- Standard recipe stage list (Narrative absent): `mods/mod-swooper-maps/src/recipes/standard/recipe.ts`
- Compile ops registry (Narrative absent): `mods/mod-swooper-maps/src/recipes/standard/recipe.ts` (`collectCompileOps(...)`)
- Narrative domain exists but ops contracts are empty:
  - `mods/mod-swooper-maps/src/domain/narrative/index.ts`
  - `mods/mod-swooper-maps/src/domain/narrative/ops/contracts.ts`

## Open questions

- What is the minimal viable Narrative contract (artifacts + tags) that can be added without destabilizing the “standard recipe” DX?
- Where should Narrative artifacts live (content-owned vs SDK re-exported tags) to maintain clean domain boundaries?

