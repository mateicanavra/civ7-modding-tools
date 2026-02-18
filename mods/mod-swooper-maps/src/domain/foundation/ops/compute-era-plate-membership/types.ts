import type { FoundationMesh } from "../compute-mesh/contract.js";
import type { FoundationPlateGraph } from "../compute-plate-graph/contract.js";
import type { FoundationPlateMotion } from "../compute-plate-motion/contract.js";

export type EraPlateMembershipMesh = Pick<
  FoundationMesh,
  "cellCount" | "wrapWidth" | "siteX" | "siteY" | "neighborsOffsets" | "neighbors"
>;

export type EraPlateMembershipPlate = Pick<FoundationPlateGraph["plates"][number], "id" | "seedX" | "seedY">;

export type EraPlateMembershipParams = Readonly<{
  mesh: EraPlateMembershipMesh;
  plates: ReadonlyArray<EraPlateMembershipPlate>;
  currentCellToPlate: FoundationPlateGraph["cellToPlate"];
  plateVelocityX: FoundationPlateMotion["plateVelocityX"];
  plateVelocityY: FoundationPlateMotion["plateVelocityY"];
  driftStepsByEra: ReadonlyArray<number>;
  eraCount: number;
}>;
