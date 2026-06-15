import type { Civ7ComponentId } from "../../civ7-component-id.js";
import type { Civ7TunerState } from "../../session/types.js";

export type Civ7OperationFamily =
  | "unit-operation"
  | "unit-command"
  | "city-operation"
  | "city-command"
  | "player-operation";

export type Civ7OperationTarget =
  | Readonly<{ unitId: Civ7ComponentId }>
  | Readonly<{ cityId: Civ7ComponentId }>
  | Readonly<{ playerId: number }>;

export type Civ7OperationInput = Civ7OperationTarget &
  Readonly<{
    operationType: string;
    args?: unknown;
  }>;

export type Civ7OperationValidationResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  family: Civ7OperationFamily;
  operationType: string;
  enumValue: unknown;
  target: Civ7OperationTarget;
  args: unknown;
  valid: boolean;
  result: unknown;
}>;
