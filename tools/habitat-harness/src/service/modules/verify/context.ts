import { habitatServiceImplementer } from "../../impl.js";

export type VerifyServiceModuleContext = Record<never, never>;

export const module = habitatServiceImplementer.verify.use(({ next }) =>
  next({ context: {} satisfies VerifyServiceModuleContext })
);
