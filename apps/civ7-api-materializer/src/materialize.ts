import { execFile as execFileCallback } from "node:child_process";
import { randomUUID } from "node:crypto";
import {
  copyFile,
  lstat,
  mkdtemp,
  open,
  readFile,
  realpath,
  rename,
  rm,
  writeFile,
} from "node:fs/promises";
import { homedir } from "node:os";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { promisify } from "node:util";
import type { SourceIdentity } from "./model.js";
import {
  apiProjectionTreesMatch,
  assertGeneratedApiReplacementSettled,
  generatedApiBackupRoot,
  inspectApiProjection,
  recoverGeneratedApiReplacement,
  type StagedApiProjection,
  stageApiProjection,
} from "./projection.js";
import {
  assertSnapshotReceipt,
  type BuildSnapshotResult,
  buildSnapshot,
  fingerprintSourceSnapshot,
  inspectSnapshot,
} from "./snapshot.js";

const CIV7_BUNDLE_IDENTIFIER = "com.2k.civ7";
const CIV7_STEAM_APP_ID = "1295660";
const STEAM_FULLY_INSTALLED_STATE = "4";
const STEAM_UPDATE_SUCCEEDED = "0";
const ZERO_BYTES = "0";
const DEFAULT_STEAM_MANIFEST = join(
  homedir(),
  `Library/Application Support/Steam/steamapps/appmanifest_${CIV7_STEAM_APP_ID}.acf`
);
const execFile = promisify(execFileCallback);

export interface MaterializeOptions {
  readonly destinationRoot: string;
  readonly apiDestinationRoot: string;
  readonly steamManifestPath: string;
  readonly checkOnly: boolean;
}

export interface MaterializeResult {
  readonly snapshot: BuildSnapshotResult;
  readonly api: StagedApiProjection;
}

interface IdentifiedSource {
  readonly root: string;
  readonly identity: SourceIdentity;
}

function parsePlistValue(json: unknown, key: string): string {
  if (typeof json !== "object" || json === null) throw new Error("Invalid Civ7 Info.plist JSON");
  const value = (json as Record<string, unknown>)[key];
  if (typeof value !== "string") throw new Error(`Civ7 Info.plist is missing ${key}`);
  return value;
}

async function readApplicationIdentity(plistPath: string): Promise<SourceIdentity["application"]> {
  const { stdout } = await execFile("plutil", ["-convert", "json", "-o", "-", plistPath]);
  const plist = JSON.parse(stdout) as unknown;
  return {
    bundleIdentifier: parsePlistValue(plist, "CFBundleIdentifier"),
    version: parsePlistValue(plist, "CFBundleShortVersionString"),
    bundleVersion: parsePlistValue(plist, "CFBundleVersion"),
    longVersion: parsePlistValue(plist, "CFBundleLongVersionString"),
  };
}

interface VdfObject {
  [key: string]: string | VdfObject;
}

function parseVdf(content: string): VdfObject {
  let cursor = 0;

  const skipWhitespace = (): void => {
    while (/\s/.test(content[cursor] ?? "")) cursor += 1;
  };
  const quoted = (): string => {
    skipWhitespace();
    if (content[cursor] !== '"') throw new Error(`Expected VDF string at offset ${cursor}`);
    cursor += 1;
    let value = "";
    while (cursor < content.length) {
      const character = content[cursor];
      cursor += 1;
      if (character === '"') return value;
      if (character === "\\") {
        const escaped = content[cursor];
        if (escaped === undefined) break;
        cursor += 1;
        value += escaped;
      } else {
        value += character;
      }
    }
    throw new Error("Unterminated VDF string");
  };
  const object = (nested: boolean): VdfObject => {
    const result: VdfObject = {};
    while (cursor < content.length) {
      skipWhitespace();
      if (nested && content[cursor] === "}") {
        cursor += 1;
        return result;
      }
      if (cursor >= content.length) break;
      const key = quoted();
      skipWhitespace();
      if (content[cursor] === "{") {
        cursor += 1;
        result[key] = object(true);
      } else {
        result[key] = quoted();
      }
    }
    if (nested) throw new Error("Unterminated VDF object");
    return result;
  };

  return object(false);
}

function vdfObject(value: string | VdfObject | undefined, key: string): VdfObject {
  if (typeof value !== "object" || value === null) {
    throw new Error(`Steam manifest is missing object ${key}`);
  }
  return value;
}

function vdfString(value: string | VdfObject | undefined, key: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Steam manifest is missing ${key}`);
  }
  return value;
}

async function readSteamIdentity(path: string): Promise<SourceIdentity["steam"]> {
  const manifest = parseVdf(await readFile(path, "utf8"));
  const appState = vdfObject(manifest.AppState, "AppState");
  const installedDepots = vdfObject(appState.InstalledDepots, "InstalledDepots");
  const depots = Object.entries(installedDepots)
    .map(([id, value]) => ({
      id,
      manifest: vdfString(vdfObject(value, `InstalledDepots.${id}`).manifest, "manifest"),
    }))
    .sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
  if (depots.length === 0) throw new Error("Steam manifest has no installed depot identity");
  const identity: SourceIdentity["steam"] = {
    appId: vdfString(appState.appid, "appid"),
    buildId: vdfString(appState.buildid, "buildid"),
    installDirectory: vdfString(appState.installdir, "installdir"),
    lastUpdated: vdfString(appState.LastUpdated, "LastUpdated"),
    depots,
    state: {
      flags: vdfString(appState.StateFlags, "StateFlags"),
      updateResult: vdfString(appState.UpdateResult, "UpdateResult"),
      targetBuildId: vdfString(appState.TargetBuildID, "TargetBuildID"),
      download: {
        expectedBytes: vdfString(appState.BytesToDownload, "BytesToDownload"),
        completedBytes: vdfString(appState.BytesDownloaded, "BytesDownloaded"),
      },
      staging: {
        expectedBytes: vdfString(appState.BytesToStage, "BytesToStage"),
        completedBytes: vdfString(appState.BytesStaged, "BytesStaged"),
        remainingBytes: vdfString(appState.StagingSize, "StagingSize"),
      },
    },
  };
  const state = identity.state;
  if (
    state.flags !== STEAM_FULLY_INSTALLED_STATE ||
    state.updateResult !== STEAM_UPDATE_SUCCEEDED ||
    state.targetBuildId !== identity.buildId ||
    state.download.completedBytes !== state.download.expectedBytes ||
    state.staging.completedBytes !== state.staging.expectedBytes ||
    state.staging.remainingBytes !== ZERO_BYTES
  ) {
    throw new Error(
      "Steam reports that the Civ7 installation is not fully installed and quiescent"
    );
  }
  return identity;
}

async function identifySource(options: MaterializeOptions): Promise<IdentifiedSource> {
  const steam = await readSteamIdentity(options.steamManifestPath);
  if (steam.appId !== CIV7_STEAM_APP_ID) {
    throw new Error(`Refusing non-Civ7 Steam application identity: ${steam.appId}`);
  }
  const root = resolve(
    dirname(options.steamManifestPath),
    "common",
    steam.installDirectory,
    "CivilizationVII.app/Contents/Resources"
  );
  const application = await readApplicationIdentity(resolve(root, "../Info.plist"));
  if (application.bundleIdentifier !== CIV7_BUNDLE_IDENTIFIER) {
    throw new Error(`Refusing non-Civ7 application identity: ${application.bundleIdentifier}`);
  }
  return { root: await realpath(root), identity: { application, steam } };
}

function sameIdentity(left: SourceIdentity, right: SourceIdentity): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function snapshotFilesMatch(expected: BuildSnapshotResult, actual: BuildSnapshotResult): boolean {
  return (
    expected.files.every((file, index) => {
      const other = actual.files[index];
      return other?.path === file.path && other.size === file.size && other.sha256 === file.sha256;
    }) && expected.files.length === actual.files.length
  );
}

function snapshotsMatch(expected: BuildSnapshotResult, actual: BuildSnapshotResult): boolean {
  return expected.receiptText === actual.receiptText && snapshotFilesMatch(expected, actual);
}

function errorCode(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as { code: unknown }).code)
    : undefined;
}

async function missingAsNull<T>(operation: () => Promise<T>): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    if (errorCode(error) === "ENOENT") return null;
    throw error;
  }
}

async function pathExists(path: string): Promise<boolean> {
  return (await missingAsNull(() => lstat(path))) !== null;
}

async function git(destinationRoot: string, args: readonly string[]): Promise<string> {
  try {
    const { stdout } = await execFile("git", ["-C", destinationRoot, ...args]);
    return stdout.trim();
  } catch (error) {
    throw new Error(`Invalid resources submodule checkout: ${destinationRoot}`, { cause: error });
  }
}

async function assertSubmoduleCheckout(
  destinationRoot: string,
  requireClean: boolean
): Promise<void> {
  const gitPath = join(destinationRoot, ".git");
  const gitStats = await missingAsNull(() => lstat(gitPath));
  if (!gitStats?.isFile()) {
    throw new Error(`Refusing a destination without a submodule .git file: ${destinationRoot}`);
  }
  const [topLevel, destination] = await Promise.all([
    realpath(resolve(await git(destinationRoot, ["rev-parse", "--show-toplevel"]))),
    realpath(destinationRoot),
  ]);
  if (topLevel !== destination) {
    throw new Error(`Resources submodule resolves to the wrong worktree: ${topLevel}`);
  }
  const superprojectOutput = await git(destinationRoot, [
    "rev-parse",
    "--show-superproject-working-tree",
  ]);
  if (superprojectOutput.length === 0) {
    throw new Error(`Resources destination is not a registered submodule: ${destinationRoot}`);
  }
  const superproject = await realpath(superprojectOutput);
  const registeredPath = relative(superproject, destination).split(sep).join("/");
  const registrations = (
    await git(superproject, [
      "config",
      "-f",
      ".gitmodules",
      "--get-regexp",
      "^submodule\\..*\\.path$",
    ])
  ).split("\n");
  const registration = registrations.find((line) => line.endsWith(` ${registeredPath}`));
  if (!registration) {
    throw new Error(`Resources destination is absent from .gitmodules: ${registeredPath}`);
  }
  const pathKey = registration.slice(0, registration.indexOf(" "));
  const urlKey = `${pathKey.slice(0, -".path".length)}.url`;
  const [configuredUrl, originUrl, gitlink, submoduleHead] = await Promise.all([
    git(superproject, ["config", "-f", ".gitmodules", "--get", urlKey]),
    git(destinationRoot, ["remote", "get-url", "origin"]),
    git(superproject, ["ls-files", "--stage", "--", registeredPath]),
    git(destinationRoot, ["rev-parse", "HEAD"]),
  ]);
  if (configuredUrl !== originUrl) {
    throw new Error(`Resources submodule remote differs from .gitmodules: ${originUrl}`);
  }
  const gitlinkMatch = gitlink.match(/^160000 ([0-9a-f]{40}) 0\t/);
  if (!gitlinkMatch?.[1] || gitlinkMatch[1] !== submoduleHead) {
    throw new Error("Resources submodule HEAD differs from the superproject gitlink");
  }
  if (requireClean) {
    const status = await git(destinationRoot, [
      "status",
      "--porcelain=v1",
      "--untracked-files=all",
    ]);
    if (status.length > 0) {
      throw new Error("Refusing to replace an unpublished or otherwise dirty resources snapshot");
    }
  }
}

function replacementBackupRoot(destinationRoot: string): string {
  return join(dirname(destinationRoot), `.${basename(destinationRoot)}.materializer-backup`);
}

function replacementLockPath(destinationRoot: string): string {
  return join(dirname(destinationRoot), `.${basename(destinationRoot)}.materializer.lock`);
}

async function acquireMaterializerLock(lockPath: string): Promise<void> {
  let handle: Awaited<ReturnType<typeof open>>;
  try {
    handle = await open(lockPath, "wx");
  } catch (error) {
    if (errorCode(error) !== "EEXIST") throw error;
    const ownerText = await readFile(lockPath, "utf8").catch(() => "unknown");
    throw new Error(`Another Civ7 API materializer owns ${lockPath} (${ownerText.trim()})`);
  }
  try {
    await handle.writeFile(`${process.pid}\n`);
  } catch (error) {
    await rm(lockPath, { force: true });
    throw error;
  } finally {
    await handle.close();
  }
}

export async function withMaterializerLock<T>(
  destinationRoot: string,
  operation: () => Promise<T>
): Promise<T> {
  const lockPath = replacementLockPath(destinationRoot);
  await acquireMaterializerLock(lockPath);
  try {
    return await operation();
  } finally {
    const ownerText = await readFile(lockPath, "utf8").catch(() => "");
    if (ownerText.trim() === String(process.pid)) await rm(lockPath, { force: true });
  }
}

interface PairedReplacementMarker {
  readonly schemaVersion: 1;
  readonly apiExisted: boolean;
}

function pairedReplacementMarkerPath(destinationRoot: string): string {
  return join(dirname(destinationRoot), `.${basename(destinationRoot)}.api-pair-transaction.json`);
}

function parsePairedReplacementMarker(text: string, path: string): PairedReplacementMarker {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid Civ7 API paired-replacement marker: ${path}`, { cause: error });
  }
  if (
    typeof value !== "object" ||
    value === null ||
    (value as { schemaVersion?: unknown }).schemaVersion !== 1 ||
    typeof (value as { apiExisted?: unknown }).apiExisted !== "boolean"
  ) {
    throw new Error(`Invalid Civ7 API paired-replacement marker: ${path}`);
  }
  return value as PairedReplacementMarker;
}

async function writePairedReplacementMarker(
  markerPath: string,
  marker: PairedReplacementMarker
): Promise<void> {
  const tempPath = `${markerPath}.${process.pid}.${randomUUID()}.tmp`;
  try {
    await writeFile(tempPath, `${JSON.stringify(marker, null, 2)}\n`, { flag: "wx" });
    await rename(tempPath, markerPath);
  } finally {
    await rm(tempPath, { force: true });
  }
}

/** Refuses active or interrupted materialization without repairing repository state. */
export async function assertMaterializerTransactionSettled(
  destinationRoot: string,
  apiDestinationRoot: string
): Promise<void> {
  const paths = [
    replacementLockPath(destinationRoot),
    replacementBackupRoot(destinationRoot),
    pairedReplacementMarkerPath(destinationRoot),
  ];
  const residue = (
    await Promise.all(paths.map(async (path) => ((await pathExists(path)) ? [path] : [])))
  ).flat();
  if (residue.length > 0) {
    throw new Error(
      `Civ7 materialization is in progress or interrupted: ${residue.join(", ")}; run the owning generate command to recover`
    );
  }
  await assertGeneratedApiReplacementSettled(apiDestinationRoot);
}

async function recoverPairedReplacement(
  destinationRoot: string,
  apiDestinationRoot: string
): Promise<void> {
  const markerPath = pairedReplacementMarkerPath(destinationRoot);
  const markerText = await missingAsNull(() => readFile(markerPath, "utf8"));
  if (markerText === null) {
    await recoverInterruptedReplacement(destinationRoot);
    await recoverGeneratedApiReplacement(apiDestinationRoot);
    return;
  }

  const marker = parsePairedReplacementMarker(markerText, markerPath);
  const snapshotBackup = replacementBackupRoot(destinationRoot);
  const apiBackup = generatedApiBackupRoot(apiDestinationRoot);
  if (await pathExists(snapshotBackup)) {
    await rm(destinationRoot, { recursive: true, force: true });
    await rename(snapshotBackup, destinationRoot);
  }
  if (await pathExists(apiBackup)) {
    await rm(apiDestinationRoot, { recursive: true, force: true });
    await rename(apiBackup, apiDestinationRoot);
  } else if (!marker.apiExisted) {
    await rm(apiDestinationRoot, { recursive: true, force: true });
  }
  await rm(markerPath, { force: true });
}

async function replaceSnapshotAndApiLocked(
  stagedSnapshotRoot: string,
  stagedApiRoot: string,
  destinationRoot: string,
  apiDestinationRoot: string,
  verify: (snapshotRoot: string, apiRoot: string) => Promise<void>
): Promise<void> {
  await recoverPairedReplacement(destinationRoot, apiDestinationRoot);
  await assertSubmoduleCheckout(destinationRoot, true);
  const snapshotBackup = replacementBackupRoot(destinationRoot);
  const apiBackup = generatedApiBackupRoot(apiDestinationRoot);
  const markerPath = pairedReplacementMarkerPath(destinationRoot);
  const apiExisted = await pathExists(apiDestinationRoot);

  await copyFile(join(destinationRoot, ".git"), join(stagedSnapshotRoot, ".git"));
  try {
    await writePairedReplacementMarker(markerPath, { schemaVersion: 1, apiExisted });
    await rename(destinationRoot, snapshotBackup);
    if (apiExisted) await rename(apiDestinationRoot, apiBackup);
    await rename(stagedSnapshotRoot, destinationRoot);
    await rename(stagedApiRoot, apiDestinationRoot);
    await assertSubmoduleCheckout(destinationRoot, false);
    await verify(destinationRoot, apiDestinationRoot);

    // Removing the marker commits the pair. Orphaned backups then finalize on recovery.
    await rm(markerPath, { force: true });
    await Promise.all([
      rm(snapshotBackup, { recursive: true, force: true }),
      rm(apiBackup, { recursive: true, force: true }),
    ]);
  } catch (error) {
    await recoverPairedReplacement(destinationRoot, apiDestinationRoot);
    throw error;
  }
}

async function recoverInterruptedReplacement(destinationRoot: string): Promise<void> {
  const backupRoot = replacementBackupRoot(destinationRoot);
  const [destinationExists, backupExists] = await Promise.all([
    pathExists(destinationRoot),
    pathExists(backupRoot),
  ]);
  if (!backupExists) return;
  if (!destinationExists) {
    await rename(backupRoot, destinationRoot);
    return;
  }
  await assertSubmoduleCheckout(destinationRoot, false);
  assertSnapshotReceipt(await inspectSnapshot(destinationRoot));
  await rm(backupRoot, { recursive: true, force: true });
}

async function replaceSnapshotLocked(
  stagedRoot: string,
  destinationRoot: string,
  verify: (root: string) => Promise<void> = async () => undefined
): Promise<void> {
  await recoverInterruptedReplacement(destinationRoot);
  await assertSubmoduleCheckout(destinationRoot, true);
  const backupRoot = replacementBackupRoot(destinationRoot);
  await copyFile(join(destinationRoot, ".git"), join(stagedRoot, ".git"));
  await rename(destinationRoot, backupRoot);
  try {
    await rename(stagedRoot, destinationRoot);
    await assertSubmoduleCheckout(destinationRoot, false);
    await verify(destinationRoot);
  } catch (error) {
    await rm(destinationRoot, { recursive: true, force: true });
    await rename(backupRoot, destinationRoot);
    throw error;
  }
  await rm(backupRoot, { recursive: true, force: true });
}

/** Replaces one clean submodule checkout under an exclusive recoverable transaction. */
export async function replaceSnapshot(
  stagedRoot: string,
  destinationRoot: string,
  verify: (root: string) => Promise<void> = async () => undefined
): Promise<void> {
  await withMaterializerLock(destinationRoot, () =>
    replaceSnapshotLocked(stagedRoot, destinationRoot, verify)
  );
}

/** Materializes or verifies the installed Civ7 official-evidence snapshot. */
export async function materialize(options: MaterializeOptions): Promise<MaterializeResult> {
  return withMaterializerLock(options.destinationRoot, async () => {
    if (!options.checkOnly) {
      await recoverPairedReplacement(options.destinationRoot, options.apiDestinationRoot);
    }
    await assertSubmoduleCheckout(options.destinationRoot, false);
    const stageRoot = await mkdtemp(join(dirname(options.destinationRoot), ".civ7-api-snapshot-"));
    const stageApiRoot = await mkdtemp(
      join(dirname(options.apiDestinationRoot), ".civ7-api-projection-")
    );
    try {
      const sourceBefore = await identifySource(options);
      await buildSnapshot(sourceBefore.root, stageRoot, sourceBefore.identity);
      const sourceAfter = await identifySource(options);
      if (
        sourceBefore.root !== sourceAfter.root ||
        !sameIdentity(sourceBefore.identity, sourceAfter.identity)
      ) {
        throw new Error("Civ7 installation identity changed while its source snapshot was read");
      }
      const staged = await inspectSnapshot(stageRoot);
      assertSnapshotReceipt(staged);
      const confirmed = await fingerprintSourceSnapshot(sourceAfter.root, sourceAfter.identity);
      const sourceConfirmed = await identifySource(options);
      if (
        sourceAfter.root !== sourceConfirmed.root ||
        !sameIdentity(sourceAfter.identity, sourceConfirmed.identity) ||
        !snapshotsMatch(staged, confirmed)
      ) {
        throw new Error("Civ7 source bytes changed while the official snapshot was acquired");
      }

      const stagedApi = await stageApiProjection(stageRoot, stageApiRoot);

      const current = await missingAsNull(() => inspectSnapshot(options.destinationRoot));
      if (current) assertSnapshotReceipt(current);
      const currentApi = await missingAsNull(() =>
        inspectApiProjection(options.apiDestinationRoot)
      );
      const snapshotCurrent = current !== null && snapshotsMatch(staged, current);
      const apiCurrent = currentApi !== null && apiProjectionTreesMatch(stagedApi.tree, currentApi);
      if (snapshotCurrent && apiCurrent) return { snapshot: staged, api: stagedApi };
      if (options.checkOnly) {
        const differences = [
          ...(snapshotCurrent
            ? []
            : [
                `source expected ${staged.receipt.snapshot.sha256}, found ${current?.receipt.snapshot.sha256 ?? "no valid receipt"}`,
              ]),
          ...(apiCurrent
            ? []
            : [
                `API expected ${stagedApi.tree.sha256}, found ${currentApi?.sha256 ?? "no generated source"}`,
              ]),
        ];
        throw new Error(`Official Civ7 source/API pair is stale: ${differences.join("; ")}`);
      }
      await replaceSnapshotAndApiLocked(
        stageRoot,
        stageApiRoot,
        options.destinationRoot,
        options.apiDestinationRoot,
        async (snapshotRoot, apiRoot) => {
          const replaced = await inspectSnapshot(snapshotRoot);
          assertSnapshotReceipt(replaced);
          const replacedApi = await inspectApiProjection(apiRoot);
          if (
            !snapshotsMatch(staged, replaced) ||
            !apiProjectionTreesMatch(stagedApi.tree, replacedApi)
          ) {
            throw new Error("Replaced Civ7 source/API pair differs from its validated stage");
          }
        }
      );
      return { snapshot: staged, api: stagedApi };
    } finally {
      await Promise.all([
        rm(stageRoot, { recursive: true, force: true }),
        rm(stageApiRoot, { recursive: true, force: true }),
      ]);
    }
  });
}

export function defaultMaterializeOptions(
  repoRoot: string,
  checkOnly: boolean
): MaterializeOptions {
  return {
    destinationRoot: resolve(repoRoot, ".civ7/outputs/resources"),
    apiDestinationRoot: resolve(repoRoot, "packages/civ7-api/src"),
    steamManifestPath: resolve(process.env.CIV7_STEAM_MANIFEST ?? DEFAULT_STEAM_MANIFEST),
    checkOnly,
  };
}
