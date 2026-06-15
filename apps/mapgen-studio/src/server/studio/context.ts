import { liveCiv7ControlOrpcDirectControlFacade } from "@civ7/control-orpc/runtime";
import { Civ7DirectControlError, DEFAULT_CIV7_TUNER_TIMEOUT_MS } from "@civ7/direct-control";
import {
  dependencyUnavailable,
  type StudioEventHubApi,
  type StudioOperationRuntimePorts,
  type StudioOperationProcedure,
  type StudioRuntimeFailure,
  type StudioServerContext,
  toStudioDefinedOrpcError,
} from "@civ7/studio-server";

import { loadCiv7SetupCatalog } from "../civ7Resources/catalog";
import { defaultRecipeDagService } from "../recipeDag/service";

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

/**
 * Build the host context for the package-owned Studio runtime.
 *
 * D4 keeps operation lifecycle/state/concurrency inside
 * `@civ7/studio-server`. The app supplies only leaf filesystem/deploy/control
 * ports plus durable resource loaders.
 */
export function createStudioServerContext(
  options: Readonly<{
    eventHub: StudioEventHubApi;
    hostCommand: string;
    operationRuntime: StudioOperationRuntimePorts;
    repoRoot: string;
  }>
): StudioServerContext {
  const { eventHub, hostCommand, operationRuntime, repoRoot } = options;
  return {
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
      return loadCiv7SetupCatalog({ repoRoot }) as unknown as Awaited<
        ReturnType<StudioServerContext["loadSetupCatalog"]>
      >;
    },
    operationRuntime,
  };
}
