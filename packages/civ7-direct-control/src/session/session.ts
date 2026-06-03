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
  Civ7TunerState,
  Civ7TunerStateSelection,
} from "./types.js";

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

  constructor(options: Civ7DirectControlOptions = {}) {
    this.config = resolveCiv7DirectControlConfig(options);
  }

  get endpoint(): Civ7DirectControlEndpoint | undefined {
    return this.endpointValue;
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

  async close(): Promise<void> {
    const socket = this.socket;
    this.socket = undefined;
    this.endpointValue = undefined;
    this.buffer = Buffer.alloc(0);
    this.rejectPending(new Civ7DirectControlError("socket-closed", "Civ7 tuner socket closed"));
    if (socket && !socket.destroyed) socket.destroy();
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

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
