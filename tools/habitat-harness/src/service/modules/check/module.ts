import type { CheckServiceModuleContext } from "../../context.js";
import { service } from "../../impl.js";

export const module = service.check.use(({ next }) =>
  next({ context: {} satisfies CheckServiceModuleContext })
);
