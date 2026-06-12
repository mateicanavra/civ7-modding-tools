import { ORPCError } from "@orpc/client";
import type { StudioServerContext } from "@civ7/studio-server";

import { loadCiv7SetupCatalog } from "../civ7Resources/catalog";
import { RunInGameHttpError } from "../runInGame/operationState";
import type { StudioEngines } from "./engines";

/**
 * Per-namespace mapping from an engine `RunInGameHttpError.statusCode` to the
 * DECLARED contract error code (packages/studio-server/src/contract/errors.ts).
 * Absent slots fall through to `failed` (500).
 */
type EngineErrorCodes = Readonly<{
  /** 409 — dual-store mutex. */
  blocked?: string;
  /** 400 — request validation. */
  invalid?: string;
  /** 503 — downstream dependency unavailable. */
  unavailable?: string;
  /** Everything else (500 fallback). */
  failed: string;
}>;

const AUTOPLAY_CODES: EngineErrorCodes = {
  blocked: "AUTOPLAY_BLOCKED",
  failed: "AUTOPLAY_FAILED",
};

const RUN_IN_GAME_CODES: EngineErrorCodes = {
  blocked: "RUN_IN_GAME_BLOCKED",
  invalid: "RUN_IN_GAME_INVALID",
  unavailable: "RUN_IN_GAME_UNAVAILABLE",
  failed: "RUN_IN_GAME_FAILED",
};

const SAVE_DEPLOY_CODES: EngineErrorCodes = {
  blocked: "SAVE_DEPLOY_BLOCKED",
  invalid: "SAVE_DEPLOY_INVALID",
  failed: "SAVE_DEPLOY_FAILED",
};

/**
 * Build the `StudioServerContext` the oRPC router consumes over the process's
 * one engines instance. Engine `RunInGameHttpError`s are converted to raw
 * `ORPCError`s whose code/status/data MATCH the contract's DECLARED errors
 * (packages/studio-server/src/contract/errors.ts) — 409→`*_BLOCKED`,
 * 400→`*_INVALID`, 404→`*_STATUS_NOT_FOUND`, 503→`*_UNAVAILABLE`, else
 * `*_FAILED` — so oRPC validates them into DEFINED typed errors at the client
 * without this module importing the contract. Moved verbatim from
 * `vite.config.ts` (`createStudioServerContextForApp`) in the bun-server
 * engine-extraction slice; the host (the Bun daemon) injects the engines and
 * its command label.
 */
export function createStudioServerContext(options: Readonly<{
  engines: StudioEngines;
  hostCommand: string;
}>): StudioServerContext {
  const { engines, hostCommand } = options;
  const toOrpc = (
    err: unknown,
    codes: EngineErrorCodes,
    fallbackMessage: string,
  ): ORPCError<string, unknown> => {
    if (err instanceof RunInGameHttpError) {
      const declared =
        err.statusCode === 409 && codes.blocked
          ? { code: codes.blocked, status: 409 }
          : err.statusCode === 400 && codes.invalid
            ? { code: codes.invalid, status: 400 }
            : err.statusCode === 503 && codes.unavailable
              ? { code: codes.unavailable, status: 503 }
              : { code: codes.failed, status: 500 };
      return new ORPCError(declared.code, {
        status: declared.status,
        message: err.message,
        ...(err.details === undefined ? {} : { data: { details: err.details } }),
      });
    }
    return new ORPCError(codes.failed, {
      status: 500,
      message: err instanceof Error ? err.message : fallbackMessage,
    });
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
        throw toOrpc(err, AUTOPLAY_CODES, "Civ7 autoplay request failed");
      }
    },
    runInGameStart: async (input) => {
      try {
        const result = await engines.runRunInGameStartEngine(input);
        return result.operation as Awaited<ReturnType<StudioServerContext["runInGameStart"]>>;
      } catch (err) {
        throw toOrpc(err, RUN_IN_GAME_CODES, "Run in Game failed");
      }
    },
    runInGameStatus: async (input) => {
      try {
        return engines.runRunInGameStatusEngine(input.requestId) as Awaited<
          ReturnType<StudioServerContext["runInGameStatus"]>
        >;
      } catch (err) {
        if (err instanceof RunInGameHttpError && err.statusCode === 404) {
          // Parity: run-in-game status 404 echoes serverInstanceId/serverStartedAt
          // (restart detection) — the RUN_IN_GAME_STATUS_NOT_FOUND data shape.
          throw new ORPCError("RUN_IN_GAME_STATUS_NOT_FOUND", {
            status: 404,
            message: err.message,
            data: {
              serverInstanceId: engines.serverInstanceId,
              serverStartedAt: engines.serverStartedAt,
            },
          });
        }
        throw toOrpc(err, RUN_IN_GAME_CODES, "Run in Game status failed");
      }
    },
    mapConfigSaveDeploy: async (input) => {
      try {
        return (await engines.runSaveDeployEngine(input)) as Awaited<
          ReturnType<StudioServerContext["mapConfigSaveDeploy"]>
        >;
      } catch (err) {
        // Parity: save/deploy validation failures (plain Errors from the request
        // parser / envelope asserts / path jail) map to 400 (not 500).
        if (!(err instanceof RunInGameHttpError)) {
          throw new ORPCError("SAVE_DEPLOY_INVALID", {
            status: 400,
            message: err instanceof Error ? err.message : "Save failed",
          });
        }
        throw toOrpc(err, SAVE_DEPLOY_CODES, "Save failed");
      }
    },
    mapConfigStatus: async (input) => {
      try {
        return engines.runSaveDeployStatusEngine(input.requestId) as Awaited<
          ReturnType<StudioServerContext["mapConfigStatus"]>
        >;
      } catch (err) {
        if (err instanceof RunInGameHttpError && err.statusCode === 404) {
          // Parity: save/deploy status 404 does NOT echo serverInstanceId
          // (documented asymmetry vs runInGame.status).
          throw new ORPCError("SAVE_DEPLOY_STATUS_NOT_FOUND", {
            status: 404,
            message: err.message,
          });
        }
        throw toOrpc(err, SAVE_DEPLOY_CODES, "Save/Deploy status failed");
      }
    },
  };
}
