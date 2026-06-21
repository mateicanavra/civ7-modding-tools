import ts from "typescript";
export const sourceCheckRuleIds = [
  "adapter-base-standard-import",
  "contract-export-all",
  "control-app-surface",
  "control-orpc-contract-ownership",
  "docs-local-checkout-paths",
  "domain-deep-import",
  "domain-engine-imports",
  "domain-ops-boundary-imports",
  "domain-ops-projection-effects",
  "domain-ops-root-config",
  "domain-root-catalogs",
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
    case "docs-local-checkout-paths":
      return file.path.startsWith("docs/") &&
        file.path.endsWith(".md") &&
        file.text.includes("/docs/") &&
        file.text.includes(".md") &&
        /\/Users\/|\/home\/|\/Volumes\//.test(file.text)
        ? [
            diagnostic(
              rule,
              file,
              undefined,
              firstMatchingLine(file.text, /\/(?:Users|home|Volumes)\//)
            ),
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
          .filter(() => pathMatches(file, /packages\/mapgen-core\/src\/(?:core|engine)\/.*\.ts$/))
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
          propertyAccessesOnObject(file, name)
            .filter(() => pathMatches(file, /packages\/mapgen-core\/src\/(?:core|engine)\/.*\.ts$/))
            .map((node) => diagnostic(rule, file, node))
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
function exportedConstNames(file) {
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
function newExpressions(file, name) {
  return matchingNodes(
    file,
    (node) => ts.isNewExpression(node) && node.expression.getText(file.sourceFile) === name
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
  return matchingNodes(file, (node) => {
    if (!ts.isCallExpression(node)) return false;
    return name ? ts.isIdentifier(node.expression) && node.expression.text === name : true;
  });
}
function propertyAccesses(file, property) {
  return matchingNodes(
    file,
    (node) => ts.isPropertyAccessExpression(node) && node.name.text === property
  );
}
function propertyAccessesOnObject(file, objectName) {
  return matchingNodes(
    file,
    (node) =>
      ts.isPropertyAccessExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === objectName
  );
}
function identifierUses(file, name) {
  return matchingNodes(file, (node) => ts.isIdentifier(node) && node.text === name);
}
function stringLiterals(file) {
  return matchingNodes(file, ts.isStringLiteralLike).map((node) => ({ value: node.text, node }));
}
function objectProperties(file, name) {
  return matchingNodes(file, ts.isPropertyAssignment)
    .filter((node) => propertyName(node.name) === name)
    .map((node) => ({ node, initializer: node.initializer }));
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

function isTestPath(filePath) {
  return /\/(?:test|tests)\//.test(filePath) || /\.test\.tsx?$/.test(filePath);
}
