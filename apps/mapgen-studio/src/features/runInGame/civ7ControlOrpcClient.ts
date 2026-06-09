import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import type { Civ7ControlOrpcRouter } from "@civ7/control-orpc";

import { STUDIO_CIV7_CONTROL_ORPC_PATH } from "../../shared/civ7ControlOrpc";

export { STUDIO_CIV7_CONTROL_ORPC_PATH };

export type StudioCiv7ControlOrpcClient = RouterClient<
  typeof Civ7ControlOrpcRouter
>;

export function createStudioCiv7ControlOrpcClient(
  options: Readonly<{
    url?: string;
    fetch?: typeof globalThis.fetch;
  }> = {},
): StudioCiv7ControlOrpcClient {
  const link = new RPCLink({
    url: options.url ?? STUDIO_CIV7_CONTROL_ORPC_PATH,
    ...(options.fetch
      ? {
          fetch: (request, init) => options.fetch?.(request, init)
            ?? globalThis.fetch(request, init),
        }
      : {}),
  });

  return createORPCClient<StudioCiv7ControlOrpcClient>(link);
}
