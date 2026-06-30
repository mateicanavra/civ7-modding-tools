# CI Classification

**Change:** `habitat-enforcement-surface-cleanup`
**Source:** `.github/workflows/ci.yml`

CI contains more than one proof class. After
`habitat-nx-worktree-state-contract`, the main `ci` job runs one root Nx
aggregate through `bun run ci`. Root `lint` inside that aggregate is the
graph-owned Habitat structural check lane because it runs
`nx run-many --targets=lint,habitat:check`. The `architecture-strict-core` job
is a stricter diagnostic lane plus Habitat JSON diagnostics capture; it is not
the root `verify` path.

## Current CI Steps

| Job | Step | Current command/action | Surface class | Current claim | Non-claim |
| --- | --- | --- | --- | --- | --- |
| `ci` | Checkout | `actions/checkout@v4` with submodules | setup | Source and submodules are present. | No Habitat structural rule proof. |
| `ci` | Guard against pnpm files | shell `find` guard | direct file hygiene gate | CI rejects pnpm files. | Does not replace Habitat file-layer staged proof. |
| `ci` | Setup Node | `actions/setup-node@v4` | setup | Node version selected. | No structural proof. |
| `ci` | Setup Bun | `oven-sh/setup-bun@v2` | setup | Bun version selected. | No structural proof. |
| `ci` | Cache Nx | `actions/cache@v4` | cache infrastructure | Nx cache may be restored. | Cache hit is not proof that Habitat selected real rules. |
| `ci` | Install dependencies | `bun install --frozen-lockfile` | dependency integrity gate | Lockfile install succeeds. | No Habitat structural rule proof. |
| `ci` | CI graph | `bun run ci` | root Nx aggregate | Runs root `check`, which schedules build/check/lint/test/verify targets through Nx. | Aggregate green must be decomposed by target class; it is not Habitat-only proof. |
| `architecture-strict-core` | Checkout/setup/cache/install | same setup steps | setup/cache | Environment prepared. | No structural proof by itself. |
| `architecture-strict-core` | Architecture strict-core graph | `bun run ci:architecture-strict-core` | direct strict diagnostic | Runs the strict-core domain-refactor guardrail profile through its explicit root diagnostic alias. | Not the normal green structural gate; current red output remains diagnostic/backlog evidence. |
| `architecture-strict-core` | Habitat JSON diagnostics | `bun run habitat check --json --output habitat-diagnostics.json` | diagnostic file | Publishes Habitat check diagnostics even after failure. | Does not prove root `verify`, full `check`, or strict-core success. |
| `architecture-strict-core` | Upload habitat diagnostics | `actions/upload-artifact@v4` | diagnostic-file transport | Makes diagnostics downloadable. | Diagnostic upload is not rule execution. |

## Implementation Consequences

- Future records must say whether they cite the main `CI graph` aggregate, the
  root `lint` Habitat-check lane inside it, the package-owned `verify` target
  aggregate, the strict-core diagnostic job, or the Habitat diagnostics
  diagnostics file.
- `bun run lint` in CI is not a direct Habitat CLI alias; it is an Nx
  `lint,habitat:check` aggregate.
- The diagnostics file records Habitat check output, not full root
  `check` or `verify` proof.
- Full CI closure requires workflow inspection plus either CI run evidence or a
  recorded reason that local proof is the current boundary.
