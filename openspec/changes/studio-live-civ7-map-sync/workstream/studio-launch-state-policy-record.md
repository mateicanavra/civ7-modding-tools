# Systematic Workstream Record: Studio Launch State And Civ7 Setup Policy

## Frame

- Objective: make MapGen Studio launches and saved-config application predictable
  when Civ7 is already running by validating Civ setup policies before launch,
  preventing stale client proof state, and stopping native setup failures before
  they become map-generation failures.
- Product outcome: Studio-authored seeds and setup payloads are legal for Civ7
  and Swooper before deployment/start work begins. Selecting a saved Civ config
  cannot poison the Studio seed with a value Civ will wrap, and concurrent launch
  attempts cannot attach a new Studio snapshot to an unrelated active request.
- Non-goals: do not change map-generation morphology, landmass tuning, Civ
  resource catalogs, or generated/deployed mod output by hand.
- Hard core: Civ resources/logs/runtime are policy evidence; Studio and
  `@civ7/direct-control` own preflight validation and launch state behavior.
- Falsifier: if a Studio Run in Game with an accepted seed still reads back a
  different Civ `MapRandomSeed` before map generation starts, the seed policy is
  incomplete and must return to runtime probing.

## Evidence

- Official resource mirror and installed app define `GameRandomSeed` and
  `MapRandomSeed` with `Domain="int"` in
  `Base/modules/core/config/SetupParameters.xml`.
- Installed Civ setup UI clamps integer editor values to signed 32-bit bounds.
- Live App UI probe on 2026-06-05 showed Civ wraps seed writes outside signed
  int32: `2147483648 -> -2147483648`, `4294967295 -> -1`,
  `9999999999 -> 1410065407`, then restored the original running-game seeds.
- Fresh `Scripting.log` contained a successful Studio proof for
  `studio-run-in-game-mq0emsi1-25w` with seed `1958384579`, confirming current
  valid seeds work and bounding the failure class to out-of-policy inputs rather
  than a general launch failure.

## Corpus

- Civ policy surfaces: `SetupParameters.xml`, installed setup UI editor scripts,
  live `GameSetup.findGameParameter`, `Configuration.editMap().setMapSeed`,
  `Configuration.editGame().setGameSeed`, `GameplayMap.getRandomSeed`.
- Studio state surfaces: seed field, reroll, browser preview run, saved-config
  selection, Run in Game POST, active-operation store/status, initial live setup
  hydration.
- Direct-control state surfaces: `loadCiv7SavedGameConfiguration`,
  `prepareCiv7SinglePlayerSetup`, `runCiv7SinglePlayerFromSetup`, setup
  readback assertion, post-start seed assertion.

## Expectations

- Direct-control accepts only finite signed-int Civ setup seeds before native
  mutation.
- Studio accepts only non-negative signed-int seeds because Swooper browser and
  domain planning use non-negative deterministic seeds.
- Saved config extraction may observe unsigned-looking seed strings, but Studio
  must not automatically apply them as authored launch seeds when Civ would wrap.
- Duplicate active Run in Game requests are idempotent only when the launch
  fingerprint matches; a different payload is a conflict.
- Initial live setup hydration applies only while the Studio setup state is still
  default.

## Remaining Follow-Ups

- Add route/controller-level tests around the Vite Run in Game endpoint once the
  route is factored out of `vite.config.ts`.
- Consider map-size-specific player count policy from official `MapSizes` rows.
- Surface a clearer footer label when Run in Game will exit an active Civ game.
