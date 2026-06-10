import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";

import { STUDIO_RECIPE_DAG_ORPC_PATH } from "../../shared/recipeDagOrpc";
import type { RecipeDagResult } from "../../server/recipeDag/schema";
import type { StudioRecipeDagRouter } from "../../server/recipeDag/router";

export { STUDIO_RECIPE_DAG_ORPC_PATH };
export type { RecipeDagResult };

export type StudioRecipeDagClient = RouterClient<StudioRecipeDagRouter>;

export function createStudioRecipeDagClient(
  options: Readonly<{
    url?: string;
    fetch?: typeof globalThis.fetch;
  }> = {},
): StudioRecipeDagClient {
  const link = new RPCLink({
    url: options.url ?? defaultRecipeDagOrpcUrl(),
    ...(options.fetch
      ? {
          fetch: (request, init) => options.fetch?.(request, init)
            ?? globalThis.fetch(request, init),
        }
      : {}),
  });

  return createORPCClient<StudioRecipeDagClient>(link);
}

function defaultRecipeDagOrpcUrl(): string {
  if (typeof window === "undefined") return STUDIO_RECIPE_DAG_ORPC_PATH;
  return new URL(STUDIO_RECIPE_DAG_ORPC_PATH, window.location.origin).toString();
}
