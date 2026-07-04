import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const LandmassRegionSlotByTileArtifactSchema = Type.Object(
  {
    slotByTile: TypedArraySchemas.u8({
      description: "Per-tile landmass region slot (0=none, 1=west, 2=east), in tileIndex order.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Gameplay-owned region slot projection derived from Morphology landmasses (Phase 2: slots, not engine ids).",
  }
);

export const Schema = LandmassRegionSlotByTileArtifactSchema;

export const artifact = defineArtifact({
  name: "landmassRegionSlotByTile",
  id: "artifact:map.landmassRegionSlotByTile",
  schema: Schema,
});
