import {
  type Civ7ControlOrpcClientContext,
  type Civ7ControlOrpcContext,
  createCiv7ControlOrpcServerClient,
} from "@civ7/control-orpc";
import { ORPCError } from "@orpc/server";

export type Civ7ControllerContext = Civ7ControlOrpcContext &
  Readonly<{
    controller: NonNullable<Civ7ControlOrpcContext["controller"]>;
  }>;

export type Civ7ControllerContextFactory = () =>
  | Promise<Civ7ControllerContext>
  | Civ7ControllerContext;

export type Civ7IntelligenceBridge = ReturnType<typeof createCiv7IntelligenceBridge>;

export type Civ7IntelligenceBridgeGlobalTarget = {
  Civ7IntelligenceBridge?: Civ7IntelligenceBridge;
};

export type Civ7IntelligenceBridgeInstallOptions = Readonly<{
  createContext: Civ7ControllerContextFactory;
  target: Civ7IntelligenceBridgeGlobalTarget;
  replaceExisting?: boolean;
}>;

/** Creates a native nested oRPC client with fresh game-controller context per call. */
export function createCiv7IntelligenceBridge(
  options: Readonly<{
    createContext: Civ7ControllerContextFactory;
  }>
) {
  return createCiv7ControlOrpcServerClient(async (clientContext: Civ7ControlOrpcClientContext) => {
    const context = await Promise.resolve()
      .then(() => options.createContext())
      .catch(() =>
        Promise.reject(
          new ORPCError("INTERNAL_SERVER_ERROR", {
            message: "Civ7 controller context is unavailable.",
          })
        )
      );
    return {
      ...context,
      controller: context.controller ?? {
        supportedReadProcedures: [],
        supportedMutationProcedures: [],
      },
      correlation:
        clientContext.correlationId == null
          ? context.correlation
          : {
              ...context.correlation,
              correlationId: clientContext.correlationId,
            },
    };
  });
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
