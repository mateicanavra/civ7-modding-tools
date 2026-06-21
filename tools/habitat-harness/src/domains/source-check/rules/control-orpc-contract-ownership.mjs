import { sourceCheckRuntime as runtime } from "../rule-runtime.mjs";

export const ruleId = "control-orpc-contract-ownership";

export function diagnosticsForRule(rule, file) {
  return [
    ...runtime
      .importRefs(file)
      .filter((ref) =>
        runtime.pathMatches(file, /packages\/civ7-control-orpc\/src\/modules\/.*\/contract\.ts$/)
      )
      .filter((ref) => ref.kind === "import" && ref.source === "@civ7/direct-control")
      .map((ref) => runtime.diagnostic(rule, file, ref.node)),
    ...runtime
      .exportedConstNames(file)
      .filter(({ name }) =>
        /^Civ7[A-Za-z0-9]+(?:Input|Result|Output)Schema$|^Civ7[A-Za-z0-9]+StandardSchema$/.test(
          name
        )
      )
      .filter(() =>
        runtime.pathMatches(file, /packages\/civ7-control-orpc\/src\/modules\/.*\/contract\.ts$/)
      )
      .map(({ node }) => runtime.diagnostic(rule, file, node)),
    ...runtime
      .schemaExportsFromControlIndex(file)
      .map((node) => runtime.diagnostic(rule, file, node)),
  ];
}
