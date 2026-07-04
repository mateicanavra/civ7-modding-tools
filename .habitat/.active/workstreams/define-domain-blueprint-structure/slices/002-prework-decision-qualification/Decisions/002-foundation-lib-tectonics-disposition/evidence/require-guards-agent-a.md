# Require Guards Agent A Evidence

Status: complete investigation artifact

Scope: export and consumer matrix for
`mods/mod-swooper-maps/src/domain/foundation/lib/require.ts`.

Narsil was used first for symbol references; `rg` and source inspection
corroborated source consumers. Narsil import graph did not resolve `.js`
specifier imports for this file, so symbol references and `rg` are the
controlling source-consumer evidence.

| Guard | Signature | Predicate semantics | Consumers | Existing wrapper | Notes |
| --- | --- | --- | --- | --- | --- |
| `requireMesh` | `(mesh, scope) => FoundationMesh` | Missing check; `cellCount | 0 > 0`; finite positive `wrapWidth`; `siteX`, `siteY`, `areas` as `Float32Array` length `cellCount`; `neighborsOffsets` as `Int32Array` length `cellCount + 1`; `neighbors` as `Int32Array`. | Direct: `compute-plates-tensors`, `compute-tectonic-segments`, `compute-crust`, `compute-plate-graph`, `compute-mantle-potential`, `compute-mantle-forcing`, `compute-plate-motion`, `compute-crust-evolution`. Wrapper-mediated: `compute-era-plate-membership`, `compute-tectonic-provenance`, `compute-segment-events`, `compute-era-tectonic-fields`, `compute-hotspot-events`, `compute-tracer-advection`. | Pure pass-through wrappers in the six wrapper-mediated `rules/index.ts` files. | Broadest consumer set; all uses are operation input preconditions. |
| `requireCrust` | `(crust, cellCount, scope) => FoundationCrust` | Missing check; typed-array constructor and `cellCount` length checks for crust payload fields. | Direct: `compute-plates-tensors`, `compute-tectonic-segments`, `compute-plate-graph`, `compute-crust-evolution`. Wrapper-mediated: `compute-segment-events`. | Pure pass-through wrapper in `compute-segment-events/rules/index.ts`. | `compute-crust-evolution` uses `crustInit`. |
| `requireMantlePotential` | `(mantle, cellCount, scope) => FoundationMantlePotential` | Missing check; `cellCount` match; `potential` length; nonnegative `sourceCount`; source arrays match `sourceCount`. | Direct: `compute-mantle-forcing`. | None. | Single source consumer, still artifact-shaped. |
| `requireMantleForcing` | `(forcing, cellCount, scope) => FoundationMantleForcing` | Missing check; `cellCount` match; forcing arrays have expected constructors and `cellCount` length. | Direct: `compute-crust`, `compute-plate-motion`. Wrapper-mediated: `compute-hotspot-events`, `compute-tracer-advection`. | Pure pass-through wrappers in hotspot and tracer rules. | Shape/length precondition only. |
| `requirePlateGraph` | `(graph, cellCount, scope) => FoundationPlateGraph` | Missing check; `cellToPlate` as `Int16Array` length `cellCount`; `plates` is nonempty array. | Direct: `compute-plates-tensors`, `compute-tectonic-segments`, `compute-plate-motion`. Wrapper-mediated: `compute-era-plate-membership`, `compute-tectonic-provenance`. | Pure pass-through wrappers in membership and provenance rules. | Plate-count coupling belongs to `requirePlateMotion`. |
| `requirePlateMotion` | `(motion, cellCount, plateCount, scope) => FoundationPlateMotion` | Missing check; `cellCount` and `plateCount` matches; plate arrays length `plateCount`; `cellFitError` length `cellCount`. | Direct: `compute-plates-tensors`, `compute-tectonic-segments`. Wrapper-mediated: `compute-era-plate-membership`. | Pure pass-through wrapper in membership rules. | Current source requires `Uint8Array` for `cellFitError`. |
| `requireTectonics` | `(tectonics, cellCount, scope) => FoundationTectonics` | Missing check; all current tectonics fields are `Uint8Array` length `cellCount`. | Direct: `compute-plates-tensors`, `compute-crust-evolution`. | None. | Artifact-shaped guard. |
| `requireTectonicHistory` | `(history, cellCount, scope) => FoundationTectonicHistory` | Missing check; era count `5..8`; `eras` length; total arrays and per-era fields as `Uint8Array` length `cellCount`. | Direct: `compute-plates-tensors`, `compute-crust-evolution`. | None. | Docs references were excluded as non-source consumers. |
| `requireTectonicProvenance` | `(provenance, cellCount, scope) => FoundationTectonicProvenance` | Missing check; era count `5..8`; tracer array count and lengths; `cellCount` match; provenance scalar typed arrays length `cellCount`. | Direct optional call in `compute-plates-tensors`. | None. | Caller allows missing provenance by skipping the assertion and passing `null`. |

Coverage: all nine requested guards and all TypeScript source consumers were
accounted for. No tests or source files were changed.
