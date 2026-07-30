import { describe, expect, it } from "bun:test";

import { artifacts as landformArtifacts } from "@mapgen/domain/morphology/modules/landforms/artifacts/index.js";
import { VOLCANO_INTENT_KIND } from "@mapgen/domain/morphology/modules/landforms/model/atoms/volcano-intent.schema.js";
import { TEST_MAP_SIZE } from "../../../../setup.js";

const CELL_COUNT = TEST_MAP_SIZE.dimensions.width * TEST_MAP_SIZE.dimensions.height;

describe("landforms volcanoes artifact", () => {
  it("refuses incoherent mask membership, nonbinary values, and unordered duplicate intents", () => {
    const volcanoMask = new Uint8Array(CELL_COUNT);
    volcanoMask[2] = 2;
    volcanoMask[4] = 1;
    const value = {
      volcanoMask,
      volcanoes: [
        {
          tileIndex: 5,
          kind: VOLCANO_INTENT_KIND.intraplate,
          strength01: 1,
        },
        {
          tileIndex: 5,
          kind: VOLCANO_INTENT_KIND.intraplate,
          strength01: 1,
        },
      ],
    };

    const messages = landformArtifacts.volcanoes
      .validate(value, { dimensions: TEST_MAP_SIZE.dimensions })
      .map(({ message }) => message);

    expect(messages.some((message) => message.includes("volcanoMask[2] must be binary"))).toBe(
      true
    );
    expect(messages.some((message) => message.includes("without matching volcanoMask"))).toBe(true);
    expect(
      messages.some((message) => message.includes("strictly ascending unique tile indices"))
    ).toBe(true);
    expect(messages.some((message) => message.includes("volcanoMask contains"))).toBe(true);
  });
});
