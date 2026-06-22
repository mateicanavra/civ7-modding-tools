import type { VerifyServiceModuleContext } from "@internal/habitat-harness/service/base";
import { service } from "@internal/habitat-harness/service/impl";

export const module = service.verify.use(({ next }) =>
  next({ context: {} satisfies VerifyServiceModuleContext })
);
