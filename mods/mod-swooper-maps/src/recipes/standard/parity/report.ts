import { Value } from "typebox/value";
import { compareStandardHydrology, type StandardHydrologyParityComparison } from "./hydrology.js";
import { compareStandardPlacement, type StandardPlacementParityComparison } from "./placement.js";
import { compareStandardFinalSurfaces, type StandardSurfaceComparison } from "./surfaces.js";
import {
  type StandardExactParityCapture,
  type StandardExactRecipePlanEvidence,
  type StandardExactRecipePlanPayloads,
  type StandardLiveParityCapture,
  type StandardLocalParityCapture,
  type StandardParityComparison,
  type StandardParitySurfaceKey,
} from "./types.js";

/** Closed report state separating completion from a contradictory product result. */
export type StandardParityReportState = "complete-pass" | "complete-failed" | "blocked-unresolved";

/** Correlation claims that bind exact authorship, replay, and live observation. */
type StandardParityIdentityComparison = Readonly<{
  planFingerprint: StandardParityComparison;
  mapSeed: StandardParityComparison;
  gameSeed: StandardParityComparison;
  mapSize: StandardParityComparison;
  playerCount: StandardParityComparison;
  aliveMajorPlayerIds: StandardParityComparison;
  canonicalConfigDigest: StandardParityComparison;
  launchEnvelopeDigest: StandardParityComparison;
  dimensions: StandardParityComparison;
  turn: StandardParityComparison;
  gameInstance: StandardParityComparison;
  fullGrid: StandardParityComparison;
}>;

/** Complete Standard product report over exact, replayed, and observed evidence. */
export type StandardParityReport = Readonly<{
  state: StandardParityReportState;
  identity: StandardParityIdentityComparison;
  surfaces: Readonly<Record<StandardParitySurfaceKey, StandardSurfaceComparison>>;
  hydrology: StandardHydrologyParityComparison;
  placement: StandardPlacementParityComparison;
  failureLinks: ReadonlyArray<string>;
  unresolvedLinks: ReadonlyArray<string>;
}>;

/**
 * Composes exact authorship, deterministic replay, and typed live observation
 * into one closed Standard parity result.
 */
export function buildStandardParityReport(
  args: Readonly<{
    exact: StandardExactParityCapture;
    local: StandardLocalParityCapture;
    live: StandardLiveParityCapture;
  }>
): StandardParityReport {
  const surfaces = compareStandardFinalSurfaces(args.local.surface, args.live.surface);
  const hydrology = compareStandardHydrology({
    exact: args.exact,
    local: args.local,
    live: args.live,
    featureSurface: surfaces.feature,
  });
  const placement = compareStandardPlacement(args.exact, args.local);
  const identity = compareStandardParityIdentity(args);
  const claims = [
    ...Object.values(identity),
    ...Object.values(surfaces).map(({ claim }) => claim),
    hydrology.rivers.terrain,
    hydrology.rivers.metadata,
    hydrology.rivers.nativeObjects,
    hydrology.floodplains.claim,
    placement.terminalParity.claim,
    placement.naturalWonderPlan.claim,
    placement.naturalWonderPlanInput.claim,
    placement.resourcePlacement.claim,
  ];
  const failureLinks = claimLinks(claims, "fail");
  const unresolvedLinks = claimLinks(claims, "unresolved");

  return {
    state:
      unresolvedLinks.length > 0
        ? "blocked-unresolved"
        : failureLinks.length > 0
          ? "complete-failed"
          : "complete-pass",
    identity,
    surfaces,
    hydrology,
    placement,
    failureLinks,
    unresolvedLinks,
  };
}

function compareStandardParityIdentity(
  args: Readonly<{
    exact: StandardExactParityCapture;
    local: StandardLocalParityCapture;
    live: StandardLiveParityCapture;
  }>
): StandardParityIdentityComparison {
  const { authorship } = args.exact;
  const localDimensions = args.local.surface.dimensions;
  const liveDimensions = args.live.surface.dimensions;
  const recipePlan = resolveExactRecipePlanPayloads(args.exact.recipePlan);
  return {
    planFingerprint:
      recipePlan.status === "missing"
        ? unresolvedEvidence(
            "Exact authorship does not contain both Standard recipe-plan lifecycle payloads.",
            ...recipePlan.evidenceLinks
          )
        : recipePlan.status === "mismatch"
          ? failedEvidence(
              "The Standard evidence and completion markers identify different recipe plans.",
              "identity.recipe-plan-payloads"
            )
          : equalEvidence(
              [recipePlan.value.planFingerprint, args.local.identity.planFingerprint],
              "Exact authorship and replay use the same admitted Standard recipe plan.",
              "The replayed Standard recipe plan diverges from exact authorship.",
              "identity.plan-fingerprint"
            ),
    mapSeed: equalEvidence(
      [
        authorship.request.seed,
        authorship.civSetup.mapSeed,
        authorship.runtime.seed,
        authorship.log.seed,
        args.local.identity.mapSeed,
        args.live.identity.mapSeed,
      ],
      "The map seed agrees across requested setup, applied Civ7 setup, exact runtime, replay, and live Civ7.",
      "The map seed diverges across requested setup, applied Civ7 setup, exact runtime, replay, or live Civ7.",
      "identity.map-seed"
    ),
    gameSeed: equalEvidence(
      [authorship.request.gameSeed, authorship.civSetup.gameSeed, args.local.identity.gameSeed],
      "The game seed agrees across requested setup, applied Civ7 setup, and replay correlation.",
      "The game seed diverges across requested setup, applied Civ7 setup, or replay correlation.",
      "identity.game-seed"
    ),
    mapSize: equalEvidence(
      [authorship.request.mapSize, args.local.identity.mapSize],
      "The Civ7 map-size identity agrees between exact authorship and replay.",
      "The Civ7 map-size identity diverges between exact authorship and replay.",
      "identity.map-size"
    ),
    playerCount:
      authorship.request.playerCount === undefined
        ? unresolvedEvidence(
            "Exact authorship does not contain the frozen player count.",
            "identity.player-count"
          )
        : equalEvidence(
            [
              authorship.request.playerCount,
              ...(recipePlan.status === "present"
                ? [recipePlan.value.initialSetup.value.aliveMajorPlayerIds.length]
                : []),
              args.local.identity.aliveMajorPlayerIds.length,
            ],
            "The frozen player count agrees between exact authorship and replay.",
            "The frozen player count diverges between exact authorship and replay.",
            "identity.player-count"
          ),
    aliveMajorPlayerIds:
      recipePlan.status === "missing"
        ? unresolvedEvidence(
            "Exact authorship does not contain both ordered alive-major player rosters.",
            ...recipePlan.evidenceLinks
          )
        : recipePlan.status === "mismatch"
          ? failedEvidence(
              "The Standard evidence and completion markers identify different ordered alive-major player rosters.",
              "identity.recipe-plan-payloads"
            )
          : equalEvidence(
              [
                recipePlan.value.initialSetup.value.aliveMajorPlayerIds,
                args.local.identity.aliveMajorPlayerIds,
              ],
              "The exact ordered alive-major player roster agrees between authorship and replay.",
              "The ordered alive-major player roster diverges between authorship and replay.",
              "identity.alive-major-player-ids"
            ),
    canonicalConfigDigest: equalEvidence(
      [
        authorship.canonicalConfigDigest,
        authorship.materialization.canonicalConfigDigest,
        authorship.log.canonicalConfigDigest,
        args.local.identity.canonicalConfigDigest,
      ],
      "The canonical Standard config digest agrees across all authorship links.",
      "The canonical Standard config digest diverges across authorship links.",
      "identity.canonical-config-digest"
    ),
    launchEnvelopeDigest: equalEvidence(
      [
        authorship.launchEnvelopeDigest,
        authorship.materialization.launchEnvelopeDigest,
        authorship.log.launchEnvelopeDigest,
        args.local.identity.launchEnvelopeDigest,
      ],
      "The frozen launch-envelope digest agrees across all authorship links.",
      "The frozen launch-envelope digest diverges across authorship links.",
      "identity.launch-envelope-digest"
    ),
    dimensions: equalEvidence(
      [
        dimensionsKey(authorship.runtime.width, authorship.runtime.height),
        dimensionsKey(authorship.log.dimensions.width, authorship.log.dimensions.height),
        dimensionsKey(localDimensions.width, localDimensions.height),
        dimensionsKey(liveDimensions.width, liveDimensions.height),
      ],
      "Exact runtime, replay, and live observation use the same Civ7 dimensions.",
      "Exact runtime, replay, and live observation dimensions diverge.",
      "identity.dimensions"
    ),
    turn: equalEvidence(
      [authorship.runtime.turn, args.live.identity.turn],
      "The exact runtime and live observation have the same Civ7 turn.",
      "The exact runtime and live observation have different Civ7 turns.",
      "identity.turn"
    ),
    gameInstance: unresolvedEvidence(
      "Civ7 exposes no supported game-instance token that can correlate the exact-start window with the later Direct Control observation window.",
      "identity.cross-window-game-instance"
    ),
    fullGrid:
      args.live.fullGrid.identityStable &&
      args.live.fullGrid.observedPlotCount === args.live.fullGrid.plotCount &&
      args.live.fullGrid.missingPlotIndices.length === 0
        ? passedEvidence(
            "The live observation covers every plot within one stable Direct Control read window.",
            "identity.full-grid"
          )
        : unresolvedEvidence("The live observation omits one or more plots.", "identity.full-grid"),
  };
}

function equalEvidence(
  values: readonly unknown[],
  passReason: string,
  failReason: string,
  evidenceLink: string
): StandardParityComparison {
  const [expected, ...observed] = values;
  return observed.every((value) => Value.Equal(value, expected))
    ? passedEvidence(passReason, evidenceLink)
    : {
        status: "fail",
        reason: failReason,
        evidenceLinks: [evidenceLink],
      };
}

function failedEvidence(reason: string, evidenceLink: string): StandardParityComparison {
  return { status: "fail", reason, evidenceLinks: [evidenceLink] };
}

function passedEvidence(reason: string, evidenceLink: string): StandardParityComparison {
  return { status: "pass", reason, evidenceLinks: [evidenceLink] };
}

function unresolvedEvidence(reason: string, ...evidenceLinks: string[]): StandardParityComparison {
  return { status: "unresolved", reason, evidenceLinks };
}

function resolveExactRecipePlanPayloads(
  payloads: StandardExactRecipePlanPayloads
):
  | Readonly<{ status: "present"; value: StandardExactRecipePlanEvidence }>
  | Readonly<{ status: "missing"; evidenceLinks: readonly string[] }>
  | Readonly<{ status: "mismatch" }> {
  const evidenceLinks = [payloads.evidence, payloads.completion]
    .filter((payload) => payload.status === "missing")
    .map((payload) => payload.evidenceLink);
  if (evidenceLinks.length > 0) return { status: "missing", evidenceLinks };
  if (payloads.evidence.status !== "present" || payloads.completion.status !== "present") {
    throw new Error("Standard exact recipe-plan payload resolution reached an impossible state.");
  }
  return Value.Equal(payloads.evidence.value, payloads.completion.value)
    ? { status: "present", value: payloads.evidence.value }
    : { status: "mismatch" };
}

function dimensionsKey(width: number, height: number): string {
  return `${width}x${height}`;
}

function claimLinks(
  claims: readonly StandardParityComparison[],
  status: "fail" | "unresolved"
): ReadonlyArray<string> {
  return [
    ...new Set(
      claims.flatMap((claim) => {
        const explicit = status === "fail" ? claim.failureLinks : claim.unresolvedLinks;
        return explicit ?? (claim.status === status ? claim.evidenceLinks : []);
      })
    ),
  ].sort((left, right) => left.localeCompare(right));
}
