import type { RuleFixPreviewService } from "@habitat/cli/resources/rule-fix-preview/index";
import { type HabitatModule, service } from "@habitat/cli/service/impl";

export interface FixModuleContext {
  readonly previewRuleFixes: RuleFixPreviewService["preview"];
}

export const module: HabitatModule<"fix", FixModuleContext> = service.fix.use(({ context, next }) =>
  next({
    context: {
      previewRuleFixes: context.deps.ruleFixPreview.preview,
    } satisfies FixModuleContext,
  })
);
