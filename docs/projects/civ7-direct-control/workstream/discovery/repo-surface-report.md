# Repo Surface Report

Final implementation note: this report captures the pre-cutover repository
surface. Its keep/replace/archive manifest is historical input, not current
guidance. The accepted implementation created `packages/civ7-direct-control`,
rewired CLI and Studio to that package, and removed repo-owned Windows/
FireTuner bridge transport code instead of retaining it as a legacy lane.

## Summary

Current repo-owned FireTuner/direct-control behavior is split across CLI and Studio. CLI owns an older append-only Windows/FireTuner bridge command (`packages/cli/src/commands/game/restart.ts`) and bridge-log protocol helper (`packages/cli/src/utils/firetunerBridge.ts`). A newer direct tuner-socket helper lives beside it in CLI utilities (`packages/cli/src/utils/firetunerSocket.ts`). Studio imports both helpers directly from CLI source and embeds deploy, restart, and `Scripting.log` proof behavior in its Vite dev-server plugin (`apps/mapgen-studio/vite.config.ts`).

The direct-control OpenSpec already states the target: one canonical boundary owns tuner socket transport, state discovery, command execution, health, reconnect behavior, and error classification; CLI and Studio become callers. Current code supports that target as implementation evidence, but it should not be preserved as target ownership.

Best current owner option: add a small workspace package, likely `packages/civ7-direct-control`, and move/refactor the direct socket protocol there. Do not make CLI, Studio, generated outputs, logs, or the Windows bridge the canonical owner.

## Current Call Graph

Studio repo-backed save path:

```text
apps/mapgen-studio/src/App.tsx
  saveRepoBackedConfig()
    -> POST /api/map-configs
apps/mapgen-studio/vite.config.ts
  repo-backed-map-configs Vite middleware
    -> deploySwooperMaps()
       -> bun run --cwd mods/mod-swooper-maps deploy
    -> requestCiv7Restart()
       -> createFireTunerRequestId()
       -> runFireTunerSocketCommand()
          -> open socket 127.0.0.1:4318
          -> LSQ: state query
          -> CMD:<stateId>:Network.restartGame()
       -> optional waitForFreshMapGeneration()
          -> poll Scripting.log for fresh MapGeneration markers
```

CLI bridge restart path:

```text
civ7 game restart
  packages/cli/src/commands/game/restart.ts
    -> appendFireTunerBridgeRequest()
       -> append REQ <id> AGENT=<agent> RUN Network.restartGame()
    -> optional waitForFireTunerBridgeResponse()
       -> parse RESULT/BLOCKED from append-only bridge log
```

Direct socket helper test path:

```text
packages/cli/test/utils/firetunerSocket.test.ts
  mock node:net server
    -> expect LSQ:
    -> respond states 65535/App UI and 1/Tuner
    -> expect CMD:65535:Network.restartGame()
```

## Existing Protocol Owner(s)

- `packages/cli/src/utils/firetunerSocket.ts`: direct socket protocol seed. It owns default host/port/timeout, state query (`LSQ:`), command frame shape (`CMD:<stateId>:<command>`), little-endian request/response framing, listener IDs, and `CIV7_FIRETUNER_HOST` / `CIV7_FIRETUNER_PORT` parsing. This is the strongest source seed for the canonical boundary, but it is currently in the wrong owner because CLI utilities are not a shared transport package.
- `packages/cli/src/utils/firetunerBridge.ts`: append-only bridge-log protocol owner. It owns `Network.restartGame()`, request IDs, default Parallels shared-folder bridge path, `REQ ... AGENT=... RUN ...` formatting, and `RESULT`/`BLOCKED` parsing. This is legacy/operational bridge behavior, not the direct-control owner.
- `packages/cli/src/commands/game/restart.ts`: CLI UX owner for the existing bridge command. It owns flags, JSON output, dry-run, wait timeout, and user-visible bridge errors. It does not use direct socket control today.
- `apps/mapgen-studio/vite.config.ts`: accidental Studio control owner. It imports CLI source helpers, duplicates FireTuner port env parsing, hard-codes the `App UI` restart state, interprets socket output `["true"]`, and owns fresh `Scripting.log` proof markers. Keep its endpoint behavior, but replace raw transport ownership.
- `apps/mapgen-studio/src/App.tsx`: UI caller only. It posts config saves to `/api/map-configs` and displays returned deploy/restart IDs; it should remain above the direct-control boundary.

## Duplicate Or Legacy Paths

- CLI bridge and direct socket helpers coexist under `packages/cli/src/utils/`, creating duplicate control ownership under one package.
- Studio reaches into `../../packages/cli/src/utils/...` instead of consuming a package API. That makes CLI source a hidden shared library and bypasses package ownership.
- `apps/mapgen-studio/vite.config.ts` duplicates port parsing already present in `firetunerSocket.ts`.
- `apps/mapgen-studio/vite.config.ts` owns restart success interpretation and proof polling that should become caller policy or verification helper behavior around the canonical control API.
- `packages/cli/AGENTS.md` still describes `game restart` as “through the FireTuner bridge.” That is accurate for current CLI code but will become stale after direct-control routing.
- `openspec/changes/normalize-swooper-map-config-generation/design.md` and `implementation.md` record the older decision that FireTuner restart is CLI-owned bridge behavior. Treat as historical evidence for why the bridge exists, not target authority for this workstream.
- No repo-owned `.ps1`, `.bat`, `.cmd`, `.ahk`, or `.vbs` FireTuner/Windows bridge scripts were found. The Windows-side bridge appears outside the repo, with this repo only appending/parsing its log protocol.
- `packages/cli/dist/**` and `packages/cli/oclif.manifest.json` contain generated copies/metadata when built, but they are ignored by `.gitignore` and should be regenerated, not edited.

## Keep/Replace/Archive Manifest

| Surface | Disposition | Reason |
|---|---|---|
| `packages/cli/src/utils/firetunerSocket.ts` | Replace owner, keep protocol seed | Strongest source evidence for direct socket framing/state/command behavior; move or refactor into canonical boundary with health, reconnect, state selection, and classified errors. |
| `packages/cli/test/utils/firetunerSocket.test.ts` | Replace owner, keep scenarios | Mock server validates frame protocol; migrate/expand under canonical boundary tests. |
| `packages/cli/src/utils/firetunerBridge.ts` | Quarantine/legacy keep | Required for existing bridge command and audit parsing, but not canonical direct control. Keep only as explicit legacy transport unless direct control falsifies. |
| `packages/cli/test/utils/firetunerBridge.test.ts` | Keep while bridge exists | Protects append-only audit format and `AGENT=` requirement from root `AGENTS.md`; scope as legacy tests. |
| `packages/cli/src/commands/game/restart.ts` | Replace behavior | Current command appends bridge requests. Re-route to canonical direct-control boundary or split into explicit legacy bridge command if bridge remains. |
| `packages/cli/test/commands/game.restart.test.ts` | Replace/expand | Current tests prove bridge append only. Add direct-control CLI command tests and retain bridge tests only for a named legacy path. |
| `apps/mapgen-studio/vite.config.ts` | Replace transport ownership | Keep save/deploy endpoint behavior, but move direct socket, env parsing, restart command execution, and reusable verification helpers out of Vite config. |
| `apps/mapgen-studio/src/App.tsx` | Keep caller | UI posts saves and consumes restart metadata; no low-level transport ownership found. |
| `.agents/skills/civ7-operational-debugging/references/firetuner-runtime.md` | Update after implementation | Good runtime-proof policy, but bridge examples and direct command guidance need alignment with the new canonical boundary. |
| `docs/system/mods/swooper-maps/architecture.md` | Update lightly | Current note says rapid iteration relies on FireTuner-driven workflows; refine to direct Civ7 control once boundary lands. |
| `packages/cli/AGENTS.md` | Update after CLI routing | Current command inventory will be stale once `game restart` stops being bridge-only. |
| `openspec/changes/normalize-swooper-map-config-generation/*` | Leave/archive as historical | Explains prior bridge introduction and evidence; do not let it override the active direct-control OpenSpec. |
| `packages/cli/dist/**`, `packages/cli/oclif.manifest.json` | Regenerate only | Generated/ignored outputs; protected evidence, not edit surfaces. |
| External Windows bridge log/scripts | Archive outside canonical path | No in-repo scripts found. Treat append-only log protocol as external legacy integration evidence. |

## Proposed Canonical Owner Options

1. **New workspace package: `packages/civ7-direct-control`**
   Recommended. It can expose a Node-compatible TypeScript API for `discoverStates`, `executeCommand`, `restartGame`, `health`, `reconnect/rediscover`, and classified errors. CLI and Studio both depend on it as package consumers. This avoids CLI-as-library leakage and keeps direct developer control separate from in-game engine adapter code.

2. **Direct-control module inside `packages/civ7-adapter`**
   Not recommended as the primary option. `@civ7/adapter` owns Civ7 engine globals and `base-standard` translation inside mod/runtime code, while direct-control is a local developer-process socket client. Mixing those concerns would blur “game runtime adapter” with “developer control transport.”

3. **CLI-owned shared utility exported for Studio**
   Not recommended. This preserves the current accidental shape where CLI owns reusable transport behavior and Studio imports command-package internals.

4. **Local service/API proxy**
   Defer. It may become useful for shared long-lived connections, external tools, or multi-client state, but it adds daemon lifecycle/port management before discovery proves it is needed. A package library can later gain an optional service wrapper.

## Tests/Docs To Update

- Add canonical package tests for frame encode/decode, partial frames, multiple frames, listener ID matching, state discovery, state selection by id/name/role, command execution, connection timeout, command timeout, socket close, invalid port env, health, and reconnect/rediscover behavior.
- Move/expand `packages/cli/test/utils/firetunerSocket.test.ts` into canonical package tests; leave only CLI command-routing tests in CLI.
- Update `packages/cli/test/commands/game.restart.test.ts` so `game restart` proves direct-control routing, JSON/error behavior, and timeout handling. If the bridge remains, add a separately named legacy command or flag test.
- Add Studio dev-server/API tests or extract the `/api/map-configs` middleware into a testable module. Current Studio tests do not cover the save/deploy/restart endpoint.
- Update `openspec/changes/civ7-direct-control-surface/specs/civ7-direct-control/spec.md` after owner choice with exact package/API expectations.
- Update `.agents/skills/civ7-operational-debugging/references/firetuner-runtime.md`, `packages/cli/AGENTS.md`, and the Swooper Maps operational note after implementation.
- Regenerate generated CLI artifacts through package scripts if CLI commands change; do not hand-edit `dist/` or `oclif.manifest.json`.

## Risks/Reframe Triggers

- Direct socket availability depends on Civ7 tuner support being enabled and the listener being available; runtime proof must confirm restart/reconnect behavior after Civ7 exits and returns.
- State lifecycle may be more nuanced than current defaults. Operational docs say main menu may expose only `App UI`, in-game sessions may expose `App UI` and `Tuner`, and states may need refresh after game transitions.
- Current direct helper has no explicit health API, reconnect policy, structured error classes, or command context roles. Implementing callers before fixing that would preserve duplicate policy decisions.
- Studio’s fresh `Scripting.log` proof is Swooper Maps map-generation proof, not generic direct-control proof. Keep proof boundaries separate.
- If live evidence shows commands require FireTuner running, Steam-mediated behavior, authentication, or a state that direct socket cannot select reliably, reframe back to a FireTuner/bridge-supervised design.
- If multiple tools need a shared long-lived session and reconnect state, revisit the local service/proxy option.

## Evidence Appendix

- Repo state: branch `codex/civ7-direct-control-workstream`; Graphite config present. Pre-existing dirty/protected files observed: `mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json`, `NOTE-TO-DRA.md`, plus untracked workstream/OpenSpec directories.
- Root `AGENTS.md` lines 49-52 require Bun/turbo defaults and `AGENT=<agent-name>` on appended FireTuner bridge commands.
- Active project frame: `docs/projects/civ7-direct-control/PROJECT-civ7-direct-control.md` defines direct socket control as primary while FireTuner remains reference-client evidence.
- Active investigation brief: `docs/projects/civ7-direct-control/workstream/discovery/investigation-brief.md` asks whether current repo already talks directly to Civ7 and which paths should be kept, replaced, quarantined, archived, or left untouched.
- Active OpenSpec: `openspec/changes/civ7-direct-control-surface/proposal.md` lines 27-35 names the canonical direct-control surface and cleanup of older bridge scripts/external paths; lines 48-54 forbid duplicate CLI/Studio socket ownership and silent fallback.
- Target spec: `openspec/changes/civ7-direct-control-surface/specs/civ7-direct-control/spec.md` requires one transport owner, state/health reporting, and explicit reconnect behavior.
- CLI direct socket code: `packages/cli/src/utils/firetunerSocket.ts` lines 27-61 runs commands; lines 63-83 query states; lines 153-178 encode/parse frames.
- CLI bridge code: `packages/cli/src/utils/firetunerBridge.ts` lines 31-39 set the default bridge log path; lines 45-77 format/append requests; lines 79-129 parse/wait for responses.
- CLI command: `packages/cli/src/commands/game/restart.ts` lines 10-20 describe bridge restart UX; lines 52-112 implement append, wait, JSON, and errors.
- Studio direct socket caller: `apps/mapgen-studio/vite.config.ts` lines 150-202 requests restart through the socket helper and optional log proof; lines 254-328 expose `/api/map-configs`.
- Studio UI caller: `apps/mapgen-studio/src/App.tsx` lines 94-140 posts saves and consumes deploy/restart metadata.
- Tests: `packages/cli/test/utils/firetunerSocket.test.ts` lines 7-51 covers `LSQ:` and `CMD:65535:Network.restartGame()` against a mock server; bridge tests cover `AGENT=` request formatting and `RESULT`/`BLOCKED` parsing.
- Generated-output policy: `.gitignore` lines 18 and 26 ignore `dist/` and `packages/cli/oclif.manifest.json`; generated outputs are not edit surfaces.
- Negative search evidence: repo search found no in-repo Windows bridge script files with `.ps1`, `.bat`, `.cmd`, `.ahk`, or `.vbs` extensions.
