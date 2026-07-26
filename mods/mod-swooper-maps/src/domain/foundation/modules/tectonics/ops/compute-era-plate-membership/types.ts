import type { Plate } from "../../../lithosphere/model/atoms/plate.schema.js";

export type EraPlateMembershipMesh = Readonly<{
  cellCount: number;
  wrapWidth: number;
  siteX: Float32Array;
  siteY: Float32Array;
  neighborsOffsets: Int32Array;
  neighbors: Int32Array;
}>;

export type EraPlateMembershipPlate = Pick<Plate, "id" | "seedX" | "seedY">;

export type EraPlateMembershipParams = Readonly<{
  mesh: EraPlateMembershipMesh;
  plates: ReadonlyArray<EraPlateMembershipPlate>;
  currentCellToPlate: Int16Array;
  plateVelocityX: Float32Array;
  plateVelocityY: Float32Array;
  driftStepsByEra: ReadonlyArray<number>;
  eraCount: number;
}>;
