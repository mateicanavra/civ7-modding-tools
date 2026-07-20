import { describe, expect, it } from "vitest";
import { getRecipeDefaultCanonicalConfig } from "../../src/features/configAuthoring/canonicalConfig";
import {
  parseMapConfigFile,
  serializeMapConfigFile,
} from "../../src/features/configAuthoring/importExport";

const canonicalConfig = getRecipeDefaultCanonicalConfig("standard");

describe("map config import and export", () => {
  it("round-trips exactly one complete frozen config envelope", () => {
    const serialized = serializeMapConfigFile(canonicalConfig);
    const parsed = parseMapConfigFile(serialized.json);

    expect(serialized.filename).toBe(`${canonicalConfig.id}.config.json`);
    expect(JSON.parse(serialized.json)).toEqual(canonicalConfig);
    expect(parsed).toMatchObject({ ok: true, value: canonicalConfig });
    if (!parsed.ok) throw new Error(parsed.message);
    expect(Object.isFrozen(parsed.value)).toBe(true);
    expect(Object.isFrozen(parsed.value.config)).toBe(true);
    expect(parsed.value).not.toHaveProperty("source");
    expect(parsed.value).not.toHaveProperty("preset");
  });

  it("rejects malformed JSON, wrapper objects, and semantically invalid envelopes", () => {
    expect(parseMapConfigFile("{").ok).toBe(false);
    expect(parseMapConfigFile(JSON.stringify({ canonicalConfig })).ok).toBe(false);
    expect(
      parseMapConfigFile(
        JSON.stringify({
          ...canonicalConfig,
          latitudeBounds: { topLatitude: -80, bottomLatitude: 80 },
        })
      ).ok
    ).toBe(false);
  });
});
