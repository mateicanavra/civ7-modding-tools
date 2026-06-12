import { once } from "node:events";
import { type AddressInfo, createServer, type Socket } from "node:net";
import { describe, expect, test } from "vitest";
import { Value } from "typebox/value";

import {
  Civ7CinematicDismissalInputSchema,
  Civ7CinematicDismissalResultSchema,
  dismissCiv7CinematicMoments,
  encodeCiv7TunerRequest,
  parseCiv7TunerFrame,
} from "../src/index";

type CinematicProbePayload = {
  cinematicPresent: boolean;
  dismissedTitle: string | null;
  activate: { ok: boolean; value?: boolean; error?: string } | null;
  click: { ok: boolean; value?: boolean; error?: string } | null;
  remainingSelectorCount: number;
};

type FakeCinematicServer = {
  received: string[];
  address(): AddressInfo;
  close(): Promise<void>;
};

describe("cinematic-moment dismissal", () => {
  test("exports bounded input and result schemas", () => {
    expect(Value.Check(Civ7CinematicDismissalInputSchema, {
      maxDismissals: 20,
      settleMs: 2_000,
      restoreCameraPlot: { x: 31, y: 7 },
    })).toBe(true);
    expect(Value.Check(Civ7CinematicDismissalInputSchema, { maxDismissals: 0 })).toBe(false);
    expect(Value.Check(Civ7CinematicDismissalInputSchema, { maxDismissals: 101 })).toBe(false);
    expect(Value.Check(Civ7CinematicDismissalInputSchema, { settleMs: -1 })).toBe(false);
    expect(Value.Check(Civ7CinematicDismissalInputSchema, { rawCommand: "Camera.popCamera()" })).toBe(false);

    expect(Value.Check(Civ7CinematicDismissalResultSchema, {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      dismissals: [{ iteration: 1, title: "Zhangjiajie" }],
      drained: true,
      iterations: 2,
      domClearCount: 0,
      cameraRestore: { plot: { x: 31, y: 7 }, lookAt: { ok: true, value: true } },
      notes: ["..."],
    })).toBe(true);
    expect(Value.Check(Civ7CinematicDismissalResultSchema, {
      host: "127.0.0.1",
      port: 4318,
      state: { id: "65535", name: "App UI" },
      dismissals: [],
      drained: true,
      iterations: 1,
      domClearCount: 0,
      cameraRestore: null,
      notes: [],
      command: "document.querySelectorAll",
    })).toBe(false);
  });

  test("drains queued cinematics by title, then verifies the DOM is clear", async () => {
    const server = await startCinematicTunerServer({
      probes: [
        presentProbe("Zhangjiajie", 4),
        presentProbe("Iguazú Falls", 4),
        absentProbe(),
      ],
      domClearCount: 0,
    });
    try {
      const { port } = server.address();
      const result = await dismissCiv7CinematicMoments(
        { settleMs: 0 },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
      );

      expect(result.dismissals).toEqual([
        { iteration: 1, title: "Zhangjiajie" },
        { iteration: 2, title: "Iguazú Falls" },
      ]);
      expect(result.iterations).toBe(3);
      expect(result.drained).toBe(true);
      expect(result.domClearCount).toBe(0);
      expect(result.cameraRestore).toBeNull();
      expect(result.state).toEqual({ id: "65535", name: "App UI" });
      expect(Value.Check(Civ7CinematicDismissalResultSchema, result)).toBe(true);

      const probeCommands = server.received.filter((message) => message.includes("dismissCinematicMoment"));
      expect(probeCommands).toHaveLength(3);
      expect(probeCommands[0]).toContain("fxs-hero-button.cinematic-moment__close-button");
      expect(probeCommands[0]).toContain(".cinematic-moment_title-header");
      expect(probeCommands[0]).toContain('new CustomEvent("action-activate", { bubbles: true })');
      expect(probeCommands[0]).toContain("closeButton.click()");
      const drainCommands = server.received.filter((message) => message.includes("readCinematicDrainCheck"));
      expect(drainCommands).toHaveLength(1);
      expect(drainCommands[0]).toContain("[class*=cinematic-moment]");
      expect(server.received.some((message) => message.includes("restoreCinematicCamera"))).toBe(false);
      expect(server.received.some((message) => message.includes("popCamera"))).toBe(false);
      expect(server.received.some((message) => message.includes("sendRequest"))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("stops at maxDismissals when cinematics keep mounting", async () => {
    const server = await startCinematicTunerServer({
      probes: [],
      fallbackProbe: presentProbe("Uluru", 4),
      domClearCount: 3,
    });
    try {
      const { port } = server.address();
      const result = await dismissCiv7CinematicMoments(
        { maxDismissals: 2, settleMs: 0 },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
      );

      expect(result.dismissals).toEqual([
        { iteration: 1, title: "Uluru" },
        { iteration: 2, title: "Uluru" },
      ]);
      expect(result.iterations).toBe(2);
      expect(result.drained).toBe(false);
      expect(result.domClearCount).toBe(3);
      expect(server.received.filter((message) => message.includes("dismissCinematicMoment"))).toHaveLength(2);
    } finally {
      await server.close();
    }
  });

  test("returns the zero-cinematic fast path without dismissing anything", async () => {
    const server = await startCinematicTunerServer({
      probes: [absentProbe()],
      domClearCount: 0,
    });
    try {
      const { port } = server.address();
      const result = await dismissCiv7CinematicMoments(
        { settleMs: 0 },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
      );

      expect(result.dismissals).toEqual([]);
      expect(result.iterations).toBe(1);
      expect(result.drained).toBe(true);
      expect(result.domClearCount).toBe(0);
      expect(result.cameraRestore).toBeNull();
      expect(server.received.filter((message) => message.includes("dismissCinematicMoment"))).toHaveLength(1);
      expect(server.received.filter((message) => message.includes("readCinematicDrainCheck"))).toHaveLength(1);
      expect(server.received.some((message) => message.includes("restoreCinematicCamera"))).toBe(false);
    } finally {
      await server.close();
    }
  });

  test("optionally restores the camera with Camera.lookAtPlot after draining", async () => {
    const server = await startCinematicTunerServer({
      probes: [presentProbe("Gullfoss", 4), absentProbe()],
      domClearCount: 0,
    });
    try {
      const { port } = server.address();
      const result = await dismissCiv7CinematicMoments(
        { settleMs: 0, restoreCameraPlot: { x: 31, y: 7 } },
        { host: "127.0.0.1", port, timeoutMs: 1_000 },
      );

      expect(result.dismissals).toEqual([{ iteration: 1, title: "Gullfoss" }]);
      expect(result.drained).toBe(true);
      expect(result.cameraRestore).toEqual({
        plot: { x: 31, y: 7 },
        lookAt: { ok: true, value: true },
      });
      const cameraCommands = server.received.filter((message) => message.includes("restoreCinematicCamera"));
      expect(cameraCommands).toHaveLength(1);
      expect(cameraCommands[0]).toContain("Camera.lookAtPlot(plot.x, plot.y)");
      expect(cameraCommands[0]).toContain('{"x":31,"y":7}');
      expect(cameraCommands[0]).toContain("interface-modes.js");
      expect(cameraCommands[0]).toContain("console.log");
      expect(cameraCommands[0]).not.toContain("popCamera");
    } finally {
      await server.close();
    }
  });

  test("rejects out-of-bounds inputs before opening any command", async () => {
    await expect(dismissCiv7CinematicMoments({ maxDismissals: 0 })).rejects.toMatchObject({
      code: "command-failed",
    });
    await expect(dismissCiv7CinematicMoments({ maxDismissals: 101 })).rejects.toMatchObject({
      code: "command-failed",
    });
    await expect(dismissCiv7CinematicMoments({ settleMs: -1 })).rejects.toMatchObject({
      code: "command-failed",
    });
    await expect(dismissCiv7CinematicMoments({ settleMs: 0, restoreCameraPlot: { x: -1, y: 0 } })).rejects.toMatchObject({
      code: "command-failed",
    });
  });
});

function presentProbe(title: string, remainingSelectorCount: number): CinematicProbePayload {
  return {
    cinematicPresent: true,
    dismissedTitle: title,
    activate: { ok: true, value: true },
    click: { ok: true, value: true },
    remainingSelectorCount,
  };
}

function absentProbe(): CinematicProbePayload {
  return {
    cinematicPresent: false,
    dismissedTitle: null,
    activate: null,
    click: null,
    remainingSelectorCount: 0,
  };
}

async function startCinematicTunerServer(options: {
  probes: CinematicProbePayload[];
  fallbackProbe?: CinematicProbePayload;
  domClearCount: number;
  cameraLookAt?: { ok: boolean; value?: boolean; error?: string };
}): Promise<FakeCinematicServer> {
  const probes = [...options.probes];
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
        const message = parsed.frame.parts.join("\0");
        received.push(message);
        const respond = (parts: string[]) => {
          socket.write(encodeCiv7TunerRequest(parsed.frame.listenerId, parts.join("\0")));
        };
        if (message === "LSQ:") {
          respond(["65535", "App UI", "1", "Tuner"]);
        } else if (message.includes("dismissCinematicMoment")) {
          const payload = probes.shift() ?? options.fallbackProbe ?? absentProbe();
          respond([JSON.stringify(payload)]);
        } else if (message.includes("readCinematicDrainCheck")) {
          respond([JSON.stringify({ domClearCount: options.domClearCount })]);
        } else if (message.includes("restoreCinematicCamera")) {
          respond([JSON.stringify({ lookAt: options.cameraLookAt ?? { ok: true, value: true } })]);
        } else {
          respond(["null"]);
        }
      }
    });
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  return {
    received,
    address: () => server.address() as AddressInfo,
    close: async () => {
      for (const socket of sockets) socket.destroy();
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    },
  };
}
