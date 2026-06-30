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
  it('"seemed to work but CIV could not read it": mod disabled => map-mod-not-loaded', () => {
    // Civ shows base-game maps, but NONE from {swooper-maps} (the mod is disabled).
    const result = classifyMapRowVisibilityFailure({
      launchMapScript: TARGET,
      visibleMapRows: BASE_GAME_ROWS,
      materializationMode: "disposable",
    });
    expect(result.code).toBe("map-mod-not-loaded");
    expect(result.modNamespace).toBe("{swooper-maps}");
    expect(result.siblingMapRowCount).toBe(0);
    expect(result.recoveryHint).toMatch(/enable the mod/i);
    expect(result.recoveryHint).toMatch(/deployed correctly/i);
  });

  it('"works when mods enabled": siblings visible, target not yet enumerated => setup-map-row-not-visible', () => {
    const result = classifyMapRowVisibilityFailure({
      launchMapScript: TARGET,
      visibleMapRows: [...BASE_GAME_ROWS, ...SWOOPER_SIBLINGS],
      materializationMode: "disposable",
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
    });
    expect(result.code).toBe("setup-map-row-not-visible");
    expect(result.visibleMapRowCount).toBe(0);
  });

  it("does NOT count the target itself as a sibling", () => {
    // Only the target row is present (and base maps): still no real siblings.
    const result = classifyMapRowVisibilityFailure({
      launchMapScript: TARGET,
      visibleMapRows: [...BASE_GAME_ROWS, { file: TARGET }],
    });
    expect(result.code).toBe("map-mod-not-loaded");
    expect(result.siblingMapRowCount).toBe(0);
  });

  it("durable preset map with the mod disabled also classifies as map-mod-not-loaded", () => {
    const result = classifyMapRowVisibilityFailure({
      launchMapScript: "{swooper-maps}/maps/latest-juicy.js",
      visibleMapRows: BASE_GAME_ROWS,
      materializationMode: "durable",
    });
    expect(result.code).toBe("map-mod-not-loaded");
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
