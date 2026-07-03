# Rule Remediation: Morphology Overlay Implementation Rail

Status: closed on `codex/habitat-morphology-overlay-implementation-rail`.

Canonical record:
`.habitat/workstreams/rule-remediation-layer1-action-matrix.json`.

This file is a receipt only. It is not a second operational matrix.

## Purpose

Close the packet-needed state for
`prohibit_morphology_overlay_implementation_reads` without moving static source
policy into package-owned tests, creating an MJS replacement script, or waiting
for a broad recipe-step authority that is not needed for this row.

## Authority Read

Morphology already has source-backed authority for this predicate:

- `docs/system/libs/mapgen/reference/domains/MORPHOLOGY.md` defines Morphology
  truth as tile-space Physics truth and names the current standard recipe
  morphology stages/artifacts.
- `docs/projects/engine-refactor-v1/resources/workflow/domain-refactor/plans/morphology/spec/PHASE-2-CORE-MODEL-AND-PIPELINE.md`
  says Morphology must not accept narrative/story/gameplay overlays as inputs.
- `mods/mod-swooper-maps/AGENTS.md` identifies the mod package as owner of
  source recipe content and generated mod output production.

## Decision Packet

| Clause | Owner | Decision |
| --- | --- | --- |
| Static `./overlays.js` imports in non-contract Morphology step implementation files | Standard recipe Morphology context | Retain as live Habitat/Grit source rail. |
| Direct `readOverlay(...)` calls in non-contract Morphology step implementation files | Standard recipe Morphology context | Retain as live Habitat/Grit source rail. |
| Package-owned tests | Forbidden owner | Tests must not become junk drawers for stale structural/source assertions. |
| MJS Habitat script | Rejected strategy | The predicate is static import/call shape expressible in Grit. |
| General recipe-step declared-dependency authority | Not required for this row | A future positive authority may absorb broader cases, but this row whole-fits current Morphology no-overlay input authority after Grit repair. |

## Implementation

The Grit predicate stayed in place and was repaired:

- filename scope now follows the manifest coverage shape
  `morphology[^/]*/steps/**/*.ts`, covering current `morphology*` stage
  directories including `morphology-shelf`;
- import source matching now uses the established optional-quote form for the
  exact `./overlays.js` source.

No package tests, generated outputs, or MJS scripts were added.

## Proof

| Check | Result |
| --- | --- |
| Temporary negative probe | `import { readOverlay } from "./overlays.js"` in `morphology-shelf/steps/computeShelf.ts` failed `bun habitat check --rule prohibit_morphology_overlay_implementation_reads --json` at line 7. |
| Focused rule check after probe removal | `bun habitat check --rule prohibit_morphology_overlay_implementation_reads --json` passed. |
| Canonical JSON | Row now has `packetNeeded: false`; boundary-inversion packet-needed count drops by one; recipe-step positive dependency blocker is removed. |

## Residual Boundary

This slice does not settle the broader overlay/story ownership rows:

- `prohibit_morphology_hotspot_overlay_publishers`
- `prohibit_morphology_story_overlay_contract_artifact`

Those remain separate semantic gates in the canonical JSON.
