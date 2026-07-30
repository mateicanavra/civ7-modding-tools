import { createRouterClient } from "@orpc/server";

import type { Context as Civ7ControlOrpcContext } from "./service/context";
import type { Civ7ControlOrpcCorrelationContext } from "./service/model/dto/correlation";
import { router as Civ7ControlOrpcRouter } from "./service/router";

export type Civ7ControlOrpcClientContext = Civ7ControlOrpcCorrelationContext;

export type Civ7ControlOrpcContextFactory = (
  clientContext: Civ7ControlOrpcClientContext
) => Civ7ControlOrpcContext | Promise<Civ7ControlOrpcContext>;

export function createCiv7ControlOrpcServerClient(
  contextOrFactory: Civ7ControlOrpcContext | Civ7ControlOrpcContextFactory
) {
  const context: Civ7ControlOrpcContextFactory =
    typeof contextOrFactory === "function" ? contextOrFactory : () => contextOrFactory;

  return createRouterClient<typeof Civ7ControlOrpcRouter, Civ7ControlOrpcClientContext>(
    Civ7ControlOrpcRouter,
    { context }
  );
}
