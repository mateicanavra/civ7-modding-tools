import { Context, Effect, Layer, Match } from "effect";

export type HabitatReportEvent =
  | { readonly kind: "stdout"; readonly text: string }
  | { readonly kind: "stderr"; readonly text: string }
  | { readonly kind: "trace"; readonly message: string };

export interface HabitatReporterService extends ReturnType<typeof makeLiveHabitatReporter> {}

export class HabitatReporter extends Context.Tag("@habitat/cli/HabitatReporter")<
  HabitatReporter,
  HabitatReporterService
>() {}

export const HabitatReporterLive = Layer.succeed(HabitatReporter, makeLiveHabitatReporter());

function makeLiveHabitatReporter() {
  return {
    emit: (event: HabitatReportEvent) =>
      Effect.succeed(event).pipe(Effect.map(writeReportEvent), Effect.asVoid),
  };
}

function writeReportEvent(event: HabitatReportEvent): boolean | undefined {
  return Match.value(event).pipe(
    Match.when({ kind: "stdout" }, ({ text }) => process.stdout.write(text)),
    Match.when({ kind: "stderr" }, ({ text }) => process.stderr.write(text)),
    Match.when({ kind: "trace" }, () => undefined),
    Match.exhaustive
  );
}

export const silentHabitatReporter: HabitatReporterService = {
  emit: () => Effect.void,
};

export function makeFakeHabitatReporterLayer(events: HabitatReportEvent[]) {
  return Layer.succeed(HabitatReporter, {
    emit: (event) => Effect.succeed(event).pipe(Effect.map((value) => events.push(value)), Effect.asVoid),
  });
}
