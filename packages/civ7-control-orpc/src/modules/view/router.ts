import { viewAppshotCaptureProcedure } from "./procedures/appshot-capture";
import { viewCameraFocusProcedure } from "./procedures/camera-focus";

export const viewRouter = {
  appshot: {
    capture: viewAppshotCaptureProcedure,
  },
  camera: {
    focus: viewCameraFocusProcedure,
  },
};
