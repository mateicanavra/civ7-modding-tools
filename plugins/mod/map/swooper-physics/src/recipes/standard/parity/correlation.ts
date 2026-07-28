import { findCiv7StandardMapSizePreset } from "@civ7/map-policy";
import type { StudioRunGenerationManifest } from "@civ7/studio-run-workspace";
import { Value } from "typebox/value";
import {
  admitStandardMapConfig,
  canonicalRecipeConfig,
  type StandardMapConfigEnvelope,
} from "../../../maps/configs/canonical.js";
import standardRecipe from "../recipe.js";
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
 * Map and game seeds remain separate launch axes. Replay also requires the
 * exact ordered alive-major identities captured by the authoritative setup
 * boundary. Authored player setup entries constrain membership without
 * pretending to define roster order or completeness.
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
  compareIdentity(
    failureLinks,
    authorship.civSetup.mapSeed,
    envelope.seed,
    "correlation.civ-setup-map-seed"
  );
  compareIdentity(
    failureLinks,
    authorship.civSetup.gameSeed,
    envelope.gameSeed,
    "correlation.civ-setup-game-seed"
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
  const { evidence: recipePlanEvidence, completion: recipePlanCompletion } =
    exactAdmission.capture.recipePlan;
  const recipePlan = recipePlanEvidence.status === "present" ? recipePlanEvidence.value : undefined;
  const initialSetup = recipePlan?.initialSetup.value;
  if (recipePlanEvidence.status === "missing") {
    unresolvedLinks.push(recipePlanEvidence.evidenceLink);
  }
  if (recipePlanCompletion.status === "missing") {
    unresolvedLinks.push(recipePlanCompletion.evidenceLink);
  }
  if (
    recipePlanEvidence.status === "present" &&
    recipePlanCompletion.status === "present" &&
    !Value.Equal(recipePlanEvidence.value, recipePlanCompletion.value)
  ) {
    failureLinks.push("correlation.recipe-plan-payloads");
  }

  let missingAuthoredOptionEvidence = false;
  if (recipePlanEvidence.status === "present") {
    compareIdentity(
      failureLinks,
      recipePlanEvidence.value.recipeId,
      authorship.request.recipeId,
      "correlation.recipe-plan-recipe-id"
    );
    compareIdentity(
      failureLinks,
      recipePlanEvidence.value.initialSetup.value.map.mapSeed,
      envelope.seed,
      "correlation.initial-setup-map-seed"
    );
    compareIdentity(
      failureLinks,
      recipePlanEvidence.value.initialSetup.value.gameSeed,
      envelope.gameSeed,
      "correlation.initial-setup-game-seed"
    );
    if (playerCount !== undefined) {
      compareIdentity(
        failureLinks,
        recipePlanEvidence.value.initialSetup.value.aliveMajorPlayerIds.length,
        playerCount,
        "correlation.alive-major-player-count"
      );
    }
    const capturedPlayerIds = new Set(
      recipePlanEvidence.value.initialSetup.value.aliveMajorPlayerIds
    );
    if (
      envelope.setupConfig.playerOptions.some(({ playerId }) => !capturedPlayerIds.has(playerId))
    ) {
      failureLinks.push("correlation.player-option-player-ids");
    }
    const selection = recipePlanEvidence.value.initialSetup.value.map.selection;
    if (selection.kind !== "civ7-preset") {
      failureLinks.push("correlation.initial-setup-map-selection");
    } else {
      compareIdentity(
        failureLinks,
        selection.id,
        envelope.worldSettings.mapSize,
        "correlation.initial-setup-map-size"
      );
      compareIdentity(
        failureLinks,
        selection.dimensions.width,
        authorship.runtime.width,
        "correlation.initial-setup-map-width"
      );
      compareIdentity(
        failureLinks,
        selection.dimensions.height,
        authorship.runtime.height,
        "correlation.initial-setup-map-height"
      );
    }
    missingAuthoredOptionEvidence =
      compareAuthoredOptionEvidence(
        failureLinks,
        unresolvedLinks,
        envelope.setupConfig.mapOptions,
        recipePlanEvidence.value.initialSetup.value.options.map,
        "correlation.map-option"
      ) || missingAuthoredOptionEvidence;
    missingAuthoredOptionEvidence =
      compareAuthoredOptionEvidence(
        failureLinks,
        unresolvedLinks,
        envelope.setupConfig.gameOptions,
        recipePlanEvidence.value.initialSetup.value.options.game,
        "correlation.game-option"
      ) || missingAuthoredOptionEvidence;
    for (const player of envelope.setupConfig.playerOptions) {
      const capturedPlayer = recipePlanEvidence.value.initialSetup.value.options.player.find(
        ({ playerId }) => playerId === player.playerId
      );
      missingAuthoredOptionEvidence =
        compareAuthoredOptionEvidence(
          failureLinks,
          unresolvedLinks,
          player.options,
          capturedPlayer?.options,
          `correlation.player-option.${player.playerId}`
        ) || missingAuthoredOptionEvidence;
    }
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
    if (initialSetup !== undefined) {
      compareIdentity(
        failureLinks,
        initialSetup.map.latitudeBounds.topLatitude,
        config.latitudeBounds.topLatitude,
        "correlation.initial-setup-top-latitude"
      );
      compareIdentity(
        failureLinks,
        initialSetup.map.latitudeBounds.bottomLatitude,
        config.latitudeBounds.bottomLatitude,
        "correlation.initial-setup-bottom-latitude"
      );
    }
  } catch {
    failureLinks.push("correlation.standard-config");
  }

  let replayPlan: ReturnType<typeof standardRecipe.compile> | undefined;
  if (
    config !== undefined &&
    recipePlan !== undefined &&
    initialSetup !== undefined &&
    !missingAuthoredOptionEvidence
  ) {
    try {
      replayPlan = standardRecipe.compile(initialSetup, canonicalRecipeConfig(config));
      const inspectedReplayPlan = standardRecipe.inspectPlan(replayPlan);
      compareIdentity(
        failureLinks,
        recipePlan.planFingerprint,
        inspectedReplayPlan.planFingerprint,
        "correlation.recipe-plan-fingerprint"
      );
      if (!Value.Equal(recipePlan.initialSetup, inspectedReplayPlan.initialSetup)) {
        failureLinks.push("correlation.recipe-plan-initial-setup");
      }
    } catch {
      failureLinks.push("correlation.initial-setup-admission");
      replayPlan = undefined;
    }
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
    playerCount === undefined ||
    recipePlan === undefined ||
    initialSetup === undefined ||
    replayPlan === undefined
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
      plan: replayPlan,
      canonicalConfigDigest: payload.canonicalConfigDigest,
      launchEnvelopeDigest: payload.launchEnvelopeDigest,
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

function compareAuthoredOptionEvidence(
  failures: string[],
  unresolved: string[],
  authored: Readonly<Record<string, unknown>>,
  captured:
    | readonly Readonly<{
        status: "available" | "unavailable";
        key: string;
        value?: unknown;
      }>[]
    | undefined,
  evidencePrefix: string
): boolean {
  let missing = false;
  const evidenceByKey = new Map(captured?.map((evidence) => [evidence.key, evidence]) ?? []);
  for (const [key, value] of Object.entries(authored)) {
    const evidence = evidenceByKey.get(key);
    const evidenceLink = `${evidencePrefix}.${key}`;
    if (evidence === undefined) {
      unresolved.push(evidenceLink);
      missing = true;
    } else if (evidence.status === "unavailable") {
      unresolved.push(evidenceLink);
    } else if (!Value.Equal(evidence.value, value)) {
      failures.push(evidenceLink);
    }
  }
  return missing;
}

function uniqueSorted(values: readonly string[]): ReadonlyArray<string> {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}
