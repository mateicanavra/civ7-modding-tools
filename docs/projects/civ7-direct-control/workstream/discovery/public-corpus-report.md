# Public Corpus Report

Date: 2026-05-31

## Summary

Chrispresso's Debug Console (CDC) is useful evidence for autocomplete design, but it is not evidence of an external Civ7 control transport. CDC is an in-game UI mod that registers a UI script and Ctrl+D input action, then evaluates JavaScript inside the game's UI runtime with `(0, eval)(code)`. It does not appear to open a socket, call FireTuner, or talk to Civ7 from outside the game process.

The strongest public corpus for future command/global insight is a combination of official/public Civ7 resource files, WildW's CivFanatics runtime dumps, and CDC's `completions.js`. There is no complete public TypeScript declaration source in the checked corpus. The current lightweight strategy should therefore be provenance-aware autocomplete: small curated seeds from official resources and runtime probes, with community completions/dumps marked as external hints.

## Sources Checked

- Chrispresso's Debug Console CivFanatics resource page, update page, and direct download `ChrispressoDebugConsole_v110.zip`.
- Downloaded CDC source files in `/tmp`: `debug-console.js`, `completions.js`, `cheats.js`, `utils.js`, `chrispresso-debug-console.modinfo`, and input XML.
- CivFanatics "Scripting Runtime Information" thread by WildW, including public attachments `scrapeGlobalThis.zip`, `Events.zip`, `v2-scrapeGlobalThis.zip`, and `GameplayMap.zip`.
- `craimasjien/civ7-craimasjiens-mod-pack` `events.md`, which republishes WildW-derived event names and links back to the original thread.
- Public official-resource mirror `mateicanavra/civ7-official-resources` at commit `44faecabde123ba9e25f6340014c9c1d1b4e1a8e`, also present as this repo's `.civ7/outputs/resources` submodule.
- Community `ghost-ng/Civ7-Developer-Docs` repository and wiki pages. Treated as secondary/unverified orientation, not authority.
- Coherent GT official docs for `engine` communication and UI debugger behavior. Treated as framework evidence, not Civ7 API evidence.
- CivFanatics "How to connect civ6 Live Tuner to civ7" tutorial. Treated as secondary evidence about FireTuner state selection and public command examples.

## Chrispresso Debug Console Findings

- CDC is loaded as a Civ7 mod UI script. Its `.modinfo` declares `ui/debug-console/debug-console.js` under `<Scripts>` and `<UIScripts>`, imports its HTML/CSS/input XML, and uses an action group with `scope="game"`. Its `input.xml` binds `chrispresso-debug-console` to `KEY_CONTROL+KEY_D`.
- CDC brings selected imported modules into the global window with `window.globals`, `window.utilities`, and `window.cheats`. The custom cheats call in-game globals directly, including `GameInfo.Units.$data`, `GameContext.localPlayerID`, `Players.get`, `Units.create`, `Players.grantYield`, `Units.restoreMovement`, and `Units.setDamage`.
- Command execution is in-game global JavaScript evaluation. `debug-console.js` implements `evaluate(code)` as `(0, eval)(code)`, then `executeCommand(command)` records the command, evals it, and renders the JSON result into the CDC panel.
- I found no evidence of external transport in the CDC source. Targeted search over the downloaded mod found no `WebSocket`, `XMLHttpRequest`, `fetch(`, `localhost`, `127.0.0.1`, FireTuner client call, or socket/port code. Matches were UI script imports, eval, and local source comments.
- CDC autocomplete is a hybrid of static and dynamic discovery:
  - Static seed: `completions.js` exports `CompletionItem` and `globalCompletions`, with 438 `CompletionItem` occurrences across top-level roots including `Game`, `GameContext`, `GameInfo`, `GameplayMap`, `Players`, `UnitFlagManager`, `Units`, `Camera`, `ComponentID`, `Cities`, `MapCities`, and `MapFeatures`.
  - Dynamic property completion: for dotted paths, CDC evals the object path, enumerates properties through `cdcUtils.inspect(targetObj)`, and merges matching properties into the popup.
  - Top-level completion: CDC enumerates `window` through `cdcUtils.inspect(window)` and adds matching properties.
  - Startup global import: `engine.whenReady` enumerates `window` and adds anything not already in `globalCompletions`.
  - User-created globals: after a command runs, CDC diffs `Object.keys(window)` before/after execution and adds new globals to completion.
- CDC's dynamic inspection is shallow and uses `for...in`, so it can miss non-enumerable own properties and prototype members. It also guesses function parameters from `function.toString()` with a regex, which is weak for native functions.
- CDC is still valuable as a hand-curated list of likely useful roots and function names, but its completions should not be treated as canonical without runtime or official-resource corroboration.

## Public Types/Globals Findings

- WildW's CivFanatics thread is the best public explanation of runtime context boundaries. It reports separate V8 isolates/contexts for at least Tuner and App UI, notes that globals differ by context, and suggests dumping objects with JavaScript executed through FireTuner or UI clipboard helpers.
- WildW's `scrapeGlobalThis.zip` contains `App UI.json`, `Tuner.json`, and a dump script. In the downloaded files, `App UI.json` had 510 top-level keys and `Tuner.json` had 213 top-level keys. The App UI dump includes `Game`, `GameContext`, `GameInfo`, `GameplayMap`, `Players`, `Units`, `Cities`, `MapCities`, `UI`, `Network`, `Online`, `Configuration`, `Database`, and `engine`; the Tuner dump lacks `GameContext`, `UI`, and `Network` in the checked output.
- WildW's `v2-scrapeGlobalThis.zip` improves inspection by using `Object.getOwnPropertyDescriptors`, preserving prototype dumps, avoiding circular references, and recording type/class/function metadata. This is a better shape than CDC's `for...in` for a future runtime probe.
- WildW's `GameplayMap.zip` is especially useful because it dumps prototype methods such as `getResourceType`, `getTerrainType`, `getYield`, `getYields`, `getPlotIndicesInRadius`, `isWater`, `isMountain`, `isValidLocation`, and coordinate/index conversion helpers. This is a high-signal autocomplete seed for map inspection commands.
- `Events.zip` and `craimasjien/civ7-craimasjiens-mod-pack/events.md` provide event-name corpora. They are useful for `engine.on(...)` suggestions but should stay labeled as public/community-derived unless reconciled with official `gamecore-events.xml`, `reporting-events.xml`, and UI source usage.
- The official/public resources mirror provides concrete usage and type-name evidence:
  - `panel-celebration-chooser.js` uses `Game.PlayerOperations.canStart(...)` and `sendRequest(...)` with `PlayerOperationTypes.CHOOSE_GOLDEN_AGE`.
  - `pause-menu-bootstrap.js` uses `Network.isLoggedIn`, `Network.getServerType`, `Network.restartGame`, `Network.getJoinCode`, `GameContext.sendRetireRequest`, `GameContext.sendPauseRequest`, `UI.setClipboardText`, and `UI.isClipboardAvailable`.
  - `hud-debug-widgets.chunk.js` uses `UI.Debug.registerWidget(...)`, `engine.on("DebugWidgetUpdated", ...)`, `Players.getAlive()`, and `GameplayMap.getPlotIndicesInRadius(...)`.
  - `age-transition-post-load.js` uses `Units.create`, `Units.get`, `Units.setLocation`, `GameInfo.Ages.lookup`, `Game.EconomicRules.adjustForGameSpeed`, and player treasury/influence helpers.
  - `unit-commands.xml` and `unit-operations.xml` define command/operation type names, including `UNITCOMMAND_EXECUTE_SCRIPT` and `UNITOPERATION_EXECUTE_SCRIPT`.
- Public runtime dumps list operation enum globals such as `PlayerOperationTypes`, `UnitOperationTypes`, `UnitCommandTypes`, `CityOperationTypes`, and `CityCommandTypes`. These provide autocomplete values, but not reliable argument schemas.
- The checked official-resource mirror contains `index.d.js` stubs under scripts/maps, but they are effectively empty. Live search did not find a complete public Civ7 `.d.ts` declaration source for `Game`, `Network`, `UI`, `GameInfo`, `Players`, or `Units`.
- `ghost-ng/Civ7-Developer-Docs` is useful as a secondary orientation source. It has JavaScript overview pages with examples for `GameInfo`, `Players`, and `Units`, but it is community-maintained and should not be imported as a source of truth without checking against official resources or runtime probes.
- Coherent GT docs support the architectural claim that UI JavaScript communicates with the game through an `engine` object and that live UI debugging can expose JavaScript state. They do not document Civ7-specific globals.

## Autocomplete Strategy Options

1. Static curated seeds only.
   - Use official resources and a small manual list for roots such as `Game`, `GameContext`, `GameInfo`, `GameplayMap`, `Players`, `Units`, `Cities`, `MapCities`, `UI`, `Network`, `Configuration`, `Database`, `engine`, and operation/type enums.
   - Lowest implementation cost; avoids runtime side effects.
   - Weakness: will drift and will not know context-specific globals.

2. Public corpus index.
   - Ingest CDC completions, WildW dumps, event lists, and official XML/JS references into a generated JSON index with `source`, `confidence`, `context`, and `last_verified` fields.
   - Good for command discovery and editor autocomplete without running Civ7.
   - Weakness: community-derived entries need clear warnings and periodic refresh.

3. Runtime introspection probe through the direct-control socket.
   - Execute read-only JavaScript snippets in the selected Civ7 state to collect `Object.getOwnPropertyNames(globalThis/window)`, `Object.getOwnPropertyDescriptors(target)`, prototype chains, and safe metadata for selected roots.
   - Best match for the direct-control workstream because it reuses the repo-owned transport and avoids building an in-game UI.
   - Weakness: needs state selection, timeout guards, output truncation handling, and a denylist for huge objects.

4. Generated ambient TypeScript declarations.
   - Later, generate `.d.ts` from the corpus/runtime metadata for editor support.
   - Useful only after metadata is stable enough; premature for this slice because argument schemas and native function signatures remain incomplete.

5. FireTuner/CDC-style UI.
   - Excluded. It expands into a console UI/debugger product and duplicates FireTuner or CDC rather than supporting the repo's direct-control boundary.

## Recommendations For This Slice

- Do not build a broad command catalog now. Capture the corpus as evidence and keep implementation focused on the direct-control boundary.
- Treat CDC as an autocomplete design reference, not as transport evidence. It proves that in-game eval plus global enumeration is productive; it does not prove anything about external socket control.
- If autocomplete enters scope later, start with a small typed/provenance-aware catalog:
  - `root`: global/object name.
  - `member`: property/function/type name.
  - `context`: `App UI`, `Tuner`, `game`, `shell`, or `unknown`.
  - `source`: official resource, runtime probe, CDC, WildW dump, community doc.
  - `confidence`: official/runtime/community.
  - `signature`: optional and nullable.
  - `side_effect`: `read`, `write`, `unknown`.
- Use official resources for stable enum/type names and examples of command shape. Use WildW/CDC for discovery leads. Promote an entry only when official source or fresh runtime probe corroborates it.
- Prefer a runtime `inspect` command later over a preloaded UI panel. A minimal probe can dump selected roots and cache results without expanding into a FireTuner clone.
- Annotate all suggestions by state/context. `UI` and `Network` appear in App UI evidence but not in the checked Tuner dump; autocomplete must not imply every global exists in every selected socket state.
- Keep any future "cheat" examples out of default autocomplete unless deliberately marked as write operations. CDC's `cheats.*` functions are useful examples but are side-effectful.

## Exclusions

- No implementation changes were made.
- No FireTuner clone, in-game debug UI, or broad command browser is recommended for this slice.
- No local Civ7 runtime/socket test was performed in this report; runtime proof belongs to the Runtime Protocol Investigator lane.
- No private SDK, private Discord content, or non-public source was used.
- No claims are made that public/community dumps are complete or current for every Civ7 version.
- No attempt was made to infer argument schemas for native functions beyond what source examples show.

## Evidence Appendix With Links

- Chrispresso's Debug Console resource page: https://forums.civfanatics.com/resources/chrispressos-debug-console-cdc.31995/
- CDC direct download inspected: https://forums.civfanatics.com/resources/chrispressos-debug-console-cdc.31995/download
- CDC 1.1.0 update notes, including global inspection claim: https://forums.civfanatics.com/resources/chrispressos-debug-console-cdc.31995/updates#resource-update-35620
- CDC discussion thread: https://forums.civfanatics.com/threads/chrispressos-debug-console-cdc.697261/
- WildW "Scripting Runtime Information": https://forums.civfanatics.com/threads/scripting-runtime-information.695101/
- WildW attachment `scrapeGlobalThis.zip`: https://forums.civfanatics.com/attachments/scrapeglobalthis-zip.718900/
- WildW attachment `Events.zip`: https://forums.civfanatics.com/attachments/events-zip.719671/
- WildW attachment `v2-scrapeGlobalThis.zip`: https://forums.civfanatics.com/attachments/v2-scrapeglobalthis-zip.719679/
- WildW attachment `GameplayMap.zip`: https://forums.civfanatics.com/attachments/gameplaymap-zip.721061/
- Craimasjien event list derived from WildW: https://github.com/craimasjien/civ7-craimasjiens-mod-pack/blob/main/events.md
- Official/public resource mirror, `panel-celebration-chooser.js`: https://github.com/mateicanavra/civ7-official-resources/blob/44faecabde123ba9e25f6340014c9c1d1b4e1a8e/Base/modules/base-standard/ui/celebration-chooser/panel-celebration-chooser.js
- Official/public resource mirror, `pause-menu-bootstrap.js`: https://github.com/mateicanavra/civ7-official-resources/blob/44faecabde123ba9e25f6340014c9c1d1b4e1a8e/Base/modules/base-standard/ui-next/screens/pause-menu/pause-menu-bootstrap.js
- Official/public resource mirror, `hud-debug-widgets.chunk.js`: https://github.com/mateicanavra/civ7-official-resources/blob/44faecabde123ba9e25f6340014c9c1d1b4e1a8e/Base/modules/base-standard/ui/debug/hud-debug-widgets.chunk.js
- Official/public resource mirror, `age-transition-post-load.js`: https://github.com/mateicanavra/civ7-official-resources/blob/44faecabde123ba9e25f6340014c9c1d1b4e1a8e/Base/modules/base-standard/scripts/age-transition-post-load.js
- Official/public resource mirror, `unit-commands.xml`: https://github.com/mateicanavra/civ7-official-resources/blob/44faecabde123ba9e25f6340014c9c1d1b4e1a8e/Base/modules/base-standard/data/unit-commands.xml
- Official/public resource mirror, `unit-operations.xml`: https://github.com/mateicanavra/civ7-official-resources/blob/44faecabde123ba9e25f6340014c9c1d1b4e1a8e/Base/modules/base-standard/data/unit-operations.xml
- Gedemon Live Tuner tutorial, useful only as secondary FireTuner/state evidence: https://forums.civfanatics.com/threads/how-to-connect-civ6-live-tuner-to-civ7-and-launch-an-autoplay-game.695080/
- Coherent GT JavaScript guide: https://coherent-labs.com/Documentation/cpp-gt/d9/d19/javascript.html
- Coherent GT UI debugging guide: https://coherent-labs.com/Documentation/cpp-gt/dd/d68/debugging.html
- Secondary/community `ghost-ng/Civ7-Developer-Docs`: https://github.com/ghost-ng/Civ7-Developer-Docs
