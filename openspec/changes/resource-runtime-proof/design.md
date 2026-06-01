# Resource Runtime Proof Design

## Frame

This slice is a runtime-evidence slice, not another local balance-tuning slice.
The selected signal is live Civ7 execution after deploy and restart; the
foreground is whether resource diversity survives in game; the exterior is
earthlike tuning changes and generated-output hand edits.

Structural alternative considered: rely only on local world-balance stats.
Rejected because the resource workstream explicitly needs final FireTuner/Civ7
runtime evidence through the downstack restart integration boundary.

Falsifier: if the post-restart scripting-log window lacks a fresh
`RESOURCE_PLACEMENT_V1` record or shows only a minority of placed resource
types when enough placements exist, this runtime-proof slice cannot close.

## Runtime Telemetry

`place-resources` emits a single JSON log line after typed resource placement
outcomes are available and only when the Civ7 `GameInfo.Resources` table exists:

```text
[SWOOPER_MOD] RESOURCE_PLACEMENT_V1 {...}
```

The payload records:

- total planned, placed, rejected, and mismatch counts;
- assignment diagnostics preserving the original preferred resource ids,
  reassigned counts, unassigned preferred placement counts, legal candidate
  count, and unassignable candidate ids;
- unique planned and placed numeric resource type counts;
- min/max placed count spread across placed resource ids;
- runtime GameInfo catalog size;
- unmapped placed numeric ids, if any;
- compact planned, placed, and rejected numeric resource id lists; and
- rejection reason totals.

Full per-preferred-resource assignment diagnostics remain in the local
placement proof artifact. The runtime log line is intentionally compact because
Civ7 truncates long `Scripting.log` lines; the `version: 1` payload keeps the
full-catalog proof parseable.

The log line is intentionally runtime-only. Local tests exercise the formatter
with injected GameInfo-like rows; Node test runs do not emit the runtime line.

## Engine-Legal Assignment

The first runtime proof attempt exposed a gap between local numeric diversity
and Civ7 resource legality: the plan had 55 unique numeric ids, but the engine
placed only 16 symbolic resource types because many preferred ids were tried on
tiles where `ResourceBuilder.canHaveResource` rejected them.

This slice keeps the plan as the deterministic density/priority source, then
lets the product-effect materialization step assign resource ids to tiles that
Civ7 reports as legal:

1. Try to place each candidate resource id at least once on the highest-priority
   unused legal tile.
2. Preserve assignment diagnostics for the original preferred ids so rewritten
   or unassignable ids cannot disappear from the proof artifact.
3. Fill remaining planned slots with the least-used legal resource id for each
   planned tile.
4. If planned tiles cannot satisfy the target, scan remaining map tiles for
   legal assignments before accepting a lower placed count.

This is not a fallback to official generation. The step still places explicit
typed intents through the adapter and keeps typed per-resource outcomes.

## FireTuner Restart Boundary

Current checked boundary:

- branch: `codex/firetuner-socket-studio-restart`
- commit: `bb39b3cf7 fix: submit Studio restarts through FireTuner socket`
- expected changed files:
  - `apps/mapgen-studio/vite.config.ts`
  - `packages/cli/src/utils/firetunerSocket.ts`
  - `packages/cli/test/utils/firetunerSocket.test.ts`

The active resource stack is above that branch. Before claiming closure, this
slice must re-check whether a successor downstack restart branch/commit has
advanced, restack/integrate it if needed, and record the exact command/path
used.

## Runtime Command

The direct CLI bridge command used for a preliminary probe was:

```bash
bun run --cwd packages/cli dev -- game restart --agent Codex-resource-runtime-proof --wait --timeout-ms 45000 --json
```

That command writes to the FireTuner bridge log through
`packages/cli/src/commands/game/restart.ts` and
`packages/cli/src/utils/firetunerBridge.ts`, producing a request line of the
form:

```text
REQ <request-id> AGENT=Codex-resource-runtime-proof RUN Network.restartGame()
```

Final proof uses the downstack Studio socket/API path from
`apps/mapgen-studio/vite.config.ts` by posting the unchanged repo-backed
`swooper-earthlike` config to:

```text
POST http://127.0.0.1:5175/api/map-configs
```

That path deploys, calls `runFireTunerSocketCommand(...)`, receives
`output: ["true"]`, and can optionally wait for a fresh `Scripting.log`
MapGeneration window. In the final observed proof, Civ7 stopped at the
front-end `Begin Game` confirmation boundary after the socket restart returned
true; FireTuner UI focus plus a local Return keypress advanced that same
restarted setup into the bounded runtime log window.

## Write Set

- `mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/place-resources/**`
- `mods/mod-swooper-maps/test/placement/resource-placement-diagnostics.test.ts`
- `openspec/changes/resource-diversity-stats-gate/**`
- `openspec/changes/resource-runtime-proof/**`
- `openspec/changes/resource-runtime-proof/workstream/phase-record.md`
