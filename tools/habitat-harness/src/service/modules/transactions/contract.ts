import type { ContractProcedure } from "@orpc/contract";
import { eoc } from "effect-orpc";
import {
  PatternApplyRecordSchema,
  PatternApplyRequestSchema,
} from "../../../domains/transformation-transaction/schema.js";
import { type HabitatServiceErrorMap, habitatServiceErrorMap } from "../../errors.js";
import type { HabitatServiceProcedureMeta } from "../../metadata.js";
import { toStandardSchema } from "../../typebox-standard-schema.js";

const TransactionsApplyInputStandardSchema = toStandardSchema(PatternApplyRequestSchema);
const TransactionsApplyOutputStandardSchema = toStandardSchema(PatternApplyRecordSchema);

export type TransactionsApplyContract = ContractProcedure<
  typeof TransactionsApplyInputStandardSchema,
  typeof TransactionsApplyOutputStandardSchema,
  HabitatServiceErrorMap,
  HabitatServiceProcedureMeta
>;

export const transactionsApplyContract: TransactionsApplyContract = eoc
  .errors(habitatServiceErrorMap)
  .input(TransactionsApplyInputStandardSchema)
  .output(TransactionsApplyOutputStandardSchema);

export type TransactionsServiceContract = Readonly<{
  apply: TransactionsApplyContract;
}>;

export const transactionsServiceContract: TransactionsServiceContract = {
  apply: transactionsApplyContract,
};
