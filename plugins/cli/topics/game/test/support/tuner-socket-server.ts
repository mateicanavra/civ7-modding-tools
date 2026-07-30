import { once } from "node:events";
import { type AddressInfo, createServer, type Socket } from "node:net";
import { encodeCiv7TunerRequest, parseCiv7TunerFrame } from "@civ7/direct-control";

/** Decoded tuner frame passed to a test's request handler. */
export type FakeTunerRequest = {
  listenerId: number;
  message: string;
  parts: readonly string[];
};

/** Tuner response fields encoded as one NUL-delimited frame by the fake server. */
export type FakeTunerResponse = readonly string[];

/** Handle for inspecting requests and deterministically shutting down a fake tuner listener. */
export type FakeTunerServer = {
  received: string[];
  address(): AddressInfo;
  close(): Promise<void>;
};

/**
 * Starts an ephemeral loopback tuner server for command integration tests.
 * `LSQ:` state discovery is reserved by the harness; other requests use the handler and then the fallback.
 * Closing the handle destroys active sockets before awaiting the listener shutdown.
 *
 * @param options - Supplies advertised states, request-specific responses, and an optional fallback.
 * @returns A listening server handle whose address can be passed to CLI endpoint flags.
 */
export async function startFakeTunerServer(options: {
  states?: FakeTunerResponse;
  fallback?: FakeTunerResponse | ((request: FakeTunerRequest) => FakeTunerResponse);
  handle(request: FakeTunerRequest): FakeTunerResponse | undefined;
}): Promise<FakeTunerServer> {
  const states = options.states ?? ["65535", "App UI", "1", "Tuner"];
  const fallback = options.fallback ?? [JSON.stringify(null)];
  const received: string[] = [];
  const sockets = new Set<Socket>();
  const server = createServer((socket) => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    let buffer = Buffer.alloc(0);
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      for (;;) {
        const parsed = parseCiv7TunerFrame(buffer);
        if (!parsed) return;
        buffer = buffer.subarray(parsed.bytesRead);
        const request = {
          listenerId: parsed.frame.listenerId,
          message: parsed.frame.parts.join("\0"),
          parts: parsed.frame.parts,
        };
        received.push(request.message);
        const response =
          request.message === "LSQ:"
            ? states
            : (options.handle(request) ??
              (typeof fallback === "function" ? fallback(request) : fallback));
        socket.write(encodeCiv7TunerRequest(request.listenerId, response.join("\0")));
      }
    });
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address.bind(server);
  const close = server.close.bind(server);
  return {
    received,
    address(): AddressInfo {
      return address() as AddressInfo;
    },
    async close() {
      for (const socket of sockets) socket.destroy();
      await new Promise<void>((resolve, reject) => {
        close((error) => (error ? reject(error) : resolve()));
      });
    },
  };
}
