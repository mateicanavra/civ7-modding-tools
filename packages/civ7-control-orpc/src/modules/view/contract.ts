import type { ContractProcedure } from "@orpc/contract";
import { Type, type Static } from "typebox";

import { civ7ControlOrpcContractBase } from "../../contract-base";
import type { Civ7ControlOrpcErrorMap } from "../../errors";
import type { Civ7ControlOrpcProcedureMeta } from "../../metadata";
import { toStandardSchema } from "../../typebox-standard-schema";

const Civ7ViewAppshotCaptureInputSchema = Type.Object(
  {
    /** PNG output path; defaults under the OS temp dir. */
    outputPath: Type.Optional(Type.String({ minLength: 1 })),
    /** Case-insensitive substring of app name / bundle id / window title. */
    appName: Type.Optional(Type.String({ minLength: 1 })),
    /** Exact window id — overrides appName matching. */
    windowId: Type.Optional(Type.Integer({ minimum: 0 })),
    /** Also hide 3D unit models for map-only frames. Default false. */
    hideUnits: Type.Optional(Type.Boolean()),
    /**
     * Hold time between entering the clean-frame view and capturing, so the
     * UI runtime finishes hiding the HUD/world overlays. Default 400ms.
     */
    settleMs: Type.Optional(Type.Integer({ minimum: 0, maximum: 30_000 })),
  },
  { additionalProperties: false },
);
export type Civ7ViewAppshotCaptureInput = Static<
  typeof Civ7ViewAppshotCaptureInputSchema
>;

const Civ7ViewAppshotWindowSchema = Type.Object(
  {
    windowId: Type.Integer({ minimum: 0 }),
    app: Type.String(),
    title: Type.String(),
    width: Type.Integer({ minimum: 0 }),
    height: Type.Integer({ minimum: 0 }),
    onScreen: Type.Boolean(),
  },
  { additionalProperties: false },
);

const Civ7ViewAppshotFileSchema = Type.Object(
  {
    path: Type.String(),
    byteSize: Type.Integer({ minimum: 0 }),
    sha256: Type.String(),
    mediaType: Type.Literal("image/png"),
    dimensions: Type.Optional(Type.Object(
      {
        width: Type.Integer({ minimum: 0 }),
        height: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false },
    )),
  },
  { additionalProperties: false },
);

const Civ7ViewAppshotSuppressedRowSchema = Type.Object(
  {
    category: Type.String(),
    closed: Type.Integer({ minimum: 1 }),
  },
  { additionalProperties: false },
);

const Civ7ViewAppshotCleanFrameSchema = Type.Object(
  {
    /** View that was current before the capture (the restore target). */
    viewBefore: Type.String(),
    /** Readback: view current while the frame was captured. */
    viewDuringCapture: Type.String(),
    /** Readback: HUD harness hidden while the frame was captured. */
    harnessHidden: Type.Boolean(),
    hideUnits: Type.Boolean(),
    /** Display queue suspension verified by readback before the capture. */
    suspendVerified: Type.Boolean(),
    /** Popups purged through DisplayQueueManager before the capture. */
    suppressedDisplays: Type.Array(Civ7ViewAppshotSuppressedRowSchema),
    restored: Type.Object(
      {
        /** Readback: view current after the restore. */
        view: Type.String(),
        /** Readback: HUD harness visible again after the restore. */
        harnessHidden: Type.Boolean(),
        /** Readback: display queue resumed after the restore. */
        queueResumed: Type.Boolean(),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

const Civ7ViewAppshotCaptureResultSchema = Type.Object(
  {
    captureMode: Type.Literal("window-scoped-screencapturekit"),
    requestedAt: Type.String(),
    settleMs: Type.Integer({ minimum: 0, maximum: 30_000 }),
    /**
     * How frame freshness was obtained — never via app activation or focus
     * changes. "screenshot": window on screen, one-shot. "stream": off-screen
     * window, a temporary capture stream forced fresh compositing.
     * "screenshot-fallback": off-screen and the stream yielded nothing, so
     * the pixels may be stale.
     */
    frameSource: Type.Union([
      Type.Literal("screenshot"),
      Type.Literal("stream"),
      Type.Literal("screenshot-fallback"),
    ]),
    window: Civ7ViewAppshotWindowSchema,
    file: Civ7ViewAppshotFileSchema,
    cleanFrame: Civ7ViewAppshotCleanFrameSchema,
  },
  { additionalProperties: false },
);
export type Civ7ViewAppshotCaptureResult = Static<
  typeof Civ7ViewAppshotCaptureResultSchema
>;

const Civ7ViewAppshotCaptureInputStandardSchema = toStandardSchema(
  Civ7ViewAppshotCaptureInputSchema,
);
const Civ7ViewAppshotCaptureResultStandardSchema = toStandardSchema(
  Civ7ViewAppshotCaptureResultSchema,
);

type Civ7ViewAppshotCaptureContract = ContractProcedure<
  typeof Civ7ViewAppshotCaptureInputStandardSchema,
  typeof Civ7ViewAppshotCaptureResultStandardSchema,
  Civ7ControlOrpcErrorMap,
  Civ7ControlOrpcProcedureMeta
>;

const Civ7ViewAppshotCaptureContract: Civ7ViewAppshotCaptureContract =
  civ7ControlOrpcContractBase
    .input(Civ7ViewAppshotCaptureInputStandardSchema)
    .output(Civ7ViewAppshotCaptureResultStandardSchema)
    .meta({
      family: "view",
      procedureKey: "view.appshot.capture",
      proofBoundary: "local-package-test",
      risk: "runtime-support",
    });

export type Civ7ViewContract = Readonly<{
  appshot: Readonly<{
    capture: Civ7ViewAppshotCaptureContract;
  }>;
}>;

export const Civ7ViewContract: Civ7ViewContract = {
  appshot: {
    capture: Civ7ViewAppshotCaptureContract,
  },
};
