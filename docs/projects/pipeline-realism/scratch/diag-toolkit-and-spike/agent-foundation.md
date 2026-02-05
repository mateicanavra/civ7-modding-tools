# Scratch — Foundation audit

## Outputs (current artifact surface)

From `mods/mod-swooper-maps/src/recipes/standard/stages/foundation/artifacts.ts`:
- `foundationArtifacts.mesh`
- `foundationArtifacts.mantlePotential`
- `foundationArtifacts.mantleForcing`
- `foundationArtifacts.crustInit`
- `foundationArtifacts.crust`
- `foundationArtifacts.plateGraph`
- `foundationArtifacts.plateMotion`
- `foundationArtifacts.tectonicSegments`
- `foundationArtifacts.tectonicHistory`
- `foundationArtifacts.tectonicProvenance`
- `foundationArtifacts.plates`
- `foundationArtifacts.tileToCellIndex`
- `foundationArtifacts.crustTiles`
- `foundationArtifacts.tectonicHistoryTiles`
- `foundationArtifacts.tectonicProvenanceTiles`
- `foundationArtifacts.plateTopology`
- `foundationArtifacts.tectonics`

## Key degeneracy (must fix)

`foundation.crustTiles.type` is uniform (`min=max=1`) in the canonical probe.

Anchor:
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-plates-tensors/lib/project-plates.ts` projects `crust.type[cellId]` → tile type.

Likely cause (mechanical):
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-crust-evolution/index.ts` computes:
  - `maturity01 = clamp01(upliftToMaturity*uplift + ageToMaturity*materialAge + (1 - disruptionToMaturity*disruption))`
  - `type = maturity01 >= 0.55 ? 1 : 0`
If `materialAge01` is high everywhere and disruption is weak, maturity saturates → type=1 everywhere.

## Normalization traps class

Mantle potential amplitude scaling is prone to cancellation via normalization:
- `mods/mod-swooper-maps/src/domain/foundation/ops/compute-mantle-potential/index.ts` (`normalizeSigned`)

