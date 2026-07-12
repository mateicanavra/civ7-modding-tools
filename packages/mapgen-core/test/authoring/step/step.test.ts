import { describe, expect, it } from "bun:test";
import { createStep, defineStep } from "@mapgen/authoring/index.js";
import { EmptyStepConfigSchema } from "@mapgen/engine/step-config.js";

describe("step authoring", () => {
  const makeContract = (id: string) =>
    defineStep({
      id,
      phase: "foundation",
      requires: [],
      provides: [],
      schema: EmptyStepConfigSchema,
    });

  it("createStep rejects missing schema", () => {
    const contractWithoutSchema = {
      id: "alpha",
      phase: "foundation",
      requires: [],
      provides: [],
    } as unknown as Parameters<typeof createStep>[0];

    expect(() => createStep(contractWithoutSchema, { run: () => {} })).toThrow(/schema/);
  });

  it("createStep accepts explicit empty schema", () => {
    expect(() => createStep(makeContract("alpha"), { run: () => {} })).not.toThrow();
  });

  it("defineStep rejects non-kebab step ids", () => {
    expect(() =>
      defineStep({
        id: "BadId",
        phase: "foundation",
        requires: [],
        provides: [],
        schema: EmptyStepConfigSchema,
      })
    ).toThrow(/BadId/);
  });
});
