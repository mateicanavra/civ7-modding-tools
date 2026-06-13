import type { Schema } from "@orpc/contract";
import { eoc, type EffectContractBuilder } from "effect-orpc";

import { civ7ControlOrpcErrorMap, type Civ7ControlOrpcEffectErrorMap } from "./errors";
import type { Civ7ControlOrpcProcedureMeta } from "./metadata";

export const civ7ControlOrpcContractBase: EffectContractBuilder<
  Schema<unknown, unknown>,
  Schema<unknown, unknown>,
  Civ7ControlOrpcEffectErrorMap,
  Civ7ControlOrpcProcedureMeta
> = eoc.$meta<Civ7ControlOrpcProcedureMeta>({}).errors(civ7ControlOrpcErrorMap);
