# D11 Next Packet - Closed Live Nx Dev Operation Proof

Status: closed by D12 live state-machine proof
Date opened: 2026-06-15
Date reconciled: 2026-06-16
Branch originally recorded: `codex/runtime-effect-nx-dev-runner`

## Why This Exists

D11 originally handed off live Civ7 Play and Save&Deploy proof under the
Nx-owned Studio dev runner. D12 consumed that gap with a live state-machine pass
recorded in:

- `openspec/changes/mapgen-studio-game-door-invariant/workstream/testing-ledger.md`
- `openspec/changes/mapgen-studio-game-door-invariant/workstream/final-proof-ledger.md`

The D12 proof records:

- Nx Studio frontend on `localhost:5173` and daemon RPC on
  `127.0.0.1:5174`;
- stable daemon identity across the live pass;
- invalid Run in Game rejection before operation admission;
- disposable Run in Game terminal `complete` through `studio.events.watch`,
  keyed status, and `studio.operations.current({})`;
- Save&Deploy terminal `complete` through `studio.events.watch`, keyed status,
  and `studio.operations.current({})`;
- transient `studio-current` outputs ignored and tracked generated/catalog
  artifacts restored cleanly.

This closes the D11 live operation handoff as downstream proof consumption. It
does not add new live proof beyond D12, and it does not prove D10's narrower
live-game watcher replay/quiet/change subclaims.

## Reopening Rule

Do not use this file as an active next packet. Reopen only if a future change
modifies Nx dev topology, Play/SaveDeploy runtime behavior under Nx dev, or the
D12 live proof records are invalidated by stronger evidence.
