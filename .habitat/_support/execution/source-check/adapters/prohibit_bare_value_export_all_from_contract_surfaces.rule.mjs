import { sourceCheckRuntime as runtime } from "../runtime/rule-runtime.policy.mjs";

export const ruleId = "prohibit_bare_value_export_all_from_contract_surfaces";
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
