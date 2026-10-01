import { createConnection, type Socket } from "node:net";

import { Civ7TunerFailure } from "@civ7/tuner";

/** Opens one bounded local Tuner connection or refuses with provider-neutral acquisition evidence. */
export function openSocket(options: {
  readonly host: string;
  readonly port: number;
  readonly timeoutMs: number;
}): Promise<Socket> {
  return new Promise<Socket>((resolve, reject) => {
    const socket = createConnection({ host: options.host, port: options.port });
    const timer = setTimeout(() => {
      cleanup();
      socket.destroy();
      reject(
        new Civ7TunerFailure({
          operation: "acquire",
          reason: "connection-timeout",
          message: `Timed out connecting to Civ7 Tuner at ${options.host}:${options.port}.`,
        })
      );
    }, options.timeoutMs);

    const onConnect = () => {
      cleanup();
      resolve(socket);
    };
    const onError = (cause: Error) => {
      cleanup();
      reject(
        new Civ7TunerFailure({
          operation: "acquire",
          reason: "connection-failed",
          message: `Failed connecting to Civ7 Tuner at ${options.host}:${options.port}.`,
          cause,
        })
      );
    };
    const cleanup = () => {
      clearTimeout(timer);
      socket.off("connect", onConnect);
      socket.off("error", onError);
    };

    socket.once("connect", onConnect);
    socket.once("error", onError);
  });
}
