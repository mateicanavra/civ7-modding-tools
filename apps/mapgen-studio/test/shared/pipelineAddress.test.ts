import { describe, expect, it } from "vitest";
import { assertPipelineAddress, parsePipelineAddress } from "../../src/shared/pipelineAddress";

describe("pipelineAddress", () => {
  it("parses a full step id with a namespace", () => {
    const parsed = parsePipelineAddress("mod-swooper-maps.standard.ecology.assign-biomes");
    expect(parsed).toEqual({
      fullStepId: "mod-swooper-maps.standard.ecology.assign-biomes",
      namespace: "mod-swooper-maps",
      recipeId: "standard",
      recipeKey: "mod-swooper-maps/standard",
      stageId: "ecology",
      stepId: "assign-biomes",
    });
  });

  it("parses a full step id without a namespace", () => {
    const parsed = parsePipelineAddress("standard.ecology.assign-biomes");
    expect(parsed).toEqual({
      fullStepId: "standard.ecology.assign-biomes",
      namespace: null,
      recipeId: "standard",
      recipeKey: "standard",
      stageId: "ecology",
      stepId: "assign-biomes",
    });
  });

  it("returns null for malformed step ids", () => {
    expect(parsePipelineAddress("too.short")).toBeNull();
    expect(parsePipelineAddress(".ecology.step")).toBeNull();
  });

  it("assertPipelineAddress throws for invalid step ids", () => {
    expect(() => assertPipelineAddress("x.y")).toThrowError(/Invalid pipeline step id/);
  });
});

