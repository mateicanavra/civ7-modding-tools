import { createHash } from "node:crypto";
import path from "node:path";
import { Command, FileSystem } from "@effect/platform";
import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { Cause, Console, Data, Effect, Match, Schema } from "effect";
import {
  type StandaloneCompilerAsset,
  standaloneCompilerAssetForHost,
  standaloneCompilerManifest,
} from "./compiler-manifest.js";

class CompilerProvisionFailure extends Data.TaggedError("CompilerProvisionFailure")<{
  readonly message: string;
}> {}

const CompilerFeatureDataSchema = Schema.Struct({
  version: Schema.Literal(standaloneCompilerManifest.version),
  revision: Schema.Literal(standaloneCompilerManifest.revision),
  is_canary: Schema.Literal(true),
});
const CompilerFeatureDataJsonSchema = Schema.parseJson(CompilerFeatureDataSchema);

const provisionCompiler = Effect.fn("habitat.standalone.compiler.provision")(function* () {
  const fileSystem = yield* FileSystem.FileSystem;
  const hostAsset = yield* Effect.try({
    try: () => standaloneCompilerAssetForHost(process.platform, process.arch),
    catch: (cause) => new CompilerProvisionFailure({ message: String(cause) }),
  });
  const outputRoot = yield* parseOutputRoot();
  yield* Effect.forEach(
    standaloneCompilerManifest.assets,
    (asset) => provisionCompilerAsset(fileSystem, outputRoot, asset),
    { concurrency: 1 }
  );
  const compilerPath = provisionedCompilerPath(outputRoot, hostAsset);
  const featureData = yield* compilerFeatureData(compilerPath);
  yield* assertEqual(
    featureData.revision,
    standaloneCompilerManifest.revision,
    "compiler full revision"
  );
  yield* assertEqual(featureData.version, standaloneCompilerManifest.version, "compiler feature version");
  yield* Effect.succeed(featureData.is_canary).pipe(
    Effect.filterOrFail(
      (isCanary) => isCanary,
      () => new CompilerProvisionFailure({ message: "Pinned compiler is not a Bun canary build." })
    )
  );
  return outputRoot;
});

const provisionCompilerAsset = Effect.fn("habitat.standalone.compiler.provisionAsset")(function* (
  fileSystem: FileSystem.FileSystem,
  outputRoot: string,
  asset: StandaloneCompilerAsset
) {
  const assetRoot = path.join(outputRoot, "assets", asset.id);
  const archivePath = path.join(assetRoot, asset.archiveFilename);
  const extractionRoot = path.join(assetRoot, "expanded");
  const extractedCompilerPath = path.join(extractionRoot, asset.executableRelativePath);
  const compilerPath = provisionedCompilerPath(outputRoot, asset);

  yield* fileSystem.makeDirectory(path.dirname(compilerPath), { recursive: true });
  yield* fileSystem.makeDirectory(extractionRoot, { recursive: true });
  yield* runCommand(
    "curl",
    [
      "--fail",
      "--location",
      "--silent",
      "--show-error",
      "--header",
      "Accept: application/octet-stream",
      "--header",
      "X-GitHub-Api-Version: 2022-11-28",
      "--output",
      archivePath,
      asset.url,
    ],
    `download ${asset.archiveFilename}`
  );
  yield* assertFileDigest(fileSystem, archivePath, asset.archiveSha256, "compiler archive");
  yield* runCommand(
    "unzip",
    ["-oq", archivePath, asset.executableRelativePath, "-d", extractionRoot],
    `extract ${asset.archiveFilename}`
  );
  yield* fileSystem.copyFile(extractedCompilerPath, compilerPath);
  yield* fileSystem.chmod(compilerPath, 0o755);
  yield* assertFileDigest(fileSystem, compilerPath, asset.executableSha256, "compiler executable");
});

function provisionedCompilerPath(outputRoot: string, asset: StandaloneCompilerAsset): string {
  return path.join(outputRoot, "bin", asset.id, "bun");
}

const parseOutputRoot = Effect.fn("habitat.standalone.compiler.output")(function* () {
  const argv = process.argv.slice(2);
  const index = argv.indexOf("--output");
  const value = Match.value(index).pipe(
    Match.when(
      (candidate) => candidate >= 0,
      (candidate) => argv[candidate + 1]
    ),
    Match.orElse(() => undefined)
  );
  return yield* Effect.fromNullable(value).pipe(
    Effect.filterOrFail(
      (candidate) => candidate.trim().length > 0,
      () =>
        new CompilerProvisionFailure({
          message: "Usage: provision-compiler.ts --output <absolute-or-relative-directory>",
        })
    ),
    Effect.map((candidate) => path.resolve(candidate))
  );
});

const assertFileDigest = Effect.fn("habitat.standalone.compiler.digest")(function* (
  fileSystem: FileSystem.FileSystem,
  filePath: string,
  expected: string,
  label: string
) {
  const observed = createHash("sha256")
    .update(yield* fileSystem.readFile(filePath))
    .digest("hex");
  yield* assertEqual(observed, expected, `${label} SHA-256`);
});

const assertEqual = Effect.fn("habitat.standalone.compiler.equal")(function* (
  observed: string,
  expected: string,
  label: string
) {
  yield* Effect.succeed(observed).pipe(
    Effect.filterOrFail(
      (value) => value === expected,
      (value) =>
        new CompilerProvisionFailure({
          message: `Unexpected ${label}: expected ${expected}, observed ${value}.`,
        })
    )
  );
});

const compilerFeatureData = Effect.fn("habitat.standalone.compiler.features")(function* (
  compilerPath: string
) {
  const source = yield* commandText(
    compilerPath,
    [
      "--print",
      'JSON.stringify(require("bun:internal-for-testing").crash_handler.getFeatureData())',
    ],
    {
      BUN_DEBUG_QUIET_LOGS: "1",
      BUN_FEATURE_FLAG_INTERNAL_FOR_TESTING: "1",
      BUN_GARBAGE_COLLECTOR_LEVEL: "0",
    }
  );
  return yield* Schema.decodeUnknown(CompilerFeatureDataJsonSchema)(source).pipe(
    Effect.mapError(
      (cause) =>
        new CompilerProvisionFailure({
          message: `Could not decode Bun compiler feature identity: ${String(cause)}`,
        })
    )
  );
});

const commandText = Effect.fn("habitat.standalone.compiler.commandText")(function* (
  executable: string,
  argv: readonly string[],
  environment?: Record<string, string>
) {
  const command = Command.make(executable, ...argv).pipe(Command.env(environment ?? {}));
  return (yield* Command.string(command)).trim();
});

const runCommand = Effect.fn("habitat.standalone.compiler.command")(function* (
  executable: string,
  argv: readonly string[],
  action: string
) {
  const exitCode = yield* Command.exitCode(
    Command.make(executable, ...argv).pipe(Command.stderr("inherit"))
  );
  yield* Effect.succeed(Number(exitCode)).pipe(
    Effect.filterOrFail(
      (code) => code === 0,
      (code) =>
        new CompilerProvisionFailure({
          message: `Failed to ${action} (exit ${code}).`,
        })
    )
  );
});

NodeRuntime.runMain(
  provisionCompiler().pipe(
    Effect.tap((toolchainRoot) => Console.log(toolchainRoot)),
    Effect.provide(NodeContext.layer),
    Effect.catchAllCause((cause) =>
      Effect.gen(function* () {
        yield* Console.error(`Habitat compiler provisioning failed:\n${Cause.pretty(cause)}`);
        yield* Effect.sync(() => {
          process.exitCode = 1;
        });
      })
    )
  )
);
