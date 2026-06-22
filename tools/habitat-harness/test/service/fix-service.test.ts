import type { FixServiceModuleContext } from "@internal/habitat-harness/service/base";
import { fixRouter } from "@internal/habitat-harness/service/modules/fix/router";
import { createHabitatServiceClient } from "@internal/habitat-harness/service/router";
import {
  type HabitatProcessRequest,
  makeHabitatCommandResult,
} from "@internal/habitat-harness/resources/command/index";
import {
  GritProvider,
  makeFakeGritProviderLayer,
} from "@internal/habitat-harness/providers/grit/index";
import { Effect } from "effect";
import { withFiberContext } from "effect-orpc/node";
import { describe, expect, test } from "vitest";

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

  test("routes through the in-process Habitat service client", async () => {
    const requests: HabitatProcessRequest[] = [];
    const layer = makeFakeGritProviderLayer((request) => {
      requests.push(request);
      return makeHabitatCommandResult(request);
    });

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const grit = yield* GritProvider;
        return yield* Effect.promise(() =>
          createHabitatServiceClient({ fix: { grit } }).fix.run({ kind: "dry-run-intent" })
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

function runFixProcedure(
  context: FixServiceModuleContext = {},
  input = { kind: "dry-run-intent" as const }
) {
  return Effect.gen(function* () {
    const runFix = fixRouter.run.callable({ context: { fix: context } });
    return yield* withFiberContext(() => runFix(input));
  });
}
