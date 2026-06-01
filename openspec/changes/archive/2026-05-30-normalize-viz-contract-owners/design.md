## Context

Visualization is a first-class observability surface, but not every helper is a
public contract. The owner boundary must distinguish stable stage/phase viz
contracts from local step helpers so downstream stages and Studio code do not
reach into private implementation paths.

## Goals / Non-Goals

**Goals:**

- Define the standard visualization contract file tree.
- Apply it to current shared/stage-stable helper violations.
- Guard the category rather than a single biome import.
- Preserve step-local helper freedom when a helper is truly private.

**Non-Goals:**

- Redesign `VizDumper`, deck.gl manifests, or Studio rendering.
- Move every `context.viz?.dump*` call into separate files.
- Promote debug-only layers into pipeline artifacts.

## Standard File Tree

```text
stages/<stage>/viz.ts
  Stage/phase-owned visualization contracts that are stable, shared by
  multiple steps, or consumed outside the owner stage.

stages/<stage>/steps/<step>/viz.ts
  Step-private visualization helpers used only by files in the same step
  directory.

forbidden:
  stages/<stage>/steps/viz.ts
  stages/<stage>/steps/<step>/viz.ts imported outside that step
  wrapper-only viz files that re-export a stage contract from the old path
  broad shared visualization buckets without a named invariant and consumers
```

## Decisions

### Stage Owns Shared Visualization Contracts

If a visualization category, geometry converter, or palette is shared by
multiple steps, consumed by a projection stage, or meant to be stable for
Studio/debug inspection, the owning stage exposes it from `stages/<stage>/viz.ts`.

### Step-Private Helpers Stay Private

A step can keep `steps/<step>/viz.ts` for local rendering support, but no other
step or stage may import it. If another consumer appears, the helper is
promoted to the owning stage's `viz.ts`.

### No Compatibility Wrappers

Once a contract is promoted to the stage surface, old step-local re-export files
are deleted. Keeping wrappers would preserve the wrong import path and weaken
the guard.

## Risks / Trade-offs

- Moving too much to stage-level can create a new dumping ground. The guard
  permits step-private helpers to avoid that.
- Leaving stage-shared helpers under `steps/` makes private topology look like
  a public contract.

## Review Lanes

- Architecture review: checks owner placement and no broad buckets.
- Developer experience review: checks import paths are predictable.
- Adversarial review: checks the guard catches category violations without
  red-barring legitimate step-local helpers.
