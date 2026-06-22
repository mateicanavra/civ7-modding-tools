import type { VerifyServiceModuleContext } from "../../context.js";
import { habitatServiceImplementer } from "../../impl.js";

export const implementer = habitatServiceImplementer.verify.use(({ next }) =>
  next({ context: {} satisfies VerifyServiceModuleContext })
);
