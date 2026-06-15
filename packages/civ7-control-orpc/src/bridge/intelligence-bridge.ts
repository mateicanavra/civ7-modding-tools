import {
  type Civ7ControllerBridgeContextFactory,
  type Civ7ControllerBridgeResponse,
  createCiv7ControllerBridgeIngress,
} from "./controller-ingress";

export const CIV7_INTELLIGENCE_BRIDGE_GLOBAL_KEY = "Civ7IntelligenceBridge";

export type Civ7IntelligenceBridge = Readonly<{
  invoke(request: unknown): Promise<Civ7ControllerBridgeResponse>;
}>;

export type Civ7IntelligenceBridgeGlobalTarget = {
  Civ7IntelligenceBridge?: Civ7IntelligenceBridge;
};

export type Civ7IntelligenceBridgeInstallOptions = Readonly<{
  createContext: Civ7ControllerBridgeContextFactory;
  target: Civ7IntelligenceBridgeGlobalTarget;
  replaceExisting?: boolean;
}>;

export function createCiv7IntelligenceBridge(
  options: Readonly<{
    createContext: Civ7ControllerBridgeContextFactory;
  }>
): Civ7IntelligenceBridge {
  const ingress = createCiv7ControllerBridgeIngress({
    createContext: options.createContext,
  });
  return {
    invoke: (request) => ingress.invoke(request),
  };
}

export function installCiv7IntelligenceBridge(
  options: Civ7IntelligenceBridgeInstallOptions
): Civ7IntelligenceBridge {
  const target = options.target;
  if (target.Civ7IntelligenceBridge != null && options.replaceExisting !== true) {
    throw new Error("Civ7IntelligenceBridge is already installed.");
  }

  const bridge = createCiv7IntelligenceBridge({
    createContext: options.createContext,
  });
  target.Civ7IntelligenceBridge = bridge;
  return bridge;
}
