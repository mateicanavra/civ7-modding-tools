import { isProcedure } from "@orpc/server";
import { describe, expect, test } from "vitest";

import { Civ7ControlOrpcRouter } from "../src/index";
import { civ7ControlOrpcProcedureAdmissionMiddleware } from "../src/procedure";

describe("control-oRPC procedure admission", () => {
  test("every public procedure has exactly one outermost Effect admission boundary", () => {
    const procedurePaths: string[] = [];

    visitRouter(Civ7ControlOrpcRouter, [], (path, procedure) => {
      procedurePaths.push(path.join("."));
      const effectDefinition = Reflect.get(procedure, "~effect");
      if (!isRecord(effectDefinition)) {
        throw new Error(`${path.join(".")} is not an Effect procedure`);
      }
      const steps = effectDefinition.effectSteps;
      if (!Array.isArray(steps)) {
        throw new Error(`${path.join(".")} has no Effect steps`);
      }
      expect(effectDefinition.effectHandler, path.join(".")).toBeDefined();
      const admissionIndexes = steps.flatMap((step: unknown, index: number) =>
        isRecord(step) &&
        step._tag === "middleware" &&
        step.middleware === civ7ControlOrpcProcedureAdmissionMiddleware
          ? [index]
          : []
      );
      expect(admissionIndexes, path.join(".")).toEqual([0]);
    });

    expect(procedurePaths.length).toBeGreaterThan(0);
  });
});

function visitRouter(
  node: unknown,
  path: readonly string[],
  visit: (path: readonly string[], procedure: object) => void
): void {
  if (isProcedure(node)) {
    visit(path, node);
    return;
  }
  if (!isRecord(node)) return;
  for (const [key, child] of Object.entries(node)) visitRouter(child, [...path, key], visit);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
