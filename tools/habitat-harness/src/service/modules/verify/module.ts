import type { VerifyServiceModuleContext } from "../../context.js";
import { service } from "../../impl.js";

export const module = service.verify.use(({ next }) =>
  next({ context: {} satisfies VerifyServiceModuleContext })
);
