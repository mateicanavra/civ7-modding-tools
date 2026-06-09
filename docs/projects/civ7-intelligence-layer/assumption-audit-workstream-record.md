# Civ7 Intelligence Assumption Audit Workstream Record

Status: completed-draft.
Branch: `codex/investigate-civ7-intelligence-threads`.
Date: 2026-06-03.
DRA: Codex.

This record captures the follow-up audit that challenged the first solution
frame after the App UI `globalThis` proof was corrected.

2026-06-03 supersession note: the later live App UI/Tuner parity probe promoted
the game-scoped App UI controller from target direction to baseline
implementation candidate for proven direct-control reads and validators. A later
substrate correction also supersedes the "external-only oRPC" finding: the
active design uses oRPC/Effect for the in-game controller service, the external
direct-control bridge API, and future internal AI intelligence services. Keep
this record as historical audit input; the active workstream is
`workstream/direct-control-game-controller-bridge/`.

## Frame

- Objective: repair the Civ7 intelligence-layer solution docs by challenging
  assumptions around App UI, Tuner, mod loading, raw direct-control execution,
  companion API shape, and unnecessary bridge-shaped architecture.
- Future state: a typed, safe, live AI influence model with two authority
  sides: external live play through `@civ7/direct-control`, and native policy
  shaping through generated static profiles. A game-scoped App UI controller is
  subordinate to live play, not a third authority lane.
- Non-goals: live mutation probes, arbitrary JavaScript as the product API,
  Tuner-resident deployed API claims, and broad service naming that hides the
  existing direct-control owner.
- Hard core: direct-control owns runtime transport, approval, validation, and
  wrapper promotion; generated profiles own native AI policy artifacts;
  evidence labels and proof ladders decide promotion.
- Exterior: raw socket framing outside direct-control, debug DB writes as
  control, companion-owned gameplay sends, and claims that `UIScripts` imply
  Tuner deployment.
- Falsifier: a supported in-game controller path proves it can own external
  model I/O, durable lifecycle, action safety, and outcome proof without
  direct-control supervision.
- Redesign trigger: project-owned game-scoped controller passes lifecycle proof and
  can safely execute exact approved helper actions with stronger semantic
  postconditions than current external wrappers.

## Status

- Last updated: 2026-06-03.
- Current gate: synthesis and doc repair.
- Next gate: direct-control game controller bridge lifecycle and parity proof.
- Blocked by: no blocker; mutating/runtime gates intentionally deferred.
- Stop condition: docs separate evidence from architecture direction, peer
  reports exist, raw/bridge overclaims are eliminated, verification passes, and
  Graphite state is clean.

## Repo State

- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/civ7/civ7-modding-tools`.
- Branch: `codex/investigate-civ7-intelligence-threads`.
- Parent branch: `codex/shape-civ7-intelligence-solution`.
- Stack position: top of current Civ7 intelligence docs stack.
- Dirty files and owner: docs and copied `.agents/skills/civ7-systematic-workstream/`
  are owned by this audit.
- Protected paths: generated artifacts, active Civ7 game data, and deployed
  mod/log folders were read-only evidence.
- Generated/read-only paths: `.civ7/outputs/resources`, local Civ7
  `Application Support` data, `dist`, and deployed `mod` outputs.

## Team

Peer lanes:

- Planck: script-loading, App UI/Tuner, `UIScripts`, map scripts, and lifecycle
  assumptions.
- Mencius: architecture simplification, ownership naming, and bridge complexity.
- Erdos: direct-control, hotseat, raw `game exec`, approval, and postcondition
  assumptions.
- Descartes: API contract, oRPC placement, envelope shape, and allowed methods.

Reports:

- [agent-reports/assumption-audit-script-contexts.md](agent-reports/assumption-audit-script-contexts.md)
- [agent-reports/assumption-audit-architecture-simplification.md](agent-reports/assumption-audit-architecture-simplification.md)
- [agent-reports/assumption-audit-direct-control-hotseat.md](agent-reports/assumption-audit-direct-control-hotseat.md)
- [agent-reports/assumption-audit-api-contract.md](agent-reports/assumption-audit-api-contract.md)

## Findings

1. The game-scoped App UI controller is not a peer authority surface. It is a
   subordinate in-game endpoint attached to the live direct-control side.
2. The architecture should be two-sided: live external control through
   direct-control, and static native policy shaping through generated profiles.
   Corpus, proofs, and metrics cut across both.
3. Superseded by later live parity proof: a full game-scoped App UI controller
   is now the baseline implementation candidate for proven reads and validators,
   but it still does not remove lifecycle, safety, approval, action legality,
   hotseat, age-transition, or outcome proof.
4. `UIScripts` can expose callable globals in App UI game context. That does
   not prove shell-wide availability or Tuner-resident deployment.
5. `swooper-maps` is map/import prior art, LF yields preview is App UI
   public-API prior art, and RHQ is static database/profile prior art.
6. Superseded by later substrate decision: oRPC/Effect is the shared service
   substrate for the in-game controller, external direct-control bridge API, and
   future internal AI intelligence services. The App UI global is a bounded
   serialized ingress adapter into an in-process callable router, not a custom
   JSON-envelope product API.
7. Raw `game exec` is debug/probe power below the product contract, not an
   agent-facing API.
8. Current direct-control operation wrappers prove validation/send discipline,
   but not every wrapper proves a rich semantic outcome delta. Action records
   must distinguish validation, send receipt, post-validation, and outcome
   proof.
9. `localStorage` queueing is a probe or reload mirror, not the first baseline
   now that synchronous App UI RPC is plausible.

## Proof Gates

- Local stats: static docs/code/mod/log inspection only; no live mutation.
- Generated/deploy proof: still required for a project-owned companion
  `UIScripts` mod.
- Runtime proof: shell absent, game present, reload/restart recovery, save/load,
  turn changes, and Tuner absence must be proven explicitly.
- Product proof: direct-control wrapper calls the endpoint through a typed
  product procedure; endpoint returns bounded JSON; action helpers remain
  disabled until exact approval and semantic postconditions exist.
- Closure boundary: docs can choose this architecture now; implementation must
  still pass the disposable proof sequence before product promotion.

## Outcome

The repaired frame is:

```text
strategy director -> choose authority side -> direct-control live action
                                      \-> static profile compiler

direct-control live action -> game-scoped App UI controller
                              for proven reads, validators, display, snapshots,
                              acks, probes, and later exact approved helpers
```

The key simplification is ownership: direct-control remains the runtime owner;
the game-scoped controller is in-game machinery under that owner until it proves
it can safely assume more.
