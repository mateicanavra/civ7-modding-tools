import { createRouterClient } from "@orpc/server";

import type { Civ7ControlOrpcContext } from "./context";
import { Civ7ControlOrpcRouter } from "./router";

export function createCiv7ControlOrpcServerClient(context: Civ7ControlOrpcContext) {
  return createRouterClient(Civ7ControlOrpcRouter, { context });
}
