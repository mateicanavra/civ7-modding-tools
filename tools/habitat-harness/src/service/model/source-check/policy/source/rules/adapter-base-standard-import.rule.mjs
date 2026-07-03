import { sourceCheckRuntime as runtime } from "../rule-runtime.policy.mjs";

export const ruleId = "adapter-base-standard-import";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime
    .importRefs(file)
    .filter((ref) => runtime.pathMatches(file, /^packages\/.*\.ts$/))
    .filter(() => !file.path.includes("packages/civ7-adapter/"))
    .filter((ref) => /\/base-standard\/.+/.test(ref.source))
    .map((ref) => runtime.diagnostic(rule, file, ref.node));
}
