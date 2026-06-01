# Implementation Notes

Status: `implemented-local`

This change makes `mods/mod-swooper-maps/src/maps/configs/*.config.json` the
only authored source for shipped Swooper map variants.

Implemented:

- Canonical JSON map config envelope and validation helper in
  `mods/mod-swooper-maps/src/maps/configs/canonical.ts`.
- Foundation projection config stays compiler-owned: canonical shipped configs
  expose the public tectonic authoring surface, and the Foundation stage
  compiles projection internally for runtime.
- Full shipped configs for Swooper Earthlike, Swooper Desert Mountains,
  Shattered Ring, and Sundered Archipelago.
- Registry generation in `mods/mod-swooper-maps/scripts/generate-map-artifacts.ts`
  for generated map entry modules, `config.xml`, `.modinfo`, map localization,
  schema output, and Studio built-in config catalog.
- `tsup` map bundle entries now come from generated entry modules.
- Studio loads shipped maps as Configs, keeps local storage as Scratch, and uses
  a Vite dev-server write API for repo-backed Save and Save As. Successful
  repo-backed saves run the Swooper Maps deploy script and append a named
  FireTuner restart request for the running Civ7 session.
- Legacy shipped TS map wrappers, shipped `.config.ts` files, duplicate standard
  built-in preset JSON, and legacy Studio `advanced` focus compatibility mapping
  were removed.
- FireTuner bridge operational protocol now requires `AGENT=<agent-name>` on
  append-only bridge instructions so concurrent DRA runtime probes are audited
  by agent.

Local evidence:

- `bun run --cwd mods/mod-swooper-maps test test/config/maps-schema-valid.test.ts test/config/studio-presets-schema-valid.test.ts test/config/shipped-map-identity.test.ts`
- `bun run --cwd mods/mod-swooper-maps build:studio-recipes`
- `bun run --cwd mods/mod-swooper-maps build`
- `bunx vitest run apps/mapgen-studio/test/presets/presetStore.test.ts apps/mapgen-studio/test/presets/importFlow.test.ts apps/mapgen-studio/test/config/defaultConfigSchema.test.ts`
- `bun run --cwd apps/mapgen-studio build`
- `bun run --cwd mods/mod-swooper-maps deploy`
- Studio save API smoke against
  `mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json`
  returned `200`, ran `bun run --cwd mods/mod-swooper-maps deploy`, and
  appended FireTuner restart requests including `studio-mpswts66-sgg` and
  `studio-mpsx0njo-sgg`.

Runtime evidence:

- FireTuner bridge request
  `REQ codex-011 AGENT=DRA-map-config-generation RUN Network.restartGame()`
  was acknowledged and submitted at `2026-05-30T17:52:04`.
- Deployed mod artifacts under
  `~/Library/Application Support/Civilization VII/Mods/mod-swooper-maps/`
  had fresh `2026-05-30T17:51:04-0400` to
  `2026-05-30T17:51:05-0400` mtimes before the restart.
- `Modding.log` at `2026-05-30 17:52:06` selected map script
  `{swooper-maps}/maps/swooper-earthlike.js`; at `2026-05-30 17:52:08`
  Civ7 imported generated map bundles for `shattered-ring.js`,
  `sundered-archipelago.js`, `swooper-desert-mountains.js`, and
  `swooper-earthlike.js`.
- `Scripting.log` created a fresh `MapGeneration` context at
  `2026-05-30 17:52:11`, ran the Swooper standard recipe, completed
  `[50/50] ok mod-swooper-maps.standard.placement.placement`, and destroyed
  the context at `2026-05-30 17:52:12`.
- The post-`17:52` log window had no Swooper-specific `Error`, `Exception`,
  `ERROR`, or `failed` matches in `Scripting.log`, `Modding.log`,
  `Database.log`, `UI.log`, or `output.log`.
- Studio-triggered FireTuner bridge request
  `REQ studio-mpswts66-sgg AGENT=DRA-map-config-generation RUN Network.restartGame()`
  was acknowledged and submitted at `2026-05-30T18:16:05`.
- The Windows bridge command encoder was reverted to the previously working
  SendKeys punctuation path after an intermediate parenthesis regression.
  Follow-up request
  `REQ codex-restart-revert-1780180229 AGENT=DRA-map-config-generation RUN Network.restartGame()`
  was acknowledged and submitted at `2026-05-30T18:30:37`; Civ7 logs then
  showed fresh Swooper generation at `2026-05-30 18:31:29`, completing
  `[50/50] ok mod-swooper-maps.standard.placement.placement`.

Scoped caveat:

- `mods/mod-swooper-maps/test/pipeline/world-balance-stats.test.ts` is not a
  closure gate for this source-authority change and currently reports existing
  world-balance sensitivity for some seeds after using compiled canonical map
  configs. Product world-shape tuning remains a separate balance lane.
- The live Parallels bridge path is
  `~/Parallels Tunnel/Sid Meier's Civilization VII Development Tools/Comms/`;
  the stale `/Volumes/[C] Windows 11` SMB mount entry is not the authoritative
  access path for this environment.
