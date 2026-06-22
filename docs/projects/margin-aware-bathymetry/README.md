# Margin-aware bathymetry (Thread 2)

The realism follow-on to [coastal-shelf-tiling](../coastal-shelf-tiling/README.md). That workstream
made coastal tiles follow a margin-aware, depth-gated continental shelf instead of a uniform band, and
shipped it live. It closed with two honest hand-offs:

- **Thread 1** ([erosion](../coastal-shelf-tiling/EROSION-THREAD.md)): erosion does **not** shape the
  seafloor; the R3 shelf growth is dominated by a **global-cutoff coupling** — a single global
  shelf-break quantile lets island density set continental shelf width map-wide.
- **Margin-contrast limitation** ([EXPECTATIONS §6](../coastal-shelf-tiling/EXPECTATIONS.md)): the
  active-narrow / passive-wide contrast was thought muted because "bathymetry is only weakly
  margin-correlated."

**Thread 2 tests both claims empirically and acts on them.** The analysis (10 self-validated runs)
refutes the "weakly correlated" premise and quantifies the coupling, then scopes a two-layer fix.

## Docs

- [ANALYSIS.md](./ANALYSIS.md) — the empirical findings (M1/M2/M3), method, data, adversarial verification.
- [FRAMING.md](./FRAMING.md) — corrected premise + the **a-then-b** decision and rejected alternatives.
- [EXPECTATIONS.md](./EXPECTATIONS.md) — the pre-declared expectation ledger (Step-5 gate) for both layers.

## One-line status

Analysis complete and adversarially verified. Decision: **(a) localize the shelf-break cutoff**
(self-contained, low-risk, retires the Thread-1 coupling), **then (b) margin-aware seafloor depth**
(foundation/heightfield change; realism depth + per-map dynamic range). Design phase not started.

## Ground-truth artifacts

- Measurement harness (self-validating, byte-faithful vs the live op):
  `mods/mod-swooper-maps/scripts/diag/analyze-margin-contrast.ts`
- Layer (a) entry point (the single global cutoff):
  `mods/mod-swooper-maps/src/domain/morphology/ops/compute-shelf-mask/strategies/default.ts`
- Layer (b) entry point (bathymetry = min(0, elevation − seaLevel)):
  `mods/mod-swooper-maps/src/domain/morphology/ops/reconcile-heightfield-from-coast/strategies/default.ts`
- Foundation forcing→elevation coupling reference (the land analogue (b) extends to the seafloor):
  `docs/projects/pipeline-realism/resources/spec/sections/morphology-contract.md`
