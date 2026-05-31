# Review Disposition Ledger

## Accepted Findings

| Id | Priority | Source | Finding | Disposition |
|---|---:|---|---|---|
| SRIG-P1-001 | P1 | `agent-proof-test.md`, `agent-setup-api.md` | Setup state must identify map row, seed, size/options, and readback before start. | Accepted. Covered by `direct-control-new-game-setup` snapshot, row proof, setup readback, and post-start proof tasks. |
| SRIG-P1-002 | P1 | `agent-proof-test.md`, `agent-studio-materialization.md` | Reload semantics must be explicit before exact-current-config claims. | Accepted. Covered by `studio-run-current-map-config` reload boundary and live proof tasks. |
| SRIG-P1-003 | P1 | `agent-proof-test.md` | Setup/start mutations need no-replay tests for partial-send failure. | Accepted. Covered by direct-control package tests and mutation failure design. |
| SRIG-P1-004 | P1 | `agent-studio-materialization.md` | Swooper config identity proof must tie request id/hash to fresh runtime logs. | Accepted. Covered by SDK/generator hash metadata and Studio proof tasks. |
| SRIG-P1-005 | P1 | all agents | Studio raw setup JavaScript and FireTuner/Windows fallback paths are forbidden. | Accepted. OpenSpec forbids caller-local setup JS and bridge fallback. |
| SRIG-P2-001 | P2 | `agent-live-sync.md` | Runtime sync must be observational and stored outside `pipelineConfig`. | Accepted. Covered by `studio-live-civ7-map-sync` store/safety tasks. |
| SRIG-P2-002 | P2 | `agent-build-pipeline.md` | Root check was graph-safe, but root test/CI lanes hand-coded package order and could miss SDK declaration rebuilds before Swooper/Studio tests. | Accepted. Root test entrypoints now run through Turbo; Studio lane verifier has explicit build/check/test graph coverage and focused Swooper runtime tests. |
| SRIG-P2-003 | P2 | verification | Canonical Swooper map envelopes were being passed to recipe execution helpers that expect the nested recipe config. | Accepted. Test/dev helpers now cross the envelope boundary through `canonicalRecipeConfig`. |
| SRIG-P2-004 | P2 | verification | Live setup/start proof was still an ad hoc owner probe, making repeated LSQ failures harder to compare. | Accepted. Added `verify:studio-run-in-game:live`, a read-only-by-default live proof gate with explicit mutation flags and structured stage output. |

## Current Blockers

- None for durable existing-row or disposable `studio-current` Run in Game.
  Earlier LSQ timeouts were resolved by a Civ process restart; the disposable
  setup-row boundary was resolved by package-owned shell/App UI reload.
- The broad `mod-swooper-maps#test` suite has unrelated morphology/ecology
  failures on this stack; the Studio Run in Game verifier uses focused Swooper
  tests for the lane it owns.
