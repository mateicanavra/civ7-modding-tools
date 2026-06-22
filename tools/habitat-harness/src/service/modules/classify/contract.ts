import { ClassifyResultSchema } from "@internal/habitat-harness/service/modules/graph/workspace/schema";
import { eoc } from "effect-orpc";
import { type Static, Type } from "typebox";
import { habitatServiceErrorMap } from "../../errors.js";
import type { HabitatServiceProcedureContract } from "../../procedure-contract.js";
import { toStandardSchema } from "../../typebox-standard-schema.js";

const ClassifyServiceRunInputSchema = Type.Object(
  {
    target: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false, description: "Habitat classify service run request." }
);
export type ClassifyServiceRunInput = Static<typeof ClassifyServiceRunInputSchema>;

const ClassifyServiceRunInputStandardSchema = toStandardSchema(ClassifyServiceRunInputSchema);
const ClassifyServiceRunOutputStandardSchema = toStandardSchema(ClassifyResultSchema);

// TODO: STOP FUCKING OVERCOMPLICATING THIS. YOU DO NOT NEED TO MANUALLY TYPE THE INPUT AND OUTPUT TYPES. IF YOU'RE DOING THIS, IT'S A FUNDAMENTAL DESIGN SMELL. USE THE EFFECT-ORPC LIBRARY. READ THE DOCS. READ THE ORPC DOCS. LOOK AT CONTRACT FIRST APPROACH.
export const classifyServiceRunContract: HabitatServiceProcedureContract<
  typeof ClassifyServiceRunInputStandardSchema,
  typeof ClassifyServiceRunOutputStandardSchema
> = eoc
  .errors(habitatServiceErrorMap)
  .input(ClassifyServiceRunInputStandardSchema)
  .output(ClassifyServiceRunOutputStandardSchema);

export const classifyServiceContract = {
  run: classifyServiceRunContract,
};
