import { Type, type Static } from "typebox";

import { Civ7DirectControlError } from "../../direct-control-error.js";
import { jsLiteral } from "../../runtime/command-serialization.js";
import {
  Civ7RuntimeProbeSchema,
  probeHelperSource,
} from "../../runtime/probe.js";
import { jsonPayloadFromCommandResult } from "../../session/command-result.js";
import { executeCiv7AppUiCommand } from "../../session/execute.js";
import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerState,
} from "../../session/types.js";
import { sleep } from "../../timing.js";
import { Civ7MapLocationSchema, type Civ7MapLocation } from "../map/types.js";
import { validateMapLocation } from "../map/validation.js";

// Live-verified camera navigation: Camera.lookAtPlot moves the in-game camera
// to a plot and PlotCursor.plotCursorCoords keeps the cursor in sync. The
// move is VERIFIED by readback, not assumed: Camera.pickPlot(0.5, 0.5)
// resolves which plot actually sits at the viewport center, and the result's
// `centerMatchesTarget` reports whether that center landed on the requested
// target.
//
// Zoom is the engine's NORMALIZED level: 0 = closest, 1 = fully zoomed out
// (live-verified 2026-06-11: Camera.getState().zoomLevel reads back exactly
// the requested fraction; values above 1 clamp to 1 — the 0..10 range the
// rivers-branch atom advertised was never honored). Zoom also settles
// asynchronously even for instantaneous moves (the same-command readback
// still shows the previous level), so when the immediate readback misses the
// target center or the requested zoom, the state is re-read on a short settle
// loop until both verify or the retry budget runs out.

const civ7TunerStateSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
}, { additionalProperties: false });

const Civ7CameraPointSchema = Type.Object({
  x: Type.Number(),
  y: Type.Number(),
}, { additionalProperties: false });

export const Civ7CameraFocusInputSchema = Type.Object({
  ...Civ7MapLocationSchema.properties,
  zoom: Type.Optional(Type.Number({ minimum: 0, maximum: 1 })),
  instantaneous: Type.Optional(Type.Boolean()),
}, { additionalProperties: false });

export type Civ7CameraFocusInput = Readonly<Static<typeof Civ7CameraFocusInputSchema>>;

export const Civ7CameraStateSnapshotSchema = Type.Object({
  exists: Type.Boolean(),
  zoomLevel: Civ7RuntimeProbeSchema(Type.Union([Type.Number(), Type.Null()])),
  focusPoint: Civ7RuntimeProbeSchema(Type.Union([Civ7CameraPointSchema, Type.Null()])),
  centerPlot: Civ7RuntimeProbeSchema(Type.Union([Civ7MapLocationSchema, Type.Null()])),
}, { additionalProperties: false });

export type Civ7CameraStateSnapshot = Readonly<Static<typeof Civ7CameraStateSnapshotSchema>>;

export const Civ7CameraFocusOptionsSchema = Type.Object({
  zoom: Type.Optional(Type.Number()),
  instantaneous: Type.Boolean(),
}, { additionalProperties: false });

export const Civ7CameraFocusResultSchema = Type.Object({
  host: Type.String(),
  port: Type.Number(),
  state: civ7TunerStateSchema,
  source: Type.Literal("app-ui-camera"),
  target: Civ7MapLocationSchema,
  targetIndex: Civ7RuntimeProbeSchema(Type.Number()),
  options: Civ7CameraFocusOptionsSchema,
  before: Civ7CameraStateSnapshotSchema,
  lookAt: Civ7RuntimeProbeSchema(Type.Boolean()),
  plotCursor: Civ7RuntimeProbeSchema(Type.Union([Civ7MapLocationSchema, Type.Null()])),
  after: Civ7CameraStateSnapshotSchema,
  centerMatchesTarget: Type.Boolean(),
}, { additionalProperties: false });

export type Civ7CameraFocusResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  source: "app-ui-camera";
  target: Civ7MapLocation;
  targetIndex: Readonly<{ ok: true; value: number } | { ok: false; error: string }>;
  options: Readonly<{
    zoom?: number;
    instantaneous: boolean;
  }>;
  before: Civ7CameraStateSnapshot;
  lookAt: Readonly<{ ok: true; value: boolean } | { ok: false; error: string }>;
  plotCursor: Readonly<{ ok: true; value: Civ7MapLocation | null } | { ok: false; error: string }>;
  after: Civ7CameraStateSnapshot;
  centerMatchesTarget: boolean;
}>;

export type CameraFocusDependencies = Readonly<{
  executeAppUiCommand: (options: Civ7DirectControlOptions & Readonly<{ command: string }>) => Promise<Civ7CommandResult>;
  jsLiteral: (value: unknown) => string;
  parseCameraFocus: (result: Civ7CommandResult, label: string) => Civ7CameraFocusResult;
  probeHelperSource: () => string;
  validateMapLocation: (location: Civ7MapLocation) => void;
}>;

export async function focusCiv7CameraOnPlot(
  input: Civ7CameraFocusInput,
  options: Civ7DirectControlOptions = {},
  dependencies: CameraFocusDependencies = defaultCameraFocusDependencies,
): Promise<Civ7CameraFocusResult> {
  dependencies.validateMapLocation(input);
  validateCameraFocusInput(input);
  const normalized = {
    x: input.x,
    y: input.y,
    ...(input.zoom === undefined ? {} : { zoom: input.zoom }),
    instantaneous: input.instantaneous ?? true,
  };
  const result = await dependencies.executeAppUiCommand({
    ...options,
    command: buildCameraFocusCommand(normalized, dependencies),
  });
  const immediate = dependencies.parseCameraFocus(result, "Civ7 camera focus");
  if (
    cameraFocusCenterMatchesTarget(immediate)
    && cameraFocusZoomSettled(immediate, normalized.zoom)
  ) {
    return { ...immediate, centerMatchesTarget: true };
  }
  if (immediate.lookAt.ok && immediate.lookAt.value === true) {
    // Both the pan (when animated) and the zoom (always — even instantaneous
    // moves report the previous level on the same-command readback) settle
    // asynchronously; re-read until they verify or the budget runs out.
    let merged = immediate;
    for (let attempt = 0; attempt < CAMERA_FOCUS_SETTLE_READS; attempt += 1) {
      await sleep(CAMERA_FOCUS_SETTLE_MS);
      const settled = dependencies.parseCameraFocus(
        await dependencies.executeAppUiCommand({
          ...options,
          command: buildCameraFocusStateReadCommand(normalized, dependencies),
        }),
        "Civ7 camera focus settled state",
      );
      merged = {
        ...immediate,
        plotCursor: settled.plotCursor,
        after: settled.after,
        centerMatchesTarget: cameraFocusCenterMatchesTarget({
          ...immediate,
          after: settled.after,
        }),
      };
      if (
        merged.centerMatchesTarget
        && cameraFocusZoomSettled(merged, normalized.zoom)
      ) {
        return merged;
      }
    }
    return merged;
  }
  return {
    ...immediate,
    centerMatchesTarget: false,
  };
}

const CAMERA_FOCUS_SETTLE_READS = 4;
const CAMERA_FOCUS_SETTLE_MS = 150;
const CAMERA_FOCUS_ZOOM_EPSILON = 0.01;

function cameraFocusZoomSettled(
  result: Pick<Civ7CameraFocusResult, "after">,
  zoom: number | undefined,
): boolean {
  if (zoom === undefined) return true;
  const level = result.after.zoomLevel;
  return level.ok
    && level.value !== null
    && Math.abs(level.value - zoom) <= CAMERA_FOCUS_ZOOM_EPSILON;
}

function validateCameraFocusInput(input: Civ7CameraFocusInput): void {
  if (input.zoom !== undefined && (!Number.isFinite(input.zoom) || input.zoom < 0 || input.zoom > 1)) {
    throw new Civ7DirectControlError(
      "command-failed",
      "camera zoom must be a finite number between 0 (closest) and 1 (fully zoomed out) — the engine's normalized zoom level",
    );
  }
}

function buildCameraFocusCommand(
  input: Required<Pick<Civ7CameraFocusInput, "x" | "y" | "instantaneous">> & Pick<Civ7CameraFocusInput, "zoom">,
  dependencies: CameraFocusDependencies,
): string {
  return `(() => {
    ${dependencies.probeHelperSource()}
    const input = ${dependencies.jsLiteral(input)};
    const target = { x: input.x, y: input.y };
    const safeLocation = (location) => {
      if (!location || typeof location !== "object") return null;
      const x = Number.isInteger(location.x) ? location.x : Number.isInteger(location.i) ? location.i : null;
      const y = Number.isInteger(location.y) ? location.y : Number.isInteger(location.j) ? location.j : null;
      return x === null || y === null ? null : { x, y };
    };
    const safePoint = (point) => {
      if (!point || typeof point !== "object") return null;
      return Number.isFinite(point.x) && Number.isFinite(point.y) ? { x: point.x, y: point.y } : null;
    };
    const readCameraState = () => {
      const exists = typeof Camera !== "undefined" && Camera !== null;
      if (!exists) {
        const unavailable = { ok: false, error: "Camera unavailable" };
        return { exists: false, zoomLevel: unavailable, focusPoint: unavailable, centerPlot: unavailable };
      }
      const state = probe(() => typeof Camera.getState === "function" ? Camera.getState() : null);
      const zoomLevel = state.ok
        ? { ok: true, value: Number.isFinite(state.value?.zoomLevel) ? state.value.zoomLevel : null }
        : state;
      const focusPoint = state.ok
        ? { ok: true, value: safePoint(state.value?.focusPoint) }
        : state;
      const centerPlot = probe(() => typeof Camera.pickPlot === "function" ? safeLocation(Camera.pickPlot(0.5, 0.5)) : null);
      return { exists, zoomLevel, focusPoint, centerPlot };
    };
    const before = readCameraState();
    const targetIndex = probe(() => {
      if (typeof GameplayMap === "undefined" || GameplayMap === null) throw new Error("GameplayMap unavailable");
      if (typeof GameplayMap.getIndexFromLocation === "function") return GameplayMap.getIndexFromLocation(target);
      if (typeof GameplayMap.getIndexFromXY === "function") return GameplayMap.getIndexFromXY(target.x, target.y);
      throw new Error("GameplayMap index lookup unavailable");
    });
    const options = { instantaneous: input.instantaneous === true };
    if (Number.isFinite(input.zoom)) options.zoom = input.zoom;
    const lookAt = probe(() => {
      if (typeof Camera === "undefined" || Camera === null || typeof Camera.lookAtPlot !== "function") {
        throw new Error("Camera.lookAtPlot unavailable");
      }
      Camera.lookAtPlot(target, options);
      if (typeof PlotCursor !== "undefined" && PlotCursor !== null) PlotCursor.plotCursorCoords = target;
      return true;
    });
    const plotCursor = probe(() => typeof PlotCursor !== "undefined" && PlotCursor !== null
      ? safeLocation(PlotCursor.plotCursorCoords)
      : null);
    const after = readCameraState();
    return JSON.stringify({
      source: "app-ui-camera",
      target,
      targetIndex,
      options,
      before,
      lookAt,
      plotCursor,
      after,
      centerMatchesTarget: after.centerPlot.ok === true &&
        after.centerPlot.value !== null &&
        after.centerPlot.value.x === target.x &&
        after.centerPlot.value.y === target.y,
    });
  })()`;
}

function buildCameraFocusStateReadCommand(
  input: Required<Pick<Civ7CameraFocusInput, "x" | "y" | "instantaneous">> & Pick<Civ7CameraFocusInput, "zoom">,
  dependencies: CameraFocusDependencies,
): string {
  return `(() => {
    ${dependencies.probeHelperSource()}
    const input = ${dependencies.jsLiteral(input)};
    const target = { x: input.x, y: input.y };
    const safeLocation = (location) => {
      if (!location || typeof location !== "object") return null;
      const x = Number.isInteger(location.x) ? location.x : Number.isInteger(location.i) ? location.i : null;
      const y = Number.isInteger(location.y) ? location.y : Number.isInteger(location.j) ? location.j : null;
      return x === null || y === null ? null : { x, y };
    };
    const safePoint = (point) => {
      if (!point || typeof point !== "object") return null;
      return Number.isFinite(point.x) && Number.isFinite(point.y) ? { x: point.x, y: point.y } : null;
    };
    const readCameraState = () => {
      const exists = typeof Camera !== "undefined" && Camera !== null;
      if (!exists) {
        const unavailable = { ok: false, error: "Camera unavailable" };
        return { exists: false, zoomLevel: unavailable, focusPoint: unavailable, centerPlot: unavailable };
      }
      const state = probe(() => typeof Camera.getState === "function" ? Camera.getState() : null);
      const zoomLevel = state.ok
        ? { ok: true, value: Number.isFinite(state.value?.zoomLevel) ? state.value.zoomLevel : null }
        : state;
      const focusPoint = state.ok
        ? { ok: true, value: safePoint(state.value?.focusPoint) }
        : state;
      const centerPlot = probe(() => typeof Camera.pickPlot === "function" ? safeLocation(Camera.pickPlot(0.5, 0.5)) : null);
      return { exists, zoomLevel, focusPoint, centerPlot };
    };
    const options = { instantaneous: input.instantaneous === true };
    if (Number.isFinite(input.zoom)) options.zoom = input.zoom;
    const after = readCameraState();
    const plotCursor = probe(() => typeof PlotCursor !== "undefined" && PlotCursor !== null
      ? safeLocation(PlotCursor.plotCursorCoords)
      : null);
    const targetIndex = probe(() => {
      if (typeof GameplayMap === "undefined" || GameplayMap === null) throw new Error("GameplayMap unavailable");
      if (typeof GameplayMap.getIndexFromLocation === "function") return GameplayMap.getIndexFromLocation(target);
      if (typeof GameplayMap.getIndexFromXY === "function") return GameplayMap.getIndexFromXY(target.x, target.y);
      throw new Error("GameplayMap index lookup unavailable");
    });
    return JSON.stringify({
      source: "app-ui-camera",
      target,
      targetIndex,
      options,
      before: after,
      lookAt: { ok: true, value: true },
      plotCursor,
      after,
      centerMatchesTarget: after.centerPlot.ok === true &&
        after.centerPlot.value !== null &&
        after.centerPlot.value.x === target.x &&
        after.centerPlot.value.y === target.y,
    });
  })()`;
}

function cameraFocusCenterMatchesTarget(result: Pick<Civ7CameraFocusResult, "target" | "after">): boolean {
  const center = result.after.centerPlot;
  return center.ok && center.value !== null && center.value.x === result.target.x && center.value.y === result.target.y;
}

const defaultCameraFocusDependencies: CameraFocusDependencies = {
  executeAppUiCommand: executeCiv7AppUiCommand,
  jsLiteral,
  parseCameraFocus: (result, label) => jsonPayloadFromCommandResult<Civ7CameraFocusResult>(result, label),
  probeHelperSource,
  validateMapLocation,
};
