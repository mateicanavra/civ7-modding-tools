import { habitatServiceImplementer } from "../../impl.js";

export type CheckServiceModuleContext = Record<never, never>;

export const module = habitatServiceImplementer.check.use(({ next }) =>
  next({ context: {} satisfies CheckServiceModuleContext })
);
