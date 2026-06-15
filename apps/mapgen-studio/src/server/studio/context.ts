import { liveCiv7ControlOrpcDirectControlFacade } from "@civ7/control-orpc/runtime";
import { Civ7DirectControlError, DEFAULT_CIV7_TUNER_TIMEOUT_MS } from "@civ7/direct-control";
import type { StudioEventHubApi, StudioServerContext } from "@civ7/studio-server";
import { ORPCError } from "@orpc/client";

import { loadCiv7SetupCatalog } from "../civ7Resources/catalog";
import { defaultRecipeDagService } from "../recipeDag/service";
import { StudioEngineError, type StudioEngineFailureKind } from "./engineErrors";
import type { StudioEngines } from "./engines";

/**
 * Per-namespace mapping from a sealed engine failure kind to the DECLARED
 * contract error code/status (packages/studio-server/src/contract/errors.ts).
 * Unknown exceptions still become `failed`; known `StudioEngineError`
 * categories must resolve through this table.
 */
type EngineErrorMapping = Readonly<{
  code: string;
  status: number;
}>;

type EngineErrorMappings = Readonly<Record<StudioEngineFailureKind, EngineErrorMapping>>;

export const STUDIO_ENGINE_ERROR_MAPPINGS = {
  autoplay: {
    blocked: { code: "AUTOPLAY_BLOCKED", status: 409 },
    invalid: { code: "AUTOPLAY_INVALID", status: 400 },
    "not-found": { code: "AUTOPLAY_FAILED", status: 500 },
    unavailable: { code: "AUTOPLAY_UNAVAILABLE", status: 503 },
    failed: { code: "AUTOPLAY_FAILED", status: 500 },
  },
  runInGame: {
    blocked: { code: "RUN_IN_GAME_BLOCKED", status: 409 },
    invalid: { code: "RUN_IN_GAME_INVALID", status: 400 },
    "not-found": { code: "RUN_IN_GAME_STATUS_NOT_FOUND", status: 404 },
    unavailable: { code: "RUN_IN_GAME_UNAVAILABLE", status: 503 },
    failed: { code: "RUN_IN_GAME_FAILED", status: 500 },
  },
  saveDeploy: {
    blocked: { code: "SAVE_DEPLOY_BLOCKED", status: 409 },
    invalid: { code: "SAVE_DEPLOY_INVALID", status: 400 },
    "not-found": { code: "SAVE_DEPLOY_STATUS_NOT_FOUND", status: 404 },
    unavailable: { code: "SAVE_DEPLOY_UNAVAILABLE", status: 503 },
    failed: { code: "SAVE_DEPLOY_FAILED", status: 500 },
  },
} as const satisfies Record<string, EngineErrorMappings>;

type EngineNamespace = keyof typeof STUDIO_ENGINE_ERROR_MAPPINGS;

function cloneForErrorData(value: unknown): unknown {
  if (value === undefined) return undefined;
  try {
    return JSON.parse(JSON.stringify(value)) as unknown;
  } catch {
    return String(value);
  }
}

function detailsForUnknown(err: unknown): unknown {
  if (err instanceof Civ7DirectControlError) {
    return {
      code: "direct-control-unavailable",
      directControlCode: err.code,
      cause: cloneForErrorData(err.details),
      recoveryActions: ["copy-diagnostics", "retry-status"],
    };
  }
  return undefined;
}

function isIdentityMiss(namespace: EngineNamespace, kind: StudioEngineFailureKind): boolean {
  return (namespace === "runInGame" || namespace === "saveDeploy") && kind === "not-found";
}

export function toStudioEngineOrpcError(
  args: Readonly<{
    err: unknown;
    namespace: EngineNamespace;
    fallbackMessage: string;
    serverInstanceId: string;
    serverStartedAt: string;
  }>
): ORPCError<string, unknown> {
  const mappings = STUDIO_ENGINE_ERROR_MAPPINGS[args.namespace];
  if (args.err instanceof StudioEngineError) {
    const mapped = mappings[args.err.failure.kind];
    const data = isIdentityMiss(args.namespace, args.err.failure.kind)
      ? {
          serverInstanceId: args.serverInstanceId,
          serverStartedAt: args.serverStartedAt,
          ...(args.err.details === undefined ? {} : { details: args.err.details }),
        }
      : args.err.details === undefined
        ? undefined
        : { details: args.err.details };
    return new ORPCError(mapped.code, {
      status: mapped.status,
      message: args.err.message,
      data,
    });
  }
  const unknownMapped =
    args.err instanceof Civ7DirectControlError ? mappings.unavailable : mappings.failed;
  const unknownDetails = detailsForUnknown(args.err);
  return new ORPCError(unknownMapped.code, {
    status: unknownMapped.status,
    message: args.err instanceof Error ? args.err.message : args.fallbackMessage,
    data: unknownDetails === undefined ? undefined : { details: unknownDetails },
  });
}

function toOrpc(
  err: unknown,
  namespace: EngineNamespace,
  fallbackMessage: string,
  identity: Readonly<{ serverInstanceId: string; serverStartedAt: string }>
): ORPCError<string, unknown> {
  return toStudioEngineOrpcError({
    err,
    namespace,
    fallbackMessage,
    serverInstanceId: identity.serverInstanceId,
    serverStartedAt: identity.serverStartedAt,
  });
}

const emptyIdentity = {
  serverInstanceId: "",
  serverStartedAt: "",
};

/**
 * Build the `StudioServerContext` the oRPC router consumes over the process's
 * one engines instance. Engine `StudioEngineError`s are converted to raw
 * `ORPCError`s whose code/status/data MATCH the contract's DECLARED errors
 * (packages/studio-server/src/contract/errors.ts) — 409→`*_BLOCKED`,
 * 400→`*_INVALID`, 404→`*_STATUS_NOT_FOUND`, 503→`*_UNAVAILABLE`, and
 * unexpected exceptions to `*_FAILED` — so oRPC validates them into DEFINED typed errors at the client
 * without this module importing the contract. Moved verbatim from
 * `vite.config.ts` (`createStudioServerContextForApp`) in the bun-server
 * engine-extraction slice; the host (the Bun daemon) injects the engines and
 * its command label.
 */
export function createStudioServerContext(
  options: Readonly<{
    engines: StudioEngines;
    eventHub: StudioEventHubApi;
    hostCommand: string;
  }>
): StudioServerContext {
  const { engines, eventHub, hostCommand } = options;
  const identity = {
    serverInstanceId: engines.serverInstanceId,
    serverStartedAt: engines.serverStartedAt,
  };
  return {
    serverInstanceId: engines.serverInstanceId,
    serverStartedAt: engines.serverStartedAt,
    viteCommand: hostCommand,
    // Recipe-DAG projection: the implementation stays app-side (it imports
    // mod-swooper-maps recipe stages); the package reads it via StudioConfig.
    recipeDagService: defaultRecipeDagService,
    // Civ7 control surface dependencies: the unified handler builds the
    // control procedures' per-request context from these plus the runtime's
    // shared tuner session (structural session sharing — no daemon patch).
    civ7Control: {
      directControl: liveCiv7ControlOrpcDirectControlFacade,
      timeoutMs: DEFAULT_CIV7_TUNER_TIMEOUT_MS,
    },
    eventHub,
    loadSetupCatalog: async () => {
      // `Civ7SetupCatalog` is deeply `readonly`; the package TypeBox contract
      // exposes the same wire shape as mutable data. Cross the boundary by value
      // (JSON serialization erases readonly); cast to satisfy the seam type.
      return loadCiv7SetupCatalog({ repoRoot: engines.repoRoot }) as unknown as Awaited<
        ReturnType<StudioServerContext["loadSetupCatalog"]>
      >;
    },
    autoplay: async (input) => {
      try {
        return (await engines.runAutoplayEngine(input.action)) as Awaited<
          ReturnType<StudioServerContext["autoplay"]>
        >;
      } catch (err) {
        throw toOrpc(err, "autoplay", "Civ7 autoplay request failed", emptyIdentity);
      }
    },
    runInGameStart: async (input) => {
      try {
        const result = await engines.runRunInGameStartEngine(input);
        return result.operation;
      } catch (err) {
        throw toOrpc(err, "runInGame", "Run in Game failed", identity);
      }
    },
    runInGameStatus: async (input) => {
      try {
        return engines.runRunInGameStatusEngine(input.requestId);
      } catch (err) {
        throw toOrpc(err, "runInGame", "Run in Game status failed", identity);
      }
    },
    mapConfigSaveDeploy: async (input) => {
      try {
        return (await engines.runSaveDeployEngine(input)) as Awaited<
          ReturnType<StudioServerContext["mapConfigSaveDeploy"]>
        >;
      } catch (err) {
        throw toOrpc(err, "saveDeploy", "Save failed", identity);
      }
    },
    mapConfigStatus: async (input) => {
      try {
        return engines.runSaveDeployStatusEngine(input.requestId) as Awaited<
          ReturnType<StudioServerContext["mapConfigStatus"]>
        >;
      } catch (err) {
        throw toOrpc(err, "saveDeploy", "Save/Deploy status failed", identity);
      }
    },
    operationsCurrent: async () =>
      engines.currentOperations() as Awaited<ReturnType<StudioServerContext["operationsCurrent"]>>,
  };
}
