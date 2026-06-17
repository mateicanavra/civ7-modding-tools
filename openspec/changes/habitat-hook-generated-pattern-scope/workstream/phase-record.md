## Phase Record

## Current Checkpoint

Implementation is locally committed for hook-owned generated pattern scope and
is pending supervisor review.

The checkpoint routes staged pre-commit Grit work through the Habitat check
engine, filters staged Grit rules to `hookScope: "pre-commit"`, and preserves
exact staged JavaScript/TypeScript paths inside approved Grit adapter roots.

## Proof Boundary

Accepted proof target for this checkpoint:

- staged hook Grit selection consumes explicit rule-pack hook-scope metadata;
- staged Grit scan roots stay exact and approved;
- JavaScript/TypeScript paths outside approved Grit roots are excluded from Grit
  hook scans while retaining Biome staged behavior;
- normalized Grit adapter parser failures and findings remain fail-closed in
  the hook path.

Non-claims:

- no CI authority proof;
- no product/runtime proof;
- no baseline mutation or shrink proof;
- no HG row semantic proof;
- no generated pattern semantics proof;
- no claim that metadata alone activates generated hooks.

## Verification

- `bun run --cwd tools/habitat-harness test -- hooks.test.ts rule-selection.test.ts`
  passed locally: focused unit behavior for hook delegation, hook-scope
  filtering, exact staged scan roots, outside-root exclusion, parser failure,
  and findings.
- `bun run --cwd tools/habitat-harness check` passed locally.
- `bun run openspec -- validate habitat-hook-generated-pattern-scope --strict`
  passed locally.
- `bun run openspec:validate` passed locally.
- `bun run habitat hook pre-commit` passed locally from the current worktree
  with clean resources and no staged supported files.
- `git diff --check`, deleted-file guard, and probe-residue checks passed
  locally.
- Controlled staged current-tree proof:
  - staged
    `packages/mapgen-core/src/core/supervisor-hook-generated-scope-probe.ts`
    containing `GameplayMap.getGridWidth();`;
  - `bun run habitat hook pre-commit` exited 1 after resources, file-layer,
    Biome format, and Biome check passed;
  - the hook invoked the normalized staged Habitat Grit check,
    `habitat check --staged --tool grit-check --json`;
  - the CheckReport selected hook-scoped Grit rules and reported
    `grit-mapgen-core-runtime-civ7` as the failing rule on the exact staged
    probe path, with `baseline-integrity` passing;
  - the temporary staged probe was unstaged and removed, leaving no scratch
    file residue.

Remaining before checkpoint closure:

- supervisor acceptance or bounded repair request.
