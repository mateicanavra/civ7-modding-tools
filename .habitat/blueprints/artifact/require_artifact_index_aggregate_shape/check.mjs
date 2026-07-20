#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const srcRoot = path.join(repoRoot, "mods/mod-swooper-maps/src");
const files = collectSourceFiles(srcRoot).filter((file) =>
  /\/artifacts\/index\.ts$/.test(file.replaceAll(path.sep, "/"))
);
const violations = files.flatMap(scanFile);

if (violations.length > 0) {
  console.error("Artifact index aggregate shape violations:");
  for (const violation of violations) {
    console.error(`${violation.file}:${violation.line}:${violation.column}: ${violation.message}`);
  }
  process.exit(1);
}

console.log(`Artifact index aggregate shape passed for ${files.length} index files.`);

function collectSourceFiles(root) {
  if (!existsSync(root)) return [];
  const stats = statSync(root);
  if (stats.isFile()) return root.endsWith(".ts") ? [root] : [];
  if (!stats.isDirectory()) return [];
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") {
        return [];
      }
      return collectSourceFiles(absolute);
    }
    return entry.isFile() && absolute.endsWith(".ts") ? [absolute] : [];
  });
}

function scanFile(file) {
  const sourceText = readFileSync(file, "utf8");
  const sourceFile = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true);
  const importedModules = new Map();
  const importedSources = new Map();
  const catalogValueCounts = new Map();
  const catalogKeys = new Set();
  const violations = [];
  let catalogImportCount = 0;
  let catalogDeclarationCount = 0;
  let artifactModulesExportCount = 0;
  let artifactsExportCount = 0;

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement)) {
      scanImport(statement);
      continue;
    }
    if (ts.isVariableStatement(statement)) {
      scanVariable(statement);
      continue;
    }
    addViolation(
      statement,
      "artifacts/index.ts may contain only the catalog import, sibling artifact-module imports, one catalog declaration, and its two derived exports"
    );
  }

  if (catalogImportCount !== 1) {
    addFileViolation("artifacts/index.ts must import defineArtifactCatalog exactly once");
  }
  if (catalogDeclarationCount !== 1) {
    addFileViolation("artifacts/index.ts must declare exactly one defineArtifactCatalog catalog");
  }
  if (artifactModulesExportCount !== 1) {
    addFileViolation(
      "artifacts/index.ts must export artifactModules = catalog.modules exactly once"
    );
  }
  if (artifactsExportCount !== 1) {
    addFileViolation("artifacts/index.ts must export artifacts = catalog.artifacts exactly once");
  }

  const expectedSources = new Set(
    readdirSync(path.dirname(file), { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".artifact.ts"))
      .map((entry) => `./${entry.name.slice(0, -3)}.js`)
  );
  for (const source of expectedSources) {
    if (!importedSources.has(source)) {
      addFileViolation(`catalog is missing sibling artifact module import '${source}'`);
    }
  }
  for (const [source] of importedSources) {
    if (!expectedSources.has(source)) {
      addFileViolation(`catalog imports non-sibling artifact module '${source}'`);
    }
  }
  for (const [binding] of importedModules) {
    const count = catalogValueCounts.get(binding) ?? 0;
    if (count !== 1) {
      addFileViolation(
        `catalog must register imported artifact module '${binding}' exactly once (found ${count})`
      );
    }
  }

  return violations;

  function scanImport(statement) {
    const specifier = statement.moduleSpecifier;
    if (!ts.isStringLiteral(specifier)) {
      addViolation(statement, "artifact index imports must use string module specifiers");
      return;
    }

    const source = specifier.text;
    const clause = statement.importClause;
    if (source === "@swooper/mapgen-core/authoring/contracts") {
      catalogImportCount += 1;
      const imports = clause?.namedBindings;
      const elements = imports && ts.isNamedImports(imports) ? imports.elements : [];
      const importedName = elements[0]?.propertyName?.text ?? elements[0]?.name.text;
      const localName = elements[0]?.name.text;
      if (
        !clause ||
        clause.isTypeOnly ||
        clause.name ||
        !imports ||
        !ts.isNamedImports(imports) ||
        elements.length !== 1 ||
        importedName !== "defineArtifactCatalog" ||
        localName !== "defineArtifactCatalog"
      ) {
        addViolation(
          statement,
          "the contracts import must be exactly import { defineArtifactCatalog } from '@swooper/mapgen-core/authoring/contracts'"
        );
      }
      return;
    }

    if (!/^\.\/[^/]+\.artifact\.js$/.test(source)) {
      addViolation(
        statement,
        "artifact index imports must be defineArtifactCatalog or sibling ./*.artifact.js modules"
      );
      return;
    }
    const namespaceImport = clause?.namedBindings;
    if (
      !clause ||
      clause.isTypeOnly ||
      clause.name ||
      !namespaceImport ||
      !ts.isNamespaceImport(namespaceImport)
    ) {
      addViolation(
        statement,
        "artifact modules must use namespace imports: import * as name from './item.artifact.js'"
      );
      return;
    }

    const binding = namespaceImport.name.text;
    if (importedModules.has(binding)) {
      addViolation(statement, `duplicate artifact module binding '${binding}'`);
      return;
    }
    if (importedSources.has(source)) {
      addViolation(statement, `duplicate artifact module import '${source}'`);
      return;
    }
    importedModules.set(binding, source);
    importedSources.set(source, binding);
  }

  function scanVariable(statement) {
    if (!(statement.declarationList.flags & ts.NodeFlags.Const)) {
      addViolation(statement, "artifact index variables must be const declarations");
      return;
    }
    if (statement.declarationList.declarations.length !== 1) {
      addViolation(statement, "artifact index variable statements must declare one binding");
      return;
    }

    const declaration = statement.declarationList.declarations[0];
    if (!ts.isIdentifier(declaration.name)) {
      addViolation(declaration, "artifact index variables must use identifier names");
      return;
    }

    const name = declaration.name.text;
    if (!hasExportModifier(statement) && name === "catalog") {
      scanCatalog(declaration);
      return;
    }
    if (hasExportModifier(statement) && name === "artifactModules") {
      artifactModulesExportCount += 1;
      scanDerivedExport(declaration, "modules");
      return;
    }
    if (hasExportModifier(statement) && name === "artifacts") {
      artifactsExportCount += 1;
      scanDerivedExport(declaration, "artifacts");
      return;
    }

    addViolation(
      declaration,
      "artifact index may declare only catalog and export only artifactModules and artifacts"
    );
  }

  function scanCatalog(declaration) {
    catalogDeclarationCount += 1;
    const initializer = unwrapAsConst(declaration.initializer);
    if (
      !initializer ||
      !ts.isCallExpression(initializer) ||
      !ts.isIdentifier(initializer.expression) ||
      initializer.expression.text !== "defineArtifactCatalog" ||
      initializer.arguments.length !== 1
    ) {
      addViolation(
        declaration,
        "catalog must be initialized by one defineArtifactCatalog(...) call"
      );
      return;
    }

    const modules = unwrapAsConst(initializer.arguments[0]);
    if (!modules || !ts.isObjectLiteralExpression(modules)) {
      addViolation(declaration, "defineArtifactCatalog must receive an object literal");
      return;
    }
    if (modules.properties.length === 0) {
      addViolation(modules, "artifact catalog must register at least one sibling artifact module");
      return;
    }

    for (const property of modules.properties) {
      const entry = objectEntry(property);
      if (!entry) {
        addViolation(property, "artifact catalog entries must be direct module references");
        continue;
      }
      if (catalogKeys.has(entry.key)) {
        addViolation(property, `duplicate artifact catalog key '${entry.key}'`);
        continue;
      }
      catalogKeys.add(entry.key);
      if (!ts.isIdentifier(entry.value) || !importedModules.has(entry.value.text)) {
        addViolation(property, "artifact catalog values must reference sibling module imports");
        continue;
      }
      catalogValueCounts.set(entry.value.text, (catalogValueCounts.get(entry.value.text) ?? 0) + 1);
    }
  }

  function scanDerivedExport(declaration, member) {
    const initializer = unwrapAsConst(declaration.initializer);
    if (
      !initializer ||
      !ts.isPropertyAccessExpression(initializer) ||
      !ts.isIdentifier(initializer.expression) ||
      initializer.expression.text !== "catalog" ||
      initializer.name.text !== member
    ) {
      addViolation(declaration, `${declaration.name.text} must be derived from catalog.${member}`);
    }
  }

  function addFileViolation(message) {
    violations.push({
      file: path.relative(repoRoot, file),
      line: 1,
      column: 1,
      message,
    });
  }

  function addViolation(node, message) {
    const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    violations.push({
      file: path.relative(repoRoot, file),
      line: position.line + 1,
      column: position.character + 1,
      message,
    });
  }
}

function hasExportModifier(node) {
  return node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false;
}

function unwrapAsConst(expression) {
  if (!expression) return null;
  if (ts.isAsExpression(expression) || ts.isTypeAssertionExpression(expression)) {
    return unwrapAsConst(expression.expression);
  }
  return expression;
}

function objectEntry(property) {
  if (ts.isShorthandPropertyAssignment(property)) {
    return { key: property.name.text, value: property.name };
  }
  if (!ts.isPropertyAssignment(property) || !ts.isIdentifier(property.name)) return null;
  return { key: property.name.text, value: property.initializer };
}
