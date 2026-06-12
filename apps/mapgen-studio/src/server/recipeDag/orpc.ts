import type { IncomingMessage, ServerResponse } from "node:http";
import { RPCHandler } from "@orpc/server/fetch";

import { STUDIO_RECIPE_DAG_ORPC_PATH } from "../../shared/recipeDagOrpc";
import { nodeRequestToWebRequest, writeWebResponse } from "../http/nodeWebBridge";
import type { RecipeDagService } from "./context";
import { defaultRecipeDagService } from "./service";
import { RecipeDagRouter } from "./router";

// ============================================================================
// Recipe-DAG oRPC edge — fetch adapter behind a Connect shim
// (mapgen-studio-dag-tab mount re-home; mirrors @civ7/studio-server's handler)
// ============================================================================
// The canonical artifact is the FETCH handler (`Request`/`Response`): it works
// under the Vite dev middleware today via the shared node⇄web bridge and drops
// verbatim onto a Bun server at the P5b cutover — the same A4-lite seam the
// studio-server `/rpc` mount rides.
//
// This module is loaded through Vite's SSR pipeline (PER-REQUEST
// `ssrLoadModule` in vite.config.ts), and that is load-bearing: the effect-orpc
// router layer below imports `effect-orpc`, whose package entry is TypeScript
// SOURCE — Node cannot load it outside a transform pipeline, so the module
// cannot be statically imported into the config. Per-request loading (vs the
// previous forever-memoized promise) means edits here are served on the next
// request; the recipe CONTRACTS still resolve to built dist (no source
// aliases; dist is watch-ignored), so contract edits need a rebuild + restart
// regardless of mount mechanism.
//
// The URL is a pinned contract (handoff §1: "keep the path contract"):
// `STUDIO_RECIPE_DAG_ORPC_PATH` — the client is untouched by the re-home.
// ============================================================================

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

export interface StudioRecipeDagRpcHandle {
  handle(request: Request): Promise<{ matched: boolean; response?: Response }>;
}

/** The transport-portable handler (Bun-ready; the Vite mount is a thin shim). */
export function createStudioRecipeDagRpcHandler(
  options: Readonly<{
    recipeDagService?: RecipeDagService;
  }> = {},
): StudioRecipeDagRpcHandle {
  const handler = new RPCHandler(RecipeDagRouter);
  const context = createStudioRecipeDagContext(options);
  return {
    handle: (request) =>
      handler.handle(request, {
        prefix: STUDIO_RECIPE_DAG_ORPC_PATH,
        context,
      }),
  };
}

/**
 * Connect-style adapter over the fetch handler, for the Vite dev middleware
 * stack and the `node:http` transport tests. The cheap path pre-check keeps
 * the body-buffering bridge off every other request when mounted unscoped.
 */
export function createStudioRecipeDagOrpcMiddleware(
  options: Readonly<{
    recipeDagService?: RecipeDagService;
  }> = {},
): (req: IncomingMessage, res: ServerResponse, next: StudioRecipeDagNext) => Promise<void> {
  const rpcHandler = createStudioRecipeDagRpcHandler(options);

  return async (req, res, next) => {
    try {
      const path = (req as { originalUrl?: string }).originalUrl ?? req.url ?? "/";
      if (!path.startsWith(STUDIO_RECIPE_DAG_ORPC_PATH)) {
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

export const handleStudioRecipeDagOrpcRequest =
  createStudioRecipeDagOrpcMiddleware();
