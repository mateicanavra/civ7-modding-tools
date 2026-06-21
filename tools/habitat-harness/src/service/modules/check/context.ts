import { habitatServiceImplementer } from "../../impl.js";

export type CheckServiceModuleContext = Record<never, never>;

export const implementer = habitatServiceImplementer.check.use(({ next }) =>
  next({ context: {} satisfies CheckServiceModuleContext })
);
