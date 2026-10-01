import type { Socket } from "node:net";

import {
  type Civ7TunerCommandResult,
  type Civ7TunerDispatchStatus,
  Civ7TunerFailure,
  type Civ7TunerFailureOperation,
  type Civ7TunerState,
  type Civ7TunerStateSelection,
  type Civ7TunerStatus,
} from "@civ7/tuner";
import type { LocalSocketCiv7TunerConfig } from "./config.js";
import {
  allocateListenerId,
  type Civ7TunerFrame,
  encodeCiv7TunerRequest,
  parseCiv7TunerFrame,
  selectState,
  statesFromFrame,
} from "./protocol.js";
import { openSocket } from "./socket.js";

const GRACEFUL_CLOSE_TIMEOUT_MS = 1_000;

type PendingRequest = {
  resolve(frame: Civ7TunerFrame): void;
  reject(cause: Civ7TunerFailure): void;
  timer: ReturnType<typeof setTimeout>;
  message: string;
  operation: Civ7TunerFailureOperation;
};

/** Owns the reconnectable socket epochs behind one acquired local Tuner capability. */
export class LocalSocketCiv7TunerSession {
  private socket: Socket | undefined;
  private buffer = Buffer.alloc(0);
  private readonly pending = new Map<number, PendingRequest>();
  private connecting: Promise<void> | undefined;
  private retiring: Promise<void> | undefined;
  private released = false;
  private connectionEpoch = 0;
  private consecutiveResponseTimeouts = 0;
  private totalResponseTimeouts = 0;

  constructor(private readonly config: LocalSocketCiv7TunerConfig) {}

  inspect(): Civ7TunerStatus {
    return {
      connectionEpoch: this.connectionEpoch,
      connected: this.socket !== undefined && isReusable(this.socket),
      consecutiveResponseTimeouts: this.consecutiveResponseTimeouts,
      totalResponseTimeouts: this.totalResponseTimeouts,
    };
  }

  async connect(): Promise<void> {
    this.assertOpen("acquire");
    if (this.socket && isReusable(this.socket)) return;
    if (this.connecting) {
      await this.connecting;
      return;
    }
    const attempt = this.establishConnection();
    this.connecting = attempt;
    try {
      await attempt;
    } finally {
      if (this.connecting === attempt) this.connecting = undefined;
    }
  }

  async queryStates(
    options: { readonly timeoutMs?: number } = {}
  ): Promise<readonly Civ7TunerState[]> {
    const response = await this.request("LSQ:", "query-states", options.timeoutMs);
    return statesFromFrame(response.parts);
  }

  async execute(options: {
    readonly command: string;
    readonly state?: Civ7TunerStateSelection;
    readonly timeoutMs?: number;
  }): Promise<Civ7TunerCommandResult> {
    let dispatchStatus: Civ7TunerDispatchStatus = "not-dispatched";
    try {
      this.assertOpen("execute");
      const command = options.command.trim();
      if (!command) {
        throw new Civ7TunerFailure({
          operation: "execute",
          reason: "command-invalid",
          message: "Civ7 Tuner command must not be empty.",
          dispatchStatus,
        });
      }

      const states = await this.queryStates({ timeoutMs: options.timeoutMs });
      const selectedAtEpoch = this.connectionEpoch;
      const state = selectState(states, options.state);
      const response = await this.requestOnEpoch(
        `CMD:${state.id}:${command}`,
        selectedAtEpoch,
        options.timeoutMs,
        () => {
          dispatchStatus = "indeterminate";
        }
      );
      dispatchStatus = "dispatched";
      return { state, output: response.parts };
    } catch (cause) {
      throw failureWithDispatch(cause, dispatchStatus);
    }
  }

  async reset(): Promise<void> {
    this.assertOpen("reset");
    await this.connecting?.catch(() => {});
    this.assertOpen("reset");
    await this.retireConnection();
  }

  async close(): Promise<void> {
    this.released = true;
    await this.connecting?.catch(() => {});
    await this.retireConnection();
  }

  private async establishConnection(): Promise<void> {
    await this.retireConnection();
    const failures: Array<{ host: string; message: string }> = [];
    for (const host of this.config.hosts) {
      this.assertOpen("acquire");
      try {
        const socket = await openSocket({
          host,
          port: this.config.port,
          timeoutMs: this.config.timeoutMs,
        });
        if (this.released) {
          await this.closeSocket(socket);
          this.assertOpen("acquire");
        }
        this.socket = socket;
        this.connectionEpoch += 1;
        this.buffer = Buffer.alloc(0);
        socket.on("data", (chunk) => this.handleData(socket, chunk));
        socket.once("error", (cause) => {
          this.invalidateConnection(
            socket,
            new Civ7TunerFailure({
              operation: "query-states",
              reason: "connection-failed",
              message: "The Civ7 Tuner socket failed.",
              cause,
            })
          );
          socket.destroy();
        });
        socket.once("end", () => this.invalidateConnection(socket, connectionLost("ended")));
        socket.once("close", () => this.invalidateConnection(socket, connectionLost("closed")));
        return;
      } catch (cause) {
        this.assertOpen("acquire");
        failures.push({ host, message: failureMessage(cause) });
      }
    }

    throw new Civ7TunerFailure({
      operation: "acquire",
      reason: "unavailable",
      message: `Unable to reach Civ7 Tuner on ${this.config.hosts.join(", ")}:${this.config.port}.`,
      details: failures,
    });
  }

  private async retireConnection(): Promise<void> {
    if (this.retiring) {
      await this.retiring;
      return;
    }
    const socket = this.socket;
    if (!socket) return;
    this.invalidateConnection(socket, connectionLost("released"));
    const retirement = this.closeSocket(socket);
    this.retiring = retirement;
    try {
      await retirement;
    } finally {
      if (this.retiring === retirement) this.retiring = undefined;
    }
  }

  private async closeSocket(socket: Socket): Promise<void> {
    if (socket.destroyed || socket.readyState === "closed") return;

    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => socket.destroy(), GRACEFUL_CLOSE_TIMEOUT_MS);
      socket.once("close", () => {
        clearTimeout(timer);
        resolve();
      });
      socket.on("error", () => {});
      socket.end();
    });
  }

  private async request(
    message: string,
    operation: Civ7TunerFailureOperation,
    timeoutMs = this.config.timeoutMs
  ): Promise<Civ7TunerFrame> {
    this.assertOpen(operation);
    try {
      await this.connect();
    } catch (cause) {
      this.assertOpen(operation);
      throw cause;
    }
    this.assertOpen(operation);
    const socket = this.socket;
    if (!socket || !isReusable(socket)) {
      throw new Civ7TunerFailure({
        operation,
        reason: "connection-lost",
        message: `Civ7 Tuner connection closed before ${message}.`,
      });
    }
    return await this.sendRequest(socket, message, operation, timeoutMs);
  }

  private requestOnEpoch(
    message: string,
    expectedEpoch: number,
    timeoutMs = this.config.timeoutMs,
    onWrite?: () => void
  ): Promise<Civ7TunerFrame> {
    this.assertOpen("execute");
    const socket = this.socket;
    if (this.connectionEpoch !== expectedEpoch || !socket || !isReusable(socket)) {
      throw new Civ7TunerFailure({
        operation: "execute",
        reason: "connection-lost",
        message: "Civ7 Tuner connection changed after state selection; command was not sent.",
        dispatchStatus: "not-dispatched",
        details: { expectedEpoch, observedEpoch: this.connectionEpoch },
      });
    }
    return this.sendRequest(socket, message, "execute", timeoutMs, onWrite);
  }

  private async sendRequest(
    socket: Socket,
    message: string,
    operation: Civ7TunerFailureOperation,
    timeoutMs: number,
    onWrite?: () => void
  ): Promise<Civ7TunerFrame> {
    const listenerId = allocateListenerId();
    const response = new Promise<Civ7TunerFrame>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(listenerId);
        this.consecutiveResponseTimeouts += 1;
        this.totalResponseTimeouts += 1;
        reject(
          new Civ7TunerFailure({
            operation,
            reason: "response-timeout",
            message: `Timed out waiting for Civ7 Tuner response to ${message}.`,
          })
        );
      }, timeoutMs);
      this.pending.set(listenerId, { resolve, reject, timer, message, operation });
    });

    try {
      socket.write(encodeCiv7TunerRequest(listenerId, message));
      onWrite?.();
    } catch (cause) {
      const pending = this.pending.get(listenerId);
      if (pending) clearTimeout(pending.timer);
      this.pending.delete(listenerId);
      throw cause;
    }
    return await response;
  }

  private handleData(socket: Socket, chunk: Buffer): void {
    if (this.socket !== socket) return;
    this.buffer = Buffer.concat([this.buffer, chunk]);
    for (;;) {
      const parsed = parseCiv7TunerFrame(this.buffer);
      if (!parsed) return;
      this.buffer = this.buffer.subarray(parsed.bytesRead);
      const pending = this.pending.get(parsed.frame.listenerId);
      if (!pending) continue;
      clearTimeout(pending.timer);
      this.pending.delete(parsed.frame.listenerId);
      this.consecutiveResponseTimeouts = 0;
      pending.resolve(parsed.frame);
    }
  }

  private invalidateConnection(socket: Socket, failure: Civ7TunerFailure): void {
    if (this.socket !== socket) return;
    this.socket = undefined;
    this.buffer = Buffer.alloc(0);
    for (const [listenerId, pending] of this.pending) {
      clearTimeout(pending.timer);
      this.pending.delete(listenerId);
      pending.reject(
        new Civ7TunerFailure({
          operation: pending.operation,
          reason: failure.reason,
          message: `Civ7 Tuner connection closed while waiting for ${pending.message}.`,
          cause: failure,
        })
      );
    }
  }

  private assertOpen(operation: Civ7TunerFailureOperation): void {
    if (this.released) {
      throw new Civ7TunerFailure({
        operation,
        reason: "connection-lost",
        message: "The Civ7 Tuner session was released.",
      });
    }
  }
}

function isReusable(socket: Socket): boolean {
  return (
    socket.readyState === "open" &&
    !socket.destroyed &&
    !socket.readableEnded &&
    !socket.writableEnded
  );
}

function connectionLost(state: string): Civ7TunerFailure {
  return new Civ7TunerFailure({
    operation: "query-states",
    reason: "connection-lost",
    message: `Civ7 Tuner connection ${state}.`,
  });
}

function failureWithDispatch(
  cause: unknown,
  dispatchStatus: Civ7TunerDispatchStatus
): Civ7TunerFailure {
  if (isCiv7TunerFailure(cause)) {
    return new Civ7TunerFailure({
      operation: "execute",
      reason: cause.reason,
      message: cause.message,
      dispatchStatus: cause.dispatchStatus ?? dispatchStatus,
      details: cause.details,
      cause: cause.cause,
    });
  }
  return new Civ7TunerFailure({
    operation: "execute",
    reason: "connection-failed",
    message: failureMessage(cause),
    dispatchStatus,
    cause,
  });
}

function isCiv7TunerFailure(cause: unknown): cause is Civ7TunerFailure {
  return (
    typeof cause === "object" &&
    cause !== null &&
    "_tag" in cause &&
    cause._tag === "Civ7TunerFailure"
  );
}

function failureMessage(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}
