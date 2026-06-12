# Handoff — Live Validation Findings & Immediate Direction (2026-06-11)

> **SUPERSEDED same day — corrections (read first).** The repair loop this
> doc commissioned ran to completion; several findings below were FALSIFIED:
>
> 1. **There is no leaked cinematic render layer.** The "wonder scene that
>    survives all cleanup" in whole-display captures was the macOS
>    **"Sequoia Sunrise" wallpaper** (a redwood forest video). The game runs
>    fullscreen on its own Space; `screencapture -x` captures the desktop
>    Space. The official close path was never broken.
> 2. **The official close path works and is now the substrate.** Wonder
>    cinematics, unlock popups, and triumph popups were all closed live via
>    `DisplayQueueManager.closeMatching(category)` with handler state
>    verified clean. The synthetic-DOM dismissal primitive (finding 1 below)
>    was REPLACED outright by `display-queue.ts` (D8 in the workstream
>    record); `suspend()/resume()` additionally allow mutating without
>    anything ever displaying.
> 3. **Explore is implemented natively** via engine tracked visibility
>    grants: `Visibility.setTrackedVisibilityGrant(player, 1, plots)` →
>    settle → `removeTrackedVisibilityGrant` leaves plots REVEALED/fogged
>    with zero leaked refcounts (D9). The debug console's "Explore All" is
>    an ImGui render-only override with no scripting binding — not
>    borrowable. Discovery popups are suppressed via suspend→purge→resume.
> 4. **`XR` is definitively `undefined` in the Mac Steam build** (probed in
>    a clean world view); the XR screenshot API exists only in the
>    VisionOS/XR build. No native JS-invocable capture exists; window-scoped
>    OS capture (ScreenCaptureKit; needs a one-time Screen Recording TCC
>    grant) is the honest appshot fix.
>
> Current decisions live in `workstream-record.md` (D8/D9). The text below
> is preserved as the historical state capture that drove the repair loop.

State capture before a context compaction. Everything below was discovered
live against a running Civ7 session (user present, single built-in display).

## Hard findings (live-proven)

1. **The cinematic-dismissal primitive (PRs #1576/#1577) produces FALSE
   drains and must be fixed before merge.** It dispatches synthetic DOM
   events at `fxs-hero-button.cinematic-moment__close-button`; the placard
   DOM disappears and `screen show` reports drained, but the official close
   handler never runs. Orphans left behind, each verified live:
   - DisplayQueue entry — clearable via module-registry import of
     `/core/ui/context-manager/display-queue-manager.js` →
     `DQM.close(activeDisplay)`.
   - `CinematicManager.currentCinematic` nulled with `movieInProgress=true`
     — manager reachable WITHOUT importing base-standard paths via
     `DQM.getHandler('Cinematic')`; `releaseCinematic()` clears flags.
   - Pushed dynamic cameras (one per dismissed wonder) — `Camera.popCamera()`
     xN restores logical camera (verified: `lookAtPlot(5,14)` then readback
     `centerMatchesTarget: true`).
   - A leaked `WorldUI.requestCinematic` RENDER LAYER that none of the above
     clears — the wonder scene (Redwood Forest) stayed on screen through all
     cleanup. Only a game restart clears it. The long "stale frame"
     diagnosis was WRONG: captures showed the real screen (an idle, pixel-
     stable cinematic) the whole time.
   **Fix direction:** the primitive must drive the official path — the
   placard component's own `close(UIViewChangeMethod.PlayerInteraction)`
   (the narrative-request `root._component.close()` pattern) or
   `DQM.closeMatching({category:'Cinematic'})` BEFORE the DOM is touched,
   so `releaseCinematic()` tears down scene+camera+movie. Then re-validate
   live: the gate is "visible layer gone in a fresh screen capture", NOT
   DOM-clear. Update tests to encode handler-ran semantics, not DOM counts.

2. **Map reveal for proof work should be EXPLORE, not REVEAL (user
   direction + corpus evidence).** `--reveal` (`Visibility.revealAllPlots`)
   triggers per-wonder discovery cinematics — the whole mess above.
   The native debug console's Map tab "Explore All" shows all plots WITHOUT
   player-perspective reveals (no cinematics). Our CLI already has
   `game map visibility --explore --disposable` →
   `exploreCiv7MapForPlayer` (`packages/civ7-direct-control/src/play/map/visibility.ts:242`,
   boundary `does-not-call-revealAllPlots`). NEXT: read that function's
   in-engine command to see what it actually calls; research what engine
   primitive the native "Explore All" debug button uses (debug widgets are
   NATIVE, not in the JS resources — `hud-debug-widgets.chunk.js` has no
   explore/reveal; likely an engine-side debug command; compare against our
   explore implementation). Then: switch all proof/QA flows to explore and
   validate live that terrain shows with ZERO cinematics queued.

3. **`game appshot` captures the entire display, not the game.** Verified:
   appshot output is hash-identical to `screencapture -x` (full display).
   It should scope to the Civ7 window (`screencapture -l <windowID>`), or
   better use the game's own screenshot. `XR.World.takeScreenshot`
   reported `availability:false` twice, but the user suspects a mistaken
   assumption (probes ran while cinematic/UI layers were up). Re-probe XR
   availability in a CLEAN world view after restart; also check what
   surface the game's own photo/XR options use. Appshot is rivers-stack
   code — fix lands either as an integration-branch patch (immediate use)
   or a note for the rivers drain.

4. **Module-registry imports from App UI exec:** `/core/ui/...` paths
   import fine (live-verified for interface-modes and
   display-queue-manager). `base-standard` chunk paths are NOT importable
   (all roots 404) — reach base-standard singletons through DQM handlers.
   `InterfaceMode` current mode read works this way (was
   `INTERFACEMODE_DEFAULT` while the leaked layer rendered — mode is not
   the blocker).

5. **macOS control:** System Events queries + `set frontmost` work;
   keystrokes still blocked (error 1002 — host app needs Accessibility for
   synthetic input). Not currently load-bearing.

## Current live state

- Game running, rerolled seed 1619063906 (a `game restart` rerolls seeds by
  design), Huge/10p, our deployed config. Screen shows the leaked Redwood
  cinematic layer → **needs a game restart before any visual work**.
- New taxonomy commands validated live: `game map visibility` (reveal path),
  `game play screen show` (listed Torres del Paine correctly),
  `game map starts` (10 founder-unit plots, turn guard). `screen dismiss`
  "worked" only in the false-drain sense above.

## Stack state

- Placement stack: PRs #1565–#1575 + #1580 (S11 probe tooling +
  INTEGRATION-PLAN.md). Ready to drain. Drain order doc:
  `docs/projects/placement-realignment/INTEGRATION-PLAN.md`.
- Taxonomy/direct-control stack: PRs #1576–#1579. **Do not merge until the
  dismissal primitive is fixed (finding 1) and live-validated.**
- Lab branch `placement-live-integration` (wt-placement-live-proof): retains
  the rivers CLI (camera/appshot) for visual work; retirement gated per
  INTEGRATION-PLAN.md.

## Immediate next steps (in order)

1. Restart the game (clears leaked layer; user present can also just look).
2. Research Explore All engine primitive; read our `--explore` impl; switch
   proof flows reveal→explore; live-validate zero cinematics.
3. Fix the dismissal primitive (official close path) as a new slice on the
   taxonomy stack; live-validate visible closure; keep it for live play.
4. Re-probe XR screenshot in clean state; scope appshot to the game window.
5. Visual gallery over start plots (optionally restore proof seed 1337 via
   one run-in-game request first).
