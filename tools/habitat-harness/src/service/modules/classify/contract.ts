import { habitatServiceErrorMap } from "@internal/habitat-harness/service/errors";
import { ClassifyResultSchema } from "@internal/habitat-harness/service/model/classify/index";
import type { HabitatServiceProcedureContract } from "@internal/habitat-harness/service/procedure-contract";
import { toStandardSchema } from "@internal/habitat-harness/service/typebox-standard-schema";
import { eoc } from "effect-orpc";
import { type Static, Type } from "typebox";

const ClassifyServiceRunInputSchema = Type.Object(
  {
    target: Type.String({ minLength: 1 }),
  },
  { additionalProperties: false, description: "Habitat classify service run request." }
);
export type ClassifyServiceRunInput = Static<typeof ClassifyServiceRunInputSchema>;

const ClassifyServiceRunInputStandardSchema = toStandardSchema(ClassifyServiceRunInputSchema);
const ClassifyServiceRunOutputStandardSchema = toStandardSchema(ClassifyResultSchema);

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
