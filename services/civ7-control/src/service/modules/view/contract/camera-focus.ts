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
const Civ7ViewCameraFocusInputSchema = Type.Object(
  {
    x: Type.Integer({ minimum: 0, description: "X." }),
    y: Type.Integer({ minimum: 0, description: "Y." }),
    /** Normalized engine zoom: 0 (closest) .. 1 (fully out); omitted = keep the current zoom. */
    zoom: Type.Optional(Type.Number({ minimum: 0, maximum: 1, description: "Zoom." })),
    /** Skip the pan animation. Default true. */
    instantaneous: Type.Optional(
      Type.Boolean({
        description: "Instantaneous.",
      })
    ),
  },
  { additionalProperties: false }
);
const Civ7ViewCameraFocusResultSchema = Civ7ViewCameraSchema;
const Civ7ViewCameraFocusContract = base
  .input(standard(Civ7ViewCameraFocusInputSchema))
  .output(standard(Civ7ViewCameraFocusResultSchema))
  .meta({
    family: "view",
    procedureKey: "view.camera.focus",
    proofBoundary: "local-package-test",
    risk: "runtime-support",
  });
export const cameraFocus = {
  camera: {
    focus: Civ7ViewCameraFocusContract,
  },
};
