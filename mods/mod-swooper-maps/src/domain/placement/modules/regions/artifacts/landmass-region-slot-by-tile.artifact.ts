import {
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/** Registers gameplay region slots derived from Morphology landmasses before placement. */
export const artifact = defineArtifact({
  name: "landmassRegionSlotByTile",
  id: "artifact:map.landmassRegionSlotByTile",
  schema: Type.Object(
    {
      slotByTile: TypedArraySchemas.u8({
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
  refine: (input, context): readonly ArtifactValidationIssue[] => {
    const { slotByTile } = input as Readonly<{ slotByTile: Uint8Array }>;
    const issues: ArtifactValidationIssue[] = [];
    if (
      !appendArtifactTypedArrayIssues(
        issues,
        "landmassRegionSlotByTile.slotByTile",
        slotByTile,
        Uint8Array,
        artifactCellCount(context)
      )
    ) {
      return issues;
    }
    if (slotByTile.length === 0) {
      issues.push({ message: "landmassRegionSlotByTile.slotByTile must be non-empty." });
      return issues;
    }
    for (let index = 0; index < slotByTile.length; index++) {
      const slot = slotByTile[index] ?? 0;
      if (slot > 2) {
        issues.push({
          message: `slotByTile[${index}] = ${slot} outside the slot domain {0,1,2}.`,
        });
        return issues;
      }
    }
    return issues;
  },
});
