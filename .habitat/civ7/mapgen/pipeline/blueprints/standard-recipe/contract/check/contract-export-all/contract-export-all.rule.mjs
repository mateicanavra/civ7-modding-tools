import { sourceCheckRuntime as runtime } from "../../../../../../../../habitat/toolkit/blueprints/_self/structure/triage/legacy-source-check/rule-runtime.policy.mjs";

export const ruleId = "contract-export-all";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime
    .importRefs(file)
    .filter((ref) => ref.kind === "export" && ref.isNamespaceExport && !ref.isTypeOnly)
    .filter(() =>
      runtime.pathMatches(
        file,
        /mods\/[^/]+\/src\/(?:recipes\/.*\/stages\/.*\/steps\/.*(?:contract|\.contract)|domain\/.*\/ops\/.*\/(?:contract|types|index)|domain\/.*\/ops\/.*\/(?:rules|strategies)\/.*)\.ts$/
      )
    )
    .map((ref) => runtime.diagnostic(rule, file, ref.node));
}
