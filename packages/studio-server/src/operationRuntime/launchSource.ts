import {
  type ConfigSource,
  freezeSnapshot,
  type MapConfigEnvelope,
  type LaunchEnvelope,
  type LaunchEnvelopeDigest,
  type LaunchSourceDigest,
  type RunInGameRecipeSettings,
  type RunInGameSetupConfig,
  type RunInGameStartSource,
  type RunInGameWorldSettings,
  snapshotRunInGameStartSource,
  snapshotLaunchEnvelope,
} from "@civ7/studio-contract";
import { Effect } from "effect";

import { invalidRequest, type StudioRuntimeFailure } from "../errors/index.js";
import type { StudioWorkflowPorts } from "../ports/index.js";
import { hashRunInGameEvidenceValue } from "./sourceSnapshot.js";

export type RunInGameLaunchResolution = Readonly<{
  launchEnvelope: LaunchEnvelope;
  launchSourceDigest: LaunchSourceDigest;
  launchEnvelopeDigest: LaunchEnvelopeDigest;
}>;

export function resolveRunInGameLaunchSource(
  args: Readonly<{
    input: {
      source: unknown;
      recipeSettings: RunInGameRecipeSettings;
      worldSettings: RunInGameWorldSettings;
      setupConfig: RunInGameSetupConfig;
    };
    ports: Pick<StudioWorkflowPorts, "runInGameCanonicalConfigAdmission">;
  }>
): Effect.Effect<RunInGameLaunchResolution, StudioRuntimeFailure> {
  const source = snapshotRunInGameStartSource(args.input.source);
  if (source === undefined) {
    return sourceResolutionInvalid("Run in Game source is invalid.", {
      code: "run-in-game-source-invalid",
    });
  }
  const admission = args.ports.runInGameCanonicalConfigAdmission;
  if (admission === undefined) {
    return sourceResolutionInvalid("Run in Game config admission is unavailable.", {
      code: "run-in-game-config-admission-unavailable",
    });
  }
  return resolveCanonicalConfig({ source, admission }).pipe(
    Effect.map((canonicalConfig) => {
      const resolvedSource = resolvedConfigSource({ source, canonicalConfig });
      const launchEnvelope = snapshotLaunchEnvelope({
        recipeSettings: args.input.recipeSettings,
        worldSettings: args.input.worldSettings,
        setupConfig: args.input.setupConfig,
        source: resolvedSource,
      });
      return buildResolution(launchEnvelope);
    })
  );
}

function resolveCanonicalConfig(
  args: Readonly<{
    source: RunInGameStartSource;
    admission: NonNullable<StudioWorkflowPorts["runInGameCanonicalConfigAdmission"]>;
  }>
): Effect.Effect<MapConfigEnvelope, StudioRuntimeFailure> {
  const source = args.source;
  if (source.kind === "editor") {
    const canonicalConfig = source.canonicalConfig;
    return Effect.tryPromise({
      try: () => args.admission.admit(canonicalConfig),
      catch: (cause) =>
        invalidRequest({
          message: "Run in Game config could not be admitted.",
          diagnostics: {
            code: "run-in-game-config-admission-failed",
            cause: diagnosticString(cause) ?? "unknown",
          },
        }),
    }).pipe(
      Effect.flatMap((admittedConfig) =>
        admittedConfig === canonicalConfig
          ? Effect.succeed(canonicalConfig)
          : sourceResolutionInvalid(
              "Run in Game config admission must preserve the input envelope.",
              {
                code: "run-in-game-config-admission-rebuilt",
              }
            )
      )
    );
  }
  const sourcePath = source.sourcePath;

  return Effect.tryPromise({
    try: () => args.admission.resolveCatalogSource(sourcePath),
    catch: (cause) =>
      invalidRequest({
        message: "Run in Game catalog source could not be resolved.",
        diagnostics: {
          code: "run-in-game-catalog-source-resolution-failed",
          sourcePath,
          cause: diagnosticString(cause) ?? "unknown",
        },
      }),
  }).pipe(
    Effect.flatMap((canonicalConfig) => {
      if (canonicalConfig === undefined) {
        return sourceResolutionInvalid("Run in Game catalog source was not found.", {
          code: "run-in-game-catalog-source-not-found",
          sourcePath,
        });
      }
      return Effect.succeed(canonicalConfig);
    })
  );
}

function resolvedConfigSource(
  args: Readonly<{
    source: RunInGameStartSource;
    canonicalConfig: MapConfigEnvelope;
  }>
): ConfigSource {
  return args.source.kind === "catalog"
    ? freezeSnapshot({
        kind: "catalog",
        sourcePath: args.source.sourcePath,
        canonicalConfig: args.canonicalConfig,
      } satisfies ConfigSource)
    : freezeSnapshot({
        kind: "editor",
        editorSessionId: args.source.editorSessionId,
        canonicalConfig: args.canonicalConfig,
      } satisfies ConfigSource);
}

function buildResolution(launchEnvelope: LaunchEnvelope): RunInGameLaunchResolution {
  const launchEnvelopeDigest = hashRunInGameEvidenceValue(launchEnvelope);
  const resolution = {
    launchEnvelope,
    launchSourceDigest: freezeSnapshot({
      canonicalConfigDigest: hashRunInGameEvidenceValue(launchEnvelope.source.canonicalConfig),
    }),
    launchEnvelopeDigest,
  };
  freezeSnapshot(resolution);
  return resolution;
}

export function sourceSnapshotFromLaunchResolution(
  resolution: RunInGameLaunchResolution
): Readonly<{
  source: { kind: "catalog"; sourcePath: string } | { kind: "editor"; editorSessionId: string };
  canonicalConfigDigest: string;
  launchEnvelopeDigest: string;
}> {
  const source = resolution.launchEnvelope.source;
  return freezeSnapshot({
    source:
      source.kind === "catalog"
        ? { kind: "catalog", sourcePath: source.sourcePath }
        : { kind: "editor", editorSessionId: source.editorSessionId },
    canonicalConfigDigest: resolution.launchSourceDigest.canonicalConfigDigest,
    launchEnvelopeDigest: resolution.launchEnvelopeDigest,
  });
}

function sourceResolutionInvalid(
  message: string,
  diagnostics: Record<string, string | number | boolean | null | string[]>
): Effect.Effect<never, StudioRuntimeFailure> {
  return Effect.fail(invalidRequest({ message, diagnostics }));
}

function diagnosticString(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.message;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
