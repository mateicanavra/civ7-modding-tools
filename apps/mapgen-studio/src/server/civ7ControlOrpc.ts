import type { IncomingMessage, ServerResponse } from "node:http";
import {
  Civ7ControlOrpcRouter,
  liveCiv7ControlOrpcDirectControlFacade,
  type Civ7ControlOrpcContext,
  type Civ7ControlOrpcDirectControlFacade,
} from "@civ7/control-orpc";
import { DEFAULT_CIV7_TUNER_TIMEOUT_MS } from "@civ7/direct-control";
import { RPCHandler } from "@orpc/server/node";

import { STUDIO_CIV7_CONTROL_ORPC_PATH } from "../shared/civ7ControlOrpc";

export type StudioCiv7ControlOrpcNext = (err?: unknown) => void;

export function createStudioCiv7ControlOrpcContext(
  options: Readonly<{
    directControl?: Civ7ControlOrpcDirectControlFacade;
    timeoutMs?: number;
  }> = {},
): Civ7ControlOrpcContext {
  return {
    directControl: options.directControl
      ?? liveCiv7ControlOrpcDirectControlFacade,
    endpointDefaults: {
      timeoutMs: options.timeoutMs ?? DEFAULT_CIV7_TUNER_TIMEOUT_MS,
    },
  };
}

export function createStudioCiv7ControlOrpcMiddleware(
  options: Readonly<{
    directControl?: Civ7ControlOrpcDirectControlFacade;
    timeoutMs?: number;
  }> = {},
): (
  req: IncomingMessage,
  res: ServerResponse,
  next: StudioCiv7ControlOrpcNext,
) => Promise<void> {
  const rpcHandler = new RPCHandler(Civ7ControlOrpcRouter);

  return async (req, res, next) => {
    try {
      const result = await rpcHandler.handle(req, res, {
        prefix: STUDIO_CIV7_CONTROL_ORPC_PATH,
        context: createStudioCiv7ControlOrpcContext(options),
      });
      if (!result.matched) next();
    } catch (err) {
      next(err);
    }
  };
}

export const handleStudioCiv7ControlOrpcRequest =
  createStudioCiv7ControlOrpcMiddleware();
