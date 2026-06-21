import ts from "typescript";
export const sourceCheckRuleIds = [
  "adapter-base-standard-import",
  "contract-export-all",
  "control-app-surface",
  "control-orpc-contract-ownership",
  "cutover-source-guardrails",
  "domain-deep-import",
  "domain-engine-imports",
  "domain-ops-boundary-imports",
  "domain-ops-projection-effects",
  "domain-ops-root-config",
  "domain-root-catalogs",
  "ecology-step-imports",
  "empty-schema-default",
  "habitat-adapter-domain-paths",
  "mapgen-core-runtime-civ7",
  "op-calls-op",
  "ops-bind-runvalidated",
  "placement-outcome-boundary",
  "recipe-domain-surface",
  "recipe-imports-in-domain",
  "recipe-runtime-domain-ops",
  "relative-domain-imports",
  "rng-authority-static",
  "runtime-config-merge",
  "runtime-helper-redeclarations",
  "runtime-run-validated",
  "runtime-validation-imports",
  "sdk-mapgen-entrypoint",
  "sibling-stage-step-imports",
  "stage-contract-dependencies",
  "step-contract-domain-surface",
  "studio-recipe-artifacts",
  "viz-contract-ownership",
  "wrapper-advanced-stage-config",
];
const sourceCheckFactCache = Symbol.for("habitat.source-check.fact-cache");

export function diagnosticsForRule(rule, file) {
  switch (rule.id) {
    case "adapter-base-standard-import":
      return importRefs(file)
        .filter((ref) => pathMatches(file, /^packages\/.*\.ts$/))
        .filter(() => !file.path.includes("packages/civ7-adapter/"))
        .filter((ref) => /\/base-standard\/.+/.test(ref.source))
        .map((ref) => diagnostic(rule, file, ref.node));
    case "contract-export-all":
      return importRefs(file)
        .filter((ref) => ref.kind === "export" && ref.isNamespaceExport && !ref.isTypeOnly)
        .filter(() =>
          pathMatches(
            file,
            /mods\/[^/]+\/src\/(?:recipes\/.*\/stages\/.*\/steps\/.*(?:contract|\.contract)|domain\/.*\/ops\/.*\/(?:contract|types|index)|domain\/.*\/ops\/.*\/(?:rules|strategies)\/.*)\.ts$/
          )
        )
        .map((ref) => diagnostic(rule, file, ref.node));
    case "control-app-surface":
      return pathMatches(file, /(?:apps|packages)\/.*\.tsx?$/) &&
        !file.path.includes("packages/studio-server/src/services/Civ7TunerSession.ts") &&
        !file.path.includes("packages/civ7-direct-control/src/session/session.ts") &&
        !isTestPath(file.path)
        ? newExpressions(file, "Civ7DirectControlSession").map((node) =>
            diagnostic(rule, file, node)
          )
        : [];
    case "control-orpc-contract-ownership":
      return [
        ...importRefs(file)
          .filter((ref) =>
            pathMatches(file, /packages\/civ7-control-orpc\/src\/modules\/.*\/contract\.ts$/)
          )
          .filter((ref) => ref.kind === "import" && ref.source === "@civ7/direct-control")
          .map((ref) => diagnostic(rule, file, ref.node)),
        ...exportedConstNames(file)
          .filter(({ name }) =>
            /^Civ7[A-Za-z0-9]+(?:Input|Result|Output)Schema$|^Civ7[A-Za-z0-9]+StandardSchema$/.test(
              name
            )
          )
          .filter(() =>
            pathMatches(file, /packages\/civ7-control-orpc\/src\/modules\/.*\/contract\.ts$/)
          )
          .map(({ node }) => diagnostic(rule, file, node)),
        ...schemaExportsFromControlIndex(file).map((node) => diagnostic(rule, file, node)),
      ];
    case "cutover-source-guardrails":
      return isSwooperRuntimeSource(file)
        ? [
            ...cutoverShimSurfaceLines(file).map((line) => diagnostic(rule, file, undefined, line)),
            ...cutoverLegacyStageLines(file).map((line) => diagnostic(rule, file, undefined, line)),
            ...cutoverDualStageLines(file).map((line) => diagnostic(rule, file, undefined, line)),
          ]
        : [];
    case "domain-deep-import":
      return sourceRefsMatching(
        rule,
        file,
        /mods\/[^/]+\/src\/(?:recipes|maps)\/.*\.tsx?$/,
        /^@mapgen\/domain\/[^/]+\/(?:ops\/.+|ops-by-id|rules\/.+|strategies\/+.+)$/
      );
    case "domain-engine-imports":
      return importRefs(file)
        .filter((ref) => ref.kind === "import" && !ref.isTypeOnly)
        .filter(() => pathMatches(file, /mods\/mod-swooper-maps\/src\/domain\/.*\/ops\/.*\.ts$/))
        .filter((ref) => /(?:@swooper\/mapgen-core\/engine|@mapgen\/engine)$/.test(ref.source))
        .map((ref) => diagnostic(rule, file, ref.node));
    case "domain-ops-boundary-imports":
      return [
        ...importRefs(file)
          .filter(() => pathMatches(file, /mods\/mod-swooper-maps\/src\/domain\/.*\/ops\/.*\.ts$/))
          .filter((ref) => /^@civ7\/adapter(?:\/|$)/.test(ref.source))
          .map((ref) => diagnostic(rule, file, ref.node)),
        ...identifierUses(file, "ExtendedMapContext")
          .filter(() => pathMatches(file, /mods\/mod-swooper-maps\/src\/domain\/.*\/ops\/.*\.ts$/))
          .map((node) => diagnostic(rule, file, node)),
        ...propertyAccesses(file, "adapter")
          .filter(() => pathMatches(file, /mods\/mod-swooper-maps\/src\/domain\/.*\/ops\/.*\.ts$/))
          .map((node) => diagnostic(rule, file, node)),
      ];
    case "domain-ops-projection-effects":
      return stringLiterals(file)
        .filter(() => pathMatches(file, /mods\/mod-swooper-maps\/src\/domain\/.*\/ops\/.*\.ts$/))
        .filter(({ value }) => value.startsWith("artifact:map.") || value.startsWith("effect:map."))
        .map(({ node }) => diagnostic(rule, file, node));
    case "domain-ops-root-config":
      return sourceRefsMatching(
        rule,
        file,
        /mods\/mod-swooper-maps\/src\/domain\/.*\/ops\/.*\.ts$/,
        /^(?:\.\.\/){2,}config\.js$/
      );
    case "domain-root-catalogs":
      return pathMatches(
        file,
        /mods\/mod-swooper-maps\/src\/domain\/[^/]+\/(?:tags|artifacts)\.ts$/
      )
        ? [diagnostic(rule, file)]
        : [];
    case "ecology-step-imports":
      return [
        ...(isRetiredEcologyPath(file) ? [diagnostic(rule, file)] : []),
        ...importRefs(file)
          .filter(() => isActiveEcologyStagePath(file))
          .filter((ref) => ref.kind === "import" || ref.kind === "export")
          .filter((ref) => /^@mapgen\/domain\/ecology\/(?:ops|rules)(?:$|\/)/.test(ref.source))
          .map((ref) => diagnostic(rule, file, ref.node)),
      ];
    case "empty-schema-default":
      return objectProperties(file, "default")
        .filter(() =>
          pathMatches(
            file,
            /mods\/[^/]+\/src\/(?:domain\/.*\/ops\/(?:.*\/contract|.*\.contract)|recipes\/.*\/steps\/(?:.*\/contract|.*\.contract))\.ts$/
          )
        )
        .filter(
          ({ initializer }) =>
            ts.isObjectLiteralExpression(initializer) && initializer.properties.length === 0
        )
        .map(({ node }) => diagnostic(rule, file, node));
    case "habitat-adapter-domain-paths":
      return pathMatches(file, /tools\/habitat-harness\/src\/adapters\/grit\/.*\.ts$/) &&
        /packages|apps\/|mods\/|mods\/mod-swooper-maps|apps\/mapgen-studio|\.civ7/.test(file.text)
        ? [
            diagnostic(
              rule,
              file,
              undefined,
              firstMatchingLine(file.text, /packages|apps\/|mods\/|\.civ7/)
            ),
          ]
        : [];
    case "mapgen-core-runtime-civ7":
      return [
        ...importRefs(file)
          .filter(() => isMapgenCoreProductionSource(file))
          .filter((ref) => ref.kind === "import" && !ref.isTypeOnly)
          .filter((ref) => /^(?:@civ7\/adapter(?:\/civ7)?|\/base-standard\/.+)$/.test(ref.source))
          .map((ref) => diagnostic(rule, file, ref.node)),
        ...[
          "GameplayMap",
          "TerrainBuilder",
          "ResourceBuilder",
          "FeatureBuilder",
          "AreaBuilder",
          "MapConstructibles",
          "GameInfo",
        ].flatMap((name) =>
          identifierUses(file, name)
            .filter(() => isMapgenCoreProductionSource(file))
            .map((node) => diagnostic(rule, file, node))
        ),
        ...identifierUses(file, "createCiv7Adapter")
          .filter(() => isMapgenCoreProductionSource(file))
          .map((node) => diagnostic(rule, file, node)),
        ...linesMatching(file.text, /\bengine\s+as\s+unknown\b/).flatMap((line) =>
          isMapgenCoreProductionSource(file) ? [diagnostic(rule, file, undefined, line)] : []
        ),
      ];
    case "op-calls-op":
      return sourceRefsMatching(
        rule,
        file,
        /mods\/mod-swooper-maps\/src\/domain\/[^/]+\/ops\/[^/]+\/index\.ts$/,
        /^(?:\.\.\/[^/]+\/index\.js|@mapgen\/domain\/[^/]+\/ops(?:\/index\.js)?)$/
      );
    case "ops-bind-runvalidated":
      return pathMatches(file, /mods\/mod-swooper-maps\/src\/domain\/[^/]+\/ops\/[^/]+\/index\.ts$/)
        ? [
            ...callExpressions(file, "runValidated"),
            ...propertyCallExpressions(file, "bind", "ops"),
          ].map((node) => diagnostic(rule, file, node))
        : [];
    case "placement-outcome-boundary":
      return pathMatches(
        file,
        /mods\/mod-swooper-maps\/src\/recipes\/standard\/stages\/placement\/steps\/placement\/apply\.ts$/
      )
        ? ["generateOfficialResources", "generateOfficialDiscoveries"].flatMap((name) =>
            callExpressions(file, name).map((node) => diagnostic(rule, file, node))
          )
        : [];
    case "recipe-domain-surface":
      return importRefs(file)
        .filter(() => pathMatches(file, /mods\/mod-swooper-maps\/src\/recipes\/.*\.ts$/))
        .filter((ref) => /@mapgen\/domain\/[^/]+\/.+/.test(ref.source))
        .filter((ref) => !/@mapgen\/domain\/[^/]+\/(?:ops|config\.js)$/.test(ref.source))
        .filter(
          (ref) =>
            !/@mapgen\/domain\/[^/]+\/(?:ops\/.+|ops-by-id|rules\/.+|strategies\/.+)/.test(
              ref.source
            )
        )
        .map((ref) => diagnostic(rule, file, ref.node));
    case "recipe-imports-in-domain":
      return sourceRefsMatching(
        rule,
        file,
        /mods\/mod-swooper-maps\/src\/domain\/.*\.ts$/,
        /(?:mod-swooper-maps\/recipes(?:\/|$)|@mapgen\/recipes(?:\/|$)|@mapgen\/recipe(?:\/|$)|@swooper\/recipes(?:\/|$)|(?:\.\.\/)+recipes(?:\/|$))/
      );
    case "recipe-runtime-domain-ops":
      return sourceRefsMatching(
        rule,
        file,
        /mods\/[^/]+\/src\/recipes\/.*\/recipe\.ts$/,
        /^@mapgen\/domain\/[^/]+$/
      );
    case "relative-domain-imports":
      return relativeDomainImportDiagnostics(rule, file);
    case "rng-authority-static":
      return isRngAuthorityScope(file)
        ? [
            ...rngAuthorityLines(file).map((line) =>
              diagnostic(
                rule,
                file,
                undefined,
                line,
                "Keep authored generation off engine RNG and official generators."
              )
            ),
            ...sourceRefsMatching(
              rule,
              file,
              /mods\/mod-swooper-maps\/src\/(?:domain|recipes\/standard)\/.*\.ts$/,
              /^@swooper\/mapgen-core\/lib\/rng$/
            ).map((hit) => ({
              ...hit,
              message:
                "Do not import internal mapgen-core RNG from authored domain or standard recipe source.",
            })),
          ]
        : [];
    case "runtime-config-merge":
      return pathMatches(
        file,
        /mods\/mod-swooper-maps\/src\/(?:recipes\/.*\/stages\/.*\/steps|domain\/.*\/ops)\/.*\.ts$/
      )
        ? [...emptyObjectNullish(file), ...propertyCallExpressions(file, "Default", "Value")].map(
            (node) => diagnostic(rule, file, node)
          )
        : [];
    case "runtime-helper-redeclarations":
      return helperRedeclarations(file)
        .filter(() =>
          pathMatches(
            file,
            /mods\/[^/]+\/src\/(?:recipes\/.*\/stages\/.*\/steps|domain\/.*\/ops\/.*\/strategies)\/.*\.ts$/
          )
        )
        .map((node) => diagnostic(rule, file, node));
    case "runtime-run-validated":
      return pathMatches(
        file,
        /mods\/[^/]+\/src\/(?:recipes\/.*\/stages\/.*\/steps|domain\/.*\/ops\/.*\/strategies)\/.*\.ts$/
      )
        ? [
            ...callExpressions(file, "runValidated"),
            ...propertyCallExpressions(file, "runValidated"),
          ].map((node) => diagnostic(rule, file, node))
        : [];
    case "runtime-validation-imports":
      return sourceRefsMatching(
        rule,
        file,
        /mods\/[^/]+\/src\/(?:recipes\/.*\/stages\/.*\/steps|domain\/.*\/ops\/.*\/strategies)\/.*\.ts$/,
        /^(?:@sinclair\/typebox\/value|@sinclair\/typebox\/compiler|@swooper\/mapgen-core\/compiler\/normalize|@swooper\/mapgen-core\/authoring\/validation|@swooper\/mapgen-core\/authoring\/op\/validation-surface)$/
      );
    case "sdk-mapgen-entrypoint":
      return sdkMapgenEntrypointDiagnostics(rule, file);
    case "sibling-stage-step-imports":
      return sourceRefsMatching(
        rule,
        file,
        /mods\/mod-swooper-maps\/src\/recipes\/standard\/stages\/[^/]+\/.*\.ts$/,
        /.*\.\.\/[^/]+\/steps\/.*/
      );
    case "stage-contract-dependencies":
      return stageContractDependencyDiagnostics(rule, file);
    case "step-contract-domain-surface":
      return sourceRefsMatching(
        rule,
        file,
        /mods\/[^/]+\/src\/recipes\/.*\/stages\/.*\/steps\/(?:.*\/)?(?:contract|[^/]+\.contract)\.ts$/,
        /^@mapgen\/domain\/[^/]+\/.+$/
      ).filter(() => !/\/(?:__tests__|__type_tests__)\//.test(file.path));
    case "studio-recipe-artifacts":
      return sourceRefsMatching(
        rule,
        file,
        /apps\/mapgen-studio\/src\/.*\.tsx?$/,
        /^mod-swooper-maps\/recipes\/(?:standard|browser-test)$/
      ).filter(
        () =>
          !file.path.includes("apps/mapgen-studio/src/browser-runner/") &&
          !file.path.includes("apps/mapgen-studio/src/server/")
      );
    case "viz-contract-ownership":
      return vizContractOwnershipDiagnostics(rule, file);
    case "wrapper-advanced-stage-config":
      return pathMatches(
        file,
        /mods\/mod-swooper-maps\/src\/(?:recipes\/standard|maps)\/.*\.(?:ts|json)$/
      )
        ? propertyNameOccurrences(file, "advanced").map((line) =>
            diagnostic(rule, file, undefined, line)
          )
        : [];
    default:
      return [
        diagnostic(
          rule,
          file,
          undefined,
          1,
          `No native source-check implementation for ${rule.id}.`
        ),
      ];
  }
}
function sourceRefsMatching(rule, file, filePattern, sourcePattern) {
  return importRefs(file)
    .filter(() => pathMatches(file, filePattern))
    .filter((ref) => sourcePattern.test(ref.source))
    .map((ref) => diagnostic(rule, file, ref.node));
}
function isMapgenCoreProductionSource(file) {
  return (
    pathMatches(file, /packages\/mapgen-core\/src\/.*\.ts$/) &&
    !file.path.includes("packages/mapgen-core/src/dev/")
  );
}
function isRngAuthorityScope(file) {
  return pathMatches(file, /mods\/mod-swooper-maps\/src\/(?:domain|recipes\/standard)\/.*\.ts$/);
}
function rngAuthorityLines(file) {
  const patterns = [
    { name: "direct-adapter-rng", pattern: /\.\s*getRandomNumber\s*\(/ },
    { name: "terrainbuilder-rng", pattern: /\bTerrainBuilder\s*\.\s*getRandomNumber\s*\(/ },
    { name: "ambient-random", pattern: /\bMath\s*\.\s*random\s*\(/ },
    { name: "official-lakes-generator", pattern: /\.\s*generateLakes\s*\(/ },
    { name: "official-biome-generator", pattern: /\.\s*designateBiomes\s*\(/ },
    { name: "official-feature-generator", pattern: /\.\s*addFeatures\s*\(/ },
    { name: "official-snow-generator", pattern: /\.\s*generateSnow\s*\(/ },
    {
      name: "official-resource-generator",
      pattern: /\.\s*(?:generateResources|generateOfficialResources)\s*\(/,
    },
    {
      name: "official-discovery-generator",
      pattern: /\.\s*(?:generateDiscoveries|generateOfficialDiscoveries)\s*\(/,
    },
    {
      name: "official-start-generator",
      pattern: /\.\s*(?:assignStartPositions|chooseStartSectors)\s*\(/,
    },
  ];
  return file.text
    .split("\n")
    .flatMap((line, index) =>
      patterns.some(
        ({ name, pattern }) => pattern.test(line) && !isAllowedRngAuthorityHit(file, name)
      )
        ? [index + 1]
        : []
    );
}
function isAllowedRngAuthorityHit(file, name) {
  return (
    file.path ===
      "mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/place-discoveries/materialize.ts" &&
    name === "official-discovery-generator"
  );
}
function isActiveEcologyStagePath(file) {
  return pathMatches(
    file,
    /mods\/mod-swooper-maps\/src\/recipes\/standard\/stages\/(?:ecology-biomes|ecology-features|ecology-pedology|map-ecology)\/.*\.ts$/
  );
}
function isRetiredEcologyPath(file) {
  return pathMatches(
    file,
    /mods\/mod-swooper-maps\/src\/recipes\/standard\/stages\/(?:ecology\/steps|ecology-features-score|ecology-ice|ecology-reefs|ecology-wetlands|ecology-vegetation)(?:\/|$)/
  );
}
function isSwooperRuntimeSource(file) {
  return pathMatches(
    file,
    /mods\/mod-swooper-maps\/src\/(?:domain|recipes\/standard|maps)\/.*\.(?:ts|json)$/
  );
}
function cutoverShimSurfaceLines(file) {
  return [
    /\bdualRead/i,
    /\bdual[-_ ]?engine/i,
    /\bdual[-_ ]?path/i,
    /\bshadow(?:Path|Compute|Layer|Mode|Toggle|Bridge)/i,
    /\bcompare(?:Layer|Layers|Mode|Toggle|Only|Path)/i,
    /\bcomparison(?:Layer|Layers|Mode|Toggle|Only|Path)/i,
    /\bshim(?:med|ming|s)?\b/i,
    /\bcompat(?:ibility)?[-_ ]?(shim|bridge)\b/i,
    /\btransitional[-_ ]?(shim|bridge)\b/i,
  ].flatMap((pattern) => linesMatching(file.text, pattern));
}
function cutoverLegacyStageLines(file) {
  return [
    /"hydrology-pre"/,
    /"hydrology-core"/,
    /"hydrology-post"/,
    /"narrative-pre"/,
    /"narrative-mid"/,
    /"narrative-post"/,
  ].flatMap((pattern) => linesMatching(file.text, pattern));
}
function cutoverDualStageLines(file) {
  const pairs = [
    { legacy: '"hydrology-pre"', target: '"hydrology-climate-baseline"' },
    { legacy: '"hydrology-core"', target: '"hydrology-hydrography"' },
    { legacy: '"hydrology-post"', target: '"hydrology-climate-refine"' },
  ];
  return pairs.flatMap(({ legacy, target }) =>
    file.text.includes(legacy) && file.text.includes(target)
      ? [firstMatchingLine(file.text, new RegExp(escapeRegExp(legacy)))]
      : []
  );
}
function relativeDomainImportDiagnostics(rule, file) {
  const refs = importRefs(file);
  const pairs = [
    [
      /mods\/[^/]+\/src\/recipes\/[^/]+\/stages\/[^/]+\/[^/]+\.tsx?$/,
      /^(?:\.\.\/){4}domain\/[^"']+$/,
    ],
    [
      /mods\/[^/]+\/src\/recipes\/[^/]+\/stages\/[^/]+\/steps\/[^/]+\.tsx?$/,
      /^(?:\.\.\/){5}domain\/[^"']+$/,
    ],
    [
      /mods\/[^/]+\/src\/recipes\/[^/]+\/stages\/[^/]+\/steps\/[^/]+\/[^/]+\.tsx?$/,
      /^(?:\.\.\/){6}domain\/[^"']+$/,
    ],
    [/mods\/[^/]+\/src\/maps\/[^/]+\.tsx?$/, /^\.\.\/domain\/[^"']+$/],
  ];
  return refs
    .filter((ref) =>
      pairs.some(
        ([filePattern, sourcePattern]) =>
          pathMatches(file, filePattern) && sourcePattern.test(ref.source)
      )
    )
    .map((ref) => diagnostic(rule, file, ref.node));
}
function sdkMapgenEntrypointDiagnostics(rule, file) {
  const refs = importRefs(file);
  return [
    ...refs
      .filter(() => pathMatches(file, /packages\/sdk\/src\/index\.ts$/))
      .filter((ref) => ref.source === "./mapgen" || ref.source === "./mapgen/index.js")
      .filter((ref) => ref.kind === "import" || (ref.kind === "export" && !ref.isTypeOnly))
      .map((ref) => diagnostic(rule, file, ref.node)),
    ...refs
      .filter(
        () =>
          pathMatches(file, /packages\/sdk\/src\/.*\.ts$/) &&
          !file.path.includes("packages/sdk/src/mapgen/")
      )
      .filter((ref) => ref.kind === "import" && ref.source === "@civ7/adapter/civ7")
      .map((ref) => diagnostic(rule, file, ref.node)),
    ...refs
      .filter(() => pathMatches(file, /packages\/mapgen-core\/src\/.*\.ts$/))
      .filter((ref) => ref.kind === "import" && ref.source === "@civ7/adapter/civ7")
      .map((ref) => diagnostic(rule, file, ref.node)),
  ];
}
function stageContractDependencyDiagnostics(rule, file) {
  if (
    !pathMatches(
      file,
      /mods\/mod-swooper-maps\/src\/recipes\/standard\/stages\/.*\/(?:contract|.*\.contract)\.ts$/
    )
  )
    return [];
  return callNodes(file, "defineStep")
    .flatMap((call) => {
      const [first] = call.arguments;
      if (!first || !ts.isObjectLiteralExpression(first)) return [];
      return first.properties.flatMap((property) => {
        if (!ts.isPropertyAssignment(property)) return [];
        const name = propertyName(property.name);
        if (name !== "requires" && name !== "provides") return [];
        const initializer = property.initializer;
        if (!ts.isArrayLiteralExpression(initializer)) return [];
        return initializer.elements.filter(ts.isStringLiteralLike);
      });
    })
    .map((node) => diagnostic(rule, file, node));
}
function vizContractOwnershipDiagnostics(rule, file) {
  if (
    pathMatches(
      file,
      /mods\/mod-swooper-maps\/src\/recipes\/standard\/stages\/[^/]+\/steps\/viz\.ts$/
    )
  ) {
    return [diagnostic(rule, file)];
  }
  return importRefs(file)
    .filter((ref) => {
      if (
        pathMatches(
          file,
          /mods\/mod-swooper-maps\/src\/recipes\/standard\/stages\/[^/]+\/steps\/[^/]+\.ts$/
        )
      ) {
        return /^\.\.?\/(?:steps\/viz|[A-Za-z0-9_-]+\/viz)(?:\.js|\.ts)?$/.test(ref.source);
      }
      if (
        pathMatches(
          file,
          /mods\/mod-swooper-maps\/src\/recipes\/standard\/stages\/[^/]+\/steps\/[^/]+\/.*\.ts$/
        )
      ) {
        return /^\.\.\/[A-Za-z0-9_-]+\/viz(?:\.js|\.ts)?$/.test(ref.source);
      }
      return (
        pathMatches(
          file,
          /mods\/mod-swooper-maps\/src\/recipes\/standard\/stages\/[^/]+\/.*\.ts$/
        ) && /^\.\.\/steps\/viz(?:\.js|\.ts)?$/.test(ref.source)
      );
    })
    .map((ref) => diagnostic(rule, file, ref.node));
}
function importRefs(file) {
  return cachedFact(file, "importRefs", () => {
    const sourceFile = file.sourceFile;
    if (!sourceFile) return [];
    const refs = [];
    visit(sourceFile);
    return refs;
    function visit(node) {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        refs.push({
          kind: "import",
          source: node.moduleSpecifier.text,
          text: node.getText(sourceFile),
          node,
          isTypeOnly: importDeclarationIsTypeOnly(node),
          isNamespaceExport: false,
        });
      } else if (
        ts.isExportDeclaration(node) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        refs.push({
          kind: "export",
          source: node.moduleSpecifier.text,
          text: node.getText(sourceFile),
          node,
          isTypeOnly: node.isTypeOnly,
          isNamespaceExport: !node.exportClause,
        });
      } else if (
        ts.isCallExpression(node) &&
        node.expression.kind === ts.SyntaxKind.ImportKeyword &&
        node.arguments.length === 1 &&
        ts.isStringLiteralLike(node.arguments[0])
      ) {
        refs.push({
          kind: "dynamic-import",
          source: node.arguments[0].text,
          text: node.getText(sourceFile),
          node,
          isTypeOnly: false,
          isNamespaceExport: false,
        });
      }
      ts.forEachChild(node, visit);
    }
  });
}
function cachedFact(file, key, compute) {
  file[sourceCheckFactCache] ??= new Map();
  const cache = file[sourceCheckFactCache];
  if (!cache.has(key)) cache.set(key, compute());
  return cache.get(key);
}
function sourceCheckNodes(file, key, predicate) {
  return cachedFact(file, key, () => matchingNodes(file, predicate));
}
function propertyAccessNodes(file) {
  return sourceCheckNodes(file, "propertyAccessNodes", ts.isPropertyAccessExpression);
}
function propertyAssignmentFacts(file) {
  return cachedFact(file, "propertyAssignmentFacts", () =>
    matchingNodes(file, ts.isPropertyAssignment).map((node) => ({
      node,
      name: propertyName(node.name),
      initializer: node.initializer,
    }))
  );
}
function callExpressionNodes(file) {
  return sourceCheckNodes(file, "callExpressionNodes", ts.isCallExpression);
}
function identifierNodes(file) {
  return sourceCheckNodes(file, "identifierNodes", ts.isIdentifier);
}
function stringLiteralFacts(file) {
  return cachedFact(file, "stringLiteralFacts", () =>
    matchingNodes(file, ts.isStringLiteralLike).map((node) => ({ value: node.text, node }))
  );
}
function exportedConstNames(file) {
  return cachedFact(file, "exportedConstNames", () => {
    const sourceFile = file.sourceFile;
    if (!sourceFile) return [];
    const names = [];
    visit(sourceFile);
    return names;
    function visit(node) {
      if (
        ts.isVariableStatement(node) &&
        node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
      ) {
        for (const declaration of node.declarationList.declarations) {
          if (ts.isIdentifier(declaration.name))
            names.push({ name: declaration.name.text, node: declaration });
        }
      }
      ts.forEachChild(node, visit);
    }
  });
}
function newExpressions(file, name) {
  return sourceCheckNodes(file, "newExpressions", ts.isNewExpression).filter(
    (node) => node.expression.getText(file.sourceFile) === name
  );
}
function callExpressions(file, name) {
  return callNodes(file).filter(
    (node) => ts.isIdentifier(node.expression) && node.expression.text === name
  );
}
function propertyCallExpressions(file, property, objectName) {
  return callNodes(file).filter((node) => {
    if (!ts.isPropertyAccessExpression(node.expression) || node.expression.name.text !== property)
      return false;
    return objectName ? node.expression.expression.getText(file.sourceFile) === objectName : true;
  });
}
function callNodes(file, name) {
  const calls = callExpressionNodes(file);
  return name
    ? calls.filter((node) => ts.isIdentifier(node.expression) && node.expression.text === name)
    : calls;
}
function propertyAccesses(file, property) {
  return propertyAccessNodes(file).filter((node) => node.name.text === property);
}
function propertyAccessesOnObject(file, objectName) {
  return propertyAccessNodes(file).filter(
    (node) => ts.isIdentifier(node.expression) && node.expression.text === objectName
  );
}
function identifierUses(file, name) {
  return identifierNodes(file).filter((node) => node.text === name);
}
function stringLiterals(file) {
  return stringLiteralFacts(file);
}
function objectProperties(file, name) {
  return propertyAssignmentFacts(file)
    .filter((property) => property.name === name)
    .map(({ node, initializer }) => ({ node, initializer }));
}
function importDeclarationIsTypeOnly(node) {
  const clause = node.importClause;
  if (!clause) return false;
  if (clause.isTypeOnly) return true;
  const bindings = clause.namedBindings;
  if (bindings && ts.isNamedImports(bindings) && bindings.elements.length > 0) {
    return bindings.elements.every((element) => element.isTypeOnly);
  }
  return false;
}
function schemaExportsFromControlIndex(file) {
  if (!pathMatches(file, /packages\/civ7-control-orpc\/src\/index\.ts$/)) return [];
  return importRefs(file)
    .filter((ref) => ref.kind === "export" && /^\.\/modules\/[^/]+\/contract$/.test(ref.source))
    .filter((ref) =>
      /^export\s*\{[^}]*Civ7[A-Za-z0-9]+(?:Input|Result|Output|Standard)Schema/.test(ref.text)
    )
    .map((ref) => ref.node);
}
function emptyObjectNullish(file) {
  return matchingNodes(file, (node) => {
    if (
      !ts.isBinaryExpression(node) ||
      node.operatorToken.kind !== ts.SyntaxKind.QuestionQuestionToken
    )
      return false;
    return ts.isObjectLiteralExpression(node.right) && node.right.properties.length === 0;
  });
}
function helperRedeclarations(file) {
  const names = new Set(["clamp01", "clampChance", "normalizeRange", "rollPercent"]);
  return [
    ...matchingNodes(file, ts.isFunctionDeclaration).filter(
      (node) => node.name && names.has(node.name.text)
    ),
    ...matchingNodes(file, ts.isVariableDeclaration).filter(
      (node) => ts.isIdentifier(node.name) && names.has(node.name.text)
    ),
  ];
}
function propertyNameOccurrences(file, property) {
  if (file.path.endsWith(".json")) {
    return linesMatching(file.text, new RegExp(`"${property}"\\s*:`));
  }
  const astLines = objectProperties(file, property).map(({ node }) => lineFor(file, node));
  return astLines.length > 0
    ? astLines
    : linesMatching(file.text, new RegExp(`\\b${property}\\s*:`));
}
function matchingNodes(file, predicate) {
  const sourceFile = file.sourceFile;
  if (!sourceFile) return [];
  const nodes = [];
  visit(sourceFile);
  return nodes;
  function visit(node) {
    if (predicate(node)) nodes.push(node);
    ts.forEachChild(node, visit);
  }
}
function propertyName(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteralLike(name) || ts.isNumericLiteral(name))
    return name.text;
  return undefined;
}
function diagnostic(rule, file, node, line, message = rule.message) {
  return {
    ruleId: rule.id,
    path: file.path,
    ...(node || line ? { line: node ? lineFor(file, node) : line } : {}),
    message,
    severity: rule.lane === "advisory" ? "advisory" : "error",
    baselined: false,
  };
}
function lineFor(file, node) {
  const sourceFile = file.sourceFile;
  if (!sourceFile) return 1;
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
}
function firstMatchingLine(text, pattern) {
  return linesMatching(text, pattern)[0] ?? 1;
}
function linesMatching(text, pattern) {
  return text.split("\n").flatMap((line, index) => (pattern.test(line) ? [index + 1] : []));
}
function pathMatches(file, pattern) {
  return pattern.test(file.path);
}
function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isTestPath(filePath) {
  return /\/(?:test|tests)\//.test(filePath) || /\.test\.tsx?$/.test(filePath);
}
