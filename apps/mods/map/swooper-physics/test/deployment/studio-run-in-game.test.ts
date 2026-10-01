import { describe, expect, test } from "bun:test";
import { Civ7ControlOrpcContract } from "@civ7/control-orpc/contract";
import { ORPCError } from "@orpc/client";
import { encodeBoundedJsonLogLines } from "@swooper/mapgen-core/lib/log";
import {
  admitStudioRunInGameLiveMutationArgs,
  buildStudioRunInGameLiveStartInput,
  buildSwooperMapScriptDeploymentStage,
  hasMapgenCompletionForSeed,
  type MapScriptFileIdentity,
  parseStudioRunInGameLiveArgs,
  resolveSwooperMapScriptPaths,
  serializeVerifierError,
} from "../live/studio-run-in-game.live.test";

const identity = (path: string, sha256: string): MapScriptFileIdentity => ({
  path,
  sha256,
  sizeBytes: 100,
  mtimeMs: 1,
  mtimeIso: "2026-06-10T00:00:00.000Z",
});

describe("studio run-in-game live verifier", () => {
  test("admits only complete digest-valid completion evidence for the requested map seed", () => {
    const lines = encodeBoundedJsonLogLines({
      prefix: "[SWOOPER_MOD]",
      marker: "[mapgen-complete]",
      payload: { seed: 42, setup: "standard".repeat(600) },
      maxLineLength: 320,
    });
    const corrupted = [...lines];
    corrupted[1] = corrupted[1]?.replace("standard", "fractured") ?? "";

    expect(lines.length).toBeGreaterThan(2);
    expect(hasMapgenCompletionForSeed(lines.slice(0, -1).join("\n"), 42)).toBe(false);
    expect(hasMapgenCompletionForSeed(corrupted.join("\n"), 42)).toBe(false);
    expect(hasMapgenCompletionForSeed(lines.join("\n"), 41)).toBe(false);
    expect(hasMapgenCompletionForSeed(lines.join("\n"), 42)).toBe(true);
  });

  test("admits distinct signed map and game seed flags for a mutating launch", () => {
    const parsed = parseStudioRunInGameLiveArgs([
      "--mutate",
      "--map-script",
      "{swooper-maps}/maps/swooper-earthlike.js",
      "--map-size",
      "MAPSIZE_STANDARD",
      "--seed",
      "-123",
      "--game-seed",
      "-456",
    ]);

    expect(admitStudioRunInGameLiveMutationArgs(parsed)).toMatchObject({
      mapSeed: -123,
      gameSeed: -456,
    });
  });

  test("requires an explicit game seed and rejects seed overflow before live work", () => {
    expect(() =>
      admitStudioRunInGameLiveMutationArgs(
        parseStudioRunInGameLiveArgs([
          "--mutate",
          "--map-script",
          "{swooper-maps}/maps/swooper-earthlike.js",
          "--map-size",
          "MAPSIZE_STANDARD",
          "--seed",
          "123",
        ])
      )
    ).toThrow("--game-seed");
    expect(() => parseStudioRunInGameLiveArgs(["--seed", "2147483648"])).toThrow(
      "--seed must be an integer from -2147483648 to 2147483647"
    );
  });

  test.each([
    undefined,
    6,
  ])("projects saved setup identity without inventing players; explicit override %s", async (playerCount) => {
    const savedConfig = {
      id: "tot-nomodsexceptmaps",
      displayName: "ToT_NoModsExceptMaps",
      fileName: "ToT_NoModsExceptMaps.Civ7Cfg",
      path: "/Civ7/Saves/Single/ToT_NoModsExceptMaps.Civ7Cfg",
      summary: { playerCount: 12 },
    };
    const args = admitStudioRunInGameLiveMutationArgs(
      parseStudioRunInGameLiveArgs([
        "--mutate",
        "--saved-config",
        savedConfig.displayName,
        "--map-script",
        "{swooper-maps}/maps/swooper-earthlike.js",
        "--map-size",
        "MAPSIZE_HUGE",
        "--seed",
        "1018",
        "--game-seed",
        "1018",
        ...(playerCount === undefined ? [] : ["--player-count", String(playerCount)]),
      ])
    );
    const input = buildStudioRunInGameLiveStartInput(args, savedConfig);
    expect(input.savedConfig).toEqual({
      id: savedConfig.id,
      displayName: savedConfig.displayName,
      fileName: savedConfig.fileName,
    });
    expect(input.playerOptions).toEqual([]);
    expect(input.playerCount).toBe(playerCount);
    if (playerCount === undefined) expect(input).not.toHaveProperty("playerCount");
    expect(savedConfig.summary.playerCount).toBe(12);

    const schema = Civ7ControlOrpcContract.lifecycle.singlePlayer.start["~orpc"].inputSchema;
    if (!schema) throw new Error("Lifecycle input schema is unavailable.");
    expect((await schema["~standard"].validate(input)).issues).toBeUndefined();
    expect(
      (
        await schema["~standard"].validate({
          ...input,
          savedConfig: { ...input.savedConfig, path: savedConfig.path },
        })
      ).issues
    ).toBeDefined();
  });

  test("projects bounded defined-error evidence without provider internals", () => {
    const error = new ORPCError("LIFECYCLE_MUTATION_UNCERTAIN", {
      defined: true,
      status: 502,
      message: "Lifecycle mutation outcome is uncertain.",
      data: {
        procedureKey: "lifecycle.singlePlayer.start",
        source: "direct-control-facade",
        step: "host-game",
        detail: "direct-control/response-timeout",
        correlationId: "run-42",
        noRepeat: true,
      },
      cause: new Error("raw provider payload"),
    });
    const projected = serializeVerifierError(error);

    expect(projected).toEqual({
      name: "Error",
      code: "LIFECYCLE_MUTATION_UNCERTAIN",
      status: 502,
      message: "Lifecycle mutation outcome is uncertain.",
      data: {
        procedureKey: "lifecycle.singlePlayer.start",
        source: "direct-control-facade",
        step: "host-game",
        detail: "direct-control/response-timeout",
        correlationId: "run-42",
        noRepeat: true,
      },
    });
    const serialized = JSON.stringify(projected);
    expect(serialized).not.toContain("raw provider payload");
    expect(serialized).not.toContain("cause");
    expect(serialized).not.toContain("stack");
  });

  test("resolves Swooper map script paths into local and deployed bundles", () => {
    expect(
      resolveSwooperMapScriptPaths({
        mapScript: "{swooper-maps}/maps/swooper-earthlike.js",
        repoRoot: "/repo",
        modsDir: "/Users/test/Civ Mods",
      })
    ).toEqual({
      localPath: "/repo/apps/mods/map/swooper-physics/dist/mod/maps/swooper-earthlike.js",
      deployedPath: "/Users/test/Civ Mods/mod-swooper-maps/maps/swooper-earthlike.js",
    });

    expect(
      resolveSwooperMapScriptPaths({
        mapScript: "{base-standard}/maps/continents.js",
        repoRoot: "/repo",
        modsDir: "/Users/test/Civ Mods",
      })
    ).toBeUndefined();
  });

  test("passes when the current local and deployed scripts match without legacy markers", () => {
    const stage = buildSwooperMapScriptDeploymentStage({
      mapScript: "{swooper-maps}/maps/swooper-earthlike.js",
      localPath: "/repo/apps/mods/map/swooper-physics/dist/mod/maps/swooper-earthlike.js",
      deployedPath: "/Users/test/Civ Mods/mod-swooper-maps/maps/swooper-earthlike.js",
      local: identity(
        "/repo/apps/mods/map/swooper-physics/dist/mod/maps/swooper-earthlike.js",
        "same"
      ),
      deployed: identity("/Users/test/Civ Mods/mod-swooper-maps/maps/swooper-earthlike.js", "same"),
    });

    expect(stage).toMatchObject({
      ok: true,
      status: "matched",
      unresolvedLinks: [],
    });
  });

  test("blocks stale deployed scripts before mutating a live game", () => {
    const stage = buildSwooperMapScriptDeploymentStage({
      mapScript: "{swooper-maps}/maps/swooper-earthlike.js",
      localPath: "/repo/apps/mods/map/swooper-physics/dist/mod/maps/swooper-earthlike.js",
      deployedPath: "/Users/test/Civ Mods/mod-swooper-maps/maps/swooper-earthlike.js",
      local: identity(
        "/repo/apps/mods/map/swooper-physics/dist/mod/maps/swooper-earthlike.js",
        "current"
      ),
      deployed: identity(
        "/Users/test/Civ Mods/mod-swooper-maps/maps/swooper-earthlike.js",
        "stale"
      ),
    });

    expect(stage.ok).toBe(false);
    expect(stage.unresolvedLinks).toEqual(["deployed-mod-script.hash-mismatch"]);
    expect(stage.recoveryHint).toContain("nx run swooper-physics-mod:deploy");
  });

  test.each(["local", "deployed"] as const)("blocks a missing %s script", (missing) => {
    const localPath = "/repo/apps/mods/map/swooper-physics/dist/mod/maps/swooper-earthlike.js";
    const deployedPath = "/Users/test/Civ Mods/mod-swooper-maps/maps/swooper-earthlike.js";
    const stage = buildSwooperMapScriptDeploymentStage({
      mapScript: "{swooper-maps}/maps/swooper-earthlike.js",
      localPath,
      deployedPath,
      ...(missing === "local" ? {} : { local: identity(localPath, "same") }),
      ...(missing === "deployed" ? {} : { deployed: identity(deployedPath, "same") }),
    });
    expect(stage.ok).toBe(false);
    expect(stage.unresolvedLinks).toEqual([`${missing}-mod-script.missing`]);
  });
});
