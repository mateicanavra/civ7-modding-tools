import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Command, FileSystem } from "@effect/platform";
import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { Cause, Console, Data, Effect, Schema } from "effect";
import { type Static, Type } from "typebox";
import { Value } from "typebox/value";
import {
  type StandaloneCompilerAsset,
  standaloneCompilerAssetForHost,
  standaloneCompilerManifest,
} from "./compiler-manifest.js";

const repoRoot = path.resolve(fileURLToPath(new URL("../../../..", import.meta.url)));
const outDir = path.join(repoRoot, "tools", "habitat", "dist", "standalone");
const entrypoint = path.join(repoRoot, "tools", "habitat", "bin", "check.ts");
type ExcludedBundleInput = "@getgrit/cli" | "@oclif/*" | "oclif" | "@nx/*" | "nx" | "effect-orpc";

interface ExcludedBundleOwner {
  readonly id: ExcludedBundleInput;
  readonly bunStorePrefix: string;
  readonly modulePathPrefix: string;
}

const excludedBundleOwners: readonly ExcludedBundleOwner[] = [
  { id: "@getgrit/cli", bunStorePrefix: "@getgrit+cli@", modulePathPrefix: "@getgrit/cli/" },
  { id: "@oclif/*", bunStorePrefix: "@oclif+", modulePathPrefix: "@oclif/" },
  { id: "oclif", bunStorePrefix: "oclif@", modulePathPrefix: "oclif/" },
  { id: "@nx/*", bunStorePrefix: "@nx+", modulePathPrefix: "@nx/" },
  { id: "nx", bunStorePrefix: "nx@", modulePathPrefix: "nx/" },
  { id: "effect-orpc", bunStorePrefix: "effect-orpc@", modulePathPrefix: "effect-orpc/" },
];

interface StandaloneBuildTarget {
  readonly id: StandaloneCompilerAsset["id"];
  readonly bunTarget: string;
  readonly filename: string;
}

const targets: readonly StandaloneBuildTarget[] = [
  {
    id: "darwin-arm64",
    bunTarget: "bun-darwin-arm64",
    filename: "habitat-sdk-darwin-arm64",
  },
  {
    id: "linux-x64-baseline",
    bunTarget: "bun-linux-x64-baseline",
    filename: "habitat-sdk-linux-x64-baseline",
  },
];

const MetafileSchema = Type.Object(
  { inputs: Type.Record(Type.String(), Type.Unknown()) },
  { additionalProperties: true }
);
type Metafile = Static<typeof MetafileSchema>;
const CompilerFeatureDataSchema = Schema.Struct({
  version: Schema.Literal(standaloneCompilerManifest.version),
  revision: Schema.Literal(standaloneCompilerManifest.revision),
  is_canary: Schema.Literal(true),
});
const CompilerFeatureDataJsonSchema = Schema.parseJson(CompilerFeatureDataSchema);

const ProvenanceSchema = Type.Object(
  {
    schemaVersion: Type.Literal(1),
    source: Type.Object(
      {
        commit: Type.String({ minLength: 40, maxLength: 40 }),
        habitatTree: Type.String({ minLength: 40, maxLength: 40 }),
        workingTreeDirty: Type.Boolean(),
      },
      { additionalProperties: false }
    ),
    bun: Type.Object(
      {
        name: Type.Literal(standaloneCompilerManifest.name),
        version: Type.Literal(standaloneCompilerManifest.version),
        revision: Type.Literal(standaloneCompilerManifest.revision),
        source: Type.Object(
          {
            repository: Type.Literal(standaloneCompilerManifest.source.repository),
            releaseId: Type.Literal(standaloneCompilerManifest.source.releaseId),
            tag: Type.Literal(standaloneCompilerManifest.source.tag),
          },
          { additionalProperties: false }
        ),
        hostAssetId: Type.Union([
          Type.Literal("darwin-arm64"),
          Type.Literal("linux-x64-baseline"),
        ]),
        assets: Type.Array(
          Type.Object(
            {
              id: Type.Union([
                Type.Literal("darwin-arm64"),
                Type.Literal("linux-x64-baseline"),
              ]),
              githubAssetId: Type.Integer({ minimum: 1 }),
              archiveFilename: Type.String({ minLength: 1 }),
              archiveSha256: Type.String({ minLength: 64, maxLength: 64 }),
              executableSha256: Type.String({ minLength: 64, maxLength: 64 }),
            },
            { additionalProperties: false }
          ),
          { minItems: 2, maxItems: 2 }
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
        excludedInputs: Type.Array(
          Type.Union([
            Type.Literal("@getgrit/cli"),
            Type.Literal("@oclif/*"),
            Type.Literal("oclif"),
            Type.Literal("@nx/*"),
            Type.Literal("nx"),
            Type.Literal("effect-orpc"),
          ]),
          { minItems: 6, maxItems: 6 }
        ),
      },
      { additionalProperties: false }
    ),
    artifacts: Type.Array(
      Type.Object(
        {
          target: Type.String({ minLength: 1 }),
          bunTarget: Type.String({ minLength: 1 }),
          filename: Type.String({ minLength: 1 }),
          sha256: Type.String({ minLength: 64, maxLength: 64 }),
          bytes: Type.Integer({ minimum: 1 }),
          bundledInputCount: Type.Integer({ minimum: 1 }),
        },
        { additionalProperties: false }
      ),
      { minItems: 2, maxItems: 2 }
    ),
  },
  { additionalProperties: false }
);
type Provenance = Static<typeof ProvenanceSchema>;
const JsonUnknownSchema = Schema.parseJson(Schema.Unknown);

class StandaloneBuildFailure extends Data.TaggedError("StandaloneBuildFailure")<{
  readonly message: string;
}> {}

const build = Effect.fn("habitat.standalone.build")(function* () {
  const fileSystem = yield* FileSystem.FileSystem;
  const requireClean = process.argv.slice(2).includes("--require-clean");
  const compiler = yield* compilerIdentity(fileSystem);

  const source = yield* sourceIdentity();
  yield* Effect.succeed(requireClean && source.workingTreeDirty).pipe(
    Effect.filterOrFail(
      (releaseDirty) => !releaseDirty,
      () =>
        new StandaloneBuildFailure({
          message: "Release-mode Habitat standalone builds require a clean Git worktree.",
        })
    )
  );
  yield* fileSystem.makeDirectory(outDir, { recursive: true });
  const artifacts = yield* Effect.forEach(
    targets,
    (target) =>
      buildTarget(
        target,
        fileSystem,
        compiler.executablePath,
        toolchainCompilerPath(compiler.toolchainRoot, compilerAssetById(target.id))
      ),
    { concurrency: 1 }
  );
  const provenance = Value.Parse(ProvenanceSchema, {
    schemaVersion: 1,
    source,
    bun: compiler.provenance,
    boundary: {
      command: "check",
      rejectUnresolved: true,
      compileAutoloadDotenv: false,
      compileAutoloadBunfig: false,
      bundledGritProvider: false,
      excludedInputs: excludedBundleOwners.map(({ id }) => id),
    },
    artifacts,
  } satisfies Provenance);
  const provenancePath = path.join(outDir, "provenance.json");
  const renderedProvenance = `${yield* Schema.encode(JsonUnknownSchema)(provenance)}\n`;
  yield* fileSystem.writeFileString(provenancePath, renderedProvenance);
  const provenanceBytes = yield* fileSystem.readFile(provenancePath);
  const checksumLines = [
    ...artifacts.map((artifact) => `${artifact.sha256}  ${artifact.filename}`),
    `${sha256(provenanceBytes)}  provenance.json`,
  ];
  yield* fileSystem.writeFileString(
    path.join(outDir, "SHA256SUMS"),
    `${checksumLines.join("\n")}\n`
  );
  return { provenance, renderedProvenance };
});

const buildTarget = Effect.fn("habitat.standalone.build.target")(function* (
  target: StandaloneBuildTarget,
  fileSystem: FileSystem.FileSystem,
  compilerPath: string,
  targetCompilerPath: string
) {
  const artifactPath = path.join(outDir, target.filename);
  const metafilePath = `${artifactPath}.meta.json`;
  yield* Effect.forEach([artifactPath, metafilePath], (outputPath) =>
    fileSystem.remove(outputPath, { force: true })
  );
  const command = Command.make(
    compilerPath,
    "build",
    entrypoint,
    "--compile",
    `--target=${target.bunTarget}`,
    `--compile-executable-path=${targetCompilerPath}`,
    `--outfile=${artifactPath}`,
    `--metafile=${metafilePath}`,
    "--reject-unresolved",
    "--no-compile-autoload-dotenv",
    "--no-compile-autoload-bunfig",
    "--no-compile-autoload-package-json",
    "--no-compile-autoload-tsconfig",
    "--env=disable"
  ).pipe(Command.workingDirectory(repoRoot), Command.stdout("inherit"), Command.stderr("inherit"));
  const exitCode = yield* Command.exitCode(command);
  yield* Effect.succeed(Number(exitCode)).pipe(
    Effect.filterOrFail(
      (code) => code === 0,
      (code) =>
        new StandaloneBuildFailure({
          message: `Bun failed to compile ${target.id} (exit ${code}).`,
        })
    )
  );
  const metafile = yield* parseMetafile(metafilePath, fileSystem);
  const inputs = Object.keys(metafile.inputs).sort();
  const excluded = excludedBundleOwners.filter((owner) =>
    inputs.some((input) => inputBelongsToOwner(input, owner))
  );
  yield* Effect.succeed(excluded).pipe(
    Effect.filterOrFail(
      (observed) => observed.length === 0,
      (observed) =>
        new StandaloneBuildFailure({
          message: `Standalone bundle unexpectedly includes ${observed
            .map(({ id }) => id)
            .join(", ")}.`,
        })
    )
  );
  const bytes = yield* fileSystem.readFile(artifactPath);
  yield* fileSystem.chmod(artifactPath, 0o755);
  return {
    target: target.id,
    bunTarget: target.bunTarget,
    filename: target.filename,
    sha256: sha256(bytes),
    bytes: bytes.byteLength,
    bundledInputCount: inputs.length,
  };
});

const compilerIdentity = Effect.fn("habitat.standalone.build.compiler")(function* (
  fileSystem: FileSystem.FileSystem
) {
  const asset = yield* Effect.try({
    try: () => standaloneCompilerAssetForHost(process.platform, process.arch),
    catch: (cause) => new StandaloneBuildFailure({ message: String(cause) }),
  });
  const toolchainRoot = yield* Effect.fromNullable(
    process.env.HABITAT_STANDALONE_BUN_TOOLCHAIN
  ).pipe(
    Effect.mapError(
      () =>
        new StandaloneBuildFailure({
          message:
            "HABITAT_STANDALONE_BUN_TOOLCHAIN must locate the provisioned pinned compiler assets.",
        })
    ),
    Effect.map((candidate) => path.resolve(candidate))
  );
  yield* Effect.forEach(standaloneCompilerManifest.assets, (pinnedAsset) =>
    assertCompilerAsset(fileSystem, toolchainRoot, pinnedAsset)
  );
  const executablePath = toolchainCompilerPath(toolchainRoot, asset);
  const executableBytes = yield* fileSystem.readFile(executablePath);
  const executableSha256 = sha256(executableBytes);
  yield* expectCompilerIdentity(
    executableSha256,
    asset.executableSha256,
    "compiler executable SHA-256"
  );
  const featureSource = yield* commandText(
    executablePath,
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
  const featureData = yield* Schema.decodeUnknown(CompilerFeatureDataJsonSchema)(featureSource).pipe(
    Effect.mapError(
      (cause) =>
        new StandaloneBuildFailure({
          message: `Invalid Bun compiler feature identity: ${String(cause)}`,
        })
    )
  );
  return {
    executablePath,
    toolchainRoot,
    provenance: {
      name: standaloneCompilerManifest.name,
      version: featureData.version,
      revision: featureData.revision,
      source: standaloneCompilerManifest.source,
      hostAssetId: asset.id,
      assets: standaloneCompilerManifest.assets.map((pinnedAsset) => ({
        id: pinnedAsset.id,
        githubAssetId: pinnedAsset.githubAssetId,
        archiveFilename: pinnedAsset.archiveFilename,
        archiveSha256: pinnedAsset.archiveSha256,
        executableSha256: pinnedAsset.executableSha256,
      })),
    },
  };
});

const assertCompilerAsset = Effect.fn("habitat.standalone.build.compiler.asset")(function* (
  fileSystem: FileSystem.FileSystem,
  toolchainRoot: string,
  asset: StandaloneCompilerAsset
) {
  const executablePath = toolchainCompilerPath(toolchainRoot, asset);
  const executableSha256 = sha256(yield* fileSystem.readFile(executablePath));
  yield* expectCompilerIdentity(
    executableSha256,
    asset.executableSha256,
    `${asset.id} compiler executable SHA-256`
  );
});

function compilerAssetById(id: StandaloneCompilerAsset["id"]): StandaloneCompilerAsset {
  const asset = standaloneCompilerManifest.assets.find((candidate) => candidate.id === id);
  if (!asset) throw new Error(`No pinned compiler asset for ${id}.`);
  return asset;
}

function toolchainCompilerPath(toolchainRoot: string, asset: StandaloneCompilerAsset): string {
  return path.join(toolchainRoot, "bin", asset.id, "bun");
}

const expectCompilerIdentity = Effect.fn("habitat.standalone.build.compiler.expect")(function* (
  observed: string,
  expected: string,
  label: string
) {
  yield* Effect.succeed(observed).pipe(
    Effect.filterOrFail(
      (value) => value === expected,
      (value) =>
        new StandaloneBuildFailure({
          message: `Unexpected ${label}: expected ${expected}, observed ${value}.`,
        })
    )
  );
});

const sourceIdentity = Effect.fn("habitat.standalone.build.source")(function* () {
  const status = yield* commandText("git", ["status", "--porcelain"]);
  return {
    commit: yield* commandText("git", ["rev-parse", "HEAD"]),
    habitatTree: yield* commandText("git", ["rev-parse", "HEAD:tools/habitat"]),
    workingTreeDirty: status.length > 0,
  };
});

const commandText = Effect.fn("habitat.standalone.build.commandText")(function* (
  executable: string,
  argv: readonly string[],
  environment?: Record<string, string>
) {
  return (yield* Command.string(
    Command.make(executable, ...argv).pipe(
      Command.workingDirectory(repoRoot),
      Command.env(environment ?? {})
    )
  )).trim();
});

const parseMetafile = Effect.fn("habitat.standalone.build.metafile")(function* (
  metafilePath: string,
  fileSystem: FileSystem.FileSystem
) {
  const source = yield* fileSystem.readFileString(metafilePath);
  const decoded = yield* Schema.decodeUnknown(JsonUnknownSchema)(source).pipe(
    Effect.mapError(
      (cause) =>
        new StandaloneBuildFailure({
          message: `Invalid Bun metafile JSON ${metafilePath}: ${String(cause)}`,
        })
    )
  );
  return yield* Effect.try({
    try: () => Value.Parse(MetafileSchema, decoded),
    catch: (cause) =>
      new StandaloneBuildFailure({
        message: `Invalid Bun metafile ${metafilePath}: ${String(cause)}`,
      }),
  });
});

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function inputBelongsToOwner(input: string, owner: ExcludedBundleOwner): boolean {
  const normalized = input.replaceAll("\\", "/");
  return (
    normalized.includes(`node_modules/.bun/${owner.bunStorePrefix}`) ||
    normalized.includes(`node_modules/${owner.modulePathPrefix}`)
  );
}

NodeRuntime.runMain(
  build().pipe(
    Effect.tap(({ renderedProvenance }) => Console.log(renderedProvenance.trimEnd())),
    Effect.provide(NodeContext.layer),
    Effect.catchAllCause((cause) =>
      Effect.gen(function* () {
        yield* Console.error(`Habitat standalone build failed:\n${Cause.pretty(cause)}`);
        yield* Effect.sync(() => {
          process.exitCode = 1;
        });
      })
    )
  )
);
