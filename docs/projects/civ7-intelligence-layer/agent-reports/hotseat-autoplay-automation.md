# Lane D Report: Hotseat, Autoplay, Automation, And Direct-Control Stack

Agent: Hegel
Lane: D - Hotseat, Autoplay, and direct-control stack
Date: 2026-06-03
Status: lane report for synthesis; not final architecture authority

## Objective

Investigate whether the hotseat findings, Autoplay, Automation, or recent
direct-control stack work changes the Civ7 intelligence-layer solution. The
product question is whether these surfaces unlock a better live AI
strategy/play architecture than the current split between direct-control live
play and static native-AI profile shaping.

## Sources Inspected

- `docs/projects/civ7-intelligence-layer/open-threads-investigation-frame.md`
- `docs/projects/civ7-intelligence-layer/open-threads-workstream-record.md`
- `docs/projects/civ7-intelligence-layer/SOLUTION-FRAME.md`
- `docs/projects/civ7-intelligence-layer/runtime-bridge-and-probes.md`
- `docs/projects/civ7-direct-control/workstream/play-agent/hotseat-solution.md`
- `docs/projects/civ7-direct-control/workstream/play-agent/hotseat-phase-packet.md`
- `docs/projects/civ7-direct-control/workstream/play-agent/control-surface-reference.md`
- `docs/projects/civ7-direct-control/workstream/capability-inventory/automation-playability-report.md`
- `docs/projects/civ7-direct-control/workstream/control-surface-expansion/implementation-closure.md`
- `packages/civ7-direct-control/README.md`
- `packages/civ7-direct-control/src/index.ts`
- `packages/civ7-direct-control/src/orpc/router.ts`
- `packages/civ7-direct-control/src/orpc/services.ts`
- `packages/civ7-direct-control/src/orpc/errors.ts`
- `packages/civ7-direct-control/src/orpc/types.ts`
- `packages/cli/src/commands/game/autoplay.ts`
- Official resources in `.civ7/outputs/resources`, especially game events,
  Automation scripts, and `context-manager.js`
- Installed official game bundle under
  `/Users/mateicanavra/Library/Application Support/Steam/steamapps/common/Sid Meier's Civilization VII/CivilizationVII.app/Contents/Resources`,
  especially hotseat shell/staging/handoff files
- Branch `codex/play-agent-hotseat-phase-packet` at commit `547b81e13`
- Branch `origin/codex/studio-autoplay-control` at commit `9d40e8728`
- Recent direct-control refactor branches including
  `codex/extract-direct-control-operation-router-source`,
  `codex/add-direct-control-lifecycle-runtime-tests`,
  `codex/add-direct-control-read-surface-tests`, and related source extraction
  slices

## Commands / Probes Run

All probes were read-only repository, branch, or static resource inspection.
No live game mutation was run.

- `git status --short --branch`
- `gt status`
- `git for-each-ref --format='%(refname:short)' refs/heads refs/remotes | rg -i 'hotseat|autoplay|automation|direct-control|intelligence|civ7'`
- `git log --all --date=short --pretty=format:'%h %ad %d %s' --grep='hotseat|Autoplay|autoplay|Automation|automation|direct-control|direct control' -i -n 80`
- `git show codex/play-agent-hotseat-phase-packet:docs/projects/civ7-direct-control/workstream/play-agent-hotseat-phase-packet.md`
- `git show --stat --oneline origin/codex/studio-autoplay-control`
- `git show origin/codex/studio-autoplay-control:apps/mapgen-studio/vite.config.ts`
- `git show codex/extract-direct-control-operation-router-source:openspec/changes/civ7-support-direct-control-modularization/workstream/direct-control-atom-corpus.md`
- Targeted `rg` and `sed`/`nl` reads for `Autoplay`, `Automation`,
  `supportsHotseat`, `SERVER_TYPE_HOTSEAT`, `LocalPlayerChanged`,
  `INTERFACEMODE_HOTSEAT`, `setAsAI`, `setAsHuman`, `canStart`,
  `sendRequest`, approvals, and postconditions across docs, package code,
  branch snapshots, and official resources

## Findings

1. `[verified-local]` The most recent hotseat solution packet is now
   consolidated on the current branch under
   `docs/projects/civ7-direct-control/workstream/play-agent/`, especially
   `hotseat-solution.md`, `hotseat-phase-packet.md`, and
   `control-surface-reference.md`. The older branch
   `codex/play-agent-hotseat-phase-packet` at `547b81e13` contains the same
   phase packet before consolidation and explicitly says the next slice should
   modularize direct-control first, then return to hotseat proof.

2. `[source-backed]` The hotseat solution recommends "hotseat-backed agent
   turns": configure the human and agent civilizations as hotseat human slots,
   wait for Civ7 to rotate `GameContext.localPlayerID`, let direct-control act
   only when the current local player is agent-owned, then complete the turn
   and yield. Its fallback is not Autoplay; it is disposable proof that normal
   operation routers can target non-local player/city/unit ids.

3. `[verified-local]` Installed official resources contain real hotseat UI and
   handoff machinery. `mp-landing-new.js` gates a Hotseat button with
   `UI.supportsHotseat()` and routes to
   `ServerType.SERVER_TYPE_HOTSEAT`; `mp-shell-logic.js` pushes
   `screen-mp-create-game` for hotseat and hosts via
   `Network.hostMultiplayerGame(eServerType)`; `model-mp-staging-new.js`
   exposes hotseat-specific human slot status changes; `game-core-utilities.js`
   listens for `LocalPlayerChanged`; `mp-ingame-mgr.js` attaches a hotseat
   curtain on local-player changes in hotseat games; `hotseat-curtain.js`
   switches to `INTERFACEMODE_HOTSEAT` and removes the curtain on Start Turn.

4. `[source-backed]` Hotseat is still unproven as a runtime product path. The
   current control-surface reference records a live single-player read where
   `UI.supportsHotseat() === false`, `Configuration.getGame().isHotseat === false`,
   and `Autoplay.isActive === false`. The docs correctly treat this as current
   session evidence only, not proof that hotseat cannot be activated from
   menu/setup.

5. `[verified-local]` Autoplay is a real native App UI/Tuner surface. Official
   game events include `AutoplayStarted` and `AutoplayEnded`. Official
   Automation scripts call `Autoplay.setTurns(...)`,
   `setReturnAsPlayer(...)`, `setObserveAsPlayer(...)`, `setActive(true)`,
   `setActive(false)`, and `setPause(...)`.

6. `[verified-local]` Automation/Autoplay is not a safe primary mechanism for
   "human plays normally while external agents take their own turns."
   Official `context-manager.js` returns no user input when
   `Automation.isActive || Autoplay.isActive`, and popup/modal display also
   avoids showing normal player UI while Automation is active. Autoplay
   delegates gameplay decisions to native Civ7 AI rather than an external
   strategy agent.

7. `[verified-local]` `@civ7/direct-control` currently wraps Autoplay as an
   approved mutation surface: `getCiv7AutoplayStatus`,
   `configureCiv7Autoplay`, `startCiv7Autoplay`, and `stopCiv7Autoplay`.
   Start may intentionally be unbounded; stop sets pause, requests inactive
   Autoplay, waits for the return player, and requires a stable turn before
   reporting verification.

8. `[verified-local]` The Studio autoplay branch
   `origin/codex/studio-autoplay-control` at `9d40e8728` adds a Studio
   `/api/civ7/autoplay` endpoint and footer control backed by
   `@civ7/direct-control`. It blocks autoplay changes while Save/Deploy or Run
   in Game operations are active, rejects malformed actions, and reports live
   autoplay state. This is useful operation-state discipline, not a new
   strategy-agent play architecture.

9. `[verified-local]` Recent direct-control stack work reveals the right API
   constraints for bridge design. Current oRPC code exposes grouped procedure
   atoms for lifecycle, live reads, setup, actions, and capabilities; mutating
   procedures require context `mutationPolicy: "send-approved"` plus an
   approval reason; envelopes carry `observedAt`, optional `correlationId`, and
   optional evidence policy. Service methods compose the existing package
   facade rather than forking runtime control.

10. `[verified-local]` The direct-control modularization branches extract or
    test focused atoms around operation routers, Autoplay/turn completion,
    lifecycle, read surfaces, tactical lenses, and progression reads. The atom
    corpus explicitly forbids CLI or oRPC from owning raw socket framing,
    embedded runtime JavaScript, postcondition semantics, or caller-local
    runtime transports. This reinforces the current rule that runtime Civ7
    control belongs in `@civ7/direct-control`.

11. `[hypothesis]` If hotseat activation and rotation pass, hotseat changes the
    live play plan from "one active player controlled externally" to
    "turn-swapping multi-player control inside one Civ7 client." That would
    not make native AI live-steerable. It would make external agents first-class
    players during their own local turns, using the same validator-backed
    direct-control operations.

12. `[eliminated]` Autoplay alone is eliminated as the primary live external
    strategy/play path. It is global, suppresses normal input, and hands
    decisions to native AI. It remains useful for smoke tests, measured native
    AI runs, waiting/observer experiments, and disposable benchmark loops.

## Product Implication

Hotseat is the only Lane D path that could materially improve the live
strategy/play architecture. If G1/G2/G4/G6 pass, the product can support one
human versus multiple external strategy agents in a single Civ7 client without
pretending to mutate native AI policy live. Strategy agents would need:

- a player ownership registry: human-owned, agent-owned, native-AI, unknown;
- a handoff router keyed by `GameContext.localPlayerID`,
  `LocalPlayerChanged`, observer id, turn state, and curtain state;
- playbooks scoped to the current local player only;
- strict hidden-info policy and per-player corpus partitioning;
- direct-control operation validation and postconditions for every action;
- turn-complete approval and postcondition checks;
- human restoration checks before yielding control.

Autoplay and Automation should feed the measurement layer, not the live
external-agent executor. They can accelerate disposable AI-vs-AI runs or smoke
tests, but they do not give strategy agents action authority.

Recent direct-control refactor/oRPC work should influence the bridge API shape:
make the strategy layer consume read and action procedure atoms with
correlation ids, approval policy, and evidence labels. Do not introduce a
second bridge that sends raw App UI/Tuner JavaScript around direct-control.

## Classification

| Path | Classification | Rationale |
|---|---|---|
| Hotseat-backed agent turns | Probe candidate; leading production candidate if gates pass | Strong official source evidence for setup, local-player events, and curtain handoff, but runtime activation/rotation/action proof is still missing. |
| Non-local operation fallback | Probe candidate; fallback only | Target-id operation wrappers make this plausible, but validator success does not prove mutating `sendRequest` authority for non-local players. |
| Autoplay | Probe candidate for bounded test runner; eliminated as primary live external-agent play path | Proven native surface and direct-control wrapper, but global native AI control and UI suppression make it wrong as the main strategy-agent executor. |
| Automation | Observation-only signal and disposable test harness; eliminated as primary live play path | Official scripts reveal setup/autoplay patterns and benchmark loops, but Automation is a test harness that suppresses normal UI and can change session state. |
| Studio autoplay control | Observation/support signal | Shows good conflict guards around live operations, but only wraps native Autoplay for Studio workflows. |
| Recent direct-control/oRPC stack | Production candidate foundation for bridge/API shape | Provides facade ownership, read/action procedure atoms, approval gates, postcondition boundaries, and no alternate runtime transport. |

## Safety Risk

- Hotseat proof requires disposable setup/game sessions. Activation, turn
  progression, agent operations, and turn completion are mutating and must not
  run against the active live game.
- Autoplay advances game state. Even "start then stop" can leave queued turns
  resolving, so it requires explicit approval, pause-on-stop, return-player
  proof, and stable-turn proof.
- Automation can configure/load games, save/load, suppress UI, and run
  benchmark loops. Treat it as high-blast-radius outside disposable sessions.
- Non-local operation fallback can corrupt a human-local session if operation
  authority is misattributed. Each family needs one-operation disposable proof
  with before/after and human-session integrity checks.
- Direct-control raw `exec` remains an expert/debug surface. Strategy agents
  should not synthesize arbitrary mutating JavaScript as their normal API.

## Exact Next Probes

1. Read-only hotseat setup snapshot in a menu/setup context: capture
   `UI.supportsHotseat()`, `Network` capabilities, current server type,
   `Configuration.getGame().isHotseat`, `isAnyMultiplayer`, hotseat button DOM
   presence, and whether the official hotseat route is visible. Do not run from
   the active live game if it requires changing state.

2. Approved disposable hotseat activation: invoke the official
   `ServerType.SERVER_TYPE_HOTSEAT` path from setup/menu and record whether
   `Configuration.getGame().isHotseat === true` or equivalent setup/game state
   appears. Stop immediately if the route rejects, no-ops, or creates
   non-hotseat multiplayer.

3. Approved disposable two-slot rotation probe: create a tiny hotseat game with
   one human-owned slot and one agent-owned hotseat human slot; log
   `LocalPlayerChanged`, `GameContext.localPlayerID`,
   `GameContext.localObserverID`, turn/date, slot ownership, and curtain DOM
   after end-turn handoff.

4. Approved disposable curtain probe: when the agent-owned slot is current,
   exercise only the minimal curtain remove/default-interface path needed to
   start the agent turn; verify `INTERFACEMODE_HOTSEAT` does not leak into the
   restored human turn.

5. Approved disposable agent-operation probe: while the agent slot is current
   local player, run one low-risk validator-backed operation through
   `@civ7/direct-control`, send once with an approval reason, and verify a
   concrete postcondition plus no broken handoff.

6. Approved disposable turn-complete and human-restoration probe: call
   `sendCiv7TurnComplete` only after readiness checks, then confirm next
   `LocalPlayerChanged`, human local-player restoration, `Automation.isActive`
   false, `Autoplay.isActive` false, no curtain leak, normal input readiness,
   and expected blocker/notification state.

7. If G1 or G2 fails, run fallback non-local operation probes in a disposable
   non-hotseat game: one player, one city, and one unit operation family,
   separately, each with validation, one approved send, state delta proof, and
   human-session integrity readback.

8. For measurement only, run bounded disposable Autoplay start/stop proof with
   event log capture (`AutoplayStarted`, `AutoplayEnded`), return-player proof,
   paused stop, and stable turn. Use this for native-AI measured-run harnesses,
   not for external-agent action authority.

9. Bridge/API follow-up: add any hotseat probes as `@civ7/direct-control`
   read/action atoms or oRPC procedures with `read-only` versus `send-approved`
   policy, correlation id, approval reason, and explicit postcondition fields.
   Do not add caller-local socket code or raw JS strategy-agent tools.

## Synthesis For Authoring

The solution frame should not yet claim hotseat as production. It should say
that hotseat is the leading live multi-agent probe because it may provide the
missing local-player handoff. If proven, it expands direct-control live play
from one controlled local player to turn-swapping external agents. It does not
merge live play with native AI profile shaping.

Autoplay/Automation should be described as support infrastructure for smoke
tests, benchmark loops, and measured native-AI runs. They are not live
strategy-agent control paths unless a future proof shows scoped, non-global,
human-safe control, which current evidence does not show.

Direct-control stack work should be incorporated as an API invariant:
strategy-agent bridges consume package-owned procedure atoms with approvals,
postconditions, and evidence labels. The direct-control boundary is stronger
after the refactor work; it should not be bypassed.

Skills used: investigation-design, solution-design, domain-design, api-design.
