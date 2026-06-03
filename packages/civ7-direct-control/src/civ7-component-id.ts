import { Type, type Static } from "typebox";
import { Value } from "typebox/value";

import { Civ7DirectControlError } from "./direct-control-error.js";

export const Civ7ComponentIdSchema = Type.Object(
  {
    owner: Type.Number(),
    id: Type.Number(),
    type: Type.Optional(Type.Number()),
  },
  { additionalProperties: false },
);

export type Civ7ComponentId = Static<typeof Civ7ComponentIdSchema>;

export function isCiv7ComponentId(value: unknown): value is Civ7ComponentId {
  return Value.Check(Civ7ComponentIdSchema, value);
}

export function assertCiv7ComponentId(value: unknown, label = "ComponentID"): Civ7ComponentId {
  if (isCiv7ComponentId(value)) return value;
  throw new Civ7DirectControlError(
    "command-failed",
    `${label} must be a Civ7 ComponentID object with numeric owner, id, and optional type`,
    { details: { value } },
  );
}
