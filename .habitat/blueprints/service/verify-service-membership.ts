import { readdir, readFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function directoryNames(path: string): Promise<readonly string[]> {
  try {
    return (await readdir(path, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function fileNames(
  path: string,
  select: (name: string) => string | undefined
): Promise<readonly string[]> {
  try {
    return (await readdir(path, { withFileTypes: true }))
      .filter((entry) => entry.isFile())
      .map((entry) => select(entry.name))
      .filter((name): name is string => name !== undefined)
      .sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

function difference(left: readonly string[], right: readonly string[]): readonly string[] {
  const rightSet = new Set(right);
  return left.filter((name) => !rightSet.has(name));
}

function compare(
  issues: string[],
  module: string,
  owner: string,
  expected: readonly string[],
  actual: readonly string[]
): void {
  for (const name of difference(expected, actual)) {
    issues.push(`${module}: ${owner} is missing ${name}`);
  }
  for (const name of difference(actual, expected)) {
    issues.push(`${module}: ${owner} has no contract operation ${name}`);
  }
}

const serviceRoot = resolve(argument("--root") ?? process.cwd());
const serviceName = basename(serviceRoot);
const issues: string[] = [];
const packageJson = JSON.parse(await readFile(join(serviceRoot, "package.json"), "utf8")) as {
  readonly exports?: unknown;
};

if (packageJson.exports === undefined || packageJson.exports === null) {
  issues.push("package exports must expose the public root and no private subpaths");
} else if (typeof packageJson.exports === "object" && !Array.isArray(packageJson.exports)) {
  const exportKeys = Object.keys(packageJson.exports).sort();
  const subpathKeys = exportKeys.filter((key) => key.startsWith("."));
  if (subpathKeys.length > 0 && (exportKeys.length !== 1 || exportKeys[0] !== ".")) {
    issues.push(
      `package exports must expose only the public root; found ${exportKeys.join(", ") || "none"}`
    );
  }
}

const sourceModulesRoot = join(serviceRoot, "src/service/modules");
const semanticsModulesRoot = join(serviceRoot, "test/semantics/modules");
const sourceModules = await directoryNames(sourceModulesRoot);
const semanticsModules = await directoryNames(semanticsModulesRoot);

compare(issues, "service", "semantics module", sourceModules, semanticsModules);

for (const module of sourceModules) {
  const contract = await fileNames(join(sourceModulesRoot, module, "contract"), (name) =>
    name !== "index.ts" && name.endsWith(".ts") ? name.slice(0, -3) : undefined
  );
  const router = await fileNames(join(sourceModulesRoot, module, "router"), (name) =>
    name.endsWith(".router.ts") ? name.slice(0, -10) : undefined
  );
  const semantics = await fileNames(join(semanticsModulesRoot, module), (name) =>
    name.endsWith(".test.ts") ? name.slice(0, -8) : undefined
  );

  compare(issues, module, "router", contract, router);
  compare(issues, module, "semantics proof", contract, semantics);
}

const directSemantics = await fileNames(join(serviceRoot, "test/semantics"), (name) =>
  name.endsWith(".test.ts") ? name : undefined
);
for (const name of directSemantics) {
  issues.push(`direct semantics proof ${name} is not selected by qualified service law`);
}

if (issues.length > 0) {
  console.error(`Service membership verification failed for ${serviceName}:`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
} else {
  console.log(`Service membership verification passed for ${serviceName}.`);
}
