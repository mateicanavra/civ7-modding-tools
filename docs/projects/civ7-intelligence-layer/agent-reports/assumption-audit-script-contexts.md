# Assumption Audit: Script Contexts And Loading

Agent: Planck
Lane: App UI, Tuner, `UIScripts`, map scripts, and lifecycle audit
Date: 2026-06-03
Status: DRA-captured report from peer-agent final output

## `/goal` Objective

Challenge the script-loading assumptions behind the Civ7 intelligence companion
API. Distinguish App UI, Tuner, shell scope, game scope, map/import scripts,
debug UI scripts, and deployed companion API evidence.

## Probes Run

Read-only local direct-control probes only:

- `bun run --cwd packages/cli dev game status --json`
- App UI global probe for `LfYieldsPreview`, `Civ7IntelligenceBridge`, and
  matching `globalThis` keys

As of this probe, the local session was shell-only: readiness was `shell`,
`playable` was false, only App UI state `65535` was present, and no Tuner state
was available. The App UI probe returned no LF or project bridge global.

No live-game mutation was performed.

## Sources Inspected

- `packages/civ7-direct-control/README.md`
- `packages/civ7-direct-control/src/index.ts`
- `docs/projects/civ7-direct-control/workstream/capability-inventory/tuner-surface-report.md`
- `.civ7/outputs/resources/Base/modules/base-standard/base-standard.modinfo`
- `.civ7/outputs/resources/Base/modules/base-standard/ui/tuner-input/tuner-input.js`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods/mod-swooper-maps/swooper-maps.modinfo`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods/mod-swooper-maps/maps/swooper-earthlike.js`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods/civmods-lf-policies-yields-preview-40534/lf-policies-yields-preview.modinfo`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods/civmods-lf-policies-yields-preview-40534/scripts/api/public-api.js`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods/civmods-lf-policies-yields-preview-40534/scripts/ui/debug/cheat-panel.js`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods/civmods-rhq-39525/ai.modinfo`
- `/Users/mateicanavra/Library/Application Support/Civilization VII/Mods/civmods-rhq-39525/ui/change_banner.js`
- local Civ7 `Modding.log` and `UI.log`

## Executive Conclusion

A deployed mod can expose a callable public API in App UI game context, but the
evidence is narrower than some wording implied:

- `UIScripts` can expose a global callable API in App UI game context.
- The same symbol is not proven to exist in Tuner.
- The symbol is not guaranteed to exist in App UI shell.
- `swooper-maps` is map/import prior art, not companion App UI bridge prior art.
- RHQ is database/profile prior art, not a live bridge example.
- "tuner loaded" should mean "the direct-control Tuner state is present and
  passes its canary", not "the mod loaded into Tuner."

## Challenged Assumptions

### `UIScripts` means Tuner-loaded

Status: `eliminated`.

`UIScripts` is a mod action item inside shell or game action groups. App UI and
Tuner are tuner-socket runtime states, not modinfo deployment targets.

### App UI global proof is lifecycle-wide proof

Status: `eliminated`.

The earlier LF proof was a post-Begin game-context proof. The current shell
probe showed no LF public API global. Shell App UI existence alone does not
prove game-scoped companion symbols exist.

### Swooper map scripts are App UI bridge scripts

Status: `eliminated`.

Installed `swooper-maps` uses `ImportFiles`, not `UIScripts`. Its map bundles
use map-generation and engine-side globals such as `GameplayMap`,
`ResourceBuilder`, `MapConstructibles`, and `StartPositioner`.

### Debug scripts prove Tuner deployment

Status: `eliminated`.

The LF yields preview mod proves powerful App UI scripts and a callable App UI
global. It does not prove deployed mod code attaches to the raw Tuner state.

### RHQ proves a live bridge

Status: `eliminated`.

Installed RHQ is overwhelmingly `UpdateDatabase`; its visible UI script is
empty. Treat RHQ as static AI/profile prior art.

## Classification Note

- LF yields preview: App UI public-API shape prior art.
- Swooper Maps: map/import and map-generation prior art.
- RHQ: static database/profile prior art.

## Residual Probes

1. In a disposable post-Begin session, re-run the LF probe and confirm
   `public-api.js` is visible in App UI game scope while absent in Tuner.
2. Prove lifecycle for a project-owned `Civ7IntelligenceBridge`: shell absent,
   game present, reload/restart recovery, save/load, and turn changes.
3. Run a falsifier for "mod-loaded-into-Tuner" by checking the project symbol in
   Tuner across fresh started-game sessions.
4. If needed, run one minimal disposable `ImportFiles` probe to pin map-script
   execution phase.

## Product Implication

Use App UI game-scope `UIScripts` as the companion baseline. Do not claim a
Tuner-resident deployed API, shell availability, map-script bridge behavior, or
RHQ live bridge behavior without separate proof.
