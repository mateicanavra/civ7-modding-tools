import type { Civ7LifecycleSinglePlayerStartResult } from "@civ7/control-orpc";
import { snapshotRunInGameExactAuthorshipEvidence } from "@civ7/studio-contract";
import type {
  RunInGameContentMarkerEvidence,
  RunInGameFileIdentity,
  RunInGameMaterializationStatus,
  RunInGameRequestStatus,
} from "@civ7/studio-server";
import type { RunInGameDetailedExactAuthorshipEvidence } from "./evidenceTypes";
import {
  type RunInGameRequiredContentMarker,
  runInGameRequiredMaterializationMarkers,
} from "./fileEvidence";

export function buildRunInGameExactAuthorshipEvidence(args: {
  requestId: string;
  request?: RunInGameRequestStatus;
  materialization: RunInGameMaterializationStatus;
  sourceConfig?: RunInGameFileIdentity;
  generatedSourceScript?: RunInGameFileIdentity;
  localModScript?: RunInGameFileIdentity;
  deployedModScript?: RunInGameFileIdentity;
  lifecycleSetup: Civ7LifecycleSinglePlayerStartResult["evidence"]["setup"];
  lifecycleRuntime: Civ7LifecycleSinglePlayerStartResult["evidence"]["runtime"];
  logEvidence?: RunInGameDetailedExactAuthorshipEvidence["log"];
  liveRuntimeSnapshot?: {
    snapshotId?: string;
    snapshotHash?: string;
    turn?: number;
    gameHash?: number;
  };
  createdAt?: string;
}): RunInGameDetailedExactAuthorshipEvidence {
  const setupReadback = args.lifecycleSetup;
  const runtimeSummary = args.lifecycleRuntime;
  const runtimeTurn = runtimeSummary.turn ?? args.liveRuntimeSnapshot?.turn;
  const runtimeGameHash = runtimeSummary.gameHash ?? args.liveRuntimeSnapshot?.gameHash;
  const sourceConfig = args.sourceConfig ?? args.materialization.sourceConfig;
  const generatedSourceScript =
    args.generatedSourceScript ?? args.materialization.generatedSourceScript;
  const localModScript = args.localModScript ?? args.materialization.localModScript;
  const deployedModScript = args.deployedModScript ?? args.materialization.deployedModScript;
  const usesRequestGeneratedMod = isRequestGeneratedModMaterialization(args.materialization);
  const unresolvedLinks: string[] = [];
  const requiredMaterializationMarkers =
    args.materialization.canonicalConfigDigest && args.materialization.launchEnvelopeDigest
      ? runInGameRequiredMaterializationMarkers({
          requestId: args.requestId,
          canonicalConfigDigest: args.materialization.canonicalConfigDigest,
          launchEnvelopeDigest: args.materialization.launchEnvelopeDigest,
        })
      : undefined;
  const materializationScriptLinks = runInGameMaterializationScriptUnresolvedLinks({
    materialization: args.materialization,
    localModScript,
    deployedModScript,
    requiredMarkers: requiredMaterializationMarkers,
  });

  addMissing(
    unresolvedLinks,
    Boolean(args.request?.canonicalConfigDigest),
    "request.canonical-config-digest"
  );
  addMissing(
    unresolvedLinks,
    Boolean(args.request?.launchEnvelopeDigest),
    "request.launch-envelope-digest"
  );
  addMissing(unresolvedLinks, Boolean(args.request?.recipeId), "request.recipe-id");
  addMissing(unresolvedLinks, args.request?.seed !== undefined, "request.seed");
  addMissing(unresolvedLinks, Boolean(args.request?.mapSize), "request.map-size");
  addMissing(
    unresolvedLinks,
    Boolean(args.materialization.mapScript),
    "materialization.map-script"
  );
  addMissing(
    unresolvedLinks,
    Boolean(args.materialization.canonicalConfigDigest),
    "materialization.canonical-config-digest"
  );
  addMissing(
    unresolvedLinks,
    Boolean(args.materialization.launchEnvelopeDigest),
    "materialization.launch-envelope-digest"
  );
  if (usesRequestGeneratedMod) {
    addMissing(
      unresolvedLinks,
      Boolean(args.materialization.generationManifestDigest),
      "materialization.generation-manifest-digest"
    );
    addMissing(
      unresolvedLinks,
      Boolean(args.materialization.runArtifactId),
      "materialization.run-artifact-id"
    );
    addMissing(
      unresolvedLinks,
      Boolean(args.materialization.generatedModRoot),
      "materialization.generated-mod-root"
    );
    addMissing(
      unresolvedLinks,
      args.materialization.generatedModFileCount !== undefined,
      "materialization.generated-mod-file-count"
    );
    addMissing(
      unresolvedLinks,
      Boolean(args.materialization.generatedModDigest),
      "materialization.generated-mod-digest"
    );
    addMissing(
      unresolvedLinks,
      Boolean(args.materialization.mapRowId),
      "materialization.map-row-id"
    );
  } else {
    addMissing(unresolvedLinks, Boolean(sourceConfig), "materialization.source-config-file");
    addMissing(
      unresolvedLinks,
      Boolean(generatedSourceScript),
      "materialization.generated-source-script"
    );
  }
  addMissing(unresolvedLinks, Boolean(localModScript), "materialization.local-mod-script");
  addMissing(unresolvedLinks, Boolean(deployedModScript), "materialization.deployed-mod-script");
  addMissing(unresolvedLinks, args.lifecycleSetup.mapRowFiles.length > 0, "civ-setup.map-row");
  addMissing(
    unresolvedLinks,
    setupReadback.mapScript !== undefined,
    "civ-setup.map-script-readback"
  );
  addMissing(unresolvedLinks, setupReadback.mapSize !== undefined, "civ-setup.map-size-readback");
  addMissing(unresolvedLinks, setupReadback.mapSeed !== undefined, "civ-setup.map-seed-readback");
  addMissing(unresolvedLinks, setupReadback.gameSeed !== undefined, "civ-setup.game-seed-readback");
  if (args.request?.playerCount !== undefined) {
    addMissing(
      unresolvedLinks,
      setupReadback.playerCount !== undefined,
      "civ-setup.player-count-readback"
    );
  }
  addMissing(unresolvedLinks, runtimeSummary.seed !== undefined, "runtime.seed-readback");
  addMissing(
    unresolvedLinks,
    runtimeSummary.width !== undefined && runtimeSummary.height !== undefined,
    "runtime.dimensions"
  );
  addMissing(unresolvedLinks, runtimeSummary.plotCount !== undefined, "runtime.plot-count");
  addMissing(unresolvedLinks, runtimeTurn !== undefined, "runtime.turn");
  addMissing(unresolvedLinks, runtimeGameHash !== undefined, "runtime.game-hash");
  addMissing(
    unresolvedLinks,
    Boolean(args.liveRuntimeSnapshot?.snapshotId),
    "runtime.live-snapshot-id"
  );
  addMissing(
    unresolvedLinks,
    Boolean(args.liveRuntimeSnapshot?.snapshotHash),
    "runtime.live-snapshot-hash"
  );
  addMissing(unresolvedLinks, Boolean(args.logEvidence), "swooper-log.parsed-evidence");

  addStringMismatch(
    unresolvedLinks,
    args.request?.canonicalConfigDigest,
    args.materialization.canonicalConfigDigest,
    "request.canonical-config-digest-mismatch"
  );
  addStringMismatch(
    unresolvedLinks,
    args.request?.launchEnvelopeDigest,
    args.materialization.launchEnvelopeDigest,
    "request.launch-envelope-digest-mismatch"
  );
  addStringMismatch(
    unresolvedLinks,
    setupReadback.mapScript,
    args.materialization.mapScript,
    "civ-setup.map-script-mismatch"
  );
  addStringMismatch(
    unresolvedLinks,
    setupReadback.mapSize,
    args.request?.mapSize,
    "civ-setup.map-size-mismatch"
  );
  addNumberMismatch(
    unresolvedLinks,
    setupReadback.mapSeed,
    args.request?.seed,
    "civ-setup.map-seed-mismatch"
  );
  addNumberMismatch(
    unresolvedLinks,
    setupReadback.gameSeed,
    args.request?.seed,
    "civ-setup.game-seed-mismatch"
  );
  addNumberMismatch(
    unresolvedLinks,
    setupReadback.playerCount,
    args.request?.playerCount,
    "civ-setup.player-count-mismatch"
  );
  addNumberMismatch(
    unresolvedLinks,
    runtimeSummary.seed,
    args.request?.seed,
    "runtime.seed-mismatch"
  );
  addNumberMismatch(
    unresolvedLinks,
    args.logEvidence?.seed,
    args.request?.seed,
    "swooper-log.seed-mismatch"
  );
  addStringMismatch(
    unresolvedLinks,
    args.logEvidence?.requestId,
    args.requestId,
    "swooper-log.request-id-mismatch"
  );
  addStringMismatch(
    unresolvedLinks,
    args.logEvidence?.canonicalConfigDigest,
    args.materialization.canonicalConfigDigest,
    "swooper-log.canonical-config-digest-mismatch"
  );
  addStringMismatch(
    unresolvedLinks,
    args.logEvidence?.launchEnvelopeDigest,
    args.materialization.launchEnvelopeDigest,
    "swooper-log.launch-envelope-digest-mismatch"
  );
  addNumberMismatch(
    unresolvedLinks,
    args.logEvidence?.dimensions.width,
    runtimeSummary.width,
    "runtime.log-width-mismatch"
  );
  addNumberMismatch(
    unresolvedLinks,
    args.logEvidence?.dimensions.height,
    runtimeSummary.height,
    "runtime.log-height-mismatch"
  );
  unresolvedLinks.push(...materializationScriptLinks);

  const evidence = {
    status: unresolvedLinks.length === 0 ? "complete" : "unresolved",
    requestId: args.requestId,
    createdAt: args.createdAt ?? new Date().toISOString(),
    ...(args.request?.canonicalConfigDigest === undefined
      ? {}
      : { canonicalConfigDigest: args.request.canonicalConfigDigest }),
    ...(args.request?.launchEnvelopeDigest === undefined
      ? {}
      : { launchEnvelopeDigest: args.request.launchEnvelopeDigest }),
    request: {
      ...(args.request?.recipeId === undefined ? {} : { recipeId: args.request.recipeId }),
      ...(args.request?.seed === undefined ? {} : { seed: args.request.seed }),
      ...(args.request?.mapSize === undefined ? {} : { mapSize: args.request.mapSize }),
      ...(args.request?.playerCount === undefined ? {} : { playerCount: args.request.playerCount }),
      ...(args.request?.resources === undefined ? {} : { resources: args.request.resources }),
    },
    materialization: {
      ...(args.materialization.path === undefined ? {} : { path: args.materialization.path }),
      ...(args.materialization.mapScript === undefined
        ? {}
        : { mapScript: args.materialization.mapScript }),
      ...(args.materialization.canonicalConfigDigest === undefined
        ? {}
        : { canonicalConfigDigest: args.materialization.canonicalConfigDigest }),
      ...(args.materialization.launchEnvelopeDigest === undefined
        ? {}
        : { launchEnvelopeDigest: args.materialization.launchEnvelopeDigest }),
      ...(args.materialization.generationManifestDigest === undefined
        ? {}
        : { generationManifestDigest: args.materialization.generationManifestDigest }),
      ...(args.materialization.runArtifactId === undefined
        ? {}
        : { runArtifactId: args.materialization.runArtifactId }),
      ...(args.materialization.generatedModRoot === undefined
        ? {}
        : { generatedModRoot: args.materialization.generatedModRoot }),
      ...(args.materialization.generatedModFileCount === undefined
        ? {}
        : { generatedModFileCount: args.materialization.generatedModFileCount }),
      ...(args.materialization.generatedModDigest === undefined
        ? {}
        : { generatedModDigest: args.materialization.generatedModDigest }),
      ...(args.materialization.mapRowId === undefined
        ? {}
        : { mapRowId: args.materialization.mapRowId }),
      ...(sourceConfig ? { sourceConfig } : {}),
      ...(generatedSourceScript ? { generatedSourceScript } : {}),
      ...(localModScript ? { localModScript } : {}),
      ...(deployedModScript ? { deployedModScript } : {}),
      ...(args.materialization.localModScriptContent
        ? { localModScriptContent: args.materialization.localModScriptContent }
        : {}),
      ...(args.materialization.deployedModScriptContent
        ? { deployedModScriptContent: args.materialization.deployedModScriptContent }
        : {}),
    },
    civSetup: {
      ...(setupReadback.mapScript === undefined ? {} : { mapScript: setupReadback.mapScript }),
      ...(setupReadback.mapSize === undefined ? {} : { mapSize: setupReadback.mapSize }),
      ...(setupReadback.mapSeed === undefined ? {} : { mapSeed: setupReadback.mapSeed }),
      ...(setupReadback.gameSeed === undefined ? {} : { gameSeed: setupReadback.gameSeed }),
      ...(setupReadback.playerCount === undefined
        ? {}
        : { playerCount: setupReadback.playerCount }),
      rowCount: args.lifecycleSetup.mapRowFiles.length,
    },
    runtime: {
      ...(runtimeSummary.seed === undefined ? {} : { seed: runtimeSummary.seed }),
      ...(runtimeSummary.width === undefined ? {} : { width: runtimeSummary.width }),
      ...(runtimeSummary.height === undefined ? {} : { height: runtimeSummary.height }),
      ...(runtimeSummary.plotCount === undefined ? {} : { plotCount: runtimeSummary.plotCount }),
      ...(runtimeTurn === undefined ? {} : { turn: runtimeTurn }),
      ...(runtimeGameHash === undefined ? {} : { gameHash: runtimeGameHash }),
      ...(args.liveRuntimeSnapshot?.snapshotId
        ? { sourceSnapshotId: args.liveRuntimeSnapshot.snapshotId }
        : {}),
      ...(args.liveRuntimeSnapshot?.snapshotHash
        ? { snapshotHash: args.liveRuntimeSnapshot.snapshotHash }
        : {}),
    },
    ...(args.logEvidence ? { log: args.logEvidence } : {}),
    unresolvedLinks,
  };
  const parsed = snapshotRunInGameExactAuthorshipEvidence(evidence);
  if (parsed === undefined || !isDetailedExactAuthorshipEvidence(parsed)) {
    throw new TypeError("Run in Game exact-authorship builder produced an invalid evidence state.");
  }
  return parsed;
}

function isDetailedExactAuthorshipEvidence(
  value: unknown
): value is RunInGameDetailedExactAuthorshipEvidence {
  return snapshotRunInGameExactAuthorshipEvidence(value) !== undefined;
}

export function runInGameMaterializationScriptUnresolvedLinks(args: {
  materialization: RunInGameMaterializationStatus;
  localModScript?: RunInGameFileIdentity;
  deployedModScript?: RunInGameFileIdentity;
  requiredMarkers?: ReadonlyArray<RunInGameRequiredContentMarker>;
}): string[] {
  const localModScript = args.localModScript ?? args.materialization.localModScript;
  const deployedModScript = args.deployedModScript ?? args.materialization.deployedModScript;
  const links: string[] = [];
  addStringMismatch(
    links,
    localModScript?.sha256,
    deployedModScript?.sha256,
    "materialization.deployed-mod-script-hash-mismatch"
  );
  addMissing(
    links,
    Boolean(args.materialization.localModScriptContent),
    "materialization.local-mod-script-content-evidence"
  );
  addMissing(
    links,
    Boolean(args.materialization.deployedModScriptContent),
    "materialization.deployed-mod-script-content-evidence"
  );
  addStringMismatch(
    links,
    args.materialization.localModScriptContent?.path,
    localModScript?.path,
    "materialization.local-mod-script-content-path-mismatch"
  );
  addStringMismatch(
    links,
    args.materialization.deployedModScriptContent?.path,
    deployedModScript?.path,
    "materialization.deployed-mod-script-content-path-mismatch"
  );
  pushMissingContentMarkers(
    links,
    args.materialization.localModScriptContent?.markers,
    "materialization.local-mod-script-marker",
    args.requiredMarkers
  );
  pushMissingContentMarkers(
    links,
    args.materialization.deployedModScriptContent?.markers,
    "materialization.deployed-mod-script-marker",
    args.requiredMarkers
  );
  return links;
}

function isRequestGeneratedModMaterialization(
  materialization: RunInGameMaterializationStatus
): boolean {
  return (
    materialization.generationManifestDigest !== undefined ||
    materialization.runArtifactId !== undefined ||
    materialization.generatedModRoot !== undefined ||
    materialization.generatedModFileCount !== undefined ||
    materialization.generatedModDigest !== undefined ||
    materialization.mapRowId !== undefined
  );
}

function pushMissingContentMarkers(
  links: string[],
  markers: ReadonlyArray<RunInGameContentMarkerEvidence> | undefined,
  prefix: string,
  requiredMarkers: ReadonlyArray<RunInGameRequiredContentMarker> | undefined
): void {
  if (markers === undefined) return;
  for (const required of requiredMarkers ?? []) {
    if (!markers.some((marker) => marker.id === required.id)) {
      links.push(`${prefix}.${required.id}`);
    }
  }
  for (const marker of markers) {
    if (!marker.present) links.push(`${prefix}.${marker.id}`);
  }
}

function addMissing(links: string[], condition: boolean, link: string): void {
  if (!condition) links.push(link);
}

function addStringMismatch(links: string[], left: unknown, right: unknown, link: string): void {
  if (left === undefined || right === undefined) return;
  if (String(left) !== String(right)) links.push(link);
}

function addNumberMismatch(links: string[], left: unknown, right: unknown, link: string): void {
  if (left === undefined || right === undefined) return;
  const leftNumber = numberValue(left);
  const rightNumber = numberValue(right);
  if (leftNumber === undefined || rightNumber === undefined || leftNumber !== rightNumber) {
    links.push(link);
  }
}

function numberValue(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
