import type { RuleFixPlanningService } from "@habitat/cli/resources/rule-fix-planning/index";
import { type HabitatModule, service } from "@habitat/cli/service/impl";

export interface FixModuleContext {
  readonly planRuleFixes: RuleFixPlanningService["plan"];
}

export const module: HabitatModule<"fix", FixModuleContext> = service.fix.use(({ context, next }) =>
  next({
    context: {
      planRuleFixes: context.deps.ruleFixPlanning.plan,
    } satisfies FixModuleContext,
  })
);
