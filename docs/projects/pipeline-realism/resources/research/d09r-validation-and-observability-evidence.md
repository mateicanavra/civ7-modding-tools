# Evidence Memo: D09r Validation + Observability

This memo anchors D09r to existing repo contracts and to the pipeline-realism maximal SPEC, and identifies the minimum invariant set that prevents “fake physics” drift.

## Grounding (repo contracts)

- Observability posture (trace must not change semantics): `docs/system/libs/mapgen/reference/OBSERVABILITY.md`
- Visualization routing (external observer; do not fork viz architecture): `docs/system/libs/mapgen/reference/VISUALIZATION.md`
- Artifact contract (publish-once, read-only; narrow buffer exception): `docs/system/libs/mapgen/reference/ARTIFACTS.md`
- Strict config compilation (unknown keys error; deterministic compilation): `docs/system/libs/mapgen/reference/CONFIG-COMPILATION.md`

## Grounding (pipeline-realism target)

- Target SPEC requires pre-render invariants and bounded budgets:
  - `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md` (`Determinism + Validation`, `Performance Budget`)
  - `docs/projects/pipeline-realism/resources/spec/budgets.md`
- D04r dual outputs define mandatory era + provenance contracts:
  - `docs/projects/pipeline-realism/resources/spec/sections/history-and-provenance.md`
- D07r defines morphology consumption posture (no wall mountains; belt continuity):
  - `docs/projects/pipeline-realism/resources/spec/sections/morphology-contract.md`

## Where validation must live (pipeline boundaries)

Validation should be placed at the smallest boundary that makes failures actionable:

- Producer boundary: each step validates artifacts just before publish.
- Stage boundary: terminal `foundation.validate`-style step asserts cross-artifact agreement.
- Consumer boundary: downstream stages do cheap assumption checks only (dims/required artifacts), not full upstream validation.

This matches the “write-once, read-only” contract and keeps validation independent of visualization.

## Minimum invariants (hard gates vs diagnostics)

### Hard gates (always-on)

Hard gates must prevent “garbage but bounded” outputs from silently passing:

- Contract correctness:
  - typed array lengths match declared `cellCount`/`width*height`
  - indices are in-range (`tileToCellIndex < cellCount`, `tracerIndex ∈ [0..cellCount-1]`)
  - enum-coded fields are in known value sets
  - values are finite (no NaNs/Infs)
- Cross-artifact agreement:
  - `history.eraCount === provenance.eraCount`
  - `historyTiles.eraCount === history.eraCount` and dims match `width*height`
  - plate IDs used by segments/history are in-range for the plate graph
- Fixed-budget invariants:
  - `eraCount` equals the maximal target (or is within the SPEC’s hard max if we allow dimension-derived variation)
  - smoothing/solver passes are fixed counts (no convergence loops)

### Diagnostics (not gating by default)

Diagnostics are required outputs for iteration, but should start non-fatal:

- distribution checks (coverage fractions, component length histograms)
- correlation checks (uplift drivers correlate with elevation response)
- fit residual summaries (plate-motion rigid-fit quality)
- coherence/spectral proxies (mantle forcing is low-order structure, not microstructure-first noise)

Promotion of diagnostics to hard-gates belongs in strict/CI mode once thresholds stabilize.

## Trap list (what breaks maximalism)

- **Trap: relying on deck.gl/viewer logic for correctness**
  - Fix: validators operate over artifacts + trace events only; viz is optional.
- **Trap: “shape-only” validation**
  - Fix: add minimal semantic invariants (coverage/coherence/residuals) as diagnostics, promote once stable.
- **Trap: nondeterminism via iteration order**
  - Fix: treat deterministic ordering/tie-breaks as part of the contract; validate outputs that reveal instability.
- **Trap: projection drift**
  - Fix: validate `tileToCellIndex` and spot-check projected values against source cells deterministically.
- **Trap: diagnostics becoming implicit truth dependencies**
  - Fix: classify diagnostics explicitly; any promotion to “truth” requires an explicit decision and schema updates.

## Mapping to current domain docs / code seams (anchors for implementation)

- Domain contract baselines:
  - `docs/system/libs/mapgen/reference/domains/FOUNDATION.md`
  - `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md`
- Foundation step seams (validation currently exists and is likely to be replaced/expanded by D09r):
  - `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/`

