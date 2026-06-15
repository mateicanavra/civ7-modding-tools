# D11 Downstream Realignment Ledger - Studio Nx Dev Runner

Status: packet accepted; implementation pending
Date: 2026-06-14

## D12 - Game Door Invariant

- Owner: `openspec/changes/mapgen-studio-game-door-invariant`
- Dependency consumed from D11: local dev process ownership is no longer split
  between Nx, app-local supervisor, Bun watcher, daemon runtime, and Vite.
- Required D12 movement:
  - include dev-process residue in final runtime closeout negative searches;
  - confirm active runtime docs/specs do not preserve Turbo/devLive/Bun watcher
    as final Studio dev owners;
  - consume D11 process proof outputs: Nx target metadata, process tree output,
    negative-search output, and live Play/Save&Deploy `serverInstanceId` proof;
  - consume surviving dev/deploy command classifications, including
    deployment-only Turbo residue if it remains;
  - classify any remaining public/manual status endpoints and direct-control
    session owners;
  - close final no-orphan bridge/residue ledger.
- D12 stop conditions:
  - D11 leaves an app-local supervisor active;
  - D11 keeps pre-Nx command branches;
  - D11 cannot prove Play/Save&Deploy stable under Nx dev.
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
dev task/process topology and operation identity stability under Nx dev. D12
proves final runtime closeout.
