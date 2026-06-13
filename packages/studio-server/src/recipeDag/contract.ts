import type { ContractProcedure } from "@orpc/contract";
import type { Schema } from "@orpc/contract";
import { eoc, type EffectContractBuilder } from "effect-orpc";

import {
  recipeDagErrorMap,
  type RecipeDagEffectErrorMap,
  type RecipeDagErrorMap,
} from "./errors.js";
import { RecipeDagGetInputSchema, RecipeDagResultSchema } from "./schema.js";
import { toStandardSchema } from "../typeboxStandardSchema.js";

export type RecipeDagProcedureMeta = Readonly<{
  family?: "recipe-dag";
  procedureKey?: "recipeDag.get";
  proofBoundary?: "local-package-test";
  risk?: "read-only";
}>;

const recipeDagContractBase: EffectContractBuilder<
  Schema<unknown, unknown>,
  Schema<unknown, unknown>,
  RecipeDagEffectErrorMap,
  RecipeDagProcedureMeta
> = eoc.$meta<RecipeDagProcedureMeta>({}).errors(recipeDagErrorMap);

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
