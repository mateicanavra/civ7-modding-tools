import { NodeRuntime } from "@effect/platform-node";
import { renderCheckReport } from "@habitat/cli/service/model/check/index";
import { Console, Effect, Match } from "effect";
import {
  parseStandaloneCheckInvocation,
  renderStandaloneCheckFailure,
  type StandaloneCheckInvocation,
  type StandaloneCheckRequest,
  standaloneCheckHelp,
} from "./model.js";
import { runStandaloneCheck } from "./runtime.js";

export function runStandaloneCheckMain(argv: readonly string[]): void {
  NodeRuntime.runMain(
    Effect.gen(function* () {
      const invocation = yield* parseStandaloneCheckInvocation(argv);
      return yield* executeInvocation(invocation);
    }).pipe(
      Effect.catchTag("StandaloneCheckFailure", (failure) =>
        Effect.gen(function* () {
          yield* Console.error(renderStandaloneCheckFailure(failure));
          yield* Effect.sync(() => {
            process.exitCode = 2;
          });
        })
      )
    )
  );
}

const executeInvocation = Effect.fn("habitat.standalone.check.execute")(function* (
  invocation: StandaloneCheckInvocation
) {
  return yield* Match.value(invocation).pipe(
    Match.when({ kind: "help" }, () => Console.log(standaloneCheckHelp)),
    Match.when({ kind: "check" }, ({ request }) => executeCheck(request)),
    Match.exhaustive
  );
});

const executeCheck = Effect.fn("habitat.standalone.check.emit")(function* (
  request: StandaloneCheckRequest
) {
  const report = yield* runStandaloneCheck(request);
  yield* Console.log(renderCheckReport(report, { json: request.json }));
  yield* Effect.sync(() => {
    process.exitCode = Number(!report.ok);
  });
});
