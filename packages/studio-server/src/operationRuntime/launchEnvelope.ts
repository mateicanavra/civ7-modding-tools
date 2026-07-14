import {
  freezeSnapshot,
  type LaunchEnvelope,
  type LaunchEnvelopeDigest,
  type RunInGameSetupConfig,
  type RunInGameWorldSettings,
  snapshotLaunchEnvelope,
  snapshotMapConfigEnvelope,
} from "@civ7/studio-contract";
import { canonicalValueDigest } from "@civ7/studio-run-workspace";
import { Effect } from "effect";

import { invalidRequest, type StudioRuntimeFailure } from "../errors/index.js";
import type { StudioWorkflowPorts } from "../ports/index.js";
export type RunInGameLaunchResolution = Readonly<{
  launchEnvelope: LaunchEnvelope;
  canonicalConfigDigest: string;
  launchEnvelopeDigest: LaunchEnvelopeDigest;
}>;

export function admitRunInGameLaunchEnvelope(
  args: Readonly<{
    input: {
      canonicalConfig: unknown;
      seed: number;
      worldSettings: RunInGameWorldSettings;
      setupConfig: RunInGameSetupConfig;
    };
    ports: Pick<StudioWorkflowPorts, "runInGameCanonicalConfigAdmission">;
  }>
): Effect.Effect<RunInGameLaunchResolution, StudioRuntimeFailure> {
  const canonicalConfig = snapshotMapConfigEnvelope(args.input.canonicalConfig);
  if (canonicalConfig === undefined) {
    return Effect.fail(
      invalidRequest({
        message: "Run in Game canonical config is invalid.",
        diagnostics: { code: "run-in-game-canonical-config-invalid" },
      })
    );
  }
  const admission = args.ports.runInGameCanonicalConfigAdmission;
  if (admission === undefined) {
    return Effect.fail(
      invalidRequest({
        message: "Run in Game config admission is unavailable.",
        diagnostics: { code: "run-in-game-config-admission-unavailable" },
      })
    );
  }

  return Effect.tryPromise({
    try: () => admission.admit(canonicalConfig),
    catch: (cause) =>
      invalidRequest({
        message: "Run in Game config could not be admitted.",
        diagnostics: {
          code: "run-in-game-config-admission-failed",
          cause: diagnosticString(cause) ?? "unknown",
        },
      }),
  }).pipe(
    Effect.flatMap((admittedConfig) =>
      admittedConfig === canonicalConfig
        ? Effect.succeed(canonicalConfig)
        : Effect.fail(
            invalidRequest({
              message: "Run in Game config admission must preserve the input envelope.",
              diagnostics: { code: "run-in-game-config-admission-rebuilt" },
            })
          )
    ),
    Effect.map((admittedConfig) => {
      const launchEnvelope = snapshotLaunchEnvelope({
        seed: args.input.seed,
        worldSettings: args.input.worldSettings,
        setupConfig: args.input.setupConfig,
        canonicalConfig: admittedConfig,
      });
      const resolution = {
        launchEnvelope,
        canonicalConfigDigest: canonicalValueDigest(launchEnvelope.canonicalConfig),
        launchEnvelopeDigest: canonicalValueDigest(launchEnvelope),
      };
      return freezeSnapshot(resolution);
    })
  );
}

function diagnosticString(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string") return value;
  if (value instanceof Error) return value.message;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
