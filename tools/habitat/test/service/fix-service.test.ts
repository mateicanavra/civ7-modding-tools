import {
  type HabitatProcessRequest,
  makeHabitatCommandResult,
} from "@habitat/cli/resources/command/index";
import {
  type GritCommandService,
  makeFakeGritCommandService,
} from "@habitat/cli/resources/rule-diagnostics/providers/grit/index";
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
    const grit = makeFakeGritCommandService((request) => {
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

    const result = await Effect.runPromise(runFixProcedure(grit));

    expect(result).toEqual({ exitCode: 0, stdout: "dry run ok\n", stderr: "" });
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      commandId: "habitat-fix-ensure_docs_checkout_paths_are_portable-dry-run",
      executable: expect.stringMatching(/(^|\/)grit$/),
      kind: "pattern-apply",
    });
  });

  test("routes through the in-process Habitat service router", async () => {
    const requests: HabitatProcessRequest[] = [];
    const grit = makeFakeGritCommandService((request) => {
      requests.push(request);
      return makeHabitatCommandResult(request);
    });

    const client = createRouterClient(habitatServiceRouter, {
      context: { deps: makeTestHabitatServiceDeps({ gritApplyDryRun: grit }) },
    });
    const result = await client.fix.planPatterns({});

    expect(result).toMatchObject({
      exitCode: 0,
      stderr: "",
    });
    expect(requests).toHaveLength(1);
  });
});

function runFixProcedure(grit: GritCommandService) {
  const planPatterns = fixRouter.planPatterns.callable({
    context: { deps: makeTestHabitatServiceDeps({ gritApplyDryRun: grit }) },
  });
  return withFiberContext(() => planPatterns({}));
}
