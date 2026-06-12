import {
  orpcError,
  type StudioServerContext,
} from "@civ7/studio-server";

import { loadCiv7SetupCatalog } from "../civ7Resources/catalog";
import { RunInGameHttpError } from "../runInGame/operationState";
import type { StudioEngines } from "./engines";

/**
 * Build the `StudioServerContext` the oRPC router consumes — the SAME engines +
 * stores the legacy `/api/*` handlers use (shared state, no divergence). Engine
 * `RunInGameHttpError`s are converted to `ORPCError` with the legacy status +
 * `details`/`observedAt` payload so the non-uniform codes survive the oRPC
 * boundary. Moved verbatim from `vite.config.ts` (`createStudioServerContextForApp`)
 * in the bun-server engine-extraction slice; the host now injects the engines,
 * the repo root, and its command label (`vite` dev: "serve"; Bun daemon: "daemon").
 *
 * Import constraint: `@civ7/studio-server` is safe to import from node-evaluated
 * config code (tsup bundles effect-orpc into its dist) — see ./engines.ts header.
 */
export function createStudioServerContext(options: Readonly<{
  engines: StudioEngines;
  hostCommand: string;
}>): StudioServerContext {
  const { engines, hostCommand } = options;
  const toOrpc = (err: unknown, fallbackStatus: number, fallbackMessage: string) => {
    if (err instanceof RunInGameHttpError) {
      return orpcError(
        err.statusCode,
        err.message,
        err.details === undefined ? undefined : { details: err.details },
      );
    }
    return orpcError(fallbackStatus, err instanceof Error ? err.message : fallbackMessage);
  };
  return {
    serverInstanceId: engines.serverInstanceId,
    serverStartedAt: engines.serverStartedAt,
    viteCommand: hostCommand,
    loadSetupCatalog: async () => {
      // `Civ7SetupCatalog` is deeply `readonly`; the contract's zod-derived catalog
      // type is structurally identical but mutable. Cross the boundary by value
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
        throw toOrpc(err, 500, "Civ7 autoplay request failed");
      }
    },
    runInGameStart: async (input) => {
      try {
        const result = await engines.runRunInGameStartEngine(input);
        return result.operation as Awaited<ReturnType<StudioServerContext["runInGameStart"]>>;
      } catch (err) {
        throw toOrpc(err, 500, "Run in Game failed");
      }
    },
    runInGameStatus: async (input) => {
      try {
        return engines.runRunInGameStatusEngine(input.requestId) as Awaited<
          ReturnType<StudioServerContext["runInGameStatus"]>
        >;
      } catch (err) {
        if (err instanceof RunInGameHttpError && err.statusCode === 404) {
          // Parity: run-in-game status 404 echoes serverInstanceId/serverStartedAt.
          throw orpcError(404, err.message, {
            serverInstanceId: engines.serverInstanceId,
            serverStartedAt: engines.serverStartedAt,
          });
        }
        throw toOrpc(err, 500, "Run in Game status failed");
      }
    },
    mapConfigSaveDeploy: async (input) => {
      try {
        return (await engines.runSaveDeployEngine(input)) as Awaited<
          ReturnType<StudioServerContext["mapConfigSaveDeploy"]>
        >;
      } catch (err) {
        // Parity: save/deploy validation failures map to 400 (not 500).
        throw toOrpc(err, 400, "Save failed");
      }
    },
    mapConfigStatus: async (input) => {
      try {
        return engines.runSaveDeployStatusEngine(input.requestId) as Awaited<
          ReturnType<StudioServerContext["mapConfigStatus"]>
        >;
      } catch (err) {
        // Parity: save/deploy status 404 does NOT echo serverInstanceId.
        throw toOrpc(err, 500, "Save/Deploy status failed");
      }
    },
  };
}
