# Live Verification Runbook — the in-game closure gate

> Open at loop step 7 (in-game verification) to run the mutating live gate end-to-end: build → deploy → cold-boot → run-in-game → log-marker proof → parity → proof labels. This is the **closure test** of the workstream — Studio is where you *see*, the live engine is where you *know*. A map-gen change is **not done** on Studio/diagnostic evidence alone (FRAMING hard core 2).

This is a runnable checklist, not a concept doc. The display-vs-generation branch and benchmark overlay live in `references/facet-verification.md`; the generic benchmark contract lives in `docs/system/libs/mapgen/benchmarks/BENCHMARKS.md`; tuner discipline lives in `civ7-operational-debugging` → `references/firetuner-runtime.md`; closure labels live in its `references/proof-boundaries.md`. This file does **not** restate those — it sequences the commands that exercise them. Re-derive any exact flag or path from the direct Nx targets in `mods/mod-swooper-maps/project.json` and their `scripts/live/*` entrypoints if a detail here looks stale.

---

## 0. Prerequisites (build order is load-bearing)

`@swooper/mapgen-core` is the engine substrate the mod compiles against. Run
the mod's Nx-owned build or deploy target so Nx owns upstream build ordering;
do not build workspace dependencies through a second manual graph. A stale
dependency can silently bake old behavior into the deployed bundle while the
SHA-256 deploy check still passes on the wrong logic.

1. Build the mod through its project graph: `nx run mod-swooper-maps:build`.
2. Build + deploy the mod: `nx run mod-swooper-maps:deploy`. The deploy target depends on the build and copies built bundles into the game Mods folder; the verifier SHA-256-compares those outputs.
   - Local script: `mods/mod-swooper-maps/mod/maps/<name>.js`
   - Deployed script (darwin): `~/Library/Application Support/Civilization VII/Mods/mod-swooper-maps/maps/<name>.js`
   - Deploy is **not optional before every mutating verify** — nx cache or a partial deploy will leave drift that exits the gate with `recoveryHint: "nx run mod-swooper-maps:deploy"`. Always deploy immediately before a mutating run.
   - **New or renamed map config** → run `bun run gen:maps` (regenerate entrypoints) then deploy before the gate; the generated map-script must exist at `mod/maps/<name>.js` and match the `SWOOPER_MAP_SCRIPT_PATTERN` deploy check. See `references/pipeline-map.md` (map configs → generated entrypoints).
3. Tuner enabled: `EnableTuner 1` in Civ7 `AppOptions.txt` (no leading semicolon). Tuner socket = `127.0.0.1:4318`. (Owner: `civ7-operational-debugging` → `references/firetuner-runtime.md`.)
4. Studio running on `http://127.0.0.1:5174` **if** you intend to run the `final-surface-parity` proof afterward. The parity command uses the public operation status only to reach the bounded private diagnostics record and its generation manifest.

---

## 1. Cold-boot launch contract

Direct-control has **no** cold-boot automation — it assumes Civ7 is already at the shell. The standard sequence (memory: `civ7-live-map-launch-and-capture`):

1. **Cold-boot Steam**: `open "steam://rungameid/1295660"`. Poll the tuner socket until open, then `game status` until `readiness: shell`. A "tuner unreachable" failure is almost always just Civ7 not running yet.
2. **Launch from setup**: use the `@civ7/control-orpc` `lifecycle.singlePlayer.start` capability through `verify-studio-run-in-game-live.ts`. It owns shell admission, setup application, Begin Game, and post-start tuner/readback evidence as one correlated lifecycle. The `Tuner` scripting state is command-ready only *after* Begin Game and remains the canary for gameplay globals (`Game`, `GameplayMap`, `Players`).
3. **SIGSEGV guard (do not skip).** Maps that pass local headless `MockAdapter` validation can still SIGSEGV the live engine (null-deref at 0x20) when the deployed map recipe skips standard `write`/`prep` operations. Never hand-roll a minimal recipe or launch bypass. A clean MockAdapter run does **not** prove live-engine safety.

The `verify:studio-run-in-game-live` target owns this launch, so invoke the verifier rather than calling lifecycle atoms by hand.

---

## 2. The mutating gate — `studio-run-in-game-live`

This is the primary in-game gate. Ordered internals (from `scripts/live/verify-studio-run-in-game-live.ts`):

| Step | What it does | Failure |
|---|---|---|
| 1. Deploy check | SHA-256 + mtime local vs deployed; scans both for river-materialization markers | exit 2, `recoveryHint: nx run mod-swooper-maps:deploy` |
| 2. Health check | `checkCiv7DirectControlHealth` → tuner `127.0.0.1:4318` | exit 2, `failureStage: "health"` |
| 3. Setup snapshot | reads Civ7 phase; if not `shell` and not `exit-to-shell`, aborts | throws (default `reject`) |
| 4. Map-row visibility | `getCiv7SetupMapRows` confirms the script is in the setup UI | exit 2 |
| 5. Deployed-script identity | SHA-256 + marker presence (swooper scripts only) | exit 2 |
| 6. Scripting.log snapshot | `snapshotFile` captures pre-launch log boundary (size + mtime + 4096-byte prefix) | — |
| 7. Launch | `lifecycle.singlePlayer.start` through the live verifier | exit 2 |
| 8. **waitForFreshLogMarkers** | the success gate — see §3 | reject ⇒ exit 2/3 |
| 9. Proof output | `proofId` + report as JSON to stdout | — |

Invocation (mutating):

```bash
nx run mod-swooper-maps:verify:studio-run-in-game-live -- \
  --mutate \
  --map-script "{swooper-maps}/maps/swooper-earthlike.js" \
  --map-size MAPSIZE_HUGE \
  --seed 1337 \
  --game-seed 7331 \
  --player-count 10 \
  --wait-timeout-ms 120000
```

- `--wait-timeout-ms`: Huge maps take 60–90 s on the live engine; set this to match expected gen duration (default 90 s, propagated to `waitForFreshLogMarkers`).
- Map-script must match `SWOOPER_MAP_SCRIPT_PATTERN` = `/^\{swooper-maps\}\/maps\/([a-z0-9]+(?:-[a-z0-9]+)*\.js)$/`.
- Invoke the Nx target rather than the script directly so upstream build evidence stays inside the repository task graph; deployment remains the explicit prerequisite in §0.

---

## 3. SUCCESS markers and rejectPattern (the proof condition)

`waitForFreshLogMarkers` polls `Scripting.log` **from the snapshot offset** and is sequence-enforced (a cursor advances; both markers must appear *in order*, not merely be present):

- **Success markers (in order):** `[mapgen-complete]` then `"seed":<N>` (the literal authored seed, e.g. `"seed":1337`).
- **rejectPattern** (any match ⇒ fail fast): `/\[mapgen-failure\]|Map generation failed|\[recipe:[^\]]+\].*fail|StepExecutionError|\b(?:TextEncoder|Uncaught|Exception|Error)\b/i`
- Applied to the **fresh** (post-snapshot) log segment only; if the engine rewrote the log (prefix mismatch), the full text is used.
- Corroborating tuner-proof signals (owner: `firetuner-runtime.md`): fresh `Creating Context - MapGeneration`, final stage `[50/50] ok mod-swooper-maps.standard.placement.placement`, `Destroying Context - MapGeneration`, and **no** `TextEncoder` / `Uncaught` / `Error` / `Exception` in the fresh window.
- Scripting.log (darwin): `~/Library/Application Support/Civilization VII/Logs/Scripting.log`. Sibling logs for non-mapgen questions: `Modding.log` (load), `Database.log` (XML), `UI.log` (UI JS), `output.log`.

> `[mapgen-proof]` present but no `[mapgen-complete]` = the run crashed mid-generation. Check `output.log` and `~/Library/Logs/DiagnosticReports/CivilizationVII-*.ips` for the SIGSEGV.

**Exit codes:** `0` ok · `1` exception · `2` stage-failure · `3` run-not-verified.

---

## 4. Request-id / private-diagnostics flow (parity proof)

The parity command verifies a map launched through Studio's **Run in Game**
workflow. Capture that operation's `requestId` or retained private
`diagnosticsId`, leave the resulting Civ7 game running, and invoke:

```bash
nx run mod-swooper-maps:verify:final-surface-parity -- \
  --request-id studio-run-in-game-live-proof-<id> \
  --studio-url http://127.0.0.1:5174 \
  --output /tmp/parity-proof.json
```

For `--request-id`, public status is only a bridge to the retained private
diagnostics record. Acquisition verifies the private Run in Game envelope and
its immutable generation-manifest reference, then the Standard recipe owner
admits the raw exact-authorship evidence and issues the only deterministic
replay authority. A ready request performs that replay and exactly one coherent
`getCiv7MapSurfaceObservation` covering terrain, biome, feature, resource,
hydrology, native rivers, wire identity, map identity, and turn stability.
`--diagnostics-id` skips the short-lived public status lookup;
`--evidence-file` replays a saved private diagnostics record.

- `status: "complete-pass"` → exit 0. Every admitted product comparison passed and no required identity/evidence link remains unresolved.
- `status: "complete-failed"` → exit 2. One or more exact product comparisons failed.
- `status: "blocked-unresolved"` → exit 2. Known comparisons remain visible, including failures, but a required evidence link is unavailable.
- `status: "correlation-failed"` or `"correlation-blocked"` → exit 2 without replaying or reading Civ7.
- Acquisition, transport, replay, observation, or publication exceptions → exit 1.

The current live/control surfaces do not expose one supported game-instance
token shared by the Studio launch window and the later Direct Control
observation window. Until that capability exists, an otherwise matching report
honestly retains `identity.cross-window-game-instance` and remains
`blocked-unresolved`; seed, turn, dimensions, endpoint, and surface content are
not promoted into substitute identity.

---

## 5. The two Swooper operational verify targets

Nx exposes each live proof as its own target; there is no secondary mode router:

| Target | Live? | Use |
|---|---|---|
| `verify:studio-run-in-game-live` | **yes** | the mutating gate (§2) |
| `verify:final-surface-parity` | **yes** | local-vs-live grid parity (§4) |

The former output-parity, delta-feasibility, terrain-edge, placement-legality, and
required-for-age probes were milestone-scoped characterization scripts, not durable
operational gates. Their recorded evidence remains historical. The Standard
parity report owns current local-vs-live comparison; its unresolved links
and retained private evidence own run-specific triage. Map Policy tests own static resource facts and the age-valid
`Staple`/`UnlocksCiv` fallback; exact roster-dependent
`isResourceRequiredForAge` flows through `EngineAdapter`. When that live policy
is unavailable, planning records unresolved unless the static basis admits the
minimum; it never substitutes `false`. Prove changed placement behavior with the
product-level live gate above.

---

## 6. ATTEMPT-1 failure-recovery branch (live-only runtime gaps)

The first live attempt frequently fails on gaps a MockAdapter run cannot surface. Recognize and route them:

1. **`console.warn is not a function`** — the Civ7 `MapGeneration` scripting context exposes only `console.log`. Any op/placement code calling `console.warn()` crashes the step (e.g. step `50/53 placement.place-resources`). It trips rejectPattern as `Error`. **Fix:** replace every `console.warn` call site with an engine-safe `warnLog` helper — categorically, not just the one that crashed (this is a *class*, not an instance). Reference recovery: branch `placement-realignment-s9-live-compat`, integration commit `409f35de5`. Treat any other browser/Node global used in op code the same way (TextEncoder, etc. — all are in the rejectPattern).
2. **SIGSEGV on MockAdapter-valid maps without standard write/prep ops** — covered in §1.3. The log-marker gate does **not** catch this directly (the engine never reaches `[mapgen-complete]`); it surfaces as a health-check failure on the *next* verify run, or as `[mapgen-proof]` with no `[mapgen-complete]` + an `.ips` crash report. Route authored data through the standard `map-morphology`, `map-ecology`, and `placement` runtime stages; never bypass them.
3. **Age-intro / wonder-cinematic overlay blocking OS capture** — after `game visibility --reveal`, a blocking notification/cinematic queue sits in front of the map. `game appshot` (macOS `screencapture`) then captures a stale/cinematic frame, and `screencapture` itself returns pixel-identical stale frames across many seconds. **This does not block the log-marker gate** (the proof is the log, not the pixels) — it only blocks *visual* QA. Workaround: drain the queue via the official handler (`fxs-hero-button.cinematic-moment__close-button`) before requesting a screenshot, and foreground the Civ7 app so its Metal renderer draws.

After any §6 fix: **re-build core → re-deploy → re-run §2** (a fix is not deployed until the SHA-256 deploy check passes on the new bundle). Land such live-only compat fixes as a focused **hotfix slice** rather than folding them into the feature change, so the in-game-compat fix is independently reviewable.

---

## 7. Labeling the resulting proof

Close with one closure label per claim (owner: `civ7-operational-debugging` → `references/proof-boundaries.md`). For a map-gen change specifically:

- **`in-game observed`** — only when a mutating live run reached `[mapgen-complete]` + `"seed":<N>` with no rejectPattern hit. Name the map script, map size, map seed, game seed, player count, and the correlated request identifier. Add `status: "complete-pass"` only when the Standard parity report actually reached that state; a successful live generation plus `blocked-unresolved` remains an explicitly bounded observation, not complete parity.
- **`generated`** — Studio/dump binaries were inspected (`diag:diff`, viz canvas). This is the **ceiling** for Studio-only evidence; it does **not** close a generation change.
- **`deployed` / `built`** — deploy SHA-256 passed / core+mod built. Necessary but not sufficient.
- **`unresolved`** — the live gate did not run, blocked on parity `unresolvedLinks`, or only OS-capture failed (note that capture failure ≠ gen failure).

State proof **boundaries** explicitly: an `in-game observed` claim for one Huge/earthlike seed does **not** prove other map sizes, seeds, eras, or mod combinations behave the same. Per-mode caveats (e.g. `AGREEMENT_GATE_THRESHOLD=0.95` measured at 0.9863 on the Huge/earthlike reference) belong in the proof note, not generalized.

Hand the labeled proof to finalization (loop step 10 → `civ7-open-spec-workstream` / `habitat:systematic-workstream`); do not re-implement closure discipline here.

---

## Evidence anchors (live source — re-derive, don't trust this snapshot)

- `mods/mod-swooper-maps/project.json` — direct Nx ownership for the two live verification commands.
- `mods/mod-swooper-maps/scripts/live/verify-studio-run-in-game-live.ts` — the gate; `waitForFreshLogMarkers` call + `REQUIRED_SWOOPER_RIVER_MATERIALIZATION_MARKERS`.
- `mods/mod-swooper-maps/scripts/live/verify-final-surface-parity.ts` — private-diagnostics acquisition, correlated Standard replay, one coherent live observation, report composition, and atomic publication.
- `packages/civ7-direct-control/src/proof/log-markers.ts` — `waitForFreshLogMarkers` + `snapshotFile`.
- `packages/civ7-control-orpc/src/modules/lifecycle/procedures/single-player-start.ts` — the correlated setup/start lifecycle.
- `packages/civ7-direct-control/src/session/{constants,request-id}.ts` — tuner port/host, `createCiv7ControlRequestId`.
- `docs/projects/placement-realignment/evidence/milestone-{a,b}-2026-06-11.md` — recorded attempt-1 failure (console.warn), attempt-2/3 success, age-intro overlay dismissal.
