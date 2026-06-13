import type { Schema } from "@orpc/contract";
import { type EffectContractBuilder, eoc } from "effect-orpc";

import { type Civ7ControlOrpcEffectErrorMap, civ7ControlOrpcErrorMap } from "./errors";
import type { Civ7ControlOrpcProcedureMeta } from "./metadata";

export const civ7ControlOrpcContractBase: EffectContractBuilder<
  Schema<unknown, unknown>,
  Schema<unknown, unknown>,
  Civ7ControlOrpcEffectErrorMap,
  Civ7ControlOrpcProcedureMeta
> = eoc.$meta<Civ7ControlOrpcProcedureMeta>({}).errors(civ7ControlOrpcErrorMap);
