import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/** Registers gameplay region slots derived from Morphology landmasses before placement. */
export const artifact = defineArtifact({
  name: "landmassRegionSlotByTile",
  id: "artifact:map.landmassRegionSlotByTile",
  schema: Type.Object(
    {
      slotByTile: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description:
          "Per-tile gameplay region slot in tile-index order: 0 none, 1 west, or 2 east.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Gameplay-owned region-slot projection derived from Morphology landmasses before player placement.",
    }
  ),
  refine: ({ slotByTile }, { issues }) => {
    if (slotByTile.length === 0) {
      issues.add("landmassRegionSlotByTile.slotByTile must be non-empty.");
    }
    for (let index = 0; index < slotByTile.length; index++) {
      const slot = slotByTile[index] ?? 0;
      if (slot > 2) {
        issues.add(`slotByTile[${index}] = ${slot} outside the slot domain {0,1,2}.`);
        break;
      }
    }
  },
});
