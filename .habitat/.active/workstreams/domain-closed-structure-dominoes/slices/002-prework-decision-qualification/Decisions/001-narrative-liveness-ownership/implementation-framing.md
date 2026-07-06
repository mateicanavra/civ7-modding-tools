# Narrative Burn-Down Implementation Frame

Status: implementation framing document for the narrative burn-down handoff.

This document records the frame for executing `execution.md` after compaction.
It is not a replacement for `execution.md`; the execution document remains the
controlling slice plan.

## Read Set

Packet authority and evidence read:

- `execution.md`
- `workstream-plan.md`
- `agent-briefs.md`
- `corpus/architecture-authority.md`
- `corpus/narrative-source-inventory.md`
- `evidence/narsil-graph.md`
- `evidence/knip-dead-code.md`
- `synthesis/disposition-table.md`
- `reviews/review-findings.md`

Repo and workstream authority read:

- root `AGENTS.md`
- `mods/mod-swooper-maps/AGENTS.md`
- `mods/mod-swooper-maps/src/AGENTS.md`
- `packages/mapgen-core/AGENTS.md`
- `packages/mapgen-core/src/AGENTS.md`
- `packages/civ7-direct-control/AGENTS.md`
- `packages/civ7-control-orpc/AGENTS.md`
- `packages/cli/AGENTS.md`
- `.habitat/.active/workstreams/domain-closed-structure-dominoes/slices/002-prework-decision-qualification/frame.md`
- `.habitat/.active/workstreams/domain-closed-structure-dominoes/slices/002-prework-decision-qualification/single-prework-decision-frame.md`
- `.habitat/.active/workstreams/domain-closed-structure-dominoes/decision-book/owner-boundaries.md`
- `.habitat/.active/workstreams/domain-closed-structure-dominoes/decision-book/move-classes.md`
- `.habitat/.active/workstreams/domain-closed-structure-dominoes/scopes/domain/scope.md`
- `.habitat/.active/workstreams/domain-closed-structure-dominoes/scopes/domain/overview.md`
- `docs/projects/engine-refactor-v1/architecture-normalization-packet.md`
- `docs/system/libs/mapgen/MAPGEN.md`
- `docs/system/libs/mapgen/explanation/ARCHITECTURE.md`
- `docs/system/libs/mapgen/reference/STANDARD-RECIPE.md`
- `docs/system/libs/mapgen/reference/domains/DOMAINS.md`
- `docs/system/libs/mapgen/reference/domains/GAMEPLAY.md`
- `docs/system/mods/swooper-maps/architecture.md`
- `docs/system/ADR.md` ADR-008/ADR-009 placement/resource decisions
- `docs/system/TESTING.md`

Skills loaded for this frame:

- `dev:graphite`
- `dev:git-worktrees`
- `civ7-habitat-dra-workstream`
- `habitat:systematic-workstream`
- `civ7-architecture-authority`
- `typescript-refactoring`

## Intent

Execute the full narrative burn-down in `execution.md` slice by slice, with
proof and Graphite commits for each closed slice. The end state is:

- no `mods/mod-swooper-maps/src/domain/narrative` source tree;
- no `mods/mod-swooper-maps/test/story` compatibility test tree;
- no MapGen TypeScript imports or exports of `@mapgen/domain/narrative`,
  `domain/narrative/**`, narrative config schemas, story tags, or story overlay
  compatibility types;
- no `storyEnabled` runtime flag or initializer arguments;
- no `ExtendedMapContext.overlays` compatibility state;
- direct-control/control-oRPC/CLI narrative-choice surfaces remain present and
  untouched;
- placement/hydrology wording that merely names Narrative as a downstream
  concept remains untouched;
- no generic domain blueprint enforcement, new `structure.toml` assertion, Grit
  packet, or Gameplay port is introduced. Slice 3 may update an existing
  `structure.toml` rule to remove stale narrative scope.

The high-level classification is a source-backed deletion and compatibility
burn-down, not a migration. The current implementation is removed as legacy
MapGen story code. A future Gameplay story design starts from its own authority;
this run does not preserve or alias the current source network through a
Gameplay bucket.

## Controlling Evidence

The production non-liveness proof is recipe-based:

- `mods/mod-swooper-maps/src/recipes/standard/recipe.ts` collects foundation,
  morphology, hydrology, ecology, placement, and resources ops.
- It does not import or collect narrative ops.
- The standard recipe stage list has placement but no narrative stage.

The current story network is still reachable through compatibility surfaces:

- `mods/mod-swooper-maps/src/domain/index.ts` exports the narrative namespace as
  a public collar.
- `mods/mod-swooper-maps/src/domain/config.ts` exports narrative config as a
  public collar.
- `mods/mod-swooper-maps/test/story/**` imports and exercises story corridor,
  orogeny, and overlay helpers.
- `packages/mapgen-core/src/core/types.ts` carries `StoryOverlaySnapshot`,
  `StoryOverlayRegistry`, and `ExtendedMapContext.overlays`.
- `mods/mod-swooper-maps/src/recipes/standard/runtime.ts` carries
  `storyEnabled`.

Runtime-control narrative-choice is a separate owner:

- `packages/civ7-direct-control/**`, `packages/civ7-control-orpc/**`, and
  `packages/cli/**` contain live Civ7 `CHOOSE_NARRATIVE_STORY_DIRECTION` /
  `choose-narrative` surfaces.
- Those files do not establish liveness for MapGen `domain/narrative/**`.
- They are protected throughout the burn-down except for search verification.

KNIP is supporting evidence only. It is unconfigured and cannot prove deletion
alone, but it corroborates unused narrative shell/tagging/helper surfaces.
Narsil/reference evidence plus `rg` consumer proof is the stronger liveness
basis.

## Current Drift To Resolve Before Source Edits

Global preflight in the clean execution worktree found one current source row
not listed in Slice 4's declared `storyEnabled` caller set:

- `mods/mod-swooper-maps/test/pipeline/determinism-suite.test.ts`

The implementation should repair the packet inventory before source edits,
because `execution.md` says changed query output must update the packet before
editing source. This is a caller-set expansion, not a plan-shape change: it
belongs to the Slice 4 compatibility cleanup write set once recorded.

## Scope

In scope:

- packet correction for the stale Slice 4 `storyEnabled` caller inventory;
- Slice 1 mechanical shell deletion;
- Slice 2 disposition table seal to `delete-current-implementation`;
- Slice 3 deletion of the remaining narrative source tree and story tests;
- Slice 4 removal of story overlay compatibility state and `storyEnabled`;
- per-slice Habitat classification, predeclared tests, `git diff --check`, and
  Graphite commits;
- closure checks from `execution.md`.

Out of scope:

- new Gameplay story implementation;
- preserving current story behavior behind aliases, compatibility exports, or
  broad public barrels;
- generic domain closed-structure enforcement;
- `structure.toml`;
- Grit pattern or packet work;
- changes to Civ7 runtime/control narrative-choice files;
- changes to placement/hydrology narrative wording;
- generated output edits.

## Worktree And Stack Frame

Use the dedicated execution worktree:

```text
/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-dra-narrative-burndown
```

The root checkout is dirty with unrelated generated/resource state and must not
be used for edits. The execution worktree was created from local `main` and had
a clean working tree before framing. `bun install --frozen-lockfile` completed
successfully in that worktree.

Graphite stack shape should be:

1. packet inventory correction for the `determinism-suite` drift;
2. Slice 1 shell deletion;
3. Slice 2 disposition seal;
4. Slice 3 story network deletion;
5. Slice 4 compatibility cleanup;
6. optional final closure record only if needed by `execution.md` evidence.

Every implementation slice should close with one logical Graphite commit unless
the source itself forces a smaller reviewable split.

## Slice Structure

### Slice 0: Packet Drift Correction

Purpose: make the operative packet truthful before source edits.

Allowed write: active packet material under the narrative liveness decision
directory, narrowly `execution.md` and/or adjacent corpus/review material needed
to record the additional `storyEnabled` caller.

Proof:

- rerun the global preflight `rg`;
- confirm the caller list accounts for
  `mods/mod-swooper-maps/test/pipeline/determinism-suite.test.ts`;
- `git diff --check -- .habitat/.active`.

### Slice 1: Mechanical Shell Deletion

Delete only the empty narrative domain shell and unused wind helper:

- `domain/narrative/ops.ts`
- `domain/narrative/ops/contracts.ts`
- `domain/narrative/ops/index.ts`
- `domain/narrative/orogeny/wind.ts`

Edit only:

- `domain/narrative/index.ts`
- `domain/narrative/orogeny/index.ts`

Preserve story exports and story tests. Do not touch root domain/config barrels,
runtime, core types, or story tests in this slice.

### Slice 2: Story Network Disposition

Seal the decision packet before deleting behavior-bearing source. This slice is
documentation/authority only and must not touch `mods/**`, `packages/**`, or
`tools/**`.

The disposition table should say the current story implementation is deleted
with no replacement in this cleanup. It must not retain "move to Gameplay" as a
source-preservation instruction. Gameplay remains future architecture context
only.

### Slice 3: Story Network Deletion

Delete the remaining narrative source tree and story tests, then remove root
public collars:

- `mods/mod-swooper-maps/src/domain/narrative/**`
- `mods/mod-swooper-maps/test/story/**`
- narrative export in `mods/mod-swooper-maps/src/domain/index.ts`
- narrative config export in `mods/mod-swooper-maps/src/domain/config.ts`

Protect MapGen core compatibility types, standard runtime, direct-control /
control-oRPC / CLI narrative-choice files, and placement/hydrology wording.

### Slice 4: Connected Compatibility Cleanup

Remove compatibility state that existed only for the deleted story overlay
network:

- `StoryOverlaySnapshot`
- `StoryOverlayRegistry`
- `ExtendedMapContext.overlays`
- default overlay initialization in `createExtendedMapContext`
- `storyEnabled` in standard runtime state/init/defaulting
- every `storyEnabled` initializer argument in current callers

Protect runtime-control narrative-choice files and placement/hydrology wording.

## Verification Model

Use the checks in `execution.md`; do not pick tests after editing. The checks
prove different claims and should be reported separately:

- `test ! -e ...`: deletion proof;
- negative `rg`: no remaining import/export/reference surfaces;
- positive runtime-control `rg`: protected narrative-choice surfaces remain;
- `bun habitat classify ...`: owner/routing proof for touched paths;
- `bun --cwd mods/mod-swooper-maps test test/story`: Slice 1 preserves story
  compatibility behavior until Slice 3 deletes it;
- `nx run mod-swooper-maps:check`: mod type/static check;
- `nx run mod-swooper-maps:test -- --runInBand`: mod behavior regression gate;
- `nx run mapgen-core:check` and `nx run mapgen-core:test`: cross-package
  compatibility cleanup proof;
- `bunx knip ...`: supporting dead-code evidence, not standalone authority;
- `git diff --check`: whitespace/diff hygiene.

Closure is not proven until all final checks in `execution.md` pass from the
current stack tip.

## Stop Rules

Stop before source edits if:

- global preflight finds new source/packet drift that changes write sets,
  protected surfaces, or deletion logic;
- source and packet evidence conflict in a way that changes the plan;
- verification fails for a reason that requires a plan or authority change;
- protected runtime-control narrative-choice files would need edits;
- placement/hydrology wording would need edits;
- Graphite/worktree state becomes ambiguous or dirty with unrelated work;
- any generated output or lockfile would need hand-editing.

Do not stop for ordinary check-ins. Report status briefly and continue the
active slice unless the user redirects the frame again.

## Review Handoff Shape

Final handoff should include:

- final Graphite branch/stack state;
- commits in order;
- per-slice changed/deleted files;
- verification command results;
- protected-surface confirmations;
- confirmation that direct-control/control-oRPC/CLI narrative-choice surfaces
  stayed intact;
- confirmation that generic domain blueprint enforcement was not implemented;
- residual risks, especially any evidence classified as KNIP suspicion only;
- recommended review focus: packet truth, deletion completeness, protected
  runtime-control preservation, and absence of compatibility aliases.
