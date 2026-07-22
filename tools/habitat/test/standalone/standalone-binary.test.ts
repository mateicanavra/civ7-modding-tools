import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import { type CheckReport, CheckReportSchema } from "@habitat/cli/service/model/check/index";
import { Match, Schema } from "effect";
import { type Static, Type } from "typebox";
import { Value } from "typebox/value";
import { afterAll, beforeAll, describe, it } from "vitest";
import { standaloneCompilerManifest } from "../../scripts/standalone/compiler-manifest.js";

const repoRoot = path.resolve(fileURLToPath(new URL("../../../..", import.meta.url)));
const distDir = path.join(repoRoot, "tools", "habitat", "dist", "standalone");
const tempRoot = mkdtempSync(path.join(realpathSync(tmpdir()), "habitat-sdk-blackbox-"));
const movedBinary = path.join(tempRoot, "bin", "habitat-sdk");
const JsonUnknownSchema = Schema.parseJson(Schema.Unknown);
const EmbeddedCompilerFeatureDataSchema = Type.Object(
  {
    version: Type.Literal(standaloneCompilerManifest.version),
    revision: Type.Literal(standaloneCompilerManifest.revision),
    is_canary: Type.Literal(true),
  },
  { additionalProperties: true }
);
const DistributionEvidenceAssetSchema = Type.Object(
  {
    githubAssetId: Type.Integer({ minimum: 1 }),
    filename: Type.String({ minLength: 1 }),
    sha256: Type.String({ pattern: "^[0-9a-f]{64}$" }),
  },
  { additionalProperties: false }
);
const releaseFilenames = ["habitat-sdk-darwin-arm64", "provenance.json", "SHA256SUMS"] as const;
const ArtifactSchema = Type.Object(
  {
    target: Type.String({ minLength: 1 }),
    bunTarget: Type.String({ minLength: 1 }),
    filename: Type.String({ minLength: 1 }),
    sha256: Type.String({ pattern: "^[0-9a-f]{64}$" }),
    bytes: Type.Integer({ minimum: 1 }),
    bundledInputCount: Type.Integer({ minimum: 1 }),
  },
  { additionalProperties: false }
);
const StandaloneProvenanceSchema = Type.Object(
  {
    schemaVersion: Type.Literal(2),
    source: Type.Object(
      {
        commit: Type.String({ pattern: "^[0-9a-f]{40}$" }),
        habitatTree: Type.String({ pattern: "^[0-9a-f]{40}$" }),
        workingTreeDirty: Type.Boolean(),
      },
      { additionalProperties: false }
    ),
    bun: Type.Object(
      {
        name: Type.Literal(standaloneCompilerManifest.name),
        version: Type.Literal(standaloneCompilerManifest.version),
        revision: Type.Literal(standaloneCompilerManifest.revision),
        upstream: Type.Object(
          {
            repository: Type.Literal(standaloneCompilerManifest.upstream.repository),
            releaseId: Type.Literal(standaloneCompilerManifest.upstream.releaseId),
            tag: Type.Literal(standaloneCompilerManifest.upstream.tag),
            capturedAt: Type.Literal(standaloneCompilerManifest.upstream.capturedAt),
            observedReleaseName: Type.Literal(
              standaloneCompilerManifest.upstream.observedReleaseName
            ),
            observedReleaseNameTrustedForIdentity: Type.Literal(false),
          },
          { additionalProperties: false }
        ),
        distribution: Type.Object(
          {
            repository: Type.Literal(standaloneCompilerManifest.distribution.repository),
            releaseId: Type.Literal(standaloneCompilerManifest.distribution.releaseId),
            tag: Type.Literal(standaloneCompilerManifest.distribution.tag),
            releaseUrl: Type.Literal(standaloneCompilerManifest.distribution.releaseUrl),
            immutable: Type.Literal(true),
            provenanceAsset: DistributionEvidenceAssetSchema,
            checksumsAsset: DistributionEvidenceAssetSchema,
          },
          { additionalProperties: false }
        ),
        asset: Type.Object(
          {
            id: Type.Literal("darwin-arm64"),
            upstreamGithubAssetId: Type.Integer({ minimum: 1 }),
            distributionGithubAssetId: Type.Integer({ minimum: 1 }),
            archiveFilename: Type.String({ minLength: 1 }),
            archiveSha256: Type.String({ pattern: "^[0-9a-f]{64}$" }),
            executableSha256: Type.String({ pattern: "^[0-9a-f]{64}$" }),
          },
          { additionalProperties: false }
        ),
      },
      { additionalProperties: false }
    ),
    boundary: Type.Object(
      {
        command: Type.Literal("check"),
        rejectUnresolved: Type.Literal(true),
        compileAutoloadDotenv: Type.Literal(false),
        compileAutoloadBunfig: Type.Literal(false),
        bundledGritProvider: Type.Literal(false),
        excludedInputs: Type.Tuple([
          Type.Literal("@getgrit/cli"),
          Type.Literal("@oclif/*"),
          Type.Literal("oclif"),
          Type.Literal("@nx/*"),
          Type.Literal("nx"),
          Type.Literal("effect-orpc"),
        ]),
      },
      { additionalProperties: false }
    ),
    artifact: Type.Intersect([
      ArtifactSchema,
      Type.Object({
        target: Type.Literal("darwin-arm64"),
        bunTarget: Type.Literal("bun-darwin-arm64"),
        filename: Type.Literal(releaseFilenames[0]),
      }),
    ]),
  },
  { additionalProperties: false }
);
type StandaloneProvenance = Static<typeof StandaloneProvenanceSchema>;

describe.sequential("standalone Habitat binary", () => {
  let acceptedReleaseHashes: Record<string, string>;

  beforeAll(() => {
    acceptedReleaseHashes = releaseHashes();
    mkdirSync(path.dirname(movedBinary), { recursive: true });
    copyFileSync(hostArtifactPath(), movedBinary);
    chmodSync(movedBinary, 0o755);
  });

  afterAll(() => {
    assertSafeTempRoot(tempRoot);
    rmSync(tempRoot, { recursive: true, force: true });
  });

  it("embeds the pinned Bun feature identity in the moved native artifact", () => {
    const compilerModeEnvironment = {
      ...process.env,
      BUN_BE_BUN: "1",
      BUN_DEBUG_QUIET_LOGS: "1",
      BUN_FEATURE_FLAG_INTERNAL_FOR_TESTING: "1",
      BUN_GARBAGE_COLLECTOR_LEVEL: "0",
    };
    const nameResult = spawnSync(movedBinary, ["--revision"], {
      cwd: tempRoot,
      encoding: "utf8",
      env: compilerModeEnvironment,
    });
    assert.strictEqual(nameResult.signal, null, nameResult.stderr);
    assert.strictEqual(nameResult.status, 0, nameResult.stderr);
    assert.strictEqual(nameResult.stdout.trim(), standaloneCompilerManifest.name);

    const versionResult = spawnSync(movedBinary, ["--version"], {
      cwd: tempRoot,
      encoding: "utf8",
      env: compilerModeEnvironment,
    });
    assert.strictEqual(versionResult.signal, null, versionResult.stderr);
    assert.strictEqual(versionResult.status, 0, versionResult.stderr);
    assert.strictEqual(versionResult.stdout.trim(), standaloneCompilerManifest.version);

    const result = spawnSync(
      movedBinary,
      [
        "--print",
        'JSON.stringify(require("bun:internal-for-testing").crash_handler.getFeatureData())',
      ],
      {
        cwd: tempRoot,
        encoding: "utf8",
        env: compilerModeEnvironment,
      }
    );
    assert.strictEqual(result.signal, null, result.stderr);
    assert.strictEqual(result.status, 0, result.stderr);
    const featureData = Value.Parse(
      EmbeddedCompilerFeatureDataSchema,
      Schema.decodeUnknownSync(JsonUnknownSchema)(result.stdout)
    );
    assert.strictEqual(featureData.version, standaloneCompilerManifest.version);
    assert.strictEqual(featureData.revision, standaloneCompilerManifest.revision);
    assert.strictEqual(featureData.is_canary, true);
  });

  it("runs moved structure checks without mutating the destination", () => {
    const fixture = path.join(tempRoot, "structure");
    createStructureFixture(fixture);
    const beforePass = fingerprintTree(fixture);
    const pass = runBinary(fixture, ["check", "--rule", "fixture_service_topology", "--json"]);
    assert.strictEqual(pass.status, 0);
    assert.strictEqual(pass.report.ok, true);
    assert.strictEqual(pass.report.rules[0]?.status, "pass");
    assert.strictEqual(fingerprintTree(fixture), beforePass);

    mkdirSync(path.join(fixture, "service", "unexpected"));
    const beforeFailure = fingerprintTree(fixture);
    const failure = runBinary(fixture, ["check", "--rule", "fixture_service_topology", "--json"]);
    assert.strictEqual(failure.status, 1);
    assert.strictEqual(failure.report.ok, false);
    assert.strictEqual(failure.report.rules[0]?.status, "fail");
    assert.strictEqual(failure.report.rules[0]?.diagnostics.length, 1);
    assert.strictEqual(fingerprintTree(fixture), beforeFailure);
  });

  it("runs moved Grit checks through the destination-owned provider", () => {
    const fixture = path.join(tempRoot, "grit");
    createGritFixture(fixture, true);
    const sourcePath = path.join(fixture, "src", "example.ts");
    writeFileSync(sourcePath, "export const allowed = true;\n", "utf8");
    const beforePass = fingerprintTree(fixture);
    const pass = runBinary(fixture, ["check", "--rule", "forbid_fixture_token", "--json"]);
    assert.strictEqual(pass.status, 0);
    assert.strictEqual(pass.report.ok, true);
    assert.strictEqual(pass.report.rules[0]?.status, "pass");
    assert.strictEqual(fingerprintTree(fixture), beforePass);

    writeFileSync(sourcePath, "export const FORBIDDEN_HABITAT_FIXTURE = true;\n", "utf8");
    const beforeFailure = fingerprintTree(fixture);
    const failure = runBinary(fixture, ["check", "--rule", "forbid_fixture_token", "--json"]);
    assert.strictEqual(failure.status, 1);
    assert.strictEqual(failure.report.ok, false);
    assert.strictEqual(failure.report.rules[0]?.status, "fail");
    assert.strictEqual(fingerprintTree(fixture), beforeFailure);
  });

  it.each([
    "SIGINT",
    "SIGTERM",
  ] as const)("cancels the provider process group before preserving %s", async (signal) => {
    const signalKey = signal.toLowerCase();
    const fixture = path.join(tempRoot, `signal-cancellation-${signalKey}`);
    const stateRoot = path.join(tempRoot, `signal-cancellation-${signalKey}-state`);
    createGritFixture(fixture, false);
    mkdirSync(stateRoot, { recursive: true });
    installBlockingGritProvider(fixture);
    writeFileSync(path.join(fixture, "src", "example.ts"), "export const allowed = true;\n");

    const child = spawn(
      movedBinary,
      ["check", "--rule", "forbid_fixture_token", "--json", "--repo-root", fixture],
      {
        cwd: fixture,
        env: { ...process.env, HABITAT_STANDALONE_SIGNAL_STATE_ROOT: stateRoot },
        stdio: ["ignore", "pipe", "pipe"],
      }
    );
    const exited = observeChildExit(child);
    let providerPid: number | undefined;
    let descendantPid: number | undefined;
    let scopedCwd: string | undefined;

    try {
      await waitForPath(path.join(stateRoot, "provider.pid"));
      await waitForPath(path.join(stateRoot, "descendant.pid"));
      await waitForPath(path.join(stateRoot, "descendant.ready"));
      await waitForPath(path.join(stateRoot, "provider.cwd"));
      await waitForPath(path.join(stateRoot, "rayon.txt"));
      providerPid = readProcessId(path.join(stateRoot, "provider.pid"));
      descendantPid = readProcessId(path.join(stateRoot, "descendant.pid"));
      scopedCwd = readFileSync(path.join(stateRoot, "provider.cwd"), "utf8");
      assert.match(path.basename(scopedCwd), /^habitat-grit-diagnostic-[A-Za-z0-9_-]+$/u);
      assert.strictEqual(existsSync(scopedCwd), true);
      assert.strictEqual(readFileSync(path.join(stateRoot, "rayon.txt"), "utf8"), "2");
      assert.strictEqual(processIsAlive(providerPid), true);
      assert.strictEqual(processIsAlive(descendantPid), true);

      assert.strictEqual(child.kill(signal), true);
      const result = await withTimeout(exited, 10_000, "standalone binary signal exit");
      assert.strictEqual(result.code, null, `${result.stdout}\n${result.stderr}`);
      assert.strictEqual(result.signal, signal, `${result.stdout}\n${result.stderr}`);
      assert.strictEqual(processIsAlive(providerPid), false);
      assert.strictEqual(processIsAlive(descendantPid), false);
      assert.strictEqual(existsSync(scopedCwd), false);
    } finally {
      terminateFixtureProcess(providerPid);
      terminateFixtureProcess(descendantPid);
      removeScopedFixtureCwd(scopedCwd);
      const terminateChild = Match.value({
        exitCode: child.exitCode,
        signalCode: child.signalCode,
      }).pipe(
        Match.when({ exitCode: null, signalCode: null }, () => () => child.kill("SIGKILL")),
        Match.orElse(() => () => undefined)
      );
      terminateChild();
      await withTimeout(exited, 5_000, "standalone fixture cleanup").catch(() => undefined);
    }
  });

  it("reports a missing destination Grit provider as a refused execution", () => {
    const fixture = path.join(tempRoot, "grit-provider-missing");
    createGritFixture(fixture, false);
    writeFileSync(
      path.join(fixture, "src", "example.ts"),
      "export const allowed = true;\n",
      "utf8"
    );
    const before = fingerprintTree(fixture);
    const result = runBinary(fixture, ["check", "--rule", "forbid_fixture_token", "--json"]);
    assert.strictEqual(result.status, 1);
    assert.strictEqual(result.report.ok, false);
    assert.strictEqual(result.report.rules[0]?.disposition.kind, "execution-failed");
    assert.strictEqual(fingerprintTree(fixture), before);
  });

  it("refuses destination scripts without executing them", () => {
    const fixture = path.join(tempRoot, "script-refusal");
    const markerPath = path.join(fixture, "executed.marker");
    createScriptFixture(fixture);
    const before = fingerprintTree(fixture);
    const result = spawnSync(
      movedBinary,
      ["check", "--rule", "refuse_fixture_script", "--json", "--repo-root", fixture],
      { cwd: fixture, encoding: "utf8", env: process.env }
    );
    assert.strictEqual(result.signal, null, result.stderr);
    assert.strictEqual(result.status, 2);
    assert.strictEqual(result.stdout, "");
    assert.match(result.stderr, /Only Grit and Habitat structure rules/u);
    assert.strictEqual(existsSync(markerPath), false);
    assert.strictEqual(fingerprintTree(fixture), before);
  });

  it("stutters semantically across repeated converged checks", () => {
    const fixture = path.join(tempRoot, "repeat");
    createStructureFixture(fixture);
    const first = runBinary(fixture, ["check", "--rule", "fixture_service_topology", "--json"]);
    const second = runBinary(fixture, ["check", "--rule", "fixture_service_topology", "--json"]);
    assert.deepStrictEqual(semanticReport(first.report), semanticReport(second.report));
  });

  it("binds every release asset to source and checksum provenance", () => {
    const provenance = readProvenance();
    assert.strictEqual(provenance.source.commit, gitText(["rev-parse", "HEAD"]));
    assert.strictEqual(provenance.source.habitatTree, gitText(["rev-parse", "HEAD:tools/habitat"]));
    assert.strictEqual(
      provenance.source.workingTreeDirty,
      gitText(["status", "--porcelain"]).length > 0
    );
    assert.deepStrictEqual(provenance.bun, {
      name: standaloneCompilerManifest.name,
      version: standaloneCompilerManifest.version,
      revision: standaloneCompilerManifest.revision,
      upstream: standaloneCompilerManifest.upstream,
      distribution: standaloneCompilerManifest.distribution,
      asset: {
        id: standaloneCompilerManifest.asset.id,
        upstreamGithubAssetId: standaloneCompilerManifest.asset.upstreamGithubAssetId,
        distributionGithubAssetId: standaloneCompilerManifest.asset.distributionGithubAssetId,
        archiveFilename: standaloneCompilerManifest.asset.archiveFilename,
        archiveSha256: standaloneCompilerManifest.asset.archiveSha256,
        executableSha256: standaloneCompilerManifest.asset.executableSha256,
      },
    });
    const artifactPath = path.join(distDir, provenance.artifact.filename);
    assert.strictEqual(provenance.artifact.sha256, sha256(readFileSync(artifactPath)));
    assert.strictEqual(provenance.artifact.bytes, statSync(artifactPath).size);
    const expectedChecksums = [
      `${provenance.artifact.sha256}  ${provenance.artifact.filename}`,
      `${sha256(readFileSync(path.join(distDir, "provenance.json")))}  provenance.json`,
    ];
    const checksumLines = readFileSync(path.join(distDir, "SHA256SUMS"), "utf8")
      .trimEnd()
      .split("\n");
    assert.deepStrictEqual(checksumLines, expectedChecksums);
  });

  it("leaves the accepted release candidate untouched after moved-binary proof", () => {
    assert.deepStrictEqual(releaseHashes(), acceptedReleaseHashes);
  });
});

function hostArtifactPath(): string {
  const filename = `${process.platform}-${process.arch}`;
  if (filename === "darwin-arm64") return path.join(distDir, releaseFilenames[0]);
  throw new Error(`No Habitat standalone test artifact for ${filename}.`);
}

function runBinary(fixture: string, argv: readonly string[]) {
  const result = spawnSync(movedBinary, [...argv, "--repo-root", fixture], {
    cwd: fixture,
    encoding: "utf8",
    env: process.env,
  });
  assert.strictEqual(result.signal, null, result.stderr);
  assert.notStrictEqual(
    result.stdout.trim(),
    "",
    `Expected JSON output (exit ${result.status ?? "unknown"}): ${result.stderr}`
  );
  const decoded = Schema.decodeUnknownSync(JsonUnknownSchema)(result.stdout);
  return {
    status: result.status,
    stderr: result.stderr,
    report: Value.Parse(CheckReportSchema, decoded),
  };
}

function createStructureFixture(root: string): void {
  const packetRoot = path.join(root, ".habitat", "fixtures", "service-topology");
  mkdirSync(packetRoot, { recursive: true });
  mkdirSync(path.join(root, "service", "model"), { recursive: true });
  writeJson(path.join(root, ".habitat", "index.json"), {
    schemaVersion: 2,
    ownerRoots: { habitat: "service" },
  });
  writeJson(path.join(packetRoot, "rule.json"), {
    schemaVersion: 2,
    id: "fixture_service_topology",
    title: "Fixture Service Topology",
    placement: { niche: "fixture", blueprint: "service", category: "structure" },
    operation: { kind: "check" },
    ownerProject: "habitat",
    lane: "enforced",
    forbids: "unexpected service-root children",
    why: "The black-box fixture proves closed topology checks.",
    remediate: "Remove unexpected children.",
    message: "Fixture service topology failed.",
    pathCoverage: [{ kind: "exact-path", patterns: ["service"] }, { kind: "project-owner" }],
    supportFiles: { baseline: ".habitat/fixtures/service-topology/baseline.json" },
    runner: {
      name: "habitat",
      mode: "structure",
      files: { structure: ".habitat/fixtures/service-topology/structure.toml" },
    },
  });
  writeJson(path.join(packetRoot, "baseline.json"), []);
  writeFileSync(
    path.join(packetRoot, "structure.toml"),
    [
      "schemaVersion = 1",
      "",
      "[[scopes]]",
      'name = "service-root"',
      'root = "service"',
      'kind = "directory"',
      'mode = "closed"',
      'required = ["model"]',
      'allowed = ["model"]',
      "",
    ].join("\n"),
    "utf8"
  );
}

function createGritFixture(root: string, installProvider: boolean): void {
  const fixturePacket = path.join(root, ".habitat", "fixtures", "grit", "forbid_fixture_token");
  mkdirSync(fixturePacket, { recursive: true });
  mkdirSync(path.join(root, "src"), { recursive: true });
  writeJson(path.join(root, ".habitat", "index.json"), {
    schemaVersion: 2,
    ownerRoots: { habitat: "." },
  });
  writeJson(path.join(fixturePacket, "rule.json"), {
    schemaVersion: 2,
    id: "forbid_fixture_token",
    title: "Forbid Fixture Token",
    placement: { niche: "fixture", blueprint: "grit", category: "contract" },
    operation: { kind: "check" },
    ownerProject: "habitat",
    lane: "enforced",
    forbids: "the standalone acceptance fixture token",
    why: "The black-box fixture proves destination-owned Grit execution.",
    remediate: "Remove the fixture token.",
    message: "Standalone acceptance fixture token is forbidden.",
    pathCoverage: [{ kind: "exact-path", patterns: ["src/**/*.ts"] }],
    scanRoots: ["src"],
    supportFiles: { baseline: ".habitat/fixtures/grit/forbid_fixture_token/baseline.json" },
    runner: {
      name: "grit",
      files: { pattern: ".habitat/fixtures/grit/forbid_fixture_token/pattern.md" },
      patternName: "forbid_fixture_token",
      diagnosticAcquisition: { kind: "apply-dry-run" },
    },
  });
  writeJson(path.join(fixturePacket, "baseline.json"), []);
  writeFileSync(
    path.join(fixturePacket, "pattern.md"),
    [
      "---",
      "level: error",
      "---",
      "# Forbid Fixture Token",
      "",
      "```grit",
      "language js(typescript)",
      "",
      'contains r"\\bFORBIDDEN_HABITAT_FIXTURE\\b" where {',
      '  $filename <: r".*src/.*\\.ts$"',
      "}",
      "```",
      "",
    ].join("\n"),
    "utf8"
  );
  const setupProvider = Match.value(installProvider).pipe(
    Match.when(true, () => () => installGritProvider(root)),
    Match.orElse(() => () => undefined)
  );
  setupProvider();
}

function createScriptFixture(root: string): void {
  const fixturePacket = path.join(root, ".habitat", "fixtures", "script");
  mkdirSync(fixturePacket, { recursive: true });
  writeJson(path.join(root, ".habitat", "index.json"), {
    schemaVersion: 2,
    ownerRoots: { habitat: "." },
  });
  writeJson(path.join(fixturePacket, "rule.json"), {
    schemaVersion: 2,
    id: "refuse_fixture_script",
    title: "Refuse Fixture Script",
    placement: { niche: "fixture", blueprint: "script", category: "execution" },
    operation: { kind: "check" },
    ownerProject: "habitat",
    lane: "enforced",
    forbids: "standalone destination script execution",
    why: "Destination authority is data, not executable identity.",
    remediate: "Use Grit or a Habitat structure rule.",
    message: "Standalone destination scripts are refused.",
    pathCoverage: [{ kind: "exact-path", patterns: [".habitat/fixtures/script/check.mjs"] }],
    supportFiles: { baseline: ".habitat/fixtures/script/baseline.json" },
    runner: {
      name: "habitat",
      mode: "script",
      runtime: "node",
      files: { script: ".habitat/fixtures/script/check.mjs" },
    },
  });
  writeJson(path.join(fixturePacket, "baseline.json"), []);
  writeFileSync(
    path.join(fixturePacket, "check.mjs"),
    'import { writeFileSync } from "node:fs";\nwriteFileSync("executed.marker", "executed\\n");\n',
    "utf8"
  );
}

function installGritProvider(root: string): void {
  const providerParent = path.join(root, "node_modules", "@getgrit");
  mkdirSync(providerParent, { recursive: true });
  symlinkSync(
    realpathSync(path.join(repoRoot, "node_modules", "@getgrit", "cli")),
    path.join(providerParent, "cli"),
    "dir"
  );
}

function installBlockingGritProvider(root: string): void {
  const packageRoot = path.join(root, "node_modules", "@getgrit", "cli");
  const executable = path.join(packageRoot, "node_modules", ".bin_real", "grit");
  mkdirSync(path.dirname(executable), { recursive: true });
  writeJson(path.join(packageRoot, "package.json"), {
    name: "@getgrit/cli",
    version: "0.1.0-alpha.1743007075",
  });
  writeFileSync(
    executable,
    [
      "#!/usr/bin/env bun",
      'import { spawn } from "node:child_process";',
      'import { writeFileSync } from "node:fs";',
      'import path from "node:path";',
      "",
      'if (process.argv.slice(2).includes("--version")) {',
      '  process.stdout.write("grit 0.1.1\\n");',
      "  process.exit(0);",
      "}",
      "",
      "const stateRoot = process.env.HABITAT_STANDALONE_SIGNAL_STATE_ROOT;",
      'if (!stateRoot) throw new Error("Missing signal fixture state root.");',
      'process.on("SIGTERM", () => {});',
      'writeFileSync(path.join(stateRoot, "provider.pid"), String(process.pid));',
      'writeFileSync(path.join(stateRoot, "provider.cwd"), process.cwd());',
      'writeFileSync(path.join(stateRoot, "rayon.txt"), process.env.RAYON_NUM_THREADS ?? "");',
      "const descendant = spawn(process.execPath, [",
      '  "-e",',
      '  `import { writeFileSync } from "node:fs";',
      '  import path from "node:path";',
      "  const stateRoot = process.env.HABITAT_STANDALONE_SIGNAL_STATE_ROOT;",
      '  process.on("SIGTERM", () => {});',
      '  writeFileSync(path.join(stateRoot, "descendant.ready"), "");',
      "  setInterval(() => {}, 1_000);`,",
      '], { stdio: "ignore" });',
      'writeFileSync(path.join(stateRoot, "descendant.pid"), String(descendant.pid));',
      "setInterval(() => {}, 1_000);",
      "",
    ].join("\n"),
    "utf8"
  );
  chmodSync(executable, 0o755);
}

interface ObservedChildExit {
  readonly code: number | null;
  readonly signal: NodeJS.Signals | null;
  readonly stdout: string;
  readonly stderr: string;
}

function observeChildExit(child: ReturnType<typeof spawn>): Promise<ObservedChildExit> {
  let stdout = "";
  let stderr = "";
  child.stdout?.setEncoding("utf8");
  child.stderr?.setEncoding("utf8");
  child.stdout?.on("data", (chunk: string) => {
    stdout += chunk;
  });
  child.stderr?.on("data", (chunk: string) => {
    stderr += chunk;
  });
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve({ code, signal, stdout, stderr }));
  });
}

async function waitForPath(filePath: string): Promise<void> {
  const awaitPath = async () => {
    while (!existsSync(filePath)) await sleep(20);
  };
  await withTimeout(awaitPath(), 10_000, `fixture path ${filePath}`);
}

function readProcessId(filePath: string): number {
  const pid = Number.parseInt(readFileSync(filePath, "utf8"), 10);
  assert.ok(Number.isSafeInteger(pid) && pid > 0, `Invalid fixture process ID: ${pid}`);
  return pid;
}

function processIsAlive(pid: number): boolean {
  return spawnSync("kill", ["-0", String(pid)], { stdio: "ignore" }).status === 0;
}

function removeScopedFixtureCwd(scopedCwd: string | undefined): void {
  const remove = Match.value(scopedCwd).pipe(
    Match.when(
      (candidate): candidate is string =>
        candidate !== undefined &&
        /^habitat-grit-diagnostic-[A-Za-z0-9_-]+$/u.test(path.basename(candidate)),
      (candidate) => () => rmSync(candidate, { recursive: true, force: true })
    ),
    Match.orElse(() => () => undefined)
  );
  remove();
}

function terminateFixtureProcess(pid: number | undefined): void {
  if (pid === undefined || !processIsAlive(pid)) return;
  process.kill(pid, "SIGKILL");
}

async function withTimeout<A>(promise: Promise<A>, timeoutMs: number, label: string): Promise<A> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const expired = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error(`Timed out waiting for ${label}.`)), timeoutMs);
  });
  try {
    return await Promise.race([promise, expired]);
  } finally {
    clearTimeout(timeout);
  }
}

function semanticReport(report: CheckReport) {
  return {
    schemaVersion: report.schemaVersion,
    command: report.command,
    ok: report.ok,
    rules: report.rules.map((rule) => ({
      ruleId: rule.ruleId,
      runner: rule.runner,
      lane: rule.lane,
      status: rule.status,
      locked: rule.locked,
      disposition: rule.disposition,
      diagnostics: rule.diagnostics,
      message: rule.message,
      remediate: rule.remediate,
    })),
  };
}

function releaseHashes(): Record<string, string> {
  return Object.fromEntries(
    releaseFilenames.map((filename) => [
      filename,
      sha256(readFileSync(path.join(distDir, filename))),
    ])
  );
}

function readProvenance(): StandaloneProvenance {
  const decoded = Schema.decodeUnknownSync(JsonUnknownSchema)(
    readFileSync(path.join(distDir, "provenance.json"), "utf8")
  );
  return Value.Parse(StandaloneProvenanceSchema, decoded);
}

function gitText(argv: readonly string[]): string {
  const result = spawnSync("git", [...argv], { cwd: repoRoot, encoding: "utf8", env: process.env });
  assert.strictEqual(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function fingerprintTree(root: string): string {
  const lines: string[] = [];
  const visit = (current: string) => {
    for (const name of readdirSync(current).sort()) {
      const absolute = path.join(current, name);
      const relative = path.relative(root, absolute).split(path.sep).join("/");
      const stat = lstatSync(absolute);
      const record = Match.value({
        symbolicLink: stat.isSymbolicLink(),
        directory: stat.isDirectory(),
        file: stat.isFile(),
      }).pipe(
        Match.when({ symbolicLink: true }, () => () => {
          lines.push(`link ${relative} ${readlinkSync(absolute)}`);
        }),
        Match.when({ directory: true }, () => () => {
          lines.push(`dir ${relative}`);
          visit(absolute);
        }),
        Match.when({ file: true }, () => () => {
          lines.push(`file ${relative} ${stat.mode & 0o777} ${sha256(readFileSync(absolute))}`);
        }),
        Match.orElse(() => () => undefined)
      );
      record();
    }
  };
  visit(root);
  return sha256(Buffer.from(lines.join("\n")));
}

function writeJson(filePath: string, value: unknown): void {
  writeFileSync(filePath, `${Schema.encodeSync(JsonUnknownSchema)(value)}\n`, "utf8");
}

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function assertSafeTempRoot(candidate: string): void {
  const resolved = path.resolve(candidate);
  const temp = realpathSync(tmpdir());
  assert.strictEqual(path.dirname(resolved), temp);
  assert.match(path.basename(resolved), /^habitat-sdk-blackbox-[A-Za-z0-9_-]+$/u);
}
