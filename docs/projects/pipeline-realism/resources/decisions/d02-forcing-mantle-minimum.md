# Decision Packet: Define Minimum Forcing Model (Mantle vs Intent vs Proxy)

> Superseded by `docs/projects/pipeline-realism/resources/decisions/d02r-mantle-forcing-potential-derived.md` (maximal posture: mantle forcing is first-class truth; not optional).

## Question

What is the **minimum forcing model** we will require in the next Foundation target so plate kinematics and tectonic regimes are grounded in a defensible upstream driver?

## Context (pointers only)

- Docs:
- `docs/projects/pipeline-realism/resources/spec/proposal-comparison-foundation-evolutionary-refactor.md` (Decision Backlog D02)
- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/foundation-refactor-proposal.md` (Section “2) Stress/Strength Regime Selection”, Section “4) Plate Motion Policy (Global Vector Field”)
- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/foundation-domain-improvements.md` (Section “Proposal 2.1: Kinematic Intent System”, Section “Proposal 7.2: Mantle-Inspired Velocity Field”)
- `docs/projects/pipeline-realism/resources/packets/realism-packet/analysis.md` (Section “If we want to start with mantle and lid explicitly”)
- `docs/projects/engine-refactor-v1/resources/spike/foundation-realism/validation-and-observability.md` (Q8/Q10 invariants; only if not already covered elsewhere)
- Current contract baseline:
- `docs/system/libs/mapgen/reference/domains/FOUNDATION.md` (Truth vs projection posture; artifacts provided today)

## Why this is ambiguous

- Proposal D assumes a first-class **mantle stress field** that drives regime selection and downstream kinematics.
- Proposal C achieves control via **author intent/kinematic fields** and treats mantle modeling as optional/advanced.
- The M11 spike suggests a **mantle-lite proxy** (“basin-weighted” low-frequency driver) as a cheap upstream forcing signal.

These are materially different commitments for artifacts, computational cost, and validation posture.

## Why it matters

- Blocks/unblocks:
- Unlocks D03 (plate motion representation) and D04 (evolution engine semantics) by specifying the upstream driver.
- Determines whether we add new truth artifacts (mantle stress) or remain in a kinematics-only contract.
- Downstream contracts affected:
- `artifact:foundation.plateGraph` kinematics derivation.
- `artifact:foundation.tectonics` and `artifact:foundation.tectonicHistory` interpretation (what “forcing” means).
- `artifact:foundation.plates` projection fields that Morphology consumes.

## Simplest greenfield answer

Make **mantle stress a first-class mesh truth artifact** and derive regime selection + plate motion from it, with kinematics as a downstream policy layer.

## Why we might not yet simplify

- Full mantle stress modeling adds cost and new artifacts before we have minimal validation guardrails.
- The current contract has no mantle driver artifact; immediate adoption may force widespread migration before other D02+ decisions are settled.
- Author-facing control via intent is still valuable for predictable scenarios (supercontinent assembly/breakup) and may remain necessary.

## Options

1) **Option A: Mantle stress field (first-class truth)**
   - Description:
   - Add a mesh-space mantle stress field; classify regime (stagnant/episodic/mobile) from stress vs strength; drive plate motion from policy field conditioned on regime.
   - Pros:
   - Strong physical narrative aligned to Proposal D.
   - Clear forcing provenance for regimes and history fields.
   - Cons:
   - New artifact/validation surface and more compute before the rest of the refactor lands.

2) **Option B: Intent/kinematics only (no mantle field)**
   - Description:
   - Use author intent + coherence to build a velocity field; treat forcing as purely kinematic, with no explicit mantle driver.
   - Pros:
   - Lowest implementation cost; aligns with Proposal C and existing kinematics upgrades.
   - Retains author control as the primary surface.
   - Cons:
   - Weakened “physics-first” claim; no upstream forcing to validate against.

3) **Option C: Mantle-lite proxy (low-frequency driver field)**
   - Description:
   - Introduce a low-frequency mantle/basin proxy field in mesh space and use it to bias partition/regime selection; kinematics remain intent-driven but must respect the proxy.
   - Pros:
   - Matches M11 guidance for an upstream driver without full convection complexity.
   - Preserves author intent while anchoring plate topology to a physical-looking driver.
   - Cons:
   - Adds a new artifact and validation needs, but with less physical rigor than Option A.

## Proposed default

- Recommended: **Option C (Mantle-lite proxy + intent/kinematics)**
- Rationale:
- Establishes a minimum forcing signal (physics posture) without the full mantle stress implementation cost.
- Keeps authoring control (intent) as a stable UX surface while making plate topology less “random Voronoi.”
- Creates a clear upgrade path to Option A once validation and downstream contracts are stabilized.

## Acceptance criteria

- [ ] SPEC updated at: `docs/projects/pipeline-realism/resources/spec/foundation-evolutionary-physics-SPEC.md` (pending creation after D01–D09 decisions)
- [ ] Migration slice created/updated at: `docs/projects/pipeline-realism/resources/spec/migration-slices/foundation-physics-mantle-lite.md` (new)
- [ ] Follow-ups tracked: add D02 decision outcome to `docs/projects/pipeline-realism/resources/decisions/README.md` (or Linear issue), if required
