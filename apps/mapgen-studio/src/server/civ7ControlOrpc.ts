import type { IncomingMessage, ServerResponse } from "node:http";
import {
  Civ7ControlOrpcRouter,
  type Civ7ControlOrpcContext,
} from "@civ7/control-orpc";
import {
  liveCiv7ControlOrpcDirectControlFacade,
  type Civ7ControlOrpcDirectControlFacade,
} from "@civ7/control-orpc/runtime";
import {
  DEFAULT_CIV7_TUNER_TIMEOUT_MS,
  type Civ7DirectControlSession,
} from "@civ7/direct-control";
import { RPCHandler } from "@orpc/server/fetch";

import { STUDIO_CIV7_CONTROL_ORPC_PATH } from "../shared/civ7ControlOrpc";
import { nodeRequestToWebRequest, writeWebResponse } from "./http/nodeWebBridge";

// ============================================================================
// Civ7 control-oRPC edge — fetch adapter behind a Connect shim
// (bun-server workstream; mirrors ./recipeDag/orpc.ts and @civ7/studio-server)
// ============================================================================
// The canonical artifact is the FETCH handler (`Request`/`Response`): it works
// under the Vite dev middleware via the shared node⇄web bridge and drops
// verbatim onto the Bun daemon — the same A4-lite seam the studio-server
// `/rpc` mount rides. The URL is a pinned contract:
// `STUDIO_CIV7_CONTROL_ORPC_PATH` — the client is untouched by the re-shape.
// ============================================================================

export type StudioCiv7ControlOrpcNext = (err?: unknown) => void;

export function createStudioCiv7ControlOrpcContext(
  options: Readonly<{
    directControl?: Civ7ControlOrpcDirectControlFacade;
    timeoutMs?: number;
    /**
     * The daemon's shared tuner session (owned by the studio runtime's
     * `Civ7TunerSession`). `endpointDefaults` is `Civ7DirectControlOptions`,
     * so the session flows through every router procedure → every
     * direct-control call reuses the one multiplexed connection instead of
     * opening its own. Lifecycle stays with the owner — the facade never
     * closes it.
     */
    session?: Civ7DirectControlSession;
  }> = {},
): Civ7ControlOrpcContext {
  return {
    directControl: options.directControl
      ?? liveCiv7ControlOrpcDirectControlFacade,
    endpointDefaults: {
      timeoutMs: options.timeoutMs ?? DEFAULT_CIV7_TUNER_TIMEOUT_MS,
      ...(options.session ? { session: options.session } : {}),
    },
  };
}

export interface StudioCiv7ControlRpcHandle {
  handle(request: Request): Promise<{ matched: boolean; response?: Response }>;
}

/** The transport-portable handler (Bun-ready; the Vite mount is a thin shim). */
export function createStudioCiv7ControlRpcHandler(
  options: Readonly<{
    directControl?: Civ7ControlOrpcDirectControlFacade;
    timeoutMs?: number;
    session?: Civ7DirectControlSession;
  }> = {},
): StudioCiv7ControlRpcHandle {
  const handler = new RPCHandler(Civ7ControlOrpcRouter);
  const context = createStudioCiv7ControlOrpcContext(options);
  return {
    handle: (request) =>
      handler.handle(request, {
        prefix: STUDIO_CIV7_CONTROL_ORPC_PATH,
        context,
      }),
  };
}

/**
 * Connect-style adapter over the fetch handler, for the Vite dev middleware
 * stack and the `node:http` transport tests. The cheap path pre-check keeps
 * the body-buffering bridge off every other request when mounted unscoped.
 */
export function createStudioCiv7ControlOrpcMiddleware(
  options: Readonly<{
    directControl?: Civ7ControlOrpcDirectControlFacade;
    timeoutMs?: number;
    session?: Civ7DirectControlSession;
  }> = {},
): (
  req: IncomingMessage,
  res: ServerResponse,
  next: StudioCiv7ControlOrpcNext,
) => Promise<void> {
  const rpcHandler = createStudioCiv7ControlRpcHandler(options);

  return async (req, res, next) => {
    try {
      const path = (req as { originalUrl?: string }).originalUrl ?? req.url ?? "/";
      if (!path.startsWith(STUDIO_CIV7_CONTROL_ORPC_PATH)) {
        next();
        return;
      }
      const request = await nodeRequestToWebRequest(req);
      const { matched, response } = await rpcHandler.handle(request);
      if (!matched || !response) {
        next();
        return;
      }
      await writeWebResponse(res, response);
    } catch (err) {
      next(err);
    }
  };
}

export const handleStudioCiv7ControlOrpcRequest =
  createStudioCiv7ControlOrpcMiddleware();
