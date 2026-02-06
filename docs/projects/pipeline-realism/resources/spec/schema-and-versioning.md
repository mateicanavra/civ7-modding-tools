# Schema and Versioning (Pipeline-Realism)

This document defines how maximal Pipeline-Realism artifacts evolve without drifting downstream consumers (Morphology) or visualization.

## Constraints

- Artifact IDs must remain stable and do not support `@vN` suffixing in the id string (existing contract enforcement).
- Artifacts are publish-once, read-only (`docs/system/libs/mapgen/reference/ARTIFACTS.md`).
- Config compilation is strict and deterministic (`docs/system/libs/mapgen/reference/CONFIG-COMPILATION.md`).

## Versioning Policy (Normative)

### Payload versions

All Pipeline-Realism “public” artifacts SHOULD include:

- `version: number` at top level (major-only).

Where “public” means:

- consumed by a different stage (cross-domain seam), or
- consumed by visualization as part of the authoring loop, or
- listed in `docs/projects/pipeline-realism/resources/spec/artifact-catalog.md`.

### Authoring surface version

The Foundation authoring surface is versioned separately from artifact payloads:

- `foundation.version` (stage config) is the **authoring surface version**.
- The stage surface schema enforces the current major (M1 uses `version: 1`).
- Any breaking change to the authoring surface requires:
  - incrementing `foundation.version`, and
  - updating shipped presets/configs (e.g., `swooper-earthlike.config.json`) in the same change.

### Change taxonomy

1. **Breaking change** (shape OR meaning)
   - examples:
     - field removed/renamed
     - range/units/anchors change (meaning change)
     - interpretation changes that affect thresholds or downstream behavior
   - required actions:
     - bump payload `version`, and update all consumers in lockstep, OR
     - publish a parallel artifact id (e.g., `artifact:foundation.mantleForcingV2`) during migration and add an adapter step

2. **Additive change** (safe extension)
   - example: new field added that does not change existing meanings
   - required actions:
     - update schema + catalog
     - update all consumers that strict-validate payloads

3. **Bugfix** (same contract)
   - example: numerical bug fix but same meaning and ranges
   - required actions:
     - no version bump
     - strengthen D09r invariants/tests to prevent regression

## Parallel Artifacts vs Adapter Steps

When a breaking change cannot be landed atomically:

- publish a new artifact id (V2) in parallel
- add an adapter step that produces the legacy shape (bridge)
- add a deletion trigger in migration slices to remove the adapter and legacy artifact

This preserves strict compilation and avoids long-lived union types in consumers.

## Visualization Compatibility

Visualization must not guess semantics:

- `dataTypeKey` remains stable for a semantic concept.
- If payload versions differ, producers must supply value semantics (domain, transforms) via metadata, or expose version explicitly in layer meta.
- Avoid “v2” in `dataTypeKey`. Prefer to keep the same semantic key and disambiguate in payload and/or `variantKey` only when comparing.

## Schema Ownership

Normative sources:

- Units and anchors: `docs/projects/pipeline-realism/resources/spec/units-and-scaling.md`
- Artifact catalog: `docs/projects/pipeline-realism/resources/spec/artifact-catalog.md`
- Validation gates: `docs/projects/pipeline-realism/resources/spec/sections/validation-and-observability.md`

Any artifact schema change MUST update all three where relevant.
