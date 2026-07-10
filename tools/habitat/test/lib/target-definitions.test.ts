import { biomeTargets } from "@habitat/cli/service/model/graph/policy/target-definitions.policy";
import { describe, expect, test } from "vitest";

describe("Habitat target definitions", () => {
  test("tracks the native Biome workspace scope conservatively", () => {
    for (const target of Object.values(biomeTargets())) {
      expect(target.inputs).toEqual(
        expect.arrayContaining(["{workspaceRoot}/.habitat/**", "{workspaceRoot}/**/*"])
      );
    }
  });
});
