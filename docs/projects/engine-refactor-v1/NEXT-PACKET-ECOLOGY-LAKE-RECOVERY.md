# NEXT PACKET: Ecology And Lake Recovery

## Purpose

This packet records follow-up work that is outside the already submitted
normalization/world-balance stack on `codex/restore-mapgen-world-balance`.
The active goal text cannot be edited in-place, so this file preserves the
remaining product-quality objective without reopening the closed architecture
normalization slices.

## Current Stack Boundary

- Current submitted stack tip: `codex/restore-mapgen-world-balance`
- Submitted PR: `#1368`
- Last submitted commit: `10e33fa45 fix(mapgen): align terrain materialization lifecycle`
- Completed stack responsibility: OpenSpec normalization changes archived,
  terrain materialization order aligned to the Civ7 lifecycle, focused
  world-balance/stat gates added, full build/deploy/runtime evidence recorded,
  and the worktree submitted cleanly through Graphite.

## Successor Objective

Own a separate Civ7 MapGen recovery workstream for the remaining player-visible
quality regressions:

- forests, sagebrush steppe, taiga/tundra-like vegetation, and other
  non-rainforest vegetation are under-visible or absent;
- rainforest appears, but the full vegetation family balance is not earthlike;
- lakes may still fail to visibly fill as water in Civ7 runtime despite the
  corrected materialization order;
- any upstream cause, including hydrology, morphology, climate, biomes,
  adapter/runtime projection, or shipped config identity, must be repaired at
  the rightful owner rather than compensated downstream.

## Deconfliction

The successor DRA should not modify the prior normalization closure record just
to re-open completed claims. Treat this packet as the start of a new workstream
that builds on the submitted stack.

The implementation DRA for this packet owns new OpenSpec changes, new Graphite
branches/worktrees, new config tuning, new tests, and new runtime proof. The
prior normalization stack remains the base unless current evidence shows that a
submitted slice introduced a concrete regression that must be fixed in-stack.

## Required Approach

- Start with framing design and create a no-budget goal for the successor
  objective.
- Use fresh agents for medium/long-running research, investigation, inquiry,
  or implementation. Reuse an old agent only when its old context is
  explicitly needed; in that case send `compact/`, wait, then send a framed
  `/goal ...` prompt.
- Investigate before implementation. Cover vegetation score/planner/config
  flow, lake projection/runtime behavior, official Civ7 resources, physical
  habitat targets, stats/testing design, and architecture/DX risks.
- Convert findings into OpenSpec changes before code.
- Keep feature-specific habitat physics with owning feature ops/policies.
  Shared logic must be a named invariant with concrete consumers, or it belongs
  in MapGen core when it is product-free machinery.
- Update shipped map configs/presets alongside code.
- Close only with focused tests, world-balance/stat tests, `bun run build`,
  deploy, FireTuner/Civ7 runtime evidence, OpenSpec evidence, and clean
  Graphite worktrees.

## Non-Goals

- Do not create generic feature routers, broad shared buckets, aliases,
  fallbacks, shims, compatibility lanes, or manual adapter bypasses.
- Do not special-case Swooper maps as the only map product.
- Do not treat screenshots alone as proof. Screenshots are symptom evidence;
  closure needs measured stats and runtime observations.
