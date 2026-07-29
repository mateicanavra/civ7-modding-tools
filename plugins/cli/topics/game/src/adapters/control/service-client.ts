import { type Civ7ControlOrpcContext, createCiv7ControlOrpcServerClient } from "@civ7/control-orpc";
import { liveCiv7DirectControl } from "@civ7/direct-control/live";

type Civ7GameControlClientContext = Omit<Civ7ControlOrpcContext, "directControl">;
type Civ7GameControlClient = ReturnType<typeof createCiv7ControlOrpcServerClient>;

/** Creates the game topic's canonical in-process control-service client. */
export function createCiv7GameControlClient(
  context: Civ7GameControlClientContext = {}
): Civ7GameControlClient {
  return createCiv7ControlOrpcServerClient({
    ...context,
    directControl: liveCiv7DirectControl as Civ7ControlOrpcContext["directControl"],
  });
}
