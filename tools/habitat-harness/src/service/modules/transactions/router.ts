import { module as transactionsModule } from "./module.js";
import { runTransactionApplyService } from "./run.js";

export const transactionsRouter = {
  apply: transactionsModule.apply.effect(({ context, input }) =>
    runTransactionApplyService(input, context.transactions)
  ),
};

export const router = transactionsRouter;
