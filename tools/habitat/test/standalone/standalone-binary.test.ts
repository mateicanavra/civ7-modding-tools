import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  copyFileSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { type CheckReport, CheckReportSchema } from "@habitat/cli/service/model/check/index";
import { Match, Schema } from "effect";
import { Value } from "typebox/value";
import { afterAll, beforeAll, describe, it } from "vitest";

const repoRoot = path.resolve(fileURLToPath(new URL("../../../..", import.meta.url)));
const distDir = path.join(repoRoot, "tools", "habitat", "dist", "standalone");
const tempRoot = mkdtempSync(path.join(realpathSync(tmpdir()), "habitat-sdk-blackbox-"));
const movedBinary = path.join(tempRoot, "bin", "habitat-sdk");
const JsonUnknownSchema = Schema.parseJson(Schema.Unknown);

describe.sequential("standalone Habitat binary", () => {
  beforeAll(() => {
    mkdirSync(path.dirname(movedBinary), { recursive: true });
    copyFileSync(hostArtifactPath(), movedBinary);
    chmodSync(movedBinary, 0o755);
  });

  afterAll(() => {
    assertSafeTempRoot(tempRoot);
    rmSync(tempRoot, { recursive: true, force: true });
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

  it("stutters semantically across repeated converged checks", () => {
    const fixture = path.join(tempRoot, "repeat");
    createStructureFixture(fixture);
    const first = runBinary(fixture, ["check", "--rule", "fixture_service_topology", "--json"]);
    const second = runBinary(fixture, ["check", "--rule", "fixture_service_topology", "--json"]);
    assert.deepStrictEqual(semanticReport(first.report), semanticReport(second.report));
  });

  it("rebuilds both fixed targets byte-identically", () => {
    const before = artifactHashes();
    const rebuild = spawnSync("bun", ["run", "--cwd", "tools/habitat", "build:standalone"], {
      cwd: repoRoot,
      encoding: "utf8",
      env: process.env,
    });
    assert.strictEqual(rebuild.status, 0, `${rebuild.stdout}\n${rebuild.stderr}`);
    assert.deepStrictEqual(artifactHashes(), before);
  });
});

function hostArtifactPath(): string {
  const filename = `${process.platform}-${process.arch}`;
  if (filename === "darwin-arm64") return path.join(distDir, "habitat-sdk-darwin-arm64");
  if (filename === "linux-x64") return path.join(distDir, "habitat-sdk-linux-x64-baseline");
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

function installGritProvider(root: string): void {
  const providerParent = path.join(root, "node_modules", "@getgrit");
  mkdirSync(providerParent, { recursive: true });
  symlinkSync(
    realpathSync(path.join(repoRoot, "node_modules", "@getgrit", "cli")),
    path.join(providerParent, "cli"),
    "dir"
  );
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

function artifactHashes(): Record<string, string> {
  return Object.fromEntries(
    ["habitat-sdk-darwin-arm64", "habitat-sdk-linux-x64-baseline"].map((filename) => [
      filename,
      sha256(readFileSync(path.join(distDir, filename))),
    ])
  );
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
