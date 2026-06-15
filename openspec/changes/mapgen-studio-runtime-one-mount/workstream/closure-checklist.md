# D0 Closure Checklist

Status: accepted; restack adoption reviewed
Date: 2026-06-14; restack adoption update 2026-06-15

## Packet Shape

- [x] Existing `proposal.md`, `design.md`, `tasks.md`, and spec delta exist.
- [x] Existing OpenSpec change validates strict.
- [x] Workstream packet records added.
- [x] Artifact classification ledger added.
- [x] Baseline oracle ledger added.
- [x] Residue ledger added.
- [x] Fresh reviews complete.
- [x] Accepted P1/P2 findings repaired or rejected with evidence.
- [x] Packet status moved from draft to accepted.

## Evidence

- [x] `bun install --frozen-lockfile`
- [x] `bun run build`
- [x] `bun run openspec -- list`
- [x] `bun run openspec -- validate mapgen-studio-runtime-one-mount --strict`
- [x] `bun run --cwd apps/mapgen-studio test -- test/server/oneMount.test.ts test/server/daemonFetch.test.ts`
- [x] retired satellite client/path module negative search
- [x] retired satellite path/symbol search with comment/test-only disposition
- [x] `git worktree list`
- [x] `gt status` (falls through to `git status` in this CLI)
- [x] `gt log --no-interactive`
- [x] `git diff --check` after packet edits
- [x] `git status --short --branch` clean or expected before commit
- [x] generated-output churn reverted; no tracked generated output remains in D0 write set
- [x] restacked implementation worktree adopted on accepted Habitat/Nx `main`
- [x] `bun run nx --version`
- [x] `bun run nx show project mapgen-studio --json`
- [x] `bun run nx show project mod-swooper-maps --json`
- [x] `bun run habitat classify openspec/changes/mapgen-studio-runtime-one-mount/workstream`
- [ ] `bun run lint` green (non-green on 2026-06-15: `grit-sdk-mapgen-entrypoint` and `workspace-entrypoints`; committed `deploy.ts` Biome formatting repaired in this alignment slice)

## Baseline Decisions

- [x] Historical packet-authoring branch classified as pre-Nx authoring baseline only.
- [x] Nx/Biome/GritQL scout report dispositioned.
- [x] Decision recorded: the runtime stack has since been restacked onto the accepted Habitat/Nx baseline; Nx-dependent implementation is no longer blocked for lack of baseline.
- [x] Current `mapgen-studio:dev` still routes through package `devLive.ts`; D11 owns deletion and Nx-native continuous target replacement.

## Downstream Realignment

- [x] D1 depends on D0 baseline classification.
- [x] D11 owns Studio dev-runner cleanup after accepted Nx/Habitat baseline exists.
- [x] D1 packet consumes final D0 baseline decision as an entrance requirement on the adopted restacked worktree.
- [x] D0 records non-green root lint separately from packet/OpenSpec/build/check proof.
