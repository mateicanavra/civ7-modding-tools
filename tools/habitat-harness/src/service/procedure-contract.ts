import type { AnySchema } from "@orpc/contract";
import type { EffectContractProcedureBuilderWithInputOutput } from "effect-orpc";
import type { HabitatServiceErrorMap } from "./errors.js";
import type { HabitatServiceProcedureMeta } from "./metadata.js";

export type HabitatServiceProcedureContract<
  Input extends AnySchema,
  Output extends AnySchema,
> = EffectContractProcedureBuilderWithInputOutput<
  Input,
  Output,
  HabitatServiceErrorMap,
  HabitatServiceProcedureMeta
>;
