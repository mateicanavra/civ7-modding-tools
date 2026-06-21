import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sourceRoot = "tools/habitat-harness/src";
const packagePath = "tools/habitat-harness/package.json";
const serviceRoot = `${sourceRoot}/service`;
const defaultRepoRoot = path.resolve(fileURLToPath(new URL("../../../../../../", import.meta.url)));
let repoRoot = defaultRepoRoot;
let injectedFiles = new Map();
let failures = [];
let sourceFiles = [];
const serviceModuleNames = ["check", "classify", "fix", "graph", "hook", "transactions", "verify"];

const allowedLibFiles = new Set([
  "tools/habitat-harness/src/substrate/lib/artifact-paths.ts",
  "tools/habitat-harness/src/workspace/taxonomy/boundary-taxonomy.ts",
  "tools/habitat-harness/src/core/domains/host-policy.ts",
  "tools/habitat-harness/src/core/domains/host-policy/decisions.ts",
  "tools/habitat-harness/src/core/domains/host-policy/declarations.ts",
  "tools/habitat-harness/src/core/domains/host-policy/index.ts",
  "tools/habitat-harness/src/core/domains/host-policy/schema.ts",
  "tools/habitat-harness/src/core/domains/host-policy/state.ts",
  "tools/habitat-harness/src/workspace/taxonomy/nx-projects.ts",
  "tools/habitat-harness/src/substrate/lib/paths.ts",
  "tools/habitat-harness/src/core/domains/protected-zones/declarations.ts",
  "tools/habitat-harness/src/core/domains/protected-zones/diagnostics.ts",
  "tools/habitat-harness/src/core/domains/protected-zones/file-layer.ts",
  "tools/habitat-harness/src/core/domains/protected-zones/guard.ts",
  "tools/habitat-harness/src/core/domains/protected-zones/index.ts",
  "tools/habitat-harness/src/core/domains/protected-zones/path-actions.ts",
  "tools/habitat-harness/src/core/domains/protected-zones/recovery.ts",
  "tools/habitat-harness/src/core/domains/protected-zones/scan-root.ts",
  "tools/habitat-harness/src/core/domains/protected-zones/schema.ts",
]);

const allowedRuntimeEdges = new Set([
  "tools/habitat-harness/src/core/domains/rule-registry/load.ts",
  "tools/habitat-harness/src/core/domains/workspace-graph-integration/diff.ts",
  "tools/habitat-harness/src/core/domains/workspace-graph-integration/path.ts",
  "tools/habitat-harness/src/service/impl.ts",
]);

const allowedChildProcessEdges = new Set([
  "tools/habitat-harness/src/substrate/providers/command/runner.ts",
  "tools/habitat-harness/src/substrate/providers/command/sync.ts",
]);

const allowedFsEdges = new Set([
  "tools/habitat-harness/src/substrate/providers/grit/scan-roots/index.ts",
  "tools/habitat-harness/src/host/bin/habitat.ts",
  "tools/habitat-harness/src/core/domains/baseline-authority/context.ts",
  "tools/habitat-harness/src/core/domains/baseline-authority/state.ts",
  "tools/habitat-harness/src/core/domains/hook-runtime/resource-inspection.ts",
  "tools/habitat-harness/src/core/domains/hook-runtime/staged-worktree.ts",
  "tools/habitat-harness/src/core/domains/structural-check/render.ts",
  "tools/habitat-harness/src/workspace/taxonomy/boundary-taxonomy.ts",
  "tools/habitat-harness/src/substrate/providers/nx/inventory.ts",
  "tools/habitat-harness/src/substrate/providers/nx/rule-registry-loader.ts",
  "tools/habitat-harness/src/substrate/resources/filesystem.ts",
]);

const allowedSyncResourceHelperEdges = new Set([
  "tools/habitat-harness/src/core/domains/rule-registry/load.ts",
  "tools/habitat-harness/src/core/domains/workspace-graph-integration/diff.ts",
  "tools/habitat-harness/src/core/domains/workspace-graph-integration/path.ts",
]);

const allowedTimeEdges = new Set([
  "tools/habitat-harness/src/core/domains/structural-check/selection.ts",
  "tools/habitat-harness/src/substrate/providers/command/output.ts",
  "tools/habitat-harness/src/substrate/providers/command/runner.ts",
  "tools/habitat-harness/src/substrate/resources/time.ts",
]);

const allowedNativeClockEdges = new Set([
  "tools/habitat-harness/src/core/domains/hook-runtime/runtime.ts",
  "tools/habitat-harness/src/core/domains/structural-check/execution.ts",
  "tools/habitat-harness/src/core/domains/structural-check/report.ts",
  "tools/habitat-harness/src/core/domains/structural-check/selection.ts",
  "tools/habitat-harness/src/substrate/providers/command/runner.ts",
  "tools/habitat-harness/src/service/modules/verify/router.ts",
]);

const allowedEnvEdges = new Set([
  "tools/habitat-harness/src/core/domains/proof-contract/command-output.ts",
  "tools/habitat-harness/src/substrate/providers/command/runner.ts",
]);

const allowedArtifactSemantics = new Set([
  "tools/habitat-harness/src/substrate/providers/grit/constants.ts",
  "tools/habitat-harness/src/substrate/providers/grit/index.ts",
  "tools/habitat-harness/src/substrate/config/habitat-config.ts",
  "tools/habitat-harness/src/core/domains/baseline-authority/context.ts",
  "tools/habitat-harness/src/core/domains/baseline-authority/operations.ts",
  "tools/habitat-harness/src/core/domains/pattern-governance/apply-admissions.ts",
  "tools/habitat-harness/src/core/domains/pattern-governance/index.ts",
  "tools/habitat-harness/src/core/domains/pattern-governance/paths.ts",
  "tools/habitat-harness/src/core/domains/pattern-governance/schema.ts",
  "tools/habitat-harness/src/core/domains/pattern-governance/validation.ts",
  "tools/habitat-harness/src/core/domains/rule-registry/artifact-paths.ts",
  "tools/habitat-harness/src/core/domains/rule-registry/load.ts",
  "tools/habitat-harness/src/workspace/generators/pattern/generator.ts",
  "tools/habitat-harness/src/workspace/generators/pattern/paths.ts",
  "tools/habitat-harness/src/substrate/lib/artifact-paths.ts",
  "tools/habitat-harness/src/substrate/lib/paths.ts",
  "tools/habitat-harness/src/core/domains/protected-zones/declarations.ts",
  "tools/habitat-harness/src/core/domains/protected-zones/diagnostics.ts",
  "tools/habitat-harness/src/core/domains/protected-zones/guard.ts",
  "tools/habitat-harness/src/core/domains/protected-zones/recovery.ts",
  "tools/habitat-harness/src/core/domains/protected-zones/schema.ts",
  "tools/habitat-harness/src/workspace/plugin/nx-plugin.ts",
  "tools/habitat-harness/src/workspace/plugin/target-definitions.ts",
  "tools/habitat-harness/src/core/rules/architecture.ts",
]);

const allowedPublicDomainFacadeImports = new Map([
  [
    "tools/habitat-harness/src/host/public/check-report.ts",
    new Set(["@internal/habitat-harness/core/domains/structural-check/index"]),
  ],
  [
    "tools/habitat-harness/src/host/public/classify.ts",
    new Set(["@internal/habitat-harness/core/domains/workspace-graph-integration/index"]),
  ],
  [
    "tools/habitat-harness/src/host/public/generators.ts",
    new Set([
      "@internal/habitat-harness/workspace/generators/pattern/schema",
      "@internal/habitat-harness/workspace/generators/project/schema",
    ]),
  ],
  [
    "tools/habitat-harness/src/host/public/verify.ts",
    new Set(["@internal/habitat-harness/core/domains/proof-contract/index"]),
  ],
]);

const forbiddenPublicSymbols = [
  "BaselineAuthorityLive",
  "CommandRunnerLive",
  "Effect.run",
  "GitProviderLive",
  "GritProviderLive",
  "HabitatRuntimeLive",
  "ManagedRuntime",
  "WorkspaceToolProviderLive",
  "checkBaselineIntegrity",
  "makeFake",
  "readVerifyTargetPlan",
  "resolveVerifyBase",
  "runAffectedVerification",
  "runGraph",
  "runHabitatEffect",
];

export function runPublicSurfaceGuard(options = {}) {
  repoRoot = path.resolve(options.repoRoot ?? defaultRepoRoot);
  injectedFiles = options.injectedFiles
    ? new Map(options.injectedFiles)
    : options.injectedRoot
      ? injectedRepoFiles(options.injectedRoot)
      : new Map();
  failures = [];
  sourceFiles = [
    ...tsFiles(path.join(repoRoot, sourceRoot)),
    ...[...injectedFiles.keys()].filter(
      (file) => file.startsWith(`${sourceRoot}/`) && isTsSource(file)
    ),
  ].sort();

  checkPackageExports();
  checkHabitatArtifacts();
  checkPublicFacade();
  checkDeletedCompatibilityRoots();
  checkLibRatchet();
  checkServiceArchitecture();
  checkSourceEdges();
  checkSourceLanguage();
  checkCommandErrorOwnership();

  return {
    ok: failures.length === 0,
    failures: failures.map((failure) => ({
      title: failure.title,
      details: [...failure.details],
    })),
  };
}

export function renderPublicSurfaceGuardFailures(result) {
  const lines = ["=== Habitat Public Surface Guards ==="];
  for (const failure of result.failures) {
    lines.push("", failure.title);
    for (const detail of failure.details) lines.push(`  - ${detail}`);
  }
  return `${lines.join("\n")}\n`;
}

function checkPackageExports() {
  const manifest = JSON.parse(read(packagePath));
  const exportKeys = Object.keys(manifest.exports ?? {}).sort();
  const expected = [
    ".",
    "./core/*",
    "./host/*",
    "./service/*",
    "./substrate/*",
    "./workspace/*",
    "./workspace/plugin",
  ].sort();
  if (JSON.stringify(exportKeys) !== JSON.stringify(expected)) {
    fail("Package export map must expose only Habitat architectural roots.", [
      `${packagePath}: exports are ${JSON.stringify(exportKeys)}, expected ${JSON.stringify(expected)}`,
    ]);
  }

  for (const [key, value] of Object.entries(manifest.exports ?? {})) {
    const serialized = `${key} ${String(value)}`;
    if (
      /(?:^|\/)(?:base|bin|commands|config|domains|errors|generators|lib|plugin|providers|public|resources|rules|runtime)(?:\/|\*)/.test(
        serialized
      )
    ) {
      fail("Package export map leaks pre-consolidation implementation roots.", [
        `${key}: ${String(value)}`,
      ]);
    }
  }
}

function checkPublicFacade() {
  const rootIndex = "tools/habitat-harness/src/index.ts";
  if (read(rootIndex).trim() !== 'export * from "@internal/habitat-harness/host/public/index";') {
    fail("Root package index must stay a one-line public facade.", [rootIndex]);
  }

  const publicFiles = sourceFiles.filter((file) => file.startsWith(`${sourceRoot}/host/public/`));
  for (const file of publicFiles) {
    const text = read(file);
    for (const symbol of forbiddenPublicSymbols) {
      if (text.includes(symbol)) {
        fail("Public facade exports an internal runtime/provider/helper symbol.", [
          `${file}: contains ${symbol}`,
        ]);
      }
    }
    if (
      /from\s+["'](?:\.\.\/|@internal\/habitat-harness\/)(?:adapters|service|substrate)\//.test(
        text
      )
    ) {
      fail("Public facade imports from an internal implementation owner.", [file]);
    }
    const imports = [...text.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => ({
      line: lineForIndex(text, match.index ?? 0),
      source: match[1],
    }));
    const allowedImports = allowedPublicDomainFacadeImports.get(file) ?? new Set();
    const disallowedImports = imports.filter(
      (entry) =>
        entry.source.startsWith("@internal/habitat-harness/") && !allowedImports.has(entry.source)
    );
    if (disallowedImports.length > 0) {
      fail(
        "Public facade imports an unapproved domain surface.",
        disallowedImports.map((entry) => `${file}:${entry.line}: ${entry.source}`)
      );
    }
  }
}

function checkHabitatArtifacts() {
  const artifactFiles = filesUnder(".habitat");
  const executableArtifactFiles = artifactFiles.filter(
    (file) =>
      /^\.habitat\/(?:rules|patterns|baselines)\//.test(file) &&
      /\.(?:[cm]?js|jsx|[cm]?ts|tsx)$/.test(file)
  );
  if (executableArtifactFiles.length > 0) {
    fail(
      "Authored Habitat artifacts must stay declarative.",
      executableArtifactFiles.map(
        (file) => `${file}: executable managing code belongs in Habitat source`
      )
    );
  }

  const topologyDirs = [
    "adapters",
    "domains",
    "dist",
    "lib",
    "node_modules",
    "providers",
    "runtime",
    "services",
    "src",
  ];
  const topologySegments = new Set(topologyDirs);
  const vendorTopologyFiles = artifactFiles.filter((file) =>
    file
      .split("/")
      .slice(1)
      .some((segment) => topologySegments.has(segment))
  );
  if (vendorTopologyFiles.length > 0) {
    fail(
      "Authored Habitat artifacts must not grow source/vendor topology.",
      vendorTopologyFiles.map(
        (file) => `${file}: move implementation structure into its owning adapter/domain`
      )
    );
  }
}

function checkDeletedCompatibilityRoots() {
  for (const file of [
    "tools/habitat-harness/src/lib/baseline.ts",
    "tools/habitat-harness/src/lib/baseline-core",
    "tools/habitat-harness/src/lib/check",
    "tools/habitat-harness/src/lib/check-report.ts",
    "tools/habitat-harness/src/lib/classify-core",
    "tools/habitat-harness/src/lib/classify.ts",
    "tools/habitat-harness/src/lib/diagnostics.ts",
    "tools/habitat-harness/src/lib/fix.ts",
    "tools/habitat-harness/src/lib/graph.ts",
    "tools/habitat-harness/src/lib/hooks.ts",
    "tools/habitat-harness/src/lib/hook-runtime",
    "tools/habitat-harness/src/lib/pattern-apply",
    "tools/habitat-harness/src/lib/rule-selection.ts",
    "tools/habitat-harness/src/lib/verify",
    "tools/habitat-harness/src/lib/workspace-graph",
    "tools/habitat-harness/src/lib/workspace-graph.ts",
    "tools/habitat-harness/src/lib/workspace-graph-contract.ts",
    "tools/habitat-harness/src/core/domains/baseline-authority/integrity.ts",
    "tools/habitat-harness/src/core/domains/hook-runtime/command-runner.ts",
    "tools/habitat-harness/src/core/domains/hook-runtime/pre-push-base.ts",
    "tools/habitat-harness/src/core/rules/facts.ts",
    "tools/habitat-harness/src/core/rules/patterns",
    "tools/habitat-harness/src/core/rules/registry",
    "tools/habitat-harness/src/substrate/errors/domain-errors.ts",
    "tools/habitat-harness/src/substrate/runtime/run.ts",
    "tools/habitat-harness/src/adapters",
  ]) {
    if (fileExists(file)) {
      fail("Removed compatibility root returned.", [file]);
    }
  }
}

function checkLibRatchet() {
  const libFiles = sourceFiles.filter((file) => file.startsWith(`${sourceRoot}/lib/`));
  const unapproved = libFiles.filter((file) => !allowedLibFiles.has(file));
  if (unapproved.length > 0) {
    fail(
      "New Habitat feature/support files under src/lib require an owning domain/provider.",
      unapproved
    );
  }
}

function checkCommandErrorOwnership() {
  const commandErrorOwner = "tools/habitat-harness/src/substrate/providers/command/errors.ts";
  const commandErrorNames = [
    "CommandFailed",
    "CommandInterrupted",
    "CommandProviderError",
    "CommandUnavailable",
  ];
  const commandErrorDefinitionPattern =
    /export\s+(?:class\s+(?:CommandFailed|CommandInterrupted|CommandUnavailable)\b|type\s+CommandProviderError\s*=)/g;

  for (const file of sourceFiles) {
    const text = read(file);
    if (file !== commandErrorOwner) {
      checkAllowed(
        file,
        text,
        commandErrorDefinitionPattern,
        new Set([commandErrorOwner]),
        "Command provider errors must be defined by the command provider."
      );
    }

    if (!file.startsWith(`${sourceRoot}/substrate/providers/`)) {
      continue;
    }

    const aggregateErrorImports = importsFrom(text, /["'][^"']*errors\/index\.js["']/);
    const commandErrorLeaks = aggregateErrorImports.flatMap((entry) =>
      commandErrorNames
        .filter((name) => entry.specifier.includes(name))
        .map((name) => `${file}:${entry.line}: ${name}`)
    );
    if (commandErrorLeaks.length > 0) {
      fail("Provider and adapter modules must import command failures from the command provider.", [
        ...commandErrorLeaks,
      ]);
    }
  }
}

function checkServiceArchitecture() {
  checkAllowed(
    `${sourceRoot}/service/impl.ts`,
    read(`${sourceRoot}/service/impl.ts`),
    /\bimplementEffect\s*\(/g,
    allowedRuntimeEdges,
    "Effect-oRPC implementation belongs only in the root Habitat service seam."
  );

  const router = read(`${serviceRoot}/router.ts`);
  const rootRouterLeaks = [
    ...matchesIn(
      router,
      /\.effect\s*\(|\bprocess\.env\b|run[A-Z]\w*Service\b|createCheckReport/g
    ).map((line) => `${serviceRoot}/router.ts:${line}`),
  ];
  if (rootRouterLeaks.length > 0) {
    fail("Root Habitat service router must stay module composition only.", rootRouterLeaks);
  }

  for (const moduleName of serviceModuleNames) {
    const moduleFile = `${serviceRoot}/modules/${moduleName}/context.ts`;
    const routerFile = `${serviceRoot}/modules/${moduleName}/router.ts`;
    if (!fileExists(moduleFile) || !fileExists(routerFile)) {
      fail("Habitat service modules must keep context/router ownership files.", [
        `${moduleName}: missing context.ts or router.ts`,
      ]);
      continue;
    }

    const moduleText = read(moduleFile);
    const routerText = read(routerFile);
    const moduleLeaks = matchesIn(
      moduleText,
      /\.effect\s*\(|\bimplementEffect\b|\bManagedRuntime\b|\bLayer\.succeed\b/g
    ).map((line) => `${moduleFile}:${line}`);
    if (!moduleText.includes("habitatServiceImplementer")) {
      moduleLeaks.push(`${moduleFile}: missing habitatServiceImplementer import`);
    }
    if (!moduleText.includes(`habitatServiceImplementer.${moduleName}`)) {
      moduleLeaks.push(`${moduleFile}: missing habitatServiceImplementer.${moduleName} binding`);
    }
    if (!moduleText.includes("export const module =")) {
      moduleLeaks.push(`${moduleFile}: missing standard module implementer export`);
    }
    if (moduleLeaks.length > 0) {
      fail(
        "Habitat service context files must bind and decorate the owned service module only.",
        moduleLeaks
      );
    }

    const routerLeaks = matchesIn(
      routerText,
      /from\s+["']\.\/run\.js["']|\.router\s*\(|\bManagedRuntime\b|\bLayer\.succeed\b|export\s+(?:async\s+)?function\s+run[A-Z]\w*Service\b|export\s+const\s+run[A-Z]\w*Service\b/g
    ).map((line) => `${routerFile}:${line}`);
    if (!routerText.includes(".effect(")) {
      routerLeaks.push(`${routerFile}: missing procedure .effect implementation`);
    }
    if (routerLeaks.length > 0) {
      fail("Habitat service router files must own procedure logic directly.", routerLeaks);
    }

    const removedRunFile = `${serviceRoot}/modules/${moduleName}/run.ts`;
    if (fileExists(removedRunFile)) {
      fail("Habitat service logic must not move into separate run files.", [removedRunFile]);
    }
  }

  for (const file of sourceFiles.filter((entry) =>
    entry.startsWith(`${sourceRoot}/substrate/providers/`)
  )) {
    const text = read(file);
    const leaks = matchesIn(text, /from\s+["'][^"']*(?:service|domains)\//g).map(
      (line) => `${file}:${line}`
    );
    const serviceRuntimeLeaks = matchesIn(text, /\beffect-orpc\b|\bimplementEffect\b/g).map(
      (line) => `${file}:${line}`
    );
    if (leaks.length > 0 || serviceRuntimeLeaks.length > 0) {
      fail("Habitat providers must stay below service and domain ownership.", [
        ...leaks,
        ...serviceRuntimeLeaks,
      ]);
    }
  }
}

function checkSourceEdges() {
  for (const file of sourceFiles) {
    const text = read(file);
    checkAllowed(
      file,
      text,
      /\bEffect\.run(?:Promise|Sync|Fork)?\b|ManagedRuntime\.make\b|\bimplementEffect\s*\(/g,
      allowedRuntimeEdges,
      "Effect runtime construction/execution must stay in approved runtime edges."
    );
    checkAllowed(
      file,
      text,
      /from\s+["']node:child_process["']|\bspawnSync\s*\(/g,
      allowedChildProcessEdges,
      "Child-process sync execution must stay inside command provider implementation."
    );
    checkAllowed(
      file,
      text,
      /from\s+["']node:fs(?:\/promises)?["']/g,
      allowedFsEdges,
      "Direct fs imports must stay in approved resource/provider/legacy support edges."
    );
    checkAllowed(
      file,
      text,
      /import\s+\{[^}]*\b(?:isDirectorySync|isFileSync|readDirectorySync|readTextSync|statKindSync)\b[^}]*\}\s+from\s+["'][^"']*resources\/filesystem(?:\.ts|\.js)?["']/g,
      allowedSyncResourceHelperEdges,
      "Sync filesystem helper imports must stay in approved sync public/import-time edges."
    );
    checkAllowed(
      file,
      text,
      /\bDate\.now\s*\(|new\s+Date\s*\(/g,
      allowedTimeEdges,
      "Direct Date access must stay in approved resource/provider legacy edges."
    );
    checkAllowed(
      file,
      text,
      /import\s+\{[^}]*\bClock\b[^}]*\}\s+from\s+["']effect["']|\bClock\.currentTimeMillis\b/g,
      allowedNativeClockEdges,
      "Native Effect Clock usage must stay in approved Effect runtime/domain edges."
    );
    checkAllowed(
      file,
      text,
      /\bprocess\.env\b/g,
      allowedEnvEdges,
      "Direct env reads must stay in config/provider legacy edges."
    );
    checkAllowed(
      file,
      text,
      /\.habitat|ruleRegistryRepoPath|baselineRepoPath|patternManifestRoot|patternManifestPath/g,
      allowedArtifactSemantics,
      "Authored artifact path semantics must stay in artifact authority owners."
    );
  }
}

function checkSourceLanguage() {
  for (const file of sourceFiles) {
    const text = read(file);
    if (file.startsWith(`${sourceRoot}/core/domains/`)) {
      checkAllowed(
        file,
        text,
        /from\s+["'](?:@internal\/habitat-harness\/substrate\/providers\/[^/]+\/(?:(?:errors|fake|materialize|observation|output|request|result|runner|spawn-result|types)(?:\.js)?|(?:internal|live|private)\/[^"']+)|[^"']*(?:\.\.\/)+substrate\/providers\/[^/]+\/(?:(?:errors|fake|materialize|observation|output|request|result|runner|spawn-result|types)\.js|(?:internal|live|private)\/[^"']+))["']/g,
        new Set(),
        "Domain modules must import provider public modules, not provider internals."
      );
    }

    if (!isGenericHabitatSurface(file)) continue;
    const matches = [
      ...text.matchAll(/\b(?:Civ7|MapGen|Swooper|recipe|placement|terrain)\b|product parser/g),
    ].map((match) => `${file}:${lineForIndex(text, match.index ?? 0)}`);
    if (matches.length > 0) {
      fail("Generic Habitat surfaces must not hard-code product vocabulary.", matches);
    }
  }
}

function importsFrom(text, sourcePattern) {
  return [...text.matchAll(/import\s+(?:type\s+)?([\s\S]*?)\s+from\s+([^;\n]+);/g)]
    .filter((match) => sourcePattern.test(match[2]))
    .map((match) => ({
      line: lineForIndex(text, match.index ?? 0),
      specifier: match[1],
    }));
}

function checkAllowed(file, text, pattern, allowedFiles, title) {
  const matches = matchesIn(text, pattern);
  if (matches.length === 0 || allowedFiles.has(file)) return;
  fail(
    title,
    matches.map((line) => `${file}:${line}`)
  );
}

function matchesIn(text, pattern) {
  return [...text.matchAll(pattern)].map((match) => lineForIndex(text, match.index ?? 0));
}

function tsFiles(root) {
  const entries = readdirSync(root, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) return tsFiles(fullPath);
    if (!isTsSource(entry.name)) return [];
    return [toRepoRelative(fullPath)];
  });
}

function filesUnder(repoRelativeRoot) {
  const root = path.join(repoRoot, repoRelativeRoot);
  const actual = existsSync(root) ? repoFiles(root) : [];
  const injected = [...injectedFiles.keys()].filter((file) =>
    file.startsWith(`${repoRelativeRoot}/`)
  );
  return [...new Set([...actual, ...injected])].sort();
}

function repoFiles(root) {
  const entries = readdirSync(root, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) return repoFiles(fullPath);
    return [toRepoRelative(fullPath)];
  });
}

function injectedRepoFiles(root) {
  const absoluteRoot = path.resolve(root);
  const files = new Map();
  for (const file of repoFilesFromRoot(absoluteRoot)) {
    files.set(
      path.relative(absoluteRoot, file).replaceAll(path.sep, "/"),
      readFileSync(file, "utf8")
    );
  }
  return files;
}

function repoFilesFromRoot(root) {
  const entries = readdirSync(root, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) return repoFilesFromRoot(fullPath);
    return [fullPath];
  });
}

function isTsSource(file) {
  return /\.(?:[cm]?ts|tsx)$/.test(file);
}

function isGenericHabitatSurface(file) {
  return [
    `${sourceRoot}/host/public/`,
    `${sourceRoot}/service/`,
    `${sourceRoot}/substrate/config/`,
    `${sourceRoot}/substrate/providers/`,
    `${sourceRoot}/substrate/resources/`,
    `${sourceRoot}/substrate/runtime/`,
  ].some((prefix) => file.startsWith(prefix));
}

function lineForIndex(text, index) {
  return text.slice(0, index).split("\n").length;
}

function read(file) {
  if (injectedFiles.has(file)) return injectedFiles.get(file);
  return readFileSync(path.join(repoRoot, file), "utf8");
}

function fileExists(file) {
  return injectedFiles.has(file) || existsSync(path.join(repoRoot, file));
}

function fail(title, details) {
  failures.push({ title, details });
}

function toRepoRelative(file) {
  return path.relative(repoRoot, file).replaceAll(path.sep, "/");
}
