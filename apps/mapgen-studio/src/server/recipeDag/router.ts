import type { Router } from "@orpc/server";

import { RecipeDagContract } from "./contract";
import type { RecipeDagContext } from "./context";
import { recipeDagImplementer, recipeDagGetProcedure } from "./procedure";

export const RecipeDagRouter: Router<typeof RecipeDagContract, RecipeDagContext> =
  recipeDagImplementer.router({
    recipeDag: {
      get: recipeDagGetProcedure,
    },
  });

export type StudioRecipeDagRouter = typeof RecipeDagRouter;
