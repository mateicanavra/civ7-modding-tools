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
  const importedArtifacts = new Set();
  const artifactContractKeys = new Map();
  const artifactKeys = new Map();
  const validatorKeys = new Map();
  const violations = [];

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement)) {
      scanImport(statement);
      continue;
    }
    if (ts.isExportDeclaration(statement)) {
      scanExportDeclaration(statement);
      continue;
    }
    if (ts.isVariableStatement(statement) && hasExportModifier(statement)) {
      scanExportedVariable(statement);
      continue;
    }
    addViolation(
      statement,
      "artifacts/index.ts may contain only imports, re-exports, artifactContracts, artifacts, and validators."
    );
  }

  if (!artifactContractKeys.size) addFileViolation("missing exported artifactContracts aggregate");
  if (!artifactKeys.size) addFileViolation("missing exported artifacts aggregate");
  if (!validatorKeys.size) addFileViolation("missing exported validators aggregate");

  for (const binding of importedArtifacts) {
    if (!artifactContractKeys.has(binding)) {
      addFileViolation(`artifactContracts is missing imported artifact module '${binding}'`);
    }
    if (!artifactKeys.has(binding)) {
      addFileViolation(`artifacts is missing imported artifact module '${binding}'`);
    }
    if (!validatorKeys.has(binding)) {
      addFileViolation(`validators is missing imported artifact module '${binding}'`);
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
    const namespaceImport = statement.importClause?.namedBindings;
    if (!/^\.[/][^/]+\.artifact\.js$/.test(source)) {
      addViolation(
        statement,
        "artifact index imports must come from sibling ./*.artifact.js files only"
      );
      return;
    }
    if (!namespaceImport || !ts.isNamespaceImport(namespaceImport)) {
      addViolation(
        statement,
        "artifact index imports must use namespace imports: import * as name from './item.artifact.js'"
      );
      return;
    }
    importedArtifacts.add(namespaceImport.name.text);
  }

  function scanExportDeclaration(statement) {
    if (statement.moduleSpecifier) {
      addViolation(statement, "artifact index must not re-export from another module specifier");
    }
  }

  function scanExportedVariable(statement) {
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name)) {
        addViolation(declaration, "artifact index exported variables must use identifier names");
        continue;
      }
      const name = declaration.name.text;
      if (name === "artifactContracts") {
        scanArtifactContracts(declaration);
        continue;
      }
      if (name === "artifacts") {
        scanArtifacts(declaration);
        continue;
      }
      if (name === "validators") {
        scanValidators(declaration);
        continue;
      }
      addViolation(
        declaration,
        "artifact index may export only artifactContracts, artifacts, and validators variables"
      );
    }
  }

  function scanArtifactContracts(declaration) {
    const objectLiteral = unwrapAsConst(declaration.initializer);
    if (!objectLiteral || !ts.isObjectLiteralExpression(objectLiteral)) {
      addViolation(declaration, "artifactContracts must be an object literal");
      return;
    }
    for (const property of objectLiteral.properties) {
      const entry = objectEntry(property);
      if (!entry) {
        addViolation(
          property,
          "artifactContracts entries must be direct artifact module references"
        );
        continue;
      }
      const value = entry.value;
      if (!ts.isIdentifier(value) || !importedArtifacts.has(value.text)) {
        addViolation(property, "artifactContracts values must reference imported artifact modules");
        continue;
      }
      artifactContractKeys.set(value.text, entry.key);
    }
  }

  function scanArtifacts(declaration) {
    const objectLiteral = unwrapAsConst(declaration.initializer);
    if (!objectLiteral || !ts.isObjectLiteralExpression(objectLiteral)) {
      addViolation(declaration, "artifacts must be an object literal");
      return;
    }
    for (const property of objectLiteral.properties) {
      const entry = objectEntry(property);
      if (!entry) {
        addViolation(property, "artifacts entries must be direct artifact value references");
        continue;
      }
      const value = entry.value;
      if (
        !ts.isPropertyAccessExpression(value) ||
        value.name.text !== "artifact" ||
        !ts.isIdentifier(value.expression) ||
        !importedArtifacts.has(value.expression.text)
      ) {
        addViolation(property, "artifacts values must be importedArtifact.artifact references");
        continue;
      }
      artifactKeys.set(value.expression.text, entry.key);
    }
  }

  function scanValidators(declaration) {
    const objectLiteral = unwrapAsConst(declaration.initializer);
    if (!objectLiteral || !ts.isObjectLiteralExpression(objectLiteral)) {
      addViolation(declaration, "validators must be an object literal");
      return;
    }
    for (const property of objectLiteral.properties) {
      const entry = objectEntry(property);
      if (!entry) {
        addViolation(property, "validators entries must be direct artifact validate references");
        continue;
      }
      const value = entry.value;
      if (
        !ts.isPropertyAccessExpression(value) ||
        value.name.text !== "validate" ||
        !ts.isIdentifier(value.expression) ||
        !importedArtifacts.has(value.expression.text)
      ) {
        addViolation(property, "validators values must be importedArtifact.validate references");
        continue;
      }
      validatorKeys.set(value.expression.text, entry.key);
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
