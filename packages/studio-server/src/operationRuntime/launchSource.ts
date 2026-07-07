import type {
  LaunchEnvelope,
  LaunchEnvelopeDigest,
  LaunchSourceDigest,
  ResolvedLaunchSource,
  RunInGameRecipeSettings,
  RunInGameSetupConfig,
  RunInGameWorldSettings,
} from "@civ7/studio-contract";
import { STUDIO_CURRENT_CONFIG_ID, STUDIO_CURRENT_MAP_SCRIPT } from "@civ7/studio-contract";
import { Effect } from "effect";
import { invalidRequest, type StudioRuntimeFailure } from "../errors/index.js";
import type { RunInGameCatalogSource, StudioWorkflowPorts } from "../ports/index.js";
import { hashRunInGameProofValue } from "./sourceSnapshot.js";

const STANDARD_RECIPE_ID = "mod-swooper-maps/standard";
const STANDARD_MAP_SCRIPT_PREFIX = "{swooper-maps}/maps/";
const STANDARD_MAP_SCRIPT_SUFFIX = ".js";

export type RunInGameLaunchResolution = Readonly<{
  resolvedLaunchSource: ResolvedLaunchSource;
  launchEnvelope: LaunchEnvelope;
  launchSourceDigest: LaunchSourceDigest;
  launchEnvelopeDigest: LaunchEnvelopeDigest;
  configContentDigest: string;
  selectedConfigId: string;
  materializationMode: "durable" | "disposable";
}>;

export function resolveRunInGameLaunchSource(
  args: Readonly<{
    input: {
      source: unknown;
      recipeSettings: RunInGameRecipeSettings;
      worldSettings: RunInGameWorldSettings;
      setupConfig: RunInGameSetupConfig;
    };
    ports: Pick<StudioWorkflowPorts, "readRunInGameCatalogSource">;
  }>
): Effect.Effect<RunInGameLaunchResolution, StudioRuntimeFailure> {
  const source = args.input.source;
  if (!isRecord(source)) {
    return sourceResolutionInvalid("Run in Game launch source must be an object.", {
      code: "run-in-game-source-invalid",
    });
  }
  if (source.kind === "catalog") {
    return resolveCatalogLaunchSource({ ...args, source });
  }
  if (source.kind === "editor") {
    return resolveEditorLaunchSource({ ...args, source });
  }
  return sourceResolutionInvalid("Run in Game launch source kind is unsupported.", {
    code: "run-in-game-source-kind-invalid",
  });
}

function resolveCatalogLaunchSource(
  args: Readonly<{
    input: {
      recipeSettings: RunInGameRecipeSettings;
      worldSettings: RunInGameWorldSettings;
      setupConfig: RunInGameSetupConfig;
    };
    ports: Pick<StudioWorkflowPorts, "readRunInGameCatalogSource">;
    source: Record<string, unknown>;
  }>
): Effect.Effect<RunInGameLaunchResolution, StudioRuntimeFailure> {
  const catalogSourceId = args.source.catalogSourceId;
  if (typeof catalogSourceId !== "string" || !isKebabId(catalogSourceId)) {
    return sourceResolutionInvalid("Run in Game catalog source id is invalid.", {
      code: "run-in-game-catalog-source-id-invalid",
      ...(diagnosticString(catalogSourceId) === undefined
        ? {}
        : { catalogSourceId: diagnosticString(catalogSourceId) }),
    });
  }
  const readCatalogSource = args.ports.readRunInGameCatalogSource;
  if (readCatalogSource === undefined) {
    return sourceResolutionInvalid("Run in Game catalog source reader is unavailable.", {
      code: "run-in-game-catalog-source-reader-unavailable",
      catalogSourceId,
    });
  }
  return Effect.tryPromise({
    try: () => readCatalogSource({ catalogSourceId }),
    catch: (err) =>
      invalidRequest({
        message: "Run in Game catalog source could not be resolved.",
        diagnostics: {
          code: "run-in-game-catalog-source-resolution-failed",
          catalogSourceId,
          cause: diagnosticString(err) ?? "unknown",
        },
      }),
  }).pipe(
    Effect.flatMap((catalogSource) => {
      if (catalogSource === undefined) {
        return sourceResolutionInvalid("Run in Game catalog source was not found.", {
          code: "run-in-game-catalog-source-not-found",
          catalogSourceId,
        });
      }
      return Effect.succeed(
        buildResolution({
          input: args.input,
          selectedConfigId: catalogSource.catalogSourceId,
          materializationMode: "durable",
          sourceSummary: {
            kind: "catalog",
            id: catalogSource.catalogSourceId,
            label: catalogSource.name,
            description: catalogSource.description,
            mapScript: mapScriptForConfigId(catalogSource.catalogSourceId),
            sortIndex: catalogSource.sortIndex,
            ...(catalogSource.latitudeBounds === undefined
              ? {}
              : { latitudeBounds: catalogSource.latitudeBounds }),
          },
          resolvedLaunchSource: {
            kind: "catalog",
            catalogSourceId: catalogSource.catalogSourceId,
            catalogSourcePath: catalogSource.configPath,
            label: catalogSource.name,
            description: catalogSource.description,
            sortIndex: catalogSource.sortIndex,
            ...(catalogSource.latitudeBounds === undefined
              ? {}
              : { latitudeBounds: catalogSource.latitudeBounds }),
            config: catalogSource.config,
          },
          config: catalogSource.config,
        })
      );
    })
  );
}

function resolveEditorLaunchSource(
  args: Readonly<{
    input: {
      recipeSettings: RunInGameRecipeSettings;
      worldSettings: RunInGameWorldSettings;
      setupConfig: RunInGameSetupConfig;
    };
    source: Record<string, unknown>;
  }>
): Effect.Effect<RunInGameLaunchResolution, StudioRuntimeFailure> {
  const payload = isRecord(args.source.payload) ? args.source.payload : undefined;
  if (payload === undefined || !isRecord(payload.pipelineConfig)) {
    return sourceResolutionInvalid("Run in Game editor source requires a pipeline config.", {
      code: "run-in-game-editor-source-config-invalid",
    });
  }
  const editorSessionId = stringValue(args.source.editorSessionId);
  const configId = stringValue(payload.configId);
  const label = stringValue(payload.label);
  const mapScript = stringValue(payload.mapScript);
  if (
    editorSessionId === undefined ||
    configId === undefined ||
    label === undefined ||
    mapScript === undefined
  ) {
    return sourceResolutionInvalid("Run in Game editor source is missing required metadata.", {
      code: "run-in-game-editor-source-metadata-invalid",
    });
  }
  if (configId !== STUDIO_CURRENT_CONFIG_ID || mapScript !== STUDIO_CURRENT_MAP_SCRIPT) {
    return sourceResolutionInvalid("Run in Game editor source must target studio-current.", {
      code: "run-in-game-editor-source-identity-invalid",
      configId,
      mapScript,
    });
  }
  if (payload.recipeId !== STANDARD_RECIPE_ID) {
    return sourceResolutionInvalid("Run in Game editor source recipe is unsupported.", {
      code: "run-in-game-editor-source-recipe-invalid",
      ...(diagnosticString(payload.recipeId) === undefined
        ? {}
        : { recipeId: diagnosticString(payload.recipeId) }),
    });
  }
  return Effect.succeed(
    buildResolution({
      input: args.input,
      selectedConfigId: "studio-current",
      materializationMode: "disposable",
      sourceSummary: {
        kind: "editor",
        id: STUDIO_CURRENT_CONFIG_ID,
        label,
        ...(typeof payload.description === "string" ? { description: payload.description } : {}),
        mapScript: STUDIO_CURRENT_MAP_SCRIPT,
        sortIndex: typeof payload.sortIndex === "number" ? payload.sortIndex : 9999,
        ...(payload.latitudeBounds === undefined ? {} : { latitudeBounds: payload.latitudeBounds }),
      },
      resolvedLaunchSource: {
        kind: "editor",
        editorSessionId,
        configId: STUDIO_CURRENT_CONFIG_ID,
        label,
        ...(typeof payload.description === "string" ? { description: payload.description } : {}),
        mapScript: STUDIO_CURRENT_MAP_SCRIPT,
        sortIndex: typeof payload.sortIndex === "number" ? payload.sortIndex : 9999,
        ...(payload.latitudeBounds === undefined ? {} : { latitudeBounds: payload.latitudeBounds }),
        config: payload.pipelineConfig,
      },
      config: payload.pipelineConfig,
    })
  );
}

function buildResolution(args: {
  input: {
    recipeSettings: RunInGameRecipeSettings;
    worldSettings: RunInGameWorldSettings;
    setupConfig: RunInGameSetupConfig;
  };
  selectedConfigId: string;
  materializationMode: "durable" | "disposable";
  sourceSummary: LaunchEnvelope["source"];
  resolvedLaunchSource: ResolvedLaunchSource;
  config: Record<string, unknown>;
}): RunInGameLaunchResolution {
  const launchEnvelope: LaunchEnvelope = {
    recipeSettings: args.input.recipeSettings,
    worldSettings: args.input.worldSettings,
    setupConfig: args.input.setupConfig,
    source: args.sourceSummary,
    config: args.config,
  };
  const configContentDigest = hashRunInGameProofValue(args.config);
  const launchEnvelopeDigest = hashRunInGameProofValue(launchEnvelope);
  return {
    resolvedLaunchSource: args.resolvedLaunchSource,
    launchEnvelope,
    launchSourceDigest: {
      configContentDigest,
      launchEnvelopeDigest,
    },
    launchEnvelopeDigest,
    configContentDigest,
    selectedConfigId: args.selectedConfigId,
    materializationMode: args.materializationMode,
  };
}

export function sourceSnapshotFromLaunchResolution(
  resolution: RunInGameLaunchResolution
): Record<string, unknown> {
  return {
    recipeSettings: resolution.launchEnvelope.recipeSettings,
    worldSettings: resolution.launchEnvelope.worldSettings,
    pipelineConfig: resolution.launchEnvelope.config,
    setupConfig: resolution.launchEnvelope.setupConfig,
    materializationMode: resolution.materializationMode,
    selectedConfig: {
      id: resolution.selectedConfigId,
      label: resolution.launchEnvelope.source.label,
      ...(resolution.launchEnvelope.source.description === undefined
        ? {}
        : { description: resolution.launchEnvelope.source.description }),
      ...(resolution.resolvedLaunchSource.kind === "catalog"
        ? { sourcePath: resolution.resolvedLaunchSource.catalogSourcePath }
        : {}),
      sortIndex: resolution.launchEnvelope.source.sortIndex,
      ...(resolution.launchEnvelope.source.latitudeBounds === undefined
        ? {}
        : { latitudeBounds: resolution.launchEnvelope.source.latitudeBounds }),
    },
  };
}

function sourceResolutionInvalid(
  message: string,
  diagnostics: Record<string, string | number | boolean | null | string[]>
): Effect.Effect<never, StudioRuntimeFailure> {
  return Effect.fail(invalidRequest({ message, diagnostics }));
}

function mapScriptForConfigId(configId: string): string {
  return `${STANDARD_MAP_SCRIPT_PREFIX}${configId}${STANDARD_MAP_SCRIPT_SUFFIX}`;
}

function isKebabId(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
