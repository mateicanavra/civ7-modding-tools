# Habitat Packet Realignment - 2026-06-14

## Purpose

This record captures the final remediation pass over the active Habitat
workstream packet after the Nx workflow settlement on
`agent-F-habitat-nx-worktree-state`.

The product outcome remains unchanged: Habitat must become the trustworthy
repo-local structural operating system for agents. The realignment prevents
implementation DRAs from carrying stale Turbo, `bunx nx`, daemon/cache
workaround, or root `habitat:verify` assumptions into the repair and Grit
pattern workstreams.

## Team Inputs

- Boyle mapped the active packet surface and separated historical H1-H8 records
  from current recovery authority.
- Meitner performed adversarial drift review and identified stale command
  surfaces in enforcement cleanup, worktree-state, recovery ledgers, and active
  README guidance.
- Ramanujan audited active Habitat markdowns for stale `bunx nx`,
  `habitat:verify`, daemon/cache, and package-script assumptions.

## Current Nx Contract

- Nx is the only active repository task graph and orchestrator.
- Turbo has no active package dependency, root config, cache, CI, or root-script
  role.
- Root `build`, `check`, `lint`, `test`, `verify`, and `ci` enter the Nx DAG.
- Repo scripts and Habitat-spawned graph commands invoke `nx ...` through
  normal package-script PATH resolution to the repo-local `devDependencies.nx`
  version.
- Root `verify` is an Nx `verify` target aggregate; there is no root
  `habitat:verify` alias.
- `bun run lint` runs `nx run-many --targets=lint,habitat:check`; its current
  failure class is locked Habitat/Grit rule debt, not Biome, yargs, Nx
  invocation, or dependency resolution.
- Daemon disabling, cache disabling, socket/workspace-data overrides, symlink
  repair, direct distribution binaries, and routine Nx cache reset are excluded
  as steady-state policy.

## Packet Disposition

| Packet area | Realignment disposition |
| --- | --- |
| `FRAME.md` and `workstream-record.md` | Updated so H1-H8 are historical evidence, while current closure authority lives in the recovery frame, ledgers, and active packets. |
| Recovery claim ledger | Updated H1/Nx as settled for graph baseline, with records-only cleanup remaining; updated H6 to reflect lint/verify/check through Nx and current locked-rule failures. |
| Adversarial recovery reference | Updated to exclude package metadata, symlink, binary, socket, daemon, and cache-reset workaround paths from future repair. |
| Harness README | Updated to current root commands: `bun run lint`, `bun run verify`, `bun run check`, and direct `bun run habitat verify` only when intentionally invoking the CLI diagnostic. |
| `habitat-nx-adoption` | Superseded as historical H1 adoption proof; current guidance comes from `habitat-nx-worktree-state-contract`. |
| `habitat-nx-worktree-state-contract` | Updated with implementation commit `46e5cdc57`, current build/verify proof, current lint failure class, and remaining fresh-worktree verification gap. |
| `habitat-enforcement-surface-cleanup` | Updated away from root `habitat:verify`; current surfaces are graph lint, graph verify, full graph check, strict-core diagnostic, and direct Habitat diagnostic. |
| `habitat-boundary-taxonomy-tightening` | Updated away from daemon/no-daemon proof policy. Historical `NX_DAEMON=false` evidence remains diagnostic only; forward proof uses normal Nx defaults. |
| Effect evaluation | Narrowed Effect consideration to typed command/provenance orchestration around Nx calls. Nx remains the graph, target, cache, and dependency authority. |

## Forward Workstream Order

1. Close the `habitat-nx-worktree-state-contract` fresh-worktree proof gap
   under normal Nx defaults.
2. Continue command-surface truth and baseline contract repairs so Habitat
   checks cannot report false confidence.
3. Run the Grit proof/backfill workstream with lint's current locked-rule
   failures treated as product-relevant architectural debt.
4. Continue classify/generator, hook hardening, pattern generator metadata, and
   per-rule remediation only after each packet refreshes this current contract.

## Guardrails For Implementation DRAs

- Do not reintroduce Turbo, `bunx nx` as normal repo invocation, shims,
  symlink repair, direct distribution binaries, daemon/cache overrides, or
  routine cache reset.
- Do not treat historical passing records as current closure.
- Do not move package-specific proof back into root package-script sprawl.
- Do not weaken Habitat/Grit rules because lint now exposes their locked
  violations through the Nx graph.
- Do reread `FRAME.md`, this realignment record, and the active change packet
  before starting each implementation workstream.
