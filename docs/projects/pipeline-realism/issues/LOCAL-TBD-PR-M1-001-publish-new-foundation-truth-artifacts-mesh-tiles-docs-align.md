id: LOCAL-TBD-PR-M1-001
title: Publish new Foundation truth artifacts (mesh + tiles) + docs alignment
state: planned
priority: 2
estimate: 8
project: pipeline-realism
milestone: M1-foundation-maximal-cutover
assignees: [codex]
labels: [pipeline-realism]
parent: null
children: []
blocked_by: []
blocked: []
related_to: []
---

<!-- SECTION SCOPE [SYNC] -->
## TL;DR
- Define and publish the new maximal Foundation artifacts (truth + projections) as first-class outputs with stable IDs, schemas, and documentation.

## Deliverables
- Define the new artifact IDs and their schema owners (no “implicit artifacts”):
  - mesh truth (required by milestone acceptance):
    - `artifact:foundation.mantlePotential`
    - `artifact:foundation.mantleForcing`
    - `artifact:foundation.plateMotion`
    - `artifact:foundation.tectonicProvenance`
  - tile projections (defined here; emitted/wired in `LOCAL-TBD-PR-M1-002`):
    - `artifact:foundation.tectonicHistoryTiles`
    - `artifact:foundation.tectonicProvenanceTiles`
- Register these artifacts as authoring contracts where appropriate:
  - add tag constants to the canonical tag source (`packages/mapgen-core/src/core/types.ts`) so downstream code can import IDs, not retype strings.
  - add `defineArtifact(...)` contracts in the standard recipe Foundation stage artifact registry (`mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts`) for any artifacts owned by that stage.
- Update project docs so the implementation cannot drift:
  - `docs/projects/pipeline-realism/resources/spec/artifact-catalog.md` (add/update entries; space + dtype + shape + semantics)
  - `docs/projects/pipeline-realism/resources/spec/schema-and-versioning.md` (versioning posture for the new artifacts)
  - `docs/system/libs/mapgen/reference/domains/FOUNDATION.md` (once the new artifacts become part of the canonical domain contract; keep “truth vs projection” stance consistent)

## Acceptance Criteria
- Artifact IDs exist as importable constants (no string retyping in consumers).
- Each new artifact has a single schema owner (TypeBox schema location is explicit), and the schema matches the project’s artifact catalog.
- Any temporary bridge artifact/surface introduced during the cutover has:
  - an explicit deletion target issue (`LOCAL-TBD-PR-M1-023..025`), and
  - an explicit “authoritative truth” statement (“new maximal artifacts are authoritative; legacy is transitional only”).

## Testing / Verification
- `bun run --cwd mods/mod-swooper-maps test`
- Add/extend a contract guard test ensuring the new artifact IDs are present and stable:
  - `mods/mod-swooper-maps/test/foundation/contract-guard.test.ts` (extend), or a new dedicated guard file under `mods/mod-swooper-maps/test/foundation/`.
- Add/extend a pipeline contract test that fails loudly if a step declares it provides a new artifact but does not publish it:
  - `mods/mod-swooper-maps/test/pipeline/artifacts.test.ts` (extend pattern “fails provides when…”).

## Dependencies / Notes
- Blocked by: none
- Related:
  - (none)

### Implementation Anchors
- `packages/mapgen-core/src/core/types.ts` (artifact tag constants; avoid stringly-typed ids in consumers)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts` (canonical `defineArtifact(...)` registry for Foundation artifacts)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/*.contract.ts` (requires/provides declarations; must match what steps actually publish)
- `mods/mod-swooper-maps/test/pipeline/artifacts.test.ts` (pipeline artifact “provides” contract checks)
- `mods/mod-swooper-maps/test/foundation/contract-guard.test.ts` (artifact id + schema drift guard)

### References
- docs/projects/pipeline-realism/resources/spec/artifact-catalog.md
- docs/projects/pipeline-realism/resources/spec/schema-and-versioning.md
- docs/system/libs/mapgen/reference/ARTIFACTS.md
- docs/system/libs/mapgen/reference/domains/FOUNDATION.md

---

<!-- SECTION IMPLEMENTATION [NOSYNC] -->
## Implementation Details (Local Only)

### Quick Navigation
- [TL;DR](#tldr)
- [Deliverables](#deliverables)
- [Acceptance Criteria](#acceptance-criteria)
- [Testing / Verification](#testing--verification)
- [Dependencies / Notes](#dependencies--notes)

### Current State (Observed)

Foundation artifacts today (standard recipe) are documented canonically in:
- `docs/system/libs/mapgen/reference/domains/FOUNDATION.md` (truth vs projection posture + artifact list)

In code, “artifact ID” identity is split between:
- tag constants: `packages/mapgen-core/src/core/types.ts` (e.g. `FOUNDATION_MESH_ARTIFACT_TAG`)
- artifact contracts: `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts` (`foundationArtifacts`)

### Proposed Change Surface

Implementation is expected to touch (non-exhaustive, but the “main highways”):
- `packages/mapgen-core/src/core/types.ts` (new `FOUNDATION_*_ARTIFACT_TAG` exports)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts` (new `defineArtifact` contracts)
- `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/steps/*.contract.ts` (requires/provides lists; if step ownership changes)
- `docs/projects/pipeline-realism/resources/spec/artifact-catalog.md` (normative artifact entries)

## Implementation Decisions

- **Plate motion artifact naming:** `artifact:foundation.plateMotion` is the canonical ID (per milestone + artifact catalog). The schema mirrors the `plateKinematics` contract defined in `docs/projects/pipeline-realism/resources/spec/sections/plate-motion.md`; `plateKinematics` remains a schema concept, not a separate artifact id.
- **Versioned payloads for new artifacts:** new maximal artifacts introduced here carry `version: 1` at top level; legacy artifacts without explicit `version` remain unchanged until their owning issues upgrade producers.

### Pitfalls / Rakes

- “We implemented the algorithm but forgot the contract surface”: new arrays exist but are not published as artifacts, so consumers can’t rely on them.
- “Two schema owners”: artifact schema defined in multiple places (or implied by runtime), leading to drift and broken dumps/studio rendering.
- “Legacy remains authoritative”: new artifacts exist but codepaths still read legacy truth silently. If a bridge exists, it must be explicit and have a deletion target.

### Wow Scenarios

- **Causal spine replay:** with visualization enabled, an author can point to a change in `artifact:foundation.mantlePotential` and see a consistent downstream change in plates → events → provenance → belts, with the IDs and schemas stable enough to diff two runs mechanically.
