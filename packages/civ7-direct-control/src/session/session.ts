import type { Socket } from "node:net";

import { Civ7DirectControlError } from "../direct-control-error.js";
import { resolveCiv7DirectControlConfig } from "./config.js";
import {
  encodeCiv7TunerRequest,
  parseCiv7TunerFrame,
  type Civ7TunerFrame,
} from "./framing.js";
import { allocateListenerId } from "./listener-id.js";
import { openCiv7TunerSocket } from "./socket.js";
import {
  selectCiv7TunerState,
  tunerStatesFromParts,
} from "./state.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlEndpoint,
  Civ7DirectControlOptions,
  Civ7DirectControlSessionStats,
  Civ7TunerState,
  Civ7TunerStateSelection,
} from "./types.js";

/** How long a graceful FIN gets before `close()` falls back to `destroy()`. */
const GRACEFUL_CLOSE_TIMEOUT_MS = 1_000;

type PendingCiv7TunerRequest = {
  resolve: (frame: Civ7TunerFrame) => void;
  reject: (err: Error) => void;
  timer: NodeJS.Timeout;
  message: string;
};

type Civ7DirectControlConfig = ReturnType<typeof resolveCiv7DirectControlConfig>;

export class Civ7DirectControlSession {
  private readonly config: Civ7DirectControlConfig;
  private socket: Socket | undefined;
  private endpointValue: Civ7DirectControlEndpoint | undefined;
  private buffer = Buffer.alloc(0);
  private readonly pending = new Map<number, PendingCiv7TunerRequest>();
  private consecutiveResponseTimeouts = 0;

  constructor(options: Civ7DirectControlOptions = {}) {
    this.config = resolveCiv7DirectControlConfig(options);
  }

  get endpoint(): Civ7DirectControlEndpoint | undefined {
    return this.endpointValue;
  }

  /**
   * Health counters observed on this socket — the one vantage point that
   * sees ALL traffic on a shared session (every consumer's requests). A
   * sustained run of response-timeouts is the wedged/busy-tuner signature
   * the studio's backoff gate keys on.
   */
  get stats(): Civ7DirectControlSessionStats {
    return { consecutiveResponseTimeouts: this.consecutiveResponseTimeouts };
  }

  async connect(): Promise<Civ7DirectControlEndpoint> {
    if (this.socket && !this.socket.destroyed && this.endpointValue) {
      return this.endpointValue;
    }

    await this.close();
    const errors: Array<{ host: string; error: string }> = [];
    for (const host of this.config.hosts) {
      try {
        const socket = await openCiv7TunerSocket({
          host,
          port: this.config.port,
          timeoutMs: this.config.timeoutMs,
        });
        this.socket = socket;
        this.endpointValue = { host, port: this.config.port };
        this.buffer = Buffer.alloc(0);
        socket.on("data", (chunk) => this.handleData(chunk));
        socket.once("error", (err) => {
          this.rejectPending(new Civ7DirectControlError("connection-failed", err.message, { cause: err }));
        });
        socket.once("close", () => {
          this.rejectPending(new Civ7DirectControlError("socket-closed", "Civ7 tuner socket closed"));
          this.socket = undefined;
          this.endpointValue = undefined;
        });
        return this.endpointValue;
      } catch (err) {
        errors.push({ host, error: errorMessage(err) });
      }
    }

    throw new Civ7DirectControlError(
      "all-hosts-unavailable",
      `Unable to reach Civ7 tuner socket on ${this.config.hosts.join(", ")}:${this.config.port}`,
      { details: errors },
    );
  }

  /**
   * Graceful close: FIN first (`socket.end()`), so the game can release its
   * descriptor cleanly — abrupt `destroy()` teardown is the suspected driver
   * of the game-side fd leak that wedges the tuner after long sessions. The
   * destroy fallback only fires if the peer never completes the handshake.
   */
  async close(): Promise<void> {
    const socket = this.socket;
    this.socket = undefined;
    this.endpointValue = undefined;
    this.buffer = Buffer.alloc(0);
    this.rejectPending(new Civ7DirectControlError("socket-closed", "Civ7 tuner socket closed"));
    if (!socket || socket.destroyed) return;
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => socket.destroy(), GRACEFUL_CLOSE_TIMEOUT_MS);
      socket.once("close", () => {
        clearTimeout(timer);
        resolve();
      });
      // Post-end errors (peer reset during the handshake) must not surface as
      // unhandled; "close" always follows.
      socket.on("error", () => {});
      socket.end();
    });
  }

  async queryStates(options: { timeoutMs?: number } = {}): Promise<ReadonlyArray<Civ7TunerState>> {
    const response = await this.request("LSQ:", options.timeoutMs);
    return tunerStatesFromParts(response.parts);
  }

  async executeCommand(options: {
    command: string;
    state?: Civ7TunerStateSelection;
    timeoutMs?: number;
  }): Promise<Civ7CommandResult> {
    const command = options.command.trim();
    if (!command) {
      throw new Civ7DirectControlError("command-failed", "Civ7 command must not be empty");
    }
    const states = await this.queryStates({ timeoutMs: options.timeoutMs });
    const state = selectCiv7TunerState(states, options.state);
    const response = await this.request(`CMD:${state.id}:${command}`, options.timeoutMs);
    const endpoint = this.endpoint;
    if (!endpoint) {
      throw new Civ7DirectControlError("socket-closed", "Civ7 tuner socket closed after command completed");
    }
    return {
      host: endpoint.host,
      port: endpoint.port,
      state,
      output: response.parts,
    };
  }

  async request(message: string, timeoutMs = this.config.timeoutMs): Promise<Civ7TunerFrame> {
    await this.connect();
    const socket = this.socket;
    if (!socket || socket.destroyed) {
      throw new Civ7DirectControlError("socket-closed", `Civ7 tuner socket is closed before ${message}`);
    }
    const listenerId = allocateListenerId();
    const response = new Promise<Civ7TunerFrame>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(listenerId);
        this.consecutiveResponseTimeouts += 1;
        reject(
          new Civ7DirectControlError(
            "response-timeout",
            `Timed out waiting for Civ7 tuner response to ${message}`,
          ),
        );
      }, timeoutMs);
      this.pending.set(listenerId, { resolve, reject, timer, message });
    });
    socket.write(encodeCiv7TunerRequest(listenerId, message));
    return await response;
  }

  private handleData(chunk: Buffer): void {
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

  private rejectPending(err: Civ7DirectControlError): void {
    for (const [listenerId, pending] of this.pending) {
      clearTimeout(pending.timer);
      this.pending.delete(listenerId);
      pending.reject(
        new Civ7DirectControlError(
          err.code,
          err.message === "Civ7 tuner socket closed"
            ? `Civ7 tuner socket closed while waiting for ${pending.message}`
            : err.message,
          { cause: err, details: { message: pending.message } },
        ),
      );
    }
  }
}

export async function withCiv7DirectControlSession<T>(
  options: Civ7DirectControlOptions,
  run: (session: Civ7DirectControlSession) => Promise<T>,
): Promise<T> {
  // Caller-owned shared session: reuse, never close — the owner (e.g. the
  // studio daemon's Effect-scoped service) manages acquisition/release.
  if (options.session) {
    return await run(options.session);
  }
  const session = new Civ7DirectControlSession(options);
  try {
    return await run(session);
  } finally {
    await session.close();
  }
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
