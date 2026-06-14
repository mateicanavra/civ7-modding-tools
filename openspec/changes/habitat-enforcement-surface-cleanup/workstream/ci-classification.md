# CI Classification

**Change:** `habitat-enforcement-surface-cleanup`
**Source:** `.github/workflows/ci.yml`

CI contains more than one proof class. The `architecture-strict-core` job is
the current Habitat structural gate. The main `ci` job still runs direct build,
Biome, lint, and test commands; those may be valid gates, but they are not all
Habitat structural proof.

## Current CI Steps

| Job | Step | Current command/action | Surface class | Current claim | Non-claim |
| --- | --- | --- | --- | --- | --- |
| `ci` | Checkout | `actions/checkout@v4` with submodules | setup | Source and submodules are present. | No Habitat structural rule proof. |
| `ci` | Guard against pnpm artifacts | shell `find` guard | direct file hygiene gate | CI rejects pnpm artifacts. | Does not replace Habitat file-layer staged proof. |
| `ci` | Setup Node | `actions/setup-node@v4` | setup | Node version selected. | No structural proof. |
| `ci` | Setup Bun | `oven-sh/setup-bun@v2` | setup | Bun version selected. | No structural proof. |
| `ci` | Cache Nx | `actions/cache@v4` | cache infrastructure | Nx cache may be restored. | Cache hit is not proof that Habitat selected real rules. |
| `ci` | Install dependencies | `bun install --frozen-lockfile` | dependency integrity gate | Lockfile install succeeds. | No Habitat structural rule proof. |
| `ci` | Build | `bun run build` | build proof | Workspace build succeeds. | Not proof of Habitat rule selection. |
| `ci` | Biome hygiene | `bun run biome:ci` | direct Biome hygiene gate | Biome read-only CI check succeeds. | Not a Habitat structural gate unless routed through Habitat/Nx target proof. |
| `ci` | Lint | `bun run lint` | Habitat alias today | Root lint invokes `bun run habitat:check`. | Does not by itself prove `habitat verify` or Nx affected targets. |
| `ci` | Test | `bun run test:ci` | test proof | Workspace CI tests succeed. | Not a Habitat structural gate unless tests are wrapped and classified. |
| `architecture-strict-core` | Checkout/setup/cache/install | same setup steps | setup/cache | Environment prepared. | No structural proof by itself. |
| `architecture-strict-core` | Habitat verify | `bun run habitat:verify` | canonical Habitat structural gate | Current CI structural verification path. | Needs `VerifyProof` artifact to classify selectors, targets, cache, and post-state. |
| `architecture-strict-core` | Habitat JSON diagnostics | `bun run habitat:check -- --json --output habitat-diagnostics.json` | diagnostic artifact | Publishes Habitat check diagnostics even after failure. | Does not prove Nx affected targets or outer verify exit. |
| `architecture-strict-core` | Upload habitat diagnostics | `actions/upload-artifact@v4` | artifact transport | Makes diagnostics downloadable. | Artifact upload is not rule execution. |

## Implementation Consequences

- Future records must say "CI Habitat structural verification" when referring
  to the `architecture-strict-core` Habitat job, not all CI green signals.
- Main `ci` build, Biome, lint, and test steps remain separate proof classes.
- `bun run lint` in CI is a Habitat check alias today; it is not a verify alias.
- The diagnostics artifact records Habitat check output, not full verify proof.
- Full CI closure requires workflow inspection plus either CI run evidence or a
  recorded reason that local proof is the current boundary.
