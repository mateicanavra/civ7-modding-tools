import { appshotCapture } from "./appshot-capture";
import { cameraFocus } from "./camera-focus";
export const router = {
  appshot: {
    capture: appshotCapture,
  },
  camera: {
    focus: cameraFocus,
  },
};
