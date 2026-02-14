# SCRATCH Worker A — Ecology Algorithms

## Ownership
- Slice: S2
- Branch: `codex/prr-epp-s2-ecology-physics-cutover`
- Focus: Remove fudge/gating composition and RNG in scoped ecology algorithms.

## Working Checklist
- [x] Replace bandpass/ramp/penalty/bonus logic with physics-first scoring surfaces.
- [x] Remove `minScore01` gating and RNG tie-breaks from ecology feature planners.
- [x] Update contracts/config types accordingly.
- [x] Update ecology tests and static no-fudge scan rules.

## Decision Log
- 2026-02-14: Added shared deterministic candidate ordering helpers in `ops/score-shared` with tie order:
  1) higher `confidence01`, 2) lower `stress01`, 3) lower `tileIndex`, then stable feature-key fallback.
- 2026-02-14: Removed RNG usage (`createLabelRng`) from all scoped feature planners; planners now use deterministic physics ordering only.
- 2026-02-14: Removed runtime `minScore01` gating from scoped planner strategies and switched viability checks to positive-confidence (`confidence01 > 0`) only.
- 2026-02-14: Kept planner contract `minScore01` keys temporarily for config compatibility outside this slice’s owned file scope; runtime ignores the value.
- 2026-02-14: Reframed biomes vegetation aridity effect as stress attenuation (`aridityStressWeight`) rather than explicit penalty subtraction.
- 2026-02-14: Updated ecology tests/static scans to assert scoped no-RNG/no-fudge posture and deterministic physics tie ordering.
