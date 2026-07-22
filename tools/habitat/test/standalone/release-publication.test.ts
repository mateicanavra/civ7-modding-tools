import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, it } from "vitest";

const repoRoot = path.resolve(fileURLToPath(new URL("../../../..", import.meta.url)));
const publisher = path.join(
  repoRoot,
  "tools",
  "habitat",
  "scripts",
  "standalone",
  "publish-release.sh"
);
const workflow = path.join(repoRoot, ".github", "workflows", "habitat-standalone-release.yml");
const habitatPackage = path.join(repoRoot, "tools", "habitat", "package.json");
const habitatProject = path.join(repoRoot, "tools", "habitat", "project.json");
const movedBinaryProof = path.join(
  repoRoot,
  "tools",
  "habitat",
  "test",
  "standalone",
  "standalone-binary.test.ts"
);
const tag = "habitat-sdk-v0.1.2";
const repository = "mateicanavra/civ7-modding-tools";
const expectedSourceCommit = "1111111111111111111111111111111111111111";

interface ReleaseAssetState {
  readonly name: string;
  readonly digest: string;
  readonly size: number;
}

interface ReleaseState {
  readonly release?: {
    readonly tag_name: string;
    readonly draft: boolean;
    readonly immutable: boolean;
    readonly assets: readonly ReleaseAssetState[];
  };
  readonly releases?: readonly {
    readonly tag_name: string;
    readonly draft: boolean;
    readonly immutable: boolean;
    readonly assets: readonly ReleaseAssetState[];
  }[];
  readonly remoteCommitLookupCount?: number;
}

describe("standalone immutable release publication", () => {
  let root: string;
  let assets: string;
  let remote: string;
  let statePath: string;
  let logPath: string;
  let ghPath: string;
  let gitPath: string;

  beforeEach(() => {
    root = mkdtempSync(path.join(tmpdir(), "habitat-release-publication-"));
    assets = path.join(root, "assets");
    remote = path.join(root, "remote");
    statePath = path.join(root, "state.json");
    logPath = path.join(root, "calls.jsonl");
    ghPath = path.join(root, "gh");
    gitPath = path.join(root, "git");
    mkdirSync(assets, { recursive: true });
    mkdirSync(remote, { recursive: true });
    createCandidate(assets);
    installFakeGitHubCli(ghPath);
    installFakeGitCli(gitPath);
    writeState({});
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it("creates a draft, attaches proven assets, then publishes and proves immutability", () => {
    const result = runPublisher();
    assert.strictEqual(result.status, 0, `${result.stdout}\n${result.stderr}`);
    assert.deepStrictEqual(readCalls(), [
      ...sourceBindingCalls(),
      "api releases",
      "release create",
      "release upload",
      "api releases",
      ...sourceBindingCalls(),
      "release edit",
      "api releases",
      "release download",
    ]);
    assert.deepStrictEqual(readState().release, publishedRelease(assets));
  });

  it("refuses a local candidate whose inventory is not exact before calling GitHub", () => {
    writeFileSync(path.join(assets, "unexpected"), "not a release asset\n", "utf8");
    const result = runPublisher();
    assert.strictEqual(result.status, 1, `${result.stdout}\n${result.stderr}`);
    assert.deepStrictEqual(readCalls(), []);
    assert.match(result.stderr, /does not contain the exact release asset inventory/u);
  });

  it("treats an existing exact immutable release as verification-only", () => {
    installRemoteCandidate();
    writeState({ release: publishedRelease(assets) });
    const result = runPublisher();
    assert.strictEqual(result.status, 0, `${result.stdout}\n${result.stderr}`);
    assert.deepStrictEqual(readCalls(), [
      ...sourceBindingCalls(),
      "api releases",
      "release download",
      ...sourceBindingCalls(),
    ]);
    assert.match(result.stdout, /Verified existing immutable release/u);
  });

  it("fails closed rather than mutating a draft left by an interrupted attempt", () => {
    writeState({
      release: { ...publishedRelease(assets), draft: true, immutable: false, assets: [] },
    });
    const result = runPublisher();
    assert.strictEqual(result.status, 1, `${result.stdout}\n${result.stderr}`);
    assert.deepStrictEqual(readCalls(), [...sourceBindingCalls(), "api releases"]);
    assert.match(result.stderr, /is not published/u);
  });

  it("fails closed rather than mutating a published non-immutable release", () => {
    writeState({ release: { ...publishedRelease(assets), immutable: false } });
    const result = runPublisher();
    assert.strictEqual(result.status, 1, `${result.stdout}\n${result.stderr}`);
    assert.deepStrictEqual(readCalls(), [...sourceBindingCalls(), "api releases"]);
    assert.match(result.stderr, /published but not immutable/u);
  });

  it("refuses an immutable release whose inventory is not exact", () => {
    writeState({
      release: {
        ...publishedRelease(assets),
        assets: publishedRelease(assets).assets.slice(1),
      },
    });
    const result = runPublisher();
    assert.strictEqual(result.status, 1, `${result.stdout}\n${result.stderr}`);
    assert.deepStrictEqual(readCalls(), [...sourceBindingCalls(), "api releases"]);
    assert.match(result.stderr, /does not contain the exact proven asset inventory/u);
  });

  it("refuses duplicate release records for one tag", () => {
    writeState({ releases: [publishedRelease(assets), publishedRelease(assets)] });
    const result = runPublisher();
    assert.strictEqual(result.status, 1, `${result.stdout}\n${result.stderr}`);
    assert.deepStrictEqual(readCalls(), [...sourceBindingCalls(), "api releases"]);
    assert.match(result.stderr, /more than one release/u);
  });

  it("refuses remote bytes that differ from the local proven candidate", () => {
    installRemoteCandidate();
    writeFileSync(path.join(remote, "habitat-sdk-darwin-arm64"), "different bytes\n", "utf8");
    writeState({ release: publishedRelease(assets) });
    const result = runPublisher();
    assert.strictEqual(result.status, 1, `${result.stdout}\n${result.stderr}`);
    assert.deepStrictEqual(readCalls(), [
      ...sourceBindingCalls(),
      "api releases",
      "release download",
    ]);
  });

  it("fails after publication when GitHub does not make the release immutable", () => {
    const result = runPublisher({ FAKE_GH_PUBLISH_IMMUTABLE: "0" });
    assert.strictEqual(result.status, 1, `${result.stdout}\n${result.stderr}`);
    assert.deepStrictEqual(readCalls(), [
      ...sourceBindingCalls(),
      "api releases",
      "release create",
      "release upload",
      "api releases",
      ...sourceBindingCalls(),
      "release edit",
      "api releases",
    ]);
    assert.match(result.stderr, /published but not immutable/u);
  });

  it("keeps the release draft when uploaded asset metadata differs from the candidate", () => {
    const result = runPublisher({ FAKE_GH_CORRUPT_UPLOAD: "1" });
    assert.strictEqual(result.status, 1, `${result.stdout}\n${result.stderr}`);
    assert.deepStrictEqual(readCalls(), [
      ...sourceBindingCalls(),
      "api releases",
      "release create",
      "release upload",
      "api releases",
    ]);
    assert.strictEqual(readState().release?.draft, true);
    assert.strictEqual(readState().release?.immutable, false);
    assert.match(result.stderr, /asset digests or sizes do not match/u);
  });

  it("keeps the release draft when the remote tag moves before publication", () => {
    const result = runPublisher({
      FAKE_GH_REMOTE_COMMIT_AFTER_FIRST: "2222222222222222222222222222222222222222",
    });
    assert.strictEqual(result.status, 1, `${result.stdout}\n${result.stderr}`);
    assert.deepStrictEqual(readCalls(), [
      ...sourceBindingCalls(),
      "api releases",
      "release create",
      "release upload",
      "api releases",
      ...sourceBindingCalls(),
    ]);
    assert.strictEqual(readState().release?.draft, true);
    assert.strictEqual(readState().release?.immutable, false);
    assert.match(result.stderr, /source binding does not match/u);
  });

  it("bounds GitHub commands without requiring GNU timeout", () => {
    const source = readFileSync(publisher, "utf8");
    assert.doesNotMatch(source, /^\s*(?:command\s+)?timeout(?:\s|$)/mu);

    const startedAt = Date.now();
    const result = runPublisher({
      FAKE_GH_HANG_ON_REMOTE_COMMIT: "1",
      HABITAT_RELEASE_COMMAND_TIMEOUT_SECONDS: "1",
    });
    const elapsedMs = Date.now() - startedAt;

    assert.strictEqual(result.status, 124, `${result.stdout}\n${result.stderr}`);
    assert.ok(elapsedMs >= 500, `Deadline fired unexpectedly early after ${elapsedMs}ms.`);
    assert.ok(elapsedMs < 5_000, `GitHub command was not bounded: ${elapsedMs}ms.`);
    assert.deepStrictEqual(readCalls(), sourceBindingCalls());
    assert.match(result.stderr, /GitHub CLI command exceeded its 1-second deadline/u);
  });

  it("builds one candidate before serial distribution, publication, and moved proofs", () => {
    const packageManifest = JSON.parse(readFileSync(habitatPackage, "utf8")) as {
      readonly scripts: Readonly<Record<string, string>>;
    };
    const project = JSON.parse(readFileSync(habitatProject, "utf8")) as {
      readonly targets: Readonly<
        Record<string, { readonly command?: string; readonly dependsOn?: readonly string[] }>
      >;
    };
    assert.strictEqual(
      project.targets["release:standalone"]?.command,
      "bun run release:standalone:candidate"
    );
    assert.deepStrictEqual(project.targets["release:standalone"]?.dependsOn, [
      "check:hygiene",
      "lint:standalone",
      "typecheck",
      "test:standalone:behavior",
    ]);
    assert.strictEqual(
      packageManifest.scripts["release:standalone:candidate"],
      "bun run release:standalone:artifacts && bun run test:standalone:release && bun run test:standalone"
    );
    assert.match(
      packageManifest.scripts["test:standalone:release"] ?? "",
      /--no-file-parallelism/u
    );
    assert.doesNotMatch(readFileSync(movedBinaryProof, "utf8"), /build:standalone/u);

    const source = readFileSync(workflow, "utf8");
    assert.match(
      source,
      /nx run habitat:release:standalone[\s\S]*uses: actions\/upload-artifact@v4/u
    );
  });

  it("keeps publication behind the native Darwin bridge proof", () => {
    const source = readFileSync(workflow, "utf8");
    assert.match(
      source,
      /build-and-prove-darwin-candidate:[\s\S]*runs-on: macos-14[\s\S]*nx run habitat:release:standalone/u
    );
    assert.match(source, /publish-release-assets:[\s\S]*needs: build-and-prove-darwin-candidate/u);
    assert.match(source, /uses: actions\/checkout@v4/u);
    assert.match(source, /EXPECTED_SOURCE_COMMIT: \$\{\{ github\.sha \}\}/u);
    assert.match(source, /run: tools\/habitat\/scripts\/standalone\/publish-release\.sh release/u);
    assert.doesNotMatch(source, /gh release create/u);
    assert.doesNotMatch(source, /matrix:|habitat-sdk-probe-|linux-x64/u);
  });

  function runPublisher(environment: Readonly<Record<string, string>> = {}) {
    return spawnSync(publisher, [assets], {
      cwd: repoRoot,
      encoding: "utf8",
      env: {
        ...process.env,
        FAKE_GH_LOG: logPath,
        FAKE_GH_ASSET_DIR: assets,
        FAKE_GH_EXPECTED_COMMIT: expectedSourceCommit,
        FAKE_GH_EXPECTED_REPOSITORY: repository,
        FAKE_GH_EXPECTED_TAG: tag,
        FAKE_GH_REMOTE: remote,
        FAKE_GH_STATE: statePath,
        FAKE_GIT_LOG: logPath,
        FAKE_GIT_EXPECTED_COMMIT: expectedSourceCommit,
        FAKE_GIT_EXPECTED_TAG: tag,
        GH_BIN: ghPath,
        GIT_BIN: gitPath,
        GH_REPO: repository,
        GITHUB_REF_NAME: tag,
        EXPECTED_SOURCE_COMMIT: expectedSourceCommit,
        RUNNER_TEMP: root,
        ...environment,
      },
    });
  }

  function readCalls(): string[] {
    if (!existsSync(logPath)) return [];
    const source = readFileSync(logPath, "utf8").trim();
    if (source.length === 0) return [];
    return source.split("\n").map((line) => {
      const argv = JSON.parse(line) as string[];
      if (argv[0] === "git") return `git ${argv.slice(1).join(" ")}`;
      if (argv[0] === "api") {
        return argv.some((candidate) => candidate.includes("/commits/"))
          ? "api commit"
          : "api releases";
      }
      return argv[0] === "release" ? `${argv[0]} ${argv[1]}` : (argv[0] ?? "");
    });
  }

  function readState(): ReleaseState {
    return JSON.parse(readFileSync(statePath, "utf8")) as ReleaseState;
  }

  function writeState(state: ReleaseState): void {
    writeFileSync(statePath, `${JSON.stringify(state)}\n`, "utf8");
  }

  function installRemoteCandidate(): void {
    for (const name of releaseAssetNames())
      copyFileSync(path.join(assets, name), path.join(remote, name));
  }
});

function sourceBindingCalls(): readonly string[] {
  return ["git rev-parse HEAD^{commit}", `git rev-parse ${tag}^{commit}`, "api commit"];
}

function publishedRelease(directory: string) {
  return {
    tag_name: tag,
    draft: false,
    immutable: true,
    assets: releaseAssetNames().map((name) => assetState(directory, name)),
  } as const;
}

function releaseAssetNames(): readonly string[] {
  return ["habitat-sdk-darwin-arm64", "provenance.json", "SHA256SUMS"];
}

function createCandidate(directory: string): void {
  const files = {
    "habitat-sdk-darwin-arm64": "darwin candidate\n",
    "provenance.json": `${JSON.stringify({
      schemaVersion: 2,
      source: { commit: expectedSourceCommit },
    })}\n`,
  } as const;
  for (const [name, source] of Object.entries(files)) {
    writeFileSync(path.join(directory, name), source, "utf8");
  }
  const checksums = Object.keys(files).map(
    (name) => `${sha256(readFileSync(path.join(directory, name)))}  ${name}`
  );
  writeFileSync(path.join(directory, "SHA256SUMS"), `${checksums.join("\n")}\n`, "utf8");
}

function assetState(directory: string, name: string): ReleaseAssetState {
  const bytes = readFileSync(path.join(directory, name));
  return {
    name,
    digest: `sha256:${sha256(bytes)}`,
    size: bytes.byteLength,
  };
}

function installFakeGitCli(filePath: string): void {
  writeFileSync(
    filePath,
    `#!/usr/bin/env bun
import { appendFileSync } from "node:fs";

const argv = process.argv.slice(2);
const commit = process.env.FAKE_GIT_EXPECTED_COMMIT;
const tag = process.env.FAKE_GIT_EXPECTED_TAG;
const log = process.env.FAKE_GIT_LOG;
if (!commit || !tag || !log) process.exit(90);
appendFileSync(log, JSON.stringify(["git", ...argv]) + "\\n");
const expected = [
  ["rev-parse", "HEAD^{commit}"],
  ["rev-parse", tag + "^{commit}"],
];
if (!expected.some((candidate) => JSON.stringify(candidate) === JSON.stringify(argv))) {
  process.exit(91);
}
process.stdout.write(commit + "\\n");
`,
    "utf8"
  );
  chmodSync(filePath, 0o755);
}

function installFakeGitHubCli(filePath: string): void {
  writeFileSync(
    filePath,
    `#!/usr/bin/env bun
import { createHash } from "node:crypto";
import { appendFileSync, copyFileSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const argv = process.argv.slice(2);
const assetDir = process.env.FAKE_GH_ASSET_DIR;
const commit = process.env.FAKE_GH_EXPECTED_COMMIT;
const repository = process.env.FAKE_GH_EXPECTED_REPOSITORY;
const tag = process.env.FAKE_GH_EXPECTED_TAG;
const statePath = process.env.FAKE_GH_STATE;
const remote = process.env.FAKE_GH_REMOTE;
const log = process.env.FAKE_GH_LOG;
if (!assetDir || !commit || !repository || !tag || !statePath || !remote || !log) process.exit(90);
appendFileSync(log, JSON.stringify(argv) + "\\n");
if (
  process.env.FAKE_GH_HANG_ON_REMOTE_COMMIT === "1" &&
  argv[0] === "api" &&
  argv.some((candidate) => candidate.includes("/commits/"))
) {
  setInterval(() => {}, 1_000);
  await new Promise(() => {});
}
const readState = () => JSON.parse(readFileSync(statePath, "utf8"));
const writeState = (state) => writeFileSync(statePath, JSON.stringify(state) + "\\n");
const same = (left, right) => JSON.stringify(left) === JSON.stringify(right);
const digest = (bytes) => "sha256:" + createHash("sha256").update(bytes).digest("hex");
const assetNames = [
  "habitat-sdk-darwin-arm64",
  "provenance.json",
  "SHA256SUMS",
];

if (argv[0] === "api") {
  const state = readState();
  if (same(argv, ["api", "--paginate", "--slurp", "repos/" + repository + "/releases?per_page=100"])) {
    process.stdout.write(JSON.stringify([state.releases ?? (state.release ? [state.release] : [])]));
    process.exit(0);
  }
  if (same(argv, ["api", "repos/" + repository + "/commits/" + tag, "--jq", ".sha"])) {
    state.remoteCommitLookupCount = (state.remoteCommitLookupCount ?? 0) + 1;
    writeState(state);
    const moved = process.env.FAKE_GH_REMOTE_COMMIT_AFTER_FIRST;
    process.stdout.write((moved && state.remoteCommitLookupCount > 1 ? moved : commit) + "\\n");
    process.exit(0);
  }
  process.exit(91);
}

if (argv[0] === "release" && argv[1] === "create") {
  const expected = [
    "release", "create", tag,
    "--repo", repository,
    "--draft",
    "--verify-tag",
    "--title", "Habitat SDK standalone check " + tag,
    "--notes", "Pinned check-only Habitat SDK assets. Exact source, compiler distribution, and artifact identities are recorded in provenance.json and SHA256SUMS.",
  ];
  if (!same(argv, expected)) process.exit(92);
  const state = readState();
  if (state.release || state.releases?.length) process.exit(2);
  state.release = { tag_name: tag, draft: true, immutable: false, assets: [] };
  writeState(state);
  process.exit(0);
}

if (argv[0] === "release" && argv[1] === "upload") {
  const sourcePaths = assetNames.map((name) => path.join(assetDir, name));
  const expected = ["release", "upload", tag, "--repo", repository, ...sourcePaths];
  if (!same(argv, expected)) process.exit(93);
  const state = readState();
  if (!state.release?.draft || state.release.immutable) process.exit(3);
  mkdirSync(remote, { recursive: true });
  for (const source of sourcePaths) copyFileSync(source, path.join(remote, path.basename(source)));
  state.release.assets = sourcePaths.map((source, index) => {
    const bytes = readFileSync(source);
    return {
      name: path.basename(source),
      digest: process.env.FAKE_GH_CORRUPT_UPLOAD === "1" && index === 0
        ? "sha256:" + "0".repeat(64)
        : digest(bytes),
      size: statSync(source).size,
    };
  });
  writeState(state);
  process.exit(0);
}

if (argv[0] === "release" && argv[1] === "edit") {
  if (!same(argv, ["release", "edit", tag, "--repo", repository, "--draft=false"])) {
    process.exit(94);
  }
  const state = readState();
  if (!state.release?.draft || state.release.assets.length !== 3) process.exit(3);
  state.release.draft = false;
  state.release.immutable = process.env.FAKE_GH_PUBLISH_IMMUTABLE !== "0";
  writeState(state);
  process.exit(0);
}

if (argv[0] === "release" && argv[1] === "download") {
  if (argv.length !== 7 || !same(argv.slice(0, 6), ["release", "download", tag, "--repo", repository, "--dir"])) {
    process.exit(95);
  }
  const destination = argv[argv.indexOf("--dir") + 1];
  if (!destination) process.exit(95);
  mkdirSync(destination, { recursive: true });
  for (const asset of readState().release.assets) {
    copyFileSync(path.join(remote, asset.name), path.join(destination, asset.name));
  }
  process.exit(0);
}

process.exit(91);
`,
    "utf8"
  );
  chmodSync(filePath, 0o755);
}

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}
