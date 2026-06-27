import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

interface Finding {
  readonly code: "missing-schema-description" | "missing-exported-function-jsdoc";
  readonly file: string;
  readonly line?: number;
  readonly detail: string;
}

const repoRoot = path.resolve(fileURLToPath(new URL("../../..", import.meta.url)));

const ecologyContractRoots = [
  "mods/mod-swooper-maps/src/domain/ecology/ops",
  "mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps",
];

const ecologyDocRoots = [
  "mods/mod-swooper-maps/src/domain/ecology/ops",
  "mods/mod-swooper-maps/src/recipes/standard/stages/ecology/steps",
];

const findings = [
  ...checkSchemaDescriptions(ecologyContractFiles()),
  ...checkExportedFunctionJSDoc(ecologyDocumentationTargets()),
];

if (findings.length === 0) {
  console.log("Ecology op contract quality passed.");
  process.exit(0);
}

for (const finding of findings) {
  const location = finding.line === undefined ? finding.file : `${finding.file}:${finding.line}`;
  console.error(`${finding.code}: ${location} ${finding.detail}`);
}

console.error(`Ecology op contract quality failed with ${findings.length} finding(s).`);
process.exit(1);

function ecologyContractFiles(): readonly string[] {
  return uniqueSorted(
    ecologyContractRoots.flatMap((root) =>
      walkFiles(path.join(repoRoot, root)).filter((file) => {
        const normalized = toRepoPath(file);
        return normalized.endsWith("/contract.ts") || normalized.endsWith(".contract.ts");
      })
    )
  );
}

function ecologyDocumentationTargets(): readonly string[] {
  return uniqueSorted(
    ecologyDocRoots.flatMap((root) =>
      walkFiles(path.join(repoRoot, root)).filter((file) => {
        const normalized = toRepoPath(file);
        if (!normalized.endsWith(".ts")) return false;
        const isEcologyOpRuleOrStrategy =
          normalized.includes("/domain/ecology/ops/") &&
          (normalized.includes("/rules/") || normalized.includes("/strategies/"));
        const isEcologyRecipeStep = normalized.includes(
          "/recipes/standard/stages/ecology/steps/"
        );
        return isEcologyOpRuleOrStrategy || isEcologyRecipeStep;
      })
    )
  );
}

function checkSchemaDescriptions(files: readonly string[]): Finding[] {
  const findings: Finding[] = [];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    if (text.includes("Type.Object(") && !text.includes("description")) {
      findings.push({
        code: "missing-schema-description",
        file: toRepoPath(file),
        detail: "Type.Object schema must include description metadata.",
      });
    }
  }
  return findings;
}

function checkExportedFunctionJSDoc(files: readonly string[]): Finding[] {
  const findings: Finding[] = [];
  for (const file of files) {
    const lines = readFileSync(file, "utf8").split(/\r?\n/u);
    for (let index = 0; index < lines.length; index += 1) {
      if (!/^\s*export\s+function\s+/u.test(lines[index])) continue;
      if (!hasAdjacentJSDoc(lines, index)) {
        findings.push({
          code: "missing-exported-function-jsdoc",
          file: toRepoPath(file),
          line: index + 1,
          detail: lines[index].trim(),
        });
      }
    }
  }
  return findings;
}

function hasAdjacentJSDoc(lines: readonly string[], exportLineIndex: number): boolean {
  let cursor = exportLineIndex - 1;
  while (cursor >= 0 && lines[cursor].trim() === "") cursor -= 1;
  if (cursor < 0 || lines[cursor].trim() !== "*/") return false;
  while (cursor >= 0) {
    if (lines[cursor].trim().startsWith("/**")) return true;
    cursor -= 1;
  }
  return false;
}

function walkFiles(root: string): string[] {
  if (!existsSync(root)) return [];
  const stat = statSync(root);
  if (stat.isFile()) return [root];
  if (!stat.isDirectory()) return [];
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === "node_modules" || entry.name === ".git") return [];
    return walkFiles(path.join(root, entry.name));
  });
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values)].sort((left, right) =>
    toRepoPath(left).localeCompare(toRepoPath(right))
  );
}

function toRepoPath(file: string): string {
  return path.relative(repoRoot, file).split(path.sep).join("/");
}
