import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dir, "../../..");
const modulesRoot = path.join(repoRoot, "tools/habitat-harness/src/service/modules");
const serviceModelRoot = path.join(repoRoot, "tools/habitat-harness/src/service/model");

const moduleRootFiles = new Set(["contract.ts", "module.ts", "project.json", "router.ts"]);
const moduleRootDirectories = new Set([
  "contract",
  "generators",
  "middleware",
  "model",
  "policy",
  "router",
]);

const modelRootDirectories = new Set(["dto", "errors", "policy", "repositories"]);

interface ShapeIssue {
  readonly path: string;
  readonly message: string;
}

const issues: ShapeIssue[] = [];

for (const moduleName of sortedChildren(modulesRoot)) {
  const modulePath = path.join(modulesRoot, moduleName);
  if (!fs.statSync(modulePath).isDirectory()) continue;

  const children = sortedChildren(modulePath);
  const childSet = new Set(children);
  requireModuleFile(moduleName, childSet, "contract.ts");
  requireModuleFile(moduleName, childSet, "module.ts");
  if (!childSet.has("router.ts") && !childSet.has("router")) {
    report(moduleName, "service modules must declare router.ts or router/.");
  }

  for (const child of children) {
    const childPath = path.join(modulePath, child);
    const relativePath = repoPath(childPath);
    const stat = fs.statSync(childPath);
    if (stat.isDirectory()) {
      if (!moduleRootDirectories.has(child)) {
        report(relativePath, `unknown module root directory '${child}'.`);
        continue;
      }
      validateKnownDirectory(childPath, child);
      continue;
    }
    if (!moduleRootFiles.has(child)) {
      report(relativePath, `unknown loose module root file '${child}'.`);
      continue;
    }
  }
}

for (const domainName of sortedChildren(serviceModelRoot)) {
  const domainPath = path.join(serviceModelRoot, domainName);
  const relativePath = repoPath(domainPath);
  const stat = fs.statSync(domainPath);
  if (stat.isDirectory()) {
    validateModelDirectory(domainPath, { strictPolicyNames: true });
    continue;
  }
  report(relativePath, `unknown loose service model file '${domainName}'.`);
}

if (issues.length > 0) {
  console.error("Habitat service module shape violations:");
  for (const issue of issues) {
    console.error(`- ${issue.path}: ${issue.message}`);
  }
  process.exit(1);
}

console.log("Habitat service module shape ok.");

function validateKnownDirectory(directory: string, kind: string): void {
  if (kind === "model") {
    validateModelDirectory(directory, { strictPolicyNames: true });
    return;
  }

  for (const entry of walk(directory)) {
    if (fs.statSync(entry).isDirectory()) continue;
    const relativePath = repoPath(entry);
    const basename = path.basename(entry);
    const relativeToKind = path.relative(directory, entry).replaceAll(path.sep, "/");
    if (basename.endsWith(".md")) {
      report(relativePath, "Markdown instruction files do not belong in service module source.");
      continue;
    }
    if (kind === "router" && basename !== "index.ts" && !basename.endsWith(".router.ts")) {
      report(relativePath, "router/ files must be index.ts or *.router.ts.");
      continue;
    }
    if (kind === "contract" && basename !== "index.ts" && !basename.endsWith(".contract.ts")) {
      report(relativePath, "contract/ files must be index.ts or *.contract.ts.");
      continue;
    }
    if (kind === "middleware" && basename !== "index.ts" && !basename.endsWith(".middleware.ts")) {
      report(relativePath, "middleware/ files must be index.ts or *.middleware.ts.");
      continue;
    }
    if (kind === "dto" && !isDtoFile(relativeToKind)) {
      report(
        relativePath,
        "dto/ files must be *.dto.ts, *.schema.ts, index.ts, or JSON schema artifacts."
      );
      continue;
    }
    if (kind === "policy" && !isPolicyFile(relativeToKind)) {
      report(
        relativePath,
        "policy/ files must be *.policy.ts, known policy implementation files, index.ts, or schemas owned by that policy."
      );
      continue;
    }
    if (kind === "generators" && !isGeneratorFile(relativeToKind)) {
      report(
        relativePath,
        "generators/ files must be generator/schema/path/writer implementation files."
      );
      continue;
    }
    if (
      !["router", "contract", "middleware", "generators"].includes(kind) &&
      !isSourceFile(basename)
    ) {
      report(
        relativePath,
        `${kind}/ files must be TypeScript, JavaScript module, or JSON artifacts.`
      );
    }
  }
}

interface ModelDirectoryOptions {
  readonly strictPolicyNames: boolean;
}

function validateModelDirectory(directory: string, options: ModelDirectoryOptions): void {
  for (const child of sortedChildren(directory)) {
    const childPath = path.join(directory, child);
    const relativePath = repoPath(childPath);
    const stat = fs.statSync(childPath);
    if (stat.isDirectory()) {
      if (!modelRootDirectories.has(child)) {
        report(relativePath, `unknown model directory '${child}'.`);
        continue;
      }
      validateModelKindDirectory(childPath, child, options);
      continue;
    }
    if (!isNamedModelFile(child)) {
      report(relativePath, `unknown loose model file '${child}'.`);
    }
  }
}

function validateModelKindDirectory(
  directory: string,
  kind: string,
  options: ModelDirectoryOptions
): void {
  for (const entry of walk(directory)) {
    if (fs.statSync(entry).isDirectory()) continue;
    const relativePath = repoPath(entry);
    const basename = path.basename(entry);
    const relativeToKind = path.relative(directory, entry).replaceAll(path.sep, "/");
    if (kind === "dto" && !isDtoFile(relativeToKind)) {
      report(
        relativePath,
        "model/dto files must be *.dto.ts, *.schema.ts, index.ts, or JSON schema artifacts."
      );
      continue;
    }
    if (kind === "policy" && !isPolicyFile(relativeToKind, options)) {
      report(
        relativePath,
        options.strictPolicyNames
          ? "shared service model/policy files must be index.ts, schemas, *.policy.ts, *.policy.mjs, *.policy.json, or *.rule.mjs rule adapters."
          : "model/policy files must be policy implementation files, schemas, or index.ts."
      );
      continue;
    }
    if (kind === "errors" && !isErrorFile(basename)) {
      report(relativePath, "model/errors files must be *.errors.ts or index.ts.");
      continue;
    }
    if (!["dto", "policy", "errors"].includes(kind) && !isSourceFile(basename)) {
      report(
        relativePath,
        `model/${kind} files must be TypeScript, JavaScript module, or JSON artifacts.`
      );
    }
  }
}

function isNamedModelFile(basename: string): boolean {
  return (
    basename === "index.ts" ||
    basename.endsWith(".dto.ts") ||
    basename.endsWith(".errors.ts") ||
    basename.endsWith(".policy.ts") ||
    basename.endsWith(".schema.ts")
  );
}

function isGeneratorFile(relativePath: string): boolean {
  const basename = path.posix.basename(relativePath);
  return (
    isSourceFile(basename) ||
    basename === "schema.json" ||
    basename === "generator.json" ||
    basename.endsWith(".schema.json")
  );
}

function isDtoFile(relativePath: string): boolean {
  const basename = path.posix.basename(relativePath);
  return (
    basename === "index.ts" ||
    basename.endsWith(".dto.ts") ||
    basename.endsWith(".schema.ts") ||
    basename === "schema.ts" ||
    basename === "schema.json" ||
    basename.endsWith(".schema.json")
  );
}

function isPolicyFile(relativePath: string, options: ModelDirectoryOptions): boolean {
  const basename = path.posix.basename(relativePath);
  const namedPolicyFile =
    basename === "index.ts" ||
    basename === "schema.ts" ||
    basename.endsWith(".policy.ts") ||
    basename.endsWith(".policy.mjs") ||
    basename.endsWith(".policy.json") ||
    basename.endsWith(".rule.mjs") ||
    basename.endsWith(".schema.ts") ||
    basename.endsWith(".schema.json");
  if (options.strictPolicyNames) {
    return namedPolicyFile;
  }
  return (
    namedPolicyFile ||
    basename.endsWith(".ts") ||
    basename.endsWith(".mjs") ||
    basename.endsWith(".json")
  );
}

function isErrorFile(basename: string): boolean {
  return basename === "index.ts" || basename.endsWith(".errors.ts");
}

function isSourceFile(basename: string): boolean {
  return (
    basename.endsWith(".ts") ||
    basename.endsWith(".mts") ||
    basename.endsWith(".cts") ||
    basename.endsWith(".mjs") ||
    basename.endsWith(".cjs") ||
    basename.endsWith(".json")
  );
}

function requireModuleFile(moduleName: string, childSet: ReadonlySet<string>, file: string): void {
  if (!childSet.has(file)) {
    report(moduleName, `service modules must declare ${file}.`);
  }
}

function sortedChildren(directory: string): string[] {
  return fs.readdirSync(directory).sort((a, b) => a.localeCompare(b));
}

function* walk(directory: string): Generator<string> {
  for (const child of sortedChildren(directory)) {
    const childPath = path.join(directory, child);
    yield childPath;
    if (fs.statSync(childPath).isDirectory()) yield* walk(childPath);
  }
}

function report(targetPath: string, message: string): void {
  issues.push({ path: targetPath, message });
}

function repoPath(absolutePath: string): string {
  return path.relative(repoRoot, absolutePath).replaceAll(path.sep, "/");
}
