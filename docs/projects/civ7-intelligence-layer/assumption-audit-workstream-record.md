# Civ7 Intelligence Assumption Audit Workstream Record

Status: completed-draft.
Branch: `codex/investigate-civ7-intelligence-threads`.
Date: 2026-06-03.
DRA: Codex.

This record captures the follow-up audit that challenged the first solution
frame after the App UI `globalThis` proof was corrected.

## Frame

- Objective: repair the Civ7 intelligence-layer solution docs by challenging
  assumptions around App UI, Tuner, mod loading, raw direct-control execution,
  companion API shape, and unnecessary bridge-shaped architecture.
- Future state: a typed, safe, live AI influence model with two authority
  sides: external live play through `@civ7/direct-control`, and native policy
  shaping through generated static profiles. A companion App UI endpoint is
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
- Redesign trigger: project-owned companion endpoint passes lifecycle proof and
  can safely execute exact approved helper actions with stronger semantic
  postconditions than current external wrappers.

## Status

- Last updated: 2026-06-03.
- Current gate: synthesis and doc repair.
- Next gate: disposable companion endpoint proof.
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

1. The companion App UI endpoint is not a peer authority surface. It is a
   subordinate in-game endpoint attached to the live direct-control side.
2. The architecture should be two-sided: live external control through
   direct-control, and static native policy shaping through generated profiles.
   Corpus, proofs, and metrics cut across both.
3. A full in-game controller would reduce repeated transport verification, but
   it would not remove lifecycle, safety, approval, action legality, hotseat,
   age-transition, or outcome proof. It should be a target direction, not the
   current baseline.
4. `UIScripts` can expose callable globals in App UI game context. That does
   not prove shell-wide availability or Tuner-resident deployment.
5. `swooper-maps` is map/import prior art, LF yields preview is App UI
   public-API prior art, and RHQ is static database/profile prior art.
6. oRPC is the right external direct-control boundary. The App UI global should
   be a small custom JSON-envelope RPC with method allowlists and typed errors.
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

direct-control live action -> optional companion App UI endpoint/controller
                              for display, snapshots, acks, probes, and later
                              exact approved helper execution
```

The key simplification is ownership: direct-control remains the runtime owner;
the companion endpoint is in-game machinery under that owner until it proves it
can safely assume more.
