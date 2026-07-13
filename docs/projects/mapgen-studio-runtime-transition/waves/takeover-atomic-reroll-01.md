# A.3a Atomic Reroll

```json
{"unit":"A3A-ATOMIC-REROLL","base":"171ee61ce0c1c055d4b96f0e4a3831c54fd3773a","state":"sealed-local-graphite-layer","objective":"one reroll command authors and submits one exact revision once with Auto-run off or on","implementationOwner":"/root/a3a_product_census_01/a3a_implementation","reviewRoles":["typescript-state-space","architecture-authority","product-runtime-library"],"remoteMutation":false}
```

## Decision

Source mapping found no A.2 dependency. A.3a follows the two sealed Habitat
capability prerequisites and precedes A.2 Authority and its six domain slices.
The preserved A.2 worktree contains no Studio implementation hunk to transplant.

`reroll` currently authors revision N+1 but submits through a render closure that
records revision N. Auto-run therefore treats the same command as an unsubmitted
change after the first run finishes. The repair binds the fresh seed and the
revision produced by the synchronous store mutation into one private run target.
The existing Auto-run state machine then recognizes that revision as submitted;
no suppression flag, second pending state, alternate command path, or A.2 surface
is introduced.

The browser-running keyboard gate mismatch is a separate command-parity concern.
This unit does not widen into it because it neither causes nor blocks the
revision-snapshot repair.

## Exact Write Set

```text
apps/mapgen-studio/src/app/hooks/useBrowserRun.ts
apps/mapgen-studio/test/controllers/useBrowserRun.test.tsx
docs/projects/mapgen-studio-runtime-transition/NEXT-PACKET.md
docs/projects/mapgen-studio-runtime-transition/cleanup-register.jsonl
docs/projects/mapgen-studio-runtime-transition/gate-register.jsonl
docs/projects/mapgen-studio-runtime-transition/packet-a2-domain-operation-topology.md
docs/projects/mapgen-studio-runtime-transition/verification-ledger.md
docs/projects/mapgen-studio-runtime-transition/waves/takeover-atomic-reroll-01.md
```

## Behavior Oracle

- Idle reroll persists one fresh seed and submits that revision exactly once
  with Auto-run disabled or enabled.
- The enabled case remains at one start after the runner enters and leaves its
  running state; an initial dispatch count alone is not acceptance.
- Run in Game and Save/Deploy refusal remains zero-write and zero-start.
- An ordinary authoring edit still produces one debounced Auto-run.
- Selection retention and explicit Run behavior remain on their existing path.

## Proof

The two-path implementation is integrated. `reroll` persists the new seed,
reads the resulting synchronous store revision, and submits that complete target
through the existing runner. The internal starter accepts either the complete
target or no override; the unused public starter surface is deleted.

- Focused hook test: 8/8 passed, including Auto-run off, running-to-terminal
  Auto-run reconciliation, ordinary debounce, and busy refusal.
- `mapgen-studio:check`, 59-file/312-test `mapgen-studio:test`, and the uncached
  26-dependency production Vite build passed.
- `habitat:boundaries` passed. The aggregate 122-rule Habitat sweep retained
  eight sealed-base exterior rows plus one `docs/system`-only row. Every
  Studio-specific authority and topology rule passed.
- Workspace hygiene retained exactly seven pre-existing React-hook policy
  findings, all on unchanged lines introduced by `558b8048e6`; the changed
  test is clean and the candidate introduced no Habitat finding.
  Diff hygiene passed and generated build outputs produced no tracked drift.

The three-role exact-object review passed. Record-currentness review and the
local Graphite seal remain pending.

## Review

Fresh TypeScript/state-space, architecture/authority, and
product/runtime/library sessions reproduced digest
`2c6b4ce77704978555d3c742296c9b9524ec9a12b46ffac4c295a82077ee43ec`
before and after review. All three returned no P0-P3 finding. TypeScript and
product independently reran the 8-test hook suite; product also verified that
the real runner's synchronous `running` transition matches the tested
false-to-true-to-false contract.

## Authority Closeout

```json
{"digest":"f8cb542a2327b9de0af3439da67d4776cd5c322e5824168cdf9564d2ce7e9b6e","roles":{"architecture-authority":"pass"},"p0p3":0,"deltaFromReviewedFreeze":"four current record blobs only","authorizedMutation":"exact eight-path local Graphite seal plus terminal receipt updates in those four records"}
```

## Seal

```json
{"branch":"codex/mapgen-studio-atomic-reroll","parent":"171ee61ce0c1c055d4b96f0e4a3831c54fd3773a","initialCreate":"d6b5f33aa887c3d5178b05140cf2cf857823c40c","paths":8,"preCreateDigest":"eab2ca44565985b61775785aacd158ed6f4bbd59f79f8aba17d3bf7c6f3b5612","preCreateTree":"1a363fcb145cc2a420f06da2823b867aae13d7a6","receiptAmendment":"four terminal record blobs only","remoteMutation":false}
```

Exact staging and the initial Graphite commit matched the eight-path manifest.
Only this terminal receipt, the live ledger, the gate receipt, and lease closure
were amended afterward. Final identity is the observed branch ref because a
commit cannot contain its own amended hash. No submit, push, sync, restack,
merge, PR, or remote mutation ran.
