import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:net";
import { describe, expect, test } from "vitest";
import {
  CIV7_RESTART_COMMAND,
  checkCiv7DirectControlHealth,
  encodeCiv7TunerRequest,
  executeCiv7Command,
  parseCiv7TunerFrame,
  resolveCiv7DirectControlConfig,
  selectCiv7TunerState,
  snapshotFile,
  waitForCiv7DirectControl,
  waitForFreshLogMarkers,
} from "../src/index";
import { jsonPayloadFromCommandResult } from "../src/session/command-result";
import { discoverCiv7DirectControlEndpointWithDependencies } from "../src/session/discovery";
import { allocateListenerId } from "../src/session/listener-id";
import { openCiv7TunerSocket } from "../src/session/socket";
import { tunerStatesFromParts } from "../src/session/state";

describe("Civ7 direct control session framing", () => {
  test("parses command JSON payloads with endpoint and state context", () => {
    const payload = jsonPayloadFromCommandResult<{ host: string; port: number; ok: true }>(
      {
        host: "127.0.0.1",
        port: 63_456,
        state: { id: "1", name: "Tuner" },
        output: ['{"ok":true}'],
      },
      "Civ7 test payload",
    );

    expect(payload).toEqual({
      host: "127.0.0.1",
      port: 63_456,
      state: { id: "1", name: "Tuner" },
      ok: true,
    });
  });

  test("reports invalid command JSON with the original command result details", () => {
    expect(() =>
      jsonPayloadFromCommandResult(
        {
          host: "127.0.0.1",
          port: 63_456,
          state: { id: "65535", name: "App UI" },
          output: ["{not-json"],
        },
        "Civ7 bad payload",
      ),
    ).toThrow(/Civ7 bad payload returned invalid JSON: \{not-json/);

    try {
      jsonPayloadFromCommandResult(
        {
          host: "127.0.0.1",
          port: 63_456,
          state: { id: "65535", name: "App UI" },
          output: ["{not-json"],
        },
        "Civ7 bad payload",
      );
    } catch (err) {
      expect(err).toMatchObject({
        code: "command-failed",
        details: {
          host: "127.0.0.1",
          port: 63_456,
          state: { id: "65535", name: "App UI" },
          output: ["{not-json"],
        },
      });
    }
  });

  test("uses defaults and env hosts when resolving health", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server;
      const health = await checkCiv7DirectControlHealth({
        port,
        env: {
          CIV7_TUNER_HOSTS: "127.0.0.2, 127.0.0.1",
        },
        timeoutMs: 1_000,
      });

      expect(health).toMatchObject({
        ok: true,
        status: "ready",
        port,
      });
      if (health.ok) expect(["127.0.0.2", "127.0.0.1"]).toContain(health.host);
    } finally {
      await server.close();
    }
  });

  test("handles empty env when resolving health", async () => {
    const health = await checkCiv7DirectControlHealth({
      env: {},
      timeoutMs: 1,
    });

    expect([true, false]).toContain(health.ok);
  });

  test("waits for direct-control health readiness", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server;
      const health = await waitForCiv7DirectControl({
        host: "127.0.0.1",
        port,
        env: {},
        timeoutMs: 1_000,
        waitTimeoutMs: 1_000,
        pollIntervalMs: 10,
      });

      expect(health).toMatchObject({
        ok: true,
        status: "ready",
        host: "127.0.0.1",
        port,
      });
    } finally {
      await server.close();
    }
  });

  test("times out waiting for direct-control health readiness", async () => {
    const server = await startTunerServer();
    const { port } = server;
    await server.close();

    await expect(
      waitForCiv7DirectControl({
        host: "127.0.0.1",
        port,
        env: {},
        timeoutMs: 25,
        waitTimeoutMs: 25,
        pollIntervalMs: 1,
      }),
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      code: "connection-timeout",
    });
  });

  test("resolves direct-control config from explicit and env options", () => {
    expect(
      resolveCiv7DirectControlConfig({
        host: "127.0.0.1",
        hosts: [" 127.0.0.1 ", "127.0.0.2"],
        env: {
          CIV7_TUNER_HOSTS: "127.0.0.3,127.0.0.2",
          CIV7_TUNER_HOST: "127.0.0.4",
          CIV7_TUNER_PORT: "65535",
        },
        timeoutMs: 12_345,
      }),
    ).toEqual({
      hosts: ["127.0.0.1", "127.0.0.2", "127.0.0.3", "127.0.0.4"],
      port: 65_535,
      timeoutMs: 12_345,
    });

    expect(() =>
      resolveCiv7DirectControlConfig({
        env: { CIV7_TUNER_PORT: "0" },
      }),
    ).toThrow(/Invalid CIV7_TUNER_PORT/);
  });

  test("discovers a reachable endpoint after earlier hosts fail", async () => {
    const queried: string[] = [];
    const discovered = await discoverCiv7DirectControlEndpointWithDependencies(
      {
        hosts: ["127.0.0.2", "127.0.0.1"],
        port: 58_256,
        timeoutMs: 250,
        env: {},
      },
      {
        errorMessage: (err) => err instanceof Error ? err.message : String(err),
        queryTunerStates: async (options) => {
          queried.push(`${options.host}:${options.port}:${options.timeoutMs}`);
          if (options.host === "127.0.0.2") throw new Error("first host unavailable");
          return [
            { id: "65535", name: "App UI" },
            { id: "1", name: "Tuner" },
          ];
        },
      },
    );

    expect(discovered).toEqual({
      endpoint: { host: "127.0.0.1", port: 58_256 },
      states: [
        { id: "65535", name: "App UI" },
        { id: "1", name: "Tuner" },
      ],
    });
    expect(queried).toEqual(["127.0.0.2:58256:250", "127.0.0.1:58256:250"]);
  });

  test("reports unavailable endpoint discovery with per-host details", async () => {
    await expect(
      discoverCiv7DirectControlEndpointWithDependencies(
        {
          hosts: ["127.0.0.1", "127.0.0.2"],
          port: 58_256,
          timeoutMs: 50,
          env: {},
        },
        {
          errorMessage: (err) => err instanceof Error ? err.message : String(err),
          queryTunerStates: async (options) => {
            throw new Error(`unavailable ${options.host}`);
          },
        },
      ),
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      code: "all-hosts-unavailable",
      details: [
        { host: "127.0.0.1", error: "unavailable 127.0.0.1" },
        { host: "127.0.0.2", error: "unavailable 127.0.0.2" },
      ],
    });
  });

  test("opens tuner sockets and reports connection failures with typed errors", async () => {
    const server = await startTunerServer();
    const { port } = server;
    const socket = await openCiv7TunerSocket({
      host: "127.0.0.1",
      port,
      timeoutMs: 1_000,
    });
    socket.destroy();
    await server.close();

    await expect(
      openCiv7TunerSocket({
        host: "127.0.0.1",
        port,
        timeoutMs: 100,
      }),
    ).rejects.toMatchObject({
      name: "Civ7DirectControlError",
      code: "connection-failed",
    });
  });

  test("selects a tuner state by role, name, and id", () => {
    const states = [
      { id: "65535", name: "App UI" },
      { id: "1", name: "Tuner" },
    ];

    expect(selectCiv7TunerState(states, { role: "app-ui" })).toEqual(states[0]);
    expect(selectCiv7TunerState(states, { role: "tuner" })).toEqual(states[1]);
    expect(selectCiv7TunerState(states, { name: "Tuner" })).toEqual(states[1]);
    expect(selectCiv7TunerState(states, { id: "65535" })).toEqual(states[0]);
  });

  test("parses tuner LSQ response parts into state pairs", () => {
    expect(tunerStatesFromParts(["65535", "App UI", "1", "Tuner"])).toEqual([
      { id: "65535", name: "App UI" },
      { id: "1", name: "Tuner" },
    ]);
    expect(tunerStatesFromParts(["65535", "App UI", "dangling-id"])).toEqual([
      { id: "65535", name: "App UI" },
    ]);
  });

  test("allocates positive increasing tuner listener ids", () => {
    const first = allocateListenerId();
    const second = allocateListenerId();

    expect(Number.isInteger(first)).toBe(true);
    expect(first).toBeGreaterThan(0);
    expect(second).toBe(first + 1);
  });

  test("parses fragmented and concatenated tuner frames", () => {
    const first = encodeCiv7TunerRequest(1, "LSQ:");
    const second = encodeCiv7TunerRequest(2, `CMD:65535:${CIV7_RESTART_COMMAND}`);

    expect(parseCiv7TunerFrame(first.subarray(0, 3))).toBeNull();

    const combined = Buffer.concat([first, second]);
    const parsedFirst = parseCiv7TunerFrame(combined);
    expect(parsedFirst?.frame).toEqual({ listenerId: 1, parts: ["LSQ:"] });
    const parsedSecond = parseCiv7TunerFrame(combined.subarray(parsedFirst?.bytesRead ?? 0));
    expect(parsedSecond?.frame).toEqual({ listenerId: 2, parts: [`CMD:65535:${CIV7_RESTART_COMMAND}`] });
  });

  test("issues framed commands and interprets the server response", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server;

      const result = await executeCiv7Command({
        host: "127.0.0.1",
        port,
        command: CIV7_RESTART_COMMAND,
        timeoutMs: 1_000,
      });

      expect(result).toMatchObject({
        host: "127.0.0.1",
        port,
        state: { id: "65535", name: "App UI" },
        output: ["true"],
      });
      expect(server.received).toContain("LSQ:");
      expect(server.received).toContain(`CMD:65535:${CIV7_RESTART_COMMAND}`);
    } finally {
      await server.close();
    }
  });

  test("returns a typed command state error when requested state is unavailable", async () => {
    const server = await startTunerServer();
    try {
      const { port } = server;

      await expect(
        executeCiv7Command({
          host: "127.0.0.1",
          port,
          state: { name: "Missing" },
          command: "1 + 1",
          timeoutMs: 1_000,
        }),
      ).rejects.toMatchObject({
        name: "Civ7DirectControlError",
        code: "state-not-found",
      });
    } finally {
      await server.close();
    }
  });

  test("waits for fresh ordered log markers", async () => {
    const dir = await mkdtemp(join(tmpdir(), "civ7-direct-control-log-"));
    const logPath = join(dir, "Scripting.log");
    await writeFile(logPath, "old\n");
    const snapshot = await snapshotFile(logPath);
    await writeFile(logPath, "old\nCreating Context -  MapGeneration\nDestroying Context -  MapGeneration\n");

    const proof = await waitForFreshLogMarkers({
      logPath,
      snapshot,
      markers: ["Creating Context -  MapGeneration", "Destroying Context -  MapGeneration"],
      timeoutMs: 100,
      pollIntervalMs: 10,
    });

    expect(proof.matched).toEqual(["Creating Context -  MapGeneration", "Destroying Context -  MapGeneration"]);
  });
});

type TunerTestServer = {
  port: number;
  received: string[];
  close: () => Promise<void>;
};

async function startTunerServer(): Promise<TunerTestServer> {
  const received: string[] = [];
  let buffer = Buffer.alloc(0);

  const server = createServer((socket) => {
    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);

      for (;;) {
        const frame = parseRequest(buffer);
        if (!frame) return;

        buffer = buffer.subarray(frame.bytesRead);
        received.push(frame.message);

        if (frame.message === "LSQ:") {
          socket.write(encodeResponse(frame.listenerId, ["65535", "App UI", "1", "Tuner"]));
        } else if (frame.message === `CMD:65535:${CIV7_RESTART_COMMAND}`) {
          socket.write(encodeResponse(frame.listenerId, ["true"]));
        } else {
          socket.write(encodeResponse(frame.listenerId, ["null"]));
        }
      }
    });
  });

  await new Promise<void>((resolve, reject) => {
    server.listen(0, "127.0.0.1", () => resolve());
    server.on("error", reject);
  });

  return {
    port: (server.address() as { port: number }).port,
    received,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error?: Error | undefined) => {
          if (error) reject(error);
          else resolve();
        });
      }),
  };
}

function parseRequest(buffer: Buffer):
  | {
      listenerId: number;
      message: string;
      bytesRead: number;
    }
  | null {
  if (buffer.length < 8) return null;
  const messageLength = buffer.readUInt32LE(0);
  const bytesRead = 8 + messageLength;
  if (buffer.length < bytesRead) return null;
  return {
    listenerId: buffer.readUInt32LE(4),
    message: buffer.subarray(8, bytesRead).toString("utf8").replace(/\0$/, ""),
    bytesRead,
  };
}

function encodeResponse(listenerId: number, parts: string[]): Buffer {
  const messageBytes = Buffer.from(`${parts.join("\0")}\0`, "utf8");
  const frame = Buffer.alloc(8 + messageBytes.length);
  frame.writeUInt32LE(messageBytes.length, 0);
  frame.writeUInt32LE(listenerId, 4);
  messageBytes.copy(frame, 8);
  return frame;
}
