import type { ContractProcedure, Schema } from "@orpc/contract";
import { type EffectContractBuilder, eoc } from "effect-orpc";
import { toStandardSchema } from "../typeboxStandardSchema.js";
import {
  type RecipeDagEffectErrorMap,
  type RecipeDagErrorMap,
  recipeDagErrorMap,
} from "./errors.js";
import { RecipeDagGetInputSchema, RecipeDagResultSchema } from "./schema.js";

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
