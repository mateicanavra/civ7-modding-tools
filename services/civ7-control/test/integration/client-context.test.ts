import { describe, expect, test } from "vitest";

import { type Civ7ControlOrpcClientContext, createCiv7ControlOrpcServerClient } from "../../src";
import { directControlFacadeFixture } from "../support/direct-control-facade";
import { playableStatusResult } from "../support/playable-status";

describe("control service client context", () => {
  test("creates fresh service context and carries call correlation into each procedure", async () => {
    const factoryContexts: Civ7ControlOrpcClientContext[] = [];
    const procedureContexts: Civ7ControlOrpcClientContext[] = [];
    const client = createCiv7ControlOrpcServerClient((clientContext) => {
      factoryContexts.push(clientContext);
      return {
        correlation: clientContext,
        directControl: directControlFacadeFixture({
          getCiv7PlayableStatus: async () => {
            procedureContexts.push(clientContext);
            return playableStatusResult();
          },
        }),
      };
    });

    await client.readiness.current({}, { context: { correlationId: "integration-first-1" } });
    await client.readiness.current({}, { context: { correlationId: "integration-second-2" } });

    expect(factoryContexts).toEqual([
      { correlationId: "integration-first-1" },
      { correlationId: "integration-second-2" },
    ]);
    expect(procedureContexts).toEqual(factoryContexts);
    expect(factoryContexts[0]).not.toBe(factoryContexts[1]);
  });
});
