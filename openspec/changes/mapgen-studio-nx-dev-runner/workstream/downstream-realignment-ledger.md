# D11 Downstream Realignment Ledger - Studio Nx Dev Runner

Status: D11 implementation handoff recorded before Graphite commit
Date: 2026-06-15

## D12 - Game Door Invariant

- Owner: `openspec/changes/mapgen-studio-game-door-invariant`
- Dependency consumed from D11: local dev process ownership is no longer split
  between Nx, app-local supervisor, Bun watcher, daemon runtime, and Vite.
- Required D12 movement:
  - include dev-process residue in final runtime closeout negative searches;
  - confirm active runtime docs/specs do not preserve Turbo/devLive/Bun watcher
    as final Studio dev owners;
  - consume D11 process proof outputs: Nx target metadata, process tree output,
    and negative-search output;
  - consume `workstream/next-packet.md` as the explicit missing live
    Play/SaveDeploy `serverInstanceId` proof instead of treating D11 as live
    product-green;
  - consume surviving dev/deploy command classifications, including
    deployment-only Turbo residue if it remains;
  - classify any remaining public/manual status endpoints and direct-control
    session owners;
  - close final no-orphan bridge/residue ledger.
  - classify or repair the `StudioEventHub` Promise-owned lifecycle island
    concern raised during D11 whole-system review; D11 does not resolve that
    D12-level invariant.
- D12 stop conditions:
  - D11 leaves an app-local supervisor active;
  - D11 keeps pre-Nx command branches;
  - D11 cannot prove Play/Save&Deploy stable under Nx dev and D12 attempts to
    claim final live product closure without running the handoff proof.
  - deployment-only Turbo residue, such as Railway build commands, remains
    unclassified after D11 implementation.

## Protected Boundaries

- D11 does not own D1 daemon import-graph/write-set isolation, but must preserve
  its proof and not reintroduce operation-caused daemon restarts.
- D11 does not own D10 live-game watcher implementation, but must not rely on
  browser or supervisor recovery for live-state freshness.
- D11 does not own final game-door invariant docs or status endpoint
  classification; D12 closes those.

## Proof Boundary

D11 packet acceptance proves implementation readiness. D11 implementation proves
dev task/process topology. Operation identity stability under Nx dev remains a
not-green live proof handoff in `next-packet.md` until it is run. D12 proves
final runtime closeout.
