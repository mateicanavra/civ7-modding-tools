import { createServer, type Server } from "node:http";
import { afterEach, describe, expect, test } from "vitest";

import {
  createStudioRecipeDagClient,
  STUDIO_RECIPE_DAG_ORPC_PATH,
  type RecipeDagResult,
} from "../../src/features/recipeDag/client";
import { createStudioRecipeDagOrpcMiddleware } from "../../src/server/recipeDag/orpc";
import { RecipeDagNotFound } from "../../src/server/recipeDag/service";

const openServers: Server[] = [];

afterEach(async () => {
  await Promise.all(openServers.splice(0).map((server) => closeServer(server)));
});

describe("Studio recipe DAG oRPC edge", () => {
  test("loads the selected recipe DAG through RPCLink and RPCHandler", async () => {
    const calls: string[] = [];
    const middleware = createStudioRecipeDagOrpcMiddleware({
      recipeDagService: {
        async getRecipeDag(recipeId) {
          calls.push(recipeId);
          return recipeDagResult(recipeId);
        },
      },
    });
    const origin = await listen((req, res) => {
      void middleware(req, res, () => {
        res.statusCode = 404;
        res.end("not found");
      });
    });

    const client = createStudioRecipeDagClient({
      url: `${origin}${STUDIO_RECIPE_DAG_ORPC_PATH}`,
    });
    const result = await client.recipeDag.get({ recipeId: "mod-swooper-maps/standard" });

    expect(calls).toEqual(["mod-swooper-maps/standard"]);
    expect(result).toMatchObject({
      recipeKey: "mod-swooper-maps/standard",
      stages: [
        {
          stageId: "shape",
          steps: [
            {
              stepId: "seed",
              artifactProvides: [{ id: "seed-grid" }],
            },
          ],
        },
        {
          stageId: "climate",
          artifactRequires: [{ id: "seed-grid" }],
        },
      ],
      edges: [
        {
          artifact: { id: "seed-grid" },
          from: { stageId: "shape" },
          to: { stageId: "climate" },
          internal: false,
        },
      ],
    });
  });

  test("passes non-DAG paths through to later Studio middleware", async () => {
    const middleware = createStudioRecipeDagOrpcMiddleware({
      recipeDagService: {
        async getRecipeDag(recipeId) {
          return recipeDagResult(recipeId);
        },
      },
    });
    const origin = await listen((req, res) => {
      void middleware(req, res, () => {
        res.statusCode = 404;
        res.end("not found");
      });
    });

    const res = await fetch(`${origin}/api/recipe-dag/not-rpc`);

    expect(res.status).toBe(404);
    await expect(res.text()).resolves.toBe("not found");
  });

  test("maps missing recipes to the public recipe DAG not-found error", async () => {
    const middleware = createStudioRecipeDagOrpcMiddleware({
      recipeDagService: {
        async getRecipeDag(recipeId) {
          throw new RecipeDagNotFound(recipeId);
        },
      },
    });
    const origin = await listen((req, res) => {
      void middleware(req, res, () => {
        res.statusCode = 404;
        res.end("not found");
      });
    });

    const client = createStudioRecipeDagClient({
      url: `${origin}${STUDIO_RECIPE_DAG_ORPC_PATH}`,
    });

    await expect(client.recipeDag.get({ recipeId: "missing/recipe" })).rejects.toMatchObject({
      code: "RECIPE_DAG_RECIPE_NOT_FOUND",
    });
  });
});

async function listen(
  handler: Parameters<typeof createServer>[0],
): Promise<string> {
  const server = createServer(handler);
  openServers.push(server);
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", reject);
      resolve();
    });
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Expected TCP server address");
  }
  return `http://127.0.0.1:${address.port}`;
}

async function closeServer(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function recipeDagResult(recipeId: string): RecipeDagResult {
  return {
    recipeId: "standard",
    recipeKey: recipeId,
    namespace: "mod-swooper-maps",
    title: "Swooper Maps / Standard",
    phases: [
      {
        id: "shape",
        order: 0,
        stageIds: ["shape"],
        stepCount: 1,
      },
      {
        id: "climate",
        order: 1,
        stageIds: ["climate"],
        stepCount: 1,
      },
    ],
    stages: [
      {
        id: "shape",
        stageId: "shape",
        order: 0,
        phases: ["shape"],
        steps: [
          {
            id: "mod-swooper-maps.standard.shape.seed",
            stageId: "shape",
            stepId: "seed",
            fullStepId: "mod-swooper-maps.standard.shape.seed",
            order: 0,
            orderInStage: 0,
            phase: "shape",
            artifactRequires: [],
            artifactProvides: [{ id: "seed-grid", name: "Seed grid" }],
            tagRequires: [],
            tagProvides: ["shape.seeded"],
          },
        ],
        artifactRequires: [],
        artifactProvides: [{ id: "seed-grid", name: "Seed grid" }],
        inboundArtifactEdgeCount: 0,
        outboundArtifactEdgeCount: 1,
        internalArtifactEdgeCount: 0,
        diagnosticCount: 0,
      },
      {
        id: "climate",
        stageId: "climate",
        order: 1,
        phases: ["climate"],
        steps: [
          {
            id: "mod-swooper-maps.standard.climate.temperature",
            stageId: "climate",
            stepId: "temperature",
            fullStepId: "mod-swooper-maps.standard.climate.temperature",
            order: 1,
            orderInStage: 0,
            phase: "climate",
            artifactRequires: [{ id: "seed-grid", name: "Seed grid" }],
            artifactProvides: [],
            tagRequires: ["shape.seeded"],
            tagProvides: [],
          },
        ],
        artifactRequires: [{ id: "seed-grid", name: "Seed grid" }],
        artifactProvides: [],
        inboundArtifactEdgeCount: 1,
        outboundArtifactEdgeCount: 0,
        internalArtifactEdgeCount: 0,
        diagnosticCount: 0,
      },
    ],
    edges: [
      {
        id: "mod-swooper-maps.standard.shape.seed->mod-swooper-maps.standard.climate.temperature:seed-grid",
        artifact: { id: "seed-grid", name: "Seed grid" },
        from: {
          stageId: "shape",
          stepId: "seed",
          fullStepId: "mod-swooper-maps.standard.shape.seed",
        },
        to: {
          stageId: "climate",
          stepId: "temperature",
          fullStepId: "mod-swooper-maps.standard.climate.temperature",
        },
        internal: false,
      },
    ],
    diagnostics: [],
  };
}
