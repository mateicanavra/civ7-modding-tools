# Evidence Memo: D02 Forcing Model Minimum (Mantle vs Intent vs Proxy)

Date: 2026-02-03

## Summary

D02 asks for the minimum forcing model that anchors plate kinematics and tectonic regimes. Proposal D assumes a **mantle stress field** (stress vs strength regime selector). Proposal C relies on **intent-driven kinematics** with optional advanced mantle-inspired velocity fields. The M11 realism spike adds a **mantle-lite proxy** concept (basin-weighted, low-frequency driver) as a cheap upstream signal. Current Foundation contract has **no mantle driver artifact**, so any forcing choice either adds a new truth artifact or keeps forcing implicit in kinematics.

## Current Contract Mapping (Foundation.md)

Source: `docs/system/libs/mapgen/reference/domains/FOUNDATION.md`

- Truth artifacts today are mesh-space: `foundation.mesh`, `foundation.crust`, `foundation.plateGraph`, `foundation.tectonics`, `foundation.tectonicHistory`.
- Plate motion is represented by `foundation.plateGraph` velocities; tectonic drivers are derived in `foundation.tectonics` and projected to tiles via `foundation.plates`.
- There is **no mantle driver artifact** today; any forcing change implies a new truth artifact or a change in how `plateGraph` and `tectonics` are derived.

Implication for D02:
- Option A or C requires a new mesh truth artifact (mantle stress or proxy) and explicit use in `plateGraph` or regime selection.
- Option B keeps contracts closer to current state, changing only the kinematics derivation (intent field instead of random).

## Proposal Evidence (Section Pointers)

Mantle stress (Proposal D):
- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/foundation-refactor-proposal.md`
- Section “2) Stress/Strength Regime Selection” (explicit mantle stress field + regime classification)
- Section “4) Plate Motion Policy (Global Vector Field” (policy-driven kinematics derived downstream of regime)

Intent-driven kinematics (Proposal C):
- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/foundation-domain-improvements.md`
- Section “Proposal 2.1: Kinematic Intent System” (global intent + coherence mixing)

Mantle-inspired velocity field (Proposal C, optional):
- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/foundation-domain-improvements.md`
- Section “Proposal 7.2: Mantle-Inspired Velocity Field” (procedural convection-like driver)

Mantle-lite proxy (M11 spike, planning synthesis):
- `docs/projects/pipeline-realism/resources/packets/realism-packet/analysis.md`
- Section “If we want to start with mantle and lid explicitly” (mantle-scale driver, basin-weighted)

## Strategy Comparison (D02 Options)

| Strategy | Primary driver | Where it enters | Contract impact | Alignment to proposals |
|---|---|---|---|---|
| Mantle stress field | Mesh-space stress vs strength | Regime selection and kinematics | New truth artifact + new validation | Proposal D (stress/strength regime) |
| Intent/kinematics | Author intent + coherence | PlateGraph velocity derivation | No new artifact; kinematics only | Proposal C (kinematic intent) |
| Mantle-lite proxy | Low-frequency basin/driver field | Partition/regime bias + kinematics constraints | New truth artifact (proxy) | M11 realism spike (basin-weighted driver) |

## Non-Render Invariants for Forcing Outputs

These invariants are **not** explicitly required by the current contract and should be adopted only if D02 introduces a forcing field (Option A or C). Primary source for invariants posture: `docs/projects/engine-refactor-v1/resources/spike/foundation-realism/validation-and-observability.md` (Q8/Q10).

- Determinism: same seed + config yields identical forcing field values and derived regime classification.
- Coherence length: forcing field must have a minimum spatial correlation length (no noise-first microstructure).
- Regime coverage bounds: “stagnant/episodic/mobile” classification must stay within configured thresholds (no single regime dominates unless forced by config).
- Magnitude bounds: forcing vectors or stress magnitudes must stay within defined ranges per profile (protects against runaway velocities).

## M11 Hardening Spike Harvest (only if not already specified)

From `docs/projects/engine-refactor-v1/resources/spike/spike-foundation-realism-gaps.md` and `docs/projects/engine-refactor-v1/resources/spike/foundation-realism/validation-and-observability.md`:

- A mantle-scale driver field (“basin-weighted”) is proposed as an upstream forcing signal to reduce Voronoi plate artifacts.
- Validation posture recommends distribution + topology invariants (non-render) instead of output clamping.

These items are **not present** in `docs/system/libs/mapgen/reference/domains/FOUNDATION.md` today, so they qualify as harvest candidates if D02 picks a forcing field.

## Open Questions for Decision Review

- Should the mantle driver (stress or proxy) be a **truth artifact** or an internal field used only during partition/kinematics?
- Is author intent a **primary input** (kept regardless of forcing choice), or a transitional authoring surface?
- If Option C is chosen, which downstream artifacts are explicitly “conditioned” by the proxy (partition, regime selection, volcanism, or all)?
