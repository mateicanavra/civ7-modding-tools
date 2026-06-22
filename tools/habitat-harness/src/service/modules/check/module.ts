import type { CheckServiceModuleContext } from "@internal/habitat-harness/service/base";
import { service } from "@internal/habitat-harness/service/impl";

export const module = service.check.use(({ next }) =>
  next({ context: {} satisfies CheckServiceModuleContext })
);
