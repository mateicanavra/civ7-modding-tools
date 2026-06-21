import { sourceCheckRuntime as runtime } from "../rule-runtime.mjs";

export const ruleId = "sdk-mapgen-entrypoint";

export function diagnosticsForRule(rule, file) {
  return runtime.sdkMapgenEntrypointDiagnostics(rule, file);
}
