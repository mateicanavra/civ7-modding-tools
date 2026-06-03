## Why

Live Civ7 play support accumulated useful fixes faster than the repo structure
could absorb them. The support stack now needs a systematic migration from
large CLI play tests and direct-control source concentration into stable,
reviewable command/test owners and direct-control atoms that future Effect/oRPC
procedures can compose.

The intended order is deliberate:

1. modularize CLI play command tests and ownership;
2. extract stable direct-control atoms and public types/constants behind package
   boundaries;
3. compose those atoms through Effect/oRPC only after the package boundaries are
   real.

This change replaces one-off extraction cadence with a systematic OpenSpec
workstream and parallel lanes.

## Target Authority Refs

- `AGENTS.md`
- `packages/cli/AGENTS.md`
- `packages/civ7-direct-control/AGENTS.md`
- `docs/projects/civ7-direct-control/workstream/support-dra-takeover-reference.md`
- `docs/projects/civ7-direct-control/workstream/play-agent/hotseat-phase-packet.md`
- `.agents/skills/civ7-systematic-workstream/SKILL.md`
- `.agents/skills/civ7-open-spec-workstream/SKILL.md`
- `.agents/skills/civ7-architecture-authority/SKILL.md`
- `.agents/skills/civ7-operational-debugging/SKILL.md`

## What Changes

- Establish a systematic corpus of CLI play commands, tests, fixtures,
  direct-control runtime atoms, schemas/types/constants, and future composition
  surfaces.
- Continue CLI play test modularization through focused owner files under
  `packages/cli/test/commands/game/play/**`, with `test:cli:play` explicitly
  listing each suite.
- Build net-new focused suites and any named fixture helpers first, then remove
  equivalent coverage from `packages/cli/test/commands/game.play.test.ts`.
- Split direct-control runtime code only after tests and ownership boundaries
  are stable enough to prove behavior did not change.
- Treat Effect/oRPC as a later composition lane over direct-control procedure
  cores, not as a transport-first rewrite.

## Existing Completed Slices

These Graphite layers are implementation evidence for the test-modularization
lane, not proof that the full change is complete:

- `codex/support-dra-takeover-reference`
- `codex/extract-tactical-read-play-tests`
- `codex/extract-watch-play-tests`
- `codex/extract-topics-play-tests`
- `codex/extract-promotion-readiness-play-tests`
- `codex/extract-rehydrate-play-tests`
- `codex/extract-settlement-recommendations-play-tests`
- `codex/extract-ready-city-play-tests`
- `codex/extract-foldered-unit-move-preview-play-tests`
- `codex/extract-foldered-ready-unit-play-tests`
- `codex/extract-notification-queue-play-tests`
- `codex/extract-dismiss-notification-queue-play-tests`

## Requires

- `civ7-systematic-workstream` skill present in the support stack with review
  fixes from `codex/systematic-skill-review-fixes`.
- Current support worktree clean before each lane starts.
- Named user-note stashes remain preserved until deliberately dispositioned.
- Gameplay remains parked unless the player resumes play.
- Parallel agents must use disjoint write sets. Worktrees are allowed, but
  Graphite stack mutation must stay simple and local to the current support
  stack.

## Enables Parallel Work

- Net-new CLI test/file creation can proceed ahead of monolith removals when
  test names and fixture ownership are unique.
- Direct-control atom planning can inventory module boundaries while CLI test
  extraction continues, but runtime source edits wait for stable test owners.
- Review agents can audit OpenSpec tasks, ownership scans, and proof claims in
  parallel with implementation lanes.
- Agents may work in separate worktrees or in one visible worktree only when
  their write sets do not overlap. One owner at a time controls
  `package.json` play-script wiring and `packages/cli/test/commands/game.play.test.ts`.

## Affected Owners

- `packages/cli/src/commands/game/play/**`
- `packages/cli/test/commands/game.play.test.ts`
- `packages/cli/test/commands/game.play*.test.ts`
- `packages/cli/test/commands/game/play/**`
- `packages/cli/test/commands/fixtures/**`
- `packages/civ7-direct-control/src/**`
- `packages/civ7-direct-control/test/**`
- `packages/civ7-control-orpc/**` only after direct-control atoms exist
- `openspec/changes/civ7-support-direct-control-modularization/**`
- `docs/projects/civ7-direct-control/workstream/**` when downstream packets are
  realigned

## Forbidden Owners

- Caller-local raw JavaScript strings for package-owned runtime reads/actions.
- CLI or Studio socket/session ownership that belongs in `@civ7/direct-control`.
- Broad barrels, `shared` buckets, or fixture catalogs without named owners.
- Effect/oRPC transport surfaces that bypass direct-control procedure cores.
- Relationship, enemy, hostile, opponent, war, ally, or suzerain labels without
  official relationship/team/war/suzerain evidence.
- Generated artifacts, logs, deployed Mods folders, or official resource outputs
  as edit surfaces.

## Stop Conditions

- A lane needs runtime behavior proof and Civ7 is unavailable; mark
  `pending-runtime-proof` instead of claiming closure.
- A proposed shared helper hides command ownership or duplicates monolith
  coverage.
- A direct-control extraction changes public behavior before focused tests exist.
- A review finds relationship/suzerain labels beyond official evidence.
- Dirty scope includes user/control notes or unrelated files without a named
  stash/disposition.
- A parallel lane needs to restack or mutate unrelated Graphite stacks.

## Consumer Impact

Reviewers get smaller, owner-aligned Graphite layers. Future support agents get
stable direct-control atoms and focused tests instead of relying on a monolith
or ad hoc live-play fixes. Effect/oRPC work gets a composable server-side core
rather than raw command tunneling.

## Verification Gates

- `git diff --check`
- Focused suite for each owner lane
- Adjacent monolith filter proving removed coverage still has neighboring
  command support
- `bun run check:cli`
- `bun run test:cli:play`
- `bun run --cwd packages/civ7-direct-control test/check/build` for
  direct-control source lanes
- `bun run openspec -- validate civ7-support-direct-control-modularization --strict`
- Ownership scans for moved command names, moved test names, fixture ownership,
  and relationship-label invariants
- Clean final status and Graphite commit with separate subject/body
