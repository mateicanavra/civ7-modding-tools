import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Node ⇄ Web request/response bridge — the ONE conversion shim between
 * Connect-style hosts (the Vite dev middleware stack, bare `node:http` test
 * servers) and the studio's fetch-adapter oRPC handlers
 * (`RPCHandler` from `@orpc/server/fetch`, per the A4-lite seam: handlers are
 * `Request`/`Response` so they drop verbatim onto a Bun server at the P5b
 * cutover).
 *
 * Extracted from `vite.config.ts` (mapgen-studio-dag-tab mount re-home) so the
 * `/rpc` studio-server mount, the recipe-dag mount, and the transport tests
 * all share the same buffering and prefix-restoration behavior.
 */

/**
 * Adapt a Vite/Connect Node request (`IncomingMessage`) to a Web `Request`.
 * Runs before Vite consumes the body, so we buffer it here (oRPC reads the Web
 * `Request` body itself). GET/HEAD carry no body. Host/proto come from headers
 * (dev server is local).
 */
export async function nodeRequestToWebRequest(req: IncomingMessage): Promise<Request> {
  const method = req.method ?? "GET";
  const host = (req.headers.host as string | undefined) ?? "localhost";
  // Connect's path-mounted middleware (`use("/rpc", …)`) STRIPS the mount prefix
  // from `req.url`, but the oRPC handler matches against the full `/rpc/...` path
  // (its `prefix`). Use `originalUrl` (the un-rewritten path) so the prefix matches.
  const path = (req as { originalUrl?: string }).originalUrl ?? req.url ?? "/";
  const url = `http://${host}${path}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) for (const v of value) headers.append(key, v);
    else headers.set(key, value);
  }
  let body: Buffer | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(Buffer.from(chunk));
    body = Buffer.concat(chunks);
  }
  return new Request(url, {
    method,
    headers,
    ...(body && body.length > 0 ? { body, duplex: "half" } : {}),
  } as RequestInit & { duplex?: "half" });
}

/** Write a Web `Response` back onto a Node `ServerResponse`. */
export async function writeWebResponse(res: ServerResponse, response: Response): Promise<void> {
  res.statusCode = response.status;
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.end(response.body ? Buffer.from(await response.arrayBuffer()) : undefined);
}
