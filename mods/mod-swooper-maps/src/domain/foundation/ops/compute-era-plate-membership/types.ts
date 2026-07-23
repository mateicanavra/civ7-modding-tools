import type { Static } from "@swooper/mapgen-core/authoring/contracts";

type FoundationMesh = Static<typeof import("../../artifacts/mesh.artifact.js").artifact.schema>;
type FoundationPlateGraph = Static<
  typeof import("../../artifacts/plate-graph.artifact.js").artifact.schema
>;
type FoundationPlateMotion = Static<
  typeof import("../../artifacts/plate-motion.artifact.js").artifact.schema
>;

export type EraPlateMembershipMesh = Pick<
  FoundationMesh,
  "cellCount" | "wrapWidth" | "siteX" | "siteY" | "neighborsOffsets" | "neighbors"
>;

export type EraPlateMembershipPlate = Pick<
  FoundationPlateGraph["plates"][number],
  "id" | "seedX" | "seedY"
>;

export type EraPlateMembershipParams = Readonly<{
  mesh: EraPlateMembershipMesh;
  plates: ReadonlyArray<EraPlateMembershipPlate>;
  currentCellToPlate: FoundationPlateGraph["cellToPlate"];
  plateVelocityX: FoundationPlateMotion["plateVelocityX"];
  plateVelocityY: FoundationPlateMotion["plateVelocityY"];
  driftStepsByEra: ReadonlyArray<number>;
  eraCount: number;
}>;
