import { liveCiv7ControlOrpcDirectControlFacade } from "@civ7/control-orpc/runtime";
import { Civ7DirectControlError, DEFAULT_CIV7_TUNER_TIMEOUT_MS } from "@civ7/direct-control";
import {
  dependencyUnavailable,
  type StudioEventHubApi,
  type StudioOperationProcedure,
  type StudioRuntimeFailure,
  type StudioServerContext,
  toStudioDefinedOrpcError,
} from "@civ7/studio-server";

import { loadCiv7SetupCatalog } from "../civ7Resources/catalog";
import { defaultRecipeDagService } from "../recipeDag/service";
import type { StudioEngines } from "./engines";

function cloneForErrorData(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function directControlDependencyFailure(err: unknown): StudioRuntimeFailure | undefined {
  if (err instanceof Civ7DirectControlError) {
    return dependencyUnavailable({
      message: err.message,
      dependency: "direct-control",
      directControlCode: err.code,
      causeSummary: cloneForErrorData(err.details),
      recoveryActions: ["copy-diagnostics", "retry-status"],
    });
  }
  return undefined;
}

function toOrpc(
  err: unknown,
  procedure: StudioOperationProcedure,
  fallbackMessage: string,
  identity: Readonly<{ serverInstanceId: string; serverStartedAt: string }>
): unknown {
  return toStudioDefinedOrpcError({
    err,
    procedure,
    fallbackMessage,
    identity,
    dependencyUnavailable: directControlDependencyFailure,
  });
}

export function toStudioRuntimeOrpcError(
  args: Readonly<{
    err: unknown;
    procedure: StudioOperationProcedure;
    fallbackMessage: string;
    serverInstanceId: string;
    serverStartedAt: string;
  }>
): ReturnType<typeof toStudioDefinedOrpcError> {
  return toStudioDefinedOrpcError({
    err: args.err,
    procedure: args.procedure,
    fallbackMessage: args.fallbackMessage,
    identity: {
      serverInstanceId: args.serverInstanceId,
      serverStartedAt: args.serverStartedAt,
    },
    dependencyUnavailable: directControlDependencyFailure,
  });
}

const emptyIdentity = {
  serverInstanceId: "",
  serverStartedAt: "",
};

/**
 * Build the `StudioServerContext` the oRPC router consumes over the process's
 * one engines instance. Expected engine failures are package-owned D3 failure
 * values; `@civ7/studio-server` maps them to declared oRPC errors with sealed
 * TypeBox data. Unknown exceptions remain router-edge defect containment. Moved verbatim from
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
        throw toOrpc(err, "autoplay.command", "Civ7 autoplay request failed", emptyIdentity);
      }
    },
    runInGameStart: async (input) => {
      try {
        const result = await engines.runRunInGameStartEngine(input);
        return result.operation;
      } catch (err) {
        throw toOrpc(err, "runInGame.start", "Run in Game failed", identity);
      }
    },
    runInGameStatus: async (input) => {
      try {
        return engines.runRunInGameStatusEngine(input.requestId);
      } catch (err) {
        throw toOrpc(err, "runInGame.status", "Run in Game status failed", identity);
      }
    },
    mapConfigSaveDeploy: async (input) => {
      try {
        return (await engines.runSaveDeployEngine(input)) as Awaited<
          ReturnType<StudioServerContext["mapConfigSaveDeploy"]>
        >;
      } catch (err) {
        throw toOrpc(err, "saveDeploy.start", "Save failed", identity);
      }
    },
    mapConfigStatus: async (input) => {
      try {
        return engines.runSaveDeployStatusEngine(input.requestId) as Awaited<
          ReturnType<StudioServerContext["mapConfigStatus"]>
        >;
      } catch (err) {
        throw toOrpc(err, "saveDeploy.status", "Save/Deploy status failed", identity);
      }
    },
    operationsCurrent: async () =>
      engines.currentOperations() as Awaited<ReturnType<StudioServerContext["operationsCurrent"]>>,
  };
}
