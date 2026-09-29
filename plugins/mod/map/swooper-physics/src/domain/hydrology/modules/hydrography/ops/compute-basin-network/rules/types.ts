import type { OperationInput } from "@swooper/mapgen-core/authoring";
import type {
  RawReceiverSchema,
  DrainagePlateauIdSchema,
  DrainageLeafIdSchema,
  BasinNodesSchema,
  BasinRootsSchema,
  BasinSaddlesSchema,
  BasinCatchmentCellsSchema,
  ExternalCatchmentCellsSchema,
  BasinHypsometrySchema,
} from "../../../model/atoms/index.js";

type GeometryInput = Readonly<{
  rawReceiver: OperationInput<typeof RawReceiverSchema>;
  plateauId: OperationInput<typeof DrainagePlateauIdSchema>;
  leafId: OperationInput<typeof DrainageLeafIdSchema>;
  nodes: OperationInput<typeof BasinNodesSchema>;
  roots: OperationInput<typeof BasinRootsSchema>;
  saddles: OperationInput<typeof BasinSaddlesSchema>;
  catchmentCells: OperationInput<typeof BasinCatchmentCellsSchema>;
  externalCatchmentCells: OperationInput<typeof ExternalCatchmentCellsSchema>;
  hypsometry: OperationInput<typeof BasinHypsometrySchema>;
}>;

export type NetworkInput = Readonly<{
  width: number;
  height: number;
  elevation: ArrayLike<number>;
  landMask: ArrayLike<number>;
  geometry: GeometryInput;
  localRunoff: readonly number[];
  rainfall: ArrayLike<number>;
  potentialDemand: ArrayLike<number>;
}>;

export function requireValid(condition: unknown, message: string): asserts condition {
  if (!condition) throw new RangeError(`Invalid basin network input: ${message}.`);
}

export function finite(value: number, name: string): number {
  requireValid(Number.isFinite(value), `nonfinite ${name}`);
  return value;
}
