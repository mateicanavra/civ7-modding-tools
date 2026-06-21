import { ClassifyResultSchema } from "@internal/habitat-harness/service/modules/graph/workspace/schema";
import type { ContractProcedure } from "@orpc/contract";
import { eoc } from "effect-orpc";
import { type Static, Type } from "typebox";
import { type HabitatServiceErrorMap, habitatServiceErrorMap } from "../../errors.js";
import type { HabitatServiceProcedureMeta } from "../../metadata.js";
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

export type ClassifyServiceRunContract = ContractProcedure<
  typeof ClassifyServiceRunInputStandardSchema,
  typeof ClassifyServiceRunOutputStandardSchema,
  HabitatServiceErrorMap,
  HabitatServiceProcedureMeta
>;

export const classifyServiceRunContract: ClassifyServiceRunContract = eoc
  .errors(habitatServiceErrorMap)
  .input(ClassifyServiceRunInputStandardSchema)
  .output(ClassifyServiceRunOutputStandardSchema);

export type ClassifyServiceContract = Readonly<{
  run: ClassifyServiceRunContract;
}>;

export const classifyServiceContract: ClassifyServiceContract = {
  run: classifyServiceRunContract,
};
