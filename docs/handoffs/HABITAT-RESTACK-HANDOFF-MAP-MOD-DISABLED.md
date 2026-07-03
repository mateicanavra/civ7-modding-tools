# Habitat Restack Semantic Handoff - Map Mod Disabled Run-in-Game Failure

Status: prep-phase handoff, no restack execution performed

Change set: PR #1989, `agent-S-rig-mod-disabled-error`, merged as `db31a9a9d828af0499e75d85a57ce45da23b92f4` on 2026-06-30

Confidence: Verified for merge/PR/file evidence; Corroborated for runtime forensic intent from PR body; runtime proof was not rerun in this prep phase.

## What Changed

PR #1989 turns the opaque Run-in-Game failure `setup-map-row-not-visible` into a named actionable condition when Civ7 has the Swooper map mod disabled or unloaded.

Evidence:

- `gh pr view 1989` reports merged PR #1989, head `agent-S-rig-mod-disabled-error`, merge commit `db31a9a9d`, title `feat(studio-server): name & surface the "map mod disabled" Run-in-Game failure`.
- `git show --name-status db31a9a9d` changes:
  - `packages/studio-server/src/ports/Civ7WorkflowControl.ts`
  - `packages/studio-server/src/ports/mapModVisibility.ts`
  - `packages/studio-server/test/mapModVisibility.test.ts`
  - `apps/mapgen-studio/src/ui/components/GameConsole.tsx`
- The PR body says a live forensic run proved the map can materialize, deploy, register, and still fail because Civ7 has disabled the mod; re-enabling the mod made the same run complete.

## Why It Changed

The previous failure collapsed two cases into one message:

- the target mod is not loaded, so no sibling maps from that mod are visible;
- the mod is loaded, but the freshly deployed map row has not been enumerated yet.

The new behavior reads the full setup map list only after the target row remains absent, then classifies the cause by sibling visibility. The classifier is false-positive guarded: it only reports `map-mod-not-loaded` when Civ7 is showing other map rows and no rows from the target mod namespace.

## What Must Not Be Dropped

- Keep `classifyMapRowVisibilityFailure` and `modNamespaceFromMapScript` behavior in `packages/studio-server/src/ports/mapModVisibility.ts`.
- Keep the `Civ7WorkflowControl.prepareSetup` full-list fallback via `getCiv7SetupMapRows({})` after `ensureCiv7SetupMapRowVisible` returns no target rows.
- Keep the diagnostic code `map-mod-not-loaded`, the `modNamespace`, `siblingMapRowCount`, `visibleMapRowCount`, and actionable `recoveryHint` diagnostics.
- Keep the fallback behavior: if the full-list read fails, do not guess disabled mod; preserve the established `setup-map-row-not-visible` failure.
- Keep the GameConsole special rendering for `runInGameStatus.details?.code === "map-mod-not-loaded"` and its "Map mod disabled in Civilization" operator message.
- Keep `packages/studio-server/test/mapModVisibility.test.ts` or equivalent coverage for the two discriminator cases and false-positive guard.

## Likely Conflict Surfaces

Current shallow overlap with the Habitat stack is empty for this PR alone:

```text
comm -12 <(git diff --name-only 921075e9c..codex/habitat-studio-operating-niches) <(git diff --name-only db31a9a9d^..db31a9a9d)
=> no paths
```

Even without file overlap, the behavior can be accidentally dropped if a broad restack resolution overwrites current `main` copies of:

- `packages/studio-server/src/ports/Civ7WorkflowControl.ts`
- `apps/mapgen-studio/src/ui/components/GameConsole.tsx`
- `packages/studio-server/src/ports/mapModVisibility.ts`
- `packages/studio-server/test/mapModVisibility.test.ts`

This is therefore a pass-through semantic handoff: it should normally ride in from `main` untouched, but any conflict or cleanup touching those files must preserve it.

## Preservation Checks

Proof classes are separate:

- Record truth proof: `git grep "map-mod-not-loaded"` must find the classifier, server diagnostics, UI special case, and tests; `test -f packages/studio-server/test/mapModVisibility.test.ts` must pass unless equivalent coverage is explicitly substituted.
- Unit behavior: run `bun run --cwd packages/studio-server test -- mapModVisibility.test.ts` or the closest current package-local test command after the restack.
- Habitat wrapper behavior: run the studio-server check target through the current Habitat/Nx entrypoint after package surfaces are resolved.
- Record truth proof: `apps/mapgen-studio/src/ui/components/GameConsole.tsx` must still branch on `runInGameStatus.details?.code === "map-mod-not-loaded"` and surface the recovery hint.
- Runtime/product proof: not required for prep, but if claimed later, it must name a fresh Civ7 run where the mod-disabled condition is reproduced and surfaced.

Non-claims:

- The PR evidence does not prove current Habitat restack behavior until the files are checked after restack.
- The unit test does not prove live Civ7 behavior.
- No runtime proof was rerun during this prep phase.

## Unresolved Questions

- Whether the final restack will touch `Civ7WorkflowControl.ts` or `GameConsole.tsx`; if not, this change set should remain a pass-through check.
- Whether the current package-local test command changes after Habitat task-graph projectization; use `habitat classify` or Nx metadata after restack to select the final command.
