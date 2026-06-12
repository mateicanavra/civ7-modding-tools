# Systematic Workstream Record — CLI Command Taxonomy (game mount)

## Frame

- Objective: extend the noun-first / phase-verb grammar that
  `docs/projects/civ7-live-play-support/topics/command-surface-design.md`
  established for `game play` to the whole `game` mount, so every command lives
  at a taxonomy home a play agent can predict from the noun it is thinking
  about.
- Future state: `game` carries a flat session-control tier plus real noun
  topics (`map`, `play` incl. the new `screen` noun, reserved `view`). Flat
  ids and the `game map` flag-multiplex stay unchanged; decision-logged FULL
  migrations (D5) remove an old id outright and retarget every repo
  reference in the same slice — never silently.
- Non-goals: migrating the 43 `game play/*` commands into the
  unit/city/progress/notifications/trade/turn grammar (owned by the
  command-surface-design roadmap, see D7); implementing the rivers-branch
  `camera`/`screenshot`/`appshot` arrivals (designated only, see D6).
- Hard core: the command-surface-design grammar (noun-first, phase verbs
  `show|targets|preview|check|send`; native control first; mutations gated
  behind explicit flags) and its compatibility rule — "Do not remove existing
  commands casually" and "Do not add aliases as a substitute for fixing the
  command model".
- Exterior: the `game play/*` noun migration (D7); presentation/capture
  commands not yet on `main` (D6); any direct-control or control-oRPC service
  changes (this workstream moves CLI surface only).
- Falsifier: any existing documented invocation breaking WITHOUT a
  decision-logged migration that retargets its references (`game map
  --summary` and the flat session commands are unchanged; `game visibility`
  is the one recorded full migration), or the oclif manifest failing to
  emit both a topic index command and its subcommands.
- Redesign trigger: oclif rejecting command-file + topic-dir coexistence or
  cross-topic aliases (verified working — see Status notes), or a consumer
  inventory showing clustering value for the flat session tier (would reopen
  D1).

## Status

- Last updated: 2026-06-11
- Current gate: slice 5 (DQM display control + explore, D8/D9) implemented on
  top of the slice 1–4 stack; live-validated end-to-end against a fresh game.
  Orchestration subsequently re-homed into the Effect+oRPC layer (D10); the
  drain semantics are test-pinned to the live-validated ordering, with a live
  re-run of the oRPC-routed `--explore` pending a fresh game session.
- Next gate: review + merge of PRs #1576–#1579 + slice 5; the slice-1
  synthetic-DOM primitive is replaced by slice 5 before merge (the false-drain
  merge blocker is resolved in-stack). Then the D7 play-grammar migration
  proceeds under command-surface-design ownership.
- Blocked by: nothing; pre-merge amendment of slice 2 means no alias debt for
  `game map starts` / `game play screen dismiss`.
- Stop condition: all four slices merged with the manifest showing the target
  ids and zero broken legacy invocations.
- Verified findings:
  - oclif command-file + topic-dir coexistence works: `game/map.ts` beside
    `game/map/` emitted both `game:map` and `game:map:starts` in the manifest
    (slice 2). Slice 4 still restructures to `game/map/index.ts` for the
    long-term topic shape.
  - Cross-topic aliases verified working (`static aliases` with
    colon-separated ids, mirroring `mod git push` → `link:push`) BEFORE the
    D5 override chose full migration; recorded as a usable mechanism, not
    used by this stack.

## Repo State

- Worktree: `wt-direct-control-live-ui`
- Branches (Graphite stack, bottom → top):
  1. `direct-control-cinematic-dismissal` (PR #1576) — dismissal primitive.
  2. `cli-game-dismiss-cinematics-and-starts` (PR #1577, amended in place) —
     `game map starts`, `game play screen dismiss|show`.
  3. `cli-taxonomy-workstream-docs` — this directory.
  4. `cli-game-map-noun-topic` — `game map` topic restructure + visibility
     move.
- Protected paths: `packages/cli/src/commands/game/play/*` behavior (D7
  boundary); `game map` index flag-multiplex behavior (D2 compatibility).
- Generated/read-only paths: `packages/cli/oclif.manifest.json` (build
  output, untracked).

## Decision Log

Decisions D1–D7 are settled. Do not relitigate; record deviations here with a
new decision number.

- **D1 — session tier stays flat.** The `game` mount itself is the session
  noun. Session-control singletons stay FLAT: `status`, `health`, `restart`,
  `autoplay`, `exec`, `inspect`, `operation`, `watch`, `catalog`, `gameinfo`,
  `ai loaded-levers`, `local-data inspect`. Rationale: `gameinfo` is already
  the NATIVE Civ7 noun (GameInfo); `status`/`health`/`restart` have a huge
  reference blast radius (91/16/20+ doc references) and no clustering value;
  the design doc forbids aliases as a substitute for model fixes — and
  equally, renames without consumer value. No `game session` / `game native`
  umbrella topics.
- **D2 — `game map` becomes a real noun topic.** Subcommands `summary`,
  `plot`, `grid`, `starts`, `visibility`. The current `game map`
  flag-multiplex (`--summary/--plot/--bounds`) is preserved as the topic
  INDEX command (oclif: `game/map/index.ts`) so every existing invocation
  keeps working unchanged; the new subcommands are thin delegations over the
  same service calls with focused flags.
- **D3 — `game starts` renames to `game map starts`.** Amended into slice 2;
  the command was unmerged, so no alias is needed.
- **D4 — `game dismiss-cinematics` renames to `game play screen dismiss`.**
  Amended into slice 2. Added sibling `game play screen show` (read-only: one
  App UI exec listing active cinematic/display screens — selector count +
  titles via the same selectors as the dismissal primitive; reuses exported
  selector constants from `@civ7/direct-control` rather than duplicating
  strings). `screen` is a new play noun; native primitive =
  DisplayQueueManager cinematic-moment screens (provenance comments per
  slice 1).
- **D5 — `game visibility` moves to `game map visibility`, FULL MIGRATION
  (user decision 2026-06-11, supersedes the initial alias plan).** No alias,
  no deprecated stub: the old id is removed outright and every repo
  reference (docs/, scripts/, .agents/) is retargeted to
  `game map visibility` in the same slice. (For the record: cross-topic
  oclif aliases were verified working via the `mod/git` → `link:*` pattern
  before the override — usable if a future migration ever needs one.)
- **D6 — rivers-branch arrivals get a designated home.** Planned arrivals
  (`camera`, `screenshot`, `appshot` — NOT on `main`) are DESIGNATED to land
  as `game view camera|screenshot|appshot` (a presentation/capture noun).
  Documented only; not implemented here.
- **D7 — `game play/*` noun migration is out of scope.** The 43 `game play/*`
  commands' migration to the unit/city/progress/notifications/trade/turn
  grammar is OWNED by the existing command-surface-design.md roadmap. This
  workstream records the boundary and cross-links; see
  `docs/projects/civ7-live-play-support/topics/command-surface-design.md`
  (Priority Refactors, Compatibility Path).
- **D8 — DisplayQueueManager is the display-control substrate (live-proven
  2026-06-11, slice 5).** Every popup-like screen (wonder cinematics, unlock
  popups, triumph popups, narrative events, diplomacy dialogs, ... — 17
  registered handler categories) is a request in the official
  DisplayQueueManager (`core/ui/context-manager/display-queue-manager.js`,
  reached via module-registry import). `closeMatching(category)` runs each
  handler's REAL teardown; `suspend()/resume()` park new requests without
  displaying them. The slice-1 synthetic-DOM dismissal primitive produced
  false drains (queue entries removed from DOM only; handlers never ran) and
  is REPLACED outright by `display-queue.ts` (`readCiv7DisplayQueue`,
  `closeCiv7Displays`, `suspendCiv7DisplayQueue`, `resumeCiv7DisplayQueue`).
  Truth source is queue state, never DOM emptiness. Related correction: the
  long-standing "leaked WorldUI cinematic render layer that only a restart
  clears" finding was FALSE — those whole-display captures were showing the
  macOS "Sequoia Sunrise" wallpaper (a redwood forest) because the game runs
  fullscreen on its own Space. The official close path was never broken.
- **D9 — explore and reveal are two discrete visibility mutations (user
  decision 2026-06-11, slice 5).** `--reveal` stays the engine's own
  `Visibility.revealAllPlots(player)`: special, rare-use, discovery popups
  display normally. `--explore` is the map-QA verb: engine tracked visibility
  grants (`Visibility.setTrackedVisibilityGrant(player, 1, allPlots)` →
  settle → `removeTrackedVisibilityGrant`), leaving plots REVEALED/fogged
  with zero leaked refcounts (live-verified HIDDEN→VISIBLE→REVEALED), with
  ALL display side effects suppressed via D8's suspend→purge→resume. The
  native debug console's "Explore All" is an ImGui render-only override with
  no scripting binding (binary-verified: TerrainPanel "Fog of War" section)
  and cannot be borrowed; gameplay-side sight is real (wonders genuinely
  discovered, explore challenges progress) — recorded as
  `discoveryPosture: "ui-suppressed-gameplay-discovers"`. The rivers-branch
  `--explore` (a `changeVisibilityCount(+1)` loop that leaks visibility
  refcounts) is superseded by this implementation; its drain must adopt this
  one (supersedes the D6-adjacent note in INTEGRATION-PLAN's rivers list).
- **D10 — display/explore orchestration is HOMED in the Effect+oRPC layer
  (user decision 2026-06-11, slice 5).** `@civ7/direct-control` carries wire
  ATOMS only (one Tuner exec each, plain async): the display-queue atoms
  (D8) plus `applyCiv7ExploreGrant`/`releaseCiv7ExploreGrant`. The
  suspend→grant→drain→resume→release state machine lives in
  `@civ7/control-orpc` as the new `display` module — `display.queue.current`
  (read-only), `display.queue.close` (runtime-support), and
  `display.explore.request` (mutation) — implemented as Effect procedures:
  suspension verified by readback inside `Effect.acquireUseRelease`'s
  acquire (fails `EXPLORE_SUSPENSION_UNVERIFIED` before any mutation), the
  drain as `Effect.iterate` over immutable state (defaults preserved:
  settleMs = clamp(15s..120s, plotCount×10ms), pollMs 2500, quiescePolls 3,
  maxExtraWaitMs 60000), and queue resume GUARANTEED by the release
  finalizer on every failure path (errors `EXPLORE_FAILED`,
  `DISPLAY_QUEUE_UNAVAILABLE`). The CLI (`game map visibility --explore`,
  `game play screen show/dismiss`) consumes the typed
  `createCiv7ControlOrpcServerClient` like the rest of the map surface —
  the original direct-control orchestrator (which bypassed the Effect
  layer) is removed outright, no stubs.
- **D11 — explore's default end-state is FULLY VISIBLE (user decision
  2026-06-11, slice 5).** By default `display.explore.request` HOLDS the
  tracked visibility grant after the drain instead of releasing it, so fog
  of war never re-covers the explored map (the slow engine-paced FOW
  re-cover after release was the user-visible pain). `restoreFog: true`
  (CLI `--restore-fog`, dependsOn `--explore`) opts back into the previous
  release → REVEALED/fogged end-state. Live-probed and settled: the FOW
  render toggle and reveal pacing have NO scripting binding in either
  scripting state (WorldUI, Camera, Configuration, Visibility, GameplayMap,
  globals all clean; `Environment` exposes only atmospheric/height fog for
  cinematics) — holding the grant is the only scriptable way to keep fog
  off. The held grant lives until session end; explore remains a
  disposable-session verb.

- **D12 — `game view appshot` lands as window-scoped clean-frame capture
  (slice 6, 2026-06-11).** D6's designated `game view` home gets its first
  real implementation, superseding the rivers-branch `game appshot`
  (whole-display `screencapture -x` — hash-identical to a desktop
  screenshot, so wallpaper/overlays leaked into "game" captures). Settled
  platform facts: the Mac Steam build has NO programmatic capture (zero XR
  strings in the binary, no settings toggle, Steam F12/ISteamScreenshots is
  human-keypress only), so capture is ScreenCaptureKit
  `SCContentFilter(desktopIndependentWindow:)` + `SCScreenshotManager` via a
  Swift helper embedded in `@civ7/direct-control` (compiled once per source
  hash, cached in the OS temp dir; requires a one-time Screen Recording TCC
  grant — preflight + `CGRequestScreenCaptureAccess` fire the OS prompt and
  the failure carries the exact System Settings path). Clean frames come
  from the official ViewManager rules engine: the game's own
  INTERFACEMODE_SCREENSHOT maps to a stub ScreenshotView (rules all visible,
  placeholder buttons injected), so the package registers its own
  hidden-rules view (`DirectControlCleanFrame`, the Cinematic view's rule
  set + "empty" harness, optional 3D-unit hide) reachable only via the live
  VFS path `/core/ui/views/view-manager.js` (the `.chunk.js` paths in our
  extracted resources are extraction artifacts and do NOT resolve).
  Layering per D10: wire/OS atoms in `@civ7/direct-control`
  (`enterCiv7CleanFrame`/`exitCiv7CleanFrame`/`captureCiv7WindowShot`),
  orchestration as the Effect procedure `view.appshot.capture`
  (suspend-verified → purge → enter-verified → settle → capture → restore,
  with an acquire/release finalizer guaranteeing the HUD and queue are
  restored on every failure path), CLI `game view appshot` on the typed
  client. Rivers drain note: the rivers appshot files
  (`play/map/appshot*.ts`, `world.capture.appshot`, `game appshot`) are
  superseded outright — drop them in favor of this slice during the drain;
  the camera/screenshot verbs remain rivers-owned arrivals under D6.
  Live-proof findings folded back in: (a) the SCK capture path trips the
  CGS_REQUIRE_INIT assertion in CLI processes unless CG is initialized on
  the main thread (`CGMainDisplayID()`) and the main thread services a run
  loop instead of semaphore-blocking; (b) an off-screen game window
  (fullscreen on another Space, minimized) stops compositing, so its
  backing store is STALE — app activation was tried first but macOS
  resolves background-process activation nondeterministically (sometimes a
  soft Dock bounce, sometimes a full Space switch), so the shipped
  mechanism is a temporary SCStream: a running capture stream forces the
  window server to composite fresh frames with ZERO focus interaction
  (live-verified: 43 distinct frames over 4s from a fullscreen window on
  an inactive Space, then a clean-frame capture with `frameSource:
  "stream"` and `onScreen: false` throughout). The result's `frameSource`
  reports the path: `screenshot` (on-screen, one-shot) or `stream`
  (off-screen, forced fresh) — an off-screen window whose stream yields
  nothing FAILS rather than returning possibly-stale pixels (the
  stale-fallback path was removed in the cleanup pass: dead code, never
  observed live, and "maybe-stale" is not an acceptable capture result).
  Artifact lifecycle: default outputs land in the managed
  `$TMPDIR/civ7-appshots/` directory, self-cleaned on each capture (7-day
  retention; explicit `--output` paths are the caller's and never
  pruned), and compiling a new helper revision prunes previous revisions
  from the `$TMPDIR/civ7-direct-control/` cache; (c) the floating
  badges left in clean frames are RESOURCE icons — engine-rendered world
  assets, not UI DOM (user-identified; the clean frame's DOM hide was
  live-verified: plot-icons hidden, harness display:none) — i.e. map
  content that belongs in the frame.

- **D13 — screenshot-at-plot is a first-class `view` capability; the rivers
  camera atom moves into the view family and the hacked composition is
  superseded (slice 7, 2026-06-11).** The rivers branch already had a GOOD
  verified camera atom — `focusCiv7CameraOnPlot` (`Camera.lookAtPlot` +
  PlotCursor sync, viewport-center readback via `Camera.pickPlot(0.5,
  0.5)`, `centerMatchesTarget` verdict, one settle re-read for animated
  pans) — but its "screenshot at a plot" story was a hacked manual
  composition: run `game camera`, then the whole-display appshot that
  merely ECHOED `target`/`cameraProofHash` into its manifest as metadata
  (nothing bound the camera position to the pixels), plus the dead
  `XR.World.takeScreenshot` probe (`game screenshot`; XR settled absent
  from this build per D12). This slice keeps the camera capability and
  replaces the composition: the atom is ported to
  `@civ7/direct-control` `src/play/view/camera.ts` (verbatim semantics),
  exposed standalone as the Effect procedure `view.camera.focus` + CLI
  `game view camera --plot x,y [--zoom 0..10] [--animated]` (its
  D6-designated home), and composed into `view.appshot.capture` via
  optional `target {x,y}` + `zoom`: the camera focuses FIRST — before the
  acquire boundary, so a failed/unverified focus leaves the display queue
  untouched — and an appshot-with-target HARD-FAILS
  (`CAMERA_FOCUS_UNVERIFIED`) when the center readback misses, because a
  "frame at a plot" that isn't centered on the plot silently captures the
  wrong place. The standalone `view.camera.focus` instead reports
  `centerMatchesTarget` as truth (plots near the map edge can never center
  exactly; the caller decides). The camera deliberately STAYS on the
  target after the capture — navigation state the caller asked for, not
  UI chrome to restore. The result's optional `camera` section carries the
  verified move (target/zoom/before/after/plotCursor/centerMatchesTarget,
  probes flattened to value-or-null at the wire boundary). Live-settled
  zoom facts (2026-06-11): the engine's zoom is NORMALIZED 0..1 (0 =
  closest, 1 = fully zoomed out; `Camera.getState().zoomLevel` reads back
  exactly the requested fraction, values above 1 clamp to 1) — the 0..10
  range the rivers atom advertised was never honored; and zoom settles
  asynchronously even for instantaneous moves (the same-command readback
  reports the previous level), so the ported atom re-reads on a settle
  loop (4 × 150ms) until both the center and the requested zoom verify.
  Rivers drain note (extends D12's): rivers' `play/map/camera.ts`,
  `camera-procedure.ts`, `capture.ts` (XR, dead), `appshot*.ts`, the
  rivers world-module camera/capture procedures, and CLI `game camera` /
  `game screenshot` / `game appshot` are all superseded — drop them during
  the drain; the lab branch `placement-live-integration` is the conflict
  oracle.

## Corpus Gate

- Corpus source(s): `packages/cli/src/commands/game/**` on the stack;
  `corpus.md` in this directory (command corpus ledger).
- Corpus shape: action surfaces (CLI command ids) + consumer/reference
  effect matrix.
- Coverage ledger: see `corpus.md` — every flat-tier command has a row with
  id/summary/layer/state/consumer/refs/decision; play tier covered by
  one-liners + the design-doc accuracy table.
- Open uncertainty: reference counts are point-in-time greps (2026-06-11);
  rivers-branch arrival shapes may drift before they reach `main`.

## Proof Gates

- Local stats: `turbo run test --filter=@mateicanavra/civ7-cli
  --filter=@civ7/direct-control` green; root `bun run check-types` green.
- Generated/deploy proof: oclif manifest contains `game:map`,
  `game:map:starts`, `game:map:summary|plot|grid|visibility`,
  `game:play:screen:dismiss|show`; does NOT contain `game:starts` or
  `game:dismiss-cinematics` — and after the D5 override, no
  `game:visibility` id or alias at all.
- Runtime proof: none required — no live-game socket use in this workstream;
  all command behavior is fake-tuner-server tested. The underlying
  primitives carry their own live verification (cinematic dismissal and
  founder-unit starts live-verified 2026-06-11; `restart` rerolls the map
  seed, live-verified 2026-06-11).
- Product proof: `--help` exits 0 without sockets for `game map`,
  `game map summary`, `game map starts`, `game play screen dismiss`.
- Closure boundary: D6 (view noun) and D7 (play migration) intentionally
  remain open; they are exterior, not debt.

## Slice Ledger

| Slice | Branch | PR | Content | State |
| --- | --- | --- | --- | --- |
| 1 | `direct-control-cinematic-dismissal` | #1576 | cinematic-moment dismissal primitive (`@civ7/direct-control`) | submitted (draft) |
| 2 | `cli-game-dismiss-cinematics-and-starts` | #1577 | `game map starts`, `game play screen dismiss`, `game play screen show` (amended in place to taxonomy homes per D2/D3/D4) | submitted (draft, amended) |
| 3 | `cli-taxonomy-workstream-docs` | — | this directory: workstream record, corpus ledger, target grammar | this slice |
| 4 | `cli-game-map-noun-topic` | — | `game map` topic restructure (`index/summary/plot/grid`), `game map visibility` FULL migration incl. repo-wide reference retarget (D2/D5) | next slice |
| 5 | `direct-control-display-queue` | #1582 | DQM display-control primitives replace the synthetic dismissal outright (D8); `game map visibility --explore` via suppressed tracked grants (D9); orchestration homed as Effect procedures in `@civ7/control-orpc` `display` module, CLI on the typed client (D10); `game play screen show/dismiss` rewired to queue truth | submitted (draft) |
| 6 | `view-appshot-window-capture` | #1584 | `game view appshot` window-scoped clean-frame capture (D12): SCK window capture atom + clean-frame view atoms, `view.appshot.capture` Effect procedure, CLI on the typed client | submitted (draft) |
| 7 | `view-camera-plot-appshot` | — | screenshot-at-plot (D13): rivers camera atom re-homed at `play/view/camera.ts`, `view.camera.focus` procedure + CLI `game view camera`, `view.appshot.capture` `target`/`zoom` with verified-before-acquire camera focus, CLI `--target/--zoom` | this slice |

## Team

- Owner: Matei (tools@matei.work)
- Evidence agents: fake-tuner-server CLI tests; oclif manifest grep.
- Review agents: PR review on the Graphite stack.
- Open findings: none.
