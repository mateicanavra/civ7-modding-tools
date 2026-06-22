import {
  type CheckServiceModuleContext,
  requiredHabitatServiceDependency,
} from "@internal/habitat-harness/service/base";
import { service } from "@internal/habitat-harness/service/impl";
import type { StructuralCheckService } from "@internal/habitat-harness/service/model/check/policy/structural/index";

export type CheckModuleContext = CheckServiceModuleContext & {
  readonly structuralCheck: StructuralCheckService;
};

export const module = service.check.use(({ context, next }) =>
  next({
    context: {
      ...(context.check ?? {}),
      structuralCheck: requiredHabitatServiceDependency(
        context.deps.structuralCheck,
        "structuralCheck"
      ),
    } satisfies CheckModuleContext,
  })
);
