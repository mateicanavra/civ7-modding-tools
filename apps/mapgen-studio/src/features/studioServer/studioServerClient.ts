import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import type { StudioRouter } from "@civ7/studio-server";

export const STUDIO_SERVER_ORPC_PATH = "/rpc";

export type StudioServerOrpcClient = RouterClient<StudioRouter>;

export function createStudioServerOrpcClient(
  options: Readonly<{
    url?: string;
    fetch?: typeof globalThis.fetch;
  }> = {},
): StudioServerOrpcClient {
  const link = new RPCLink({
    url: options.url ?? resolveStudioServerOrpcUrl(),
    ...(options.fetch
      ? {
          fetch: (request, init) => options.fetch?.(request, init) ?? globalThis.fetch(request, init),
        }
      : {}),
  });

  return createORPCClient<StudioServerOrpcClient>(link);
}

function resolveStudioServerOrpcUrl(): string {
  if (typeof globalThis.location?.origin === "string") {
    return new URL(STUDIO_SERVER_ORPC_PATH, globalThis.location.origin).toString();
  }
  return STUDIO_SERVER_ORPC_PATH;
}
