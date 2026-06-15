import type { ContractProcedure } from "@orpc/contract";
import { oc } from "@orpc/contract";
import { toStandardSchema } from "../typeboxStandardSchema.js";
import { type RecipeDagErrorMap, recipeDagErrorMap } from "./errors.js";
import { RecipeDagGetInputSchema, RecipeDagResultSchema } from "./schema.js";

export type RecipeDagProcedureMeta = Readonly<{
  family?: "recipe-dag";
  procedureKey?: "recipeDag.get";
  proofBoundary?: "local-package-test";
  risk?: "read-only";
}>;

const recipeDagContractBase = oc.$meta<RecipeDagProcedureMeta>({}).errors(recipeDagErrorMap);

const RecipeDagGetInputStandardSchema = toStandardSchema(RecipeDagGetInputSchema);
const RecipeDagResultStandardSchema = toStandardSchema(RecipeDagResultSchema);

export type RecipeDagGetContract = ContractProcedure<
  typeof RecipeDagGetInputStandardSchema,
  typeof RecipeDagResultStandardSchema,
  RecipeDagErrorMap,
  RecipeDagProcedureMeta
>;

export const RecipeDagGetContract: RecipeDagGetContract = recipeDagContractBase
  .input(RecipeDagGetInputStandardSchema)
  .output(RecipeDagResultStandardSchema)
  .meta({
    family: "recipe-dag",
    procedureKey: "recipeDag.get",
    proofBoundary: "local-package-test",
    risk: "read-only",
  });
