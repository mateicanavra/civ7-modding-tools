import {
  GritProvider,
  makeFakeGritProviderLayer,
} from "@habitat/cli/providers/grit/index";
import {
  type HabitatProcessRequest,
  makeHabitatCommandResult,
} from "@habitat/cli/resources/command/index";
import { fixRouter } from "@habitat/cli/service/modules/fix/router";
import { habitatServiceRouter } from "@habitat/cli/service/router";
import { createRouterClient } from "@orpc/server";
import { Effect } from "effect";
import { withFiberContext } from "effect-orpc/node";
import { describe, expect, test } from "vitest";
import { makeTestHabitatServiceDeps } from "../support/habitat-service-deps";

describe("Habitat fix service", () => {
  test("runs dry-run intent through admitted pattern transactions", async () => {
    const requests: HabitatProcessRequest[] = [];
    const layer = makeFakeGritProviderLayer((request) => {
      requests.push(request);
      return makeHabitatCommandResult(request, {
        stdout: {
          text: "dry run ok\n",
          truncated: false,
          sha256: "",
          bytes: 11,
        },
      });
    });

    const result = await Effect.runPromise(runFixProcedure().pipe(Effect.provide(layer)));

    expect(result).toEqual({ exitCode: 0, stdout: "dry run ok\ndry run ok\n", stderr: "" });
    expect(requests).toHaveLength(2);
    expect(requests[0]).toMatchObject({
      commandId: "habitat-fix-deep-import-to-public-surface-dry-run",
      executable: "grit",
      kind: "pattern-apply",
    });
  });

  test("routes through the in-process Habitat service router", async () => {
    const requests: HabitatProcessRequest[] = [];
    const layer = makeFakeGritProviderLayer((request) => {
      requests.push(request);
      return makeHabitatCommandResult(request);
    });

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const grit = yield* GritProvider;
        return yield* Effect.promise(() =>
          createRouterClient(habitatServiceRouter, {
            context: { deps: makeTestHabitatServiceDeps({ grit }) },
          }).fix.planPatterns({})
        );
      }).pipe(Effect.provide(layer))
    );

    expect(result).toMatchObject({
      exitCode: 0,
      stderr: "",
    });
    expect(requests).toHaveLength(2);
  });
});

function runFixProcedure() {
  return Effect.gen(function* () {
    const grit = yield* GritProvider;
    const planPatterns = fixRouter.planPatterns.callable({
      context: { deps: makeTestHabitatServiceDeps({ grit }) },
    });
    return yield* withFiberContext(() => planPatterns({}));
  });
}
