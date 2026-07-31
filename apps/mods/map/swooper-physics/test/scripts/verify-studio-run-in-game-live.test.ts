import { describe, expect, test } from "bun:test";
import { ORPCError } from "@orpc/client";
import { encodeBoundedJsonLogLines } from "@swooper/mapgen-core/lib/log";
import {
  admitStudioRunInGameLiveMutationArgs,
  buildSwooperMapScriptDeploymentStage,
  hasMapgenCompletionForSeed,
  type MapScriptFileIdentity,
  parseStudioRunInGameLiveArgs,
  resolveSwooperMapScriptPaths,
  serializeVerifierError,
} from "../../scripts/live/verify-studio-run-in-game-live";

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
        mapScript: "{swooper-maps}/maps/mountain-patch.js",
        repoRoot: "/repo",
        modsDir: "/Users/test/Civ Mods",
      })
    ).toEqual({
      localPath: "/repo/apps/mods/map/swooper-physics/mod/maps/mountain-patch.js",
      deployedPath: "/Users/test/Civ Mods/mod-swooper-maps/maps/mountain-patch.js",
    });

    expect(
      resolveSwooperMapScriptPaths({
        mapScript: "{base-standard}/maps/continents.js",
        repoRoot: "/repo",
        modsDir: "/Users/test/Civ Mods",
      })
    ).toBeUndefined();
  });

  test("passes only when local and deployed map scripts match and carry river markers", () => {
    const stage = buildSwooperMapScriptDeploymentStage({
      mapScript: "{swooper-maps}/maps/mountain-patch.js",
      localPath: "/repo/apps/mods/map/swooper-physics/mod/maps/mountain-patch.js",
      deployedPath: "/Users/test/Civ Mods/mod-swooper-maps/maps/mountain-patch.js",
      local: identity("/repo/apps/mods/map/swooper-physics/mod/maps/mountain-patch.js", "same"),
      deployed: identity("/Users/test/Civ Mods/mod-swooper-maps/maps/mountain-patch.js", "same"),
      localMarkers: [
        { marker: "map.rivers.authoredTerrainMaterialization", present: true },
        { marker: "POST-AUTHORED-RIVERS", present: true },
      ],
      deployedMarkers: [
        { marker: "map.rivers.authoredTerrainMaterialization", present: true },
        { marker: "POST-AUTHORED-RIVERS", present: true },
      ],
    });

    expect(stage).toMatchObject({
      ok: true,
      status: "matched",
      unresolvedLinks: [],
    });
  });

  test("blocks stale deployed scripts before mutating a live game", () => {
    const stage = buildSwooperMapScriptDeploymentStage({
      mapScript: "{swooper-maps}/maps/mountain-patch.js",
      localPath: "/repo/apps/mods/map/swooper-physics/mod/maps/mountain-patch.js",
      deployedPath: "/Users/test/Civ Mods/mod-swooper-maps/maps/mountain-patch.js",
      local: identity("/repo/apps/mods/map/swooper-physics/mod/maps/mountain-patch.js", "current"),
      deployed: identity("/Users/test/Civ Mods/mod-swooper-maps/maps/mountain-patch.js", "stale"),
      localMarkers: [
        { marker: "map.rivers.authoredTerrainMaterialization", present: true },
        { marker: "POST-AUTHORED-RIVERS", present: true },
      ],
      deployedMarkers: [
        { marker: "map.rivers.authoredTerrainMaterialization", present: false },
        { marker: "POST-AUTHORED-RIVERS", present: false },
      ],
    });

    expect(stage.ok).toBe(false);
    expect(stage.unresolvedLinks).toEqual([
      "deployed-mod-script.hash-mismatch",
      "deployed-mod-script.marker-missing.map-rivers-authoredterrainmaterialization",
      "deployed-mod-script.marker-missing.post-authored-rivers",
    ]);
    expect(stage.recoveryHint).toContain("nx run swooper-physics-mod:deploy");
  });
});
