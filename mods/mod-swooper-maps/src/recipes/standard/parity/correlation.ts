import { findCiv7StandardMapSizePreset } from "@civ7/adapter";
import type { StudioRunGenerationManifest } from "@civ7/studio-run-workspace";
import {
  admitStandardMapConfig,
  type StandardMapConfigEnvelope,
} from "../../../maps/configs/canonical.js";
import { admitStandardExactParityCapture, type StandardExactParityAdmission } from "./exact.js";
import {
  issueStandardParityReplayAuthority,
  runStandardParityReplayAuthority,
  type StandardParityReplayAuthority,
} from "./replay.js";
import type { StandardExactParityCapture, StandardLocalParityCapture } from "./types.js";

/** Closed resolution of the frozen inputs required by one Standard replay. */
export type StandardParityReplayResolution =
  | Readonly<{
      status: "ready";
      exact: StandardExactParityCapture;
      replayAuthority: StandardParityReplayAuthority;
    }>
  | Readonly<{
      status: "failed";
      failureLinks: ReadonlyArray<string>;
      unresolvedLinks: ReadonlyArray<string>;
    }>
  | Readonly<{ status: "blocked"; unresolvedLinks: ReadonlyArray<string> }>;

/**
 * Correlates one admitted generation manifest with complete exact-authorship
 * evidence, then resolves the immutable Standard replay input.
 *
 * The map seed drives deterministic generation. The game seed remains
 * correlation evidence only and is never supplied to the recipe executor.
 */
export function resolveStandardParityReplayInput(
  args: Readonly<{
    exactAuthorship: unknown;
    manifest: StudioRunGenerationManifest | undefined;
  }>
): StandardParityReplayResolution {
  if (args.manifest === undefined) {
    return {
      status: "blocked",
      unresolvedLinks: ["generation-manifest"],
    };
  }
  const exactAdmission = admitStandardExactParityCapture(args.exactAuthorship);
  if (exactAdmission.status === "blocked") {
    return blockedExactAdmission(exactAdmission);
  }

  const { manifest } = args;
  const { authorship } = exactAdmission.capture;
  const { payload } = manifest;
  const envelope = payload.launchEnvelope;
  const failureLinks: string[] = [];
  const unresolvedLinks: string[] = [];
  compareIdentity(failureLinks, authorship.requestId, payload.requestId, "correlation.request-id");
  compareIdentity(
    failureLinks,
    authorship.canonicalConfigDigest,
    payload.canonicalConfigDigest,
    "correlation.canonical-config-digest"
  );
  compareIdentity(
    failureLinks,
    authorship.launchEnvelopeDigest,
    payload.launchEnvelopeDigest,
    "correlation.launch-envelope-digest"
  );
  compareIdentity(
    failureLinks,
    authorship.materialization.generationManifestDigest,
    manifest.generationManifestDigest,
    "correlation.generation-manifest-digest"
  );
  compareIdentity(
    failureLinks,
    authorship.materialization.runArtifactId,
    payload.runArtifactId,
    "correlation.run-artifact-id"
  );
  compareIdentity(failureLinks, authorship.request.seed, envelope.seed, "correlation.map-seed");
  compareIdentity(
    failureLinks,
    authorship.request.gameSeed,
    envelope.gameSeed,
    "correlation.game-seed"
  );
  compareIdentity(
    failureLinks,
    authorship.request.mapSize,
    envelope.worldSettings.mapSize,
    "correlation.map-size"
  );
  compareIdentity(
    failureLinks,
    authorship.runtime.seed,
    envelope.seed,
    "correlation.runtime-map-seed"
  );

  const playerCount = envelope.worldSettings.playerCount;
  if (playerCount === undefined || authorship.request.playerCount === undefined) {
    unresolvedLinks.push("correlation.player-count");
  } else {
    compareIdentity(
      failureLinks,
      authorship.request.playerCount,
      playerCount,
      "correlation.player-count"
    );
  }

  const preset = findCiv7StandardMapSizePreset(envelope.worldSettings.mapSize);
  if (preset === null) {
    unresolvedLinks.push("correlation.civ7-map-size-preset");
  } else if (
    authorship.runtime.width !== preset.dimensions.width ||
    authorship.runtime.height !== preset.dimensions.height ||
    authorship.runtime.plotCount !== preset.dimensions.width * preset.dimensions.height
  ) {
    failureLinks.push("correlation.runtime-map-dimensions");
  }

  let config: StandardMapConfigEnvelope | undefined;
  try {
    config = admitStandardMapConfig(envelope.canonicalConfig);
    compareIdentity(
      failureLinks,
      authorship.request.recipeId,
      config.recipe,
      "correlation.recipe-id"
    );
  } catch {
    failureLinks.push("correlation.standard-config");
  }
  if (failureLinks.length > 0) {
    return {
      status: "failed",
      failureLinks: uniqueSorted(failureLinks),
      unresolvedLinks: uniqueSorted(unresolvedLinks),
    };
  }
  if (
    unresolvedLinks.length > 0 ||
    config === undefined ||
    preset === null ||
    playerCount === undefined
  ) {
    return {
      status: "blocked",
      unresolvedLinks: uniqueSorted(unresolvedLinks),
    };
  }

  return {
    status: "ready",
    exact: exactAdmission.capture,
    replayAuthority: issueStandardParityReplayAuthority({
      mapSize: preset.id,
      mapSeed: envelope.seed,
      gameSeed: envelope.gameSeed,
      playerCount,
      config,
      canonicalConfigDigest: payload.canonicalConfigDigest,
      launchEnvelopeDigest: payload.launchEnvelopeDigest,
      mapEnvelopeBounds: config.latitudeBounds,
    }),
  };
}

/** Runs the immutable replay request sealed by one ready correlation result. */
export function runResolvedStandardParityReplay(
  resolution: Extract<StandardParityReplayResolution, { status: "ready" }>
): StandardLocalParityCapture {
  return runStandardParityReplayAuthority(resolution.replayAuthority);
}

function blockedExactAdmission(
  admission: Extract<StandardExactParityAdmission, { status: "blocked" }>
): StandardParityReplayResolution {
  return {
    status: "blocked",
    unresolvedLinks: admission.unresolvedLinks,
  };
}

function compareIdentity(
  failures: string[],
  exact: unknown,
  manifest: unknown,
  evidenceLink: string
): void {
  if (exact !== manifest) failures.push(evidenceLink);
}

function uniqueSorted(values: readonly string[]): ReadonlyArray<string> {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}
