import { Type } from "typebox";
import { base } from "../../../base";
import { toStandardSchema as standard } from "../../../schema/typebox-standard-schema";

const Civ7ViewCameraTargetSchema = Type.Object(
  {
    x: Type.Integer({ minimum: 0, description: "X." }),
    y: Type.Integer({ minimum: 0, description: "Y." }),
  },
  { additionalProperties: false }
);
const Civ7ViewCameraPlotSchema = Type.Union([Civ7ViewCameraTargetSchema, Type.Null()]);
const Civ7ViewCameraStateSchema = Type.Object(
  {
    /** Engine zoom-level readback; null when the engine did not report one. */
    zoomLevel: Type.Union([Type.Number(), Type.Null()], {
      description: "Zoom level.",
    }),
    /** Plot at the viewport center (Camera.pickPlot readback); null when unresolved. */
    centerPlot: Civ7ViewCameraPlotSchema,
  },
  { additionalProperties: false }
);
const Civ7ViewCameraSchema = Type.Object(
  {
    target: Civ7ViewCameraTargetSchema,
    /** Requested normalized zoom (0 closest .. 1 fully out); omitted = keep the current zoom. */
    zoom: Type.Optional(Type.Number({ minimum: 0, maximum: 1, description: "Zoom." })),
    /** True = the move skipped the pan animation. */
    instantaneous: Type.Boolean({
      description: "Whether instantaneous.",
    }),
    before: Civ7ViewCameraStateSchema,
    after: Civ7ViewCameraStateSchema,
    /** Verified by readback: the viewport-center plot IS the requested target. */
    centerMatchesTarget: Type.Boolean({
      description: "Whether center matches target.",
    }),
  },
  { additionalProperties: false }
);
const Civ7ViewAppshotCaptureInputSchema = Type.Object(
  {
    /** PNG output path; defaults under the OS temp dir. */
    outputPath: Type.Optional(Type.String({ minLength: 1, description: "Output path." })),
    /**
     * Focus the camera on this plot (verified by readback) before the clean
     * frame is entered. The camera STAYS on the target after the capture —
     * it is navigation state, not UI chrome, so it is never silently
     * restored.
     */
    target: Type.Optional(Civ7ViewCameraTargetSchema),
    /** Normalized engine zoom for the camera move: 0 (closest) .. 1 (fully out); requires target. */
    zoom: Type.Optional(Type.Number({ minimum: 0, maximum: 1, description: "Zoom." })),
    /** Case-insensitive substring of app name / bundle id / window title. */
    appName: Type.Optional(Type.String({ minLength: 1, description: "App name." })),
    /** Exact window id — overrides appName matching. */
    windowId: Type.Optional(Type.Integer({ minimum: 0, description: "Window id." })),
    /** Also hide 3D unit models for map-only frames. Default false. */
    hideUnits: Type.Optional(
      Type.Boolean({
        description: "Hide units.",
      })
    ),
    /**
     * Hold time between entering the clean-frame view and capturing, so the
     * UI runtime finishes hiding the HUD/world overlays. Default 400ms.
     */
    settleMs: Type.Optional(
      Type.Integer({ minimum: 0, maximum: 30000, description: "Settle ms." })
    ),
  },
  { additionalProperties: false }
);
const Civ7ViewAppshotWindowSchema = Type.Object(
  {
    windowId: Type.Integer({ minimum: 0, description: "Window id." }),
    app: Type.String({
      description: "App.",
    }),
    title: Type.String({
      description: "Title.",
    }),
    width: Type.Integer({ minimum: 0, description: "Width." }),
    height: Type.Integer({ minimum: 0, description: "Height." }),
    onScreen: Type.Boolean({
      description: "Whether on screen.",
    }),
  },
  { additionalProperties: false }
);
const Civ7ViewAppshotFileSchema = Type.Object(
  {
    path: Type.String({
      description: "Path.",
    }),
    byteSize: Type.Integer({ minimum: 0, description: "Byte size." }),
    sha256: Type.String({
      description: "Sha256.",
    }),
    mediaType: Type.Literal("image/png", {
      description: "Media type.",
    }),
    dimensions: Type.Optional(
      Type.Object(
        {
          width: Type.Integer({ minimum: 0, description: "Width." }),
          height: Type.Integer({ minimum: 0, description: "Height." }),
        },
        { additionalProperties: false, description: "Dimensions." }
      )
    ),
  },
  { additionalProperties: false }
);
const Civ7ViewAppshotSuppressedRowSchema = Type.Object(
  {
    category: Type.String({
      description: "Category.",
    }),
    closed: Type.Integer({ minimum: 1, description: "Closed." }),
  },
  { additionalProperties: false }
);
const Civ7ViewAppshotCleanFrameSchema = Type.Object(
  {
    /** View that was current before the capture (the restore target). */
    viewBefore: Type.String({
      description: "View before.",
    }),
    /** Readback: view current while the frame was captured. */
    viewDuringCapture: Type.String({
      description: "View during capture.",
    }),
    /** Readback: HUD harness hidden while the frame was captured. */
    harnessHidden: Type.Boolean({
      description: "Whether harness hidden.",
    }),
    hideUnits: Type.Boolean({
      description: "Whether hide units.",
    }),
    /** Display queue suspension verified by readback before the capture. */
    suspendVerified: Type.Boolean({
      description: "Whether suspend verified.",
    }),
    /** Popups purged through DisplayQueueManager before the capture. */
    suppressedDisplays: Type.Array(Civ7ViewAppshotSuppressedRowSchema, {
      description: "Suppressed displays values.",
    }),
    restored: Type.Object(
      {
        /** Readback: view current after the restore. */
        view: Type.String({
          description: "View.",
        }),
        /** Readback: HUD harness visible again after the restore. */
        harnessHidden: Type.Boolean({
          description: "Whether harness hidden.",
        }),
        /** Readback: display queue resumed after the restore. */
        queueResumed: Type.Boolean({
          description: "Whether queue resumed.",
        }),
      },
      { additionalProperties: false, description: "Restored." }
    ),
  },
  { additionalProperties: false }
);
const Civ7ViewAppshotCaptureResultSchema = Type.Object(
  {
    captureMode: Type.Literal("window-scoped-screencapturekit", {
      description: "Capture mode.",
    }),
    requestedAt: Type.String({
      description: "Requested at.",
    }),
    settleMs: Type.Integer({ minimum: 0, maximum: 30000, description: "Settle ms." }),
    /**
     * How frame freshness was obtained — never via app activation or focus
     * changes. "screenshot": window on screen, one-shot. "stream": off-screen
     * window, a temporary capture stream forced fresh compositing. An
     * off-screen window whose stream yields nothing FAILS instead of
     * returning possibly-stale pixels.
     */
    frameSource: Type.Union([Type.Literal("screenshot"), Type.Literal("stream")], {
      description: "Frame source.",
    }),
    window: Civ7ViewAppshotWindowSchema,
    file: Civ7ViewAppshotFileSchema,
    cleanFrame: Civ7ViewAppshotCleanFrameSchema,
    /** Present when a target plot was requested: the verified camera move. */
    camera: Type.Optional(Civ7ViewCameraSchema),
  },
  { additionalProperties: false }
);
const Civ7ViewAppshotCaptureContract = base
  .input(standard(Civ7ViewAppshotCaptureInputSchema))
  .output(standard(Civ7ViewAppshotCaptureResultSchema))
  .meta({
    family: "view",
    procedureKey: "view.appshot.capture",
    proofBoundary: "local-package-test",
    risk: "runtime-support",
  });
export const appshotCapture = {
  appshot: {
    capture: Civ7ViewAppshotCaptureContract,
  },
};
