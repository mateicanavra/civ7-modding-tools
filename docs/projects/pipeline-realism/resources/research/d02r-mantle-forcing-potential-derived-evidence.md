# Evidence Memo: D02r Mantle Forcing Potential + Derived Stress/Velocity

## Purpose

Provide source pointers and synthesis that justify a **first-class mantle forcing potential** with deterministic derived stress/velocity, grounded in mesh-space truth artifacts.

## Key Evidence Pointers

- Mesh-first truth contract and existing Foundation artifact surfaces:
- `docs/system/libs/mapgen/reference/domains/FOUNDATION.md`
- Mantle/lid posture and forcing narrative:
- `docs/projects/pipeline-realism/resources/packets/realism-packet/analysis.md`
- Stress-vs-strength regime selection and mantle-driven kinematics framing:
- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/foundation-refactor-proposal.md`
- Mantle-inspired velocity field concept (non-noise kinematics):
- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/foundation-domain-improvements.md`
- M11 basin-weighted mantle/basin driver (low-order mantle proxy, deterministic driver field):
- `docs/projects/engine-refactor-v1/resources/spike/spike-foundation-realism-gaps.md` (Section “Plate partition realism”) 
- Superseded D02 baseline and ambiguity:
- `docs/projects/pipeline-realism/resources/decisions/d02-forcing-mantle-minimum.md`

## Evidence Synthesis

- The Foundation contract is mesh-first and expects truth artifacts that downstream domains can project deterministically. Adding mantle forcing at the mesh layer aligns with this posture and avoids tile-driven feedback loops.
- Prior proposal packets already anchor regime selection in **stress vs strength**. This requires a mantle stress/forcing source that is not merely intent/kinematics.
- The M11 realism spike explicitly calls for a **low-frequency mantle/basin driver** to seed/grow plates. This supports the requirement that forcing be **low-order** and deterministic rather than filtered noise.
- Existing improvements proposals describe mantle-inspired velocity concepts but lack a canonical truth artifact. D02r closes this gap by promoting mantle forcing to a first-class mesh artifact with deterministic derivations.

## Constraints Derived From Evidence

- Mantle forcing must be a **mesh-space truth artifact**, not a projection or post-hoc tile field.
- The forcing substrate must be **low-order and deterministic** (cell/plume/downwelling structure), which is consistent with the M11 basin-weighted driver framing.
- Regime and kinematics must be **derived** from mantle forcing + lithosphere strength, consistent with the stress-vs-strength narrative in proposal packets.

## Implications

- Adds new truth artifacts to the Foundation contract surface but keeps them aligned with existing mesh-first invariants.
- Enables deterministic coupling rules for rifting, subduction, and plume/hotspot signals used by downstream domains.
