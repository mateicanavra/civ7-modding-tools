import { makeRunMain } from "@effect/platform/Runtime";
import { installHabitatProcessLifecycle } from "@habitat/cli/runtime/process-lifecycle";
import { renderCheckReport } from "@habitat/cli/service/model/check/index";
import { Console, Effect, Match } from "effect";
import { constVoid } from "effect/Function";
import {
  parseStandaloneCheckInvocation,
  renderStandaloneCheckFailure,
  type StandaloneCheckInvocation,
  type StandaloneCheckRequest,
  standaloneCheckHelp,
} from "./model.js";
import { runStandaloneCheck } from "./runtime.js";

/** Runs the check-only SDK edge with scoped cancellation and native signal exit semantics. */
export function runStandaloneCheckMain(argv: readonly string[]): void {
  runStandaloneMain(
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

const runStandaloneMain = makeRunMain(({ fiber, teardown }) => {
  const keepAlive = setInterval(constVoid, 2 ** 31 - 1);
  const lifecycle = installHabitatProcessLifecycle(
    () => fiber.unsafeInterruptAsFork(fiber.id()),
    () => Promise.resolve()
  );

  fiber.addObserver((exit) => {
    // Fiber observation begins only after interruption has closed every scoped provider resource.
    clearInterval(keepAlive);
    void lifecycle.finish().then(
      () =>
        teardown(exit, (code) => {
          const terminate = Match.value(code).pipe(
            Match.when(0, () => constVoid),
            Match.orElse((exitCode) => () => process.exit(exitCode))
          );
          terminate();
        }),
      () => process.exit(1)
    );
  });
});

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
