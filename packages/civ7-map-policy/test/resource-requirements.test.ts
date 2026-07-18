import { describe, expect, it } from "bun:test";

import { getUnconditionalResourceRequirementBasisForAge } from "../src/index.js";

describe("unconditional resource requirements", () => {
  it("reports every roster-independent official basis for an age-valid resource", () => {
    expect(
      getUnconditionalResourceRequirementBasisForAge("RESOURCE_HORSES", "AGE_ANTIQUITY")
    ).toEqual(["staple", "unlocks-civ"]);
  });

  it("keeps roster-dependent resources out of the static requirement basis", () => {
    expect(
      getUnconditionalResourceRequirementBasisForAge("RESOURCE_FISH", "AGE_ANTIQUITY")
    ).toEqual([]);
  });

  it("applies the valid-age gate before static requirement flags", () => {
    expect(getUnconditionalResourceRequirementBasisForAge("RESOURCE_IRON", "AGE_MODERN")).toEqual(
      []
    );
  });

  it("refuses resource identifiers outside the official corpus", () => {
    expect(() =>
      getUnconditionalResourceRequirementBasisForAge(
        "RESOURCE_NOT_OFFICIAL" as `RESOURCE_${string}`,
        "AGE_ANTIQUITY"
      )
    ).toThrow("Unknown official resource type");
  });
});
