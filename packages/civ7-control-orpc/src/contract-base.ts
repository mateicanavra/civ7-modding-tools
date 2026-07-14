import type { Schema } from "@orpc/contract";
import { type EffectContractBuilder, eoc } from "effect-orpc";

import { type Civ7ControlOrpcEffectErrorMap, civ7ControlOrpcErrorMap } from "./errors";
import type { Civ7ControlOrpcProcedureMeta } from "./metadata";

export const civ7ControlOrpcRouterContractBase = eoc.$meta<Civ7ControlOrpcProcedureMeta>({});

export const civ7ControlOrpcContractBase: EffectContractBuilder<
  Schema<unknown, unknown>,
  Schema<unknown, unknown>,
  Civ7ControlOrpcEffectErrorMap,
  Civ7ControlOrpcProcedureMeta
> = civ7ControlOrpcRouterContractBase.errors(civ7ControlOrpcErrorMap);
