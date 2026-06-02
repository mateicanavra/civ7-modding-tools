# DRA Takeover Reference

Status: final takeover reference after watcher handoff.
Owner: incoming support DRA.
Do not delete: this is the curated handoff frame for the next agent taking over
live-play support from watcher thread `019e8225-4572-75f0-81b7-93ccc368bfd3`.

## Current Frame

The support DRA exists to help the player agent play Civ7 well through the age
of Antiquity by turning live friction into native, deterministic, ergonomic
control surfaces. The player owns gameplay decisions and uses only the provided
CLI. The support DRA owns tooling, proof boundaries, watcher coordination, and
small implementation slices that make the next player action safer, clearer, or
more strategic.

The main product is not "more commands." The product is a humane live-play
control layer: compact reads, exact validated operations, honest
postconditions, relationship-safe language, and fast recovery from stale UI
state. Build for the player in the middle of a real turn, under time pressure,
with limited context.

## Hard Corrections

- No direct computer/UI control in the play lane. The player was explicitly
  corrected to use only the CLI.
- No fallback-as-default-path fixes. If normalization or operation identity is
  variable, make the contract deterministic or surface an explicit diagnostic.
  Do not hide broken normalization by substituting another identity source.
- Do not repeat a state-changing command when the same target remains live and
  verification is suspect. Re-read, prove delayed application, or repair the
  verifier.
- Official Civ7/App UI/runtime primitives lead. Avoid raw speculative pokes,
  generic Tuner-state shortcuts, or caller-visible workaround lanes when an
  official PlayerOperation, CityOperation, UnitOperation, UnitCommand, handler,
  or App UI manager owns the state machine.
- Multi-surface proof is a smell, not a design goal. Queues, trains, HUDs, and
  materialized views can be used as temporary diagnostics while the owning
  native state boundary is unclear, but the target contract should collapse
  each blocker to the narrowest authoritative Civ/App UI owner that actually
  decides it.
- Relationship wording must remain proof-scoped. Other-owner contact,
  Samarkand report text, and nearby units are not by themselves proof of enemy,
  hostile, war, opponent, or non-friendly status.

## Live State At Final Takeover

- Player thread: `019e85d9-063f-7270-b055-5d036e547af0`.
- Supervisor thread: `019e859d-03d6-7cb3-aff3-b8de9c830f52`.
- Watcher/support thread: `019e8225-4572-75f0-81b7-93ccc368bfd3`.
- Support worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-watch-civ7-live-play-reference-assembly`.
- Branch: `codex/live-traditions-view`.
- The turn-19 `NOTIFICATION_UNIT_LOST` blocker id
  `{"owner":0,"id":34,"type":20}` is resolved as of the latest player tail.
- Commit `57e1171db fix(civ7): harden closeout workflows` landed the broad
  safety repair: no false verification while the same target remains engine
  queue front, no raw end-turn fallback, no bulk dismissal for front/blocking
  `UNIT_LOST`, and production primitive support folded into the same commit.
- The player then performed one exact dismissal attempt from the rebuilt
  surface; it failed verification and the player held. Do not treat the exact
  retry path as proven progress yet.
- Watcher then found a tighter native-owner issue: Civ's official
  desktop notification panel avoids `Game.Notifications.dismiss` only when
  `getEndTurnBlockingType(localPlayer) != NONE` and the target is that same
  blocker. The live shape has blocker enum `0/NONE` while lower-level
  `findEndTurnBlocking(..., 0)` still points at the unit-lost id. The wrapper
  may have been too conservative and skipped the official panel close route.
- Commit `5024a52bd fix(civ7): mirror panel notification dismissal guard`
  landed that narrower panel-route fix. The player ran the one-shot exact
  dismissal, verified the queue clear, ended the turn, and progressed into
  normal turn-20/turn-21 unit and advisory handling.
- New active live blocker after the handoff: turn 23 / 3450 BCE,
  `NOTIFICATION_CHOOSE_CULTURE_NODE` id `{"owner":0,"id":46,"type":20}`.
  Player reports `choose-culture --send --closeout` validated/sent, then a
  documented `set-culture-target` fallback was tried once, but the same culture
  blocker remained end-turn-blocking and `end-turn --send` failed.
- The inherited formation-snapshot relationship cleanup has been carried
  forward: the read surface uses neutral other-owner/contact vocabulary and
  exposes explicit `relationship-unproven` policy metadata instead of `threat`
  or `opponent` labels.
- Latest player tail says the culture-choice blocker is the material hard stop
  and play is holding rather than brute-forcing more choices. The next support
  DRA should still reground live state with read-only CLI before patching.
- Latest supervisor priority correction: do not let movement-preview polish
  displace the relationship/city-state/suzerain authority lane unless fresh
  live evidence makes movement preview a material blocker. Formation snapshot
  now uses neutral contact vocabulary; keep auditing nearby posture surfaces for
  any remaining relationship labels that outrun official relationship/team/war/
  suzerain proof.

## Recent Trajectory

The long session has been an iterative live-play support workstream:

1. Build compact surfaces for current blockers: notifications, priority queue,
   ready-city, ready-unit, unit-target, narrative/government/culture/tech
   option readers, production candidates, and end-turn guards.
2. Convert repeated player friction into caller-level operations that send the
   official underlying action and then verify a meaningful postcondition.
3. Use supervisor nudges to prevent stale blocker chasing, weak proof claims,
   unsafe live mutation, fallback contracts, and relationship overclaiming.
4. Keep changes small and committed when green, but let current live blocker
   priority override comfortable backlog order.

Important commits in the current support branch include deterministic city id
normalization after the rejected fallback commit, narrative choice options,
tech/culture chooser closeout using `NO_NODE`, dismissal verification yielding
across UI frames, `57e1171db` for hardened closeout workflows, and `5024a52bd`
for mirroring the official panel notification dismissal guard. The current
work is no longer unit-loss closeout; it is culture-choice closeout persistence
first, then relationship/city-state/suzerain authority cleanup.

## Workstream Posture

Use this order every pass:

1. Ground disk: branch, dirty files, recent commits, active DRA work.
2. Ground live player: latest player tail, compact priorities, notification
   queue, exact blocker identity, and whether a send is safe.
3. Ground supervisor: latest correction, proof bar, and priority ordering.
4. Choose one bounded support slice only if it removes current or repeated
   player friction and can be proved with focused tests.
5. Notify player with operational deltas only after commit or after a verified
   read-only state correction. Avoid noisy strategy chatter.

## Current Repair Bar

For the `UNIT_LOST` blocker, the committed safety floor is:

- reviewed informational classification includes `NOTIFICATION_UNIT_LOST` only
  with an honest proof boundary;
- `NOTIFICATION_UNIT_LOST` is not in a broad turn-completion fallback whitelist
  unless the guard proves the exact target is no longer engine-queue front;
- dismissal verification fails when the same target remains front/blocking in
  the engine queue, even if the notification train does not contain it;
- engine-front identity outranks secondary `dismissed:true` flags for the same
  target;
- tests model the live split: train absent before/after, engine queue still
  front, verified must be false;
- tests also model the contradictory shape `dismissed:true` plus same
  engine-queue front target, verified must be false;
- compact priorities routes the `unit-lost-report` fixture to reviewed
  dismissal, not town focus or a generic blocker;
- notification queue may present the exact reviewed dismissal command, but a
  front/end-turn-blocking `UNIT_LOST` must not be bulk-safe or selected by
  `dismiss-notification-queue`;
- bulk dismissal must share the stricter scheduler eligibility. Do not let
  `dismiss-notification-queue` independently select front/blocking `UNIT_LOST`
  just because it is informational/App UI dismissible;
- end-turn regression proves `GameContext.sendTurnComplete()` is not called
  when the preflight view has the same still-front `UNIT_LOST` target, even if
  the blocker enum reports `0` and ready unit is null;
- the player receives exact next commands only after the relevant route is
  rebuilt/smoked or already present in the committed global CLI surface.

The inherited `UNIT_LOST` work is now resolved. Preserve the lesson:
queue/train/HUD proof was useful diagnostic scaffolding, but the real owner was
the official panel dismissal guard keyed to the authoritative end-turn blocker
enum. Future blockers should get the same treatment: collapse to the narrow
native owner once evidence identifies it.

For production-choice support, preserve the emerging direction:

- production choice should become a dedicated official city `BUILD` caller
  action with App UI/runtime validation and postcondition evidence;
- do not claim production is UI-independent;
- do not live-smoke a mutating production send unless production is currently
  blocking or the user explicitly asks;
- command templates should carry exact validated args, not magic defaults.

## Objective To Carry Forward

Take over as the live Civ7 support DRA/refiner/builder for the player agent in
watcher worktree
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-watch-civ7-live-play-reference-assembly`
on `codex/live-traditions-view`. Help the player finish Antiquity by building
deterministic, native-feeling CLI support surfaces that convert live blockers
into safe exact operations with honest postconditions. Ground each pass in
current disk/Graphite state, supervisor thread
`019e859d-03d6-7cb3-aff3-b8de9c830f52`, player thread
`019e85d9-063f-7270-b055-5d036e547af0`, watcher handoff
`019e8225-4572-75f0-81b7-93ccc368bfd3`, and live read-only HUD/CLI state.
Prioritize the player's current blocker over stale backlog. Hard constraints:
player uses only CLI; no direct UI/computer control; no fallback-as-default
solution paths; no speculative raw runtime pokes; no repeated sends when
verification is suspect; no relationship/hostility claims without official
relationship evidence. Multi-surface proof across queues/trains/HUDs is a
smell, not the target API: use it only as diagnostic/safety evidence while
identifying the narrow authoritative Civ/App UI owner, or document why Civ
truly requires a split. Continue from support-code commit `5024a52bd` plus this
takeover reference; the unit-loss closeout resolution is landed and the old P0
notification blocker is cleared. Start disk/live-first with the current turn-23
culture-choice blocker: re-read current play/live state and prove whether
`NOTIFICATION_CHOOSE_CULTURE_NODE` is still end-turn-blocking. If it is still
blocking, investigate culture-choice closeout under crash-safe constraints
using official App UI / PlayerOperations / notification owner evidence. Do not
repeat blind `choose-culture` or `set-culture-target` sends as progress; make
sends either clear via a proven native route or return an honest postcondition
classification such as "state changed but `NOTIFICATION_CHOOSE_CULTURE_NODE`
still live". Keep the inherited dirty
`packages/cli/src/commands/game/play/formation-snapshot.ts` relationship
cleanup explicitly owned: finish with tests/docs or revert/supersede it, but do
not leave silent dirty state. Relationship/city-state/suzerain authority is the
next non-live-blocker lane: remove or prove labels like `threats`, `opponents`,
hostile, enemy, non-friendly, or war using official relationship/team/war/
suzerain evidence, because owner mismatch/contact/proximity is not enough.
Movement preview/reachable-path guidance is a useful later ergonomic lane, but
only build it first if current live state makes it a material blocker. Continue
small tested committed slices around live friction: production choice,
relationship wording cleanup, better priority/ready surfaces, strategic
dashboards, movement preview ergonomics, and native primitives that improve
player control.
Preserve this reference, keep proof labels honest, update docs/tests with
behavior, and keep repo state explicit.

## Reframe Triggers

- The live blocker changes before the verifier repair lands.
- The watcher commits or drops the dirty production/verifier work.
- Supervisor sends a higher-priority correction.
- Current tests pass but live evidence contradicts the claimed postcondition.
- A native official primitive proves a simpler complete route than the current
  wrapper.
- A repair starts depending on multiple observed surfaces as a permanent
  contract without proving Civ requires that split.

## Tail Notes

2026-06-02 01:30 EDT:

- Watcher acknowledged this document and agreed not to edit it.
- Player remains blocked on `UNIT_LOST` and has marked the play goal blocked
  until the support verifier/classification path is fixed.
- Supervisor confirmed the core verifier direction is right but rejected the
  end-turn fallback widening. The safe shape is reviewed dismissal only, with
  identity-based proof that the exact target left or moved off the engine queue.
- Watcher accepted that correction and removed the unsafe fallback addition.

2026-06-02 01:33 EDT:

- Watcher added the right proof shapes: direct-control verifier regression,
  compact-priority reviewed-dismissal routing, notification-queue scheduling,
  and an end-turn regression that must not call `GameContext.sendTurnComplete`
  while the same `UNIT_LOST` target remains front.
- Watcher also split docs: `UNIT_LOST` belongs in reviewed informational
  closeout docs, but not in the raw end-turn fallback list.
- Supervisor found the direct-control regression initially failed because the
  fake tuner fixture cleared after send even in the engine-front/train-absent
  mode. The fixture must keep the no-change live shape across post-send reads.
- Latest watcher tail says direct-control gate is green; CLI focused gate may
  need a direct-control rebuild because CLI tests import compiled package
  output. Do not treat CLI red/green as meaningful until the package boundary is
  refreshed deliberately.

2026-06-02 01:37 EDT:

- User corrected the frame: "proof across queues/trains/HUDs" is itself a
  design smell. The next DRA should not inherit the wide proof bag as a target
  architecture.
- Updated target: use multiple surfaces only as diagnostic evidence or safety
  guardrails while finding the authoritative native owner. If the final contract
  still needs multiple surfaces, explain exactly why Civ requires that split.
- Watcher acknowledged this correctly: the current verifier patch is a safety
  repair for the false-success bug, not the target architecture; the next
  investigation is the narrower owner for engine-queue notification closeout.
- Supervisor added two pre-commit proof-boundary corrections: same-target
  engine-front evidence must outrank `dismissed:true`, and front/blocking
  `UNIT_LOST` must not be advertised as batch-safe.
- Supervisor then found the sibling bulk command still had independent broad
  eligibility. `dismiss-notification-queue` needs a regression with
  `eligibleCount:0` / `selectedCount:0` for the live front `UNIT_LOST` shape,
  while keeping the exact per-notification command available.

2026-06-02 01:45 EDT:

- Watcher committed `57e1171db fix(civ7): harden closeout workflows`. The
  commit is intentionally combined because notification and production changes
  were interleaved in shared fake-server/test infrastructure.
- The committed surface passed focused notification/bulk/end-turn tests,
  direct-control check, CLI check, and rebuilt read-only smoke. Bulk dismissal
  excludes the live `UNIT_LOST`; notification queue keeps only the exact route.
- Player did one exact dismissal attempt after the `57e1171db` commit, failed
  verification, then held until `5024a52bd`.
- Watcher found the likely tighter owner bug and sent a correction before more
  player action: the wrapper was refusing official `Game.Notifications.dismiss`
  based on stale lower-level engine-front identity, even though Civ's desktop
  panel logic only suppresses that close control when the authoritative
  end-turn blocker enum is non-`NONE`.
- Watcher initially stopped with dirty source/test changes for this panel-route
  follow-up; shortly after, they finished and committed it as `5024a52bd`.

2026-06-02 01:52 EDT:

- Watcher committed `5024a52bd fix(civ7): mirror panel notification dismissal
  guard`, rebuilt the global surface, and instructed the player to run one
  exact dismissal plus immediate priorities/queue verification.
- Player did that exact send, cleared the queue, then advanced turns. Latest
  player tail shows ordinary unit movement, reviewed `UNIT_ATTACKED`
  dismissal, advisor-warning closeout, and turn 21 progress.
- Supervisor independently confirmed the lane: the P0 live notification block
  appears resolved; broader CLI check was still being run in the supervisor
  thread at last read.
- Watcher began thinking about the next low-risk support lane after a turn-22
  ready Scout read: promote official movement preview/reachable/path context
  before agents guess ready-unit moves. Treat this as a candidate, not a
  mandate; reground live state first.

2026-06-02 01:55 EDT:

- Supervisor reprioritized after `5024a52bd`: panel-route gates passed
  (`git diff --check HEAD~1..HEAD`, focused direct-control regression,
  direct-control check, `check:cli`), and play consumed the handoff safely.
- Relationship/city-state/suzerain authority is the next higher-risk lane.
  Formation snapshot now returns neutral `otherOwnerContacts` /
  `nearbyContacts` with explicit `relationship-unproven` policy metadata.
- Continue auditing `front-summary.ts` and other tactical posture surfaces for
  nearby labels like `nearby-opponents`; either add official relationship/team/
  war/suzerain reads or rename residual labels to neutral `other-owner` /
  `relationship-unproven` style language.
- Movement preview remains a useful ergonomic improvement but should not outrank
  relationship-proof cleanup unless live play makes it the material blocker.

2026-06-02 01:58 EDT:

- Stop request landed after watcher had already edited
  `packages/cli/src/commands/game/play/formation-snapshot.ts`.
- That inherited edit has since been superseded by the neutral formation
  snapshot surface: no `threats` alias, no `nearby-opponents` posture trigger,
  and explicit `relationship-unproven` policy metadata.
- Do not reintroduce stronger relationship labels without official
  relationship/team/war/suzerain evidence or validator proof.

2026-06-02 02:04 EDT:

- Fresh player tail supersedes the turn-22 movement posture as the immediate
  priority. Active hard stop is turn 23 / 3450 BCE,
  `NOTIFICATION_CHOOSE_CULTURE_NODE` id `{"owner":0,"id":46,"type":20}`.
- Player reports `choose-culture --send --closeout` validated/sent, then the
  documented `set-culture-target` fallback was tried once, but the same culture
  blocker stayed live and `end-turn --send` failed.
- Follow-on support must start with read-only live proof, then investigate the
  culture closeout owner. Do not mutate the player game from support, and do
  not advise repeated blind culture sends as progress.
- The inherited `formation-snapshot.ts` relationship cleanup is no longer dirty:
  the surface is neutralized and documented. Continue relationship authority
  cleanup in other tactical surfaces after live blockers are under control.
