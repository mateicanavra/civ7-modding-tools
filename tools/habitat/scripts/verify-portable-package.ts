import { deepStrictEqual, strictEqual } from "node:assert";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  archiveName,
  archivePath,
  checksumDocument,
  checksumPath,
  repoRoot,
  sha256File,
} from "./portable-package-artifact.js";

const proofRoot = mkdtempSync(path.join(tmpdir(), "habitat-package-proof-"));
const consumerRoots = [
  path.join(proofRoot, "consumer-location-a"),
  path.join(proofRoot, "consumer-location-b"),
] as const;
const vanillaEffectOrpcIdentity = {
  version: "0.5.0",
  distSha256: "3218096d64421d8c52fa7633dfb618c2a06d603ca67c6d55cde6be1bc71bf4de",
} as const;
let verified = false;

try {
  verifyBunRuntime();
  verifyRetainedArtifact();
  const exactTree = verifyCleanExactTreeRebuild();

  for (const [index, consumerRoot] of consumerRoots.entries()) {
    writeConsumerWorkspace(consumerRoot);
    run("git", ["init", "--quiet"], consumerRoot);
    run("git", ["add", "."], consumerRoot);
    run("bun", ["install", "--linker", "isolated"], consumerRoot);
    acquireInstalledGrit(consumerRoot);
    verifyConsumerTypes(consumerRoot, index === 0);
  }

  const firstProject = verifyInstalledWorkspace(consumerRoots[0]);
  const secondProject = verifyInstalledWorkspace(consumerRoots[1]);
  deepStrictEqual(
    secondProject,
    firstProject,
    "relocating the consumer changed the inferred Nx target definition"
  );
  verifyVanillaMiddlewareLineage(consumerRoots[0]);

  const check = capture(
    path.join(consumerRoots[0], "node_modules/.bin/nx"),
    ["run", "sample:check:policy:local", "--skipNxCache", "--outputStyle=static"],
    consumerRoots[0]
  );
  assertIncludes(
    check,
    "shared:rule-diagnostics:alpha-rule,beta-rule",
    "multi-pattern shared execution"
  );

  const generator = capture(
    path.join(consumerRoots[0], "node_modules/.bin/nx"),
    [
      "g",
      "@habitat/cli:project",
      "portable-probe",
      "--kind=plugin",
      "--dry-run",
      "--no-interactive",
    ],
    consumerRoots[0]
  );
  assertIncludes(
    generator,
    "packages/plugins/plugin-portable-probe",
    "compiled generator metadata"
  );

  process.stdout.write(
    `Verified ${archivePath}\nVerified ${checksumPath}\ntree ${exactTree}\nsha256 ${sha256File(archivePath)}\n`
  );
  verified = true;
} finally {
  if (verified) rmSync(proofRoot, { recursive: true, force: true });
  else process.stderr.write(`Portable-package proof retained at ${proofRoot}\n`);
}

function verifyBunRuntime(): void {
  strictEqual(
    capture("bun", ["--version"], repoRoot).trim(),
    "1.3.14",
    "portable-package proof requires the current supported Bun 1.3.14"
  );
}

function verifyRetainedArtifact(): void {
  if (!existsSync(archivePath) || !existsSync(checksumPath)) {
    throw new Error("Run the Habitat pack target before external package verification.");
  }
  const digest = sha256File(archivePath);
  strictEqual(
    readFileSync(checksumPath, "utf8"),
    checksumDocument(digest),
    "retained checksum does not describe the exact retained archive"
  );

  const entries = capture("tar", ["-tzf", archivePath], repoRoot)
    .trim()
    .split("\n")
    .map((entry) => entry.replace(/^\.\//, ""));
  for (const required of [
    "package/bin/run.js",
    "package/dist/index.js",
    "package/dist/index.d.ts",
    "package/dist/nx-plugin.js",
    "package/dist/nx-plugin.d.ts",
    "package/dist/service/router.d.ts",
    "package/generators.json",
    "package/oclif.manifest.json",
    "package/schemas/scaffold-pattern.schema.json",
    "package/schemas/scaffold-project.schema.json",
  ]) {
    if (!entries.includes(required)) {
      throw new Error(`Packed Habitat artifact is missing ${required}.`);
    }
  }
  for (const forbidden of ["/src/", "/bin/dev.ts", ".map", "tsup.commands.config"]) {
    if (entries.some((entry) => entry.includes(forbidden))) {
      throw new Error(`Packed Habitat artifact contains forbidden entry matching ${forbidden}.`);
    }
  }
  verifyArchiveModes();

  const serviceRouterDeclaration = capture(
    "tar",
    ["-xOf", archivePath, "package/dist/service/router.d.ts"],
    repoRoot
  );
  assertIncludes(
    serviceRouterDeclaration,
    'import type { Router } from "@orpc/server";',
    "vanilla oRPC public service router declaration"
  );
  for (const patchOnlyType of [
    'import("effect-orpc").EffectProcedure',
    'import("effect-orpc").EnhancedEffectRouter',
    'import("effect-orpc").EffectMiddlewareOptions',
  ]) {
    if (serviceRouterDeclaration.includes(patchOnlyType)) {
      throw new Error(
        `Packed Habitat service declaration depends on producer-only type ${patchOnlyType}.`
      );
    }
  }
}

function verifyArchiveModes(): void {
  const listing = capture("tar", ["-tvzf", archivePath], repoRoot);
  for (const line of listing.trim().split("\n")) {
    const packagePathIndex = line.indexOf(" package/");
    if (packagePathIndex === -1) {
      throw new Error(`Could not identify packed Habitat entry in tar listing: ${line}`);
    }
    const packagePath = line.slice(packagePathIndex + 9);
    const actualMode = line.trim().split(/\s+/, 1)[0];
    const expectedMode = packagePath === "bin/run.js" ? "-rwxr-xr-x" : "-rw-r--r--";
    strictEqual(actualMode, expectedMode, `portable archive mode for ${packagePath}`);
  }
}

function verifyCleanExactTreeRebuild(): string {
  strictEqual(
    capture("git", ["status", "--porcelain=v1", "--untracked-files=normal"], repoRoot).trim(),
    "",
    "clean exact-tree rebuild requires a clean Git worktree"
  );

  const exactTree = capture("git", ["rev-parse", "HEAD^{tree}"], repoRoot).trim();
  const treeArchive = path.join(proofRoot, `${exactTree}.tar`);
  const cleanRoot = path.join(proofRoot, "exact-tree");
  mkdirSync(cleanRoot, { recursive: true });
  run("git", ["archive", "--format=tar", `--output=${treeArchive}`, exactTree], repoRoot);
  run("tar", ["-xf", treeArchive, "-C", cleanRoot], repoRoot);
  run("bun", ["install", "--frozen-lockfile"], cleanRoot);

  const cleanPackageRoot = path.join(cleanRoot, "tools/habitat");
  const declarationCompiler = "../../node_modules/typescript/bin/tsc";
  strictEqual(
    capture("node", [declarationCompiler, "--version"], cleanPackageRoot).trim(),
    "Version 6.0.3",
    "portable declaration compiler identity"
  );
  run("node", [declarationCompiler, "-p", "tsconfig.json"], cleanPackageRoot);
  run(path.join(cleanRoot, "node_modules/.bin/oclif"), ["manifest"], cleanPackageRoot);
  run("bun", ["run", "scripts/pack-portable-package.ts"], cleanPackageRoot);

  const cleanArchive = path.join(cleanPackageRoot, "artifacts", archiveName);
  const cleanChecksum = `${cleanArchive}.sha256`;
  const cleanDigest = sha256File(cleanArchive);
  const retainedDigest = sha256File(archivePath);
  strictEqual(
    readFileSync(cleanChecksum, "utf8"),
    checksumDocument(cleanDigest),
    "clean exact-tree checksum does not describe its archive"
  );
  strictEqual(
    Buffer.compare(readFileSync(cleanArchive), readFileSync(archivePath)),
    0,
    `clean exact-tree rebuild ${exactTree} produced sha256 ${cleanDigest}; retained artifact is ${retainedDigest}`
  );
  strictEqual(cleanDigest, retainedDigest);
  return exactTree;
}

function verifyInstalledWorkspace(consumerRoot: string): unknown {
  const installedPackageRoot = realpathSync(path.join(consumerRoot, "node_modules/@habitat/cli"));
  if (
    existsSync(path.join(installedPackageRoot, "src")) ||
    existsSync(path.join(installedPackageRoot, "bin/dev.ts"))
  ) {
    throw new Error("Installed Habitat package exposed source-only implementation files.");
  }
  verifyVanillaEffectOrpc(installedPackageRoot);

  const gritRequire = createRequire(
    pathToFileURL(
      path.join(installedPackageRoot, "dist/resources/rule-diagnostics/providers/grit/command.js")
    ).href
  );
  const gritPackagePath = gritRequire.resolve("@getgrit/cli/package.json");
  const topLevelGritPackagePath = path.join(consumerRoot, "node_modules/@getgrit/cli/package.json");
  if (path.resolve(gritPackagePath) === path.resolve(topLevelGritPackagePath)) {
    throw new Error(
      "Pinned Grit resolved from the consumer root instead of Habitat's module graph."
    );
  }
  const nativeGritPath = path.join(
    path.dirname(gritPackagePath),
    "node_modules/.bin_real",
    process.platform === "win32" ? "grit.exe" : "grit"
  );
  strictEqual(
    capture(nativeGritPath, ["--version"], consumerRoot).trim(),
    "grit 0.1.1",
    "module-relative pinned Grit native identity"
  );

  const help = capture(
    path.join(consumerRoot, "node_modules/.bin/habitat"),
    ["--help"],
    consumerRoot
  );
  assertIncludes(help, "Portable structural-policy CLI", "installed Habitat help");

  const projectSource = capture(
    path.join(consumerRoot, "node_modules/.bin/nx"),
    ["show", "project", "sample", "--json"],
    consumerRoot
  );
  assertIncludes(
    projectSource,
    "habitat check --rule alpha-rule --rule beta-rule",
    "inferred installed-binary target"
  );
  if (
    projectSource.includes(consumerRoot) ||
    projectSource.includes("HABITAT_REPO_ROOT") ||
    projectSource.includes("tools/habitat/bin/dev.ts")
  ) {
    throw new Error("Inferred Nx target retained a location-specific or source-only identity.");
  }
  return JSON.parse(projectSource) as unknown;
}

function verifyVanillaEffectOrpc(installedPackageRoot: string): void {
  const habitatServiceRequire = createRequire(
    pathToFileURL(path.join(installedPackageRoot, "dist/service/impl.js")).href
  );
  const effectOrpcPackagePath = habitatServiceRequire.resolve("effect-orpc/package.json");
  const effectOrpcRoot = path.dirname(effectOrpcPackagePath);
  const effectOrpcPackage = JSON.parse(readFileSync(effectOrpcPackagePath, "utf8")) as {
    version?: string;
    exports?: Record<string, unknown>;
    patchedDependencies?: unknown;
  };
  strictEqual(
    effectOrpcPackage.version,
    vanillaEffectOrpcIdentity.version,
    "installed effect-orpc package identity"
  );
  strictEqual(
    effectOrpcPackage.exports?.["."],
    "./src/index.ts",
    "consumer must resolve the unpatched registry artifact"
  );
  strictEqual(
    effectOrpcPackage.patchedDependencies,
    undefined,
    "consumer must not inherit producer patch machinery"
  );
  strictEqual(
    sha256File(path.join(effectOrpcRoot, "dist/index.js")),
    vanillaEffectOrpcIdentity.distSha256,
    "installed effect-orpc runtime must match the vanilla 0.5.0 registry artifact"
  );
}

function verifyVanillaMiddlewareLineage(consumerRoot: string): void {
  const reportSource = capture(
    path.join(consumerRoot, "node_modules/.bin/habitat"),
    ["check", "--rule", "alpha-rule", "--rule", "beta-rule", "--json"],
    consumerRoot
  );
  const report = JSON.parse(reportSource) as {
    schemaVersion?: number;
    ok?: boolean;
    rules?: Array<{ ruleId?: string; status?: string }>;
  };
  strictEqual(report.schemaVersion, 2, "vanilla middleware lineage report schema");
  strictEqual(report.ok, true, "vanilla middleware lineage report result");
  deepStrictEqual(
    report.rules?.map(({ ruleId, status }) => ({ ruleId, status })),
    [
      { ruleId: "alpha-rule", status: "pass" },
      { ruleId: "beta-rule", status: "pass" },
    ],
    "vanilla effect-orpc must preserve Habitat service, module, and handler middleware lineage"
  );
}

function acquireInstalledGrit(consumerRoot: string): void {
  run(
    "bun",
    ["-e", 'import { acquirePinnedGrit } from "@habitat/cli/grit"; acquirePinnedGrit();'],
    consumerRoot
  );
}

function verifyConsumerTypes(consumerRoot: string, verifyLeakRejection: boolean): void {
  const tsc = path.join(consumerRoot, "node_modules/.bin/tsc");
  run(tsc, ["--project", "tsconfig.service.json", "--noEmit"], consumerRoot);
  if (verifyLeakRejection) {
    verifyPatchedOnlyDeclarationRejection(consumerRoot, tsc);
  }
  run(tsc, ["--project", "tsconfig.nx-plugin.json", "--noEmit"], consumerRoot);
}

function verifyPatchedOnlyDeclarationRejection(consumerRoot: string, tsc: string): void {
  const installedPackageRoot = realpathSync(path.join(consumerRoot, "node_modules/@habitat/cli"));
  const routerDeclarationPath = path.join(installedPackageRoot, "dist/service/router.d.ts");
  const routerDeclaration = readFileSync(routerDeclarationPath, "utf8");

  try {
    writeFileSync(
      routerDeclarationPath,
      `${routerDeclaration}\nexport type InjectedProducerPatchLeak = import("effect-orpc").EffectProcedure;\n`
    );
    const failure = captureFailure(
      tsc,
      ["--project", "tsconfig.service.json", "--noEmit"],
      consumerRoot
    );
    assertIncludes(
      failure,
      "EffectProcedure",
      "no-skip service declaration rejection of an injected producer-patch type"
    );
  } finally {
    writeFileSync(routerDeclarationPath, routerDeclaration);
  }

  run(tsc, ["--project", "tsconfig.service.json", "--noEmit"], consumerRoot);
}

function writeConsumerWorkspace(consumerRoot: string): void {
  writeJson(consumerRoot, "package.json", {
    name: "habitat-portable-consumer",
    version: "0.0.0",
    private: true,
    trustedDependencies: ["@getgrit/cli"],
    devDependencies: {
      "@opentelemetry/api": "1.9.0",
      "@types/node": "22.19.21",
      "@types/ws": "8.18.1",
      "@habitat/cli": `file:${archivePath}`,
      nx: "23.1.0",
      typescript: "5.9.3",
    },
  });
  const sharedCompilerOptions = {
    module: "ESNext",
    moduleResolution: "Bundler",
    noEmit: true,
    strict: true,
    target: "ES2022",
    types: ["node"],
  };
  writeJson(consumerRoot, "tsconfig.service.json", {
    compilerOptions: {
      ...sharedCompilerOptions,
      skipLibCheck: false,
    },
    include: ["service-type-contract.ts"],
  });
  writeText(
    consumerRoot,
    "service-type-contract.ts",
    [
      'import type { HabitatServiceContext } from "@habitat/cli/service/base";',
      'import type { HabitatServiceContract } from "@habitat/cli/service/contract";',
      'import { habitatServiceRouter, type HabitatServiceRouter } from "@habitat/cli/service/router";',
      "",
      "const serviceRouter: HabitatServiceRouter = habitatServiceRouter;",
      "type PublicServiceContract = HabitatServiceContract;",
      "type PublicServiceContext = HabitatServiceContext;",
      "void serviceRouter;",
      "export type { PublicServiceContext, PublicServiceContract };",
      "",
    ].join("\n")
  );
  writeJson(consumerRoot, "tsconfig.nx-plugin.json", {
    compilerOptions: {
      ...sharedCompilerOptions,
      skipLibCheck: true,
    },
    include: ["nx-plugin-type-contract.ts"],
  });
  writeText(
    consumerRoot,
    "nx-plugin-type-contract.ts",
    [
      'import { createNodes } from "@habitat/cli/nx-plugin";',
      "",
      "const pluginContract: typeof createNodes = createNodes;",
      "void pluginContract;",
      "",
    ].join("\n")
  );
  writeJson(consumerRoot, "nx.json", {
    namedInputs: {
      default: ["{projectRoot}/**/*", "sharedGlobals"],
      sharedGlobals: [],
      habitatRuntime: [
        "{workspaceRoot}/package.json",
        "{workspaceRoot}/bun.lock",
        { env: "HABITAT_HARNESS_ROOT" },
        { env: "HABITAT_CACHE_ROOT" },
        { env: "HABITAT_PATTERN_CACHE_ROOT" },
        { env: "HABITAT_TELEMETRY_DISABLED" },
        { env: "HABITAT_COMMAND_TIMEOUT_MS" },
      ],
    },
    plugins: [
      {
        plugin: "@habitat/cli/nx-plugin",
        options: { checkTargetName: "check:policy" },
      },
    ],
  });
  writeJson(consumerRoot, "packages/sample/package.json", {
    name: "sample",
    version: "0.0.0",
    private: true,
    nx: { tags: ["kind:library"] },
  });
  writeText(consumerRoot, "packages/sample/src/index.ts", "export const portableFixture = true;\n");
  writeJson(consumerRoot, ".habitat/index.json", {
    schemaVersion: 2,
    ownerRoots: { sample: "packages/sample" },
  });
  writeRule(consumerRoot, "alpha-rule", "alpha_portable_fixture_marker");
  writeRule(consumerRoot, "beta-rule", "beta_portable_fixture_marker");
}

function writeRule(consumerRoot: string, ruleId: string, marker: string): void {
  const ruleRoot = `.habitat/fixtures/rules/${ruleId}`;
  writeJson(consumerRoot, `${ruleRoot}/rule.json`, {
    schemaVersion: 2,
    id: ruleId,
    title: ruleId,
    placement: { niche: "fixtures", blueprint: "_self", category: "quality" },
    operation: { kind: "check" },
    ownerProject: "sample",
    lane: "enforced",
    forbids: "fixture marker",
    why: "Proves the packed Habitat runtime in an external Nx workspace.",
    remediate: null,
    message: "Remove the fixture marker.",
    pathCoverage: [
      {
        kind: "exact-path",
        patterns: ["packages/sample/src/**/*.ts"],
      },
    ],
    supportFiles: { baseline: `${ruleRoot}/baseline.json` },
    runner: {
      name: "grit",
      files: { pattern: `${ruleRoot}/pattern.md` },
      patternName: ruleId.replaceAll("-", "_"),
      acquisition: { kind: "check", roots: ["packages/sample"] },
    },
  });
  writeJson(consumerRoot, `${ruleRoot}/baseline.json`, []);
  writeText(
    consumerRoot,
    `${ruleRoot}/pattern.md`,
    `---\nlevel: error\n---\n# ${ruleId}\n\n\`\`\`grit\nlanguage js\n\n\`${marker}\`\n\`\`\`\n`
  );
}

function writeJson(consumerRoot: string, relativePath: string, value: unknown): void {
  writeText(consumerRoot, relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(consumerRoot: string, relativePath: string, contents: string): void {
  const target = path.join(consumerRoot, relativePath);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, contents);
}

function run(executable: string, argv: readonly string[], cwd = repoRoot): void {
  execFileSync(executable, argv, {
    cwd,
    env: { ...process.env, FORCE_COLOR: "0" },
    stdio: "inherit",
  });
}

function capture(executable: string, argv: readonly string[], cwd: string): string {
  return execFileSync(executable, argv, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, FORCE_COLOR: "0" },
  });
}

function captureFailure(executable: string, argv: readonly string[], cwd: string): string {
  try {
    capture(executable, argv, cwd);
  } catch (error) {
    const failure = error as { stderr?: string; stdout?: string };
    return `${failure.stdout ?? ""}${failure.stderr ?? ""}`;
  }
  throw new Error(`Expected command to fail: ${executable} ${argv.join(" ")}`);
}

function assertIncludes(output: string, expected: string, label: string): void {
  if (!output.includes(expected)) {
    throw new Error(`Portable-package proof did not observe ${label}: ${expected}`);
  }
}
