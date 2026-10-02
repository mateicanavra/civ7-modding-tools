# Coupled Thermal Numerical Qualification

## Scope And Decision

The unresolved production temperature-variation requirement is an actual
causal limitation, not permission to add noise or tune relief into metres.
The external coupled surface/air study tests one source-grounded alternative
before changing the existing Climate owner. Its numerical qualification,
Earth comparison, procedural cohort, owner migration and native deployment
are separate obligations. No coupled prototype is in the playable mod.

The reduced constitutive source is [ZEMBA v1.0](https://doi.org/10.5194/gmd-18-2479-2025),
with the author's release pinned in the external source packet. This is not
a complete weather model or a claim that its fixed reduced closures reproduce
modern Earth. Pressure, wind, currents and physical relief retain their
existing independent owners. Scientific observations remain benchmarks only.

## Completed Numerical Discriminator

The earlier split r4 solver conserves its ledgers and reaches periodic
solutions, but fails the unchanged per-cell annual precipitation/evaporation
timestep-refinement guard. Conservation is not temporal accuracy. The
simultaneous r5 Picard proposal then refuses on the first manufactured stage,
before any full-grid integration or Earth score.

An exact observation-only replay identifies the r5 failure at default
initialization, year one, phase zero, block zero. The initial vapor lies on
the condensation switch. The frozen inactive proposal omits the threshold's
air-temperature derivative even though its cooling direction activates that
branch. All nine physically admissible fractions increase the original vapor
residual. The scalar and linear errors are too small to explain that failure.
This is a numerical proposal limitation, not evidence against the source law.

A separately frozen discriminator includes those original-equation
cross-derivatives and identical latent coupling. It solves only the retained
six-cell stage: four dry skins, six air temperatures and six vapor masses.
Wet skins remain prescribed; bucket/runoff are exactly eliminated. There is
no new physical parameter, source law, initialization or tolerance.

The root-executed accounting-corrected replay passes all 4,965 checks,
including 76 fixed directional-derivative controls, independent original
equation reconstruction and dense linear residuals. Three Newton blocks
complete at full fractions, with two/one/one branch passes. Original normalized
residual decreases from `6.3839259518e10` through `2.754091834e9` and `808406.40`
to `0.0686242`; the independent final maximum field defect is approximately
`6.86e-12` K or kg/m2, below the unchanged `1e-10` limit. Independent relative
heat/water ledger errors are `3.47e-17` and `1.76e-14`.

This qualifies the retained stage only, not a periodic trajectory, nonlinear
state-error theorem, full-grid convergence, Earth agreement or adoption.
Condensation-switch controls cover both directional signs; evaporation and
overflow coverage is limited to the branches actually present in this case.

## Accounting Correction

The first invocation completed its controls but the external harness
incorrectly multiplied peak RSS by 1,024. It retained no returned numerical
result. The original protocol, attempt and failure remain immutable; no
formal pass is reconstructed from that failed receipt.

The exact [Bun 1.3.14 implementation](https://github.com/oven-sh/bun/blob/0d9b296af33f2b851fcbf4df3e9ec89751734ba4/src/jsc/bindings/BunProcess.cpp#L3372-L3393)
publishes raw native `ru_maxrss`. Independent primary-source and installed
Darwin-manual inspection, plus a root runtime-only `/usr/bin/time` observation,
establish bytes for this exact runtime. The accounting-only replay imports
the sealed numerical controls without alteration, retains the 900-second and
512-MiB limits, and records the complete return before resource adjudication.
Its measured peak is 201,670,656 bytes. This is not a Node/Linux unit convention
or a justification to change the physical model.

## Next Testable Outcome

The admitted next investigation is an external full-grid original-equation
Newton port with analytic sparse Jacobian products and a nonsymmetric Krylov
solve. Positive diffusion subblocks may precondition it; CG is not valid merely
because those subblocks are positive. Preserve cell-specific dry skins/buckets,
shared-pole air/vapor aggregation, exact switching and original residuals.

Independent dense parity, shared-pole/manufactured controls and periodic
controls precede the unchanged 384/768 whole-reference flux comparison. No
Earth labels or scores enter numerical-method admission. Only a numerically
qualified candidate may undergo the frozen held-Earth and complete procedural
study bank; no held refit or weakened guard follows refusal.

An eventual production change belongs in the existing Climate operation with
private numerical arithmetic, not computation in steps or a new framework.
Its design must explicitly preserve or migrate temperature vintages, pressure
inputs, public controls, orographic/riparian/basin effects, water authority and
demand semantics. Coupled precipitation cannot coexist with another silently
recomputed rainfall truth. Physics-to-Civ codecs remain separate owners.

## Evidence

All executable studies and raw scientific references remain outside the repo
in the [discoverable Civ research location](../../process/LOCAL-VIEWERS.md),
under `VisualAtlas/huge-1018/earth-calibration/`:

- `earth-coupled-surface-air-closure-design-20261002-r5/`: immutable source laws,
  protocol and numerical refusal.
- `earth-coupled-surface-air-implicit-descent-observation-20261002/`: exact
  non-descent observation, SHA `77eb65e3a2919402e52cfc2dfdcdebae0d4dc16a70e9b605e41e682b57f48ad5`.
- `earth-coupled-surface-air-first-stage-newton-discriminator-20261002/`:
  reviewed sealed method/controls and original accounting failure.
- `earth-coupled-surface-air-first-stage-memory-accounting-20261002/`:
  accounting-only protocol, complete returned evidence and admitted outcome,
  SHA `46209dc3747e1d2b2e03d2b4b631745fedb42d7134e2a5284bb8296428d3fffd`.

Neither reviewer nor author executed candidate imports or numerical solves.
Root performed the prospectively frozen executions; independent review
qualified source and boundary readiness, not unrun outcomes.
