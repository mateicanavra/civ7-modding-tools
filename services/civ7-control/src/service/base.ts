import { eoc } from "effect-orpc";

import { civ7ControlOrpcErrorMap } from "./model/errors/control";
import type { Civ7ControlOrpcProcedureMeta } from "./model/policy/metadata";

const root = eoc.$meta<Civ7ControlOrpcProcedureMeta>({});

export const base = root.errors(civ7ControlOrpcErrorMap);
