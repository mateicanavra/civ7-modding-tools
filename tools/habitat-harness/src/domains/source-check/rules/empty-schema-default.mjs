import { sourceCheckRuntime as runtime } from "../rule-runtime.mjs";

export const ruleId = "empty-schema-default";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime
    .objectProperties(file, "default")
    .filter(() =>
      runtime.pathMatches(
        file,
        /mods\/[^/]+\/src\/(?:domain\/.*\/ops\/(?:.*\/contract|.*\.contract)|recipes\/.*\/steps\/(?:.*\/contract|.*\.contract))\.ts$/
      )
    )
    .filter(
      ({ initializer }) =>
        runtime.ts.isObjectLiteralExpression(initializer) && initializer.properties.length === 0
    )
    .map(({ node }) => runtime.diagnostic(rule, file, node));
}
