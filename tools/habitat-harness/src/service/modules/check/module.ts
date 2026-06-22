import { service } from "@internal/habitat-harness/service/impl";
import type { StructuralCheckService } from "@internal/habitat-harness/service/model/check/policy/structural/index";

export interface CheckModuleContext {
  readonly structuralCheck: StructuralCheckService;
}

export const module = service.check.use(({ context, next }) =>
  next({
    context: {
      structuralCheck: context.deps.structuralCheck,
    } satisfies CheckModuleContext,
  })
);
