import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Surface preparation evidence (`artifact:placement.surfacePreparation`). One artifact per file by repo convention. */
const PlacementSurfacePreparationSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    slotCounts: Type.Object(
      {
        none: Type.Integer({ minimum: 0 }),
        west: Type.Integer({ minimum: 0 }),
        east: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false }
    ),
    acceptedLakeTileCount: Type.Integer({
      minimum: 0,
      description: "Lake tiles accepted by map-hydrology projection before placement maintenance.",
    }),
    finalLakeWaterDriftCount: Type.Integer({
      minimum: 0,
      description:
        "Accepted lake tiles that no longer read as water after final placement surface maintenance.",
    }),
    finalLakeClassificationDriftCount: Type.Integer({
      minimum: 0,
      description:
        "Accepted lake tiles that no longer read as Civ7 lake tiles after final placement surface maintenance.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Transactional placement preparation result. This exists so resource/start/discovery products depend on a named prepared engine surface instead of a broad placement monolith, while retaining final evidence that engine maintenance did not dry projected lakes.",
  }
);

export const Schema = PlacementSurfacePreparationSchema;

export const artifact = defineArtifact({
  name: "placementSurfacePreparation",
  id: "artifact:placement.surfacePreparation",
  schema: Schema,
});

export const placementSurfacePreparationArtifact = artifact;
