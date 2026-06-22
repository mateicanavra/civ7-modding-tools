import type { FixServiceModuleContext } from "../../context.js";
import { service } from "../../impl.js";

export type { FixServiceModuleContext } from "../../context.js";

export const module = service.fix.use(({ context, next }) => next({ context: context.fix ?? {} }));
