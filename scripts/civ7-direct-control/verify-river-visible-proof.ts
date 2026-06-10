#!/usr/bin/env bun

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";

import type {
  FinalSurfaceParityProof,
  NativeRiverObjectSnapshot,
  RiverMetadataSnapshot,
  SurfaceGrid,
} from "../../mods/mod-swooper-maps/src/dev/diagnostics/live-parity.ts";
import {
  captureCiv7Screenshot,
  focusCiv7CameraOnPlot,
  type Civ7CameraFocusInput,
  type Civ7CameraFocusResult,
  type Civ7DirectControlOptions,
  type Civ7ScreenshotCaptureInput,
  type Civ7ScreenshotCaptureResult,
} from "../../packages/civ7-direct-control/src/index.ts";

type VisualVerdict = "visible" | "not-visible" | "obscured" | "inconclusive";
type CameraSource = "direct-control" | "manual" | "unknown";
type VerdictSource = "manual-review" | "classifier";
type CaptureMode = "direct-control" | "os-fallback" | "manual-file";
type DirtyState = "clean" | "dirty";
type MaterializationDisposition =
  | "terrain-only"
  | "native-writer-parity-pass"
  | "native-writer-parity-fail"
  | "native-writer-not-run"
  | "unsupported-writer-surface";
type MinorRiverClaim = "not-claimed" | "claimed";

type Args = Readonly<{
  parityProof?: string;
  runIdentity?: string;
  cameraProof?: string;
  captureProof?: string;
  screenshots: ReadonlyArray<string>;
  directControlCapture: boolean;
  host?: string;
  port?: number;
  timeoutMs?: number;
  directControlZoom?: number;
  artifactDir?: string;
  cameraProofOutput?: string;
  nativeCaptureOutput?: string;
  captureProofOutput?: string;
  cameraTarget?: MapLocation;
  cameraSource: CameraSource;
  cameraZoom?: string;
  visibilityState?: string;
  materializationDisposition?: MaterializationDisposition;
  minorRiverClaim: MinorRiverClaim;
  verdict?: VisualVerdict;
  verdictSource?: VerdictSource;
  captureMode: CaptureMode;
  maxSamples: number;
  output?: string;
  help: boolean;
}>;

type MapLocation = Readonly<{ x: number; y: number }>;

type RiverSample = Readonly<{
  x: number;
  y: number;
  index: number;
  projectedNavigableTerrain: number | null;
  liveTerrainNavigableRiver: number | null;
  liveNavigableRiver: number | null;
  liveRiverType: number | null;
  nativeRiverObjects: ReadonlyArray<NativeRiverSampleBinding>;
}>;

type NativeRiverSampleBinding = Readonly<{
  riverIndex: number;
  riverType: number | null;
  connectedToOcean: boolean | null;
  plotIndex: number;
}>;

type ScreenshotProof = Readonly<{
  path: string;
  sha256: string;
  sizeBytes: number;
  captureMode: CaptureMode;
  target: MapLocation;
  captureProofHash?: string;
  dimensions?: ImageDimensions;
}>;

type ImageDimensions = Readonly<{ width: number; height: number }>;

type CaptureProofManifest = Readonly<{
  path: string;
  sha256: string;
  sizeBytes: number;
  captureMode: CaptureMode;
  target: MapLocation;
  cameraProofHash: string;
  capturedAt?: string;
  tool?: string;
  dimensions?: ImageDimensions;
}>;

type DirectControlVisibleCaptureArtifacts = Readonly<{
  selectedTarget: MapLocation;
  cameraProofPath: string;
  nativeCaptureResultPath: string;
  nativeCaptureStatus: Civ7ScreenshotCaptureResult["closureManifestStatus"];
  captureProofPath?: string;
  screenshotPath?: string;
}>;

type DirectControlVisibleCaptureDependencies = Readonly<{
  focusCamera: (input: Civ7CameraFocusInput, options: Civ7DirectControlOptions) => Promise<Civ7CameraFocusResult>;
  captureScreenshot: (
    input: Civ7ScreenshotCaptureInput,
    options: Civ7DirectControlOptions,
  ) => Promise<Civ7ScreenshotCaptureResult>;
  now: () => Date;
}>;

type RunIdentityManifest = Readonly<{
  branch: string;
  commit: string;
  worktree: string;
  dirtyState: DirtyState;
  dirtyDiffHash?: string;
  requestId: string;
  configHash: string;
  envelopeHash: string;
  seed?: number;
  mapSize?: string;
  dimensions?: Readonly<{ width?: number; height?: number }>;
  createdAt?: string;
  source?: string;
}>;

type RunIdentityProof = Readonly<{
  status: "bound" | "missing" | "blocked";
  manifest?: RunIdentityManifest;
  parity: Readonly<{
    requestId?: string;
    configHash?: string;
    envelopeHash?: string;
    seed?: number;
    mapSize?: string;
    dimensions?: Readonly<{ width?: number; height?: number }>;
    runtime?: unknown;
  }>;
  blockedBy: ReadonlyArray<string>;
}>;

type MaterializationProof = Readonly<{
  disposition: MaterializationDisposition;
  terrainReadbackStatus: string;
  metadataReadbackStatus: string;
  minorRiverClaim: MinorRiverClaim;
  blockedBy: ReadonlyArray<string>;
}>;

type CameraFocusProof = Readonly<{
  source: "app-ui-camera";
  target: MapLocation;
  targetIndex: Civ7CameraFocusResult["targetIndex"];
  options: Civ7CameraFocusResult["options"];
  state: Civ7CameraFocusResult["state"];
  lookAt: Civ7CameraFocusResult["lookAt"];
  plotCursor: Civ7CameraFocusResult["plotCursor"];
  afterCenterPlot: Civ7CameraFocusResult["after"]["centerPlot"];
  proofHash: string;
}>;

type NativeRiverObjectsProof = Readonly<{
  status: "present" | "zero-rivers" | "missing" | "unavailable";
  numRivers: number | null;
  sampleCount: number;
  sampledPlotCount: number;
  samplesWithPlots: number;
  blockedBy: ReadonlyArray<string>;
}>;

type RiverVisibleProofStatus =
  | "visible"
  | "not-visible"
  | "obscured"
  | "inconclusive"
  | "blocked";

export type RiverVisibleProof = Readonly<{
  version: 1;
  createdAt: string;
  source: "river-runtime-visible-proof";
  parityProofHash: string;
  exactAuthorshipSummary: FinalSurfaceParityProof["exactAuthorshipSummary"];
  runIdentity: RunIdentityProof;
  materialization: MaterializationProof;
  liveRiverSamples: Readonly<{
    status: "selected" | "missing";
    totalLiveTerrainNavigableRiverTiles: number;
    totalProjectedNavigableTerrainTiles: number;
    sampleCount: number;
    samples: ReadonlyArray<RiverSample>;
  }>;
  nativeRiverObjects: NativeRiverObjectsProof;
  camera: Readonly<{
    status: "bound-to-sample" | "missing" | "target-not-sampled";
    source: CameraSource;
    target?: MapLocation;
    zoom?: string;
    visibilityState?: string;
    focusProof?: CameraFocusProof;
  }>;
  screenshots: Readonly<{
    status: "bound" | "missing" | "path-missing" | "capture-mismatch" | "target-not-sampled";
    items: ReadonlyArray<ScreenshotProof>;
    missingPaths: ReadonlyArray<string>;
  }>;
  visualVerdict: Readonly<{
    status: VisualVerdict | "missing";
    source?: VerdictSource;
  }>;
  blockedBy: ReadonlyArray<string>;
}>;

export type RiverVisibleProofOutput = Readonly<{
  ok: boolean;
  status: RiverVisibleProofStatus;
  proofHash: string;
  proof: RiverVisibleProof;
  artifacts?: DirectControlVisibleCaptureArtifacts;
}>;

const usage = `Usage:
  bun scripts/civ7-direct-control/verify-river-visible-proof.ts --parity-proof <path> [flags]

Required for a passing visible proof:
  --parity-proof <path>          Final-surface parity proof JSON
  --run-identity <path>          Run identity manifest JSON with request/config/envelope plus seed/map/dimensions
  --camera-proof <path>          Direct-control camera focus proof JSON, unless generated by --direct-control-capture
  --capture-proof <path>         Screenshot capture manifest JSON, unless generated by --direct-control-capture
  --camera-target <x,y>          Optional target override; must match camera proof and one sampled live river tile
  --camera-source <source>       debug label only; passing proof requires --camera-proof
  --screenshot <path>            Repeatable screenshot artifact path
  --verdict <verdict>            visible | not-visible | obscured | inconclusive
  --verdict-source <source>      manual-review | classifier

Options:
  --direct-control-capture       Focus camera and request XR.World.takeScreenshot through @civ7/direct-control
  --host <host>                  Direct-control host for --direct-control-capture
  --port <port>                  Direct-control port for --direct-control-capture
  --timeout-ms <ms>              Direct-control timeout for --direct-control-capture
  --direct-control-zoom <n>      Numeric Camera.lookAtPlot zoom for --direct-control-capture
  --artifact-dir <path>          Directory for generated camera/native-capture/capture-manifest artifacts
  --camera-proof-output <path>   Output path for generated camera focus proof
  --native-capture-output <path> Output path for generated native screenshot request result
  --capture-proof-output <path>  Output path for generated file-backed capture manifest
  --capture-mode <mode>          direct-control | os-fallback | manual-file (default: manual-file; passing proof rejects manual-file)
  --camera-zoom <value>          Captured zoom label/value
  --visibility-state <value>     Captured visibility/layer/graphics state
  --materialization-disposition <value>
                                  terrain-only | native-writer-parity-pass | native-writer-parity-fail | native-writer-not-run | unsupported-writer-surface
  --minor-river-claim <value>    not-claimed | claimed (default: not-claimed)
  --max-samples <n>              Number of live river tiles to sample (default: 8)
  --output <path>                Write proof JSON to path
`;

function parseArgs(argv: string[]): Args {
  const args: {
    parityProof?: string;
    runIdentity?: string;
    cameraProof?: string;
    captureProof?: string;
    screenshots: string[];
    directControlCapture: boolean;
    host?: string;
    port?: number;
    timeoutMs?: number;
    directControlZoom?: number;
    artifactDir?: string;
    cameraProofOutput?: string;
    nativeCaptureOutput?: string;
    captureProofOutput?: string;
    cameraTarget?: MapLocation;
    cameraSource: CameraSource;
    cameraZoom?: string;
    visibilityState?: string;
    materializationDisposition?: MaterializationDisposition;
    minorRiverClaim: MinorRiverClaim;
    verdict?: VisualVerdict;
    verdictSource?: VerdictSource;
    captureMode: CaptureMode;
    maxSamples: number;
    output?: string;
    help: boolean;
  } = {
    screenshots: [],
    directControlCapture: false,
    cameraSource: "unknown",
    captureMode: "manual-file",
    minorRiverClaim: "not-claimed",
    maxSamples: 8,
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = () => {
      const next = argv[index + 1];
      if (!next || next.startsWith("--")) throw new Error(`Missing value for ${arg}`);
      index += 1;
      return next;
    };
    switch (arg) {
      case "--help":
      case "-h":
        args.help = true;
        break;
      case "--parity-proof":
        args.parityProof = value();
        break;
      case "--run-identity":
        args.runIdentity = value();
        break;
      case "--camera-proof":
        args.cameraProof = value();
        break;
      case "--capture-proof":
        args.captureProof = value();
        break;
      case "--screenshot":
        args.screenshots.push(value());
        break;
      case "--direct-control-capture":
        args.directControlCapture = true;
        break;
      case "--host":
        args.host = value();
        break;
      case "--port":
        args.port = parsePositiveInteger(value(), arg);
        break;
      case "--timeout-ms":
        args.timeoutMs = parsePositiveInteger(value(), arg);
        break;
      case "--direct-control-zoom":
        args.directControlZoom = parseFiniteNumber(value(), arg);
        break;
      case "--artifact-dir":
        args.artifactDir = value();
        break;
      case "--camera-proof-output":
        args.cameraProofOutput = value();
        break;
      case "--native-capture-output":
        args.nativeCaptureOutput = value();
        break;
      case "--capture-proof-output":
        args.captureProofOutput = value();
        break;
      case "--camera-target":
        args.cameraTarget = parseLocation(value(), arg);
        break;
      case "--camera-source":
        args.cameraSource = parseEnum(value(), ["direct-control", "manual", "unknown"], arg);
        break;
      case "--camera-zoom":
        args.cameraZoom = value();
        break;
      case "--visibility-state":
        args.visibilityState = value();
        break;
      case "--materialization-disposition":
        args.materializationDisposition = parseEnum(value(), [
          "terrain-only",
          "native-writer-parity-pass",
          "native-writer-parity-fail",
          "native-writer-not-run",
          "unsupported-writer-surface",
        ], arg);
        break;
      case "--minor-river-claim":
        args.minorRiverClaim = parseEnum(value(), ["not-claimed", "claimed"], arg);
        break;
      case "--verdict":
        args.verdict = parseEnum(value(), ["visible", "not-visible", "obscured", "inconclusive"], arg);
        break;
      case "--verdict-source":
        args.verdictSource = parseEnum(value(), ["manual-review", "classifier"], arg);
        break;
      case "--capture-mode":
        args.captureMode = parseEnum(value(), ["direct-control", "os-fallback", "manual-file"], arg);
        break;
      case "--max-samples":
        args.maxSamples = parsePositiveInteger(value(), arg);
        break;
      case "--output":
        args.output = value();
        break;
      default:
        throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function parseEnum<const T extends string>(value: string, accepted: readonly T[], label: string): T {
  if ((accepted as readonly string[]).includes(value)) return value as T;
  throw new Error(`${label} must be one of: ${accepted.join(", ")}`);
}

function parseLocation(value: string, label: string): MapLocation {
  const [x, y] = value.split(",").map((part) => Number(part.trim()));
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0) {
    throw new Error(`${label} must be a non-negative x,y pair: ${value}`);
  }
  return { x, y };
}

function parsePositiveInteger(value: string, label: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} must be a positive integer: ${value}`);
  }
  return parsed;
}

function parseFiniteNumber(value: string, label: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} must be a finite number: ${value}`);
  }
  return parsed;
}

export function extractFinalSurfaceParityProof(payload: unknown): FinalSurfaceParityProof {
  const proof = isRecord(payload) && isRecord(payload.proof) ? payload.proof : payload;
  if (!isRecord(proof) || !isRecord(proof.local) || !isRecord(proof.live)) {
    throw new Error("Missing final-surface parity proof payload");
  }
  return proof as FinalSurfaceParityProof;
}

export function buildRiverVisibleProofOutput(args: {
  parity: FinalSurfaceParityProof;
  runIdentity?: RunIdentityManifest;
  screenshots?: ReadonlyArray<string>;
  cameraTarget?: MapLocation;
  cameraProof?: Civ7CameraFocusResult;
  captureProof?: CaptureProofManifest;
  cameraSource?: CameraSource;
  cameraZoom?: string;
  visibilityState?: string;
  materializationDisposition?: MaterializationDisposition;
  minorRiverClaim?: MinorRiverClaim;
  verdict?: VisualVerdict;
  verdictSource?: VerdictSource;
  captureMode?: CaptureMode;
  maxSamples?: number;
  now?: () => Date;
}): RiverVisibleProofOutput {
  const maxSamples = Math.max(1, Math.trunc(args.maxSamples ?? 8));
  const parityProofHash = hashValue(args.parity);
  const runIdentity = buildRunIdentityProof(args.runIdentity, args.parity);
  const materialization = buildMaterializationProof({
    parity: args.parity,
    disposition: args.materializationDisposition,
    minorRiverClaim: args.minorRiverClaim ?? "not-claimed",
  });
  const cameraFocusProofHash = args.cameraProof === undefined ? undefined : hashValue(args.cameraProof);
  const allLiveSamples = collectLiveRiverSamples(args.parity.live.riverMetadata, args.parity.local.riverMetadata);
  const nativeRiverPlotMembership = nativeRiverPlotMembershipByIndex(args.parity.live.nativeRiverObjects);
  const selectedSamples = sampleEvenly(allLiveSamples, maxSamples).map((sample) => ({
    ...sample,
    nativeRiverObjects: nativeRiverPlotMembership.get(sample.index) ?? [],
  }));
  const nativeRiverObjects = nativeRiverObjectsProof(args.parity.live.nativeRiverObjects);
  const cameraProofTarget = args.cameraProof?.target;
  const target = args.cameraTarget ?? cameraProofTarget;
  const cameraProofTargetMatches = target !== undefined && cameraProofTarget !== undefined && sameLocation(target, cameraProofTarget);
  const targetSample = target === undefined
    ? undefined
    : selectedSamples.find((sample) => sameLocation(sample, target));
  const targetIsSampled = targetSample !== undefined;
  const targetIsNativeRiverObject = Boolean(targetSample && targetSample.nativeRiverObjects.length > 0);
  const screenshots = args.screenshots?.length ? args.screenshots : args.captureProof === undefined ? [] : [args.captureProof.path];
  const missingPaths = screenshots.filter((path) => !existsSync(path));
  const captureProofHash = args.captureProof === undefined ? undefined : hashValue(args.captureProof);
  const captureProofFilePath = args.captureProof === undefined ? undefined : resolve(args.captureProof.path);
  const captureProofScreenshotMismatch = args.captureProof !== undefined &&
    (screenshots.length !== 1 ||
      captureProofFilePath === undefined ||
      resolve(screenshots[0]!) !== captureProofFilePath);
  const captureProofActual = captureProofFilePath !== undefined && existsSync(captureProofFilePath)
    ? fileProof(captureProofFilePath)
    : undefined;
  const screenshotItems = missingPaths.length === 0 && target !== undefined && targetIsSampled
    ? screenshots.map((path) => {
        const captureProofMatchesPath = captureProofFilePath !== undefined && resolve(path) === captureProofFilePath;
        return screenshotProof(
          path,
          args.captureProof?.captureMode ?? args.captureMode ?? "manual-file",
          target,
          captureProofMatchesPath ? args.captureProof : undefined,
          captureProofMatchesPath ? captureProofHash : undefined,
        );
      })
    : [];
  const blockedBy = new Set<string>();

  for (const blocker of runIdentity.blockedBy) blockedBy.add(`river-visible.${blocker}`);
  for (const blocker of materialization.blockedBy) blockedBy.add(`river-visible.${blocker}`);
  if (args.parity.proofClaims.claims["terrain-readback"]?.status !== "pass") {
    blockedBy.add("final-surface-parity.terrain-readback-pass");
  }
  if (args.parity.proofClaims.claims["exact-authorship"]?.status !== "pass") {
    blockedBy.add("final-surface-parity.exact-authorship-pass");
  }
  if (nativeRiverObjects.status === "missing") {
    blockedBy.add("river-visible.native-river-objects");
  } else if (nativeRiverObjects.status === "unavailable") {
    blockedBy.add("river-visible.native-river-objects-readable");
  } else if (nativeRiverObjects.status === "zero-rivers") {
    blockedBy.add("river-visible.native-river-objects-present");
  }
  if (nativeRiverObjects.status === "present" && nativeRiverObjects.samplesWithPlots === 0) {
    blockedBy.add("river-visible.native-river-object-plots");
  }
  if (allLiveSamples.length === 0) blockedBy.add("river-visible.live-terrain-river-samples");
  if (target === undefined) blockedBy.add("river-visible.camera-target");
  if (target !== undefined && !targetIsSampled) blockedBy.add("river-visible.camera-target-sampled-live-river");
  if (target !== undefined && targetIsSampled && !targetIsNativeRiverObject) {
    blockedBy.add("river-visible.camera-target-native-river-object");
  }
  if (args.cameraProof === undefined) {
    blockedBy.add("river-visible.camera-proof");
  }
  if (args.cameraProof !== undefined && args.cameraProof.source !== "app-ui-camera") {
    blockedBy.add("river-visible.camera-proof-source");
  }
  if (args.cameraProof !== undefined && !probeBoolean(args.cameraProof.lookAt)) {
    blockedBy.add("river-visible.camera-proof-look-at");
  }
  if (args.cameraProof !== undefined && !probeHasValue(args.cameraProof.targetIndex)) {
    blockedBy.add("river-visible.camera-proof-target-index");
  }
  if (args.cameraProof !== undefined && (target === undefined || !cameraProofTargetMatches)) {
    blockedBy.add("river-visible.camera-proof-target");
  }
  if (args.cameraProof !== undefined && target !== undefined && !probeLocationMatches(args.cameraProof.after.centerPlot, target)) {
    blockedBy.add("river-visible.camera-proof-center-plot");
  }
  if (args.cameraProof !== undefined && target !== undefined && !probeLocationMatches(args.cameraProof.plotCursor, target)) {
    blockedBy.add("river-visible.camera-proof-plot-cursor");
  }
  const effectiveCameraSource: CameraSource = args.cameraProof?.source === "app-ui-camera"
    ? "direct-control"
    : args.cameraSource ?? "unknown";
  if (effectiveCameraSource === "unknown") {
    blockedBy.add("river-visible.camera-source");
  }
  if (effectiveCameraSource !== "direct-control") {
    blockedBy.add("river-visible.camera-source-direct-control");
  }
  if (screenshots.length === 0) blockedBy.add("river-visible.screenshot");
  if (missingPaths.length > 0) blockedBy.add("river-visible.screenshot-file");
  if (screenshots.length > 0 && !targetIsSampled) blockedBy.add("river-visible.screenshot-target");
  if (args.captureProof === undefined) {
    blockedBy.add("river-visible.capture-proof");
  }
  if (args.captureProof !== undefined && target !== undefined && !sameLocation(args.captureProof.target, target)) {
    blockedBy.add("river-visible.capture-proof-target");
  }
  if (captureProofScreenshotMismatch) {
    blockedBy.add("river-visible.capture-proof-screenshot");
  }
  if (args.captureProof !== undefined && cameraFocusProofHash !== undefined && args.captureProof.cameraProofHash !== cameraFocusProofHash) {
    blockedBy.add("river-visible.capture-proof-camera");
  }
  if (args.captureProof !== undefined && captureProofActual !== undefined && args.captureProof.sha256 !== captureProofActual.sha256) {
    blockedBy.add("river-visible.capture-proof-hash");
  }
  if (args.captureProof !== undefined && captureProofActual !== undefined && args.captureProof.sizeBytes !== captureProofActual.sizeBytes) {
    blockedBy.add("river-visible.capture-proof-size");
  }
  if (args.captureProof !== undefined && captureProofActual === undefined) {
    blockedBy.add("river-visible.capture-proof-file");
  }
  if (args.captureProof !== undefined && !validImageDimensions(args.captureProof.dimensions)) {
    blockedBy.add("river-visible.capture-proof-dimensions");
  }
  if ((args.captureProof?.captureMode ?? args.captureMode ?? "manual-file") === "manual-file") {
    blockedBy.add("river-visible.capture-mode-closure-capable");
  }
  if (args.verdict === undefined) blockedBy.add("river-visible.verdict");
  if (args.verdictSource === undefined) blockedBy.add("river-visible.verdict-source");

  const cameraStatus =
    target === undefined
      ? "missing"
      : targetIsSampled
        ? "bound-to-sample"
        : "target-not-sampled";
  const screenshotStatus =
    screenshots.length === 0
      ? "missing"
      : missingPaths.length > 0
        ? "path-missing"
        : captureProofScreenshotMismatch
          ? "capture-mismatch"
          : targetIsSampled
            ? "bound"
            : "target-not-sampled";
  const proof: RiverVisibleProof = {
    version: 1,
    createdAt: (args.now ?? (() => new Date()))().toISOString(),
    source: "river-runtime-visible-proof",
    parityProofHash,
    exactAuthorshipSummary: args.parity.exactAuthorshipSummary,
    runIdentity,
    materialization,
    liveRiverSamples: {
      status: allLiveSamples.length > 0 ? "selected" : "missing",
      totalLiveTerrainNavigableRiverTiles: allLiveSamples.length,
      totalProjectedNavigableTerrainTiles: countGridOnes(args.parity.local.riverMetadata?.projectedNavigableTerrain),
      sampleCount: selectedSamples.length,
      samples: selectedSamples,
    },
    nativeRiverObjects,
    camera: {
      status: cameraStatus,
      source: effectiveCameraSource,
      ...(target === undefined ? {} : { target }),
      ...(args.cameraZoom === undefined && args.cameraProof?.options.zoom === undefined
        ? {}
        : { zoom: args.cameraZoom ?? String(args.cameraProof?.options.zoom) }),
      ...(args.visibilityState === undefined ? {} : { visibilityState: args.visibilityState }),
      ...(args.cameraProof === undefined || cameraFocusProofHash === undefined ? {} : {
        focusProof: {
          source: args.cameraProof.source,
          target: args.cameraProof.target,
          targetIndex: args.cameraProof.targetIndex,
          options: args.cameraProof.options,
          state: args.cameraProof.state,
          lookAt: args.cameraProof.lookAt,
          plotCursor: args.cameraProof.plotCursor,
          afterCenterPlot: args.cameraProof.after.centerPlot,
          proofHash: cameraFocusProofHash,
        },
      }),
    },
    screenshots: {
      status: screenshotStatus,
      items: screenshotItems,
      missingPaths,
    },
    visualVerdict: {
      status: args.verdict ?? "missing",
      ...(args.verdictSource === undefined ? {} : { source: args.verdictSource }),
    },
    blockedBy: [...blockedBy].sort((a, b) => a.localeCompare(b)),
  };
  const status = classifyRiverVisibleProof(proof);
  return {
    ok: status === "visible",
    status,
    proofHash: hashValue(proof),
    proof,
  };
}

export async function buildRiverVisibleProofOutputWithDirectControlCapture(args: {
  parity: FinalSurfaceParityProof;
  runIdentity?: RunIdentityManifest;
  screenshots?: ReadonlyArray<string>;
  cameraTarget?: MapLocation;
  directControl?: Civ7DirectControlOptions;
  directControlZoom?: number;
  artifactDir?: string;
  cameraProofOutput?: string;
  nativeCaptureOutput?: string;
  captureProofOutput?: string;
  cameraZoom?: string;
  visibilityState?: string;
  materializationDisposition?: MaterializationDisposition;
  minorRiverClaim?: MinorRiverClaim;
  verdict?: VisualVerdict;
  verdictSource?: VerdictSource;
  maxSamples?: number;
  now?: () => Date;
  dependencies?: Partial<DirectControlVisibleCaptureDependencies>;
}): Promise<RiverVisibleProofOutput> {
  const dependencies = {
    ...defaultDirectControlVisibleCaptureDependencies,
    ...(args.now === undefined ? {} : { now: args.now }),
    ...args.dependencies,
  };
  const maxSamples = Math.max(1, Math.trunc(args.maxSamples ?? 8));
  const target = selectDirectControlCameraTarget(args.parity, maxSamples, args.cameraTarget);
  const paths = directControlArtifactPaths({
    parity: args.parity,
    artifactDir: args.artifactDir,
    cameraProofOutput: args.cameraProofOutput,
    nativeCaptureOutput: args.nativeCaptureOutput,
    captureProofOutput: args.captureProofOutput,
    now: dependencies.now,
  });
  const cameraProof = await dependencies.focusCamera({
    x: target.x,
    y: target.y,
    ...(args.directControlZoom === undefined ? {} : { zoom: args.directControlZoom }),
    instantaneous: true,
  }, args.directControl ?? {});
  writeJson(paths.cameraProofPath, cameraProof);

  const cameraProofHash = hashValue(cameraProof);
  const nativeCapture = await dependencies.captureScreenshot({
    target,
    cameraProofHash,
  }, args.directControl ?? {});
  writeJson(paths.nativeCaptureResultPath, nativeCapture);

  const captureProof = captureManifestFromNativeResult(nativeCapture, target, cameraProofHash);
  if (captureProof !== undefined) writeJson(paths.captureProofPath, captureProof);
  const screenshots = captureProof === undefined
    ? args.screenshots ?? []
    : [captureProof.path];
  const output = buildRiverVisibleProofOutput({
    parity: args.parity,
    runIdentity: args.runIdentity,
    screenshots,
    cameraTarget: target,
    cameraProof,
    captureProof,
    cameraSource: "direct-control",
    cameraZoom: args.cameraZoom,
    visibilityState: args.visibilityState,
    materializationDisposition: args.materializationDisposition,
    minorRiverClaim: args.minorRiverClaim,
    verdict: args.verdict,
    verdictSource: args.verdictSource,
    captureMode: "direct-control",
    maxSamples,
    now: dependencies.now,
  });

  return {
    ...output,
    artifacts: {
      selectedTarget: target,
      cameraProofPath: paths.cameraProofPath,
      nativeCaptureResultPath: paths.nativeCaptureResultPath,
      nativeCaptureStatus: nativeCapture.closureManifestStatus,
      ...(captureProof === undefined ? {} : {
        captureProofPath: paths.captureProofPath,
        screenshotPath: captureProof.path,
      }),
    },
  };
}

const defaultDirectControlVisibleCaptureDependencies: DirectControlVisibleCaptureDependencies = {
  focusCamera: focusCiv7CameraOnPlot,
  captureScreenshot: captureCiv7Screenshot,
  now: () => new Date(),
};

function selectDirectControlCameraTarget(
  parity: FinalSurfaceParityProof,
  maxSamples: number,
  requested: MapLocation | undefined,
): MapLocation {
  if (requested !== undefined) return requested;
  const nativeRiverPlotMembership = nativeRiverPlotMembershipByIndex(parity.live.nativeRiverObjects);
  const selectedSamples = sampleEvenly(
    collectLiveRiverSamples(parity.live.riverMetadata, parity.local.riverMetadata),
    maxSamples,
  ).map((sample) => ({
    ...sample,
    nativeRiverObjects: nativeRiverPlotMembership.get(sample.index) ?? [],
  }));
  const nativeBoundSample = selectedSamples.find((sample) => sample.nativeRiverObjects.length > 0);
  const sample = nativeBoundSample ?? selectedSamples[0];
  if (sample === undefined) {
    throw new Error("Cannot run direct-control visible-river capture without a live navigable river terrain sample");
  }
  return { x: sample.x, y: sample.y };
}

function directControlArtifactPaths(args: {
  parity: FinalSurfaceParityProof;
  artifactDir?: string;
  cameraProofOutput?: string;
  nativeCaptureOutput?: string;
  captureProofOutput?: string;
  now: () => Date;
}): Readonly<{
  cameraProofPath: string;
  nativeCaptureResultPath: string;
  captureProofPath: string;
}> {
  const baseDir = resolve(
    args.artifactDir ??
      `/tmp/civ7-river-visible-proof/${safePathPart(args.parity.exactAuthorshipSummary.requestId ?? args.now().toISOString())}`,
  );
  return {
    cameraProofPath: resolve(args.cameraProofOutput ?? `${baseDir}/camera-focus-proof.json`),
    nativeCaptureResultPath: resolve(args.nativeCaptureOutput ?? `${baseDir}/native-screenshot-capture.json`),
    captureProofPath: resolve(args.captureProofOutput ?? `${baseDir}/screenshot-capture-manifest.json`),
  };
}

function captureManifestFromNativeResult(
  capture: Civ7ScreenshotCaptureResult,
  target: MapLocation,
  cameraProofHash: string,
): CaptureProofManifest | undefined {
  if (capture.closureManifestStatus !== "path-returned" || !capture.request.ok || capture.request.value.path === null) {
    return undefined;
  }
  const absolute = resolve(capture.request.value.path);
  if (!existsSync(absolute)) return undefined;
  const proof = fileProof(absolute);
  const dimensions = imageDimensionsFromFile(absolute);
  return {
    path: absolute,
    sha256: proof.sha256,
    sizeBytes: proof.sizeBytes,
    captureMode: "direct-control",
    target,
    cameraProofHash,
    capturedAt: capture.requestedAt,
    tool: "@civ7/direct-control captureCiv7Screenshot",
    ...(dimensions === undefined ? {} : { dimensions }),
  };
}

function nativeRiverObjectsProof(snapshot: NativeRiverObjectSnapshot | undefined): NativeRiverObjectsProof {
  if (snapshot === undefined) {
    return {
      status: "missing",
      numRivers: null,
      sampleCount: 0,
      sampledPlotCount: 0,
      samplesWithPlots: 0,
      blockedBy: ["native-river-objects.not-provided"],
    };
  }
  const blockedBy = snapshot.blockedBy ?? [];
  const sampledPlotCount = nativeRiverSampledPlotCount(snapshot);
  const samplesWithPlots = snapshot.samples?.filter((sample) => (sample.plots?.length ?? 0) > 0).length ?? 0;
  if (!snapshot.exists || snapshot.numRivers === null || blockedBy.length > 0) {
    return {
      status: "unavailable",
      numRivers: snapshot.numRivers,
      sampleCount: snapshot.sampleCount,
      sampledPlotCount,
      samplesWithPlots,
      blockedBy,
    };
  }
  return {
    status: snapshot.numRivers === 0 ? "zero-rivers" : "present",
    numRivers: snapshot.numRivers,
    sampleCount: snapshot.sampleCount,
    sampledPlotCount,
    samplesWithPlots,
    blockedBy: [],
  };
}

function buildRunIdentityProof(
  manifest: RunIdentityManifest | undefined,
  parity: FinalSurfaceParityProof,
): RunIdentityProof {
  const parityIdentity = {
    requestId: parity.exactAuthorshipSummary.requestId,
    configHash: parity.exactAuthorshipSummary.configHash,
    envelopeHash: parity.exactAuthorshipSummary.envelopeHash,
    seed: parity.exactAuthorshipSummary.seed,
    mapSize: parity.exactAuthorshipSummary.mapSize,
    dimensions: parity.exactAuthorshipSummary.dimensions,
    runtime: parity.exactAuthorshipSummary.runtime,
  };
  const blockedBy: string[] = [];
  if (manifest === undefined) {
    blockedBy.push("run-identity.manifest");
  } else {
    requireNonEmptyString(manifest.branch, "run-identity.branch", blockedBy);
    requireNonEmptyString(manifest.commit, "run-identity.commit", blockedBy);
    requireNonEmptyString(manifest.worktree, "run-identity.worktree", blockedBy);
    requireNonEmptyString(manifest.requestId, "run-identity.request-id", blockedBy);
    requireNonEmptyString(manifest.configHash, "run-identity.config-hash", blockedBy);
    requireNonEmptyString(manifest.envelopeHash, "run-identity.envelope-hash", blockedBy);
    if (parityIdentity.seed !== undefined && manifest.seed === undefined) {
      blockedBy.push("run-identity.seed");
    }
    if (parityIdentity.mapSize !== undefined) {
      requireNonEmptyString(manifest.mapSize, "run-identity.map-size", blockedBy);
    }
    if (parityIdentity.dimensions?.width !== undefined && manifest.dimensions?.width === undefined) {
      blockedBy.push("run-identity.width");
    }
    if (parityIdentity.dimensions?.height !== undefined && manifest.dimensions?.height === undefined) {
      blockedBy.push("run-identity.height");
    }
    if (manifest.dirtyState !== "clean" && manifest.dirtyState !== "dirty") {
      blockedBy.push("run-identity.dirty-state");
    }
    if (manifest.dirtyState === "dirty" && !manifest.dirtyDiffHash) {
      blockedBy.push("run-identity.dirty-diff-hash");
    }
    if (parityIdentity.requestId !== undefined && manifest.requestId !== parityIdentity.requestId) {
      blockedBy.push("run-identity.request-id-mismatch");
    }
    if (parityIdentity.configHash !== undefined && manifest.configHash !== parityIdentity.configHash) {
      blockedBy.push("run-identity.config-hash-mismatch");
    }
    if (parityIdentity.envelopeHash !== undefined && manifest.envelopeHash !== parityIdentity.envelopeHash) {
      blockedBy.push("run-identity.envelope-hash-mismatch");
    }
    if (parityIdentity.seed !== undefined && manifest.seed !== undefined && manifest.seed !== parityIdentity.seed) {
      blockedBy.push("run-identity.seed-mismatch");
    }
    if (parityIdentity.mapSize !== undefined && manifest.mapSize !== undefined && manifest.mapSize !== parityIdentity.mapSize) {
      blockedBy.push("run-identity.map-size-mismatch");
    }
    if (
      parityIdentity.dimensions?.width !== undefined &&
      manifest.dimensions?.width !== undefined &&
      manifest.dimensions.width !== parityIdentity.dimensions.width
    ) {
      blockedBy.push("run-identity.width-mismatch");
    }
    if (
      parityIdentity.dimensions?.height !== undefined &&
      manifest.dimensions?.height !== undefined &&
      manifest.dimensions.height !== parityIdentity.dimensions.height
    ) {
      blockedBy.push("run-identity.height-mismatch");
    }
  }
  return {
    status: manifest === undefined ? "missing" : blockedBy.length > 0 ? "blocked" : "bound",
    ...(manifest === undefined ? {} : { manifest }),
    parity: parityIdentity,
    blockedBy: [...new Set(blockedBy)].sort((a, b) => a.localeCompare(b)),
  };
}

function buildMaterializationProof(args: {
  parity: FinalSurfaceParityProof;
  disposition?: MaterializationDisposition;
  minorRiverClaim: MinorRiverClaim;
}): MaterializationProof {
  const terrainReadbackStatus = args.parity.proofClaims.claims["terrain-readback"]?.status ?? "unresolved";
  const metadataReadbackStatus = args.parity.proofClaims.claims["metadata-readback"]?.status ?? "unresolved";
  const disposition = args.disposition ?? inferMaterializationDisposition(terrainReadbackStatus, metadataReadbackStatus);
  const blockedBy: string[] = [];

  if (disposition === "native-writer-parity-pass" && metadataReadbackStatus !== "pass") {
    blockedBy.push("materialization.native-writer-parity-pass-metadata");
  }
  if (disposition === "native-writer-parity-fail" && metadataReadbackStatus !== "fail") {
    blockedBy.push("materialization.native-writer-parity-fail-metadata");
  }
  if (disposition === "terrain-only" && terrainReadbackStatus !== "pass") {
    blockedBy.push("materialization.terrain-only-terrain-readback");
  }
  if (metadataReadbackStatus === "fail" && disposition !== "terrain-only") {
    blockedBy.push("materialization.metadata-readback-fail");
  }
  if (args.minorRiverClaim === "claimed" && disposition !== "native-writer-parity-pass") {
    blockedBy.push("minor-river-claim-metadata-evidence");
  }

  return {
    disposition,
    terrainReadbackStatus,
    metadataReadbackStatus,
    minorRiverClaim: args.minorRiverClaim,
    blockedBy: [...new Set(blockedBy)].sort((a, b) => a.localeCompare(b)),
  };
}

function inferMaterializationDisposition(
  terrainReadbackStatus: string,
  metadataReadbackStatus: string,
): MaterializationDisposition {
  if (metadataReadbackStatus === "pass") return "native-writer-parity-pass";
  if (metadataReadbackStatus === "fail") return "native-writer-parity-fail";
  if (terrainReadbackStatus === "pass") return "terrain-only";
  if (metadataReadbackStatus === "unresolved") return "native-writer-not-run";
  return "unsupported-writer-surface";
}

function requireNonEmptyString(value: string | undefined, blocker: string, blockedBy: string[]): void {
  if (typeof value !== "string" || value.trim() === "") blockedBy.push(blocker);
}

function nativeRiverPlotMembershipByIndex(
  snapshot: NativeRiverObjectSnapshot | undefined,
): ReadonlyMap<number, ReadonlyArray<NativeRiverSampleBinding>> {
  const membership = new Map<number, NativeRiverSampleBinding[]>();
  for (const sample of snapshot?.samples ?? []) {
    for (const plot of sample.plots ?? []) {
      if (plot.index === null) continue;
      const existing = membership.get(plot.index) ?? [];
      existing.push({
        riverIndex: sample.index,
        riverType: sample.riverType,
        connectedToOcean: sample.connectedToOcean,
        plotIndex: plot.index,
      });
      membership.set(plot.index, existing);
    }
  }
  return membership;
}

function nativeRiverSampledPlotCount(snapshot: NativeRiverObjectSnapshot | undefined): number {
  let count = 0;
  for (const sample of snapshot?.samples ?? []) count += sample.plots?.length ?? 0;
  return count;
}

function collectLiveRiverSamples(
  live: RiverMetadataSnapshot | undefined,
  local: RiverMetadataSnapshot | undefined
): ReadonlyArray<RiverSample> {
  const terrain = live?.terrainNavigableRiver;
  if (!terrain) return [];
  const projected = local?.projectedNavigableTerrain;
  const navigable = live?.navigableRiver;
  const riverType = live?.riverType;
  const samples: RiverSample[] = [];
  for (let index = 0; index < terrain.values.length; index += 1) {
    if (normalizedMaskValue(terrain.values[index]) !== 1) continue;
    const y = Math.floor(index / terrain.width);
    samples.push({
      x: index - y * terrain.width,
      y,
      index,
      projectedNavigableTerrain: gridValue(projected, index),
      liveTerrainNavigableRiver: gridValue(terrain, index),
      liveNavigableRiver: gridValue(navigable, index),
      liveRiverType: gridValue(riverType, index),
      nativeRiverObjects: [],
    });
  }
  return samples;
}

function sampleEvenly(samples: ReadonlyArray<RiverSample>, maxSamples: number): ReadonlyArray<RiverSample> {
  if (samples.length <= maxSamples) return samples;
  const selected: RiverSample[] = [];
  const last = samples.length - 1;
  for (let i = 0; i < maxSamples; i += 1) {
    const index = Math.round((i * last) / (maxSamples - 1));
    selected.push(samples[index]!);
  }
  return selected;
}

function screenshotProof(
  path: string,
  captureMode: CaptureMode,
  target: MapLocation,
  captureProof: CaptureProofManifest | undefined,
  captureProofHash: string | undefined,
): ScreenshotProof {
  const absolute = resolve(path);
  const proof = fileProof(absolute);
  return {
    path: absolute,
    sha256: proof.sha256,
    sizeBytes: proof.sizeBytes,
    captureMode,
    target,
    ...(captureProofHash === undefined ? {} : { captureProofHash }),
    ...(captureProof?.dimensions === undefined ? {} : { dimensions: captureProof.dimensions }),
  };
}

function fileProof(path: string): Readonly<{ sha256: string; sizeBytes: number }> {
  const bytes = readFileSync(path);
  const stat = statSync(path);
  return {
    sha256: createHash("sha256").update(bytes).digest("hex"),
    sizeBytes: stat.size,
  };
}

function imageDimensionsFromFile(path: string): ImageDimensions | undefined {
  const bytes = readFileSync(path);
  if (bytes.length >= 24 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47) {
    return {
      width: bytes.readUInt32BE(16),
      height: bytes.readUInt32BE(20),
    };
  }
  if (bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    return jpegDimensions(bytes);
  }
  return undefined;
}

function jpegDimensions(bytes: Buffer): ImageDimensions | undefined {
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) return undefined;
    const marker = bytes[offset + 1];
    const length = bytes.readUInt16BE(offset + 2);
    if (length < 2) return undefined;
    if (
      marker >= 0xc0 &&
      marker <= 0xc3 &&
      offset + 8 < bytes.length
    ) {
      return {
        height: bytes.readUInt16BE(offset + 5),
        width: bytes.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + length;
  }
  return undefined;
}

function validImageDimensions(dimensions: ImageDimensions | undefined): boolean {
  return Boolean(
    dimensions &&
      Number.isInteger(dimensions.width) &&
      dimensions.width > 0 &&
      Number.isInteger(dimensions.height) &&
      dimensions.height > 0,
  );
}

function classifyRiverVisibleProof(proof: RiverVisibleProof): RiverVisibleProofStatus {
  if (proof.blockedBy.length > 0) return "blocked";
  return proof.visualVerdict.status;
}

function probeHasValue<T>(probe: Readonly<{ ok: true; value: T } | { ok: false; error: string }> | undefined): boolean {
  return probe?.ok === true;
}

function probeBoolean(probe: Readonly<{ ok: true; value: boolean } | { ok: false; error: string }> | undefined): boolean {
  return probe?.ok === true && probe.value === true;
}

function probeLocationMatches(
  probe: Readonly<{ ok: true; value: MapLocation | null } | { ok: false; error: string }> | undefined,
  target: MapLocation,
): boolean {
  return probe?.ok === true && probe.value !== null && sameLocation(probe.value, target);
}

function gridValue(grid: SurfaceGrid | undefined, index: number): number | null {
  if (!grid || index < 0 || index >= grid.values.length) return null;
  const value = grid.values[index];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizedMaskValue(value: unknown): 0 | 1 | null {
  if (value === 1 || value === true) return 1;
  if (value === 0 || value === false) return 0;
  return null;
}

function countGridOnes(grid: SurfaceGrid | undefined): number {
  if (!grid) return 0;
  let count = 0;
  for (const value of grid.values) {
    if (normalizedMaskValue(value) === 1) count += 1;
  }
  return count;
}

function sameLocation(a: MapLocation, b: MapLocation): boolean {
  return a.x === b.x && a.y === b.y;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hashValue(value: unknown): string {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entry]) => entry !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));
  return `{${entries.map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`).join(",")}}`;
}

function safePathPart(value: string): string {
  const safe = value.trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return safe || "river-visible-proof";
}

function writeJson(path: string, value: unknown): void {
  const absolute = resolve(path);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, JSON.stringify(value, null, 2));
}

function writeOutput(path: string | undefined, output: RiverVisibleProofOutput): void {
  if (!path) return;
  writeJson(path, output);
}

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage);
    return 0;
  }
  if (!args.parityProof) throw new Error("Expected --parity-proof");
  const parity = extractFinalSurfaceParityProof(JSON.parse(readFileSync(args.parityProof, "utf8")));
  const runIdentity = args.runIdentity === undefined
    ? undefined
    : JSON.parse(readFileSync(args.runIdentity, "utf8")) as RunIdentityManifest;
  if (args.directControlCapture) {
    if (args.cameraProof !== undefined || args.captureProof !== undefined) {
      throw new Error("--direct-control-capture writes fresh camera/capture proof artifacts; do not pass --camera-proof or --capture-proof");
    }
    const output = await buildRiverVisibleProofOutputWithDirectControlCapture({
      parity,
      runIdentity,
      screenshots: args.screenshots,
      cameraTarget: args.cameraTarget,
      directControl: directControlOptionsFromArgs(args),
      directControlZoom: args.directControlZoom,
      artifactDir: args.artifactDir,
      cameraProofOutput: args.cameraProofOutput,
      nativeCaptureOutput: args.nativeCaptureOutput,
      captureProofOutput: args.captureProofOutput,
      cameraZoom: args.cameraZoom,
      visibilityState: args.visibilityState,
      materializationDisposition: args.materializationDisposition,
      minorRiverClaim: args.minorRiverClaim,
      verdict: args.verdict,
      verdictSource: args.verdictSource,
      maxSamples: args.maxSamples,
    });
    writeOutput(args.output, output);
    console.log(JSON.stringify(output, null, 2));
    return output.ok ? 0 : 2;
  }
  const cameraProof = args.cameraProof === undefined
    ? undefined
    : JSON.parse(readFileSync(args.cameraProof, "utf8")) as Civ7CameraFocusResult;
  const captureProof = args.captureProof === undefined
    ? undefined
    : JSON.parse(readFileSync(args.captureProof, "utf8")) as CaptureProofManifest;
  const output = buildRiverVisibleProofOutput({
    parity,
    runIdentity,
    screenshots: args.screenshots,
    cameraTarget: args.cameraTarget,
    cameraProof,
    captureProof,
    cameraSource: args.cameraSource,
    cameraZoom: args.cameraZoom,
    visibilityState: args.visibilityState,
    materializationDisposition: args.materializationDisposition,
    minorRiverClaim: args.minorRiverClaim,
    verdict: args.verdict,
    verdictSource: args.verdictSource,
    captureMode: args.captureMode,
    maxSamples: args.maxSamples,
  });
  writeOutput(args.output, output);
  console.log(JSON.stringify(output, null, 2));
  return output.ok ? 0 : 2;
}

function directControlOptionsFromArgs(args: Args): Civ7DirectControlOptions {
  return {
    ...(args.host === undefined ? {} : { host: args.host }),
    ...(args.port === undefined ? {} : { port: args.port }),
    ...(args.timeoutMs === undefined ? {} : { timeoutMs: args.timeoutMs }),
  };
}

if (import.meta.main) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : String(error) }, null, 2));
      process.exitCode = 1;
    });
}
