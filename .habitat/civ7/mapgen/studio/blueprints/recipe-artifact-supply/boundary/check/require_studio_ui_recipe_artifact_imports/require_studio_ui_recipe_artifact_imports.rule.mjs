import { sourceCheckRuntime as runtime } from "../../../../../../../../habitat/toolkit/blueprints/_self/structure/triage/preserve_legacy_source_check_runtime_during_cutover/rule-runtime.policy.mjs";

export const ruleId = "require_studio_ui_recipe_artifact_imports";
export const candidateExtensions = [".ts", ".tsx"];

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
