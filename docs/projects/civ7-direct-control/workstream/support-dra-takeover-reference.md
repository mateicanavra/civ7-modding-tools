# Support DRA Takeover Reference

## Frame identity

Frame name: support-DRA atomization frame
Built by: Codex
For situation: takeover from the Civ7 live-play support/watch DRA into an ongoing support/refiner/builder role.
Built when: 2026-06-02
Mode: frame-discovery with audience-export
Object-path: objective

## Scope and provenance

In scope:

- Live-play support authority for the player agent when play is active.
- The transition from accumulated play-support fixes into stable CLI and direct-control atoms.
- The proof discipline for test-only, runtime-read, and mutation-facing support work.
- The near-term Graphite stack around CLI play modularization and direct-control atom extraction.

Out of scope:

- Waking or steering the parked play thread while gameplay is not resumed.
- Foregrounding Studio HTTP/RPCLink or generic web transport before direct-control atoms and package boundaries are real.
- Treating stale live snapshots, sibling mods, generated output, or dirty transient notes as current authority.
- Multiple-Civ-client architecture for playable-AI support.

Source pointers:

- Takeover target thread: `019e86cb-4f67-79b1-9881-ddf6dde1a2aa`.
- Supervisor thread: `019e859d-03d6-7cb3-aff3-b8de9c830f52`.
- Parked play thread: `019e85d9-063f-7270-b055-5d036e547af0`.
- Support worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-watch-civ7-live-play-reference-assembly`.
- Accepted support HEAD at takeover: `fe70c90fc test(cli): extract progression read play tests`.
- Immediate prior accepted layer: `04770bf93 test(cli): extract unit target play tests`.
- Current goal thread worktree had inherited dirty docs; at least one untracked launch note was corrupt and is not source authority.

## WHAT

This frame treats the support DRA as a player-unblocking authority whose durable product is a set of small, owned control atoms. The primary signal is not the next available patch or the next transport surface; it is whether a live blocker can be honestly read, classified, cleared, and proven through repo-owned CLI/direct-control behavior. The frame selects modularization, atom ownership, proof boundaries, and Graphite hygiene as the work surface. It keeps transport exposure, Studio integration, and stale play-state narratives exterior until direct-control atoms are stable enough to compose.

## WHY

The prior support arc proved that player-unblocking fixes can accumulate faster than ownership boundaries if every live blocker becomes a local patch. A transport-first oRPC frame would make that worse by wrapping unstable surfaces. A pure live-patch frame would keep the player moving for a while but preserve structural debt. This frame keeps the player-unblocking authority while using each stable lesson to retire debt into direct-control atoms that can later be composed through Effect/oRPC without tunneling raw runtime strings or caller-owned session state.

## Construction history

Structural alternative considered:

- Transport-first control API: build oRPC/Studio procedure surfaces now and make CLI use them.

Why rejected or demoted:

- The current branch already proves some oRPC shape exists, but the support stack still needs module ownership, CLI/test extraction, direct-control public-surface shrinkage, command-source organization, closeout/postcondition helpers, and schema/type ownership. Transport should mount after those atoms are coherent.

Perspective and discovery passes used:

- Prior DRA behavior: small Graphite layers, proof-gated test extraction, no play-thread wake while parked.
- Supervisor acceptance notes: focused ownership scans, adjacent monolith filters, `check:cli`, `test:cli:play`, clean status.
- Repo authority: root `AGENTS.md`, `packages/cli/AGENTS.md`, Civ7 architecture/operational/oRPC skills, Graphite workflow.

## Selection commitments

In:

- Disk-first re-grounding on every pass: branch, stack, HEAD, dirty state, and canonical play-suite shape.
- Small, reviewable Graphite layers.
- CLI play command hierarchy and test ownership.
- Direct-control atom extraction, public-surface reduction, runtime command-source ownership, and postcondition helpers.
- Runtime proof only when a runtime/control behavior changes and Civ is responsive.

Foreground:

- Proof labels: local tests prove local behavior; live read-only smoke proves current runtime observation; mutation proof requires support-owned real-game evidence or explicit pending-runtime-proof.
- No-repeat-after-unverified semantics for mutation-facing commands.
- Relationship/city-state/suzerain neutrality unless official relationship, team, war, suzerain, or equivalent evidence proves stronger claims.
- Effect/oRPC as typed composition over repo-owned capabilities, not as raw JS-string routing or a generic control tunnel.

Exterior:

- Play-thread verification while gameplay is parked.
- Direct UI control, raw runtime pokes, fallback-as-default paths, and repeated sends when verification is suspect.
- Scenario catalogs, brittle structure checks, barrels/shims hiding ownership, or duplicated monolith coverage.
- Dirty transient docs or stale launch notes as source authority.

## Hard core and protective belt

Hard core:

1. Preserve live player-unblocking authority, but do not convert every blocker into permanent structural debt.
2. Move from modularization to stable direct-control atoms to Effect/oRPC composition, in that order.
3. Ground each pass from current disk, Graphite, thread, and runtime reality rather than inherited narrative.
4. Keep proof boundaries honest and explicit across local tests, read-only runtime observation, and mutation proof.
5. Keep relationship labels neutral unless official relationship/team/war/suzerain evidence proves stronger status.

Protective belt:

- The exact next slice can change after re-grounding.
- Test-only layers do not require live mutation proof.
- Runtime/control layers can close with pending-runtime-proof only when Civ is unavailable and the pending state is explicit.
- oRPC procedure maps can be drafted as alignment artifacts, but implementation should compose stable atoms rather than drive architecture.
- Supervisor/watch threads are evidence sources; they do not override disk.

## Reframe conditions

What would force a reframe:

If a live player blocker becomes active and current CLI/direct-control surfaces cannot read or classify it honestly, the foreground shifts temporarily from modularization to blocker-specific support until a deterministic CLI path or explicit postcondition classification exists.

Degeneration trigger:

Run a reframe diagnostic before the next work slice if any two consecutive layers add wrappers, generic fixtures, transport surfaces, or caller obligations without reducing ownership ambiguity or improving proof quality.

## Composition and assumptions

Perspectives composed:

- Player support: unblock turns through CLI-only, deterministic, evidence-returning commands.
- Architecture authority: ownership first, generated artifacts and current code as evidence, not target architecture.
- Operational debugging: runtime claims require fresh runtime observation and proof labels.
- Graphite workflow: one logical layer per branch, clean status, separated subject/body, stack-aware commits.

Assumptions committed:

- Gameplay is parked until the user resumes it.
- The support worktree at `fe70c90fc` is the clean current implementation baseline for ongoing test modularization.
- The current main checkout's dirty docs are inherited evidence and should not be bulk-staged without separate review.
- The desired end state remains playable AI support inside a single Civ7 experience, but immediate work is the support-control substrate.

## Successor goal text

Use this as the next goal text after this takeover/reference goal is complete. It is intentionally under 4000 characters including whitespace.

```text
Take over as the Civ7 support DRA/refiner/builder from current disk, not inherited narrative. Objective: preserve player-unblocking authority while retiring accumulated play-support fixes into stable direct-control atoms, then compose those atoms through Effect/oRPC only once module boundaries are real. This is not "ship oRPC first" and not "patch blockers forever".

Re-ground every pass from current reality: support worktree branch/HEAD, Graphite stack, dirty state, canonical `test:cli:play`, supervisor thread `019e859d-03d6-7cb3-aff3-b8de9c830f52`, stopped support-DRA thread `019e86cb-4f67-79b1-9881-ddf6dde1a2aa`, active support docs, and live read-only CLI/direct-control state only when runtime proof matters. Treat prior live/play history as evidence, never as current state.

Foreground lane: modularization -> stable direct-control atoms -> Effect/oRPC composition. Current seams include CLI play command hierarchy, focused test ownership, direct-control public surface and large `index.ts`, tuner command-source organization, closeout/postcondition helpers, schema/type ownership, and runtime atoms future procedures can compose. Keep slices small, reviewable, and Graphite-committed. Prefer categorical tests and repo tooling over repeated-instance tests, broad scenario catalogs, brittle structure checks, or barrels/shims that hide ownership.

Live hard blockers preempt only when the player resumes play. Gameplay is parked now: do not wake, steer, or ask play thread `019e85d9-063f-7270-b055-5d036e547af0` to verify support work. When play resumes, re-read HUD/queue/Tuner state fresh, prioritize the current blocker, and build deterministic CLI paths that clear through proven native routes or return honest postcondition classifications. CLI only: no direct UI control, raw runtime pokes, fallback-as-default paths, or repeated sends after suspect verification.

Proof boundaries are load-bearing. Test-only modularization closes on local gates: `git diff --check`, focused suite, adjacent monolith filter, `bun run check:cli`, `bun run test:cli:play`, ownership scan, clean status, and durable Graphite commit message. Runtime/control changes require support-owned real-game proof when Civ is responsive, or explicit pending-runtime-proof when unavailable. Mutation-facing work requires approval, validator-first behavior, no-repeat-after-unverified semantics, and postcondition evidence.

Effect/oRPC is a composition layer over repo-owned direct-control capabilities: typed procedures, context, middleware, error shaping, correlation IDs, approval gates, TypeBox schema artifacts, and server-side procedure cores. Do not make it raw JS-string routing, generic control tunneling, caller-owned socket/session state, or transport-first architecture. Studio/web transport follows only after the shared procedure core is worth exposing.

Relationship/city-state/suzerain policy is invariant: neutral by default unless official relationship/team/war/suzerain evidence proves stronger claims. Owner mismatch, proximity, contact, visibility, or hidden facts are not enough for hostile, enemy, non-friendly, opponent, threat, war, or suzerain labels.

Would force a reframe: raw JS literals or string-parsed control surfaces; transport driving architecture before boundaries exist; relationship claims without official evidence; live blocker claims from stale shell/App UI/crash state instead of fresh in-game Tuner/HUD reads; dirty work, folded commit messages, missing focused tests, duplicated monolith coverage, or unproved runtime behavior changes.
```

## Handoff posture

Start the successor run by checking:

- `git status --short --branch`
- `gt ls`
- `git log -5 --oneline --decorate`
- `package.json` `test:cli:play`
- latest supervisor/support thread tails

Then choose the next bounded slice only after the active branch and dirty state are clean enough to own. The next likely lane is another focused CLI play modularization or a direct-control atom extraction, but the slice must be selected from current disk after re-grounding.

## NOT HOW

This document is a frame and takeover reference, not a work plan. It intentionally does not prescribe the next code edit.
