import { habitatServiceImplementer } from "../../impl.js";

export type VerifyServiceModuleContext = Record<never, never>;

export const verifyModule = habitatServiceImplementer.verify.use(({ next }) =>
  next({ context: {} satisfies VerifyServiceModuleContext })
);
