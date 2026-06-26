// HABITAT TODO: This is a legacy source-check runtime parked under the
// authority tree so the SDK package no longer owns embedded rule engines. The
// next cutover must replace these modules with Grit-backed patterns and delete
// this runtime once no registry record uses ownerTool "source-check".

import ts from "typescript";

export { ts };

const sourceCheckFactCache = Symbol.for("habitat.source-check.fact-cache");

export function sourceRefsMatching(rule, file, filePattern, sourcePattern) {
  return importRefs(file)
    .filter(() => pathMatches(file, filePattern))
    .filter((ref) => sourcePattern.test(ref.source))
    .map((ref) => diagnostic(rule, file, ref.node));
}
export function isMapgenCoreProductionSource(file) {
  return (
    pathMatches(file, /packages\/mapgen-core\/src\/.*\.ts$/) &&
    !file.path.includes("packages/mapgen-core/src/dev/")
  );
}
export function isRngAuthorityScope(file) {
  return pathMatches(file, /mods\/mod-swooper-maps\/src\/(?:domain|recipes\/standard)\/.*\.ts$/);
}
export function rngAuthorityLines(file) {
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
export function isAllowedRngAuthorityHit(file, name) {
  return (
    file.path ===
      "mods/mod-swooper-maps/src/recipes/standard/stages/placement/steps/place-discoveries/materialize.ts" &&
    name === "official-discovery-generator"
  );
}
export function isActiveEcologyStagePath(file) {
  return pathMatches(
    file,
    /mods\/mod-swooper-maps\/src\/recipes\/standard\/stages\/(?:ecology-biomes|ecology-features|ecology-pedology|map-ecology)\/.*\.ts$/
  );
}
export function isRetiredEcologyPath(file) {
  return pathMatches(
    file,
    /mods\/mod-swooper-maps\/src\/recipes\/standard\/stages\/(?:ecology\/steps|ecology-features-score|ecology-ice|ecology-reefs|ecology-wetlands|ecology-vegetation)(?:\/|$)/
  );
}
export function isSwooperRuntimeSource(file) {
  return pathMatches(
    file,
    /mods\/mod-swooper-maps\/src\/(?:domain|recipes\/standard|maps)\/.*\.(?:ts|json)$/
  );
}
export function cutoverShimSurfaceLines(file) {
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
export function cutoverLegacyStageLines(file) {
  return [
    /"hydrology-pre"/,
    /"hydrology-core"/,
    /"hydrology-post"/,
    /"narrative-pre"/,
    /"narrative-mid"/,
    /"narrative-post"/,
  ].flatMap((pattern) => linesMatching(file.text, pattern));
}
export function cutoverDualStageLines(file) {
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
export function relativeDomainImportDiagnostics(rule, file) {
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
export function sdkMapgenEntrypointDiagnostics(rule, file) {
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
export function stageContractDependencyDiagnostics(rule, file) {
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
export function vizContractOwnershipDiagnostics(rule, file) {
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
export function importRefs(file) {
  return sourceFileFacts(file).importRefs;
}
export function cachedFact(file, key, compute) {
  file[sourceCheckFactCache] ??= new Map();
  const cache = file[sourceCheckFactCache];
  if (!cache.has(key)) cache.set(key, compute());
  return cache.get(key);
}
export function sourceCheckNodes(file, key, predicate) {
  return cachedFact(file, key, () => matchingNodes(file, predicate));
}
export function propertyAccessNodes(file) {
  return sourceFileFacts(file).propertyAccesses;
}
export function propertyAssignmentFacts(file) {
  return sourceFileFacts(file).propertyAssignments;
}
export function callExpressionNodes(file) {
  return sourceFileFacts(file).callExpressions;
}
export function identifierNodes(file) {
  return sourceFileFacts(file).identifiers;
}
export function stringLiteralFacts(file) {
  return sourceFileFacts(file).stringLiterals;
}
export function exportedConstNames(file) {
  return sourceFileFacts(file).exportedConstNames;
}
export function newExpressions(file, name) {
  return sourceFileFacts(file).newExpressions.filter(
    (node) => node.expression.getText(file.sourceFile) === name
  );
}
export function callExpressions(file, name) {
  return callNodes(file).filter(
    (node) => ts.isIdentifier(node.expression) && node.expression.text === name
  );
}
export function propertyCallExpressions(file, property, objectName) {
  return callNodes(file).filter((node) => {
    if (!ts.isPropertyAccessExpression(node.expression) || node.expression.name.text !== property)
      return false;
    return objectName ? node.expression.expression.getText(file.sourceFile) === objectName : true;
  });
}
export function callNodes(file, name) {
  const calls = callExpressionNodes(file);
  return name
    ? calls.filter((node) => ts.isIdentifier(node.expression) && node.expression.text === name)
    : calls;
}
export function propertyAccesses(file, property) {
  return propertyAccessNodes(file).filter((node) => node.name.text === property);
}
export function propertyAccessesOnObject(file, objectName) {
  return propertyAccessNodes(file).filter(
    (node) => ts.isIdentifier(node.expression) && node.expression.text === objectName
  );
}
export function identifierUses(file, name) {
  return identifierNodes(file).filter((node) => node.text === name);
}
export function stringLiterals(file) {
  return stringLiteralFacts(file);
}
export function objectProperties(file, name) {
  return propertyAssignmentFacts(file)
    .filter((property) => property.name === name)
    .map(({ node, initializer }) => ({ node, initializer }));
}
export function importDeclarationIsTypeOnly(node) {
  const clause = node.importClause;
  if (!clause) return false;
  if (clause.isTypeOnly) return true;
  const bindings = clause.namedBindings;
  if (bindings && ts.isNamedImports(bindings) && bindings.elements.length > 0) {
    return bindings.elements.every((element) => element.isTypeOnly);
  }
  return false;
}
export function schemaExportsFromControlIndex(file) {
  if (!pathMatches(file, /packages\/civ7-control-orpc\/src\/index\.ts$/)) return [];
  return importRefs(file)
    .filter((ref) => ref.kind === "export" && /^\.\/modules\/[^/]+\/contract$/.test(ref.source))
    .filter((ref) =>
      /^export\s*\{[^}]*Civ7[A-Za-z0-9]+(?:Input|Result|Output|Standard)Schema/.test(ref.text)
    )
    .map((ref) => ref.node);
}
export function emptyObjectNullish(file) {
  return sourceFileFacts(file).binaryExpressions.filter(
    (node) =>
      node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken &&
      ts.isObjectLiteralExpression(node.right) &&
      node.right.properties.length === 0
  );
}
export function helperRedeclarations(file) {
  const names = new Set(["clamp01", "clampChance", "normalizeRange", "rollPercent"]);
  return [
    ...sourceFileFacts(file).functionDeclarations.filter(
      (node) => node.name && names.has(node.name.text)
    ),
    ...sourceFileFacts(file).variableDeclarations.filter(
      (node) => ts.isIdentifier(node.name) && names.has(node.name.text)
    ),
  ];
}
export function propertyNameOccurrences(file, property) {
  if (file.path.endsWith(".json")) {
    return linesMatching(file.text, new RegExp(`"${property}"\\s*:`));
  }
  const astLines = objectProperties(file, property).map(({ node }) => lineFor(file, node));
  return astLines.length > 0
    ? astLines
    : linesMatching(file.text, new RegExp(`\\b${property}\\s*:`));
}
export function matchingNodes(file, predicate) {
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
function sourceFileFacts(file) {
  return cachedFact(file, "sourceFileFacts", () => {
    const sourceFile = file.sourceFile;
    const facts = {
      importRefs: [],
      exportedConstNames: [],
      newExpressions: [],
      callExpressions: [],
      propertyAccesses: [],
      propertyAssignments: [],
      identifiers: [],
      stringLiterals: [],
      functionDeclarations: [],
      variableDeclarations: [],
      binaryExpressions: [],
    };
    if (!sourceFile) return facts;
    visit(sourceFile);
    return facts;

    function visit(node) {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        facts.importRefs.push({
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
        facts.importRefs.push({
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
        facts.importRefs.push({
          kind: "dynamic-import",
          source: node.arguments[0].text,
          text: node.getText(sourceFile),
          node,
          isTypeOnly: false,
          isNamespaceExport: false,
        });
      }

      if (
        ts.isVariableStatement(node) &&
        node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
      ) {
        for (const declaration of node.declarationList.declarations) {
          if (ts.isIdentifier(declaration.name)) {
            facts.exportedConstNames.push({ name: declaration.name.text, node: declaration });
          }
        }
      }
      if (ts.isNewExpression(node)) facts.newExpressions.push(node);
      if (ts.isCallExpression(node)) facts.callExpressions.push(node);
      if (ts.isPropertyAccessExpression(node)) facts.propertyAccesses.push(node);
      if (ts.isPropertyAssignment(node)) {
        facts.propertyAssignments.push({
          node,
          name: propertyName(node.name),
          initializer: node.initializer,
        });
      }
      if (ts.isIdentifier(node)) facts.identifiers.push(node);
      if (ts.isStringLiteralLike(node)) facts.stringLiterals.push({ value: node.text, node });
      if (ts.isFunctionDeclaration(node)) facts.functionDeclarations.push(node);
      if (ts.isVariableDeclaration(node)) facts.variableDeclarations.push(node);
      if (ts.isBinaryExpression(node)) facts.binaryExpressions.push(node);
      ts.forEachChild(node, visit);
    }
  });
}
export function propertyName(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteralLike(name) || ts.isNumericLiteral(name))
    return name.text;
  return undefined;
}
export function diagnostic(rule, file, node, line, message = rule.message) {
  return {
    ruleId: rule.id,
    path: file.path,
    ...(node || line ? { line: node ? lineFor(file, node) : line } : {}),
    message,
    severity: rule.lane === "advisory" ? "advisory" : "error",
    baselined: false,
  };
}
export function lineFor(file, node) {
  const sourceFile = file.sourceFile;
  if (!sourceFile) return 1;
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
}
export function firstMatchingLine(text, pattern) {
  return linesMatching(text, pattern)[0] ?? 1;
}
export function linesMatching(text, pattern) {
  return text.split("\n").flatMap((line, index) => (pattern.test(line) ? [index + 1] : []));
}
export function pathMatches(file, pattern) {
  return pattern.test(file.path);
}
export function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function isTestPath(filePath) {
  return /\/(?:test|tests)\//.test(filePath) || /\.test\.tsx?$/.test(filePath);
}

export const sourceCheckRuntime = {
  ts,
  sourceRefsMatching,
  isMapgenCoreProductionSource,
  isRngAuthorityScope,
  rngAuthorityLines,
  isAllowedRngAuthorityHit,
  isActiveEcologyStagePath,
  isRetiredEcologyPath,
  isSwooperRuntimeSource,
  cutoverShimSurfaceLines,
  cutoverLegacyStageLines,
  cutoverDualStageLines,
  relativeDomainImportDiagnostics,
  sdkMapgenEntrypointDiagnostics,
  stageContractDependencyDiagnostics,
  vizContractOwnershipDiagnostics,
  importRefs,
  exportedConstNames,
  newExpressions,
  callExpressions,
  propertyCallExpressions,
  callNodes,
  propertyAccesses,
  propertyAccessesOnObject,
  identifierUses,
  stringLiterals,
  objectProperties,
  schemaExportsFromControlIndex,
  emptyObjectNullish,
  helperRedeclarations,
  propertyNameOccurrences,
  matchingNodes,
  propertyName,
  diagnostic,
  lineFor,
  firstMatchingLine,
  linesMatching,
  pathMatches,
  escapeRegExp,
  isTestPath,
};
