import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import type { StudioRouter } from "@civ7/studio-server";

export const STUDIO_SERVER_ORPC_PATH = "/rpc";

export type StudioServerOrpcClient = RouterClient<StudioRouter>;

export type StudioServerOrpcFailure = Readonly<{
  error: string;
  statusCode?: number;
  data?: Record<string, unknown>;
}>;

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

export function studioServerOrpcFailure(err: unknown, fallback: string): StudioServerOrpcFailure {
  const record = isRecord(err) ? err : {};
  const data = isRecord(record.data) ? record.data : undefined;
  return {
    error: typeof record.message === "string" ? record.message : fallback,
    ...(typeof record.status === "number" ? { statusCode: record.status } : {}),
    ...(data ? { data } : {}),
  };
}

function resolveStudioServerOrpcUrl(): string {
  if (typeof globalThis.location?.origin === "string") {
    return new URL(STUDIO_SERVER_ORPC_PATH, globalThis.location.origin).toString();
  }
  return STUDIO_SERVER_ORPC_PATH;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object");
}
