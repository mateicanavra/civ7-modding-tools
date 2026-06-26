import { module } from "./module.js";

export const checkRouter = {
  run: module.run.effect(function* ({ context, input }) {
    const { checkCommandContext, selectorsFromInput, structuralCheck } = context;
    return yield* structuralCheck.createReport({
      ...selectorsFromInput(input),
      ...(input.base ? { base: input.base } : {}),
      baselineIntegrity: input.baselineIntegrity ?? false,
      command: checkCommandContext(),
      staged: input.staged ?? false,
      ...(input.stagedPaths ? { stagedPaths: input.stagedPaths } : {}),
    });
  }),
  expandBaseline: module.expandBaseline.effect(function* ({ context, input }) {
    const { describeRuleSelectionFailure, selectorsFromInput, structuralCheck } = context;
    const expansion = yield* structuralCheck.expandBaselines(selectorsFromInput(input), {
      base: input.base ?? "main",
    });
    if (expansion.ok) return { kind: "expanded", messages: expansion.messages };
    return { kind: "refused", message: describeRuleSelectionFailure(expansion) };
  }),
};

export const router = checkRouter;
