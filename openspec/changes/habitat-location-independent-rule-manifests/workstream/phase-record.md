# Phase Record: Habitat Location-Independent Rule Manifests

## State

- Status: implementation complete; final proof and P2 repair proof passed;
  Graphite commit created as this branch closure.
- Worktree:
  `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-habitat-authority-tree-pruning-frame`.
- Branch: `codex/habitat-location-independent-manifests-impl`.
- Commit subject: `feat(habitat): make rule manifests location independent`.
- Parent: Graphite stack child above the Habitat domino sequence branch.
- OpenSpec change:
  `openspec/changes/habitat-location-independent-rule-manifests`.

## Objective

Implement the location-independent manifest contract for Habitat live rules:
`rule.json` is the explicit inventory manifest for stable identity, current
placement, runner file references, and consumed artifacts. Habitat discovers
`.habitat/**/rule.json` manifests and no longer derives live rule identity or
execution from the current packet directory grammar.

## Authority Order

1. Direct current user instructions.
2. Root `AGENTS.md` and repo process docs.
3. `.habitat/FRAME.md` and `.habitat/dominoes.md`.
4. Current Habitat code/tests as evidence.
5. OpenSpec records as downstream implementation-control artifacts.

## Skills Applied

- `habitat:systematic-workstream`
- `dev:refactor-typescript`
- `cognition:solution-design`
- `cognition:system-design`
- `dev:api-design`
- `cognition:investigation-design`
- `civ7-open-spec-workstream`

## Implementation Evidence

- The live corpus contains 124 `.habitat/**/rule.json` manifests.
- Every live manifest now declares `schemaVersion`, `id`, `title`, `placement`,
  and explicit `runner` facts.
- Service and Nx registry loading use the same manifest contract.
- Baseline current-state resolution uses manifest `artifacts.baseline`; bounded
  merge-base fallback exists only for historical pre-manifest baseline reads.
- Artifact routing joins changed files to manifest, runner, and artifact refs
  instead of packet path regexes.
- Pattern apply admissions and docs apply diagnostics now use loaded grit rule
  facts and explicit manifest runner file references rather than hard-coded
  current-tree pattern paths.
- Packet path derivation code and packet-grammar registry tests were removed.

## Review Plan And Disposition

First-wave review agents:

| Lane | Status | Required output |
| --- | --- | --- |
| Manifest/API contract | complete | No P1/P2 blockers after repair; residual baseline and placement risks recorded. |
| Current-code coupling | complete | Path/sibling dependencies, baseline roots, artifact routing, Nx, hooks, generators, tests, and closure scans recorded. |
| OpenSpec/workstream shape | complete | P2 findings repaired with validation matrix, repo-relative commands, and non-claims. |
| Refactor/system pressure | complete | Corpus ledger gate, selector boundary, compatibility-ladder guard, and exhaustive dispatch requirements recorded. |

Accepted P1/P2 findings block this planning branch until repaired or rejected
with source evidence.

Implementation review agents:

| Lane | Status | Required output |
| --- | --- | --- |
| Hidden path coupling / runtime review | complete | Two P1 findings accepted and repaired: apply-pattern admission hard-code and docs-apply manifest bypass. |
| Proof ledger / stale record review | complete | Stale planning records and stale project docs identified; this closure update repairs the records and stale matrix row. |

Accepted implementation P1/P2 findings block closure until repaired and
revalidated.

## Validation Results

| Gate | Status | Evidence | Non-claims |
| --- | --- | --- | --- |
| Formatter | passed with warnings | `bun run biome:format` formatted touched files; Biome warned about an existing broken `.grit/patterns` symlink and oversized generated execution-surface JSON. | Formatter warnings were pre-existing workspace shape issues, not this manifest contract proof. |
| `git diff --check` | passed | Fresh closure command on implementation branch. | Whitespace proof only. |
| `bun run --cwd tools/habitat check` | passed | TypeScript check passed with `tsc -p tsconfig.json --noEmit`. | Does not prove runtime Grit/Nx behavior. |
| `bun run --cwd tools/habitat test` | passed | Full Habitat test suite passed: 35 files, 324 tests. | Does not prove future physical authority-tree moves by itself; location-independence behavior is covered by targeted tests in the suite. |
| `bun run openspec -- validate habitat-location-independent-rule-manifests --strict` | passed | OpenSpec change validation passed. | Does not prove code behavior by itself. |
| Focused tests after final apply/docs-apply repair | passed | `bun run --cwd tools/habitat test -- test/rules/pattern-views.test.ts test/lib/pattern-apply.test.ts test/service/fix-service.test.ts test/lib/grit-provider.test.ts` passed 54 tests. | Does not replace full suite proof. |
| Focused tests after final P2 repair | passed | `bun run --cwd tools/habitat test -- test/rules/registry/manifest-contract.test.ts` passed 6 tests; the full suite was rerun afterward and passed 35 files / 324 tests. | Does not rerun runtime checks by itself; runtime proof remains the earlier closure runtime proof on this implementation branch. |
| `bun run habitat -- check --runner grit --json` | passed | Runtime Grit check exited 0 with `ok: true`; advisory docs portability findings remain advisory. | Does not claim scratch docs are cleaned of historical absolute paths. |
| `bun run habitat -- check --runner habitat --json` | passed | Runtime Habitat-native check exited 0 with `ok: true`. | Does not rename `pathCoverage` or `scanRoots`. |
| `bun run habitat -- check --runner nx --json` | passed | Runtime Nx-backed check exited 0 with `ok: true`. | Does not replace Nx as graph authority. |
| `bun run habitat -- check --json` | passed | All-runner runtime check exited 0 with `ok: true`; advisory docs portability findings remain advisory. | Does not claim ontology/admission redesign. |
| Closure scans | passed | Zero authored `ownerTool`/`detect`/registry `scope` fields in live manifests; zero packet `category.md` or prefixed role files; zero canonical `--tool` in live Habitat source/docs/package entrypoints; zero old generated-derived runner labels in the active compatibility matrix; zero ambiguous `pattern.md` + `check.*` packets; stale `.rule.json` handling remains rejection-only; old apply path appears only in a negative traversal test. | Historical project evidence/scratch docs may still mention old selectors or old packet paths as history, not current guidance. |

## Non-Claims

- This slice does not classify blueprint, niche, capability, or future admission
  authority.
- `placement` is inventory metadata that is true for now; it is not the future
  ontology contract.
- `pathCoverage` and `scanRoots` keep their current behavior and names.
- Rule files are still physically located in the current authority tree for now;
  the point of this slice is that future physical moves can preserve identity
  and behavior by keeping manifest refs correct.
- Historical baseline fallback is bounded to merge-base reads for old commits and
  is not live old-shape reader compatibility.

## Reset Contract

Final proof passed, the implementation review agents found no remaining P1/P2
blockers, and this branch has a clean Graphite commit.
