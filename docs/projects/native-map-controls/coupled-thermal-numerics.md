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

## Full-Grid Method Outcome

The separate analytic matrix-free port passes 7,386 root-executed manufactured
checks: 4,394 new Newton controls and 2,992 inherited controls. All 88 derivative
cases pass, including shared-pole support and retained dense parity. The two
independently reconstructed retained/mixed-pole advances each take three full
steps with branch passes two/one/one. Normal and cold manufactured periodic
cases settle in 56/52 years under their explicit private 60-year allowance.
The receipt records 9.684904666 seconds and peak RSS 153,124,864 bytes.

The subsequent whole-reference command is **refused on compute budget**, not
on Earth error or a witnessed equation defect. Its 384-step worker exhausts
the remaining 890.315076376 seconds of the fixed 900-second proof budget and
is terminated by the parent deadline. No complete coarse solve survives;
the 768-step worker, annual flux comparison and Earth comparison do not run.
The refusal's 40,419,328-byte RSS is the parent measurement, not child memory
admission. An earlier in-flight host RSS snapshot exceeds 512 MiB, but remains
observational side evidence; no formal child peak receipt survived termination.
All 53 frozen protocol pins remain exact.

Independent source review finds repeated large temporary vector allocation in
evaluation, preparation, linear RHS/direction and backtracking, despite a
correctly reused GMRES basis. No explicit growing registry of full-grid
histories or matrices is found. Allocation churn and delayed reclamation are
plausible resource causes, not a proved leak. The scalar source functions also
allocate short-lived radiation objects; neither cause is established as the
sole runtime bottleneck.

## Private Lifetime Outcome

The separately reviewed private-lifetime port is now implemented and tested
externally. It uses paired current/trial iterate and residual buffers, fixed
RHS/direction storage and two branch sets, swapping paired state only after
original trial acceptance. Public snapshots and default linear directions stay
independently owned. Supplied direction outputs reject backing-buffer aliasing
and commit only after original residual and deadline admission. The existing
borrowed stage-result contract remains unchanged. Scalar source functions,
physical constants, inputs, Float64 state, phase trajectories, arithmetic and
all acceptance/resource limits remain unchanged; there are no GC calls,
resolution reductions or production changes.

Root's once-only manufactured run passes 7,628 checks: the original 4,394
Newton checks, 242 additional lifetime/alias/reentrancy/recovery checks and
2,992 inherited controls. The returned Newton-control file is byte-identical
to the preceding method's return; all inherited physical results are exact.
Its resource-admitted receipt records 9.472464459 seconds and 164,495,360 bytes
peak RSS. This is a manufactured pass, not full-grid admission.

The subsequent coarse worker again reaches the unchanged whole-proof deadline
without returning. Its last complete progress row records 352 of the first
year's 384 phases at 854.809170208 seconds, with 93,236 GMRES iterations and
99,368 original-operator products, at most four Newton blocks and no
backtracks. Completed-phase field and local ledger checks remain within their
original limits. No complete year, periodic solve, fine worker, flux-refinement
comparison or Earth score exists. The bounded progress high-water is
674,742,272 bytes, about 643.5 MiB, already above the 512-MiB resource limit;
the formal parent refusal's 41,664,512 bytes is not child memory. All 75
frozen pins remain exact.

Thus the lifetime correction preserves the equations but is insufficient for
the required computational resources. The recorded solver work supports
investigating numerical cost, not claiming a physical-law defect or a proved
allocation leak. Progress is external study evidence, not new generation
instrumentation or acceptance authority. Neither a larger cap nor another
allocation-only change follows automatically from this result.

## Next Testable Outcome

Choose the smallest computational remedy against a genuinely simpler,
source-grounded physical alternative before another full-reference attempt.
Distinguish dropped preconditioner couplings, orthogonalization/operator cost
and scalar allocation with a bounded exact-stage profile if needed. Preserve
the original equations and guards for a same-method remedy; changing physical
closure requires its own explicit scientific admission, not an efficiency
label. No alternative is selected merely because previous work was invested.
Only a numerically qualified candidate may undergo the frozen held-Earth and
complete procedural study bank; no held refit or weakened guard follows refusal.

An eventual production change belongs in the existing Climate operation with
private numerical arithmetic, not computation in steps or a new framework.
Its design must explicitly preserve or migrate temperature vintages, pressure
inputs, public controls, orographic/riparian/basin effects, water authority and
demand semantics. Coupled precipitation cannot coexist with another silently
recomputed rainfall truth. The current basin contract uses rainfall-index times
unit-tile area per representative interval, not physical mm or kg/m2. Adoption
therefore also requires one declared joint climate-to-water conversion for rain,
demand, runoff and overflow, with storage/interval/area meaning. Signed actual
evaporation is not the old PET. Refine's separate rain, demand and Celsius-albedo
overwrites cannot remain competing canonical coupled state. Pressure remains
its intended anomaly proxy, and wind/current encodings are not SI velocity.
These are coherent owner-migration dependencies, not a parallel legacy lane.
Physics-to-Civ codecs remain separate owners.

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
- `earth-coupled-surface-air-full-grid-newton-method-20261002/`: manufactured
  PASS SHA `588e15547e5d17702c1f6e08b7eff8bcd0bcb846037378997bb440f1fbe02f94`,
  then reference budget refusal SHA
  `aaf530032f323a7bb9f17f9c9727f169c0b4df9fc4b267df0338fb4ecc0c52a2`.
  No complete full-grid result or Earth score exists.
- `earth-coupled-surface-air-vector-lifetime-design-20261002/`: prospective
  private-lifetime correction, preceding the separate execution below.
- `earth-coupled-surface-air-vector-lifetime-port-20261002/`: manufactured
  PASS SHA `0d5408c08846b3573ef401360c0879fb85802d00944f527e941572f84e8fa3be`,
  then reference deadline refusal SHA
  `03878d5845090a49576ea34798c9f076473f8a7994728e076de4b8a3efb4be4c`.
  Bounded progress SHA
  `fa621237f65a76fdbfc12da66001ea11b9c5d5eff652226be7c44e532eb232aa`
  records completed phases and child high-water, not a completed solution.

Neither reviewer nor author executed candidate imports or numerical solves.
Root performed the prospectively frozen executions; independent review
qualified source and boundary readiness, not unrun outcomes.
