import type {
  Civ7ControlOrpcCameraFocusResult,
} from "../../dependencies/direct-control";
import type { Civ7ViewCamera } from "./contract";

type CameraStateSnapshot = Civ7ControlOrpcCameraFocusResult["after"];

function cameraState(snapshot: CameraStateSnapshot): Civ7ViewCamera["after"] {
  return {
    zoomLevel: snapshot.zoomLevel.ok ? snapshot.zoomLevel.value : null,
    centerPlot: snapshot.centerPlot.ok ? snapshot.centerPlot.value : null,
  };
}

/**
 * Flattens the atom's probe-style readbacks ({ok, value} | {ok, error}) into
 * the wire contract's value-or-null shape. Probe errors collapse to null —
 * the verification verdict the caller acts on is `centerMatchesTarget`,
 * which the atom already derives from the raw probes.
 */
export function viewCameraFromFocusResult(
  focus: Civ7ControlOrpcCameraFocusResult,
): Civ7ViewCamera {
  return {
    target: { x: focus.target.x, y: focus.target.y },
    ...(focus.options.zoom === undefined ? {} : { zoom: focus.options.zoom }),
    instantaneous: focus.options.instantaneous,
    before: cameraState(focus.before),
    after: cameraState(focus.after),
    plotCursor: focus.plotCursor.ok ? focus.plotCursor.value : null,
    centerMatchesTarget: focus.centerMatchesTarget,
  };
}
