import { module } from "./module.js";

export const checkRouter = {
  report: module.report.effect(function* ({ context, input }) {
    const { checkCommandContext, createCheckReport, selectorsFromInput } = context;
    return yield* createCheckReport({
      ...selectorsFromInput(input),
      ...(input.base ? { base: input.base } : {}),
      baselineIntegrity: input.baselineIntegrity ?? false,
      command: checkCommandContext(),
      staged: input.staged ?? false,
      ...(input.stagedPaths ? { stagedPaths: input.stagedPaths } : {}),
    });
  }),
  expandBaseline: module.expandBaseline.effect(function* ({ context, input }) {
    const { describeRuleSelectionFailure, expandBaselines, selectorsFromInput } = context;
    const expansion = yield* expandBaselines(selectorsFromInput(input), {
      base: input.base ?? "main",
    });
    if (expansion.ok) return { kind: "expanded", messages: expansion.messages };
    return { kind: "refused", message: describeRuleSelectionFailure(expansion) };
  }),
};

export const router = checkRouter;
