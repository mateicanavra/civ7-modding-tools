import type { IncomingMessage, ServerResponse } from "node:http";
import { RPCHandler } from "@orpc/server/node";

import { STUDIO_RECIPE_DAG_ORPC_PATH } from "../../shared/recipeDagOrpc";
import type { RecipeDagService } from "./context";
import { defaultRecipeDagService } from "./service";
import { RecipeDagRouter } from "./router";

export type StudioRecipeDagNext = (err?: unknown) => void;

export function createStudioRecipeDagContext(
  options: Readonly<{
    recipeDagService?: RecipeDagService;
  }> = {},
) {
  return {
    recipeDagService: options.recipeDagService ?? defaultRecipeDagService,
  };
}

export function createStudioRecipeDagOrpcMiddleware(
  options: Readonly<{
    recipeDagService?: RecipeDagService;
  }> = {},
): (req: IncomingMessage, res: ServerResponse, next: StudioRecipeDagNext) => Promise<void> {
  const rpcHandler = new RPCHandler(RecipeDagRouter);

  return async (req, res, next) => {
    try {
      const result = await rpcHandler.handle(req, res, {
        prefix: STUDIO_RECIPE_DAG_ORPC_PATH,
        context: createStudioRecipeDagContext(options),
      });
      if (!result.matched) next();
    } catch (err) {
      next(err);
    }
  };
}

export const handleStudioRecipeDagOrpcRequest =
  createStudioRecipeDagOrpcMiddleware();
