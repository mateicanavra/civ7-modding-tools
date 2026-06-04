import {
  ORPCTaggedError,
  type EffectErrorMap,
  type EffectErrorMapToErrorMap,
} from "effect-orpc";
import { Type, type Static } from "typebox";

import { toStandardSchema } from "./typebox-standard-schema";

export const Civ7DirectControlUnavailableErrorDataSchema = Type.Object(
  {
    procedureKey: Type.Literal("runtime.playable.status"),
    source: Type.Literal("direct-control-facade"),
  },
  { additionalProperties: false },
);
export type Civ7DirectControlUnavailableErrorData = Static<
  typeof Civ7DirectControlUnavailableErrorDataSchema
>;

export class Civ7DirectControlUnavailableError extends ORPCTaggedError(
  "Civ7DirectControlUnavailableError",
  {
    code: "DIRECT_CONTROL_UNAVAILABLE",
    message: "Direct-control playable status failed.",
    schema: toStandardSchema(Civ7DirectControlUnavailableErrorDataSchema),
    status: 503,
  },
) {}

export const civ7ControlOrpcErrorMap = {
  DIRECT_CONTROL_UNAVAILABLE: Civ7DirectControlUnavailableError,
} satisfies EffectErrorMap;

export type Civ7ControlOrpcEffectErrorMap = typeof civ7ControlOrpcErrorMap;
export type Civ7ControlOrpcErrorMap =
  EffectErrorMapToErrorMap<Civ7ControlOrpcEffectErrorMap>;
