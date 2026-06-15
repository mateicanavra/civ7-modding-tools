# D1 Packet Closure Checklist

Status: accepted
Date: 2026-06-14

## Packet Shape

- [x] Proposal repaired to forward Nx/Habitat baseline.
- [x] Design repaired to source-boundary/watch-graph component model.
- [x] Tasks repaired to implementation-ready steps.
- [x] Spec delta repaired to source-boundary and mod-package target requirements.
- [x] Packet phase/review/closure records added.
- [x] Historical residue classified so old S1.1a proof text is evidence, not implementation authority.
- [x] Fresh reviews complete.
- [x] Accepted P1/P2 findings repaired or rejected with evidence.
- [x] Packet status moved from draft to accepted.

## Required Verification Before Acceptance

- [x] `bun run openspec -- validate mapgen-studio-dev-watch-deploy-isolation --strict`
- [x] `bun run openspec:validate`
- [x] `git diff --check`
- [x] shortcut scan for unsupported Turbo/fallback/shim/temporary/dual-path/support-both/optional-target/only-if-needed/watch-ignore-only target language; active and historical hits classified in `packet-residue-ledger.md`.

## Execution Gates For Future Implementation

- [ ] `bun install --frozen-lockfile`
- [ ] accepted migrated Nx/Habitat baseline proof
- [ ] baseline build/check for the selected implementation base
- [ ] `bun run nx show project mapgen-studio --json`
- [ ] `bun run nx show project mod-swooper-maps --json`
- [ ] `bun run nx run mapgen-studio:check --outputStyle=static`
- [ ] `bun run nx run mod-swooper-maps:build --outputStyle=static`
- [ ] `bun run habitat classify <path-or-diff>` for D1 implementation paths, followed by any reported Habitat/Nx/Biome/GritQL gates
- [ ] focused tests for contract-only recipe-DAG import, transitive daemon import graph, deploy write-set disjointness, exact deploy command, daemon watch/import trigger, frontend watcher ignores, and D0 one-mount regression
- [ ] live Play and Save&Deploy same-operation phase-sampled proofs with stable `serverInstanceId`, deploy command/log pointer, and restart-recovery exclusion
- [ ] `git status --short --branch`
- [ ] `gt status` or documented Graphite CLI equivalent when this CLI aliases `gt status` to Git status
- [ ] `gt log --no-interactive`
- [ ] clean/quarantined worktree proof before closure
