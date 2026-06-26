import { sourceCheckRuntime as runtime } from "../runtime/rule-runtime.policy.mjs";

export const ruleId = "require_sanctioned_direct_control_session_owners";
export const candidateExtensions = [".ts", ".tsx"];

export function diagnosticsForRule(rule, file) {
  return runtime.pathMatches(file, /(?:apps|packages)\/.*\.tsx?$/) &&
    !file.path.includes("packages/studio-server/src/services/Civ7TunerSession.ts") &&
    !file.path.includes("packages/civ7-direct-control/src/session/session.ts") &&
    !runtime.isTestPath(file.path)
    ? runtime
        .newExpressions(file, "Civ7DirectControlSession")
        .map((node) => runtime.diagnostic(rule, file, node))
    : [];
}
