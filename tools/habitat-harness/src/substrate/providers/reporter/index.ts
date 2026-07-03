import { Context, Effect, Layer } from "effect";

export type HabitatReportEvent =
  | { readonly kind: "stdout"; readonly text: string }
  | { readonly kind: "stderr"; readonly text: string }
  | { readonly kind: "trace"; readonly message: string };

export interface HabitatReporterService {
  readonly emit: (event: HabitatReportEvent) => Effect.Effect<void>;
}

export class HabitatReporter extends Context.Tag("@internal/habitat-harness/HabitatReporter")<
  HabitatReporter,
  HabitatReporterService
>() {}

export const HabitatReporterLive = Layer.succeed(HabitatReporter, {
  emit: (event) =>
    Effect.sync(() => {
      if (event.kind === "stdout") process.stdout.write(event.text);
      if (event.kind === "stderr") process.stderr.write(event.text);
    }),
});

export function makeFakeHabitatReporterLayer(events: HabitatReportEvent[]) {
  return Layer.succeed(HabitatReporter, {
    emit: (event) =>
      Effect.sync(() => {
        events.push(event);
      }),
  });
}
