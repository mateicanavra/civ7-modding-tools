import { describe, expect, it } from "vitest";

import {
  classifyMapRowVisibilityFailure,
  modNamespaceFromMapScript,
} from "../src/ports/mapModVisibility.js";

const TARGET = "{swooper-maps}/maps/studio-current.js";

// The base-game map rows Civ7 setup shows regardless of mods (so "Civ shows maps"
// is true even when our mod is disabled).
const BASE_GAME_ROWS = [
  { file: "{base-standard}/maps/continents.js" },
  { file: "{base-standard}/maps/pangaea.js" },
];

// Sibling maps from the SAME mod — present only when the mod is actually loaded.
const SWOOPER_SIBLINGS = [
  { file: "{swooper-maps}/maps/latest-juicy.js" },
  { file: "{swooper-maps}/maps/swooper-earthlike.js" },
];

describe("modNamespaceFromMapScript", () => {
  it("parses the mod namespace token", () => {
    expect(modNamespaceFromMapScript(TARGET)).toBe("{swooper-maps}");
    expect(modNamespaceFromMapScript("  {swooper-maps}/maps/x.js  ")).toBe("{swooper-maps}");
  });

  it("returns null when there is no namespace token", () => {
    expect(modNamespaceFromMapScript("maps/studio-current.js")).toBeNull();
    expect(modNamespaceFromMapScript("studio-current.js")).toBeNull();
  });
});

describe("classifyMapRowVisibilityFailure", () => {
  it("classifies generated mod disabled only from active target mod-set readback", () => {
    const result = classifyMapRowVisibilityFailure({
      launchMapScript: TARGET,
      visibleMapRows: BASE_GAME_ROWS,
      materializationMode: "disposable",
      targetModId: "swooper-maps",
      activeTargetModSet: {
        available: true,
        identityAvailable: true,
        truncated: false,
        mods: [{ id: "base-standard" }],
      },
    });
    expect(result.code).toBe("generated-map-mod-not-enabled");
    expect(result.modNamespace).toBe("{swooper-maps}");
    expect(result.targetModId).toBe("swooper-maps");
    expect(result.recoveryHint).toMatch(/enable .*mod/i);
  });

  it('"works when mods enabled": siblings visible, target not yet enumerated => setup-map-row-not-visible', () => {
    const result = classifyMapRowVisibilityFailure({
      launchMapScript: TARGET,
      visibleMapRows: [...BASE_GAME_ROWS, ...SWOOPER_SIBLINGS],
      materializationMode: "disposable",
      targetModId: "swooper-maps",
      activeTargetModSet: {
        available: true,
        identityAvailable: true,
        truncated: false,
        mods: [{ id: "swooper-maps" }],
      },
    });
    expect(result.code).toBe("setup-map-row-not-visible");
    expect(result.siblingMapRowCount).toBe(2);
    expect(result.recoveryHint).toMatch(/re-?scan|restart/i);
  });

  it("does NOT claim mod-not-loaded from an empty/transient setup read (false-positive guard)", () => {
    const result = classifyMapRowVisibilityFailure({
      launchMapScript: TARGET,
      visibleMapRows: [],
      materializationMode: "disposable",
      targetModId: "swooper-maps",
      activeTargetModSet: {
        available: false,
        identityAvailable: false,
        truncated: false,
        mods: [],
      },
    });
    expect(result.code).toBe("setup-map-row-not-visible");
    expect(result.visibleMapRowCount).toBe(0);
  });

  it("does not infer disabled mod from sibling rows without active mod-set evidence", () => {
    const result = classifyMapRowVisibilityFailure({
      launchMapScript: TARGET,
      visibleMapRows: BASE_GAME_ROWS,
      targetModId: "swooper-maps",
    });
    expect(result.code).toBe("setup-map-row-not-visible");
    expect(result.siblingMapRowCount).toBe(0);
  });

  it("does not infer disabled mod from ambiguous active mod-set readback", () => {
    const result = classifyMapRowVisibilityFailure({
      launchMapScript: TARGET,
      visibleMapRows: BASE_GAME_ROWS,
      targetModId: "swooper-maps",
      activeTargetModSet: {
        available: true,
        identityAvailable: false,
        truncated: false,
        mods: [{ handle: 42 }],
      },
    });
    expect(result.code).toBe("setup-map-row-not-visible");
  });

  it("does not infer disabled mod from nested truncated active mod-set readback", () => {
    const result = classifyMapRowVisibilityFailure({
      launchMapScript: TARGET,
      visibleMapRows: BASE_GAME_ROWS,
      targetModId: "swooper-maps",
      activeTargetModSet: {
        available: true,
        identityAvailable: true,
        truncated: false,
        readbacks: [{ truncated: true }],
        mods: [{ id: "base-standard" }],
      },
    });
    expect(result.code).toBe("setup-map-row-not-visible");
  });

  it("does not use display labels as comparable mod identity", () => {
    const result = classifyMapRowVisibilityFailure({
      launchMapScript: TARGET,
      visibleMapRows: BASE_GAME_ROWS,
      targetModId: "swooper-maps",
      activeTargetModSet: {
        available: true,
        identityAvailable: true,
        truncated: false,
        mods: [{ name: "swooper-maps" }],
      },
    });
    expect(result.code).toBe("generated-map-mod-not-enabled");
  });

  it("does not infer disabled mod from truncated active mod-set readback", () => {
    const result = classifyMapRowVisibilityFailure({
      launchMapScript: TARGET,
      visibleMapRows: BASE_GAME_ROWS,
      targetModId: "swooper-maps",
      activeTargetModSet: {
        available: true,
        identityAvailable: true,
        truncated: true,
        mods: [{ id: "base-standard" }],
      },
    });
    expect(result.code).toBe("setup-map-row-not-visible");
  });

  it("does NOT count the target itself as a sibling", () => {
    const result = classifyMapRowVisibilityFailure({
      launchMapScript: TARGET,
      visibleMapRows: [...BASE_GAME_ROWS, { file: TARGET }],
    });
    expect(result.code).toBe("setup-map-row-not-visible");
    expect(result.siblingMapRowCount).toBe(0);
  });

  it("falls back to setup-map-row-not-visible when the script has no mod namespace", () => {
    const result = classifyMapRowVisibilityFailure({
      launchMapScript: "maps/studio-current.js",
      visibleMapRows: BASE_GAME_ROWS,
    });
    expect(result.code).toBe("setup-map-row-not-visible");
    expect(result.modNamespace).toBeNull();
  });
});
