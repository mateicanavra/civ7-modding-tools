import type { Artifact as FoundationMesh } from "../../artifacts/mesh.artifact.js";
import type { Artifact as FoundationPlateGraph } from "../../artifacts/plate-graph.artifact.js";
import type { Artifact as FoundationPlateMotion } from "../../artifacts/plate-motion.artifact.js";

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
