import { sourceCheckRuntime as runtime } from "../runtime/rule-runtime.policy.mjs";

export const ruleId = "preserve_mapgen_core_runtime_neutrality";
export const candidateExtensions = [".ts"];

export function diagnosticsForRule(rule, file) {
  return [
    ...runtime
      .importRefs(file)
      .filter(() => runtime.isMapgenCoreProductionSource(file))
      .filter((ref) => ref.kind === "import" && !ref.isTypeOnly)
      .filter((ref) => /^(?:@civ7\/adapter(?:\/civ7)?|\/base-standard\/.+)$/.test(ref.source))
      .map((ref) => runtime.diagnostic(rule, file, ref.node)),
    ...[
      "GameplayMap",
      "TerrainBuilder",
      "ResourceBuilder",
      "FeatureBuilder",
      "AreaBuilder",
      "MapConstructibles",
      "GameInfo",
    ].flatMap((name) =>
      runtime
        .identifierUses(file, name)
        .filter(() => runtime.isMapgenCoreProductionSource(file))
        .map((node) => runtime.diagnostic(rule, file, node))
    ),
    ...runtime
      .identifierUses(file, "createCiv7Adapter")
      .filter(() => runtime.isMapgenCoreProductionSource(file))
      .map((node) => runtime.diagnostic(rule, file, node)),
    ...runtime
      .linesMatching(file.text, /\bengine\s+as\s+unknown\b/)
      .flatMap((line) =>
        runtime.isMapgenCoreProductionSource(file)
          ? [runtime.diagnostic(rule, file, undefined, line)]
          : []
      ),
  ];
}
