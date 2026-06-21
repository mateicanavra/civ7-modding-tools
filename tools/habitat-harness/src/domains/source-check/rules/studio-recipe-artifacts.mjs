import { sourceCheckRuntime as runtime } from "../rule-runtime.mjs";

export const ruleId = "studio-recipe-artifacts";

export function diagnosticsForRule(rule, file) {
  return runtime
    .sourceRefsMatching(
      rule,
      file,
      /apps\/mapgen-studio\/src\/.*\.tsx?$/,
      /^mod-swooper-maps\/recipes\/(?:standard|browser-test)$/
    )
    .filter(
      () =>
        !file.path.includes("apps/mapgen-studio/src/browser-runner/") &&
        !file.path.includes("apps/mapgen-studio/src/server/")
    );
}
