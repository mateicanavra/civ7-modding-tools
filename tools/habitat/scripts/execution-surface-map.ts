#!/usr/bin/env bun
import fs from "node:fs";
import path from "node:path";
import * as ts from "typescript";

type Invoker = "habitat" | "package" | "nx" | "direct-script" | "unknown";

type SurfaceKind =
  | "rule-json"
  | "rule-module"
  | "check-script"
  | "fix-script"
  | "generate-script"
  | "operation-note"
  | "pattern"
  | "apply-pattern"
  | "package-script"
  | "nx-target"
  | "nx-target-default"
  | "nx-plugin"
  | "habitat-cli-source";

type Bucket =
  | "habitat_invoked"
  | "package_invoked"
  | "direct_script_invoked"
  | "transitional_runtime_tie"
  | "package_boundary_tie"
  | "nx_ordering_tie"
  | "mutation_surface"
  | "unknown_invocation";

interface PackageScriptRecord {
  packagePath: string;
  packageName: string;
  name: string;
  command: string;
}

interface NxTargetRecord {
  projectPath: string;
  projectName: string;
  name: string;
  command?: string;
  executor?: string;
  dependsOn: string[];
}

interface StaticTie {
  kind:
    | "import"
    | "dynamic-import"
    | "require"
    | "child-process"
    | "shell-command"
    | "path-reference"
    | "cwd-assumption"
    | "mutation-verb"
    | "rule-detect-command"
    | "nx-depends-on";
  value: string;
  targetClass: string;
}

interface SurfaceRecord {
  id: string;
  path: string;
  surfaceKind: SurfaceKind;
  declaredOwnerTool?: string;
  invokedBy: Invoker[];
  detectCommand?: string[];
  nxTarget?: NxTargetRecord;
  packageScript?: PackageScriptRecord;
  isDirectEntrypoint: boolean;
  staticTies: {
    imports: string[];
    relativeHabitatImports: string[];
    packageAppModImports: string[];
    childProcessCalls: string[];
    shellCommandCalls: string[];
    directHabitatPathCalls: string[];
    cwdAssumptions: string[];
    knownMutationVerbs: string[];
    all: StaticTie[];
  };
  buckets: Bucket[];
}

interface Args {
  repoRoot: string;
  outJson: string;
  outMd: string;
}

interface RuleRecord {
  id?: string;
  ownerTool?: string;
  detect?: unknown;
  scope?: unknown;
  nxTarget?: unknown;
}

const habitatSurfaceSuffixes = [
  ".rule.json",
  ".rule.mjs",
  ".check.ts",
  ".check.mjs",
  ".check.js",
  ".check.sh",
  ".check.py",
  ".fix.ts",
  ".fix.mjs",
  ".fix.js",
  ".fix.sh",
  ".generate.ts",
  ".generate.mjs",
  ".generate.js",
  ".generate.sh",
  ".operation.md",
  ".apply.pattern.md",
  ".pattern.md",
] as const;

const ignoredDirectoryNames = new Set([
  ".git",
  ".nx",
  ".turbo",
  ".yalc",
  "coverage",
  "dist",
  "node_modules",
  "tmp",
]);

const cliSourcePrefixes = [
  "tools/habitat/src/cli/",
  "tools/habitat/src/providers/",
  "tools/habitat/src/resources/command/",
  "tools/habitat/src/service/model/check/",
  "tools/habitat/src/service/model/rules/",
  "tools/habitat/src/service/model/source-check/",
  "tools/habitat/src/service/modules/check/",
  "tools/habitat/src/service/modules/fix/",
  "tools/habitat/src/service/modules/hook/",
  "tools/habitat/src/service/modules/verify/",
];

const knownMutationPatterns = [
  "writeFile",
  "appendFile",
  "rm",
  "unlink",
  "rename",
  "mkdir",
  "cp",
  "copyFile",
  "chmod",
  "sed -i",
  "mv ",
  "rm ",
  "cp ",
  ">>",
  ">",
  "--write",
  "--fix",
  "generate",
  "build",
];

const orderingPatterns = [
  "nx ",
  "dependsOn",
  "build",
  "generated",
  "current",
  "fresh",
  "dist/",
  "gen:",
  "ensure:",
  "runtime-dependencies",
  "artifacts",
];

function parseArgs(argv: string[]): Args {
  const values = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg?.startsWith("--")) continue;
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      throw new Error(`Missing value for ${arg}.`);
    }
    values.set(arg, next);
    index += 1;
  }

  const repoRoot = path.resolve(process.cwd(), values.get("--repo-root") ?? "../..");
  const outJsonArg = values.get("--out-json");
  const outMdArg = values.get("--out-md");
  if (!outJsonArg || !outMdArg) {
    throw new Error("Usage: bun run scripts/execution-surface-map.ts --repo-root <root> --out-json <path> --out-md <path>");
  }

  return {
    repoRoot,
    outJson: path.resolve(process.cwd(), outJsonArg),
    outMd: path.resolve(process.cwd(), outMdArg),
  };
}

function posixRel(repoRoot: string, absolutePath: string): string {
  return path.relative(repoRoot, absolutePath).split(path.sep).join("/");
}

function slash(value: string): string {
  return value.split(path.sep).join("/");
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function walkFiles(root: string): string[] {
  if (!fs.existsSync(root)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirectoryNames.has(entry.name)) out.push(...walkFiles(absolute));
      continue;
    }
    if (entry.isFile()) out.push(absolute);
  }
  return out;
}

function isHabitatSurface(relPath: string): boolean {
  if (!relPath.startsWith(".habitat/")) return false;
  return habitatSurfaceSuffixes.some((suffix) => relPath.endsWith(suffix));
}

function surfaceKindFor(relPath: string): SurfaceKind {
  if (relPath.endsWith(".rule.json")) return "rule-json";
  if (relPath.endsWith(".rule.mjs")) return "rule-module";
  if (/\.check\.[^.]+$/.test(relPath)) return "check-script";
  if (/\.fix\.[^.]+$/.test(relPath)) return "fix-script";
  if (/\.generate\.[^.]+$/.test(relPath)) return "generate-script";
  if (relPath.endsWith(".operation.md")) return "operation-note";
  if (relPath.endsWith(".apply.pattern.md")) return "apply-pattern";
  if (relPath.endsWith(".pattern.md")) return "pattern";
  throw new Error(`Unsupported surface path: ${relPath}`);
}

function targetClass(value: string): string {
  const normalized = value.replaceAll("\\", "/");
  if (normalized.includes(".habitat/")) return "habitat-authority";
  if (normalized.includes("tools/habitat") || normalized.includes("@habitat/cli")) return "habitat-toolkit";
  if (normalized.startsWith("node:")) return "node-builtin";
  if (
    normalized.startsWith("packages/") ||
    normalized.startsWith("@civ7/") ||
    normalized.startsWith("@swooper/") ||
    normalized.startsWith("@mapgen/")
  ) {
    return "package";
  }
  if (normalized.startsWith("apps/")) return "app";
  if (normalized.startsWith("mods/") || normalized.startsWith("mod-")) return "mod";
  if (normalized.startsWith("./") || normalized.startsWith("../")) return "relative";
  if (/^(bun|bunx|nx|node|python|python3|sh|bash|git|tsc|vitest|biome|grit|docsify-cli)\b/.test(normalized)) {
    return "workspace-tool";
  }
  if (/^[a-zA-Z0-9@][a-zA-Z0-9@/_-]*$/.test(normalized)) return "external";
  return "unknown";
}

function addTie(ties: StaticTie[], kind: StaticTie["kind"], value: string): void {
  const trimmed = value.trim();
  if (!trimmed) return;
  const tie: StaticTie = { kind, value: trimmed, targetClass: targetClass(trimmed) };
  if (!ties.some((existing) => existing.kind === tie.kind && existing.value === tie.value)) {
    ties.push(tie);
  }
}

function stringLiteralValue(node: ts.Node): string | undefined {
  return ts.isStringLiteralLike(node) ? node.text : undefined;
}

function propertyNameText(node: ts.Expression): string {
  if (ts.isIdentifier(node)) return node.text;
  if (ts.isPropertyAccessExpression(node)) return `${propertyNameText(node.expression)}.${node.name.text}`;
  return node.getText();
}

function collectStringLiteralTies(ties: StaticTie[], text: string): void {
  const pathRefPattern =
    /(?:\.habitat|tools\/habitat|packages|apps|mods|dist|generated|\.\/|(?:\.\.\/)+)[A-Za-z0-9_./@:-]*/g;
  for (const match of text.matchAll(pathRefPattern)) {
    addTie(ties, match[0].includes("--cwd") ? "cwd-assumption" : "path-reference", match[0]);
  }
  if (/(?:^|\s)--cwd\s+\S+/.test(text)) addTie(ties, "cwd-assumption", text);
  if (/^(?:bun|bunx|nx|node|python3?|sh|bash|git|tsc|vitest|biome|grit)\b/.test(text.trim())) {
    addTie(ties, "shell-command", text.trim());
  }
  for (const pattern of knownMutationPatterns) {
    if (text.includes(pattern)) addTie(ties, "mutation-verb", pattern);
  }
}

function analyzeScriptLike(filePath: string, relPath: string, text: string): StaticTie[] {
  const ties: StaticTie[] = [];
  const extension = path.extname(filePath);
  if ([".ts", ".js", ".mjs", ".cjs"].includes(extension)) {
    const sourceFile = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true);
    const visit = (node: ts.Node): void => {
      if (ts.isImportDeclaration(node) && node.moduleSpecifier) {
        const specifier = stringLiteralValue(node.moduleSpecifier);
        if (specifier) addTie(ties, "import", specifier);
      }
      if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
        const specifier = stringLiteralValue(node.moduleSpecifier);
        if (specifier) addTie(ties, "import", specifier);
      }
      if (ts.isCallExpression(node)) {
        const callName = propertyNameText(node.expression);
        const firstArg = node.arguments[0];
        const firstArgValue = firstArg ? stringLiteralValue(firstArg) : undefined;
        if (callName === "require" && firstArgValue) addTie(ties, "require", firstArgValue);
        if (node.expression.kind === ts.SyntaxKind.ImportKeyword && firstArgValue) {
          addTie(ties, "dynamic-import", firstArgValue);
        }
        if (
          [
            "exec",
            "execSync",
            "execFile",
            "execFileSync",
            "spawn",
            "spawnSync",
            "Bun.spawn",
            "Bun.spawnSync",
          ].some((name) => callName.endsWith(name))
        ) {
          const commandText = node.arguments.map((arg) => arg.getText(sourceFile)).join(" ");
          addTie(ties, "child-process", commandText);
          if (firstArgValue) addTie(ties, "shell-command", firstArgValue);
        }
        if (/writeFile|appendFile|rm|unlink|rename|mkdir|copyFile|chmod/.test(callName)) {
          addTie(ties, "mutation-verb", callName);
        }
      }
      if (ts.isStringLiteralLike(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
        collectStringLiteralTies(ties, node.text);
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    return ties;
  }

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    collectStringLiteralTies(ties, line);
    const command = line.match(/^(?:exec\s+)?([A-Za-z0-9_./-]+)(?:\s|$)/)?.[1];
    if (command && /^(bun|bunx|nx|node|python3?|sh|bash|git|tsc|vitest|biome|grit|rm|mv|cp|mkdir|sed)$/.test(command)) {
      addTie(ties, "shell-command", line);
    }
  }

  if (relPath.endsWith(".py")) {
    for (const match of text.matchAll(/^\s*(?:from\s+([A-Za-z0-9_.]+)\s+import|import\s+([A-Za-z0-9_.]+))/gm)) {
      addTie(ties, "import", match[1] ?? match[2] ?? "");
    }
    for (const match of text.matchAll(/subprocess\.(?:run|check_call|check_output|Popen)\(([^)]*)\)/g)) {
      addTie(ties, "child-process", match[1] ?? "");
    }
  }

  return ties;
}

function detectRuleCommands(rule: RuleRecord): string[] {
  const commands: string[] = [];
  const visit = (value: unknown): void => {
    if (typeof value === "string") {
      commands.push(value);
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }
    if (value && typeof value === "object") {
      for (const item of Object.values(value as Record<string, unknown>)) visit(item);
    }
  };
  visit(rule.detect);
  return [...new Set(commands)].sort();
}

function makeStaticTies(ties: StaticTie[]) {
  const all = ties.sort((left, right) =>
    `${left.kind}:${left.value}`.localeCompare(`${right.kind}:${right.value}`)
  );
  return {
    imports: all
      .filter((tie) => ["import", "dynamic-import", "require"].includes(tie.kind))
      .map((tie) => tie.value),
    relativeHabitatImports: all
      .filter((tie) => tie.value.startsWith("../") || tie.value.startsWith("./"))
      .filter((tie) => tie.value.includes(".habitat") || tie.value.includes("rule-runtime.policy"))
      .map((tie) => tie.value),
    packageAppModImports: all
      .filter((tie) => ["package", "app", "mod"].includes(tie.targetClass))
      .map((tie) => tie.value),
    childProcessCalls: all.filter((tie) => tie.kind === "child-process").map((tie) => tie.value),
    shellCommandCalls: all.filter((tie) => tie.kind === "shell-command").map((tie) => tie.value),
    directHabitatPathCalls: all
      .filter((tie) => tie.value.includes(".habitat/"))
      .map((tie) => tie.value),
    cwdAssumptions: all.filter((tie) => tie.kind === "cwd-assumption").map((tie) => tie.value),
    knownMutationVerbs: all.filter((tie) => tie.kind === "mutation-verb").map((tie) => tie.value),
    all,
  };
}

function classifyBuckets(surface: Omit<SurfaceRecord, "buckets">): Bucket[] {
  const buckets = new Set<Bucket>();
  if (surface.invokedBy.includes("habitat")) buckets.add("habitat_invoked");
  if (surface.invokedBy.includes("package") || surface.invokedBy.includes("nx")) buckets.add("package_invoked");
  if (surface.invokedBy.includes("direct-script") || surface.isDirectEntrypoint) buckets.add("direct_script_invoked");

  const tieText = surface.staticTies.all.map((tie) => tie.value).join("\n");
  if (tieText.includes("preserve_legacy_source_check_runtime_during_cutover") || tieText.includes("rule-runtime.policy.mjs")) {
    buckets.add("transitional_runtime_tie");
  }
  if (
    surface.path.startsWith(".habitat/") &&
    surface.staticTies.all.some((tie) => ["package", "app", "mod"].includes(tie.targetClass))
  ) {
    buckets.add("package_boundary_tie");
  }
  if (
    orderingPatterns.some((pattern) => tieText.includes(pattern)) ||
    surface.nxTarget?.dependsOn.length ||
    (surface.nxTarget?.command && orderingPatterns.some((pattern) => surface.nxTarget?.command?.includes(pattern)))
  ) {
    buckets.add("nx_ordering_tie");
  }
  if (surface.staticTies.knownMutationVerbs.length > 0 || /(?:fix|generate)/.test(surface.surfaceKind)) {
    buckets.add("mutation_surface");
  }
  if (surface.invokedBy.length === 0 || surface.invokedBy.includes("unknown")) buckets.add("unknown_invocation");
  return [...buckets].sort();
}

function createSurface(input: Omit<SurfaceRecord, "buckets">): SurfaceRecord {
  return { ...input, buckets: classifyBuckets(input) };
}

function invokersForRule(rule: RuleRecord): Invoker[] {
  if (rule.ownerTool) return ["habitat"];
  return ["unknown"];
}

function addInvokedBy(existing: SurfaceRecord, invoker: Invoker): SurfaceRecord {
  if (existing.invokedBy.includes(invoker)) return existing;
  const updated = { ...existing, invokedBy: [...existing.invokedBy, invoker].sort() as Invoker[] };
  return { ...updated, buckets: classifyBuckets(updated) };
}

function discoverHabitatSurfaces(repoRoot: string): SurfaceRecord[] {
  const habitatRoot = path.join(repoRoot, ".habitat");
  return walkFiles(habitatRoot)
    .map((filePath) => ({ filePath, relPath: posixRel(repoRoot, filePath) }))
    .filter(({ relPath }) => isHabitatSurface(relPath))
    .sort((left, right) => left.relPath.localeCompare(right.relPath))
    .map(({ filePath, relPath }) => {
      const kind = surfaceKindFor(relPath);
      const text = fs.readFileSync(filePath, "utf8");
      const ties: StaticTie[] = [];
      let ownerTool: string | undefined;
      let detectCommand: string[] | undefined;
      let invokedBy: Invoker[] = ["unknown"];

      if (kind === "rule-json") {
        const rule = readJson<RuleRecord>(filePath);
        ownerTool = rule.ownerTool;
        detectCommand = detectRuleCommands(rule);
        invokedBy = invokersForRule(rule);
        for (const command of detectCommand) {
          addTie(ties, "rule-detect-command", command);
          collectStringLiteralTies(ties, command);
        }
      } else if (["rule-module", "check-script", "fix-script", "generate-script"].includes(kind)) {
        ties.push(...analyzeScriptLike(filePath, relPath, text));
      } else {
        for (const match of text.matchAll(/`([^`]+)`/g)) collectStringLiteralTies(ties, match[1] ?? "");
      }

      const base = createSurface({
        id: relPath,
        path: relPath,
        surfaceKind: kind,
        declaredOwnerTool: ownerTool,
        invokedBy,
        detectCommand,
        isDirectEntrypoint: false,
        staticTies: makeStaticTies(ties),
      });
      return base;
    });
}

function discoverPackageScripts(repoRoot: string): SurfaceRecord[] {
  const packageJsonPaths = walkFiles(repoRoot)
    .filter((filePath) => path.basename(filePath) === "package.json")
    .filter((filePath) => !slash(filePath).includes("/node_modules/"))
    .sort();

  const surfaces: SurfaceRecord[] = [];
  for (const filePath of packageJsonPaths) {
    const relPath = posixRel(repoRoot, filePath);
    const pkg = readJson<{ name?: string; scripts?: Record<string, string> }>(filePath);
    for (const [scriptName, command] of Object.entries(pkg.scripts ?? {}).sort(([left], [right]) =>
      left.localeCompare(right)
    )) {
      const ties: StaticTie[] = [];
      collectStringLiteralTies(ties, command);
      const isDirectHabitat = command.includes(".habitat/");
      surfaces.push(
        createSurface({
          id: `${relPath}#scripts.${scriptName}`,
          path: relPath,
          surfaceKind: "package-script",
          invokedBy: isDirectHabitat ? ["package", "direct-script"] : ["package"],
          packageScript: {
            packagePath: relPath,
            packageName: pkg.name ?? "(unnamed)",
            name: scriptName,
            command,
          },
          isDirectEntrypoint: isDirectHabitat,
          staticTies: makeStaticTies(ties),
        })
      );
    }
  }
  return surfaces;
}

function discoverNxSurfaces(repoRoot: string): SurfaceRecord[] {
  const surfaces: SurfaceRecord[] = [];
  const nxJsonPath = path.join(repoRoot, "nx.json");
  if (fs.existsSync(nxJsonPath)) {
    const nxJson = readJson<{ targetDefaults?: Record<string, { dependsOn?: unknown }>; plugins?: unknown[] }>(
      nxJsonPath
    );
    for (const [targetName, config] of Object.entries(nxJson.targetDefaults ?? {}).sort(([left], [right]) =>
      left.localeCompare(right)
    )) {
      const ties: StaticTie[] = [];
      const dependsOn = Array.isArray(config.dependsOn) ? config.dependsOn.map((item) => JSON.stringify(item)) : [];
      for (const dep of dependsOn) addTie(ties, "nx-depends-on", dep);
      surfaces.push(
        createSurface({
          id: `nx.json#targetDefaults.${targetName}`,
          path: "nx.json",
          surfaceKind: "nx-target-default",
          invokedBy: ["nx"],
          nxTarget: {
            projectPath: "nx.json",
            projectName: "workspace",
            name: targetName,
            dependsOn,
          },
          isDirectEntrypoint: false,
          staticTies: makeStaticTies(ties),
        })
      );
    }
    for (const [index, plugin] of (nxJson.plugins ?? []).entries()) {
      const value = typeof plugin === "string" ? plugin : JSON.stringify(plugin);
      const ties: StaticTie[] = [];
      collectStringLiteralTies(ties, value);
      surfaces.push(
        createSurface({
          id: `nx.json#plugins.${index}`,
          path: "nx.json",
          surfaceKind: "nx-plugin",
          invokedBy: ["nx"],
          isDirectEntrypoint: false,
          staticTies: makeStaticTies(ties),
        })
      );
    }
  }

  const projectJsonPaths = walkFiles(repoRoot)
    .filter((filePath) => path.basename(filePath) === "project.json")
    .sort();
  for (const filePath of projectJsonPaths) {
    const relPath = posixRel(repoRoot, filePath);
    const project = readJson<{
      name?: string;
      targets?: Record<string, { command?: string; executor?: string; dependsOn?: unknown }>;
    }>(filePath);
    for (const [targetName, target] of Object.entries(project.targets ?? {}).sort(([left], [right]) =>
      left.localeCompare(right)
    )) {
      const ties: StaticTie[] = [];
      if (target.command) collectStringLiteralTies(ties, target.command);
      if (target.executor) addTie(ties, "shell-command", target.executor);
      const dependsOn = Array.isArray(target.dependsOn) ? target.dependsOn.map((item) => JSON.stringify(item)) : [];
      for (const dep of dependsOn) addTie(ties, "nx-depends-on", dep);
      const isDirectHabitat = Boolean(target.command?.includes(".habitat/"));
      surfaces.push(
        createSurface({
          id: `${relPath}#targets.${targetName}`,
          path: relPath,
          surfaceKind: "nx-target",
          invokedBy: isDirectHabitat ? ["nx", "direct-script"] : ["nx"],
          nxTarget: {
            projectPath: relPath,
            projectName: project.name ?? path.basename(path.dirname(filePath)),
            name: targetName,
            command: target.command,
            executor: target.executor,
            dependsOn,
          },
          isDirectEntrypoint: isDirectHabitat,
          staticTies: makeStaticTies(ties),
        })
      );
    }
  }
  return surfaces;
}

function discoverCliSourceSurfaces(repoRoot: string): SurfaceRecord[] {
  return walkFiles(path.join(repoRoot, "tools/habitat/src"))
    .map((filePath) => ({ filePath, relPath: posixRel(repoRoot, filePath) }))
    .filter(({ relPath }) => cliSourcePrefixes.some((prefix) => relPath.startsWith(prefix)))
    .filter(({ relPath }) => /\.(?:ts|js|mjs)$/.test(relPath))
    .sort((left, right) => left.relPath.localeCompare(right.relPath))
    .map(({ filePath, relPath }) => {
      const ties = analyzeScriptLike(filePath, relPath, fs.readFileSync(filePath, "utf8"));
      return createSurface({
        id: relPath,
        path: relPath,
        surfaceKind: "habitat-cli-source",
        invokedBy: ["habitat"],
        isDirectEntrypoint: false,
        staticTies: makeStaticTies(ties),
      });
    });
}

function directHabitatPaths(surface: SurfaceRecord): string[] {
  return [
    ...(surface.packageScript?.command ? [surface.packageScript.command] : []),
    ...(surface.nxTarget?.command ? [surface.nxTarget.command] : []),
    ...surface.staticTies.directHabitatPathCalls,
  ].filter((value) => value.includes(".habitat/"));
}

function markReferencedHabitatFiles(surfaces: SurfaceRecord[]): SurfaceRecord[] {
  const byId = new Map(surfaces.map((surface) => [surface.id, surface]));
  const habitatByPath = new Map(
    surfaces.filter((surface) => surface.path.startsWith(".habitat/")).map((surface) => [surface.path, surface.id])
  );
  const habitatPathPattern = /\.habitat\/[A-Za-z0-9_./@:-]+/g;
  for (const surface of surfaces) {
    for (const value of directHabitatPaths(surface)) {
      for (const match of value.matchAll(habitatPathPattern)) {
        const rel = match[0].replace(/[)"'`,;]+$/, "");
        const targetId = habitatByPath.get(rel);
        if (!targetId) continue;
        const target = byId.get(targetId);
        if (!target) continue;
        byId.set(targetId, addInvokedBy(target, surface.surfaceKind === "package-script" ? "package" : "direct-script"));
      }
    }
  }

  for (const surface of surfaces) {
    if (surface.surfaceKind !== "rule-json") continue;
    const stem = surface.path.replace(/\.rule\.json$/, "");
    for (const extension of [".rule.mjs", ".check.ts", ".check.mjs", ".check.js", ".check.sh", ".check.py", ".pattern.md"]) {
      const targetId = habitatByPath.get(`${stem}${extension}`);
      const target = targetId ? byId.get(targetId) : undefined;
      if (targetId && target) byId.set(targetId, addInvokedBy(target, "habitat"));
    }
  }

  return [...byId.values()].sort((left, right) => left.id.localeCompare(right.id));
}

function countBy<T extends string>(items: readonly T[]): Record<T, number> {
  const out = {} as Record<T, number>;
  for (const item of items) out[item] = (out[item] ?? 0) + 1;
  return out;
}

function fanout(surfaces: SurfaceRecord[]) {
  const groups = new Map<string, { targetClass: string; count: number; sources: Set<string> }>();
  for (const surface of surfaces) {
    for (const tie of surface.staticTies.all) {
      if (["node-builtin", "external", "unknown"].includes(tie.targetClass)) continue;
      const key = `${tie.targetClass}:${tie.value}`;
      const existing = groups.get(key) ?? { targetClass: tie.targetClass, count: 0, sources: new Set<string>() };
      existing.count += 1;
      existing.sources.add(surface.id);
      groups.set(key, existing);
    }
  }
  return [...groups.entries()]
    .map(([key, value]) => ({
      target: key.replace(/^[^:]+:/, ""),
      targetClass: value.targetClass,
      references: value.count,
      sourceCount: value.sources.size,
      sampleSources: [...value.sources].sort().slice(0, 10),
    }))
    .sort((left, right) => right.sourceCount - left.sourceCount || right.references - left.references || left.target.localeCompare(right.target));
}

function assertExpectedFacts(surfaces: SurfaceRecord[]): string[] {
  const errors: string[] = [];
  const ruleJsonCount = surfaces.filter((surface) => surface.surfaceKind === "rule-json").length;
  const ruleModuleCount = surfaces.filter((surface) => surface.surfaceKind === "rule-module").length;
  const transitionalRuleModules = surfaces.filter(
    (surface) => surface.surfaceKind === "rule-module" && surface.buckets.includes("transitional_runtime_tie")
  ).length;
  const rootDocsProject = surfaces.some(
    (surface) =>
      surface.surfaceKind === "package-script" &&
      surface.packageScript?.packagePath === "package.json" &&
      surface.packageScript.name === "docs:project" &&
      surface.packageScript.command.includes(".habitat/")
  );
  const toolkitGenerateSchemas = surfaces.some(
    (surface) =>
      surface.surfaceKind === "package-script" &&
      surface.packageScript?.packagePath === "tools/habitat/package.json" &&
      surface.packageScript.name === "generate:schemas" &&
      surface.packageScript.command.includes(".habitat/")
  );

  if (ruleJsonCount !== 73) errors.push(`Expected 73 .rule.json files, found ${ruleJsonCount}.`);
  if (ruleModuleCount !== 33) errors.push(`Expected 33 .rule.mjs files, found ${ruleModuleCount}.`);
  if (transitionalRuleModules !== 33) {
    errors.push(`Expected 33 transitional source-check runtime imports, found ${transitionalRuleModules}.`);
  }
  if (!rootDocsProject) errors.push("Did not detect root docs:project direct .habitat call.");
  if (!toolkitGenerateSchemas) errors.push("Did not detect tools/habitat generate:schemas direct .habitat call.");
  return errors;
}

function packageCurrentnessChecks(surfaces: SurfaceRecord[]): SurfaceRecord[] {
  return surfaces.filter((surface) => {
    if (!surface.path.startsWith(".habitat/")) return false;
    if (!["check-script", "rule-json", "package-script", "nx-target"].includes(surface.surfaceKind)) return false;
    const text = [
      ...(surface.detectCommand ?? []),
      ...surface.staticTies.childProcessCalls,
      ...surface.staticTies.shellCommandCalls,
      ...surface.staticTies.directHabitatPathCalls,
      ...surface.staticTies.all.filter((tie) => tie.kind === "path-reference").map((tie) => tie.value),
    ].join("\n");
    return /(bun run --cwd|nx |generated|current|fresh|dist\/|build|gen:|ensure:)/.test(text);
  });
}

function markdownTable(headers: string[], rows: string[][]): string {
  if (rows.length === 0) return "_None._\n";
  const escape = (value: string) => value.replaceAll("|", "\\|").replaceAll("\n", "<br>");
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(escape).join(" | ")} |`),
    "",
  ].join("\n");
}

function renderMarkdown(report: ReturnType<typeof buildReport>): string {
  const byKindRows = Object.entries(report.summary.surfacesByKind).map(([kind, count]) => [kind, String(count)]);
  const invokerRows = Object.entries(report.summary.entrypointsByInvoker).map(([invoker, count]) => [invoker, String(count)]);
  const bucketRows = Object.entries(report.summary.surfacesByBucket).map(([bucket, count]) => [bucket, String(count)]);

  const directRows = report.directPackageRootScriptsCallingHabitatInternals.map((surface) => [
    surface.packageScript?.packagePath ?? surface.path,
    surface.packageScript?.name ?? "",
    surface.packageScript?.command ?? surface.nxTarget?.command ?? "",
  ]);

  const transitionRows = report.ruleModulesImportingTransitionalRuntime.map((surface) => [surface.path]);
  const currentnessRows = report.checksInvokingOrRecommendingPackageCurrentnessCommands.map((surface) => [
    surface.path,
    surface.surfaceKind,
    surface.detectCommand?.join("; ") || surface.packageScript?.command || surface.nxTarget?.command || surface.staticTies.shellCommandCalls.join("; "),
  ]);
  const unknownRows = report.unknownUnclassifiedSurfaces.map((surface) => [
    surface.path,
    surface.surfaceKind,
    surface.staticTies.all.slice(0, 3).map((tie) => tie.value).join("; "),
  ]);
  const fanoutRows = report.topCrossBoundaryTiesByFanout.slice(0, 25).map((entry) => [
    entry.targetClass,
    entry.target,
    String(entry.sourceCount),
    String(entry.references),
    entry.sampleSources.slice(0, 3).join("<br>"),
  ]);

  return [
    "# Execution Surface Map",
    "",
    "Deterministic analytics for the Habitat authority execution surface. This report maps what can be executed, who invokes it, and what it reaches into. `rule.json` is treated as runner metadata, not policy authority.",
    "",
    "## Sanity Assertions",
    "",
    report.summary.sanityAssertions.length === 0
      ? "- Passed: 73 `.rule.json`, 33 `.rule.mjs`, 33 transitional runtime imports, root `docs:project`, and `tools/habitat` `generate:schemas` were detected."
      : report.summary.sanityAssertions.map((issue) => `- ${issue}`).join("\n"),
    "",
    "## Surfaces By Kind",
    "",
    markdownTable(["kind", "count"], byKindRows),
    "## Entrypoints By Invoker",
    "",
    markdownTable(["invoker", "count"], invokerRows),
    "## Buckets",
    "",
    markdownTable(["bucket", "count"], bucketRows),
    "## Top Cross-Boundary Ties By Fanout",
    "",
    markdownTable(["target class", "target", "source count", "references", "sample sources"], fanoutRows),
    "## Direct Package Or Root Scripts Calling `.habitat` Internals",
    "",
    markdownTable(["package", "script", "command"], directRows),
    "## `.rule.mjs` Files Importing Transitional Habitat Runtime",
    "",
    markdownTable(["path"], transitionRows),
    "## Checks Invoking Or Recommending Package Build/Currentness Commands",
    "",
    markdownTable(["path", "kind", "command or tie"], currentnessRows),
    "## Unknown Or Unclassified Surfaces Requiring Follow-Up",
    "",
    markdownTable(["path", "kind", "sample ties"], unknownRows),
    "## Raw Data",
    "",
    "Complete records are committed in `execution-surface-map.json`.",
    "",
  ].join("\n");
}

function buildReport(surfaces: SurfaceRecord[]) {
  const allInvokers = surfaces.flatMap((surface) => surface.invokedBy);
  const allBuckets = surfaces.flatMap((surface) => surface.buckets);
  const sanityAssertions = assertExpectedFacts(surfaces);
  const directScriptCalls = surfaces
    .filter((surface) => surface.surfaceKind === "package-script")
    .filter((surface) => surface.packageScript?.command.includes(".habitat/"))
    .sort((left, right) => left.id.localeCompare(right.id));
  const transitionImports = surfaces
    .filter((surface) => surface.surfaceKind === "rule-module")
    .filter((surface) => surface.buckets.includes("transitional_runtime_tie"))
    .sort((left, right) => left.path.localeCompare(right.path));
  const currentness = packageCurrentnessChecks(surfaces).sort((left, right) => left.id.localeCompare(right.id));
  const unknown = surfaces
    .filter((surface) => surface.buckets.includes("unknown_invocation"))
    .sort((left, right) => left.id.localeCompare(right.id));

  return {
    schemaVersion: 1,
    generatedBy: "tools/habitat/scripts/execution-surface-map.ts",
    summary: {
      totalSurfaces: surfaces.length,
      surfacesByKind: countBy(surfaces.map((surface) => surface.surfaceKind)),
      entrypointsByInvoker: countBy(allInvokers),
      surfacesByBucket: countBy(allBuckets),
      sanityAssertions,
    },
    topCrossBoundaryTiesByFanout: fanout(surfaces),
    directPackageRootScriptsCallingHabitatInternals: directScriptCalls,
    ruleModulesImportingTransitionalRuntime: transitionImports,
    checksInvokingOrRecommendingPackageCurrentnessCommands: currentness,
    unknownUnclassifiedSurfaces: unknown,
    surfaces,
  };
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const allSurfaces = markReferencedHabitatFiles([
    ...discoverHabitatSurfaces(args.repoRoot),
    ...discoverPackageScripts(args.repoRoot),
    ...discoverNxSurfaces(args.repoRoot),
    ...discoverCliSourceSurfaces(args.repoRoot),
  ]);
  const report = buildReport(allSurfaces);
  if (report.summary.sanityAssertions.length > 0) {
    throw new Error(`Execution surface map sanity assertions failed:\n${report.summary.sanityAssertions.join("\n")}`);
  }

  fs.mkdirSync(path.dirname(args.outJson), { recursive: true });
  fs.mkdirSync(path.dirname(args.outMd), { recursive: true });
  fs.writeFileSync(args.outJson, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(args.outMd, renderMarkdown(report));
  console.log(`Wrote ${posixRel(args.repoRoot, args.outJson)}`);
  console.log(`Wrote ${posixRel(args.repoRoot, args.outMd)}`);
  console.log(
    `Surfaces: ${report.summary.totalSurfaces}; rule-json: ${report.summary.surfacesByKind["rule-json"]}; rule-module: ${report.summary.surfacesByKind["rule-module"]}`
  );
}

main();
