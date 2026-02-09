# M2 Remediation Map (What M3 Assumes and Replaces)

M3 is explicitly "M3 that remediates M2":

- **M2** = behavior-preserving architecture alignment (compute substrate + atomic per-feature ops + compiler-owned binding seam).
- **M3** = realism cutover (score layers first + deterministic planning + no-fudging).

## M2 as Prerequisite (assumed true by end of M2)

From `docs/projects/pipeline-realism/milestones/M2-ecology-architecture-alignment.md`:

- Atomic per-feature ops exist (no mega-ops in runtime path).
- Compute substrate model exists (shared compute layers consumed by plan ops).
- Steps orchestrate; ops do not orchestrate.
- Steps do not import op implementations or rules.
- features-plan binding seam is compiler-owned (no hand-wired optional ops hacks).

## What M3 Changes (behavioral, forward-only)

M3 changes behavior by design:

- Introduces an explicit `artifact:ecology.scoreLayers` as a first-class truth product.
- Replaces chance/multiplier/probabilistic gating with deterministic selection.
- Moves cross-family reasoning into truth planning (projection stamping does not "fix" truth).

## M3 Does NOT Redo M2

- M3 does not re-fight op modularization.
- M3 treats M2 architecture alignment as infrastructure.

## Where M3 must delete legacy remnants

Anything that remains from pre-M2 or transitional M2 shims that violates M3 posture:
- chance percentages / multipliers / probabilistic edges
- disabled strategies / silent skips
- projection merge logic that gates existence

Deletion is explicit and gated.
