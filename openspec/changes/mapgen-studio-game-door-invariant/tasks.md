## 1. Frame

- [x] 1.1 Re-ground S4.1 in `docs/projects/studio-runtime-simplification/PLAN.md`
      and the open `mapgen-studio-tuner-session` change.
- [x] 1.2 Confirm clean Graphite branch `codex/game-door-invariant` from current
      `main`.
- [x] 1.3 Start watcher lane Rawls
      `019ec217-32d7-7561-9b52-768885b9fed8`.

## 2. Implementation

- [x] 2.1 Add the Habitat-style game-door invariant document.
- [x] 2.2 Add the production-source guard test for
      `Civ7DirectControlSession` construction.
- [x] 2.3 Migrate `packages/studio-server/src/contract/*` success I/O schemas
      from Zod to TypeBox/Standard Schema.
- [x] 2.4 Preserve former Zod request defaults in router logic.
- [x] 2.5 Close `mapgen-studio-tuner-session` deferred tasks with invariant and
      deferral records.
- [x] 2.6 Update stale coexistence / Save&Deploy identity comments.
- [x] 2.7 Remove the direct `zod` dependency from `@civ7/studio-server`.

## 3. Verification

- [x] 3.1 Strict-validate this OpenSpec change.
- [x] 3.2 Strict-validate `mapgen-studio-tuner-session`.
- [x] 3.3 Run all OpenSpec validation.
- [x] 3.4 Run focused and full studio-server package checks/tests/build.
- [x] 3.5 Run focused and full mapgen-studio app checks/tests/build.
- [x] 3.6 Run negative searches for orphaned runtime simplification symbols,
      unsanctioned session construction, and contract Zod imports.

## 4. Closure

- [x] 4.1 Record watcher findings and dispositions.
- [x] 4.2 Record verification evidence and downstream realignment.
- [x] 4.3 Submit the S4.1 Graphite branch as the final runtime simplification
      stack layer.
- [x] 4.4 Audit the full runtime simplification program before marking the
      overarching goal complete.
