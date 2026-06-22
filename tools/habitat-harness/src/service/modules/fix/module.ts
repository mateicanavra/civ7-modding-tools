import type { FixServiceModuleContext } from "../../context.js";
import { habitatServiceImplementer } from "../../impl.js";

export type { FixServiceModuleContext } from "../../context.js";

export const implementer = habitatServiceImplementer.fix.use(({ context, next }) =>
  next({ context: context.fix ?? {} })
);
