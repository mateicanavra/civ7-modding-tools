import { sourceCheckRuntime as runtime } from "../rule-runtime.mjs";

export const ruleId = "habitat-adapter-domain-paths";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return runtime.pathMatches(file, /tools\/habitat-harness\/src\/adapters\/grit\/.*\.ts$/) &&
    /packages|apps\/|mods\/|mods\/mod-swooper-maps|apps\/mapgen-studio|\.civ7/.test(file.text)
    ? [
        runtime.diagnostic(
          rule,
          file,
          undefined,
          runtime.firstMatchingLine(file.text, /packages|apps\/|mods\/|\.civ7/)
        ),
      ]
    : [];
}
