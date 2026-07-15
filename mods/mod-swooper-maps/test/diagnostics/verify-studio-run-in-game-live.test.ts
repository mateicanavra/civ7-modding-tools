import { describe, expect, test } from "bun:test";
import { ORPCError } from "@orpc/client";
import { serializeVerifierError } from "../../scripts/live/verifier-error";
import {
  buildSwooperMapScriptDeploymentStage,
  type MapScriptFileIdentity,
  resolveSwooperMapScriptPaths,
} from "../../scripts/live/verify-studio-run-in-game-live";

const identity = (path: string, sha256: string): MapScriptFileIdentity => ({
  path,
  sha256,
  sizeBytes: 100,
  mtimeMs: 1,
  mtimeIso: "2026-06-10T00:00:00.000Z",
});

describe("studio run-in-game live verifier deployment identity", () => {
  test("preserves bounded defined-error uncertainty evidence", () => {
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

    expect(serializeVerifierError(error)).toEqual({
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
    expect(JSON.stringify(serializeVerifierError(error))).not.toContain("raw provider payload");
  });

  test("resolves Swooper map script paths into local and deployed bundles", () => {
    expect(
      resolveSwooperMapScriptPaths({
        mapScript: "{swooper-maps}/maps/mountain-rivers-patch.js",
        repoRoot: "/repo",
        modsDir: "/Users/test/Civ Mods",
      })
    ).toEqual({
      localPath: "/repo/mods/mod-swooper-maps/mod/maps/mountain-rivers-patch.js",
      deployedPath: "/Users/test/Civ Mods/mod-swooper-maps/maps/mountain-rivers-patch.js",
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
      mapScript: "{swooper-maps}/maps/mountain-rivers-patch.js",
      localPath: "/repo/mods/mod-swooper-maps/mod/maps/mountain-rivers-patch.js",
      deployedPath: "/Users/test/Civ Mods/mod-swooper-maps/maps/mountain-rivers-patch.js",
      local: identity("/repo/mods/mod-swooper-maps/mod/maps/mountain-rivers-patch.js", "same"),
      deployed: identity(
        "/Users/test/Civ Mods/mod-swooper-maps/maps/mountain-rivers-patch.js",
        "same"
      ),
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
      mapScript: "{swooper-maps}/maps/mountain-rivers-patch.js",
      localPath: "/repo/mods/mod-swooper-maps/mod/maps/mountain-rivers-patch.js",
      deployedPath: "/Users/test/Civ Mods/mod-swooper-maps/maps/mountain-rivers-patch.js",
      local: identity("/repo/mods/mod-swooper-maps/mod/maps/mountain-rivers-patch.js", "current"),
      deployed: identity(
        "/Users/test/Civ Mods/mod-swooper-maps/maps/mountain-rivers-patch.js",
        "stale"
      ),
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
    expect(stage.recoveryHint).toContain("nx run mod-swooper-maps:deploy");
  });
});
