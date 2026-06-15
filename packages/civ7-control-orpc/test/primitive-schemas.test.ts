import { Civ7ComponentIdSchema, Civ7MapLocationSchema } from "@civ7/direct-control";
import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

import {
  Civ7ControlOrpcComponentIdSchema,
  Civ7ControlOrpcMapLocationSchema,
} from "../src/model/primitives";

describe("control-oRPC primitive service schemas", () => {
  test("keeps component id and map location contracts equivalent to direct-control primitives", () => {
    const componentFixtures = [
      { owner: 0, id: 458_752, type: 26 },
      { owner: 1, id: 9001 },
      { owner: 1, id: 2, type: 3, rawCommand: "Game.turn" },
      { owner: 1, type: 3 },
      { owner: "1", id: 2, type: 3 },
    ];
    for (const fixture of componentFixtures) {
      expect(Value.Check(Civ7ControlOrpcComponentIdSchema, fixture)).toBe(
        Value.Check(Civ7ComponentIdSchema, fixture)
      );
    }

    const locationFixtures = [
      { x: 25, y: 35 },
      { x: 1.5, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1_000_001 },
      { x: 25, y: 35, rawCommand: "MOVE_TO" },
    ];
    for (const fixture of locationFixtures) {
      expect(Value.Check(Civ7ControlOrpcMapLocationSchema, fixture)).toBe(
        Value.Check(Civ7MapLocationSchema, fixture)
      );
    }
  });
});
