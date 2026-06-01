# Debugging Workflow

## Standard Pass

1. Record repo branch, dirty state, and relevant `AGENTS.md` routers.
2. Identify the mod slug, mod id, source entrypoints, generated output path, and
   deployed target path.
3. Capture current mtimes or a short baseline for the log files you will read.
4. Run the narrow build or deploy command needed for the question.
5. Inspect local generated output before inspecting deployed output.
6. Inspect the deployed Mods directory only after the deploy command has run.
7. Launch or use Civ7 only when the claim requires game load/runtime evidence.
8. Use FireTuner only when direct runtime iteration or introspection is needed;
   see `firetuner-runtime.md` for connection, state, restart, and autoplay
   rules.
9. Read logs after the game action and bound findings to that run.
10. Report claims with proof labels from `proof-boundaries.md`.

## Build And Generated Output Gate

Use when the question is "did source generate the expected mod files?"

- Run `bun run --cwd mods/<mod-slug> build`.
- Inspect `mods/<mod-slug>/mod/` for the expected `.modinfo`, XML, JS, text, or
  config files.
- If output is wrong, inspect source and build scripts; do not patch generated
  output.

## Deploy Gate

Use when the question is "did the built mod reach Civ7's Mods directory?"

- Run `bun run --cwd mods/<mod-slug> deploy` for a single mod or
  `bun run deploy:mods` for all repo mods.
- Inspect `<game-data>/Mods/<mod-id>/`.
- Compare deployed files to `mods/<mod-slug>/mod/` when the copied content is in
  question.

## Log Gate

Use when the question is "what did Civ7 report?"

- Bound the log window before launching or exercising the game path.
- Inspect `Modding.log` for discovery and load issues.
- Inspect `Database.log` for XML import failures.
- Inspect `Scripting.log` for map/runtime JavaScript errors and diagnostic
  `console.log` output.
- Inspect `UI.log` for UI-context JavaScript/module errors when FireTuner is in
  `App UI` or when a visible UI path is involved.
- Inspect `Localization.log` when text keys or localization files are involved.
- Inspect `GameCore.log`, `Game.log`, `General.log`, `output.log`, and net logs
  when the issue may be engine flow, simulation, process, or connection state
  rather than map script execution.
- Record searched files, search terms, and whether findings were current.

## In-Game Gate

Use when the claim depends on Civ7 executing behavior.

- Deploy the mod first and inspect the deployed target.
- Launch Civ7, enable/select the mod or map path under test, and exercise the
  relevant behavior.
- Tie the observation to current logs or visible game behavior.
- State the exact exercised path; do not generalize beyond it.

## FireTuner Gate

Use when the question is "what does the running Civ7 session expose or do?"

- Verify Civ7 is listening on the tuner port before treating connection failure
  as an app bug: `lsof -nP -iTCP:4318`.
- Refresh scripting states after connecting and after game restarts.
- Select `Tuner` for gameplay/runtime commands unless the command is known to be
  UI-owned, such as `Network.restartGame()`.
- Run the smallest direct console command needed.
- Bound proof in `Scripting.log` or the relevant sibling log after the command.
