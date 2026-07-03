#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import * as ts from "typescript";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const modRoot = join(repoRoot, "mods/mod-swooper-maps");
const stagesRoot = join(modRoot, "src/recipes/standard/stages");
const failures = [];

function sourceFile(filePath) {
  return ts.createSourceFile(
    filePath,
    readFileSync(filePath, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );
}

function propertyNameText(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }
  return null;
}

function unwrapExpression(expression) {
  if (ts.isAsExpression(expression) || ts.isSatisfiesExpression(expression)) {
    return unwrapExpression(expression.expression);
  }
  return expression;
}

function extractManifestStageIds(filePath) {
  const file = sourceFile(filePath);
  const stageIds = [];

  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "stage" &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      stageIds.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  }

  visit(file);
  return stageIds;
}

function extractRuntimeStageIds(filePath) {
  const file = sourceFile(filePath);
  const stageIds = [];

  function visit(node) {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      const stagesById = unwrapExpression(node.arguments[0]);
      if (node.expression.text === "orderStandardStages" && ts.isObjectLiteralExpression(stagesById)) {
        for (const property of stagesById.properties) {
          if (ts.isPropertyAssignment(property)) {
            const name = propertyNameText(property.name);
            if (name) stageIds.push(name);
          } else if (ts.isShorthandPropertyAssignment(property)) {
            stageIds.push(property.name.text);
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(file);
  return stageIds;
}

const manifestStageIds = extractManifestStageIds(
  join(modRoot, "src/recipes/standard/contract-manifest.ts")
);
const runtimeStageIds = extractRuntimeStageIds(join(modRoot, "src/recipes/standard/recipe.ts"));

if (JSON.stringify(runtimeStageIds) !== JSON.stringify(manifestStageIds)) {
  failures.push(
    `runtime stage ids differ from contract manifest: ${JSON.stringify(runtimeStageIds)} !== ${JSON.stringify(manifestStageIds)}`
  );
}

const activeStageIds = new Set(manifestStageIds);
const allowedSupportDirectories = new Set(["ecology", "foundation", "morphology"]);

for (const stageId of manifestStageIds) {
  const stageDir = join(stagesRoot, stageId);
  if (!existsSync(stageDir)) {
    failures.push(`${stageId}: missing active stage directory`);
    continue;
  }
  if (!existsSync(join(stageDir, "index.ts"))) {
    failures.push(`${stageId}: missing active stage index.ts`);
  }
}

for (const child of readdirSync(stagesRoot, { withFileTypes: true })) {
  const name = child.name;

  if (child.isDirectory()) {
    if (activeStageIds.has(name)) continue;
    if (allowedSupportDirectories.has(name)) continue;
    failures.push(`${name}: unexpected standard stage-root directory`);
    continue;
  }

  if (child.isFile() && /^[a-z0-9-]+-public-config\.ts$/u.test(name)) continue;
  failures.push(`${name}: unexpected standard stage-root file`);
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
