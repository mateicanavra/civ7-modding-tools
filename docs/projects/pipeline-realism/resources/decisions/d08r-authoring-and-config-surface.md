# Decision Packet: Define authoring and config surface (D08r)

## Question

What is the **stable authoring surface** for the Pipeline Realism Foundation stack, and what constraints define what authors may and may not specify (profiles/knobs vs derived fields), while aligning with strict config compilation?

## Context (pointers only)

- Docs (policy/contract):
- `docs/system/libs/mapgen/reference/CONFIG-COMPILATION.md` (strict + deterministic config compilation)
- `docs/system/libs/mapgen/reference/STAGE-AND-STEP-AUTHORING.md` (stage surfaceSchema + toInternal boundary)
- `docs/system/libs/mapgen/reference/STUDIO-INTEGRATION.md` (configOverrides boundary + determinism posture)
- `docs/system/libs/mapgen/reference/domains/FOUNDATION.md` (existing stage-level knobs; plate motion is a derived artifact field)
- `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md` (consumes Foundation drivers; does not accept belts as inputs)

- Docs (pipeline-realism synthesis):
- `docs/projects/pipeline-realism/resources/spec/proposal-comparison-foundation-evolutionary-refactor.md` (Proposal C vs D divergence: config/authoring axis)
- `docs/projects/pipeline-realism/resources/research/d08r-authoring-and-config-surface-evidence.md` (evidence memo for this decision)

- Docs (Proposal C):
- `docs/projects/pipeline-realism/resources/packets/foundation-proposals/unified-foundation-refactor.md` (Part III: unified config schema + knob mapping)

- Docs (Proposal D):
- `docs/projects/pipeline-realism/resources/packets/foundation-refactor-proposal-packet/raw/docs/system/libs/mapgen/foundation-refactor-proposal.md` (sections `Authoring profiles (high-level axes)` and `9) Authoring Surface (Profiles & Advanced Knobs)`)

## Why this is ambiguous

- Proposal C pushes a **knobs-first unified schema** with an explicit knob-to-parameter mapping reference.
- Proposal D pushes **profiles-first** with a “derived values hidden” rule and a small targeted advanced surface.
- The repo’s current MapGen configuration posture already includes both:
  - semantic stage knobs (Foundation `plateCount`, `plateActivity`),
  - and strict config compilation that rejects unknown keys,
  but it does not yet specify the Pipeline Realism target authoring boundary (what is physics input vs what is derived truth).

## Why it matters

- Blocks/unblocks:
- Unblocks D08r-dependent spec sections by defining how user intent is expressed without leaking derived fields into authoring.
- Enables Studio tuning loops by making each authoring knob map to stable visualization layers.

- Downstream contracts affected:
- Plan identity (`planFingerprint`) and reproducibility expectations (seed+config determinism).
- The Foundation “truth vs projection” boundary (authors must not author projections-as-truth).
- Morphology’s belt synthesis posture (belts are derived from drivers, not authored).

## Simplest greenfield answer

Expose only physics-first initial conditions via a small, closed authoring surface:
- profiles for common intent (resolution/continents/motion/history),
- a small set of stable semantic knobs (plate count/activity),
- and a tightly constrained “advanced” escape hatch that still only expresses physics inputs (no derived fields).

Everything else is derived deterministically during compilation and execution, and is inspectable via artifacts + visualization layers.

## Why we might not yet simplify

- Backwards compatibility and migration: existing recipes already expose some knobs and defaults; a new authoring surface may require explicit mapping for legacy keys.
- UX pressure: power users will ask for “just let me paint motion/belts”, but that conflicts with determinism and contract boundaries.
- Validation/observability: without hard invariants, an overly wide authoring surface becomes an untestable “parameter soup”.

## Options

1) **Option A**: Knobs-first unified schema (C-like)
   - Description: expose a wide, explicit config schema with many semantic knobs; include a knob-to-parameter mapping reference as part of the spec.
   - Pros:
   - Maximum direct control; easy to add new parameters.
   - Natural fit for a “knob-to-viz-layer” Studio workflow.
   - Cons:
   - High risk of exposing derived values and creating a long-term compatibility burden.
   - Harder to keep “physics inputs only” boundaries; invites velocity/belt authoring.

2) **Option B**: Profiles-first with targeted advanced knobs (D-like)
   - Description: expose a small set of profiles and a narrow advanced surface; enforce a “derived values hidden” rule.
   - Pros:
   - Enforces a stable authoring boundary and keeps compilation deterministic and testable.
   - Easier to maintain across refactors (few public keys).
   - Cons:
   - Power-user pressure to expose more knobs will be constant.
   - Requires explicit profile-to-internal mapping documentation to stay auditable.

3) **Option C**: Hybrid (profiles + stable semantic knobs; physics-first only)
   - Description: profiles-first, plus a small number of stable semantic knobs that are explicitly physics-first initial conditions (e.g., plate count/activity), plus a constrained advanced surface for physics inputs only.
   - Pros:
   - Preserves Studio-friendly scalars (fast iteration) without expanding into parameter soup.
   - Aligns with current Foundation posture (already has semantic knobs) while adopting D’s profiles-first stability.
   - Cons:
   - Requires careful line-drawing between “semantic knob” and “derived field”.
   - Adds one more layer of compilation mapping to document (profiles + knobs).

## Proposed default

- Recommended: **Option C** (hybrid; profiles + stable semantic knobs; physics-first only).
- Rationale:
- Meets the strict config compilation posture: closed schema, deterministic compilation, unknown-key errors.
- Keeps authoring as physics inputs/initial conditions and explicitly forbids velocity/belt authoring.
- Provides a practical Studio tuning loop via a small number of stable knobs that map cleanly to existing Foundation visualization layers.

## Acceptance criteria

- [ ] SPEC updated at: `docs/projects/pipeline-realism/resources/spec/sections/authoring-and-config.md`
- [ ] Migration slice created/updated at: not required for this docs-only decision (track migration in the dedicated migration-slices docs when implementation starts)
- [ ] Follow-ups tracked: none needed

