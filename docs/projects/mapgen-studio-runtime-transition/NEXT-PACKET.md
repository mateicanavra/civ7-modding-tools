# Next Packet: Close The Studio Product Outcome

Status: prepared at a clean packet boundary; paused for context compaction

Normative frame:
`docs/projects/mapgen-studio-runtime-transition/WORKSTREAM.md`

Live state:
`docs/projects/mapgen-studio-runtime-transition/verification-ledger.md`

## Objective

Make the rendered Studio Run in Game flow complete the requested launch from
current source to request-correlated in-game content. Use existing repository
checks and lightweight records. Do not build custom progress-tracking tools.

## Current Stack

```text
codex/studio-run-live-playability@4f501fabfdc6
  -> codex/mapgen-studio-runtime-transition-planning@ca6a06d24fff
  -> codex/mapgen-studio-config-envelope-runtime-cutover@3f5ed12e81a5
  -> codex/mapgen-studio-manifest-parity-replay@b2367c50d6ae
  -> codex/mapgen-studio-runtime-stage-0-census (this record commit)
```

The historical source recovery is verified. The config and parity branches
passed isolated static and behavior checks, but no current-tree rendered
browser/Civ7 matrix has closed. Those branches are implementation evidence, not
the product result. The worktree is clean and Studio is freshly built and
running from this exact checkout on ports `5173` and `5174`.

## Prepared Findings

- The prior rendered `Resolving source` stall was orphaned browser state served
  against a daemon that predated the config-envelope branches. After a clean
  rebuild and restart, the browser, oRPC client, `/rpc` host, and current
  operation projection all resolve through the same current source tree. Do not
  add a second endpoint or UI path to repair that stale-process failure.
- All nine checked-in configs pass current schema admission, exact envelope
  round-trip, complete 22-stage materialization, four-seed generation,
  deterministic repeat, and fresh artifact rendering. No all-water output was
  reproduced. The remaining generic defect is that current admission can accept
  a partial 16-stage default object because it mistakes normalization no-op for
  completeness.
- Studio still owns setup/start orchestration by importing direct-control
  functions in `Civ7WorkflowControl.ts`. The control oRPC surface has no
  setup/lifecycle family. That is the next larger ownership defect after config
  completeness is closed.
- One read-only investigation accidentally sent request
  `studio-run-in-game-mrgo592d-a58-2`. It generated and deployed the Studio run
  mod, then failed during `preparing-civ7` under Tuner backoff. It did not start
  Civ7 and is not an accepted runtime row; account for the replaced deployment
  before the next live attempt.

## Packet Sequence

### A. Complete Config Admission

Establish one schema-aware complete-normalization operation backed by
`buildCompleteSchemaDefaults`. Use it at both Studio and Swooper source
admission while retaining partial `normalizeStrict` for compiler inputs. Replace
stage-name/key-list assertions with generic complete-materialization and
normalization-idempotence behavior tests.

Primary files:

- `packages/mapgen-core/src/compiler/normalize.ts`
- `packages/mapgen-core/test/compiler/normalize.test.ts`
- `mods/mod-swooper-maps/src/maps/configs/canonical.ts`
- `mods/mod-swooper-maps/test/config/maps-schema-valid.test.ts`
- `apps/mapgen-studio/src/features/configAuthoring/canonicalConfig.ts`
- `apps/mapgen-studio/test/config/standardRecipeArtifactGuards.test.ts`

Close only after all nine configs pass through the shared boundary, focused and
classify-reported gates pass, and fresh TypeScript refactoring, code quality,
and TypeBox/library-correctness reviewers clear the change. Commit it as one
Graphite child above the census branch.

### B. Control oRPC Setup And Start Ownership

Design and implement the missing typed setup/lifecycle capability under
`packages/civ7-control-orpc`, using the daemon-owned Tuner session and in-process
server client. Move Studio off caller-local direct-control orchestration. The
operation must exit only an active game when necessary, load and reconcile the
saved setup and generated map, start the game, and retain request correlation
without restarting the Civilization VII application.

Close with contract/router/client behavior tests, dedicated TypeScript,
structure, oRPC, Effect, and direct-control reviews, and one rendered Swooper
Earthlike run with unchanged Civ7 application PID.

### C. Rendered Acceptance And Matrix

Exercise the actual button and establish exactly one request from browser
admission through public status, explicit diagnostics, manifest, deployment,
setup, start, and request-correlated in-game observation. Then run Latest Juicy,
Swooper Desert Mountains, and every declared freshness, failure, cancellation,
conflict, recovery, and redaction row. Reconcile packets and records, run the
full static gate set, submit and merge the accepted stack, and return to Habitat.

## Product Loop

1. Restart Studio from this worktree and confirm frontend, daemon health, and
   reported repo root all match the current committed tree.
2. Run the existing all-config admission and generation checks for every one of
   the nine built-in configs. Repair shared source/default/materialization
   defects only; no per-config migration, merge, or property special case.
3. Exercise the rendered Run in Game button and follow one request through the
   oRPC client, public status/current operation, explicit private diagnostics,
   generation manifest, generated mod, deployment snapshot, direct-control
   setup, and game start.
4. At the first real failure, diagnose the owning boundary, make the smallest
   architectural repair, run its behavior/static/library reviews, and repeat
   the rendered flow. Do not substitute a direct endpoint call for the button.
5. Close the first success row with Swooper Earthlike,
   `ToT_BasicModsEnabled.Civ7Cfg`, Huge, 10 players, balanced resources, and
   seed `1538316415`.
6. Run Latest Juicy and Swooper Desert Mountains plus the declared freshness,
   recovery, cancellation, conflict, validation, and redaction rows.
7. Reconcile OpenSpec/task/evidence records, run full static gates, submit and
   merge the accepted Graphite stack, then return the parked follow-up work to
   Habitat.

## Runtime Law

- Studio carries one complete admitted JSON config envelope without browser or
  server migration, deep merge, scrubbing, or property-level rescue.
- One rendered request owns one source, manifest, generated mod, deployment,
  setup reconciliation, and launched game.
- Ordinary Run in Game uses the canonical direct-control oRPC capability to
  soft-restart the Civ7 game. It does not restart the whole application.
- Public status stays redacted. Private diagnostics require explicit lookup.
- Endpoint, unit, browser, setup, and in-game observations are separate gates;
  none substitutes for another.

## Stop Conditions

Do not mutate unrelated worktrees or the readiness stack. Serialize live Civ7
mutation. If Civ7/Tuner is externally unavailable, record the exact state and
continue every non-live repair and check that remains possible; availability is
not a reason to stop diagnosis or implementation.
